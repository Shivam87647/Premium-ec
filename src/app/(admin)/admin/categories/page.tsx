"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Plus, Trash2, Edit2, Folder, FolderOpen, Loader2, Save, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Edit / Create States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    parent_id: "",
  });

  const supabase = React.useMemo(() => createClient(), []);

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load categories", description: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, addToast]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !editingCategory) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      parent_id: category.parent_id || "",
    });
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      parent_id: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || slugify(formData.name),
        description: formData.description || null,
        image_url: formData.image_url || null,
        parent_id: formData.parent_id || null,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);
        if (error) throw error;
        addToast({ title: "Category Updated", description: "Category details updated successfully.", type: "success" });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([payload]);
        if (error) throw error;
        addToast({ title: "Category Created", description: "New category created successfully.", type: "success" });
      }

      setIsModalOpen(false);
      fetchCategories();
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
      const { error } = await supabase.from("categories").delete().eq("id", deletingId);
      if (error) throw error;
      addToast({ title: "Category Deleted", description: "Category deleted successfully.", type: "success" });
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Delete Failed", description: err.message, type: "error" });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Build Hierarchy Tree
  const getNestedTree = (parentId: string | null = null, depth = 0): any[] => {
    return categories
      .filter((c) => c.parent_id === parentId)
      .map((c) => ({
        ...c,
        depth,
        children: getNestedTree(c.id, depth + 1),
      }));
  };

  const categoryTree = getNestedTree(null);

  const renderCategoryRow = (node: any) => (
    <React.Fragment key={node.id}>
      <tr className="hover:bg-[#FAFAFA] transition-colors border-b border-[rgba(0,0,0,0.04)] group">
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: `${node.depth * 20}px` }}>
            {node.children.length > 0 ? (
              <FolderOpen className="w-4 h-4 text-accent mr-2.5 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-[#9CA3AF] mr-2.5 flex-shrink-0" />
            )}
            <span className="font-semibold text-[#1A1A1A] text-[13px]">{node.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">{node.slug}</td>
        <td className="px-6 py-4 text-xs text-[#6B6B6B] max-w-xs truncate">{node.description || "—"}</td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-all cursor-pointer"
              onClick={() => handleEdit(node)}
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-destructive hover:bg-red-50 transition-all cursor-pointer"
              onClick={() => handleDelete(node.id)}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {node.children.map((child: any) => renderCategoryRow(child))}
    </React.Fragment>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Categories</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">Manage structural classifying taxonomies and hierarchies.</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider shimmer-btn">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading taxonomies...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-[#6B6B6B] p-8">
          <Folder className="w-12 h-12 mx-auto text-[#E5E7EB] mb-4" />
          <h3 className="text-base font-bold text-[#1A1A1A] mb-2">No Categories Created</h3>
          <p className="text-sm text-[#6B6B6B] max-w-xs mx-auto mb-6">Create structural categories to group and catalog your products.</p>
          <Button onClick={handleCreateNew} className="text-xs uppercase tracking-wider font-bold">Add First Category</Button>
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFAFA] border-b border-[rgba(0,0,0,0.06)]">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Name</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Slug</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Description</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
              {categoryTree.map((root) => renderCategoryRow(root))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? "Edit Category" : "Create Category"}>
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <Input label="Category Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Slug (URL Path)" name="slug" value={formData.slug} onChange={handleChange} required />
          
          <div className="relative">
            <select
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="peer w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm focus:border-[#1A1A1A] focus:outline-none text-[#1A1A1A] h-[46px]"
            >
              <option value="">None (Root Category)</option>
              {categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <label className="absolute left-3.5 -top-2 bg-white px-1 text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">Parent Category</label>
          </div>

          <Input label="Image URL" name="image_url" value={formData.image_url} onChange={handleChange} />
          
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Short taxonomic metadata description..."
              className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[rgba(0,0,0,0.06)] pt-5">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs uppercase tracking-wider">Cancel</Button>
            <Button type="submit" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn">
              <Save className="w-3.5 h-3.5" />
              <span>Save Category</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Any child subcategories or associated product references will be affected."
        isLoading={isDeleting}
      />
    </div>
  );
}
