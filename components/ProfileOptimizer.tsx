import React, { useState, useEffect } from 'react';
import { ProfileData, OptimizedProfileResult } from '../types';
import { optimizeProfileWithGemini } from '../services/geminiService';
import { Sparkles, Copy, Check, Loader2, User, Briefcase, FileText, Zap, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ProfileOptimizerProps {
  initialData?: ProfileData;
}

const ProfileOptimizer: React.FC<ProfileOptimizerProps> = ({ initialData }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizedProfileResult | null>(null);
  const [formData, setFormData] = useState<ProfileData>({
    headline: '',
    about: '',
    experience: '',
    skills: ''
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleOptimize = async () => {
    if (!formData.headline && !formData.about) return;
    setLoading(true);
    try {
      const data = await optimizeProfileWithGemini(formData);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to optimize. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number, field?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    if (field) setCopiedField(field);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg text-linkedin-500">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Profile Details</h2>
            <p className="text-sm text-slate-500">Enter your details or edit the imported data</p>
          </div>
        </div>

        <div className="space-y-5 flex-grow">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Headline</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Software Engineer at Tech Co"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">About Section</label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none transition-all min-h-[120px]"
              placeholder="Paste your current bio or a rough draft..."
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Key Experience & Achievements</label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none transition-all min-h-[150px]"
              placeholder="Led a team of 5, Increased revenue by 20%, etc."
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>
          
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Skills (Comma Separated)</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-linkedin-500 focus:border-transparent outline-none transition-all"
              placeholder="React, Leadership, Sales, Python..."
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={handleOptimize}
            disabled={loading || (!formData.headline && !formData.about)}
            className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              loading || (!formData.headline && !formData.about)
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-linkedin-600 hover:bg-linkedin-500'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Analyzing Profile...' : 'Optimize Profile'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full overflow-y-auto relative">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-4">
            <div className="p-6 bg-slate-50 rounded-full">
               <Briefcase size={48} className="opacity-50" />
            </div>
            <p className="max-w-xs">Fill out your details on the left and hit optimize to see AI-powered suggestions here.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-32 bg-slate-200 rounded w-full mt-8"></div>
            <div className="h-32 bg-slate-200 rounded w-full mt-4"></div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Critique */}
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
              <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-1">
                <Zap size={18} /> Profile Audit
              </h3>
              <p className="text-orange-900 text-sm leading-relaxed">{result.critique}</p>
            </div>

            {/* Headlines */}
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <FileText size={18} className="text-linkedin-500" /> 
                Optimized Headlines
              </h3>
              <div className="space-y-3">
                {result.optimizedHeadline.map((headline, idx) => (
                  <div key={idx} className="group relative p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-linkedin-500 transition-colors">
                    <p className="text-slate-700 font-medium pr-8">{headline}</p>
                    <button
                      onClick={() => copyToClipboard(headline, idx, 'headline')}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-linkedin-500 rounded-md hover:bg-white transition-all"
                    >
                      {copiedIndex === idx && copiedField === 'headline' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <User size={18} className="text-linkedin-500" /> 
                  Optimized About Section
                </h3>
                <button
                  onClick={() => copyToClipboard(result.optimizedAbout, 999, 'about')}
                  className="text-xs font-semibold text-linkedin-600 hover:text-linkedin-500 flex items-center gap-1"
                >
                   {copiedIndex === 999 && copiedField === 'about' ? <Check size={14} /> : <Copy size={14} />}
                   Copy Full Text
                </button>
              </div>
              <div className="p-5 bg-slate-50 rounded-lg border border-slate-100 prose prose-slate prose-sm max-w-none markdown-prose">
                <ReactMarkdown>{result.optimizedAbout}</ReactMarkdown>
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Trophy size={18} className="text-linkedin-500" /> 
                  Enhanced Experience
                </h3>
                 <button
                  onClick={() => copyToClipboard(result.optimizedExperience, 888, 'experience')}
                  className="text-xs font-semibold text-linkedin-600 hover:text-linkedin-500 flex items-center gap-1"
                >
                   {copiedIndex === 888 && copiedField === 'experience' ? <Check size={14} /> : <Copy size={14} />}
                   Copy Full Text
                </button>
              </div>
              <div className="p-5 bg-slate-50 rounded-lg border border-slate-100 prose prose-slate prose-sm max-w-none markdown-prose">
                <ReactMarkdown>{result.optimizedExperience}</ReactMarkdown>
              </div>
            </div>

             {/* Strategic Tips */}
             <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-purple-500" /> 
                Strategic Advice
              </h3>
              <div className="p-5 bg-purple-50 rounded-lg border border-purple-100 prose prose-sm max-w-none text-purple-900 markdown-prose">
                <ReactMarkdown>{result.strategicTips}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOptimizer;