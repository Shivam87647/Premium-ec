"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  Settings,
  Heart,
  LogOut,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Order, Address } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/product-card";

type Tab = "dashboard" | "orders" | "addresses" | "settings" | "wishlist";

function AccountPageContent() {
  const { addToast } = useToast();
  const { user, profile, isLoading, signIn, signUp, signOut, resetPassword, refreshProfile } =
    useAuth();
  const supabase = React.useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = React.useState<Tab>("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  React.useEffect(() => {
    if (user && redirectUrl) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  React.useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Auth form state
  const [isLoginView, setIsLoginView] = React.useState(true);
  const [authError, setAuthError] = React.useState("");
  const [authLoading, setAuthLoading] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);

  // Orders state
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);

  // Addresses state
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = React.useState(false);

  // Address form modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);
  const [addressLoading, setAddressLoading] = React.useState(false);

  const [addrForm, setAddrForm] = React.useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    isDefault: false
  });

  const [deletingAddrId, setDeletingAddrId] = React.useState<string | null>(null);

  const fetchAddresses = React.useCallback(async () => {
    if (!user) return;
    setAddressesLoading(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses((data as Address[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAddressesLoading(false);
    }
  }, [user, supabase]);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddrForm({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      isDefault: false
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddrForm({
      fullName: addr.full_name || "",
      phone: addr.phone || "",
      addressLine1: addr.address_line1 || "",
      addressLine2: addr.address_line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "India",
      isDefault: addr.is_default || false
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressLoading(true);

    try {
      const addressData = {
        user_id: user.id,
        full_name: addrForm.fullName.trim(),
        phone: addrForm.phone.trim() || null,
        address_line1: addrForm.addressLine1.trim(),
        address_line2: addrForm.addressLine2.trim() || null,
        city: addrForm.city.trim(),
        state: addrForm.state.trim() || null,
        zip: addrForm.zip.trim() || null,
        country: addrForm.country.trim(),
        is_default: addrForm.isDefault
      };

      if (addrForm.isDefault) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingAddress) {
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", editingAddress.id)
          .eq("user_id", user.id);

        if (error) throw error;
        addToast({ title: "Address updated successfully", type: "success" });
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert([addressData]);

        if (error) throw error;
        addToast({ title: "Address saved successfully", type: "success" });
      }

      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      addToast({ title: "Failed to save address", description: err.message, type: "error" });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddrId || !user) return;
    setAddressLoading(true);
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", deletingAddrId)
        .eq("user_id", user.id);

      if (error) throw error;
      addToast({ title: "Address deleted successfully", type: "success" });
      setAddresses(prev => prev.filter(a => a.id !== deletingAddrId));
    } catch (err: any) {
      addToast({ title: "Delete failed", description: err.message, type: "error" });
    } finally {
      setAddressLoading(false);
      setDeletingAddrId(null);
    }
  };

  // Settings state
  const [settingsName, setSettingsName] = React.useState("");
  const [settingsPhone, setSettingsPhone] = React.useState("");
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsMessage, setSettingsMessage] = React.useState("");

  // Password management states
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState("");

  // Order cancellation state
  const [cancellingOrderId, setCancellingOrderId] = React.useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = React.useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = React.useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  // Load wishlist when tab is active
  React.useEffect(() => {
    if (user && activeTab === "wishlist") {
      setWishlistLoading(true);
      supabase
        .from("wishlist")
        .select(`
          id,
          product_id,
          products (
            id,
            title,
            slug,
            price,
            sale_price,
            og_image_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            const mapped = data
              .filter((item: any) => item.products !== null)
              .map((item: any) => ({
                id: item.products.id,
                title: item.products.title,
                slug: item.products.slug,
                price: Number(item.products.price),
                salePrice: item.products.sale_price ? Number(item.products.sale_price) : undefined,
                primaryImage: item.products.og_image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
              }));
            setWishlistItems(mapped);
          }
          setWishlistLoading(false);
        });
    } else if (!user && activeTab === "wishlist") {
      setWishlistLoading(true);
      try {
        const stored = localStorage.getItem("nanweb_guest_wishlist");
        const productIds: string[] = stored ? JSON.parse(stored) : [];
        if (productIds.length > 0) {
          supabase
            .from("products")
            .select("id, title, slug, price, sale_price, og_image_url")
            .in("id", productIds)
            .then(({ data }) => {
              if (data) {
                const mapped = data.map((p: any) => ({
                  id: p.id,
                  title: p.title,
                  slug: p.slug,
                  price: Number(p.price),
                  salePrice: p.sale_price ? Number(p.sale_price) : undefined,
                  primaryImage: p.og_image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                }));
                setWishlistItems(mapped);
              } else {
                setWishlistItems([]);
              }
              setWishlistLoading(false);
            });
        } else {
          setWishlistItems([]);
          setWishlistLoading(false);
        }
      } catch (e) {
        console.error(e);
        setWishlistLoading(false);
      }
    }
  }, [user, activeTab, supabase]);

  // Sync guest wishlist when logging in
  React.useEffect(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem("nanweb_guest_wishlist");
        const productIds: string[] = stored ? JSON.parse(stored) : [];
        if (productIds.length > 0) {
          const promises = productIds.map(async (productId) => {
            return supabase
              .from("wishlist")
              .insert([{ user_id: user.id, product_id: productId }]);
          });
          Promise.all(promises).then(() => {
            localStorage.removeItem("nanweb_guest_wishlist");
            addToast({
              title: "Wishlist Synchronized",
              description: "Your offline favorites have been merged with your account.",
              type: "success"
            });
            if (activeTab === "wishlist") {
              setWishlistLoading(true);
              supabase
                .from("wishlist")
                .select(`
                  id,
                  product_id,
                  products (
                    id,
                    title,
                    slug,
                    price,
                    sale_price,
                    og_image_url
                  )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .then(({ data }) => {
                  if (data) {
                    const mapped = data
                      .filter((item: any) => item.products !== null)
                      .map((item: any) => ({
                        id: item.products.id,
                        title: item.products.title,
                        slug: item.products.slug,
                        price: Number(item.products.price),
                        salePrice: item.products.sale_price ? Number(item.products.sale_price) : undefined,
                        primaryImage: item.products.og_image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                      }));
                    setWishlistItems(mapped);
                  }
                  setWishlistLoading(false);
                });
            }
          });
        }
      } catch (err) {
        console.error("Failed to sync guest wishlist:", err);
      }
    }
  }, [user, supabase, activeTab]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) {
      try {
        const stored = localStorage.getItem("nanweb_guest_wishlist");
        let list: string[] = stored ? JSON.parse(stored) : [];
        list = list.filter(id => id !== productId);
        localStorage.setItem("nanweb_guest_wishlist", JSON.stringify(list));
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        addToast({ title: "Removed from Wishlist", type: "success" });
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      addToast({ title: "Removed from Wishlist", type: "success" });
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
    }
  };

  // Load orders when tab is active
  React.useEffect(() => {
    if (user && activeTab === "orders" && orders.length === 0) {
      setOrdersLoading(true);
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setOrders((data as Order[]) || []);
          setOrdersLoading(false);
        });
    }
  }, [user, activeTab, supabase, orders.length]);

  // Load addresses when tab is active
  React.useEffect(() => {
    if (user && activeTab === "addresses" && addresses.length === 0) {
      fetchAddresses();
    }
  }, [user, activeTab, fetchAddresses, addresses.length]);

  // Pre-fill settings
  React.useEffect(() => {
    if (profile) {
      setSettingsName(profile.full_name || "");
      setSettingsPhone(profile.phone || "");
    }
  }, [profile]);

  // Load current password from local cache
  React.useEffect(() => {
    if (user) {
      const saved = localStorage.getItem("current_user_password");
      if (saved) {
        setCurrentPassword(saved);
      } else {
        setCurrentPassword("");
      }
    } else {
      setCurrentPassword("");
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isLoginView) {
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error);
      } else {
        localStorage.setItem("current_user_password", password);
      }
    } else {
      const fullName = formData.get("fullName") as string;
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setAuthError(error);
      } else {
        localStorage.setItem("current_user_password", password);
        setAuthError("");
        setIsLoginView(true);
      }
    }
    setAuthLoading(false);
  };

  const handleResetPassword = async () => {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;
    if (!email) {
      setAuthError("Please enter your email address first.");
      return;
    }
    const { error } = await resetPassword(email);
    if (error) {
      setAuthError(error);
    } else {
      setResetSent(true);
      setAuthError("");
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    setSettingsMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: settingsName, phone: settingsPhone })
      .eq("id", user.id);

    if (error) {
      setSettingsMessage(`Error: ${error.message}`);
    } else {
      setSettingsMessage("Profile updated successfully!");
      await refreshProfile();
    }
    setSavingSettings(false);
    setTimeout(() => setSettingsMessage(""), 3000);
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setPasswordMessage("Error: New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Error: Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage("Error: Password must be at least 6 characters.");
      return;
    }

    setChangingPassword(true);
    setPasswordMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) throw error;
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPasswordMessage(`Error: ${err.message}`);
    } finally {
      setChangingPassword(false);
      setTimeout(() => setPasswordMessage(""), 5050);
    }
  };

  const handleCancelOrderClick = (id: string) => {
    setCancellingOrderId(id);
  };

  const handleConfirmOrderCancel = async () => {
    if (!cancellingOrderId) return;
    setCancellingOrder(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ fulfillment_status: "cancelled" })
        .eq("id", cancellingOrderId);

      if (error) throw error;
      
      addToast({ 
        title: "Order Cancelled", 
        description: "Your order has been cancelled successfully.", 
        type: "success" 
      });

      // Update local orders list state
      setOrders(prev => prev.map(o => o.id === cancellingOrderId ? { ...o, fulfillment_status: "cancelled" } : o));
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Cancellation failed", description: err.message, type: "error" });
    } finally {
      setCancellingOrder(false);
      setCancellingOrderId(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700";
      case "shipped":
        return "bg-blue-50 text-blue-700";
      case "processing":
        return "bg-amber-50 text-amber-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-[#6B6B6B]";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Not logged in — show auth form if not viewing guest wishlist
  if (!user && activeTab !== "wishlist") {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm space-y-6"
        >
          <div className="text-center space-y-2 mb-4">
            <p className="text-caption text-[#9CA3AF]">Account access</p>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              {isLoginView ? "Sign In" : "Register"}
            </h1>
          </div>

          <form className="space-y-5" onSubmit={handleAuthSubmit}>
            {authError && (
              <div className="bg-red-50 text-red-650 p-3 rounded-lg text-xs font-semibold uppercase tracking-wider border border-red-100">
                {authError}
              </div>
            )}
            {resetSent && (
              <div className="bg-green-50 text-green-750 p-3 rounded-lg text-xs font-semibold uppercase tracking-wider border border-green-100">
                Reset code dispatched. Please check inbox.
              </div>
            )}

            {!isLoginView && <Input label="Full Name" name="fullName" required />}
            <Input label="Email address" name="email" type="email" required />
            <Input label="Password" name="password" type="password" required />

            <Button type="submit" className="w-full h-12 text-xs font-bold uppercase tracking-wider shimmer-btn" disabled={authLoading}>
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : isLoginView ? (
                "SIGN IN"
              ) : (
                "REGISTER"
              )}
            </Button>

            {isLoginView && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-xs font-bold text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={handleResetPassword}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-[rgba(0,0,0,0.06)] text-center space-y-3">
              <p className="text-xs font-medium text-[#9CA3AF]">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-xs font-bold uppercase tracking-wider"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setAuthError("");
                  setResetSent(false);
                }}
              >
                {isLoginView ? "Create Account" : "Sign In"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabItems = user ? [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "orders", label: "Order History", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ] : [
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-12">
      <div className="mb-12 border-b border-[rgba(0,0,0,0.06)] pb-8">
        <p className="text-caption text-[#9CA3AF] mb-1">Customer area</p>
        <h1 className="font-serif text-4xl text-[#1A1A1A] font-bold">My Account</h1>
        <p className="text-sm text-[#6B6B6B] mt-2">
          Welcome back, <span className="font-semibold text-[#1A1A1A]">{profile?.full_name || user?.email || "Guest"}</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white p-4 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
          <nav className="flex flex-col space-y-0.5">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-[#FAFAFA] text-[#1A1A1A]"
                      : "text-[#6B6B6B] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="account-nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#1A1A1A] rounded-r-full"
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="border-t border-[rgba(0,0,0,0.06)] mt-4 pt-4">
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-destructive hover:bg-red-50 text-left transition-colors cursor-pointer w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#FAFAFA] text-left transition-colors cursor-pointer w-full"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Dashboard Overview</h2>
                  <p className="text-xs text-[#9CA3AF]">Summary details of your client account settings</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[rgba(0,0,0,0.06)] p-6 bg-[#FAFAFA] flex flex-col justify-between h-44">
                    <div>
                      <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Recent Orders</h3>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        Verify order fulfillments, download billing details, and retrieve shipping credentials.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-xs uppercase tracking-wider font-bold w-fit mt-4"
                      onClick={() => setActiveTab("orders")}
                    >
                      View Orders <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="rounded-xl border border-[rgba(0,0,0,0.06)] p-6 bg-[#FAFAFA] flex flex-col justify-between h-44">
                    <div>
                      <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Profile Details</h3>
                      <p className="text-xs font-semibold text-[#1A1A1A]">{profile?.full_name || "Guest"}</p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{user?.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-xs uppercase tracking-wider font-bold w-fit mt-4"
                      onClick={() => setActiveTab("settings")}
                    >
                      Edit Profile <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-6">
                  <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Order History</h2>
                  <p className="text-xs text-[#9CA3AF]">Verify processing status for your purchases</p>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="h-10 w-10 mx-auto text-[#C4C4C4] mb-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-6">
                      No orders recorded yet.
                    </p>
                    <Link href="/products">
                      <Button className="text-xs uppercase tracking-wider font-bold">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
                    <table className="w-full text-left text-xs font-semibold uppercase tracking-wider">
                      <thead className="bg-[#FAFAFA] border-b border-[rgba(0,0,0,0.06)]">
                        <tr>
                          <th className="px-6 py-4 text-[#9CA3AF]">Order</th>
                          <th className="px-6 py-4 text-[#9CA3AF]">Date</th>
                          <th className="px-6 py-4 text-[#9CA3AF]">Status</th>
                          <th className="px-6 py-4 text-[#9CA3AF]">Total</th>
                          <th className="px-6 py-4 text-[#9CA3AF] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(0,0,0,0.04)] text-[#1A1A1A]">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                            <td className="px-6 py-4 font-bold lowercase">{order.order_number}</td>
                            <td className="px-6 py-4 text-[#6B6B6B]">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusColor(order.fulfillment_status)}`}>
                                {order.fulfillment_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold">{formatCurrency(order.total)}</td>
                            <td className="px-6 py-4 text-right">
                              {order.fulfillment_status !== "delivered" && order.fulfillment_status !== "cancelled" && (
                                <button
                                  onClick={() => handleCancelOrderClick(order.id)}
                                  className="text-red-650 hover:text-red-700 p-1.5 cursor-pointer transition-colors inline-flex items-center justify-center rounded-lg hover:bg-red-50"
                                  title="Cancel Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Wishlist</h2>
                    <p className="text-xs text-[#9CA3AF]">Items you marked as favorites</p>
                  </div>
                </div>

                {wishlistLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="h-10 w-10 mx-auto text-[#C4C4C4] mb-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-6">
                      Your wishlist is empty.
                    </p>
                    <Link href="/products">
                      <Button className="text-xs uppercase tracking-wider font-bold">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((product) => (
                      <div key={product.id} className="relative group">
                        <ProductCard
                          id={product.id}
                          title={product.title}
                          slug={product.slug}
                          price={product.price}
                          salePrice={product.salePrice}
                          primaryImage={product.primaryImage}
                        />
                        <button
                          onClick={() => handleRemoveFromWishlist(product.id)}
                          className="absolute top-3 right-3 z-35 p-2.5 rounded-full bg-white text-red-500 hover:text-red-700 shadow-md cursor-pointer transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "addresses" && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Saved Addresses</h2>
                    <p className="text-xs text-[#9CA3AF]">Manage shipping profiles for faster checkouts</p>
                  </div>
                  <Button onClick={handleOpenAddAddress} size="sm" className="text-xs uppercase tracking-wider font-bold">
                    Add Address
                  </Button>
                </div>

                {addressesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-16">
                    <MapPin className="h-10 w-10 mx-auto text-[#C4C4C4] mb-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-6">
                      No saved addresses yet. Add one during checkout.
                    </p>
                    <Button onClick={handleOpenAddAddress} size="sm" className="text-xs uppercase tracking-wider font-bold">
                      Add New Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="rounded-xl border border-[rgba(0,0,0,0.06)] p-6 bg-[#FAFAFA] relative shadow-sm flex flex-col justify-between min-h-[180px]">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">{addr.full_name}</p>
                            {addr.is_default && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A] bg-neutral-200 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                            {addr.address_line1}
                            {addr.address_line2 && `, ${addr.address_line2}`}
                          </p>
                          <p className="text-xs text-[#6B6B6B] leading-relaxed">
                            {addr.city}, {addr.state} {addr.zip}
                          </p>
                          <p className="text-xs text-[#6B6B6B] leading-relaxed">
                            {addr.country}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                          {addr.phone ? (
                            <p className="text-[10px] font-bold text-[#1A1A1A]">
                              Tel: {addr.phone}
                            </p>
                          ) : <div />}
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingAddrId(addr.id)}
                              className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md space-y-6"
              >
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Profile Settings</h2>
                  <p className="text-xs text-[#9CA3AF]">Modify account descriptors and contact parameters</p>
                </div>

                {settingsMessage && (
                  <div className={`p-3 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
                    settingsMessage.startsWith("Error")
                      ? "bg-red-50 text-red-605 border-red-100"
                      : "bg-green-50 text-green-750 border-green-100"
                  }`}>
                    {settingsMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                  />
                  <Input
                    label="Phone"
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                  />
                </div>

                <Button
                  className="mt-6 text-xs font-bold uppercase tracking-wider shimmer-btn"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      SAVING...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>

                {/* Password Management Section */}
                <div className="border-t border-[rgba(0,0,0,0.06)] pt-8 mt-8 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Change Password</h2>
                    <p className="text-xs text-[#9CA3AF]">Update your account security parameters</p>
                  </div>
                  
                  {passwordMessage && (
                    <div className={`p-3 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
                      passwordMessage.startsWith("Error")
                        ? "bg-red-50 text-red-650 border-red-105"
                        : "bg-green-50 text-green-750 border-green-105"
                    }`}>
                      {passwordMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      {!currentPassword && (
                        <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mt-1 px-0.5">
                          Log out and log back in once to cache and view your password here.
                        </p>
                      )}
                    </div>
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    className="text-xs font-bold uppercase tracking-wider shimmer-btn"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        UPDATING...
                      </span>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="md"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <Input
            label="Full Name"
            value={addrForm.fullName}
            onChange={(e) => setAddrForm(prev => ({ ...prev, fullName: e.target.value }))}
            required
          />
          <Input
            label="Phone Number"
            value={addrForm.phone}
            onChange={(e) => setAddrForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="e.g. +91 99999 99999"
          />
          <Input
            label="Address Line 1"
            value={addrForm.addressLine1}
            onChange={(e) => setAddrForm(prev => ({ ...prev, addressLine1: e.target.value }))}
            required
          />
          <Input
            label="Address Line 2 (Optional)"
            value={addrForm.addressLine2}
            onChange={(e) => setAddrForm(prev => ({ ...prev, addressLine2: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={addrForm.city}
              onChange={(e) => setAddrForm(prev => ({ ...prev, city: e.target.value }))}
              required
            />
            <Input
              label="State / Province"
              value={addrForm.state}
              onChange={(e) => setAddrForm(prev => ({ ...prev, state: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ZIP / Postal Code"
              value={addrForm.zip}
              onChange={(e) => setAddrForm(prev => ({ ...prev, zip: e.target.value }))}
            />
            <Input
              label="Country"
              value={addrForm.country}
              onChange={(e) => setAddrForm(prev => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>

          <label className="flex items-center gap-2.5 py-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addrForm.isDefault}
              onChange={(e) => setAddrForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-[rgba(0,0,0,0.15)] text-accent focus:ring-accent"
            />
            <span className="text-xs font-semibold text-[#6B6B6B]">Set as default delivery address</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(0,0,0,0.06)]">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="text-xs uppercase tracking-wider font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addressLoading}
              className="text-xs uppercase tracking-wider font-bold shimmer-btn"
            >
              {addressLoading ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Address Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deletingAddrId !== null}
        onClose={() => setDeletingAddrId(null)}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this shipping address? This cannot be undone."
        confirmLabel="Delete"
        isLoading={addressLoading}
        variant="danger"
      />

      {/* Order Cancellation Modal */}
      <ConfirmationModal
        isOpen={cancellingOrderId !== null}
        onClose={() => setCancellingOrderId(null)}
        onConfirm={handleConfirmOrderCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action will halt fulfillment and trigger payment refunds."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        isLoading={cancellingOrder}
        variant="danger"
      />
    </div>
  );
}

export default function AccountPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A1A1A] mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading profile...</p>
      </div>
    }>
      <AccountPageContent />
    </React.Suspense>
  );
}
