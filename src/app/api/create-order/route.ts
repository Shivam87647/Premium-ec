import { NextResponse } from "next/server";
import { razorpay } from "@/lib/Razorpay";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", items, shippingInfo, couponCode, discountAmount, paymentMethod, userId: payloadUserId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    // ──────────────────────────────────────────────
    // 1. SERVER-SIDE PRICE RECALCULATION
    //    Never trust client-provided totals.
    // ──────────────────────────────────────────────
    const supabaseAdmin = createServiceRoleClient();

    // 1a. Fetch actual product prices from the database
    // Cart items use composite IDs: "productUUID-Color-Size"
    // Extract the raw UUID (first 36 characters) for database lookup
    const extractProductId = (item: any): string => {
      if (item.product_id) return item.product_id;
      // Cart id format: "uuid-Color-Size" — UUID is always 36 chars
      const rawId = item.id || "";
      return rawId.length >= 36 ? rawId.substring(0, 36) : rawId;
    };

    const productIds = items.map((item: any) => extractProductId(item)).filter(Boolean);
    const { data: dbProducts, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, price, sale_price, sale_start, sale_end, title, status")
      .in("id", productIds);

    if (productsError || !dbProducts) {
      console.error("Failed to fetch product prices:", productsError);
      return NextResponse.json({ error: "Failed to validate product prices" }, { status: 500 });
    }

    // Build a lookup map for O(1) access
    const priceMap = new Map<string, { price: number; sale_price: number | null; title: string }>();
    for (const p of dbProducts) {
      // Determine effective price (respect sale window)
      let effectivePrice = Number(p.price);
      if (p.sale_price != null) {
        const now = new Date();
        const saleStartOk = !p.sale_start || new Date(p.sale_start) <= now;
        const saleEndOk = !p.sale_end || new Date(p.sale_end) >= now;
        if (saleStartOk && saleEndOk) {
          effectivePrice = Number(p.sale_price);
        }
      }
      priceMap.set(p.id, { price: effectivePrice, sale_price: p.sale_price, title: p.title });
    }

    // 1b. Calculate server subtotal from DB prices
    let serverSubtotal = 0;
    const validatedItems: any[] = [];
    for (const item of items) {
      const pid = extractProductId(item);
      const dbProduct = priceMap.get(pid);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.title || pid}` }, { status: 400 });
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const lineTotal = dbProduct.price * qty;
      serverSubtotal += lineTotal;

      validatedItems.push({
        product_id: pid,
        variant_id: item.variant_id || null,
        title: dbProduct.title || item.title,
        variant_info: item.variant || item.variant_info || null,
        quantity: qty,
        unit_price: dbProduct.price,
        line_total: lineTotal,
      });
    }

    // 1c. Validate coupon code and calculate discount server-side
    let serverDiscount = 0;
    let validatedCouponCode: string | null = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) <= now : true;
        const validTo = coupon.valid_to ? new Date(coupon.valid_to) >= now : true;
        const meetsMinimum = coupon.min_order_amount ? serverSubtotal >= Number(coupon.min_order_amount) : true;
        const withinUsageLimit = coupon.usage_limit ? (coupon.times_used || 0) < coupon.usage_limit : true;

        if (validFrom && validTo && meetsMinimum && withinUsageLimit) {
          if (coupon.type === "percentage") {
            serverDiscount = (serverSubtotal * Number(coupon.value)) / 100;
          } else {
            serverDiscount = Number(coupon.value);
          }
          serverDiscount = Math.min(serverDiscount, serverSubtotal); // discount can't exceed subtotal
          validatedCouponCode = coupon.code;

          // Increment coupon usage
          await supabaseAdmin
            .from("coupons")
            .update({ times_used: (coupon.times_used || 0) + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    // 1d. Calculate final server total (matching checkout page logic)
    const taxableAmount = Math.max(0, serverSubtotal - serverDiscount);
    const shippingCost = serverSubtotal > 3000 ? 0 : 150;
    const taxRate = 0.18;
    const tax = taxableAmount * taxRate;
    const serverTotal = taxableAmount + shippingCost + tax;

    // 1e. Verify client total is within tolerance (₹2 for floating-point)
    if (amount && Math.abs(serverTotal - Number(amount)) > 2) {
      console.error(`Price mismatch! Client: ${amount}, Server: ${serverTotal}`);
      return NextResponse.json(
        { error: "Price validation failed. Please refresh and try again." },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────
    // 2. CREATE PAYMENT ORDER (Razorpay or Mock)
    // ──────────────────────────────────────────────
    const rzKey = process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY || "";
    const rzSecret = process.env.Razorpay_SECRET_KEY || "";
    const isDevelopment = process.env.NODE_ENV === "development";
    const isMockMode = isDevelopment && (!rzKey || rzKey.startsWith("your_") || !rzSecret || rzSecret.startsWith("your_"));

    let order: any;

    if (isMockMode) {
      // Mock order generation — only in development
      order = {
        id: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
        amount: Math.round(serverTotal * 100),
        currency: currency === "USD" ? "INR" : currency,
        receipt: `rcpt_${Date.now()}`,
        status: "created"
      };
    } else if (paymentMethod === "Cash") {
      // Cash on Delivery — no Razorpay order needed
      order = {
        id: `order_cod_${crypto.randomUUID().slice(0, 12)}`,
        amount: Math.round(serverTotal * 100),
        currency: currency === "USD" ? "INR" : currency,
        receipt: `rcpt_${Date.now()}`,
        status: "created"
      };
    } else {
      // Create the real Razorpay Order
      const options = {
        amount: Math.round(serverTotal * 100),
        currency: currency === "USD" ? "INR" : currency,
        receipt: `rcpt_${Date.now()}`,
      };
      order = await razorpay.orders.create(options);
    }

    // ──────────────────────────────────────────────
    // 3. INSERT PENDING ORDER INTO DATABASE
    // ──────────────────────────────────────────────
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
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
          shipping_cost: shippingCost,
          subtotal: serverSubtotal,
          tax_amount: tax,
          total: serverTotal,
          coupon_code: validatedCouponCode,
          discount_amount: serverDiscount,
          payment_status: "pending",
          fulfillment_status: "pending",
          razorpay_payment_id: order.id, // Temporarily store Razorpay order.id here
          notes: paymentMethod || "Razorpay",
        });

      if (orderError) {
        console.error("Supabase Order Insert Error:", orderError);
        throw new Error(orderError.message);
      }

      // 4. Insert order items (using server-validated prices)
      if (validatedItems.length > 0) {
        const orderItemsToInsert = validatedItems.map((item: any) => ({
          order_id: orderId,
          ...item,
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
