"use client";

import * as React from "react";
import { CartDrawer } from "./cart-drawer";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

// Track coordinates of last mouse click globally
let lastClickX = 0;
let lastClickY = 0;

if (typeof window !== "undefined") {
  window.addEventListener("click", (e) => {
    lastClickX = e.clientX;
    lastClickY = e.clientY;
  }, { passive: true });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from local storage", e);
      }
    }
  }, []);

  // Save to localStorage when items change
  React.useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const openCart = React.useCallback(() => setIsCartOpen(true), []);
  const closeCart = React.useCallback(() => setIsCartOpen(false), []);

  const addItem = React.useCallback((item: CartItem) => {
    // 1. Add to state
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });

    // 2. Perform flying bezier animation
    if (typeof window !== "undefined") {
      const cartIcon = document.getElementById("cart-icon-trigger");
      if (cartIcon && lastClickX > 0 && lastClickY > 0) {
        const cartRect = cartIcon.getBoundingClientRect();
        
        const flyImg = document.createElement("div");
        flyImg.style.position = "fixed";
        flyImg.style.left = `${lastClickX}px`;
        flyImg.style.top = `${lastClickY}px`;
        flyImg.style.width = "50px";
        flyImg.style.height = "50px";
        flyImg.style.backgroundImage = `url(${item.image})`;
        flyImg.style.backgroundSize = "cover";
        flyImg.style.backgroundPosition = "center";
        flyImg.style.borderRadius = "50%";
        flyImg.style.zIndex = "10000";
        flyImg.style.pointerEvents = "none";
        flyImg.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
        flyImg.style.transition = "all 0.7s cubic-bezier(0.25, 1, 0.5, 1)";
        flyImg.style.transform = "translate(-50%, -50%) scale(1)";

        document.body.appendChild(flyImg);
        
        // Force reflow
        flyImg.offsetWidth;

        flyImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
        flyImg.style.transform = "translate(-50%, -50%) scale(0.15) rotate(15deg)";
        flyImg.style.opacity = "0.2";

        setTimeout(() => {
          flyImg.remove();
          
          // Bounce animation class trigger on header cart trigger
          cartIcon.classList.add("scale-110", "rotate-3");
          setTimeout(() => {
            cartIcon.classList.remove("scale-110", "rotate-3");
          }, 200);
        }, 700);
      }
    }

    // Open Cart Drawer
    setIsCartOpen(true);
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = React.useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newQuantity = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    );
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
