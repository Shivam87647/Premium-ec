import { NextResponse } from "next/server";
import { razorpay } from "@/lib/Razorpay";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", items, shippingInfo, couponCode, discountAmount, paymentMethod, userId: payloadUserId } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Check if we are using placeholder/mock keys
    const rzKey = process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY || "";
    const rzSecret = process.env.Razorpay_SECRET_KEY || "";
    const isMockMode = !rzKey || rzKey.startsWith("your_") || !rzSecret || rzSecret.startsWith("your_");

    let order: any;

    if (isMockMode) {
      // Mock order generation
      order = {
        id: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
        amount: Math.round(amount * 100),
        currency: currency === "USD" ? "INR" : currency,
        receipt: `rcpt_${Date.now()}`,
        status: "created"
      };
    } else {
      // Create the real Razorpay Order
      const options = {
        amount: Math.round(amount * 100),
        currency: currency === "USD" ? "INR" : currency,
        receipt: `rcpt_${Date.now()}`,
      };
      order = await razorpay.orders.create(options);
    }

    // 2. Insert pending order into Supabase using service role
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabaseAdmin = createServiceRoleClient();
      
      let userId = payloadUserId || null;
      if (!userId) {
        try {
          const supabaseServer = await createClient();
          const { data: { user } } = await supabaseServer.auth.getUser();
          userId = user?.id || null;
        } catch (e) {
          console.error("Guest checkout (no user session):", e);
        }
      }
      
      const shippingAddress = shippingInfo || {};
      const billingAddress = shippingInfo || {};

      const subtotal = amount - 15.0; // Subtract standard shipping cost

      const orderId = crypto.randomUUID();
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const hexPart = orderId.slice(0, 6).toUpperCase();
      const orderNumber = `ORD-${dateStr}-${hexPart}`;

      const { error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          id: orderId,
          order_number: orderNumber,
          user_id: userId,
          email: shippingInfo?.email || "guest@example.com",
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          shipping_method: "Standard",
          shipping_cost: 15.0,
          subtotal: subtotal > 0 ? subtotal : amount,
          tax_amount: 0,
          total: amount,
          coupon_code: couponCode || null,
          discount_amount: discountAmount || 0,
          payment_status: "pending",
          fulfillment_status: "pending",
          razorpay_payment_id: order.id, // Temporarily store Razorpay order.id here
          notes: paymentMethod || "Razorpay",
        });

      if (orderError) {
        console.error("Supabase Order Insert Error:", orderError);
        throw new Error(orderError.message);
      }

      // 3. Insert order items
      if (items && Array.isArray(items)) {
        const orderItemsToInsert = items.map((item: any) => ({
          order_id: orderId,
          product_id: item.product_id || item.id || null,
          variant_id: item.variant_id || null,
          title: item.title,
          variant_info: item.variant_info || null,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabaseAdmin
          .from("order_items")
          .insert(orderItemsToInsert);

        if (itemsError) {
          console.error("Supabase Order Items Insert Error:", itemsError);
        }
      }

      // Append generated metadata to the returned order object
      order.order_number = orderNumber;
      order.database_order_id = orderId;
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Error creating order", details: error.message },
      { status: 500 }
    );
  }
}
