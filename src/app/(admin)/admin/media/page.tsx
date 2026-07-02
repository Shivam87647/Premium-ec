"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Image as ImageIcon, Loader2, Copy, Trash2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function AdminMediaPage() {
  const { addToast } = useToast();
  const [mediaItems, setMediaItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{ id: string; url: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchMedia = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to read media database", description: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, addToast]);

  React.useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `library/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media-library")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media-library")
        .getPublicUrl(filePath);

      const { error: metaError } = await supabase
        .from("media")
        .insert([{
          url: publicUrl,
          filename: file.name,
          size: file.size,
          mime_type: file.type,
        }]);

      if (metaError) throw metaError;

      addToast({ title: "Upload Success", description: "File uploaded and registered successfully.", type: "success" });
      fetchMedia();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Upload Failed", description: err.message, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({ title: "Copied!", description: "Public URL copied to clipboard.", type: "success" });
  };

  const handleDelete = (id: string, url: string) => {
    setDeletingItem({ id, url });
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const { error: dbError } = await supabase.from("media").delete().eq("id", deletingItem.id);
      if (dbError) throw dbError;

      const match = deletingItem.url.match(/\/media-library\/(.+)$/);
      if (match && match[1]) {
        const storagePath = decodeURIComponent(match[1]);
        await supabase.storage.from("media-library").remove([storagePath]);
      }

      addToast({ title: "Deleted", description: "Media item removed.", type: "success" });
      fetchMedia();
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Delete Failed", description: err.message, type: "error" });
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">Media Library</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">Upload brand assets, product photos, and display banners directly to storage.</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-[#1A1A1A] hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all shimmer-btn">
          {uploading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <UploadCloud className="w-4.5 h-4.5" />
          )}
          <span>{uploading ? "Uploading..." : "Upload File"}</span>
          <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} accept="image/*" />
        </label>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading media registry...</p>
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-[#6B6B6B] p-8">
          <ImageIcon className="w-12 h-12 mx-auto text-[#E5E7EB] mb-4" />
          <h3 className="text-base font-bold text-[#1A1A1A] mb-2">No Media Uploaded</h3>
          <p className="text-sm text-[#6B6B6B] max-w-xs mx-auto">Upload lifestyle shoots or product images to reference them inside product details.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
          <AnimatePresence>
            {mediaItems.map((item) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl overflow-hidden shadow-sm flex flex-col group relative"
              >
                <div className="relative aspect-square w-full bg-[#F5F5F0]">
                  <img 
                    src={item.url} 
                    alt={item.filename} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-semibold text-[#1A1A1A] truncate w-full" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[9px] text-[#9CA3AF] mt-1.5 uppercase font-bold tracking-wider">
                    {(item.mime_type || "image/jpg").split("/")[1]} • {Math.round((item.size || 0) / 1024)} KB
                  </p>
                </div>

                {/* Action Overlays */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2.5 rounded-full bg-white text-gray-900 hover:text-accent shadow cursor-pointer transition-colors"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.url)}
                    className="p-2.5 rounded-full bg-white text-red-500 hover:text-red-700 shadow cursor-pointer transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Media Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Media File"
        message="Are you sure you want to delete this media file? It will be permanently removed from storage, and broken links may occur if referenced elsewhere."
        isLoading={isDeleting}
      />
    </div>
  );
}
