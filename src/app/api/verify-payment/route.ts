import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const isDevelopment = process.env.NODE_ENV === "development";

    // Mock mode: only allowed in development environment
    const isMockMode = isDevelopment && (
      razorpay_order_id.startsWith("order_mock_") ||
      razorpay_signature === "mock_signature_bypass"
    );

    // Cash on delivery: allowed in all environments but requires DB validation
    const isCashOnDelivery = razorpay_signature === "cash_on_delivery";

    if (!isMockMode && !isCashOnDelivery) {
      // Standard Razorpay HMAC verification
      const secret = process.env.Razorpay_SECRET_KEY || "";
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    if (isCashOnDelivery) {
      // Validate this order actually exists and was created as a Cash order
      const supabaseCheck = createServiceRoleClient();
      const { data: existingOrder, error: lookupError } = await supabaseCheck
        .from("orders")
        .select("id, notes, razorpay_payment_id")
        .eq("razorpay_payment_id", razorpay_order_id)
        .single();

      if (lookupError || !existingOrder) {
        return NextResponse.json({ error: "Order not found for COD verification" }, { status: 400 });
      }

      if (existingOrder.notes !== "Cash") {
        return NextResponse.json({ error: "Order was not created as Cash on Delivery" }, { status: 400 });
      }
    }

    // Payment is valid! Update the order in Supabase using the service role client
    let orderNumber = order_number || "";
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabase = createServiceRoleClient();
      
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: isCashOnDelivery ? "pending" : "paid",
          razorpay_payment_id: razorpay_payment_id, // Store actual transaction payment ID
        })
        .eq("razorpay_payment_id", razorpay_order_id); // Match temporary order.id stored in the column

      if (error) {
        console.error("Supabase Order Update Error:", error);
        throw new Error(error.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment verified successfully",
      order_number: orderNumber 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment", details: error.message },
      { status: 500 }
    );
  }
}

