import React, { useState, useRef } from 'react';
import { analyzeProfilePhoto } from '../services/geminiService';
import { PhotoAnalysisResult } from '../types';
import { Camera, Upload, Image as ImageIcon, Loader2, AlertCircle, Star } from 'lucide-react';

const PhotoAnalyzer: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setLoading(true);
    try {
      const analysis = await analyzeProfilePhoto(imagePreview);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Could not analyze image. Please ensure it is a valid image file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Upload Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <div 
            className={`relative w-64 h-64 mx-auto rounded-full border-4 overflow-hidden mb-6 group ${imagePreview ? 'border-linkedin-500' : 'border-slate-100 bg-slate-50 dashed-border'}`}
          >
             {imagePreview ? (
               <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400">
                 <ImageIcon size={48} className="mb-2 opacity-50"/>
                 <span className="text-sm">No image selected</span>
               </div>
             )}
             
             {/* Overlay for change */}
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium"
             >
               Change Photo
             </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          {!imagePreview && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 py-2 px-6 bg-white border border-slate-300 text-slate-700 font-medium rounded-full hover:bg-slate-50 transition-colors flex items-center gap-2 mx-auto"
            >
              <Upload size={18} /> Upload Headshot
            </button>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!imagePreview || loading}
            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all transform ${
              !imagePreview || loading 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-linkedin-600 hover:bg-linkedin-700 hover:-translate-y-0.5'
            }`}
          >
             {loading ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
             {loading ? 'Analyzing...' : 'Analyze Photo'}
          </button>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
           {!result && !loading && (
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4">
               <AlertCircle className="text-blue-600 shrink-0" />
               <div>
                 <h4 className="font-bold text-blue-900 mb-1">Why analyze your photo?</h4>
                 <p className="text-sm text-blue-800">Profiles with professional photos get 21x more views and 9x more connection requests. Our AI checks lighting, composition, and professionalism.</p>
               </div>
             </div>
           )}

           {loading && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-pulse">
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2 pt-1">
                     <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-24 bg-slate-100 rounded w-full"></div>
             </div>
           )}

           {result && (
             <>
               {/* Score Card */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700">Professional Score</h3>
                    <p className="text-slate-500 text-sm">Based on AI vision analysis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-4xl font-bold ${result.score >= 8 ? 'text-green-500' : result.score >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {result.score}
                    </div>
                    <span className="text-slate-400 text-xl">/10</span>
                  </div>
               </div>

               {/* Feedback */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={20}/> Analysis
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {result.feedback}
                  </p>

                  <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Suggested Improvements</h4>
                  <ul className="space-y-3">
                    {result.improvements.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="mt-0.5 min-w-[6px] min-h-[6px] max-w-[6px] max-h-[6px] rounded-full bg-linkedin-500"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default PhotoAnalyzer;
