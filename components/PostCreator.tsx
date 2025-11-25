import React, { useState } from 'react';
import { generateLinkedInPost } from '../services/geminiService';
import { PostGeneratorData } from '../types';
import { PenTool, Send, Hash, Loader2, Copy, Check, ThumbsUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PostCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string>("");
  const [inputData, setInputData] = useState<PostGeneratorData>({
    topic: '',
    tone: 'Professional',
    audience: 'Industry Peers'
  });
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!inputData.topic) return;
    setLoading(true);
    try {
      const post = await generateLinkedInPost(inputData);
      setGeneratedPost(post);
    } catch (e) {
      console.error(e);
      alert("Failed to generate post.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Controls */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PenTool size={20} className="text-linkedin-600"/> Post Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Topic / Key Idea</label>
                  <textarea
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 outline-none min-h-[100px] text-sm"
                    placeholder="e.g. Why remote work is the future of tech..."
                    value={inputData.topic}
                    onChange={(e) => setInputData({...inputData, topic: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tone</label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 outline-none text-sm bg-white"
                    value={inputData.tone}
                    onChange={(e) => setInputData({...inputData, tone: e.target.value as any})}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual & Authentic</option>
                    <option value="Thought Leadership">Thought Leadership</option>
                    <option value="Controversial">Controversial / Debate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Audience</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 outline-none text-sm"
                    placeholder="e.g. Recruiters, Junior Devs..."
                    value={inputData.audience}
                    onChange={(e) => setInputData({...inputData, audience: e.target.value})}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !inputData.topic}
                  className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                     loading || !inputData.topic ? 'bg-slate-300 cursor-not-allowed' : 'bg-linkedin-600 hover:bg-linkedin-700 hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Generate Post
                </button>
              </div>
           </div>
           
           <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
             <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
               <ThumbsUp size={16} /> Pro Tip
             </h4>
             <p className="text-xs text-blue-800 leading-relaxed">
               Linkedin algorithms love engagement. Ask a question at the end of your post to encourage comments!
             </p>
           </div>
        </div>

        {/* Preview */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <span className="font-bold text-lg">You</span>
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
                    <div className="h-2 w-16 bg-slate-100 rounded"></div>
                  </div>
               </div>
               {generatedPost && (
                 <button
                   onClick={handleCopy}
                   className="text-slate-500 hover:text-linkedin-600 transition-colors flex items-center gap-1 text-sm font-medium"
                 >
                   {copied ? <span className="text-green-600 flex items-center gap-1"><Check size={16}/> Copied</span> : <span className="flex items-center gap-1"><Copy size={16}/> Copy</span>}
                 </button>
               )}
             </div>

             <div className="p-6 flex-grow min-h-[400px]">
                {!generatedPost && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <Hash size={64} className="mb-4" />
                    <p>Your generated post will appear here.</p>
                  </div>
                )}
                
                {loading && (
                  <div className="space-y-4 animate-pulse p-4">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-32 bg-slate-100 rounded w-full mt-6"></div>
                  </div>
                )}

                {generatedPost && !loading && (
                  <div className="prose prose-slate max-w-none markdown-prose whitespace-pre-wrap font-normal text-slate-800">
                    <ReactMarkdown>{generatedPost}</ReactMarkdown>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;
