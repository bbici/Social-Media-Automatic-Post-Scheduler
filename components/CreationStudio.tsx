
import React, { useState, useRef, useEffect } from 'react';
import { DraftContent, Platform, PostTemplate, SavedDraft } from '../types';
import { getTemplates, saveTemplate, deleteTemplate } from '../services/templateService';
import { getDrafts, saveDraft, deleteDraft } from '../services/draftService';
import { Image as ImageIcon, Video, X, Sparkles, Loader2, UploadCloud, Crop, Scissors, Check, RotateCcw, Maximize2, Calendar, Clock, LayoutTemplate, Plus, Trash2, ChevronRight, Save, FileText, FolderOpen } from 'lucide-react';

interface CreationStudioProps {
  onGenerate: (draft: DraftContent, platforms: Platform[]) => void;
  isGenerating: boolean;
}

const CreationStudio: React.FC<CreationStudioProps> = ({ onGenerate, isGenerating }) => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<string | undefined>(undefined);
  const [originalMedia, setOriginalMedia] = useState<string | undefined>(undefined); // Allow undo
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'linkedin', 'instagram']);
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  // Template State
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Drafts State
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [newDraftName, setNewDraftName] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Trim State
  const [videoRange, setVideoRange] = useState({ start: 0, end: 100 });

  useEffect(() => {
    setTemplates(getTemplates());
    setDrafts(getDrafts());
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setMedia(result);
        setOriginalMedia(result);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const clearMedia = () => {
    setMedia(undefined);
    setOriginalMedia(undefined);
    setMediaType('none');
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUndo = () => {
    if (originalMedia) setMedia(originalMedia);
    setIsEditing(false);
  };

  // Canvas-based Image Cropping
  const applyCrop = (ratio: number) => {
    if (!media || mediaType !== 'image') return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      const sourceAspect = img.width / img.height;
      let renderWidth, renderHeight, offsetX, offsetY;

      if (sourceAspect > ratio) {
        // Source is wider than target
        renderHeight = img.height;
        renderWidth = img.height * ratio;
        offsetX = (img.width - renderWidth) / 2;
        offsetY = 0;
      } else {
        // Source is taller than target
        renderWidth = img.width;
        renderHeight = img.width / ratio;
        offsetX = 0;
        offsetY = (img.height - renderHeight) / 2;
      }

      canvas.width = renderWidth;
      canvas.height = renderHeight;
      
      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight, 0, 0, renderWidth, renderHeight);
      setMedia(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = media;
  };

  // Template Handlers
  const handleSaveTemplate = () => {
    if (!newTemplateName || !text) return;
    saveTemplate(newTemplateName, text);
    setTemplates(getTemplates());
    setNewTemplateName('');
    setIsSavingTemplate(false);
  };

  const handleLoadTemplate = (template: PostTemplate) => {
    if (text && text !== template.content) {
      if (!confirm("Replace current text with this template?")) return;
    }
    setText(template.content);
    setShowTemplates(false);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this template?")) return;
    deleteTemplate(id);
    setTemplates(getTemplates());
  };

  // Draft Handlers
  const handleSaveDraft = () => {
    if (!text && !media) return;
    const name = newDraftName || (text ? text.slice(0, 30) + '...' : 'Untitled Draft');
    
    saveDraft(name, {
      text,
      media,
      mediaType,
      scheduledTime
    }, selectedPlatforms);
    
    setDrafts(getDrafts());
    setNewDraftName('');
    setIsSavingDraft(false);
    alert("Draft saved successfully!");
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    if ((text || media) && !confirm("Discard current changes and load draft?")) return;
    
    setText(draft.content.text);
    setMedia(draft.content.media);
    setOriginalMedia(draft.content.media); // Assume saved media is base state
    setMediaType(draft.content.mediaType);
    setScheduledTime(draft.content.scheduledTime || '');
    setSelectedPlatforms(draft.platforms);
    setShowDrafts(false);
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this draft?")) return;
    deleteDraft(id);
    setDrafts(getDrafts());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col relative">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Content</h2>
          <p className="text-slate-500">Draft your core idea. We'll adapt it for everywhere else.</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-grow space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700">Post Text</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDrafts(true)}
                className="text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md transition-colors"
              >
                <FolderOpen size={14} /> Drafts
              </button>
              <button 
                onClick={() => setShowTemplates(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
              >
                <LayoutTemplate size={14} /> Templates
              </button>
            </div>
          </div>
          <textarea
            className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-slate-800 placeholder-slate-400"
            placeholder="What's on your mind? (e.g. Just launched a new feature...)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Media Attachment</label>
          
          {!media ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p className="text-slate-600 font-medium">Click to upload Image or Video</p>
              <p className="text-slate-400 text-xs mt-1">Supports JPG, PNG, MP4</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                {/* Media Preview / Editor */}
                <div className="relative flex justify-center items-center bg-black min-h-[300px]">
                   {mediaType === 'image' ? (
                     <img src={media} alt="Upload" className="max-h-[400px] w-auto object-contain" />
                   ) : (
                     <video src={media} className="max-h-[400px] w-full object-contain" controls={!isEditing} />
                   )}
                </div>

                {/* Overlay Controls (When not editing) */}
                {!isEditing && (
                  <>
                    <button 
                      onClick={clearMedia}
                      className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm z-10"
                    >
                      <X size={16} />
                    </button>
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="pointer-events-auto bg-white text-slate-900 px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                          {mediaType === 'image' ? <Crop size={18}/> : <Scissors size={18}/>}
                          Edit Media
                        </button>
                    </div>
                  </>
                )}
                
                {/* Editing Toolbar Overlay */}
                {isEditing && (
                   <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 animate-slide-up">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {mediaType === 'image' ? 'Crop Ratio' : 'Trim Video'}
                            </span>
                            
                            {mediaType === 'image' ? (
                              <div className="flex gap-2">
                                <button onClick={() => applyCrop(1)} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Square (1:1)</button>
                                <button onClick={() => applyCrop(4/5)} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Portrait (4:5)</button>
                                <button onClick={() => applyCrop(16/9)} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Landscape (16:9)</button>
                              </div>
                            ) : (
                              <div className="flex gap-2 items-center w-64">
                                <span className="text-xs text-slate-400">Start</span>
                                <input 
                                  type="range" 
                                  min="0" max="50" 
                                  value={videoRange.start} 
                                  onChange={(e) => setVideoRange({...videoRange, start: Number(e.target.value)})}
                                  className="h-1 flex-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                />
                                <input 
                                  type="range" 
                                  min="50" max="100" 
                                  value={videoRange.end} 
                                  onChange={(e) => setVideoRange({...videoRange, end: Number(e.target.value)})}
                                  className="h-1 flex-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                />
                                <span className="text-xs text-slate-400">End</span>
                              </div>
                            )}
                         </div>

                         <div className="flex gap-2">
                            <button 
                              onClick={handleUndo}
                              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Reset to Original"
                            >
                              <RotateCcw size={18} />
                            </button>
                            <button 
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Check size={16} /> Done
                            </button>
                         </div>
                      </div>
                   </div>
                )}
              </div>
              
              {!isEditing && (
                 <div className="flex items-center gap-2 text-xs text-slate-400">
                   <Maximize2 size={12} /> 
                   <span>Original: {mediaType === 'image' ? 'High Res Image' : 'MP4 Video'}</span>
                 </div>
              )}
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleFileSelect}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Target Platforms</label>
          <div className="flex flex-wrap gap-3">
            {(['twitter', 'linkedin', 'instagram', 'tiktok'] as Platform[]).map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                  selectedPlatforms.includes(p)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
             <Calendar size={16} /> Schedule (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Clock size={16} />
            </div>
            <input 
              type="datetime-local" 
              className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-800 bg-white"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Leave blank to publish immediately.</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-4 gap-3">
        <button
           onClick={() => setIsSavingDraft(true)}
           className="col-span-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all"
           title="Save to Drafts"
        >
          <Save size={18} />
        </button>
        <button
          onClick={() => onGenerate({ text, media, mediaType, scheduledTime }, selectedPlatforms)}
          disabled={!text || selectedPlatforms.length === 0 || isGenerating}
          className={`col-span-3 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
            !text || selectedPlatforms.length === 0 || isGenerating
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.01]'
          }`}
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles className="text-yellow-300" />
          )}
          {isGenerating ? 'Adapting Content...' : 'Auto-Adapt & Preview'}
        </button>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="absolute inset-0 z-20 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><LayoutTemplate size={18}/> Template Library</h3>
             <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {/* New Template Form */}
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4">
               {!isSavingTemplate ? (
                 <button 
                   onClick={() => setIsSavingTemplate(true)}
                   disabled={!text}
                   className="w-full py-2 flex items-center justify-center gap-2 text-indigo-700 font-medium hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Plus size={16} /> Save Current Draft as Template
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <input 
                    type="text" 
                    placeholder="Template Name..." 
                    className="flex-1 p-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    autoFocus
                   />
                   <button onClick={handleSaveTemplate} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Check size={16}/></button>
                   <button onClick={() => setIsSavingTemplate(false)} className="p-2 bg-white text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50"><X size={16}/></button>
                 </div>
               )}
             </div>

             {/* Template List */}
             {templates.length === 0 ? (
               <p className="text-center text-slate-400 py-8 text-sm">No templates found.</p>
             ) : (
               templates.map(t => (
                 <div key={t.id} className="group border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-slate-800 text-sm">{t.name}</h4>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => handleDeleteTemplate(t.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14}/></button>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                      {t.content}
                    </p>
                    <button 
                      onClick={() => handleLoadTemplate(t)}
                      className="w-full py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded transition-colors flex items-center justify-center gap-1"
                    >
                      Use Template <ChevronRight size={12}/>
                    </button>
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      {/* Drafts Modal */}
      {(showDrafts || isSavingDraft) && (
        <div className="absolute inset-0 z-20 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><FolderOpen size={18}/> {isSavingDraft ? 'Save Draft' : 'Saved Drafts'}</h3>
             <button onClick={() => { setShowDrafts(false); setIsSavingDraft(false); }} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             
             {/* Save Draft Mode */}
             {isSavingDraft ? (
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Draft Name (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Weekly Update" 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newDraftName}
                      onChange={(e) => setNewDraftName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveDraft} className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Draft</button>
                    <button onClick={() => setIsSavingDraft(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                  </div>
               </div>
             ) : (
               <>
                 {/* Draft List */}
                 {drafts.length === 0 ? (
                   <p className="text-center text-slate-400 py-8 text-sm">No saved drafts.</p>
                 ) : (
                   drafts.map(d => (
                     <div key={d.id} className="group border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h4 className="font-semibold text-slate-800 text-sm">{d.name}</h4>
                              <span className="text-xs text-slate-400">{new Date(d.lastModified).toLocaleDateString()}</span>
                           </div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => handleDeleteDraft(d.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14}/></button>
                           </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          {d.content.mediaType !== 'none' && (
                             <div className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-1"><ImageIcon size={10}/> Media</div>
                          )}
                          <div className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                             {d.platforms.length} Platforms
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                          {d.content.text || '(No text)'}
                        </p>
                        <button 
                          onClick={() => handleLoadDraft(d)}
                          className="w-full py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded transition-colors flex items-center justify-center gap-1"
                        >
                          Load Draft <ChevronRight size={12}/>
                        </button>
                     </div>
                   ))
                 )}
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreationStudio;
