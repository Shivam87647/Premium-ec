# 🛍️ PREMIUM. — World-Class E-Commerce Storefront & Admin Portal

**PREMIUM.** is an enterprise-grade, high-end e-commerce platform built with Next.js, React, Tailwind CSS, Framer Motion, and Supabase. Inspired by modern design aesthetics (like Stripe, Vercel, and Linear), it features premium typography, seamless micro-animations, fluid layouts, and absolute mobile responsiveness.

---

## 🌟 Core Features

### 🛒 Storefront Experience
*   **Dynamic Landing Catalog**: Fluid layouts featuring new arrivals, best sellers, and dynamic search filters.
*   **Intuitive Filter Drawer**: Custom Category, Price, Color, and Size filters that transform into a slide-over modal drawer on mobile viewports.
*   **Premium Product Details**: Responsive image galleries with hover-zoom, collapsible specifications accordions, dynamic customer reviews, and a robust cart engine.
*   **Unified Cart & Synced Prices**: Real-time mounting synchronization with database active sale pricing.
*   **Secure Checkout Sequence**: Form progress tracker, shipping validation, live promo code coupon application, and integrated Razorpay payment gateway (supporting Cash on Delivery & local mock checkouts).
*   **My Account Dashboard**: Interactive panels showcasing order history (styled as mobile-responsive cards), wishlist items, saved shipping addresses, and account credentials settings.

### 🛠️ Administrative Control Center
*   **Interactive Insights & Analytics**: Real-time sales, order counts, customer registers, and average cart calculations.
*   **Product & Category Managers**: Full CRUD controls with custom variant listings, media image select modals, and tag metadata updates.
*   **Order Tracker**: Detailed search indexing, timeline trackers, and fulfillment updates.
*   **Reviews & Coupon Controllers**: Visual approval lists for reviews and usage controllers for promo codes.
*   **Responsive Admin Layout**: Features an animated mobile navigation drawer and slide-out hamburger sidebars.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: Next.js 16 (App Router, Turbopack) & React 19
*   **State & Animations**: React Context API & Framer Motion
*   **Styling**: Tailwind CSS (Harmonious slate/dark-mode palette, Inter/serif fonts)
*   **Icons**: Lucide React
*   **Backend & Security**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
*   **Payment Gateway**: Razorpay API Integration

---

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18.x or later) installed.

### 2. Environment Setup
Create a `.env.local` file in the root directory and configure the following credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY=your_razorpay_key
```

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Database Migrations
Database schemas, triggers, indexes, and initial data seeds are stored in `supabase/migrations/`:
*   `0000_schema.sql`: Sets up core Postgres tables (profiles, products, orders, reviews, addresses, etc.) and Row-Level Security (RLS) policies.
*   `0004_indexes.sql`: Adds performance indexes on foreign key and query lookup columns to optimize load speeds.
