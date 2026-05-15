import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Heart, Share2, Plus, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistance } from "date-fns";

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState, EmptyState } from '../components/standard/StateComponents';

const CATEGORIES = ["General", "Feedback", "Question", "Recommendation", "Platform Update"];

export default function Community() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // MOCKING community posts for now
    setPosts([]);
    setLoading(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader 
        title="Community Baraza." 
        subtitle="Discuss, recommend, and build the Jua Kali network."
      />

      <div className="max-w-2xl mx-auto py-4">
        <AnimatePresence mode="wait">
          {showAdd && (
            <NewPostPanel onCancel={() => setShowAdd(false)} />
          )}
        </AnimatePresence>

        {loading ? (
          <LoadingState message="Connecting to the Baraza..." />
        ) : (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <EmptyState 
                message="The Baraza is quiet today. Start a discussion to break the silence." 
                actionLabel="Create First Post"
                onAction={() => setShowAdd(true)}
              />
            ) : (
              posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

const PostItem: React.FC<{ post: any }> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!showComments) return;
    // FETCH COMMENTS logic would go here via API
    setComments([]);
  }, [showComments, post.id]);

  const handleLike = async () => {
    // API logic for like
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('mesh_user_id');
    if (!newComment.trim() || !userId) return;

    setNewComment("");
    // API logic for comment
  };

  return (
    <motion.article 
      layout
      className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 space-y-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-indigo">{post.category}</span>
          <h2 className="text-2xl font-black serif tracking-tight text-stone-900">{post.title}</h2>
        </div>
      </div>
      <p className="text-stone-600 serif text-lg leading-relaxed">{post.body}</p>
      
      <div className="pt-6 flex items-center justify-between border-t border-stone-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-cream border border-brand-olive/10 flex items-center justify-center text-[10px] font-black uppercase">
            {post.authorName?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{post.authorName}</span>
            <span className="text-[8px] font-black uppercase text-stone-300">
              {post.createdAt ? formatDistance(post.createdAt.toDate(), new Date(), { addSuffix: true }) : "Just now"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1.5 text-stone-300 hover:text-brand-red transition-all active:scale-90"
          >
            <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-brand-red text-brand-red' : ''}`} />
            <span className="text-xs font-black">{post.likes || 0}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 transition-colors ${showComments ? 'text-brand-indigo' : 'text-stone-300 hover:text-brand-indigo'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-black">Discuss</span>
          </button>
          <button className="text-stone-300 hover:text-brand-indigo transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-brand-cream/50 rounded-[20px] p-6 space-y-4 mt-4"
          >
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-indigo">
                      {comment.authorName}
                    </span>
                    <span className="text-[8px] font-black uppercase text-stone-300">
                      {comment.createdAt && formatDistance(comment.createdAt.toDate(), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-stone-600 serif italic text-sm">{comment.body}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-xs text-stone-300 serif italic py-4">No comments yet. Start the baraza!</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t border-white">
              <input 
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-white px-4 py-2 rounded-full text-xs serif italic outline-none focus:ring-2 ring-brand-indigo/10"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="w-8 h-8 bg-brand-indigo text-white rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function NewPostPanel({ onCancel }: { onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");

  // Debouncing logic for the title input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitle(title);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [title]);

  async function createPost() {
    const userId = localStorage.getItem('mesh_user_id');
    if (!title.trim() || !body.trim() || !userId) return;

    // API logic for creating post
    onCancel();
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-[32px] p-8 shadow-xl mb-12 space-y-6 border-4 border-brand-indigo/10"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                category === cat 
                ? 'bg-brand-indigo text-white shadow-md' 
                : 'bg-brand-cream text-stone-400 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            className="w-full text-2xl font-black serif tracking-tight outline-none placeholder:text-stone-200"
            placeholder="The headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {title !== debouncedTitle && (
            <div className="absolute right-0 top-0">
               <div className="w-4 h-4 border-2 border-brand-indigo/20 border-t-brand-indigo rounded-full animate-spin" />
            </div>
          )}
        </div>
        <textarea
          className="w-full text-lg serif italic outline-none min-h-[150px] placeholder:text-stone-200 resize-none"
          placeholder="Share the story, feedback, or question..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <button 
          onClick={createPost} 
          disabled={!title.trim() || !body.trim()}
          className="flex-1 bg-brand-indigo text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-brown transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post Discussion
        </button>
        <button onClick={onCancel} className="px-6 py-4 rounded-2xl border-2 border-stone-100 font-black uppercase text-xs tracking-widest text-stone-400 hover:bg-stone-50 transition-all">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
