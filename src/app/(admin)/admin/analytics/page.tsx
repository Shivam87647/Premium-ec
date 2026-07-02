"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, TrendingUp, DollarSign, ShoppingBag, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatCurrency } from "@/lib/utils";

const mockRevenueData = [
  { date: "Jun 23", revenue: 45000, orders: 120 },
  { date: "Jun 24", revenue: 52000, orders: 145 },
  { date: "Jun 25", revenue: 49000, orders: 130 },
  { date: "Jun 26", revenue: 63000, orders: 180 },
  { date: "Jun 27", revenue: 58000, orders: 165 },
  { date: "Jun 28", revenue: 71000, orders: 210 },
  { date: "Jun 29", revenue: 67000, orders: 195 },
];

const mockProductData = [
  { name: "Organic Cotton T-Shirt", units: 450, revenue: 15750 },
  { name: "Everyday Denim Jacket", units: 310, revenue: 38750 },
  { name: "Classic Leather Sneakers", units: 280, revenue: 42000 },
  { name: "Minimalist Watch", units: 190, revenue: 37050 },
];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalRevenue: 456000,
    totalOrders: 1145,
    aov: 398,
    conversionRate: 2.4,
  });

  const [revenueData, setRevenueData] = React.useState(mockRevenueData);
  const [productData, setProductData] = React.useState(mockProductData);

  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function fetchAnalytics() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
          setLoading(false);
          return;
        }

        const { data: orders, error } = await supabase
          .from("orders")
          .select("total, payment_status, created_at")
          .eq("payment_status", "paid");

        if (error) throw error;

        if (orders && orders.length > 0) {
          const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
          const totalOrders = orders.length;
          const aov = totalRevenue / totalOrders;

          setStats({
            totalRevenue,
            totalOrders,
            aov,
            conversionRate: 2.8,
          });

          const dailyMap: Record<string, { revenue: number; orders: number }> = {};
          orders.forEach((o) => {
            const dateStr = new Date(o.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            if (!dailyMap[dateStr]) {
              dailyMap[dateStr] = { revenue: 0, orders: 0 };
            }
            dailyMap[dateStr].revenue += Number(o.total);
            dailyMap[dateStr].orders += 1;
          });

          const chartData = Object.keys(dailyMap).map((date) => ({
            date,
            revenue: dailyMap[date].revenue,
            orders: dailyMap[date].orders,
          })).slice(-7);

          setRevenueData(chartData);
        }
      } catch (err) {
        console.error("Failed to compile analytics aggregates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading performance statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Analytics</h2>
        <p className="text-sm text-[#6B6B6B] mt-1">Review operational KPIs, revenue graphs, and product transaction distributions.</p>
      </div>

      {/* Analytics KPIs grids */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="card-base p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-bold text-[#1A1A1A] mt-0.5">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="card-base p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-bold text-[#1A1A1A] mt-0.5">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="card-base p-6 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Avg Order Value</p>
            <p className="text-xl font-bold text-[#1A1A1A] mt-0.5">{formatCurrency(stats.aov)}</p>
          </div>
        </div>

        <div className="card-base p-6 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Conversion Rate</p>
            <p className="text-xl font-bold text-[#1A1A1A] mt-0.5">{stats.conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* Revenue area chart */}
      <div className="card-base p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#1A1A1A]">Revenue Performance</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Sales trends over active timelines</p>
        </div>
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                dx={-8}
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
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Bar chart */}
        <div className="card-base p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">Top Selling Products</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">By unit sales volume</p>
          </div>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [value, "Units Sold"]} 
                />
                <Bar dataKey="units" fill="#1A1A1A" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order count daily line chart */}
        <div className="card-base p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">Order Volume</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Fulfillment count aggregates</p>
          </div>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [value, "Orders"]} 
                />
                <Area type="monotone" dataKey="orders" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
