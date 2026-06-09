"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Share2, Image as ImageIcon, MessageCircle, AlertCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

// Simulated feed data
const INITIAL_POSTS = [
  {
    id: 1,
    authorId: "user@eco.co.za",
    author: "Eco Auto Solutions",
    avatar: "E",
    time: "2 hours ago",
    content: "Just finished a complete mobile valet for a fleet of vehicles in Durban!",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=60",
    likes: 24,
    comments: 5
  }
];

const BAD_WORDS = ['badword', 'profane', 'nudity', 'inappropriate'];

export default function PostsFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasPostedToday, setHasPostedToday] = useState(false);

  useEffect(() => {
    if (user) {
      const userPosts = posts.filter(p => p.authorId === user.email);
      if (userPosts.length > 0 && !hasPostedToday) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasPostedToday(true);
      }
    }
  }, [user, posts, hasPostedToday]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to post.");
      return;
    }
    if (hasPostedToday) {
      setError("Daily limit reached. You can only post once per day.");
      return;
    }
    if (!newPostContent.trim()) return;

    // AI Profanity / Inspector Check Simulated
    const lower = newPostContent.toLowerCase();
    if (BAD_WORDS.some(bw => lower.includes(bw))) {
      setError("Inspector Alert: Post blocked! Violation of content policies (profanity/inappropriate).");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setTimeout(() => {
      setPosts([{
        id: Date.now(),
        authorId: user.email,
        author: user.email.split('@')[0],
        avatar: user.email[0].toUpperCase(),
        time: "Just now",
        content: newPostContent,
        image: "",
        likes: 0,
        comments: 0
      }, ...posts]);
      setNewPostContent("");
      setIsSubmitting(false);
      setHasPostedToday(true);
    }, 500);
  };

  const likePost = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };
  
  const deletePost = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Community Posts</h1>
        <p className="text-slate-500">Discover recent updates, promotions, and posts from our community.</p>
      </div>

      {/* Post Creator */}
      {user ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8 relative">
          <form onSubmit={handleCreatePost}>
            <textarea 
              className="w-full bg-slate-50 rounded-xl p-4 text-slate-800 placeholder-slate-400 outline-none border border-slate-100 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 resize-none"
              placeholder="Share an update, offer, or new business photo..."
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={hasPostedToday}
            />
            
            {error && (
              <div className="mt-3 flex items-center bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-sm font-medium border border-rose-100">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
              <div className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-emerald-600">AI Inspector</span> Active • Images resized & scanned
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || !newPostContent.trim() || hasPostedToday}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : hasPostedToday ? "Posted Today" : "Post Update"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl mb-8 text-center font-medium border border-emerald-100">
           Log in to contribute to the community feed
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 group relative">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                  {post.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 leading-none mb-1">{post.author}</h3>
                  <span className="text-xs text-slate-500">{post.time}</span>
                </div>
              </div>
              {user?.role === "ADMIN" && (
                <button onClick={() => deletePost(post.id)} className="text-slate-400 hover:text-rose-600 p-2 bg-slate-50 hover:bg-rose-50 rounded-lg transition" title="Delete Bad Actor Post">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="px-4 pb-3">
              <p className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.image && (
              <div className="w-full h-64 md:h-80 relative bg-slate-100 flex items-center justify-center overflow-hidden">
                 <Image src={post.image} alt="Post image" fill referrerPolicy="no-referrer" className="object-cover object-center" />
              </div>
            )}

            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => likePost(post.id)} className="flex items-center text-slate-500 hover:text-emerald-600 font-medium text-sm transition-colors">
                <ThumbsUp className="w-5 h-5 mr-2" />
                <span>{post.likes} <span className="hidden sm:inline">Likes</span></span>
              </button>
              <button className="flex items-center text-slate-500 hover:text-emerald-600 font-medium text-sm transition-colors">
                <MessageCircle className="w-5 h-5 mr-2" />
                <span>{post.comments} <span className="hidden sm:inline">Comments</span></span>
              </button>
              <button className="flex items-center text-slate-500 hover:text-emerald-600 font-medium text-sm transition-colors">
                <Share2 className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
