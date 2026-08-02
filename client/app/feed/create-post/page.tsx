"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Compass, 
  MapPin, 
  Clock, 
  DollarSign, 
  Mic, 
  Volume2, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  Users, 
  Lock,
  ChevronRight,
  Flame,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useAppSelector } from "@/lib/store/store";
import Navbar from "@/components/Navbar";
import LocationSearch from "@/components/location/LocationSearch";
import { useCreatePostMutation } from "@/hooks/api/useFeed";
import { useUploadMediaMutation, useDeleteMediaMutation } from "@/hooks/api/useMediaMutations";

type UploadStatus = "idle" | "uploading" | "uploaded" | "failed";
interface MediaItem {
  id: string;
  localUrl: string;
  file: File | null;
  status: UploadStatus;
  remoteUrl?: string;
  publicId?: string;
  progress: number;
  name?: string;
  duration?: number;
}

// Popular adventure categories matching feed presets
const categories = [
  { id: "story", label: "Adventure Story", icon: Compass, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
  { id: "memory", label: "Travel Memory", icon: ImageIcon, color: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
  { id: "itinerary", label: "Route & Itinerary", icon: Compass, color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
  { id: "tips", label: "Tips & Hacks", icon: Flame, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  { id: "food", label: "Food Guide", icon: Flame, color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
  { id: "stay", label: "Stay Review", icon: Compass, color: "text-orange-400 border-orange-500/20 bg-orange-500/10" }
];

export default function CreatePostPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  const uploadMediaMutation = useUploadMediaMutation();
  const deleteMediaMutation = useDeleteMediaMutation();

  // AuthGuard handles redirecting to login if not authenticated

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [postType, setPostType] = useState<string>("story");
  const [postTitle, setPostTitle] = useState("");
  const [postLocation, setPostLocation] = useState<{ formatted_address: string; latitude: number; longitude: number } | null>(null);
  const [postText, setPostText] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Friends" | "Community">("Public");

  // Media attachments
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [audioItem, setAudioItem] = useState<MediaItem | null>(null);

  // UI state variables
  const [activeTab, setActiveTab] = useState<"media" | "details" | "story">("media");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  // Validation helpers
  const isMediaValid = mediaItems.length >= 1 && mediaItems.some(m => m.status === 'uploaded');
  const isUploading = mediaItems.some(m => m.status === 'uploading') || audioItem?.status === 'uploading';
  const isDetailsValid = postTitle.trim() !== "" && postLocation !== null;
  const isStoryValid = postText.trim().length >= 50;

  // Draft Preservation local storage logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("wc_post_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setPostType(parsed.postType || "story");
          setPostTitle(parsed.postTitle || "");
          setPostText(parsed.postText || "");
          setVisibility(parsed.visibility || "Public");
          if (parsed.postLocation) {
            setPostLocation(parsed.postLocation);
          }
          if (parsed.mediaItems) {
            setMediaItems(parsed.mediaItems);
          }
          if (parsed.audioItem) {
            setAudioItem(parsed.audioItem);
          }
          triggerToast("Restored draft details!");
        } catch {
          // Ignore parsing issues
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const draftObj = {
        postType,
        postTitle,
        postText,
        visibility,
        postLocation,
        mediaItems: mediaItems.map(m => ({ ...m, file: null })),
        audioItem: audioItem ? { ...audioItem, file: null } : null
      };
      localStorage.setItem("wc_post_draft", JSON.stringify(draftObj));
    }
  }, [postType, postTitle, postText, visibility, postLocation, mediaItems, audioItem]);

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wc_post_draft");
    }
  };

  // Lock navigation between wizard tabs if required field constraints are not met
  const handleTabClick = (tab: "media" | "details" | "story") => {
    if (tab === "media") {
      setActiveTab("media");
    } else if (tab === "details") {
      if (isMediaValid) {
        setActiveTab("details");
      } else {
        triggerToast("Please attach at least 1 image to proceed.");
      }
    } else if (tab === "story") {
      if (!isMediaValid) {
        triggerToast("Please attach at least 1 image to proceed.");
      } else if (!isDetailsValid) {
        triggerToast("Please fill in the title and location coordinates.");
      } else {
        setActiveTab("story");
      }
    }
  };

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<any>(null);

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };



  // Voice recording simulation
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 59) {
            stopRecording(true);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    if (audioItem) {
      triggerToast("You can only attach 1 voice note per post.");
      return;
    }
    setValidationError(null);
    setIsRecording(true);
  };

  const stopRecording = (save = true) => {
    setIsRecording(false);
    if (save) {
      const duration = recordingSeconds || 12;
      const dummyAudioBlob = new Blob([new Uint8Array(100)], { type: 'audio/mp3' });
      const mockFile = new File([dummyAudioBlob], `recorded_voice_${Date.now()}.mp3`, { type: 'audio/mp3' });
      handleMediaUpload(mockFile, true, duration);
      triggerToast("Voice note recorded!");
    }
  };

  // AI Description Enhancer helper
  const handleAiEnhance = (tone: string) => {
    if (!postText.trim() && !postTitle.trim()) {
      setValidationError("Please input a title or draft text first to enhance.");
      return;
    }
    setValidationError(null);
    setIsAiEnhancing(true);

    setTimeout(() => {
      let enhanced = "";
      const base = postText.trim() || `Exploring ${postTitle || "on the trails"}`;
      
      switch (tone) {
        case "Inspiring":
          enhanced = `✨ Journey details: ${base} | "To live is the rarest thing in the world. Most people exist, that is all." Wandering the wild coordinates and rediscovering local pathways. #Wandercall #AdventureAwaits`;
          break;
        case "Humorous":
          enhanced = `🎒 Update: ${base} | 99% sure I lost my path three times, but hey, it's called exploring! 10/10 would get lost again. #LostButFound #HikingVibes`;
          break;
        case "Detailed":
          enhanced = `📍 Logs: ${base} | Fully waded through deep streams, navigated trail markings, and set campsite coordinates. Weather was damp but visibility remained clear. #ExplorerLogs #TrailNotes`;
          break;
        case "Short & Sweet":
          enhanced = `🌲 ${base} - Unplugged and offline. #Peaceful`;
          break;
        default:
          enhanced = base;
      }
      setPostText(enhanced);
      setIsAiEnhancing(false);
      triggerToast(`Enhanced caption with ${tone} tone!`);
    }, 800);
  };

  // File selectors
  // Media helpers
  const handleMediaUpload = (file: File, isAudio = false, mockDuration?: number) => {
    const id = Math.random().toString(36).substring(7);
    const localUrl = URL.createObjectURL(file);
    const newItem: MediaItem = {
      id,
      localUrl,
      file,
      status: "uploading",
      progress: 0,
      name: file.name,
      duration: mockDuration
    };

    if (isAudio) {
      setAudioItem(newItem);
    } else {
      setMediaItems(prev => [...prev, newItem]);
    }

    uploadMediaMutation.mutate(
      {
        file,
        onUploadProgress: (ev) => {
          // Scale Axios network progress up to 90%. The remaining 10% represents backend-to-Cloudinary processing time.
          const rawProgress = ev.total ? Math.round((ev.loaded * 100) / ev.total) : 0;
          const progress = Math.min(Math.round(rawProgress * 0.9), 90);
          
          if (isAudio) {
            setAudioItem(prev => prev?.id === id ? { ...prev, progress } : prev);
          } else {
            setMediaItems(prev => prev.map(m => m.id === id ? { ...m, progress } : m));
          }
        }
      },
      {
        onSuccess: (data) => {
          if (isAudio) {
            setAudioItem(prev => prev?.id === id ? { ...prev, status: "uploaded", progress: 100, remoteUrl: data.url, publicId: data.publicId } : prev);
          } else {
            setMediaItems(prev => prev.map(m => m.id === id ? { ...m, status: "uploaded", progress: 100, remoteUrl: data.url, publicId: data.publicId } : m));
          }
        },
        onError: () => {
          if (isAudio) {
            setAudioItem(prev => prev?.id === id ? { ...prev, status: "failed" } : prev);
          } else {
            setMediaItems(prev => prev.map(m => m.id === id ? { ...m, status: "failed" } : m));
          }
          triggerToast("Failed to upload " + file.name);
        }
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setValidationError(null);

    const hasVideo = files.some(file => file.type.startsWith("video/"));
    if (hasVideo) {
      setValidationError("Videos are not allowed. Please choose images only.");
      return;
    }

    const totalImages = mediaItems.length + files.length;
    if (totalImages > 4) {
      setValidationError("You can only upload up to 4 images for a single post.");
      return;
    }

    files.forEach(file => handleMediaUpload(file, false));
    triggerToast("Images uploading...");
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);

    if (audioItem) {
      triggerToast("You can only upload 1 voice file.");
      return;
    }

    handleMediaUpload(file, true);
    triggerToast("Audio uploading...");
  };

  const removeImage = (id: string) => {
    const item = mediaItems.find(m => m.id === id);
    if (item?.publicId) {
      deleteMediaMutation.mutate(item.publicId);
    }
    setMediaItems(prev => prev.filter(m => m.id !== id));
  };

  const removeAudio = () => {
    if (audioItem?.publicId) {
      deleteMediaMutation.mutate(audioItem.publicId);
    }
    setAudioItem(null);
  };

  // Mutation
  const createPostMutation = useCreatePostMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMediaValid) {
      setValidationError("Please attach at least 1 image for your post.");
      return;
    }
    if (!isDetailsValid) {
      setValidationError("Please fill in the title and location coordinates.");
      return;
    }
    if (!isStoryValid) {
      setValidationError("Please write a story of at least 50 characters.");
      return;
    }

    if (isUploading) {
      setValidationError("Please wait for media to finish uploading.");
      return;
    }

    const payload = {
      title: postTitle,
      content: postText,
      category: postType,
      visibility: visibility === "Public" ? "PUBLIC" : visibility === "Friends" ? "FOLLOWERS" : "PRIVATE",
      locationName: postLocation?.formatted_address,
      locationLat: postLocation?.latitude,
      locationLon: postLocation?.longitude,
      images: mediaItems.map(m => m.remoteUrl).filter(Boolean),
      imagePublicIds: mediaItems.map(m => m.publicId).filter(Boolean),
      audioUrl: audioItem?.remoteUrl,
      audioPublicId: audioItem?.publicId
    };

    triggerToast("Publishing adventure...");
    
    createPostMutation.mutate(payload, {
      onSuccess: () => {
        clearDraft();
        triggerToast("Coordinates synchronized successfully!");
        router.push("/feed?published=true");
      },
      onError: (error: any) => {
        const errorMsg = error?.response?.data?.message || "Failed to publish post.";
        setValidationError(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        triggerToast("Synchronization error.");
      }
    });
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="flex flex-col min-h-screen bg-mesh-premium text-gray-900 selection:bg-brand-cyan/30 font-sans relative">
      <Navbar />

      {/* Loading Overlay Spinner during Upload */}
      {createPostMutation.isPending && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-[200]">
          <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
          <p className="text-sm font-mono text-gray-500 uppercase tracking-widest animate-pulse">
            Synchronizing adventure node...
          </p>
        </div>
      )}

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm sm:w-auto px-5 py-2.5 bg-white border-gray-200 border border-brand-cyan/20 rounded-full text-xs font-mono font-bold text-brand-cyan flex items-center justify-center gap-2 shadow-2xl backdrop-blur-md text-center"
          >
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full flex flex-col pt-24 pb-4 md:pb-6 items-center px-4 overflow-hidden">
        <div className="w-full max-w-[1280px] h-full flex flex-col overflow-hidden bg-white shadow-sm border border-gray-200 rounded-3xl backdrop-blur-2xl">
          
          {/* TOP ACTION HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
            <button 
              onClick={() => {
                if (activeTab === "story") {
                  setActiveTab("details");
                } else if (activeTab === "details") {
                  setActiveTab("media");
                } else {
                  router.push("/feed");
                }
              }}
              className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="hidden md:block flex-1 ml-3 text-left">
              <h1 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-brand-cyan animate-pulse" />
                Synchronize Coordinates
              </h1>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">Publish your live adventure logs into the global explorer dashboard</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeTab === "media" ? !isMediaValid : !isDetailsValid}
                onClick={() => {
                  if (activeTab === "media") {
                    setActiveTab("details");
                  } else if (activeTab === "details") {
                    setActiveTab("story");
                  }
                }}
                className={`h-9 px-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md cursor-pointer md:hidden ${
                  (!(isMediaValid && isDetailsValid && isStoryValid) && activeTab !== "story") ? "block" : "hidden"
                }`}
              >
                Continue
              </button>

              <button
                type="button"
                disabled={!(isMediaValid && isDetailsValid && isStoryValid) || createPostMutation.isPending}
                onClick={handleSubmit}
                className={`h-9 px-5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg cursor-pointer ${
                  (isMediaValid && isDetailsValid && isStoryValid) || activeTab === "story" ? "block" : "hidden md:block"
                }`}
              >
                {createPostMutation.isPending ? (
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Publishing...</span>
                ) : (
                  "Publish Post"
                )}
              </button>
            </div>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-xl text-[10px] font-mono font-bold shrink-0 text-left">
              ⚠️ {validationError}
            </div>
          )}

          {/* MOBILE TABS HEADER */}
          <div className="flex md:hidden border-b border-gray-200 bg-gray-50/20 shrink-0">
            {(["media", "details", "story"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab 
                    ? "border-brand-cyan text-brand-cyan bg-brand-cyan/[0.02]" 
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CORE CONTAINER */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full items-stretch">
            
            {/* LEFT AREA: WORKSPACE & MEDIA */}
            <div className={`flex-1 md:w-[60%] md:flex flex-col border-r border-gray-200 overflow-y-auto no-scrollbar p-6 gap-5 text-left ${
              activeTab === "media" ? "flex" : "hidden"
            }`}>
              
              {/* Image upload area */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Image Gallery (Upto 4 Images)</span>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange} 
                  className="hidden" 
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-brand-cyan/30 bg-white hover:bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[140px]"
                >
                  <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/15 flex items-center justify-center text-brand-cyan">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">Drag snapshots here or browse files</span>
                  <span className="text-[8px] font-mono text-gray-400">Supports PNG, JPG, WEBP (No video allowed)</span>
                </div>

                {mediaItems.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {mediaItems.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-white border-gray-200">
                        <img src={img.remoteUrl || img.localUrl} alt="Attached Preview" className={`w-full h-full object-cover ${img.status !== 'uploaded' ? 'opacity-50' : ''}`} />
                        {img.status === 'uploading' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                            <span className="text-[10px] font-bold text-gray-900">{img.progress}%</span>
                            <div className="w-3/4 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-brand-cyan transition-all duration-300" style={{ width: `${img.progress}%` }} />
                            </div>
                          </div>
                        )}
                        {img.status === 'failed' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/40">
                            <span className="text-[10px] font-bold text-gray-900 uppercase">Failed</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-gray-50/80 border border-gray-200 text-gray-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice panel */}
              <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Audio coordinates (Max 1 file)</span>
                  {audioItem && (
                    <button
                      onClick={removeAudio}
                      className="text-[9px] font-mono text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Trash2 className="h-3 w-3" /> Remove Audio
                    </button>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={audioInputRef}
                  accept="audio/*" 
                  onChange={handleAudioUpload} 
                  className="hidden" 
                />

                {!audioItem && !isRecording && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex-1 h-10 rounded-xl border border-gray-200 bg-brand-cyan/5 hover:bg-brand-cyan/10 text-[10px] font-black uppercase tracking-wider text-brand-cyan flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Mic className="h-4 w-4 shrink-0" /> Record Mic
                    </button>
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="flex-1 h-10 rounded-xl border border-gray-200 bg-white hover:bg-white/[0.03] text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Upload className="h-4 w-4 shrink-0" /> Upload File
                    </button>
                  </div>
                )}

                {isRecording && (
                  <div className="flex flex-col gap-2 items-center py-2">
                    <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-rose-600" />
                      <span className="text-[10px] font-mono font-bold">RECORDING MICROPHONE: 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                    </div>
                    <div className="flex gap-0.5 items-center h-8 w-full justify-center">
                      {[...Array(32)].map((_, i) => {
                        const h = [8, 20, 16, 6, 24, 28, 12, 16, 22, 10, 8, 26, 14, 18, 6, 20, 28, 10, 16, 12, 24, 8, 6, 18, 22, 10, 14, 8, 6, 20, 12, 6][i];
                        return (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className="w-1 rounded-full bg-rose-500/40"
                          />
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => stopRecording(true)}
                      className="h-8 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Stop & Save
                    </button>
                  </div>
                )}

                {audioItem && (
                  <div className="flex items-center gap-3 bg-gray-50/40 border border-gray-200 p-3 rounded-xl relative overflow-hidden">
                    {audioItem.status === 'uploading' && (
                       <div className="absolute bottom-0 left-0 h-0.5 bg-brand-cyan transition-all duration-300" style={{ width: `${audioItem.progress}%` }} />
                    )}
                    <div className="h-8 w-8 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 flex items-center justify-center shrink-0">
                      <Volume2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-700 truncate block">{audioItem.name} {audioItem.status === 'uploading' ? `(${audioItem.progress}%)` : ''}</span>
                      <span className="text-[9px] font-mono text-gray-500 block">Duration: 0:{audioItem.duration && audioItem.duration < 10 ? `0${audioItem.duration}` : audioItem.duration}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0 md:hidden">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Shortcut Presets</span>
                <button
                  type="button"
                  disabled={!isMediaValid}
                  onClick={() => handleTabClick("details")}
                  className="w-full h-10 rounded-xl bg-gray-50 border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Configure details metadata <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* MIDDLE AREA: METADATA & SIDEBAR */}
            <div className={`flex-1 md:w-[40%] md:flex flex-col overflow-y-auto no-scrollbar p-6 gap-5 text-left bg-gray-50/15 ${
              activeTab === "details" ? "flex" : "hidden md:flex"
            }`}>

              {/* Post Type Selector */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Adventure Category</span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => {
                    const CatIcon = cat.icon;
                    const isActive = postType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPostType(cat.id)}
                        className={`h-11 px-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isActive 
                            ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan font-bold" 
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <CatIcon className="h-4 w-4 shrink-0" />
                        <span className="text-[10px] uppercase tracking-wider">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Adventure Title</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Scaling the Triund Glacier"
                  className="h-10 px-3.5 rounded-xl bg-white shadow-sm border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-cyan focus:outline-none transition-colors font-semibold"
                />
              </div>

              {/* Geoapify Location Search */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Coordinate Location</label>
                <LocationSearch
                  onSelect={setPostLocation}
                  selectedLocation={postLocation}
                />
              </div>



              {/* Visibility Controls */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Visibility Setting</span>
                <div className="flex gap-2">
                  {([
                    { id: "Public", icon: Globe, label: "Public" },
                    { id: "Friends", icon: Users, label: "Friends" },
                    { id: "Community", icon: Lock, label: "Private" }
                  ] as const).map(item => {
                    const Icon = item.icon;
                    const isActive = visibility === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVisibility(item.id)}
                        className={`flex-1 h-9 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isActive 
                            ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan font-bold" 
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 md:hidden">
                <button
                  type="button"
                  disabled={!isDetailsValid}
                  onClick={() => handleTabClick("story")}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Write Story details <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RIGHT AREA: JOURNAL STORY AND AI GENERATOR */}
            <div className={`flex-1 md:w-[40%] md:flex flex-col overflow-y-auto no-scrollbar p-6 gap-5 text-left ${
              activeTab === "story" ? "flex" : "hidden md:flex"
            }`}>
              
              {/* Story Description input */}
              <div className="flex flex-col gap-2 flex-1 min-h-[220px] md:min-h-0 flex-grow">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">Adventure Story details</span>
                <textarea
                  required
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share details of your trail experience, paths navigated, campsites, homestay reviews, or guides (Min 50 chars)..."
                  className="flex-1 w-full p-4 rounded-2xl bg-white shadow-sm border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-cyan focus:outline-none transition-colors font-semibold resize-none min-h-[160px]"
                />
              </div>


            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
