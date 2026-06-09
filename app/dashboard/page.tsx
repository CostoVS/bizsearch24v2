"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_ADS } from "@/lib/data";
import { Star, AlertCircle, PlusCircle, CreditCard, LayoutDashboard, Settings, MapPin, Briefcase, BadgeCheck, Image as ImageIcon } from "lucide-react";

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isCreatingAd, setIsCreatingAd] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="p-20 text-center text-slate-500">Loading dashboard...</div>;

  const myAds = MOCK_ADS.filter(ad => ad.userId === user.id);
  const canPlaceAd = user.plan === "PREMIUM" || myAds.length === 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200">
        <div className="flex items-center">
          <div className="bg-emerald-100 p-3 rounded-xl mr-4">
            <LayoutDashboard className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your professional listings and account details.</p>
          </div>
        </div>
        <button className="hidden sm:flex items-center text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg font-medium shadow-sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-6 text-slate-900 flex items-center">
              Account Overview
            </h2>
            <div className="space-y-4 text-sm">
              <div className="pb-4 border-b border-slate-100">
                <span className="block text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">Email Directory</span>
                <span className="font-medium text-slate-900">{user.email}</span>
              </div>
              <div className="pb-2">
                <span className="block text-slate-500 mb-2 text-xs uppercase tracking-wider font-semibold">Current Plan</span>
                {user.plan === "PREMIUM" ? (
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200 text-xs">
                    <Star className="w-3 h-3 mr-1.5 fill-blue-500 text-emerald-500" /> PREMIUM PARTNER
                  </span>
                ) : (
                  <span className="inline-flex items-center text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-bold border border-slate-200 text-xs">
                    FREE TIER
                  </span>
                )}
              </div>
            </div>

            {user.plan === "FREE" && (
              <div className="mt-8 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center text-base">
                  <Star className="w-4 h-4 mr-2 text-indigo-600 fill-indigo-100" />
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-indigo-700/80 mb-5 leading-relaxed">
                  Get image upload capability, a verified blue badge, unlimited ads, and exclusive sponsor placement for R199/mo.
                </p>
                <button onClick={() => router.push('/premium')} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Upgrade Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* My Ads */}
        <div className="lg:col-span-2">
          {!isCreatingAd ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
              <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <h2 className="font-semibold text-lg text-slate-900">Active Listings</h2>
                {canPlaceAd ? (
                  <button onClick={() => setIsCreatingAd(true)} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Ad
                  </button>
                ) : (
                  <div className="flex items-center text-rose-600 text-sm font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Free Limit Reached
                  </div>
                )}
              </div>

              {myAds.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-medium text-lg mb-2">No Active Ads</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get your business noticed by creating your first listing in our directory.</p>
                  <button onClick={() => setIsCreatingAd(true)} className="bg-white text-slate-900 border border-slate-300 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    Create your first ad
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myAds.map(ad => (
                    <div key={ad.id} className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-slate-50 transition-colors">
                      <div className="mb-4 sm:mb-0">
                        <h4 className="font-bold text-slate-900 text-lg mb-1">{ad.title}</h4>
                        <div className="flex items-center text-sm text-slate-500">
                          <span className="flex items-center capitalize"><MapPin className="w-3.5 h-3.5 mr-1" /> {ad.location}</span>
                          <span className="mx-2">•</span>
                          <span>{ad.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {ad.verified ? (
                          <span className="inline-flex items-center text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Verified Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-600 text-xs font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                             Standard Listing
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-xl mb-6 text-slate-900">Create New Advertisement</h2>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsCreatingAd(false); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Title</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. John's Plumbing" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea rows={4} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" placeholder="Describe your business services..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location (Town/City)</label>
                    <input type="text" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Durban" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                      <option>Plumbers</option>
                      <option>Electricians</option>
                      <option>Digital Marketing</option>
                    </select>
                  </div>
                </div>
                
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${user.plan === 'PREMIUM' ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                  <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${user.plan === 'PREMIUM' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {user.plan === 'PREMIUM' ? (
                     <div>
                       <p className="font-medium text-emerald-800">Click to upload business image</p>
                       <p className="text-xs text-emerald-600 mt-1">PNG, JPG up to 5MB. Images are automatically resized and scanned by our security inspector for nudity & profanity.</p>
                     </div>
                  ) : (
                     <div>
                       <p className="font-medium text-slate-600">Image upload locked</p>
                       <p className="text-xs text-slate-500 mt-1">Upgrade to Premium to showcase your business with an image</p>
                     </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                     AI Content Inspector Active
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsCreatingAd(false)} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm">
                      Publish Advertisement
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
