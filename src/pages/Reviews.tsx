import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Star, ArrowLeft, MessageSquare, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistance } from "date-fns";

export default function Reviews() {
  const { workerId } = useParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!workerId) return;
    try {
      const data = await api.getWorkerReviews(workerId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workerId]);

  const handleSubmit = async () => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId || !workerId) return;

    try {
      await api.createReview({
        id: `rev_${Date.now()}`,
        jobId: 'direct_review', // Or linked if from a real job
        reviewerId: userId,
        workerId: workerId,
        rating: rating,
        comment: comment
      });
      setComment("");
      setRating(5);
      setShowAdd(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-12 space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-brand-red transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex justify-between items-end">
            <h1 className="text-5xl font-black serif tracking-tighter leading-none">Reviews.</h1>
            <div className="flex items-center gap-2 bg-brand-gold/20 px-4 py-2 rounded-2xl border border-brand-gold/30">
              <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
              <span className="text-lg font-black">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl mb-12 space-y-8 overflow-hidden border-4 border-brand-indigo/10"
            >
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 pl-4">How was the experience?</p>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        rating >= s ? 'bg-brand-gold text-white shadow-lg' : 'bg-brand-cream text-stone-200'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating >= s ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 pl-4">Your comment</p>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-brand-cream p-6 rounded-2xl serif italic text-lg outline-none min-h-[120px] resize-none focus:ring-2 ring-brand-indigo/20 transition-all"
                  placeholder="Tell others about the work quality..."
                />
              </div>

              <div className="flex gap-4">
                <button onClick={handleSubmit} className="flex-1 bg-brand-indigo text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">
                  Submit Review
                </button>
                <button onClick={() => setShowAdd(false)} className="px-6 py-4 rounded-2xl border-2 border-stone-100 font-black uppercase text-xs tracking-widest text-stone-400">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="w-full bg-brand-red text-white py-6 rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-xl mb-12 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Rate This Fundi
          </button>
        )}

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center text-stone-300 italic serif">
              No reviews yet. Be the first to vouch!
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center font-black text-xs">
                      {review.reviewer_name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-black serif tracking-tight text-stone-900 leading-none">{review.reviewer_name}</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mt-1">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'text-brand-gold fill-brand-gold' : 'text-stone-100'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-stone-600 serif italic text-lg leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
