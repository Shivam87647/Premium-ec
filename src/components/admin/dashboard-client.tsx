"use client";

import * as React from "react";
import { 
  AreaChart,
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, AlertTriangle, ArrowUpRight, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function AnimatedNumber({ value, prefix = "" }: { value: string; prefix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}{value}
    </motion.span>
  );
}

export function DashboardClient({
  kpis,
  revenueData,
  topProductsData,
  recentOrders,
  lowStockProducts = []
}: {
  kpis: any[];
  revenueData: any[];
  topProductsData: any[];
  recentOrders: any[];
  lowStockProducts?: any[];
}) {
  const iconMap: Record<string, any> = {
    DollarSign: DollarSign,
    ShoppingBag: ShoppingBag,
    Users: Users,
    TrendingUp: TrendingUp,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">
          Dashboard
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Overview of your store's performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = iconMap[kpi.icon] || TrendingUp;
          const isPositive = kpi.change && !kpi.change.startsWith("-");
          
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="card-base p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                  {kpi.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#F5F5F0] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#6B6B6B]" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
                  <AnimatedNumber value={kpi.value} />
                </p>
                {kpi.change && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
                    isPositive 
                      ? "text-success bg-green-50" 
                      : "text-destructive bg-red-50"
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {kpi.change}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="card-base p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Revenue Trend</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Last 30 days</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                  dx={-10} 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#2563EB" 
                  strokeWidth={2} 
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card-base p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#1A1A1A]">Top Products</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">By revenue</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B6B6B', fontSize: 11 }} 
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="sales" fill="#1A1A1A" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="card-base overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Recent Orders</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Latest transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-blue-700 transition-colors"
            >
              View All
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFAFA]">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Order</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Customer</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Status</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
                {recentOrders.length > 0 ? recentOrders.map((order: any) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-50 text-amber-700",
                    confirmed: "bg-blue-50 text-blue-700",
                    processing: "bg-blue-50 text-blue-700",
                    shipped: "bg-indigo-50 text-indigo-700",
                    delivered: "bg-green-50 text-green-700",
                    cancelled: "bg-red-50 text-red-700",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-3.5 font-medium text-[#1A1A1A] text-xs">
                        {order.order_number || `#${order.id?.slice(0, 8)}`}
                      </td>
                      <td className="px-6 py-3.5 text-[#6B6B6B] text-xs">
                        {order.email || "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          statusColors[order.fulfillment_status] || "bg-gray-50 text-gray-600"
                        }`}>
                          {order.fulfillment_status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[#1A1A1A] text-xs">
                        ₹{Number(order.total || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#9CA3AF] text-sm">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Low Stock</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Items below 10 units</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product: any) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFA] border border-[rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                    {product.og_image_url ? (
                      <img src={product.og_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#C4C4C4]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#1A1A1A] truncate">{product.title}</p>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  {product.stock_quantity} left
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-[#9CA3AF] text-sm">
                All products well stocked
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
