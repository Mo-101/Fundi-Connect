/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CommunityPost } from "../types";
import { MessageSquare, ThumbsUp, PlusCircle, Bookmark, Tag, HelpCircle, Flame, Sparkles } from "lucide-react";
import { NeonCard } from "./CyberDeck";
import { translations } from "../lib/translations";

interface CommunityForumProps {
  posts: CommunityPost[];
  language: "eng" | "swa" | "sheng";
  onAddPost: (post: CommunityPost) => void;
}

export function CommunityForum({ posts, language, onAddPost }: CommunityForumProps) {
  const [activeTab, setActiveTab] = useState<"threads" | "post">("threads");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  
  // Create thread form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [role, setRole] = useState<"worker" | "client">("worker");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [replySuccessMsg, setReplySuccessMsg] = useState("");

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title || !content || !name) {
      setFormError(language === "eng" ? "Specify discussion topic and credentials!" : language === "swa" ? "Tafadhali jaza mada na jina lako!" : "Weka jina na story mkuu!");
      return;
    }

    const tagsArr = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const newPost: CommunityPost = {
      id: `post-user-${Date.now()}`,
      authorName: name,
      authorRole: role,
      title,
      content,
      tags: tagsArr.length > 0 ? tagsArr : ["General"],
      likes: 1,
      repliesCount: 0,
      postedDate: new Date().toISOString()
    };

    onAddPost(newPost);
    setTitle("");
    setContent("");
    setTagsInput("");
    setName("");
    setActiveTab("threads");
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
    }
  };

  const getRoleLabel = (r: string) => {
    if (r === "worker") {
      return language === "eng" ? "VERIFIED FUNDI" : language === "swa" ? "FUNDI ALIYETHIBITISHWA" : "FUNDI LEGIT";
    }
    if (r === "kiosk") {
      return language === "eng" ? "BARAZA LEADER" : language === "swa" ? "MSIMAMIZI WA KIJIWE" : "AGENT CO-OP";
    }
    return language === "eng" ? "CLIENT / NEIGHBOR" : language === "swa" ? "MTEJA WA MTAANI" : "MTEJA";
  };

  return (
    <div className="space-y-4">
      {/* Forum Tabs Toggle */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-white/[0.05] select-none">
        <button
          onClick={() => { setActiveTab("threads"); setSelectedPost(null); }}
          className={`py-2 text-center font-mono text-[10px] uppercase tracking-wider rounded-lg transition duration-250 cursor-pointer ${
            activeTab === "threads" && !selectedPost
              ? "bg-cyber-gold text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {language === "eng" ? "BARAZA FEEDS" : language === "swa" ? "MADA ZA VIJIWENI" : "STORY ZA VIJIWENI"}
        </button>
        <button
          onClick={() => { setActiveTab("post"); setSelectedPost(null); }}
          className={`py-2 text-center font-mono text-[10px] uppercase tracking-wider rounded-lg transition duration-250 cursor-pointer ${
            activeTab === "post"
              ? "bg-cyber-gold text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {language === "eng" ? "START DISCUSSION" : language === "swa" ? "ANZISHA MAZUNGUMZO" : "ANZISHA DISCUSS"}
        </button>
      </div>

      {selectedPost ? (
        // Thread details screen
        <div className="space-y-4">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-xs font-mono text-cyber-gold hover:text-cyber-gold/80 flex items-center gap-1 cursor-pointer"
          >
            {language === "eng" ? "← BACK TO DISCUSSION BOARD" : language === "swa" ? "← RUDI KWENYE BARAZA" : "← GO BACK KWA DISCUSS"}
          </button>

          <NeonCard glowColor="violet">
            <header className="border-b border-cyber-cream/10 pb-3">
              <div className="flex gap-2 items-center text-[10px] font-mono text-cyber-muted">
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  selectedPost.authorRole === "worker" ? "bg-cyber-mint/10 text-cyber-mint" : "bg-cyber-gold/10 text-cyber-gold"
                }`}>
                  {getRoleLabel(selectedPost.authorRole)}
                </span>
                <span>BY {selectedPost.authorName.toUpperCase()}</span>
                <span>•</span>
                <span>{new Date(selectedPost.postedDate).toLocaleDateString()}</span>
              </div>
              <h3 className="font-display font-bold text-cyber-cream text-base mt-2 tracking-tight leading-tight">
                {selectedPost.title}
              </h3>
            </header>

            <div className="py-4 font-sans text-xs text-[#CFD2E2] space-y-4 leading-relaxed">
              <p className="whitespace-pre-line">{selectedPost.content}</p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedPost.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center text-[9px] font-mono text-cyber-gold bg-[#182052] border border-cyber-gold/10 px-2 py-0.5 rounded">
                    <Tag className="w-2.5 h-2.5 mr-1" /> #{tag}
                  </span>
                ))}
              </div>
            </div>

            <footer className="border-t border-cyber-cream/10 pt-3 flex items-center justify-between font-mono text-xs text-[#8E92AC]">
              <button
                onClick={(e) => handleLike(e, selectedPost.id)}
                className="flex items-center gap-1.5 hover:text-cyber-gold cursor-pointer transition select-none"
              >
                <ThumbsUp className="w-4 h-4" /> {language === "eng" ? "UPVOTES" : language === "swa" ? "WANAOKUBALIANA" : "WASEE WAMELUKE"} ({selectedPost.likes})
              </button>
              <span className="flex items-center gap-1.5 bg-cyber-surface px-2.5 py-1 rounded">
                <MessageSquare className="w-4 h-4" /> {language === "eng" ? "REPLIES" : language === "swa" ? "MAJIBU" : "MAJIBU LEO"} ({selectedPost.repliesCount})
              </span>
            </footer>

            {/* Simulating comments thread */}
            <div className="mt-5 space-y-3">
              <h4 className="font-mono text-xs font-bold text-cyber-cream tracking-wider uppercase">
                {language === "eng" ? "Baraza Comments" : language === "swa" ? "Maoni ya Wazee na Fundis" : "Maoni ya Kijiweni"}
              </h4>
              
              <div className="p-3 bg-cyber-midnight rounded text-sans text-xs border border-cyber-cream/5">
                <header className="font-mono text-[9px] text-[#A2A4BA] mb-1 uppercase font-bold flex gap-1 items-center">
                  <span className="text-cyber-mint">● {language === "eng" ? "FUNDI" : "FUNDI LEGIT"}</span> Juma Kamau • 2 hours ago
                </header>
                <p className="text-cyber-muted">
                  {language === "eng" ? "Indeed Amina, this rate card helps keep things honest." : language === "swa" ? "Kweli kabisa dada Amina, jasho la mnyonge halitapotea tukisugua kura hivi." : "Noma sana, hii rate card inaokolea wasee wasidunishwe mtaani."}
                </p>
              </div>

              <div className="p-3 bg-cyber-midnight rounded text-sans text-xs border border-cyber-cream/5">
                <header className="font-mono text-[9px] text-[#A2A4BA] mb-1 uppercase font-bold flex gap-1 items-center">
                  <span className="text-cyber-gold">● {language === "eng" ? "MEMBER" : "MWANAKIJIJI"}</span> Esther Chemutai • Yesterday
                </header>
                <p className="text-cyber-muted">
                  {language === "eng" ? "It is vital to support trustworthy fundis. We will share this across all Boma hubs." : language === "swa" ? "Ni muhimu kusaidiana sote kijamii. Kazi nzuri mtaani hujivunia baraka." : "Luku sana wadau, sote tujengane hivi hivi!"}
                </p>
              </div>

              {/* Quick reply form */}
              {replySuccessMsg && (
                <div className="p-2.5 mt-2 bg-cyber-mint/10 border border-cyber-mint/25 rounded-xl text-cyber-mint text-[11px] font-sans">
                  {replySuccessMsg}
                </div>
              )}
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (!replyInput.trim()) return;
                  setReplySuccessMsg(language === "eng" ? "Reply broadcast on the Baraza grid!" : language === "swa" ? "Maoni yako yamehifadhiwa kwa baraza ya wazee!" : "Story imetumwa chapchap kwa mesh!"); 
                  setReplyInput("");
                  setTimeout(() => setReplySuccessMsg(""), 4000);
                }} 
                className="flex gap-1.5 border border-white/[0.08] rounded-xl overflow-hidden mt-4 bg-zinc-950"
              >
                <input
                  type="text"
                  placeholder={language === "eng" ? "Add to the discussion..." : language === "swa" ? "Jaza mawazo yako hapa..." : "Tupa story yako ya kijiweni..."}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs outline-hidden text-[#fafafa] placeholder-zinc-505 font-sans"
                />
                <button type="submit" className="px-4 bg-cyber-gold font-mono text-[10px] uppercase font-bold text-zinc-950 cursor-pointer hover:bg-cyber-gold/90 transition text-center tracking-wider">
                  {language === "eng" ? "REPLY" : language === "swa" ? "TUMA" : "TUMA STORY"}
                </button>
              </form>
            </div>
          </NeonCard>
        </div>
      ) : activeTab === "threads" ? (
        // List threads
        <div className="space-y-3">
          {posts.map((post) => (
            <NeonCard
              key={post.id}
              onClick={() => setSelectedPost(post)}
              glowColor={post.isSticky ? "red" : "violet"}
              className="hover:scale-[1.01] active:scale-100 p-4"
            >
              <div className="flex gap-2 items-center text-[9px] font-mono text-cyber-muted mb-2">
                {post.isSticky && (
                  <span className="bg-cyber-red/10 text-cyber-red border border-cyber-red/20 px-1.5 py-0.5 rounded font-bold animate-pulse inline-flex items-center gap-0.5">
                    <Flame className="w-3 h-3 block" /> {language === "eng" ? "BARAZA STICKY" : language === "swa" ? "YENYE KIPAUMBELE" : "STORY MOTO"}
                  </span>
                )}
                <span className={`px-1.5 py-0.5 rounded font-bold leading-none ${
                  post.authorRole === "worker" ? "bg-cyber-mint/10 text-cyber-mint border border-cyber-mint/20" : "bg-cyber-gold/10 text-cyber-gold border border-cyber-gold/20"
                }`}>
                  {getRoleLabel(post.authorRole)}
                </span>
                <span className="font-bold">BY {post.authorName}</span>
                <span>•</span>
                <span>{new Date(post.postedDate).toLocaleDateString()}</span>
              </div>

              <h3 className="font-display font-medium text-cyber-cream text-sm line-clamp-1 leading-snug mb-1">
                {post.title}
              </h3>

              <p className="font-sans text-[11px] text-cyber-muted line-clamp-2 leading-relaxed mb-3">
                {post.content}
              </p>

              <footer className="border-t border-cyber-cream/10 pt-2.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#7E829B]">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 mr-0.5" /> {post.likes} {language === "eng" ? "AGREED" : "WAMEKUBALI"}</span>
                <span className="flex items-center gap-1 font-bold bg-[#182052] px-2 py-0.5 rounded text-cyber-gold">
                  <MessageSquare className="w-3 h-3" /> {post.repliesCount} {language === "eng" ? "REPLIES" : "MAJIBU LEO"}
                </span>
              </footer>
            </NeonCard>
          ))}
        </div>
      ) : (
        // Post discussion thread
        <form onSubmit={handlePostSubmit} className="p-5 bg-cyber-surface/90 border border-cyber-cream/15 rounded space-y-3.5 font-mono text-xs">
          <header className="border-b border-cyber-cream/15 pb-2">
            <h3 className="font-display font-bold text-sm text-cyber-gold flex items-center gap-1.5 uppercase">
              <PlusCircle className="w-4 h-4" /> {language === "eng" ? "POST TO COOPERATIVE FORUM" : language === "swa" ? "ANZISHA MKUTANO WA VIJIWENI" : "LUKU KAZI YA BARAZA"}
            </h3>
            <p className="text-[10px] text-cyber-muted pt-0.5 uppercase">
              {language === "eng" ? "Broadcast technical insights, community updates, or rate card guides" : language === "swa" ? "Chapisha hekima, tahadhari za bei au mbao za ufundi kijiweni" : "Tupa dondoo zako, miongozo ya unyakuaji na tahadhari"}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-cyber-muted">{language === "eng" ? "SENDER NAME" : "JINA LAKO"}</label>
              <input
                type="text"
                placeholder="e.g. Kiprono Tech"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-1.5 text-cyber-cream font-sans focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-cyber-muted">{language === "eng" ? "SENDER NETWORK ROLE" : "DHIMA YAKO MTAANI"}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-1.5 text-cyber-cream focus:outline-hidden"
              >
                <option value="worker">{language === "eng" ? "TECHNICIAN (FUNDI)" : "FUNDI SHUPAVU"}</option>
                <option value="client">{language === "eng" ? "CLIENT / PROPERTY AGENT" : "MTEJA WA MTAANI"}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-cyber-muted">{language === "eng" ? "DISCUSSION FOCUS / HEADING" : "MADA MAALUM YA KUZUNGUMZIA"}</label>
            <input
              type="text"
              placeholder="e.g. River Road Solar controller warnings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-3 py-2 text-cyber-cream font-sans focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-cyber-muted">{language === "eng" ? "TAGS (COMMA SEPARATED)" : "SHAHADA/VINYAKUA (COMMA SEPARATED)"}</label>
            <input
              type="text"
              placeholder="e.g. Solar, Warning, RiverRoad"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-3 py-2 text-cyber-cream focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-cyber-muted">{language === "eng" ? "DISCUSSION WORDS" : "YASEME YOTE IN DETAIL"}</label>
            <textarea
              rows={4}
              placeholder={language === "eng" ? "Explain technical details clearly..." : "Fafanua maoni au mwongozo wako hapa..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded p-2.5 text-cyber-cream font-sans text-xs focus:outline-hidden"
            />
          </div>

          {formError && (
            <div className="p-2.5 bg-cyber-red/10 border border-cyber-red/20 rounded-xl text-cyber-red text-xs font-sans">
              <strong>⚠️ Warning:</strong> {formError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-cyber-gold text-zinc-950 font-sans rounded-xl text-[10px] select-none cursor-pointer hover:scale-[1.01] transition uppercase font-bold tracking-wider"
          >
            {language === "eng" ? "BROADCAST TO COOP FORUM" : language === "swa" ? "TUNGA MAZUNGUMZO BARAZANI" : "RUSHIA KIJIWE MJADALA"}
          </button>
        </form>
      )}
    </div>
  );
}
