
import React, { useState } from 'react';
import CreationStudio from './CreationStudio';
import PlatformPreview from './PlatformPreview';
import ConnectionSettings from './ConnectionSettings';
import { generateSocialVariants } from '../services/geminiService';
import { postToTwitter, postToLinkedIn, postToInstagram, postToFacebook, postToGoogleBusiness } from '../services/socialApiService';
import { DraftContent, Platform, AdaptedPost, UserSettings, User } from '../types';
import { Settings, LogOut, Zap, Layout, Sparkles, Rocket, Loader2, Eye, X } from 'lucide-react';
import { useApiConfig } from '../contexts/ApiContext';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  impersonatingAdmin?: User | null;
  onStopImpersonation?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout, impersonatingAdmin, onStopImpersonation }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [postingStatus, setPostingStatus] = useState<Record<string, boolean>>({});
  const [generatedPosts, setGeneratedPosts] = useState<AdaptedPost[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | Platform>('all');
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  
  const { apiConfig } = useApiConfig();

  const handleGenerate = async (draft: DraftContent, platforms: Platform[]) => {
    setIsGenerating(true);
    try {
      const variants = await generateSocialVariants(draft, platforms);
      setGeneratedPosts(variants);
      setActiveTab('all');
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async (platform: string) => {
    setPostingStatus(prev => ({ ...prev, [platform]: true }));
    
    try {
      const post = generatedPosts.find(p => p.platform === platform);
      if (!post) return false;

      let success = false;

      switch (platform) {
        case 'twitter':
          success = await postToTwitter(post, apiConfig.twitter);
          break;
        case 'linkedin':
          success = await postToLinkedIn(post, apiConfig.linkedin);
          break;
        case 'instagram':
          success = await postToInstagram(post, apiConfig.instagram);
          break;
        case 'facebook':
          success = await postToFacebook(post, apiConfig.facebook);
          break;
        case 'googlebusiness':
          success = await postToGoogleBusiness(post, apiConfig.googlebusiness);
          break;
        case 'tiktok':
          await new Promise(resolve => setTimeout(resolve, 1500));
          success = true;
          break;
      }

      if (success) {
        setGeneratedPosts(prev => prev.map(p => 
          p.platform === platform ? { ...p, isPosted: true } : p
        ));
      }
      return success;
    } catch (error: any) {
      console.error(error);
      alert(`Failed to post to ${platform}: ${error.message}`);
      return false;
    } finally {
      setPostingStatus(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handlePublishAll = async () => {
    const postsToPublish = generatedPosts.filter(p => !p.isPosted);
    
    if (postsToPublish.length === 0) {
      alert("All available posts have already been published!");
      return;
    }

    if (!window.confirm(`Are you sure you want to publish to ${postsToPublish.length} platforms simultaneously?`)) {
      return;
    }

    setIsPublishingAll(true);

    for (const post of postsToPublish) {
      await handlePost(post.platform);
    }

    setIsPublishingAll(false);
  };

  const userSettings: UserSettings = {
    activePlatforms: ['twitter', 'linkedin', 'instagram', 'facebook', 'googlebusiness'],
    userName: user.name,
    userHandle: user.name.toLowerCase().replace(/\s/g, ''),
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
  };

  const visiblePosts = activeTab === 'all' 
    ? generatedPosts 
    : generatedPosts.filter(p => p.platform === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      
      {/* Impersonation Banner */}
      {impersonatingAdmin && (
        <div className="bg-indigo-600 text-white px-4 py-3 shadow-md relative z-50 flex items-center justify-between animate-slide-up">
           <div className="flex items-center gap-2">
             <Eye size={18} />
             <p className="text-sm font-medium">
               Viewing as <strong>{user.name}</strong>. You are logged in as <strong>{impersonatingAdmin.name}</strong>.
             </p>
           </div>
           <button 
             onClick={onStopImpersonation}
             className="px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded hover:bg-indigo-50 transition-colors flex items-center gap-1"
           >
             <X size={14} /> Exit View
           </button>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              OmniPost AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-colors relative group"
              title="Integrations"
            >
              <Settings size={20} />
              {(!apiConfig.twitter?.bearerToken && !apiConfig.linkedin?.accessToken) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>
            
            <div className="flex items-center gap-3">
              <img 
                src={userSettings.avatar} 
                alt="Profile" 
                className="w-8 h-8 rounded-full bg-slate-200 border border-slate-200"
              />
              <span className="font-medium text-sm hidden md:block">{user.name}</span>
            </div>
            
            {!impersonatingAdmin && (
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 sticky top-24 z-20">
             <CreationStudio 
               onGenerate={handleGenerate} 
               isGenerating={isGenerating}
             />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Layout size={20} className="text-indigo-600"/> 
                    Previews
                  </h2>
                  {generatedPosts.length > 0 && (
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {generatedPosts.length}
                    </span>
                  )}
               </div>

               {generatedPosts.length > 0 && (
                 <div className="flex items-center gap-2">
                   <div className="bg-white border border-slate-200 rounded-lg p-1 flex flex-wrap gap-1 max-w-[350px]">
                      <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        All
                      </button>
                      {['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'googlebusiness'].map((p) => (
                        <button 
                          key={p}
                          onClick={() => setActiveTab(p as Platform)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${activeTab === p ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          {p === 'googlebusiness' ? 'GBP' : p}
                        </button>
                      ))}
                   </div>

                   <button 
                     onClick={handlePublishAll}
                     disabled={isPublishingAll || generatedPosts.every(p => p.isPosted)}
                     className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-all ${
                       isPublishingAll || generatedPosts.every(p => p.isPosted)
                         ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                         : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                     }`}
                   >
                     {isPublishingAll ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                     <span className="hidden sm:inline">Publish All</span>
                   </button>
                 </div>
               )}
            </div>

            {generatedPosts.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center h-[600px]">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles size={48} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Create?</h3>
                <p className="text-slate-500 max-w-xs mb-6">
                  Use the studio on the left to draft your content. AI will automatically adapt it for Twitter, LinkedIn, Instagram and more.
                </p>
                <div className="flex gap-2 text-sm text-slate-400 flex-wrap justify-center">
                  <span className="px-2 py-1 bg-slate-100 rounded">Twitter</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">LinkedIn</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">Facebook</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">Instagram</span>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 animate-slide-up ${
                activeTab === 'all' ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'
              }`}>
                {visiblePosts.map((post) => (
                  <div key={post.platform} className="h-auto">
                    <PlatformPreview 
                      post={post} 
                      user={userSettings} 
                      onPost={handlePost}
                      isPosting={postingStatus[post.platform] || false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ConnectionSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default UserDashboard;
