import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY || "",
  key_secret: process.env.Razorpay_SECRET_KEY || "",
});
