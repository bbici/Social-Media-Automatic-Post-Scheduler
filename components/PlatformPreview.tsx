
import React from 'react';
import { AdaptedPost, UserSettings } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Repeat2, Send, CheckCircle2, Loader2, CalendarClock, Globe, ThumbsUp, MapPin } from 'lucide-react';

interface PlatformPreviewProps {
  post: AdaptedPost;
  user: UserSettings;
  onPost: (platform: string) => void;
  isPosting: boolean;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'twitter': 
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current text-slate-900">
           <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      );
    case 'linkedin': 
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-[#0A66C2]">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 4.5z"></path>
        </svg>
      );
    case 'instagram': 
      return (
         <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-none stroke-[#E4405F] stroke-[2]">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
         </svg>
      );
    case 'tiktok': 
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-slate-900">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-[#1877F2]">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'googlebusiness':
      return (
         <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-none stroke-[#4285F4] stroke-[2]">
           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
           <circle cx="12" cy="10" r="3"></circle>
         </svg>
      );
    default: 
      return <Share2 size={18} />;
  }
};

// Helper component for smart media display (No crop + Blurred BG support)
const SmartMediaDisplay = ({ 
  url, 
  type, 
  aspectClass = "w-full h-auto", 
  contain = false,
  blurredBg = false
}: { 
  url: string, 
  type: 'image' | 'video', 
  aspectClass?: string, 
  contain?: boolean,
  blurredBg?: boolean
}) => {
  if (blurredBg) {
    return (
      <div className={`relative overflow-hidden bg-black/90 ${aspectClass}`}>
        {/* Background Layer (Blurred) */}
        <div className="absolute inset-0 opacity-40">
           {type === 'video' ? (
             <video src={url} className="w-full h-full object-cover blur-xl scale-110" muted />
           ) : (
             <img src={url} alt="bg" className="w-full h-full object-cover blur-xl scale-110" />
           )}
        </div>
        {/* Foreground Layer (Contained) */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
           {type === 'video' ? (
             <video src={url} className="w-full h-full object-contain" controls />
           ) : (
             <img src={url} alt="media" className="w-full h-full object-contain" />
           )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} bg-slate-50 flex items-center justify-center overflow-hidden`}>
       {type === 'video' ? (
         <video 
            src={url} 
            className={`w-full max-h-[500px] ${contain ? 'object-contain' : 'object-cover'}`} 
            controls 
          />
       ) : (
         <img 
            src={url} 
            alt="media" 
            className={`w-full max-h-[500px] ${contain ? 'object-contain' : 'object-cover'}`} 
         />
       )}
    </div>
  );
};

const PlatformPreview: React.FC<PlatformPreviewProps> = ({ post, user, onPost, isPosting }) => {
  
  // --- Renderers for different platforms ---

  const renderTwitter = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors h-full flex flex-col shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <img src={user.avatar} alt={user.userName} className="w-10 h-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold text-slate-900 truncate">{user.userName}</span>
            <span className="text-slate-500 truncate">@{user.userHandle}</span>
            <span className="text-slate-500">· 1m</span>
          </div>
          <p className="text-slate-900 text-[15px] leading-normal whitespace-pre-wrap mt-1">{post.content}</p>
          
          {post.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-100">
               <SmartMediaDisplay 
                  url={post.mediaUrl} 
                  type={post.mediaType as 'image'|'video'} 
                  contain={true}
               />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-slate-500 text-sm max-w-md">
            <MessageCircle size={18} className="hover:text-blue-500 cursor-pointer" />
            <Repeat2 size={18} className="hover:text-green-500 cursor-pointer" />
            <Heart size={18} className="hover:text-red-500 cursor-pointer" />
            <Share2 size={18} className="hover:text-blue-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinkedIn = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors h-full flex flex-col shadow-sm">
      <div className="p-4 flex items-start gap-3">
        <img src={user.avatar} alt={user.userName} className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{user.userName}</h3>
              <p className="text-xs text-slate-500">Marketing Specialist | AI Enthusiast</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">1m • <span className="text-xs">🌐</span></p>
            </div>
            <MoreHorizontal size={20} className="text-slate-500" />
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-2 text-sm text-slate-800 whitespace-pre-wrap">
        {post.content}
        <div className="mt-2 text-blue-600 font-medium">
          {post.hashtags.map(tag => `#${tag.replace('#', '')} `)}
        </div>
      </div>

      {post.mediaUrl && (
        <div className="w-full mt-2 border-t border-slate-100">
          <SmartMediaDisplay 
              url={post.mediaUrl} 
              type={post.mediaType as 'image'|'video'} 
              contain={true}
          />
        </div>
      )}

      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-sm font-medium mt-auto">
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-3 rounded flex-1 justify-center"><span className="text-xl">👍</span> Like</button>
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-3 rounded flex-1 justify-center"><span className="text-xl">💬</span> Comment</button>
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-3 rounded flex-1 justify-center"><span className="text-xl">↪️</span> Share</button>
      </div>
    </div>
  );

  const renderFacebook = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors h-full flex flex-col shadow-sm">
      <div className="p-4 flex items-start gap-3">
        <img src={user.avatar} alt={user.userName} className="w-10 h-10 rounded-full border border-slate-200" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
             <div>
               <h3 className="font-semibold text-slate-900 text-sm">{user.userName}</h3>
               <p className="text-xs text-slate-500 flex items-center gap-1">Just now • <Globe size={10} /></p>
             </div>
             <MoreHorizontal size={20} className="text-slate-500" />
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-3 text-[15px] text-slate-900 whitespace-pre-wrap leading-relaxed">
        {post.content}
        {post.hashtags.length > 0 && (
           <p className="mt-2 text-blue-600">
             {post.hashtags.map(tag => `#${tag.replace('#', '')} `)}
           </p>
        )}
      </div>

      {post.mediaUrl && (
        <div className="w-full mt-1">
          <SmartMediaDisplay 
              url={post.mediaUrl} 
              type={post.mediaType as 'image'|'video'} 
              contain={false}
          />
        </div>
      )}

      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-sm font-medium mt-auto">
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-2 rounded flex-1 justify-center text-slate-600"><ThumbsUp size={18}/> Like</button>
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-2 rounded flex-1 justify-center text-slate-600"><MessageCircle size={18}/> Comment</button>
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-2 rounded flex-1 justify-center text-slate-600"><Share2 size={18}/> Share</button>
      </div>
    </div>
  );

  const renderGoogleBusiness = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors h-full flex flex-col shadow-sm">
       <div className="p-4 border-b border-slate-100 flex items-center gap-3">
         <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
           {user.userName.charAt(0)}
         </div>
         <div>
            <h3 className="text-sm font-bold text-slate-800">{user.userName}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> Business Profile</p>
         </div>
       </div>

       {post.mediaUrl && (
        <div className="w-full h-48">
          <img src={post.mediaUrl} className="w-full h-full object-cover" alt="Update" />
        </div>
       )}

       <div className="p-4">
          <span className="text-xs font-bold text-blue-600 uppercase mb-2 block">Latest Update</span>
          <p className="text-sm text-slate-800 whitespace-pre-wrap mb-4 line-clamp-6">{post.content}</p>
          
          <button className="w-full py-2 bg-slate-100 text-blue-600 font-semibold rounded text-sm hover:bg-slate-200 transition-colors">
            Learn more
          </button>
       </div>
    </div>
  );

  const renderInstagram = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors h-full flex flex-col max-w-sm mx-auto w-full shadow-sm">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={user.avatar} alt={user.userName} className="w-8 h-8 rounded-full ring-2 ring-pink-500 p-0.5" />
          <span className="font-semibold text-sm text-slate-900">{user.userHandle}</span>
        </div>
        <MoreHorizontal size={20} className="text-slate-800" />
      </div>

      {/* Smart Media Display: Allows portrait/landscape without cropping */}
      <div className="w-full bg-slate-50 border-t border-b border-slate-100">
        {post.mediaUrl ? (
           <SmartMediaDisplay 
             url={post.mediaUrl} 
             type={post.mediaType as 'image'|'video'}
             contain={true} 
             aspectClass="w-full min-h-[300px]"
           />
        ) : (
          <div className="text-center p-12 flex items-center justify-center aspect-square bg-gradient-to-br from-slate-50 to-slate-100">
             <span className="text-2xl font-serif italic text-slate-400">"{post.content.slice(0, 50)}..."</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-4 text-slate-900">
             <Heart size={24} />
             <MessageCircle size={24} />
             <Send size={24} />
           </div>
           <Bookmark size={24} />
        </div>
        <div className="text-sm text-slate-900 font-semibold mb-1">2,453 likes</div>
        <div className="text-sm text-slate-900">
          <span className="font-semibold mr-2">{user.userHandle}</span>
          {post.content}
        </div>
        <div className="text-sm text-blue-900 mt-1">
           {post.hashtags.map(tag => `#${tag.replace('#', '')} `)}
        </div>
      </div>
    </div>
  );

  const renderTikTok = () => (
    <div className="bg-black rounded-xl border border-slate-800 overflow-hidden h-full flex flex-col max-w-[300px] mx-auto relative text-white aspect-[9/16] shadow-lg">
      {/* TikTok Smart Background: Handles non-9:16 content gracefully */}
      {post.mediaUrl ? (
         <div className="absolute inset-0 z-0">
            <SmartMediaDisplay 
              url={post.mediaUrl} 
              type={post.mediaType as 'image'|'video'} 
              aspectClass="w-full h-full"
              blurredBg={true}
            />
         </div>
      ) : (
         <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black flex items-center justify-center">
            {post.mediaUrl && <img src={post.mediaUrl} className="w-full h-full object-cover opacity-50" />}
         </div>
      )}
      
      {/* TikTok UI Overlay */}
      <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center z-20">
        <div className="w-10 h-10 rounded-full bg-white p-0.5"><img src={user.avatar} className="rounded-full w-full h-full" /></div>
        <div className="flex flex-col items-center"><Heart size={28} fill="white" className="text-white drop-shadow-md"/> <span className="text-xs font-bold drop-shadow-md">12k</span></div>
        <div className="flex flex-col items-center"><MessageCircle size={28} fill="white" className="text-white drop-shadow-md"/> <span className="text-xs font-bold drop-shadow-md">402</span></div>
        <div className="flex flex-col items-center"><Share2 size={28} fill="white" className="text-white drop-shadow-md"/> <span className="text-xs font-bold drop-shadow-md">Share</span></div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pt-12">
        <h4 className="font-bold drop-shadow-md mb-1">@{user.userHandle}</h4>
        <p className="text-sm opacity-90 mb-2 line-clamp-3 leading-snug drop-shadow-md">{post.content}</p>
         <p className="text-xs font-bold opacity-80 flex items-center gap-2">🎵 Original Sound - {user.userHandle}</p>
      </div>
    </div>
  );

  // --- Wrapper ---

  const formatScheduledTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1 bg-slate-100/50 p-2 rounded-lg border border-slate-200/50 backdrop-blur-sm">
         <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
              <PlatformIcon platform={post.platform} />
            </div>
            <span className="font-bold capitalize text-slate-700 text-sm">{post.platform === 'googlebusiness' ? 'Google Business' : post.platform}</span>
         </div>
         {post.isPosted ? (
           post.scheduledTime ? (
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
              <CalendarClock size={12}/> Scheduled: {formatScheduledTime(post.scheduledTime)}
            </span>
           ) : (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <CheckCircle2 size={12}/> Posted
            </span>
           )
         ) : (
           <button 
             onClick={() => onPost(post.platform)}
             disabled={isPosting}
             className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm hover:shadow ${post.scheduledTime ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-700'}`}
           >
             {isPosting ? <Loader2 size={12} className="animate-spin"/> : (post.scheduledTime ? <CalendarClock size={12} /> : <Send size={12} />)}
             {post.scheduledTime ? 'Schedule' : 'Post'}
           </button>
         )}
      </div>

      <div className="flex-grow relative group">
         {/* Render Specific Card */}
         {post.platform === 'twitter' && renderTwitter()}
         {post.platform === 'linkedin' && renderLinkedIn()}
         {post.platform === 'facebook' && renderFacebook()}
         {post.platform === 'instagram' && renderInstagram()}
         {post.platform === 'tiktok' && renderTikTok()}
         {post.platform === 'googlebusiness' && renderGoogleBusiness()}
      </div>
    </div>
  );
};

export default PlatformPreview;
