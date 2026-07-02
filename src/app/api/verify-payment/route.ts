import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const isMockMode = razorpay_order_id.startsWith("order_mock_") || razorpay_signature === "cash_on_delivery";

    if (!isMockMode) {
      const secret = process.env.Razorpay_SECRET_KEY || "";
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    // Payment is valid! Update the order in Supabase using the service role client
    let orderNumber = order_number || "";
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabase = createServiceRoleClient();
      
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: isMockMode && razorpay_signature === "cash_on_delivery" ? "pending" : "paid",
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
