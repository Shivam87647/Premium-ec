import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const secret = process.env.Razorpay_WEBHOOK_SECRET || "";
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(bodyText);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    // Handle payment capture / success
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        const supabase = createServiceRoleClient();

        // 1. Fetch current order state to prevent double-processing (idempotency)
        const { data: existingOrder, error: fetchError } = await supabase
          .from("orders")
          .select("id, payment_status")
          .eq("razorpay_payment_id", razorpayOrderId)
          .single();

        if (fetchError || !existingOrder) {
          console.error("Order not found or fetch error for order ID:", razorpayOrderId, fetchError);
          // Return 200 to acknowledge webhook receipt even if order not found locally
          return NextResponse.json({ received: true, error: "Order not found" }, { status: 200 });
        }

        if (existingOrder.payment_status === "paid") {
          console.log(`Order ${existingOrder.id} is already marked as paid.`);
          return NextResponse.json({ received: true, message: "Order already paid" }, { status: 200 });
        }

        // 2. Update status to 'paid' and replace temp order_id with actual payment_id
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            razorpay_payment_id: razorpayPaymentId,
          })
          .eq("id", existingOrder.id);

        if (updateError) {
          console.error("Error updating order via webhook:", updateError);
          return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
        }

        console.log(`Successfully processed webhook payment for Order ID: ${existingOrder.id}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Webhook Handling Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
