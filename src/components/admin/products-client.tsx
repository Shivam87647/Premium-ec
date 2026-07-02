"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, Package, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { deleteProduct } from "@/app/(admin)/admin/products/actions";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function AdminProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [search, setSearch] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredProducts = initialProducts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteProduct(deletingId);
      if (res.error) {
        addToast({ title: "Error", description: res.error, type: "error" });
      } else {
        addToast({ title: "Product deleted", type: "success" });
      }
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Products</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {initialProducts.length} {initialProducts.length === 1 ? "product" : "products"} in catalog
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Table Card */}
      <div className="card-base overflow-hidden">
        {/* Search Bar */}
        <div className="border-b border-[rgba(0,0,0,0.06)] px-6 py-4 bg-[#FAFAFA]">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#C4C4C4] focus:border-[#1A1A1A] focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white border-b border-[rgba(0,0,0,0.04)]">
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Product</th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Price</th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Stock</th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Status</th>
                <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#FAFAFA] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-[#F5F5F0] flex-shrink-0 border border-[rgba(0,0,0,0.04)]">
                          {product.og_image_url ? (
                            <img src={product.og_image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#C4C4C4]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A1A1A] text-[13px] truncate">{product.title}</p>
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5">{product.sku || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-[#1A1A1A] text-[13px]">
                          ₹{Number(product.price).toLocaleString()}
                        </span>
                        {product.sale_price && (
                          <span className="ml-2 text-[11px] text-destructive font-medium">
                            Sale: ₹{Number(product.sale_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[13px] font-medium ${
                        product.stock_quantity < 10 ? "text-amber-600" : "text-[#6B6B6B]"
                      }`}>
                        {product.track_inventory ? product.stock_quantity : "∞"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        product.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-[#F5F5F0] text-[#6B6B6B]"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-all cursor-pointer"
                          title="Edit"
                          onClick={() => openEditModal(product)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-[#9CA3AF] hover:text-destructive hover:bg-red-50 transition-all cursor-pointer"
                          title="Delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Package className="w-10 h-10 mx-auto text-[#E5E7EB] mb-3" />
                    <p className="text-sm font-medium text-[#9CA3AF]">No products found</p>
                    <p className="text-xs text-[#C4C4C4] mt-1">Add a product to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Create/Edit Modal */}
      {isModalOpen && (
        <ProductFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          product={editingProduct}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and will permanently remove the item from the catalog."
        isLoading={isDeleting}
      />
    </div>
  );
}
