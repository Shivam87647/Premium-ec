"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Save, Plus, Edit2, Trash2, Loader2, Settings, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SettingsTab = "general" | "slides";

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // General settings state
  const [settings, setSettings] = React.useState<any>({
    site_name: "PREMIUM.",
    contact_email: "support@premium.com",
    contact_phone: "",
    currency_code: "INR",
    currency_symbol: "₹",
    tax_rate: 18.00,
    announcement_bar_active: false,
    announcement_bar_text: "",
    announcement_bar_link: "",
    announcement_bar_color: "#1A1A1A",
  });

  const [newPaymentMethod, setNewPaymentMethod] = React.useState("");

  // Hero slides state
  const [slides, setSlides] = React.useState<any[]>([]);
  const [slidesLoading, setSlidesLoading] = React.useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = React.useState(false);
  const [editingSlide, setEditingSlide] = React.useState<any>(null);
  const [slideForm, setSlideForm] = React.useState({
    image_url: "",
    heading: "",
    subheading: "",
    cta_text: "",
    cta_link: "",
    sort_order: "0",
    is_active: true,
  });

  const supabase = React.useMemo(() => createClient(), []);

  // Fetch Settings & Slides
  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        let payment_methods = data.payment_methods;
        if (!payment_methods) {
          try {
            const local = localStorage.getItem("site_payment_methods");
            payment_methods = local ? JSON.parse(local) : ["Cash", "Razorpay", "UPI", "Net Banking"];
          } catch (e) {
            payment_methods = ["Cash", "Razorpay", "UPI", "Net Banking"];
          }
        }
        setSettings({ ...data, payment_methods });
      }
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load settings", description: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [supabase, addToast]);

  const fetchSlides = React.useCallback(async () => {
    setSlidesLoading(true);
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load slides", description: err.message, type: "error" });
    } finally {
      setSlidesLoading(false);
    }
  }, [supabase, addToast]);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  React.useEffect(() => {
    if (activeTab === "slides") {
      fetchSlides();
    }
  }, [activeTab, fetchSlides]);

  // General Settings Handlers
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        site_name: settings.site_name,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone || null,
        currency_code: settings.currency_code,
        currency_symbol: settings.currency_symbol,
        tax_rate: Number(settings.tax_rate),
        announcement_bar_active: settings.announcement_bar_active,
        announcement_bar_text: settings.announcement_bar_text || null,
        announcement_bar_link: settings.announcement_bar_link || null,
        announcement_bar_color: settings.announcement_bar_color || "#1A1A1A",
      };

      // Try saving payment methods to db first.
      let saveError: any = null;
      if (settings.id) {
        const { error } = await supabase
          .from("site_settings")
          .update({ ...payload, payment_methods: settings.payment_methods })
          .eq("id", settings.id);
        if (error) {
          saveError = error;
        }
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert([{ ...payload, payment_methods: settings.payment_methods }]);
        if (error) {
          saveError = error;
        }
      }

      // If DB update failed because of missing column (payment_methods), retry without it and save to localStorage
      if (saveError) {
        console.warn("DB Save with payment_methods failed. Retrying without column...", saveError);
        const { error: retryError } = settings.id
          ? await supabase.from("site_settings").update(payload).eq("id", settings.id)
          : await supabase.from("site_settings").insert([payload]);
        
        if (retryError) throw retryError;

        // Save payment methods to localStorage fallback
        localStorage.setItem("site_payment_methods", JSON.stringify(settings.payment_methods || []));
        addToast({ 
          title: "Settings Saved (With Fallback)", 
          description: "General settings saved, payment options saved to local storage.", 
          type: "success" 
        });
      } else {
        addToast({ title: "Settings Saved", description: "General settings successfully updated.", type: "success" });
      }
      
      fetchSettings();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Save Failed", description: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Hero Slide Handlers
  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSlideForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setSlideForm({
      image_url: slide.image_url,
      heading: slide.heading || "",
      subheading: slide.subheading || "",
      cta_text: slide.cta_text || "",
      cta_link: slide.cta_link || "",
      sort_order: slide.sort_order.toString(),
      is_active: slide.is_active,
    });
    setIsSlideModalOpen(true);
  };

  const handleCreateSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      image_url: "",
      heading: "",
      subheading: "",
      cta_text: "",
      cta_link: "",
      sort_order: "0",
      is_active: true,
    });
    setIsSlideModalOpen(true);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        image_url: slideForm.image_url,
        heading: slideForm.heading || null,
        subheading: slideForm.subheading || null,
        cta_text: slideForm.cta_text || null,
        cta_link: slideForm.cta_link || null,
        sort_order: parseInt(slideForm.sort_order) || 0,
        is_active: slideForm.is_active,
      };

      if (editingSlide) {
        const { error } = await supabase
          .from("hero_slides")
          .update(payload)
          .eq("id", editingSlide.id);
        if (error) throw error;
        addToast({ title: "Slide Updated", description: "Slide modified.", type: "success" });
      } else {
        const { error } = await supabase
          .from("hero_slides")
          .insert([payload]);
        if (error) throw error;
        addToast({ title: "Slide Created", description: "New slide added.", type: "success" });
      }

      setIsSlideModalOpen(false);
      fetchSlides();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Operation Failed", description: err.message, type: "error" });
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!window.confirm("Delete this slide?")) return;
    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
      addToast({ title: "Deleted", description: "Slide removed successfully.", type: "success" });
      fetchSlides();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Delete Failed", description: err.message, type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm max-w-4xl mx-auto animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading variables...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tabs list */}
      <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.06)] pb-px mb-6">
        <div className="flex space-x-8">
          {["general", "slides"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as SettingsTab)}
              className={`pb-3.5 text-xs font-bold uppercase tracking-widest transition-all relative cursor-pointer ${
                activeTab === tab 
                  ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A]" 
                  : "text-[#9CA3AF] hover:text-[#1A1A1A]"
              }`}
            >
              {tab === "general" ? "General Config" : "Hero Slides"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Shop general info */}
          <div className="card-base p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-lg font-bold border-b border-[rgba(0,0,0,0.06)] pb-3.5 flex items-center gap-1.5 text-[#1A1A1A]">
              <Settings className="w-4.5 h-4.5 text-[#9CA3AF]" />
              General Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Store Branding Name" name="site_name" value={settings.site_name} onChange={handleSettingsChange} required />
              <Input label="Support Email Address" name="contact_email" type="email" value={settings.contact_email} onChange={handleSettingsChange} required />
              <Input label="Support Phone Number" name="contact_phone" value={settings.contact_phone || ""} onChange={handleSettingsChange} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    name="currency_code"
                    value={settings.currency_code}
                    onChange={handleSettingsChange}
                    className="peer w-full rounded-lg border border-[rgba(0,0,0,0.08)] px-4 py-3 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white text-[#1A1A1A] h-[46px] mt-1"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <label className="absolute left-3.5 -top-2 bg-white px-1 text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">Currency</label>
                </div>
                <Input label="Symbol" name="currency_symbol" value={settings.currency_symbol} onChange={handleSettingsChange} required />
              </div>
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="card-base p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.06)] pb-3.5">
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Announcement Header Bar
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="announcement_bar_active"
                  checked={settings.announcement_bar_active}
                  onChange={handleSettingsChange}
                  className="rounded border-[rgba(0,0,0,0.12)] text-[#1A1A1A] focus:ring-[#1A1A1A] w-4 h-4 cursor-pointer"
                />
                <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Enable</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input label="Bar Alert Message Text" name="announcement_bar_text" value={settings.announcement_bar_text || ""} onChange={handleSettingsChange} disabled={!settings.announcement_bar_active} />
              </div>
              <Input label="Navigation Target Link" name="announcement_bar_link" value={settings.announcement_bar_link || ""} onChange={handleSettingsChange} disabled={!settings.announcement_bar_active} />
              <Input label="Background hex Color" name="announcement_bar_color" value={settings.announcement_bar_color || "#1A1A1A"} onChange={handleSettingsChange} disabled={!settings.announcement_bar_active} />
            </div>
          </div>

          {/* Payment Methods Options */}
          <div className="card-base p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-lg font-bold border-b border-[rgba(0,0,0,0.06)] pb-3.5 text-[#1A1A1A]">
              Supported Payment Methods
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-[#6B6B6B]">Configure which payment methods are enabled at checkout storefront:</p>
              
              {/* Active Payment Methods List */}
              <div className="space-y-2.5 max-w-md">
                {(settings.payment_methods || ["Cash", "Razorpay", "UPI", "Net Banking"]).map((method: string) => (
                  <div key={method} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">{method}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = settings.payment_methods || ["Cash", "Razorpay", "UPI", "Net Banking"];
                        const updated = current.filter((m: string) => m !== method);
                        setSettings((prev: any) => ({ ...prev, payment_methods: updated }));
                      }}
                      className="text-[#9CA3AF] hover:text-red-600 transition-colors p-1"
                      title={`Remove ${method}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Payment Method Input */}
              <div className="flex gap-2.5 max-w-md pt-2">
                <input
                  type="text"
                  placeholder="Enter custom payment method (e.g. Apple Pay)"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="flex-1 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPaymentMethod.trim()) return;
                    const method = newPaymentMethod.trim();
                    const current = settings.payment_methods || ["Cash", "Razorpay", "UPI", "Net Banking"];
                    if (current.includes(method)) {
                      addToast({ title: "Method already exists", type: "error" });
                      return;
                    }
                    const updated = [...current, method];
                    setSettings((prev: any) => ({ ...prev, payment_methods: updated }));
                    setNewPaymentMethod("");
                    addToast({ title: "Payment method added", type: "success" });
                  }}
                  className="text-xs font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#1A1A1A] text-white px-4 py-2 rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={saving} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
            </Button>
          </div>
        </form>
      )}

      {activeTab === "slides" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Configure Landing Slides</h3>
            <Button onClick={handleCreateSlide} className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider shimmer-btn">
              <Plus className="w-4 h-4" />
              New Slide
            </Button>
          </div>

          {slidesLoading ? (
            <div className="flex justify-center py-12 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-[#6B6B6B]">
              <ImageIcon className="w-10 h-10 mx-auto text-[#E5E7EB] mb-4" />
              <p className="text-sm font-medium text-[#9CA3AF]">No slides created. Landing defaults will rotate instead.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {slides.map((slide) => (
                <div key={slide.id} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl overflow-hidden p-6 flex gap-6 items-center shadow-sm group">
                  <div className="relative w-36 h-24 bg-[#F5F5F0] rounded-xl overflow-hidden flex-shrink-0 border border-[rgba(0,0,0,0.04)]">
                    <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-base text-[#1A1A1A] truncate">{slide.heading || "Untitled"}</h4>
                    <p className="text-xs text-[#6B6B6B] truncate mt-1">{slide.subheading || "No description text."}</p>
                    <div className="flex items-center space-x-3 mt-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#F5F5F0] px-2 py-0.5 rounded text-[#6B6B6B] border border-[rgba(0,0,0,0.04)]">
                        Order: {slide.sort_order}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        slide.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {slide.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-all cursor-pointer border border-[rgba(0,0,0,0.08)] bg-white shadow-sm flex items-center justify-center"
                      onClick={() => handleEditSlide(slide)}
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      className="p-2 rounded-lg text-[#9CA3AF] hover:text-destructive hover:bg-red-50 transition-all cursor-pointer border border-[rgba(0,0,0,0.08)] bg-white shadow-sm flex items-center justify-center"
                      onClick={() => handleDeleteSlide(slide.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide Modal */}
      <Modal isOpen={isSlideModalOpen} onClose={() => setIsSlideModalOpen(false)} title={editingSlide ? "Edit Slide" : "New Slide"}>
        <form onSubmit={handleSlideSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 scrollbar-hide text-sm">
          <Input label="Image URL" name="image_url" value={slideForm.image_url} onChange={handleSlideChange} required />
          <Input label="Heading (Large text)" name="heading" value={slideForm.heading} onChange={handleSlideChange} />
          <Input label="Subheading" name="subheading" value={slideForm.subheading} onChange={handleSlideChange} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Button Text" name="cta_text" value={slideForm.cta_text} onChange={slideForm.cta_text === "SHOP NOW" ? undefined : handleSlideChange} placeholder="e.g. SHOP NOW" />
            <Input label="CTA Link Target" name="cta_link" value={slideForm.cta_link} onChange={handleSlideChange} placeholder="e.g. /products" />
          </div>

          <Input label="Sort Order Index" name="sort_order" type="number" value={slideForm.sort_order} onChange={handleSlideChange} required />

          <label className="flex items-center space-x-3 cursor-pointer pt-2 select-none">
            <input
              type="checkbox"
              name="is_active"
              checked={slideForm.is_active}
              onChange={handleSlideChange}
              className="rounded border-[rgba(0,0,0,0.12)] text-[#1A1A1A] focus:ring-[#1A1A1A] w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Slide is active (Visible on carousel)</span>
          </label>

          <div className="flex justify-end gap-3 border-t border-[rgba(0,0,0,0.06)] pt-5">
            <Button type="button" variant="ghost" onClick={() => setIsSlideModalOpen(false)} className="text-xs uppercase tracking-wider">Cancel</Button>
            <Button type="submit" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn">
              <Save className="w-3.5 h-3.5" />
              <span>Save Slide</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
