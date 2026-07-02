"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Edit2, Ticket, Loader2, Save, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCouponsPage() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    code: "",
    type: "percentage",
    value: "",
    min_order_amount: "",
    usage_limit: "",
    per_customer_limit: "",
    valid_from: "",
    valid_to: "",
    is_active: true,
  });

  const supabase = React.useMemo(() => createClient(), []);

  const fetchCoupons = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load coupons", description: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, addToast]);

  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);

    const formatDateTimeLocal = (dateStr: string | null) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      min_order_amount: coupon.min_order_amount ? coupon.min_order_amount.toString() : "",
      usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : "",
      per_customer_limit: coupon.per_customer_limit ? coupon.per_customer_limit.toString() : "",
      valid_from: formatDateTimeLocal(coupon.valid_from),
      valid_to: formatDateTimeLocal(coupon.valid_to),
      is_active: coupon.is_active,
    });
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      min_order_amount: "",
      usage_limit: "",
      per_customer_limit: "",
      valid_from: "",
      valid_to: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        per_customer_limit: formData.per_customer_limit ? Number(formData.per_customer_limit) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", editingCoupon.id);
        if (error) throw error;
        addToast({ title: "Coupon Updated", description: "Coupon modifications saved.", type: "success" });
      } else {
        const { error } = await supabase
          .from("coupons")
          .insert([payload]);
        if (error) throw error;
        addToast({ title: "Coupon Created", description: "New promo discount code added.", type: "success" });
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Operation Failed", description: err.message, type: "error" });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", deletingId);
      if (error) throw error;
      addToast({ title: "Coupon Deleted", description: "Discount code deleted.", type: "success" });
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Delete Failed", description: err.message, type: "error" });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Coupons</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">Manage promotional discount campaigns and track coupon usages.</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider shimmer-btn">
          <Plus className="w-4 h-4" />
          Add Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading coupons database...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-[#6B6B6B] p-8">
          <Ticket className="w-12 h-12 mx-auto text-[#E5E7EB] mb-4" />
          <h3 className="text-base font-bold text-[#1A1A1A] mb-2">No Active Coupons</h3>
          <p className="text-sm text-[#6B6B6B] max-w-xs mx-auto mb-6">Create promotional discount codes to incentivize purchase conversions.</p>
          <Button onClick={handleCreateNew} className="text-xs uppercase tracking-wider font-bold">Add First Coupon</Button>
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFAFA] border-b border-[rgba(0,0,0,0.06)]">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Code</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Discount</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Min. Spend</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Usages</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.04)] bg-white">
              <AnimatePresence>
                {coupons.map((c) => (
                  <motion.tr 
                    key={c.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#FAFAFA] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/10">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1A1A1A] text-[13px]">
                      {c.type === "percentage" ? `${c.value}% Off` : `${formatCurrency(c.value)} Off`}
                    </td>
                    <td className="px-6 py-4 text-[#6B6B6B] text-[13px]">
                      {c.min_order_amount ? formatCurrency(c.min_order_amount) : "No limit"}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#6B6B6B]">
                      {c.times_used} / {c.usage_limit || "∞"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        c.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {c.is_active ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-all cursor-pointer"
                          onClick={() => handleEdit(c)}
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-2 rounded-lg text-[#9CA3AF] hover:text-destructive hover:bg-red-50 transition-all cursor-pointer"
                          onClick={() => handleDelete(c.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? "Edit Coupon" : "Create Coupon"}>
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <Input label="Coupon Code" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. WELCOME10" />
          
          <div className="relative">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="peer w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] h-[46px]"
            >
              <option value="percentage">Percentage discount (%)</option>
              <option value="fixed">Fixed amount discount (Flat)</option>
            </select>
            <label className="absolute left-3.5 -top-2 bg-white px-1 text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">Discount Type</label>
          </div>

          <Input label="Discount Value" name="value" type="number" step="any" value={formData.value} onChange={handleChange} required />
          <Input label="Minimum Order Spend (INR)" name="min_order_amount" type="number" step="any" value={formData.min_order_amount} onChange={handleChange} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usage Limit (Total)" name="usage_limit" type="number" value={formData.usage_limit} onChange={handleChange} />
            <Input label="Per Customer Limit" name="per_customer_limit" type="number" value={formData.per_customer_limit} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Valid From" name="valid_from" type="datetime-local" value={formData.valid_from} onChange={handleChange} />
            <Input label="Valid To" name="valid_to" type="datetime-local" value={formData.valid_to} onChange={handleChange} />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-[rgba(0,0,0,0.12)] text-[#1A1A1A] focus:ring-[#1A1A1A] w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Active status (Enable for checkouts)</span>
          </label>

          <div className="flex justify-end gap-3 border-t border-[rgba(0,0,0,0.06)] pt-5">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs uppercase tracking-wider">Cancel</Button>
            <Button type="submit" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn">
              <Save className="w-3.5 h-3.5" />
              <span>Save Coupon</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Coupon Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? Active customer shopping baskets using this code will no longer receive discounts."
        isLoading={isDeleting}
      />
    </div>
  );
}
