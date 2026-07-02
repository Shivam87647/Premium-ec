"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { saveProduct } from "@/app/(admin)/admin/products/actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, UploadCloud, Trash2, Plus, Edit2 } from "lucide-react";
import { slugify, parseProductDescription, serializeProductDescription } from "@/lib/utils";

export function ProductFormModal({ 
  isOpen, 
  onClose, 
  product 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  product?: any; 
}) {
  const { addToast } = useToast();
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [trackInventory, setTrackInventory] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Categories Dropdown state
  const [categories, setCategories] = React.useState<any[]>([]);
  const supabase = React.useMemo(() => createClient(), []);
  
  // Image Upload State
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [inputUrl, setInputUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [deleteImageIndex, setDeleteImageIndex] = React.useState<number | null>(null);

  // Highlights State
  const [highlights, setHighlights] = React.useState<string[]>([]);
  const [newHighlight, setNewHighlight] = React.useState("");

  // Specifications State
  const [specifications, setSpecifications] = React.useState<Record<string, string>>({});
  const [newSpecKey, setNewSpecKey] = React.useState("");
  const [newSpecValue, setNewSpecValue] = React.useState("");

  // Global Suggestions state
  const [globalHighlights, setGlobalHighlights] = React.useState<string[]>([]);
  const [globalSpecKeys, setGlobalSpecKeys] = React.useState<string[]>([]);

  // Category Selected State
  const [categoryId, setCategoryId] = React.useState("");

  React.useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setSlug(product.slug || "");
      setTrackInventory(product.track_inventory ?? true);
      setCategoryId(product.category_id || "");

      // Parse metadata from description
      const parsed = parseProductDescription(product.description);
      const initialHighlights = parsed.highlights && parsed.highlights.length > 0 ? parsed.highlights : [
        "Premium Craftsmanship & Detailing",
        "Sustainably Sourced Luxury Fabric",
        "Tailored Fit for Versatile Styling",
        "Limited Run & Exclusive Edition"
      ];
      setHighlights(initialHighlights);

      const initialSpecs = parsed.specifications && Object.keys(parsed.specifications).length > 0 ? parsed.specifications : {
        "Composition": "100% Certified Organic Cotton",
        "Weight": "Mid-weight (200 GSM)",
        "Origin": "Ethically Tailored in Portugal",
        "Care": "Cold wash with like colors, air dry"
      };
      setSpecifications(initialSpecs);

      // Fetch images
      if (product.id) {
        async function fetchProductImages() {
          const { data } = await supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", product.id)
            .order("sort_order", { ascending: true });
          
          if (data && data.length > 0) {
            setImageUrls(data.map(img => img.image_url));
          } else if (product.og_image_url) {
            setImageUrls([product.og_image_url]);
          } else {
            setImageUrls([]);
          }
        }
        fetchProductImages();
      } else {
        setImageUrls(product.og_image_url ? [product.og_image_url] : []);
      }
    } else {
      setTitle("");
      setSlug("");
      setTrackInventory(true);
      setCategoryId("");
      setImageUrls([]);
      setHighlights([]);
      setSpecifications({});
    }
  }, [product, supabase]);

  React.useEffect(() => {
    async function fetchGlobalSuggestions() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("description");
        if (error) throw error;
        
        const highlightsSet = new Set<string>();
        const specKeysSet = new Set<string>();
        
        data?.forEach((p: any) => {
          if (p.description) {
            const parsed = parseProductDescription(p.description);
            parsed.highlights?.forEach((h: string) => {
              if (h.trim()) highlightsSet.add(h.trim());
            });
            Object.keys(parsed.specifications || {}).forEach((k: string) => {
              if (k.trim()) specKeysSet.add(k.trim());
            });
          }
        });
        
        setGlobalHighlights(Array.from(highlightsSet));
        setGlobalSpecKeys(Array.from(specKeysSet));
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    }
    fetchGlobalSuggestions();
  }, [supabase]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        newUrls.push(publicUrl);
      }

      setImageUrls(prev => [...prev, ...newUrls]);
      addToast({ title: "Images Uploaded", description: `Successfully uploaded ${files.length} image(s).`, type: "success" });
    } catch (err: any) {
      console.error("Upload error:", err);
      addToast({ title: "Upload Failed", description: err.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrlImage = () => {
    if (!inputUrl.trim()) return;
    setImageUrls(prev => [...prev, inputUrl.trim()]);
    setInputUrl("");
    addToast({ title: "Image URL Added", type: "success" });
  };

  const handleRemoveImage = (index: number) => {
    setDeleteImageIndex(index);
  };

  const handleConfirmDeleteImage = () => {
    if (deleteImageIndex !== null) {
      setImageUrls(prev => prev.filter((_, idx) => idx !== deleteImageIndex));
      addToast({ title: "Image Removed", type: "success" });
      setDeleteImageIndex(null);
    }
  };

  React.useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });
      setCategories(data || []);
    }
    fetchCategories();
  }, [supabase]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!product) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    if (product?.id) {
      formData.append("id", product.id);
    }
    formData.append("track_inventory", String(trackInventory));

    // Serialize highlights and specifications into product description
    const rawDesc = String(formData.get("description") || "");
    const serializedDesc = serializeProductDescription(rawDesc, highlights, specifications);
    formData.set("description", serializedDesc);

    const res = await saveProduct(formData);
    
    if (res.error) {
      addToast({ title: res.error, type: "error" });
    } else {
      addToast({ title: product ? "Product updated successfully!" : "Product added successfully!", type: "success" });
      onClose();
    }
    
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Create Product"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide py-2">
        
        {/* Section 1: Basic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[rgba(0,0,0,0.06)] pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Product Title" 
              name="title" 
              value={title}
              onChange={handleTitleChange}
              required 
            />
            <Input 
              label="Slug (URL Path)" 
              name="slug" 
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Product Description</label>
            <textarea 
              name="description" 
              rows={4} 
              defaultValue={product ? parseProductDescription(product.description).html : ""}
              placeholder="Detailed description of the product highlights..."
              className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] resize-none transition-colors"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Categorization */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[rgba(0,0,0,0.06)] pb-2">
            Pricing & Catalog
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Price (INR)" 
              name="price" 
              type="number" 
              step="any" 
              defaultValue={product?.price || ""} 
              required 
            />
            <Input 
              label="Sale Price (INR, Optional)" 
              name="sale_price" 
              type="number" 
              step="any" 
              defaultValue={product?.sale_price || ""} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="SKU Code" 
              name="sku" 
              defaultValue={product?.sku || ""} 
            />
            <div className="relative">
              <select 
                name="category_id" 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="peer w-full rounded-lg border border-[rgba(0,0,0,0.08)] px-4 py-3 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white h-[46px] mt-1 text-[#1A1A1A]"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="absolute left-3.5 -top-2 bg-white px-1 text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">Category</label>
            </div>
          </div>
        </div>

        {/* Section 3: Inventory & Management */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[rgba(0,0,0,0.06)] pb-2">
            Inventory & Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <Input 
                label="Stock Quantity" 
                name="stock_quantity" 
                type="number" 
                defaultValue={product?.stock_quantity ?? 0} 
                disabled={!trackInventory}
              />
            </div>
            <label className="flex items-center space-x-3 cursor-pointer pt-3 select-none">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
                className="rounded border-[rgba(0,0,0,0.12)] text-[#1A1A1A] focus:ring-[#1A1A1A] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Track Stock</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Tags (comma-separated)" 
              name="tags" 
              placeholder="e.g. men, sale, jacket" 
              defaultValue={product?.tags?.join(", ") || ""} 
            />
            <div className="relative">
              <select 
                name="status" 
                defaultValue={product?.status || "active"}
                className="peer w-full rounded-lg border border-[rgba(0,0,0,0.08)] px-4 py-3 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white h-[46px] mt-1 text-[#1A1A1A]"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <label className="absolute left-3.5 -top-2 bg-white px-1 text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">Status</label>
            </div>
          </div>
        </div>

        {/* Section 3: Highlights & Specifications */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[rgba(0,0,0,0.06)] pb-2">
            Highlights & Specifications
          </h3>

          {/* Highlights Section */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Product Highlights</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a key highlight (e.g. Premium quality stitching)..."
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                className="flex-1 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newHighlight.trim()) {
                      setHighlights(prev => [...prev, newHighlight.trim()]);
                      setNewHighlight("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  if (newHighlight.trim()) {
                    setHighlights(prev => [...prev, newHighlight.trim()]);
                    setNewHighlight("");
                  }
                }}
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider"
              >
                Add
              </Button>
            </div>
            
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {highlights.map((highlight, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] text-xs text-[#6B6B6B]"
                  >
                    <span>{highlight}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewHighlight(highlight);
                        setHighlights(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-gray-400 hover:text-accent p-0.5 cursor-pointer"
                      title="Edit highlight"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHighlights(prev => prev.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 cursor-pointer text-sm font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {globalHighlights.filter(h => !highlights.includes(h)).length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">Suggested from other products (click to keep):</label>
                <div className="flex flex-wrap gap-1.5">
                  {globalHighlights.filter(h => !highlights.includes(h)).slice(0, 10).map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHighlights(prev => [...prev, h])}
                      className="px-2.5 py-1 rounded-full bg-[#F5F5F0] text-[10px] text-[#6B6B6B] hover:bg-[#E5E7EB] hover:text-[#1A1A1A] transition-colors cursor-pointer border border-transparent hover:border-[rgba(0,0,0,0.06)]"
                    >
                      + {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications Section */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Product Specifications</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Spec Key (e.g. Composition)"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                list="spec-keys-suggestions"
                className="w-1/3 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <datalist id="spec-keys-suggestions">
                {globalSpecKeys.map(k => (
                  <option key={k} value={k} />
                ))}
              </datalist>
              <input
                type="text"
                placeholder="Spec Value (e.g. 100% Cotton)"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="flex-1 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newSpecKey.trim() && newSpecValue.trim()) {
                      setSpecifications(prev => ({
                        ...prev,
                        [newSpecKey.trim()]: newSpecValue.trim()
                      }));
                      setNewSpecKey("");
                      setNewSpecValue("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  if (newSpecKey.trim() && newSpecValue.trim()) {
                    setSpecifications(prev => ({
                      ...prev,
                      [newSpecKey.trim()]: newSpecValue.trim()
                    }));
                    setNewSpecKey("");
                    setNewSpecValue("");
                  }
                }}
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider"
              >
                Add
              </Button>
            </div>

            {Object.keys(specifications).length > 0 && (
              <div className="border border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden bg-[#FAFAFA]">
                <table className="w-full text-left text-xs divide-y divide-[rgba(0,0,0,0.04)]">
                  <tbody className="divide-y divide-[rgba(0,0,0,0.04)] text-[#6B6B6B]">
                    {Object.entries(specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 font-semibold text-[#1A1A1A] w-1/3">{key}</td>
                        <td className="px-4 py-2.5">{val}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                setNewSpecKey(key);
                                setNewSpecValue(val);
                                setSpecifications(prev => {
                                  const copy = { ...prev };
                                  delete copy[key];
                                  return copy;
                                });
                              }}
                              className="text-gray-400 hover:text-accent font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSpecifications(prev => {
                                  const copy = { ...prev };
                                  delete copy[key];
                                  return copy;
                                });
                              }}
                              className="text-gray-400 hover:text-red-500 font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Media Assets */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[rgba(0,0,0,0.06)] pb-2">
            Media Assets (Multiple Images)
          </h3>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                label="Add Image URL" 
                name="inputUrl" 
                placeholder="https://..." 
                value={inputUrl} 
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddUrlImage}
              className="h-11 mt-1 px-4 flex items-center justify-center gap-1 text-xs uppercase font-bold tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAFAFA] p-5 rounded-xl border border-dashed border-[rgba(0,0,0,0.1)]">
            <label className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-[rgba(0,0,0,0.08)] hover:bg-[#FAFAFA] rounded-lg shadow-sm text-xs font-bold uppercase tracking-wider text-[#1A1A1A] cursor-pointer transition-colors">
              <UploadCloud className="w-4 h-4 text-[#9CA3AF]" />
              <span>{isUploading ? "Uploading..." : "Upload Local File(s)"}</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleFileChange} 
                className="hidden" 
                disabled={isUploading}
              />
            </label>
            <span className="text-[11px] font-medium text-[#6B6B6B]">
              {isUploading ? "Sending to Supabase Storage..." : "Select one or more image files from your device"}
            </span>
          </div>

          {/* Render image grid with hidden form variables */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {imageUrls.map((url, idx) => (
                <div key={url + idx} className="relative group aspect-square rounded-xl overflow-hidden border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]">
                  <img src={url} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg bg-white/95 text-red-500 hover:text-red-700 shadow transition-colors cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase rounded-md">
                    {idx === 0 ? "Primary" : `Image ${idx + 1}`}
                  </span>
                  <input type="hidden" name="image_urls" value={url} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: SEO Parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[rgba(0,0,0,0.06)] pb-2">
            Search Engine Optimization (SEO)
          </h3>
          <Input 
            label="Meta Title Tag" 
            name="meta_title" 
            defaultValue={product?.meta_title || ""} 
          />
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Meta Description</label>
            <textarea 
              name="meta_description" 
              rows={2.5} 
              defaultValue={product?.meta_description || ""}
              placeholder="Brief search indexing snippet..."
              className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] resize-none transition-colors"
            />
          </div>
        </div>

        {/* Sticky Actions */}
        <div className="flex justify-end gap-3 pt-5 border-t border-[rgba(0,0,0,0.06)] sticky bottom-0 bg-white z-10 pb-1">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs uppercase tracking-wider">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn">
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSubmitting ? "Saving..." : (product ? "Save Changes" : "Create Product")}</span>
          </Button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={deleteImageIndex !== null}
        onClose={() => setDeleteImageIndex(null)}
        onConfirm={handleConfirmDeleteImage}
        title="Delete Gallery Image"
        message="Are you sure you want to delete this image from the product gallery? This change will be saved when you submit the form."
        confirmLabel="Delete"
        variant="danger"
      />
    </Modal>
  );
}
