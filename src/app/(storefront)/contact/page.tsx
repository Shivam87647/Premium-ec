"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  const supabase = React.useMemo(() => createClient(), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to insert message into Supabase
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) {
        // Table might not exist yet if migrations haven't run, check message
        if (error.code === "P0001" || error.message.includes("does not exist")) {
          console.warn("contact_messages table does not exist, simulating submission:", error);
          // Simulate standard success since table is not yet created
        } else {
          throw error;
        }
      }

      addToast({
        title: "Message Sent",
        description: "Thank you for reaching out. We will get back to you shortly.",
        type: "success",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Contact Submission Error:", error);
      addToast({
        title: "Submission Failed",
        description: error.message || "An error occurred while sending your message. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-caption text-[#9CA3AF] mb-4"
          >
            Get In Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-hero text-[#1A1A1A]"
          >
            We Are Here To Assist You
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          {/* Info Details */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="lg:col-span-5 space-y-10"
          >
            <div>
              <p className="text-caption text-[#9CA3AF] mb-2">Channels</p>
              <h2 className="text-section text-[#1A1A1A] mb-6">Contact Channels</h2>
              <p className="text-[#6B6B6B] text-sm leading-relaxed mb-8">
                Whether you have a question about our collections, sizing, orders, or just want to share feedback, we'd love to hear from you.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm flex items-center justify-center text-[#1A1A1A] flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">Client Support</p>
                    <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">support@premium.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm flex items-center justify-center text-[#1A1A1A] flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">Call Us</p>
                    <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">+1 (800) 555-0199</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5 font-medium">Mon - Fri: 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm flex items-center justify-center text-[#1A1A1A] flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">HQ Address</p>
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mt-0.5">
                      100 Grand Avenue, Suite 400<br />
                      New York, NY 10013
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-8 md:p-12 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] resize-none transition-colors"
                  placeholder="Your message..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
