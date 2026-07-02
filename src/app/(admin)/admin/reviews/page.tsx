"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";
import { MessageSquare, Trash2, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReviewsPage() {
  const { addToast } = useToast();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchReviews = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          title,
          body,
          created_at,
          user_id,
          products (
            title,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (reviewsData && reviewsData.length > 0) {
        const userIds = reviewsData.map((r: any) => r.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds);
          
          const mapped = reviewsData.map((r: any) => ({
            ...r,
            profiles: profilesData?.find((p: any) => p.id === r.user_id) || null
          }));
          setReviews(mapped);
        } else {
          setReviews(reviewsData.map((r: any) => ({ ...r, profiles: null })));
        }
      } else {
        setReviews([]);
      }
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Failed to load reviews", description: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, addToast]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;
      
      setReviews(prev => prev.filter(r => r.id !== deletingId));
      addToast({ title: "Review deleted successfully", type: "success" });
    } catch (err: any) {
      addToast({ title: "Delete failed", description: err.message, type: "error" });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">Reviews Moderation</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">Manage and moderate customer-submitted reviews</p>
        </div>
      </div>

      {/* Main Panel */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl shadow-sm text-[#6B6B6B]">
          <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">No Reviews Found</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Customers haven't submitted any product reviews yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[rgba(0,0,0,0.06)]">
              <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Details</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.04)] text-[#6B6B6B]">
                <AnimatePresence mode="popLayout">
                  {reviews.map((review) => (
                    <motion.tr
                      key={review.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-[#FAFAFA]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#1A1A1A]">
                          {review.products?.title || "Unknown Product"}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                          /{review.products?.slug || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#1A1A1A]">
                          {review.profiles?.full_name || "Verified Customer"}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                          {review.profiles?.email || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex text-amber-400 gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating ? "fill-current" : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs md:max-w-sm">
                        {review.title && (
                          <div className="font-semibold text-[#1A1A1A] mb-1">
                            {review.title}
                          </div>
                        )}
                        <div className="text-xs leading-relaxed line-clamp-3 text-[#6B6B6B]">
                          {review.body}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#9CA3AF]">
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeletingId(review.id)}
                          className="p-2 text-[#9CA3AF] hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone and will update the product rating statistics."
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
