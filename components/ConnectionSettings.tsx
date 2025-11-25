
import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { useApiConfig } from '../contexts/ApiContext';
import { initiateOAuthFlow } from '../services/socialAuthService';
import { X, Check, AlertTriangle, Link2, ChevronRight, Loader2, Instagram, Linkedin, Twitter, Video, Shield, Key, Facebook, Store } from 'lucide-react';

interface ConnectionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ isOpen, onClose }) => {
  const { apiConfig, updateApiConfig } = useApiConfig();
  const [localConfig, setLocalConfig] = useState<ApiConfig>(apiConfig);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(apiConfig);
    }
  }, [isOpen, apiConfig]);

  if (!isOpen) return null;

  const handleOAuthConnect = async (platform: keyof ApiConfig) => {
    setConnectingPlatform(platform);
    try {
      // Launch popup and wait for token
      const credentials = await initiateOAuthFlow(platform);
      
      const newConfig = {
        ...localConfig,
        [platform]: credentials
      };
      
      setLocalConfig(newConfig);
      updateApiConfig(newConfig);
    } catch (error) {
      console.error("OAuth cancelled or failed", error);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const disconnect = (platform: keyof ApiConfig) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    const emptyConfig: any = {};
    const newConfig = { ...localConfig, [platform]: emptyConfig };
    setLocalConfig(newConfig);
    updateApiConfig(newConfig);
  };

  const isConnected = (platform: keyof ApiConfig) => {
    if (platform === 'twitter') return !!localConfig.twitter?.bearerToken;
    if (platform === 'linkedin') return !!localConfig.linkedin?.accessToken;
    if (platform === 'instagram') return !!localConfig.instagram?.accessToken;
    if (platform === 'tiktok') return !!localConfig.tiktok?.accessToken;
    if (platform === 'facebook') return !!localConfig.facebook?.accessToken;
    if (platform === 'googlebusiness') return !!localConfig.googlebusiness?.accessToken;
    return false;
  };

  const renderConnectionCard = (
    id: keyof ApiConfig,
    name: string,
    icon: React.ReactNode,
    description: string
  ) => {
    const connected = isConnected(id);
    const isLoading = connectingPlatform === id;

    return (
      <div className={`relative overflow-hidden border rounded-xl mb-4 transition-all duration-300 ${connected ? 'border-green-200 bg-green-50/50' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'}`}>
        
        {/* Status Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${connected ? 'bg-green-500' : 'bg-slate-200'}`}></div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-colors ${connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                {name}
                {connected && (
                  <span className="text-[10px] font-extrabold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 tracking-wide">
                    <Check size={8} strokeWidth={4} /> Active
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          
          <div>
            {connected ? (
               <button 
                 onClick={() => disconnect(id)}
                 className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
               >
                 Disconnect
               </button>
            ) : (
              <button 
                onClick={() => handleOAuthConnect(id)}
                disabled={isLoading}
                className={`px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
                {isLoading ? 'Connecting...' : 'Connect Account'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield size={24} className="text-indigo-600"/> Integrations Hub
            </h2>
            <p className="text-slate-500">Securely connect your social profiles for auto-posting.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          <div className="space-y-2">
            {renderConnectionCard(
              'twitter', 
              'X (Twitter)', 
              <Twitter size={24} />, 
              'Post tweets and threads automatically.'
            )}

            {renderConnectionCard(
              'linkedin', 
              'LinkedIn', 
              <Linkedin size={24} />, 
              'Publish posts to your professional network.'
            )}

            {renderConnectionCard(
              'facebook', 
              'Facebook Page', 
              <Facebook size={24} />, 
              'Share updates to your Facebook Business Page.'
            )}

            {renderConnectionCard(
              'instagram', 
              'Instagram', 
              <Instagram size={24} />, 
              'Share photos and reels to your feed.'
            )}

            {renderConnectionCard(
              'tiktok', 
              'TikTok', 
              <Video size={24} />, 
              'Upload short-form video content.'
            )}

            {renderConnectionCard(
              'googlebusiness', 
              'Google Business', 
              <Store size={24} />, 
              'Post updates and offers to Google Search/Maps.'
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
             <button 
               onClick={() => setShowAdvanced(!showAdvanced)}
               className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition-colors"
             >
               <Key size={12} /> {showAdvanced ? 'Hide' : 'Show'} Advanced API Configuration
             </button>
             
             {showAdvanced && (
               <div className="mt-4 p-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                 <p className="mb-2"><AlertTriangle size={14} className="inline mr-1 text-orange-500"/> <strong>Developer Mode:</strong> Only use this if you have your own developer apps and need to manually override the OAuth tokens.</p>
                 <textarea 
                    className="w-full h-32 p-3 text-xs font-mono bg-white border border-slate-300 rounded"
                    value={JSON.stringify(localConfig, null, 2)}
                    readOnly
                 />
               </div>
             )}
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
           <p className="flex items-center justify-center gap-1"><Shield size={12} /> Tokens are encrypted and stored locally in your browser session.</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSettings;
