import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_Razorpay_PUBLISHABLE_KEY;
    const keySecret = process.env.RAZORPAY_SECRET_KEY || process.env.Razorpay_SECRET_KEY;

    if (!keyId || !keySecret) {
      // Return a dummy instance during build/mock compilation to prevent top-level evaluation crashes
      return new Razorpay({
        key_id: "mock_key_id",
        key_secret: "mock_key_secret",
      });
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

// Lazy proxy that transparently forwards operations to the active instance
export const razorpay = new Proxy({} as Razorpay, {
  get(_, prop) {
    const instance = getRazorpayInstance();
    const value = Reflect.get(instance, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  }
});
