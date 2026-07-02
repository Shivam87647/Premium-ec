"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Loader2, Search, User, CreditCard, Calendar, Mail, FileText, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCustomersPage() {
  const { addToast } = useToast();
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Selected customer details drawer/overlay
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchCustomers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer");

      if (pError) throw pError;

      const { data: ordersData, error: oError } = await supabase
        .from("orders")
        .select("user_id, total, payment_status");

      if (oError) throw oError;

      const mapped = (profiles || []).map((prof: any) => {
        const customerOrders = (ordersData || []).filter(
          (o) => o.user_id === prof.id && o.payment_status === "paid"
        );
        const ltv = customerOrders.reduce((sum, o) => sum + Number(o.total), 0);
        return {
          ...prof,
          total_orders: customerOrders.length,
          ltv,
        };
      });

      setCustomers(mapped);
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load customers", description: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, addToast]);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Load customer order history on click
  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", cust.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load orders", description: err.message, type: "error" });
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      {/* Customers List Panel */}
      <div className="flex-1 w-full space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Customers</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">Monitor buyer details, lifetime values (LTV), and purchase histories.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#C4C4C4] focus:border-[#1A1A1A] focus:outline-none focus:ring-0 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading profiles...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-[#6B6B6B]">
            <User className="w-10 h-10 mx-auto text-[#E5E7EB] mb-3" />
            <p className="text-sm font-medium text-[#9CA3AF]">No customers found</p>
          </div>
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#FAFAFA] border-b border-[rgba(0,0,0,0.06)]">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Customer</th>
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Orders</th>
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">LTV (Spent)</th>
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.04)] bg-white">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className={`hover:bg-[#FAFAFA] transition-colors cursor-pointer ${
                      selectedCustomer?.id === c.id ? "bg-[#FAFAFA]" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-[#1A1A1A] text-[13px]">{c.full_name || "Guest Customer"}</div>
                        <div className="text-xs text-[#9CA3AF] mt-0.5">{c.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6B6B6B] text-[13px]">{c.total_orders}</td>
                    <td className="px-6 py-4 font-bold text-[#1A1A1A] text-[13px]">{formatCurrency(c.ltv)}</td>
                    <td className="px-6 py-4 text-xs text-[#9CA3AF]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Drawer/Details Panel */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full md:w-[360px] bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6 shadow-sm space-y-6 flex-shrink-0 md:sticky md:top-24"
          >
            <div className="flex justify-between items-start border-b border-[rgba(0,0,0,0.06)] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  {selectedCustomer.full_name || "Guest User"}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#1A1A1A] lowercase">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span>Registered: {new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span>LTV: <span className="text-[#1A1A1A] font-bold">{formatCurrency(selectedCustomer.ltv)}</span></span>
              </div>
            </div>

            {/* Orders history inside details */}
            <div className="space-y-4 pt-2">
              <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[rgba(0,0,0,0.06)] pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#9CA3AF]" />
                Order History
              </h4>

              {ordersLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] text-center py-4">No order records.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                  {orders.map((o) => (
                    <div key={o.id} className="p-3 bg-[#FAFAFA] rounded-xl border border-[rgba(0,0,0,0.04)] flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{o.order_number}</p>
                        <p className="text-[#9CA3AF] mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1A1A1A]">{formatCurrency(o.total)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-1 ${
                          o.payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {o.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
