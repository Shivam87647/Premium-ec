"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Eye, Download, Printer, Loader2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const { addToast } = useToast();
  const [orders, setOrders] = React.useState<any[]>(initialOrders);
  const [search, setSearch] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

  // Status updates states
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [timeline, setTimeline] = React.useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Load Order Status Timeline
  React.useEffect(() => {
    async function fetchTimeline() {
      if (!selectedOrder) return;
      setTimelineLoading(true);
      try {
        const { data, error } = await supabase
          .from("order_timeline")
          .select("*")
          .eq("order_id", selectedOrder.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTimeline(data || []);
      } catch (err) {
        console.error("Failed to load timeline entries:", err);
      } finally {
        setTimelineLoading(false);
      }
    }
    fetchTimeline();
  }, [selectedOrder, supabase]);

  const filteredOrders = orders.filter(o => 
    (o.order_number || o.id).toLowerCase().includes(search.toLowerCase()) || 
    (o.customer && o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ["Order Number", "Customer Email", "Date", "Payment Status", "Fulfillment Status", "Total"];
    const rows = filteredOrders.map(o => [
      o.order_number || o.id,
      o.customer,
      new Date(o.date).toLocaleDateString(),
      o.payment_status,
      o.fulfillment_status,
      o.total
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ title: "CSV Exported", description: "All listed orders have been downloaded.", type: "success" });
  };

  // Status timeline transitions
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ fulfillment_status: nextStatus })
        .eq("id", orderId);

      if (error) throw error;

      await supabase.from("order_timeline").insert([{
        order_id: orderId,
        status: nextStatus,
        note: `Order fulfillment status updated to ${nextStatus}`,
      }]);

      addToast({ title: "Fulfillment Saved", description: `Order status is now ${nextStatus}`, type: "success" });
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillment_status: nextStatus } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, fulfillment_status: nextStatus }));
      }
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Update Failed", description: err.message, type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // Printable Packing Slip Layout
  const handlePrintPackingSlip = (order: any) => {
    const slipWindow = window.open("", "_blank");
    if (!slipWindow) return;
    slipWindow.document.write(`
      <html>
        <head>
          <title>Packing Slip - ${order.order_number || order.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 24px; margin-bottom: 32px; }
            .header h1 { font-family: Georgia, serif; font-size: 24px; letter-spacing: -0.01em; margin: 0 0 8px 0; }
            .header p { margin: 4px 0; font-size: 13px; color: #6b6b6b; font-weight: 500; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 32px; gap: 40px; }
            .col { flex: 1; font-size: 13px; }
            .col strong { display: block; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 8px; }
            .col p { margin: 0; color: #1a1a1a; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 32px; font-size: 13px; }
            th, td { border-bottom: 1px solid rgba(0,0,0,0.06); padding: 12px 16px; text-align: left; }
            th { background-color: #fafafa; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
            td { color: #1a1a1a; font-weight: 500; }
            .total-row { border-top: 1px solid rgba(0,0,0,0.1); text-align: right; font-weight: bold; font-size: 15px; padding-top: 24px; margin-top: 24px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <h1>PREMIUM.</h1>
            <p>Order Reference: ${order.order_number || order.id}</p>
            <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
          </div>
          <div class="grid">
            <div class="col">
              <strong>Ship To</strong>
              <p>${order.shipping_address?.full_name || order.customer}<br>
              ${order.shipping_address?.address_line1 || ""}<br>
              ${order.shipping_address?.city || ""}, ${order.shipping_address?.country || ""}</p>
            </div>
            <div class="col" style="text-align: right;">
              <strong>Billing Details</strong>
              <p>${order.billing_address?.full_name || order.customer}<br>
              ${order.billing_address?.address_line1 || ""}<br>
              ${order.billing_address?.city || ""}, ${order.billing_address?.country || ""}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th style="text-align: right;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>
                    ${item.title} 
                    ${item.variant_info ? `<span style="color: #6b6b6b; font-size: 11px; margin-left: 8px;">(${Object.values(item.variant_info).join(" / ")})</span>` : ""}
                  </td>
                  <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    slipWindow.document.close();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-indigo-50 text-indigo-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Orders</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">Manage and fulfill customer orders.</p>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-[rgba(0,0,0,0.06)] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FAFAFA]">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search order ref or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#C4C4C4] focus:border-[#1A1A1A] focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button variant="outline" className="flex items-center space-x-2 cursor-pointer h-10 px-4 rounded-lg text-xs font-bold uppercase tracking-wider" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-[rgba(0,0,0,0.04)]">
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Order Reference</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Customer</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Date</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Payment</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Fulfillment</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Total</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.04)] bg-white">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.tr 
                    key={order.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#FAFAFA] transition-colors group"
                  >
                    <td className="px-6 py-4 font-semibold text-[#1A1A1A] text-[13px]">
                      {order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-[#6B6B6B] text-[13px]">{order.customer}</td>
                    <td className="px-6 py-4 text-[#9CA3AF] text-[13px]">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        order.payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        statusColors[order.fulfillment_status] || "bg-gray-50 text-[#6B6B6B]"
                      }`}>
                        {order.fulfillment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#1A1A1A] font-bold text-[13px]">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-all cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto text-[#E5E7EB] mb-3" />
                    <p className="text-sm font-medium text-[#9CA3AF]">No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Dialog */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-6 text-sm">
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(0,0,0,0.06)]">
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Order Reference</p>
                <p className="font-serif text-lg font-bold text-[#1A1A1A]">{selectedOrder.order_number || selectedOrder.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Date Placed</p>
                <p className="font-semibold text-xs text-[#1A1A1A]">{new Date(selectedOrder.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[rgba(0,0,0,0.06)]">
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Billing Details</p>
                <p className="text-xs font-bold text-[#1A1A1A]">{selectedOrder.shipping_address?.full_name || selectedOrder.customer}</p>
                <p className="text-xs text-[#6B6B6B] mt-1">{selectedOrder.shipping_address?.address_line1 || ""}</p>
                <p className="text-xs text-[#6B6B6B]">{selectedOrder.shipping_address?.city || ""}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Fulfillment</p>
                <div className="relative">
                  <select
                    disabled={updatingId === selectedOrder.id}
                    value={selectedOrder.fulfillment_status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="peer w-full rounded-lg border border-[rgba(0,0,0,0.08)] px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none bg-white text-[#1A1A1A]"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Items list */}
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">Ordered Items</p>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-3.5">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-[#FAFAFA] p-4 rounded-xl border border-[rgba(0,0,0,0.04)] shadow-sm">
                      <div className="flex space-x-3 items-center">
                        <span className="text-[#9CA3AF] font-bold text-xs">{item.quantity}x</span>
                        <div>
                          <span className="font-semibold text-xs text-[#1A1A1A]">{item.title}</span>
                          {item.variant_info && (
                            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold mt-1">
                              {Object.values(item.variant_info).join(" / ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#1A1A1A]">
                        {formatCurrency((item.unit_price || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B6B6B] italic">No item data listings.</p>
              )}
            </div>

            {/* Status logs Timeline */}
            <div className="border-t border-[rgba(0,0,0,0.06)] pt-4">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">Status Log Timeline</p>
              {timelineLoading ? (
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                  <span>Loading timeline...</span>
                </div>
              ) : timeline.length === 0 ? (
                <p className="text-xs text-[#6B6B6B] italic">No logged events.</p>
              ) : (
                <div className="space-y-4 relative pl-4 border-l border-[rgba(0,0,0,0.06)] ml-2">
                  {timeline.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A] border border-white" />
                      <p className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">{log.status}</p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed">{log.note}</p>
                      <span className="text-[9px] text-[#9CA3AF] block mt-1 font-semibold">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[rgba(0,0,0,0.06)] flex justify-between items-center text-xs">
              <span className="text-[#6B6B6B] font-bold uppercase tracking-wider">Total Revenue Charged</span>
              <span className="font-bold text-lg text-[#1A1A1A]">{formatCurrency(selectedOrder.total)}</span>
            </div>

            {/* Slip triggers */}
            <div className="flex justify-between gap-3 pt-5 border-t border-[rgba(0,0,0,0.06)]">
              <Button
                variant="outline"
                type="button"
                onClick={() => handlePrintPackingSlip(selectedOrder)}
                className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider border-[rgba(0,0,0,0.08)] hover:bg-[#FAFAFA]"
              >
                <Printer className="w-4 h-4 text-[#9CA3AF]" />
                <span>Packing Slip</span>
              </Button>
              <Button type="button" variant="ghost" onClick={() => setSelectedOrder(null)} className="text-xs uppercase tracking-wider">Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
