'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Compass,
  Award,
  Zap,
  Flame,
  Calendar,
  Sparkles,
  MessageSquare,
  Lock,
  CheckCircle2,
  Trophy,
  Volume2,
  Plus,
  ArrowRight,
  Target,
  UserPlus,
  Star,
  Map,
  Search,
  Check,
  Activity,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  Paperclip,
  Share2,
  MoreHorizontal,
  Bookmark,
  Reply,
  Trash,
  Edit2,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  FlameKindling,
  User,
  Sliders,
  Settings,
  X,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  Crown,
  Heart,
  BarChart2,
  Shield,
  UserMinus,
  VolumeX,
  UserCheck
} from "lucide-react";

// =========================================================================
// REDUX & NEW COMPONENTS
// =========================================================================
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setInviteModalOpen } from "@/lib/store/slices/communityMembershipSlice";
import InviteModal from "@/components/community/InviteModal";
import { CommunityMembersModal } from "@/components/community/CommunityMembersModal";
import { useSocket } from "@/hooks/useSocket";
import { useCurrentUserQuery } from "@/hooks/api/useUserQueries";

// =========================================================================
// MOCK DATABASE & STATIC METADATA
// =========================================================================

interface CommunityNode {
  id: string;
  slug?: string;
  name: string;
  avatar: string;
  category: string;
  members: number;
  activeEvents: number;
  friendsInside: number;
  description: string;
  energyScore: number;
}

// =========================================================================

import { useCommunity, useMyCommunities, useJoinCommunity, useLeaveCommunity, useSearchCommunityMembers, useKickMember, useBanMember, useMuteMember, useTransferOwnership, useUpdateRole } from "@/hooks/useCommunity";

export default function CommunityDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { slug: communityId } = useParams();
  
  const currentUserId = useAppSelector(state => state.auth.userId);
  const kickMutation = useKickMember();
  const banMutation = useBanMember();
  const muteMutation = useMuteMember();
  const transferOwnershipMutation = useTransferOwnership();
  const updateRoleMutation = useUpdateRole();
  const [modTargetUser, setModTargetUser] = useState<any>(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  
  const { data: realCommunity, isLoading: isCommunityLoading } = useCommunity(communityId as string);

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  // Find Community Info
  const community = useMemo(() => {
    if (realCommunity) {
      return {
        id: realCommunity.id,
        name: realCommunity.name,
        avatar: realCommunity.avatar || "⛺",
        category: realCommunity.primaryCategory?.name || "Adventure",
        members: realCommunity.currentMemberCount || 1,
        activeEvents: realCommunity.isLive ? 1 : 0,
        friendsInside: realCommunity.onlineMemberCount || 0,
        description: realCommunity.description || "A WanderCall community.",
        energyScore: realCommunity.isLive ? 100 : 75,
        cover: realCommunity.cover || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400&auto=format&fit=crop",
        slug: realCommunity.slug,
        ownerId: realCommunity.ownerId,
      };
    }

    return {
      id: communityId as string,
      name: "Loading Community...",
      avatar: "⏳",
      category: "Loading...",
      members: 0,
      activeEvents: 0,
      friendsInside: 0,
      description: "Loading community details...",
      energyScore: 0,
      cover: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400&auto=format&fit=crop"
    };
  }, [realCommunity, communityId]);

  // States
  const [activeTab, setActiveTab] = useState<string>("Chat");
  const { data: myCommunities } = useMyCommunities();
  const { socket } = useSocket();
  const { data: currentUser } = useCurrentUserQuery();
  const [activeCohortUsers, setActiveCohortUsers] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [stories, setStories] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [campfires, setCampfires] = useState<any[]>([]);
  const { data: membersData } = useSearchCommunityMembers(realCommunity?.id || "", "", 50);
  const members = membersData?.items || [];
  const [gallery, setGallery] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);

  // Search filter inside members & knowledge
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Story Creator state
  const [showStoryCreator, setShowStoryCreator] = useState<boolean>(false);
  const [newStoryTitle, setNewStoryTitle] = useState<string>("");
  const [newStoryDesc, setNewStoryDesc] = useState<string>("");
  const [newStoryDiff, setNewStoryDiff] = useState<string>("Medium");
  const [newStoryLocation, setNewStoryLocation] = useState<string>("");

  // Story detail modal
  const [activeStoryDetail, setActiveStoryDetail] = useState<any | null>(null);
  const [storyCommentInput, setStoryCommentInput] = useState<string>("");

  // AI Assistant states
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [aiLogs, setAiLogs] = useState<string[]>([
    "AI Moderator active: Spam and toxicity checks running.",
    "Duplicate check initialized: Ready to scan draft posts."
  ]);
  const [aiSummaryResult, setAiSummaryResult] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Invite form friends
  const [inviteInput, setInviteInput] = useState<string>("");
  const [isCopingLink, setIsCopingLink] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Focus state for collapses
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Story Image Attachment states
  const [newStoryImage, setNewStoryImage] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStoryImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Responsive tracker
  const [viewportWidth, setViewportWidth] = useState(1200);
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const isDesktop = viewportWidth >= 1024;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const [chatContainer, setChatContainer] = useState<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef<number>(chatMessages.length);

  const scrollToBottom = (behavior: "smooth" | "auto" = "auto") => {
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior
      });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (activeTab === "Chat") {
      const isNewMessage = chatMessages.length > prevMessagesLength.current;
      prevMessagesLength.current = chatMessages.length;
      
      const behavior = isNewMessage ? "smooth" : "auto";
      scrollToBottom(behavior);
      
      const timer1 = setTimeout(() => scrollToBottom(behavior), 50);
      const timer2 = setTimeout(() => scrollToBottom(behavior), 250);
      const timer3 = setTimeout(() => scrollToBottom(behavior), 500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [chatMessages, activeTab, chatContainer]);

  // Handlers
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Toxicity simulation
    const lowercaseInput = chatInput.toLowerCase();
    if (lowercaseInput.includes("toxic") || lowercaseInput.includes("spam")) {
      setAiLogs(prev => [...prev, `AI Flagged: Message "${chatInput}" contains restricted terminology.`]);
      triggerToast("AI Moderation: Message flagged for review.");
      return;
    }

    const newMsg = {
      id: `msg-custom-${Date.now()}`,
      sender: "Rishiraj",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: "Owner",
      reactions: {},
      type: "text"
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput("");
  };

  const handleSendSpecialMessage = (type: "experience" | "campfire" | "quest") => {
    let newMsg: any;
    if (type === "experience") {
      newMsg = {
        id: `msg-special-${Date.now()}`,
        sender: "Rishiraj",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        text: "I shared the Scuba Diving checklist and active cohort bookings. Ready to dive!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: "Owner",
        type: "experience_share",
        metadata: {
          title: "PADI Open Water Reef Survey",
          price: "$120",
          location: "Netrani Island",
          duration: "1 Day",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop"
        }
      };
    } else {
      newMsg = {
        id: `msg-special-${Date.now()}`,
        sender: "Rishiraj",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        text: "I लाइटed an active voice campfire room! Click below to join the discussion:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: "Owner",
        type: "campfire_share",
        metadata: {
          title: "High Altitude Base Camp Prep",
          participants: "Sara Khan, Arjun Mehta",
          energy: "Legendary"
        }
      };
    }
    setChatMessages(prev => [...prev, newMsg]);
  };



  const handleShareStory = () => {
    if (!newStoryTitle.trim() || !newStoryLocation.trim() || !newStoryImage || !newStoryDesc.trim()) {
      triggerToast("Please fill in all fields and upload a cover image.");
      return;
    }

    // AI Duplicate Check simulation
    const exists = stories.some(s => s.title.toLowerCase() === newStoryTitle.toLowerCase());
    if (exists) {
      triggerToast("AI Alert: A story with this exact title already exists!");
      return;
    }

    const story = {
      id: `story-custom-${Date.now()}`,
      title: newStoryTitle,
      author: "Rishiraj",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      cover: newStoryImage,
      likes: 0,
      likedByMe: false,
      commentsCount: 0,
      difficulty: newStoryDiff,
      budget: "$50",
      time: "Weekend",
      category: "Adventure",
      location: newStoryLocation,
      tags: [],
      content: newStoryDesc,
      comments: []
    };

    setStories(prev => [story, ...prev]);
    // Append to global gallery
    setGallery(prev => [story.cover, ...prev]);

    // Reset
    setNewStoryTitle("");
    setNewStoryDesc("");
    setNewStoryLocation("");
    setNewStoryImage(null);
    setShowStoryCreator(false);
    triggerToast("Story shared with the community stories feed!");
  };

  const handleAddComment = (storyId: string) => {
    if (!storyCommentInput.trim()) return;
    setStories(prev => {
      return prev.map(s => {
        if (s.id === storyId) {
          const updatedComments = [
            { id: `comm-${Date.now()}`, author: "Rishiraj", text: storyCommentInput, time: "Just now", likes: 0, likedByMe: false },
            ...(s.comments || [])
          ];
          const updated = {
            ...s,
            commentsCount: updatedComments.length,
            comments: updatedComments
          };
          // Sync active detail modal
          if (activeStoryDetail?.id === s.id) {
            setActiveStoryDetail(updated);
          }
          return updated;
        }
        return s;
      });
    });
    setStoryCommentInput("");
  };

  const handleLikeComment = (storyId: string, commentId: string) => {
    setStories(prev => {
      return prev.map(s => {
        if (s.id === storyId) {
          const updatedComments = (s.comments || []).map((c: any) => {
            if (c.id === commentId) {
              const alreadyLiked = c.likedByMe;
              return {
                ...c,
                likedByMe: !alreadyLiked,
                likes: alreadyLiked ? Math.max(0, (c.likes || 0) - 1) : (c.likes || 0) + 1
              };
            }
            return c;
          });
          const updated = {
            ...s,
            comments: updatedComments
          };
          // Sync active detail modal
          if (activeStoryDetail?.id === s.id) {
            setActiveStoryDetail(updated);
          }
          return updated;
        }
        return s;
      });
    });
  };

  const handleLikeStory = (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStories(prev => {
      return prev.map(s => {
        if (s.id === storyId) {
          const alreadyLiked = s.likedByMe;
          const updated = {
            ...s,
            likedByMe: !alreadyLiked,
            likes: alreadyLiked ? Math.max(0, s.likes - 1) : s.likes + 1
          };
          if (activeStoryDetail?.id === s.id) {
            setActiveStoryDetail(updated);
          }
          return updated;
        }
        return s;
      });
    });
  };

  const handleBookExperience = (exp: any) => {
    setExperiences(prev => {
      return prev.map(e => {
        if (e.id === exp.id) {
          const booked = e.bookings.includes("Rishiraj");
          const updatedBookings = booked
            ? e.bookings.filter((b: any) => b !== "Rishiraj")
            : [...e.bookings, "Rishiraj"];
          triggerToast(booked ? "Slot cancelled." : "You have booked slots together with this cohort!");
          return { ...e, bookings: updatedBookings };
        }
        return e;
      });
    });
  };

  const handleTriggerAiSummary = () => {
    setIsSummarizing(true);
    setTimeout(() => {
      setAiSummaryResult("Recent discussion summary:\n• Sara Khan announced a sunset peak hike scheduled for Saturday.\n• Arjun Mehta confirmed attendance and prepped high altitude coordinates.\n• Booking slots cohort has been shared for alpine winter gear choices.");
      setIsSummarizing(false);
    }, 1500);
  };

  const handleToggleJoin = async () => {
    try {
      if (isJoined) {
        await leaveMutation.mutateAsync(communityId as string);
        triggerToast("Left community.");
      } else {
        await joinMutation.mutateAsync(communityId as string);
        triggerToast("Successfully joined community board!");
      }
      setIsJoined(!isJoined);
    } catch (error) {
      triggerToast("Action failed. Try again.");
    }
  };

  useEffect(() => {
    if (myCommunities && realCommunity) {
      const joined = myCommunities.some((c: any) => c.id === realCommunity.id || c.slug === realCommunity.slug);
      setIsJoined(joined);
    }
  }, [myCommunities, realCommunity]);

  const isJoinedRef = useRef(isJoined);
  useEffect(() => {
    isJoinedRef.current = isJoined;
  }, [isJoined]);

  useEffect(() => {
    if (!realCommunity?.id || !socket || !currentUser?.userId) return;
    
    socket.emit('community:join-lobby', { 
      communityId: realCommunity.id, 
      user: {
        userId: currentUser.userId,
        displayName: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        isOwner: realCommunity.ownerId === currentUser.userId,
        isMember: isJoinedRef.current,
      }
    });

    const handleActiveCohort = (data: any) => {
      if (data.communityId === realCommunity.id) {
        setActiveCohortUsers(data.activeCohort);
      }
    };

    socket.on('community:active-cohort-updated', handleActiveCohort);

    return () => {
      socket.emit('community:leave-lobby', { communityId: realCommunity.id });
      socket.off('community:active-cohort-updated', handleActiveCohort);
    };
  }, [realCommunity?.id, socket, currentUser?.userId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      setIsCopingLink(true);
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Clipboard link copied!");
      setTimeout(() => setIsCopingLink(false), 2000);
    }
  };

  const handleInvite = () => {
    if (!inviteInput.trim()) return;
    triggerToast(`Invite coordinates sent to ${inviteInput}!`);
    setInviteInput("");
    setShowInviteModal(false);
  };

  // Filtered members & guides
  const filteredMembers = useMemo(() => {
    if (!searchFilter) return members;
    const query = searchFilter.toLowerCase();
    return members.filter((m: any) => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query) || m.dna.toLowerCase().includes(query));
  }, [members, searchFilter]);

  // Filtered wiki
  const filteredWiki = useMemo(() => {
    if (!searchFilter) return knowledge;
    const query = searchFilter.toLowerCase();
    return knowledge.filter((k: any) => k.title.toLowerCase().includes(query) || k.category.toLowerCase().includes(query) || k.preview.toLowerCase().includes(query));
  }, [knowledge, searchFilter]);

  // Navigation Items
  const navItems = [
    { name: "Chat", icon: MessageSquare },
    { name: "Stories", icon: BookOpen },
    { name: "Experiences", icon: Compass },
    { name: "Members", icon: Users },
    { name: "Gallery", icon: ImageIcon },
    { name: "Leaderboard", icon: Trophy }
  ];

  return (
    <div className="w-full h-screen h-[100dvh] overflow-hidden bg-brand-bg text-white flex flex-col font-sans select-none relative">

      {/* BACKGROUND PARTICLES OR AURAS */}
      <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-purple/5 blur-3xl pointer-events-none" />

      {/* 1. CLEAN HEADER BAR SECTION (NO BANNER) */}
      <header className="w-full shrink-0 border-b border-white/5 bg-zinc-950/20 px-4 md:px-8 py-3 md:py-4 flex flex-col gap-2.5 md:gap-3 relative overflow-hidden">
        {/* Top bar back option */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/profile/community")}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl text-[10px] md:text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md backdrop-blur-md"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Galaxy Universe
          </button>
          
          {/* Mobile Right Actions */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={handleToggleJoin}
              className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md ${
                isJoined
                  ? "bg-zinc-900 border border-white/10 text-zinc-300"
                  : "bg-brand-cyan text-zinc-950"
              }`}
            >
              {isJoined ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3 fill-current" />}
              {isJoined ? "Joined" : "Join"}
            </button>
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 bg-zinc-950/60 hover:bg-zinc-950 border border-white/5 hover:border-white/15 text-brand-cyan hover:text-white rounded-xl transition-all cursor-pointer backdrop-blur-md shadow-md animate-pulse"
              title="View HQ Info"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-zinc-950/60 hover:bg-zinc-950 border border-white/5 hover:border-white/15 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer backdrop-blur-md shadow-md"
              title="Share HQ Link"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => dispatch(setInviteModalOpen(true))}
              className="p-1.5 bg-zinc-950/60 hover:bg-zinc-950 border border-white/5 hover:border-white/15 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer backdrop-blur-md shadow-md"
              title="Invite Friends"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Hero bottom details panel (Desktop/Tablet only) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4 text-left">
            {/* Avatar - Image replaced instead of emoji */}
            <div className="h-12 w-12 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-zinc-950 border border-brand-cyan flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xl">
              <img
                src={community.cover || ({"Adventure": "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop"} as Record<string, string>)[community.category] || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400&auto=format&fit=crop"}
                alt={community.name}
                className="h-full w-full object-cover rounded-xl md:rounded-2xl"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-white truncate max-w-[180px] sm:max-w-none">{community.name}</h1>
                <span className="hidden md:inline-block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-brand-cyan bg-brand-cyan/15 border border-brand-cyan/20 px-1.5 py-0.5 rounded shrink-0">
                  {community.category} HQ
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-zinc-400 max-w-2xl leading-relaxed mt-0.5">
                {community.description}
              </p>
              <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[9.5px] font-mono text-zinc-500 mt-1.5 flex-wrap">
                <button 
                  onClick={() => setMembersModalOpen(true)}
                  className="hover:text-cyan-400 transition-colors underline decoration-dotted underline-offset-4 cursor-pointer flex items-center gap-1 font-semibold"
                  title="Manage Members"
                >
                  <span>{community.members.toLocaleString()} Explorers</span>
                </button>
                <span>•</span>
                <span className="text-brand-emerald animate-pulse flex items-center gap-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" /> 84 Online
                </span>
                <span>•</span>
                <span className="text-brand-amber font-bold">{community.energyScore} Energy</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleJoin}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                isJoined
                  ? "bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
                  : "bg-brand-cyan hover:bg-cyan-400 text-zinc-950 shadow-brand-cyan/15"
              }`}
            >
              {isJoined ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5 fill-current" />}
              {isJoined ? "Joined Guild" : "Join Guild"}
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 bg-zinc-950/60 hover:bg-zinc-950 border border-white/5 hover:border-white/15 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer backdrop-blur-md"
              title="Share HQ Link"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 bg-zinc-950/60 hover:bg-zinc-950 border border-white/5 hover:border-white/15 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer backdrop-blur-md"
              title="Invite Friends"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Bar */}
      <div className="flex md:hidden w-full overflow-x-auto no-scrollbar items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-zinc-950/20 shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSearchFilter("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider ${
                  isActive
                    ? "bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan"
                    : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THREE COLUMN COMMUNITY PLATFORM VIEWPORT */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-8 py-3 md:py-4 flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch relative min-h-0 h-full overflow-hidden pb-4">

        {/* COLUMN 1: NAVIGATION RAIL (Tablet & Desktop) */}
        <aside className="hidden md:flex shrink-0 z-30 transition-all duration-300 lg:h-full lg:w-[200px] md:w-[60px] flex-col lg:gap-2 md:gap-1.5 items-stretch lg:items-start md:items-center overflow-y-auto no-scrollbar">
          <span className="hidden lg:block text-[8.5px] font-black uppercase tracking-widest text-zinc-500 text-left px-3.5 mb-1 select-none">
            Workspace sections
          </span>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSearchFilter("");
                }}
                className={`relative flex items-center transition-all cursor-pointer group w-full ${
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]"
                } lg:justify-start lg:gap-3 lg:px-3.5 lg:py-2 lg:rounded-xl lg:text-xs lg:font-bold lg:uppercase lg:tracking-wider md:justify-center md:p-2.5 md:rounded-xl`}
              >
                {/* Desktop indicator */}
                {isActive && (
                  <motion.div
                    layoutId="desktop-comm-tab"
                    className="absolute inset-0 bg-white/[0.03] border border-white/5 rounded-xl z-0 hidden lg:block"
                  />
                )}
                {/* Tablet indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r bg-brand-cyan lg:hidden" />
                )}

                <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 z-10 ${isActive ? "text-brand-cyan" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span className="hidden lg:block z-10 truncate">{item.name}</span>
              </button>
            );
          })}
        </aside>

        {/* COLUMN 2: CENTER OPERATIONS WORKSPACE */}
        <main className="flex-1 min-w-0 flex flex-col h-full relative overflow-hidden" data-lenis-prevent>
          <div className="glass-panel border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-5 w-full h-full flex flex-col justify-between overflow-hidden relative">

            {/* TAB PANEL TRANSITIONS */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative w-full pr-1 flex flex-col min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex flex-col gap-4 text-left flex-1 min-h-0"
                >

                  {/* A: GENERAL CHAT WORKSPACE */}
                  {activeTab === "Chat" && (
                    <div className="flex flex-col gap-4 h-full justify-between flex-1 min-h-0 overflow-hidden relative">
                      {/* Chat feed list */}
                      <div ref={setChatContainer} className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-36 overscroll-contain">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className="flex gap-2.5 md:gap-3 items-start max-w-[90%] md:max-w-[85%] text-left">
                            <img src={msg.avatar} alt="" className="h-7 w-7 md:h-8 md:w-8 rounded-full object-cover border border-white/5 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-zinc-200">{msg.sender}</span>
                                <span className={`text-[7px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                  msg.role === "Owner" ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple" : "bg-white/5 border-white/10 text-zinc-500"
                                }`}>
                                  {msg.role}
                                </span>
                                <span className="text-[8px] font-mono text-zinc-500">{msg.timestamp}</span>
                              </div>

                              {/* TEXT MESSAGE */}
                              {msg.type === "text" && (
                                <p className="text-xs text-zinc-300 leading-relaxed mt-1 break-words">{msg.text}</p>
                              )}

                              {/* EXPERIENCE CARD PREVIEW */}
                              {msg.type === "experience_share" && msg.metadata && (
                                <div className="glass-panel border border-white/10 p-3 rounded-2xl shadow-lg w-64 text-left mt-2 flex flex-col gap-2 relative overflow-hidden">
                                  <div className="h-24 w-full relative rounded-lg overflow-hidden">
                                    <img src={msg.metadata.image} className="h-full w-full object-cover brightness-90" alt="" />
                                    <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full">
                                      Adventure Experience
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-white truncate">{msg.metadata.title}</h4>
                                    <p className="text-[9px] text-zinc-400">{msg.metadata.location} • {msg.metadata.duration}</p>
                                    <div className="flex justify-between items-center pt-1">
                                      <span className="text-xs font-black text-brand-cyan">{msg.metadata.price}</span>
                                      <button className="px-3 py-1 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 font-black text-[9px] rounded-lg transition-all">
                                        Book Now
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* CAMPFIRE ROOM CARD PREVIEW */}
                              {msg.type === "campfire_share" && msg.metadata && (
                                <div className="glass-panel border border-brand-cyan/20 p-3.5 rounded-2xl shadow-lg w-64 text-left mt-2 flex flex-col gap-2.5 relative overflow-hidden bg-zinc-950/80">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Flame className="h-2.5 w-2.5 fill-current animate-pulse text-zinc-950" /> Active Campfire
                                    </span>
                                    <span className="text-[8.5px] font-mono text-brand-cyan font-black">{msg.metadata.energy}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-white leading-tight">{msg.metadata.title}</h4>
                                    <p className="text-[8px] text-zinc-500 truncate">Members: {msg.metadata.participants}</p>
                                  </div>
                                  <button className="w-full py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-1 shadow-md">
                                    Join Voice Channel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Floating Chat controls */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-zinc-950/95 border border-white/10 rounded-xl md:rounded-2xl flex flex-col gap-1.5 md:gap-2 z-20 shadow-xl">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendSpecialMessage("experience")}
                            className="px-2 py-1 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white transition-all flex items-center gap-1 shrink-0"
                          >
                            <Compass className="h-3 w-3 text-brand-cyan" /> Share Experience
                          </button>
                          <button
                            onClick={() => handleSendSpecialMessage("campfire")}
                            className="px-2 py-1 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white transition-all flex items-center gap-1 shrink-0"
                          >
                            <Flame className="h-3 w-3 text-brand-purple" /> Share Campfire
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 bg-zinc-900 border border-white/5 p-1 md:p-1.5 rounded-xl">
                          <button onClick={() => triggerToast("Voice recorder placeholder")} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 shrink-0">
                            <Mic className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="text"
                            placeholder="Message group..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold px-1 md:px-2"
                          />
                          <button onClick={() => triggerToast("GIF/Emoji list placeholder")} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 shrink-0">
                            <Smile className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={handleSendMessage} className="p-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 rounded-lg transition-all flex items-center justify-center shrink-0">
                            <Send className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* B: STORIES TAB */}
                  {activeTab === "Stories" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Explorer Stories Feed</h3>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Image-first immersive journals & travel diaries.</p>
                        </div>
                        <button
                          onClick={() => setShowStoryCreator(true)}
                          className="px-3.5 py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Share Story
                        </button>
                      </div>

                      {/* Masonry Stories Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-1">
                        {stories.map(story => (
                          <div
                            key={story.id}
                            onClick={() => setActiveStoryDetail(story)}
                            className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-brand-cyan/20 transition-all flex flex-col shadow-lg"
                          >
                            <div className="h-40 w-full relative">
                              <img src={story.cover} alt={story.title} className="h-full w-full object-cover brightness-90 hover:scale-102 transition-all duration-300" />
                              <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2.5 py-0.5 rounded-full">
                                {story.difficulty}
                              </span>
                            </div>
                            <div className="p-4 flex flex-col gap-2 text-left">
                              <h4 className="text-xs font-black text-white leading-snug line-clamp-2 uppercase tracking-wide">{story.title}</h4>
                              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                <img src={story.authorAvatar} alt="" className="h-5 w-5 rounded-full object-cover border border-white/10 shrink-0" />
                                <div>
                                  <p className="text-[9px] text-zinc-300 font-bold leading-none">{story.author}</p>
                                  <p className="text-[7.5px] text-zinc-500 font-mono mt-0.5">{story.location}</p>
                                </div>
                              </div>
                              <p className="text-[9.5px] text-zinc-400 line-clamp-3 leading-relaxed mt-1">{story.content}</p>
                              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 border-t border-white/5 pt-2 mt-1">
                                <button
                                  onClick={(e) => handleLikeStory(story.id, e)}
                                  className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                  <Heart className={`h-3 w-3 ${story.likedByMe ? "text-rose-500 fill-rose-500" : "text-zinc-500"}`} />
                                  <span>{story.likes}</span>
                                </button>
                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {story.commentsCount} Comments</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* C: EXPERIENCES TAB */}
                  {activeTab === "Experiences" && (
                    <div className="flex flex-col gap-4">
                      <div className="pb-2 border-b border-white/5 text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Social Adventure Bookings</h3>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Book shared Wandercall experiences together with other community members.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {experiences.map(exp => {
                          const isBooked = exp.bookings.includes("Rishiraj");
                          return (
                            <div key={exp.id} className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-lg flex flex-col text-left">
                              <div className="h-36 w-full relative">
                                <img src={exp.image} alt={exp.title} className="h-full w-full object-cover brightness-90" />
                                <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-purple text-white px-2 py-0.5 rounded-full">
                                  Rating: {exp.rating} ★
                                </span>
                              </div>
                              <div className="p-4 flex flex-col gap-3">
                                <div>
                                  <h4 className="text-xs font-black text-white leading-snug line-clamp-2 uppercase tracking-wide">{exp.title}</h4>
                                  <p className="text-[9px] text-zinc-500 mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {exp.location} • {exp.duration}
                                  </p>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                                  <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Social Booking Cohorts</span>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {exp.bookings.map((name: any) => (
                                      <span key={name} className="px-2 py-0.5 bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan text-[8px] font-bold rounded">
                                        {name}
                                      </span>
                                    ))}
                                    {exp.bookings.length === 0 && (
                                      <span className="text-[8.5px] text-zinc-500 font-mono">No bookings logged yet.</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                                  <div className="flex flex-col">
                                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase">Per traveler</span>
                                    <span className="text-sm font-black text-brand-cyan mt-0.5">{exp.price}</span>
                                  </div>
                                  <button
                                    onClick={() => handleBookExperience(exp)}
                                    className={`px-4 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                                      isBooked
                                        ? "bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
                                        : "bg-brand-cyan hover:bg-cyan-400 text-zinc-950 shadow-md shadow-brand-cyan/15"
                                    }`}
                                  >
                                    {isBooked ? "Booked" : "Book Together"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}



                  {/* G: MEMBERS TAB */}
                  {activeTab === "Members" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                        <div className="text-left">
                          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Explorer Directory</h3>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Active coordinate guides and verified travelers.</p>
                        </div>
                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl w-full sm:max-w-[200px]">
                            <Search className="h-3.5 w-3.5 text-zinc-500" />
                            <input
                              type="text"
                              placeholder="Filter members..."
                              value={searchFilter}
                              onChange={(e) => setSearchFilter(e.target.value)}
                              className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold"
                            />
                          </div>
                          <button
                            onClick={() => setMembersModalOpen(true)}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                          >
                            <Shield className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">Manage</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {filteredMembers.map((m: any) => (
                          <div key={m.id} className="bg-zinc-950/40 border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 text-left shadow-lg relative">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center font-black text-xs text-white border border-white/10 shrink-0">
                                {(m.displayName || m.username || '?').charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-white truncate uppercase tracking-wider">{m.displayName || m.username}</h4>
                                <span className="text-[9px] text-zinc-500 font-mono">@{m.username}</span>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="text-[7.5px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded border bg-brand-purple/10 border-brand-purple/20 text-brand-purple">
                                    {m.roleName || (m.isOwner ? 'OWNER' : 'MEMBER')}
                                  </span>
                                  <span className="text-[8.5px] font-mono font-bold text-zinc-500">
                                    Level {m.level || 1}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col text-right shrink-0 items-end">
                              {realCommunity?.ownerId === currentUserId && m.userId !== currentUserId && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setModTargetUser(m); }}
                                  className="text-red-500/50 hover:text-red-500 transition-colors cursor-pointer mb-1 p-1 hover:bg-white/5 rounded-full"
                                  title="Moderation Actions"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => router.push(`/profile/${m.username.replace(/^@/, "")}`)}
                                className="mt-1.5 px-2.5 py-1 bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all"
                              >
                                Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* H: GALLERY TAB */}
                  {activeTab === "Gallery" && (
                    <div className="flex flex-col gap-4">
                      <div className="pb-2 border-b border-white/5 text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Masonry Photo Gallery</h3>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Adventure portfolios and stories cover captures shared in the guild.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        {gallery.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-brand-cyan/20 transition-all cursor-pointer relative group">
                            <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] uppercase tracking-wider font-extrabold text-white">
                              Expand Image
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* J: LEADERBOARD TAB */}
                  {activeTab === "Leaderboard" && (
                    <div className="flex flex-col gap-4">
                      <div className="pb-2 border-b border-white/5 text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Contribution Rankings</h3>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Top helpful explorers and guides active this month.</p>
                      </div>

                      <div className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-lg w-full text-left">
                        <div className="grid grid-cols-4 p-3.5 bg-white/[0.02] border-b border-white/5 text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                          <span>Rank</span>
                          <span className="col-span-2">Explorer</span>
                          <span className="text-right">Score</span>
                        </div>
                        <div className="flex flex-col">
                          {[].map((user: any) => (
                            <div key={user.rank} className="grid grid-cols-4 p-3.5 border-b border-white/5 items-center text-xs font-bold transition-all hover:bg-white/[0.01]">
                              <span className="flex items-center gap-1 font-mono text-zinc-400">
                                {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `${user.rank}`}
                              </span>
                              <div className="col-span-2 flex flex-col min-w-0">
                                <span className="text-white font-black truncate">{user.name}</span>
                                <span className="text-[7.5px] text-zinc-500 font-mono tracking-wider uppercase mt-0.5">{user.badge}</span>
                              </div>
                              <span className="text-right text-brand-cyan font-black">{user.reputation} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </main>

        {/* COLUMN 3: ACTIVITY SIDEBAR (Desktop only) */}
        <aside className="hidden lg:flex w-[260px] shrink-0 flex-col gap-4 text-left lg:h-full h-auto min-h-0" data-lenis-prevent>

            {/* AI COPILOT COMPANION ENGINE */}
            <div className="glass-panel border border-white/5 p-4.5 rounded-3xl flex flex-col gap-3 relative overflow-hidden bg-zinc-950/60 shadow-lg shrink-0">
              <div className="absolute top-0 right-0 h-12 w-12 bg-brand-cyan/5 rounded-full filter blur-xl" />
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h4 className="text-[10px] font-black uppercase text-brand-cyan tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse" /> AI Headquarters
                </h4>
                <button
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className="p-1 rounded bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all text-[8px] font-black uppercase tracking-wider"
                >
                  {showAiAssistant ? "Hide" : "Open"}
                </button>
              </div>

              {showAiAssistant ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <span className="text-[7px] text-zinc-500 font-black uppercase tracking-wider">Discussion Summary</span>
                    {aiSummaryResult ? (
                      <p className="text-[8.5px] text-zinc-300 leading-normal font-semibold whitespace-pre-line">{aiSummaryResult}</p>
                    ) : (
                      <button
                        onClick={handleTriggerAiSummary}
                        disabled={isSummarizing}
                        className="w-full py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
                      >
                        {isSummarizing ? "Analyzing discussions..." : "Generate AI Summary"}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[7.5px] text-zinc-500 font-black uppercase tracking-wider">AI Operations Log</span>
                    <div className="h-20 overflow-y-auto no-scrollbar font-mono text-[7px] text-zinc-400 bg-black/40 border border-white/5 p-2 rounded-lg flex flex-col gap-1">
                      {aiLogs.map((log, idx) => (
                        <p key={idx}>&gt; {log}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Ask the AI assistant to summarize general discussions, moderator announcements, or filter duplicate questions.
                </p>
              )}
            </div>

            {/* UPCOMING COMMUNITY CALENDAR SUMMARY */}
            <div className="glass-panel border border-white/5 p-4.5 rounded-3xl flex flex-col gap-3 relative overflow-hidden bg-zinc-950/60 shadow-lg flex-1">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pb-2 border-b border-white/5">
                Active Cohorts ({activeCohortUsers.length})
              </h4>
              <div className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar flex-1">
                {activeCohortUsers.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic p-2 text-center">No active users currently in the lobby.</p>
                ) : (
                  activeCohortUsers.map((f: any) => (
                    <div key={f.id || f.userId} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={f.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"} alt="" className="h-6 w-6 rounded-full object-cover border border-white/10 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-zinc-200 truncate">{f.displayName || f.username}</p>
                          <p className="text-[7.5px] text-zinc-500 font-mono truncate">{f.roleName || (f.isOwner ? "OWNER" : "MEMBER")} • {f.status}</p>
                        </div>
                      </div>
                      <span className="text-[7.5px] font-mono text-brand-cyan shrink-0 bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/25 font-bold">
                        LVL {f.level || 1}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto pt-3 border-t border-white/5">
                <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">Today's active quest</span>
                <div className="bg-gradient-to-r from-amber-950/45 to-yellow-950/20 border border-brand-amber/20 p-2.5 rounded-2xl flex flex-col gap-1 relative overflow-hidden text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono font-bold text-brand-amber uppercase">Daily Quest</span>
                    <span className="text-[8px] font-mono text-zinc-400">120 XP</span>
                  </div>
                  <h5 className="text-[9.5px] font-black text-white uppercase tracking-wider mt-0.5">Sankri Ridge Loop Prep</h5>
                  <p className="text-[8.5px] text-zinc-400 leading-normal">Invite 3 companions and post a starmap trek coordinates draft.</p>
                </div>
              </div>
            </div>

          </aside>

      </section>

      {/* 3. MODAL POPUPS */}

      {/* Story Creator Modal */}
      <AnimatePresence>
        {showStoryCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowStoryCreator(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
              style={{ backgroundColor: '#09090b' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-brand-cyan" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Publish Explorer Story</h3>
                </div>
                <button
                  onClick={() => setShowStoryCreator(false)}
                  className="p-1 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar" data-lenis-prevent>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest">Story Title</label>
                  <input
                    type="text"
                    placeholder="Enter short engaging peak title..."
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 font-semibold outline-none focus:border-brand-cyan/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest">Difficulty</label>
                    <select
                      value={newStoryDiff}
                      onChange={(e) => setNewStoryDiff(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white font-semibold outline-none focus:border-brand-cyan/50"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Western Ghats"
                      value={newStoryLocation}
                      onChange={(e) => setNewStoryLocation(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 font-semibold outline-none focus:border-brand-cyan/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Story Cover Image / Attachment</span>
                    <span className="text-[7.5px] text-brand-cyan font-bold lowercase">Required</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer text-xs font-bold shrink-0">
                      <ImageIcon className="h-4 w-4 text-brand-cyan" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {newStoryImage && (
                      <div className="relative group h-10 w-16 rounded-lg overflow-hidden border border-white/10 shrink-0 cursor-zoom-in">
                        <img
                          src={newStoryImage}
                          alt="Attachment preview"
                          onClick={() => setNewStoryImage(null)}
                          className="hidden"
                        />
                        <img
                          src={newStoryImage}
                          alt="Attachment preview"
                          onClick={() => setZoomImage(newStoryImage)}
                          className="h-full w-full object-cover brightness-95 group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => setNewStoryImage(null)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-black text-white hover:text-rose-400 rounded-full transition-all"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest">Journal log content</label>
                  <textarea
                    rows={4}
                    placeholder="Write details of trail experiences, gear requirements, starmap layouts..."
                    value={newStoryDesc}
                    onChange={(e) => setNewStoryDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 font-semibold outline-none focus:border-brand-cyan/50 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4 shrink-0">
                <button
                  onClick={handleShareStory}
                  disabled={!newStoryTitle.trim() || !newStoryLocation.trim() || !newStoryImage || !newStoryDesc.trim()}
                  className="w-full py-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-brand-cyan/10 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                >
                  Publish Story
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Story Detail Drawer Popup */}
      <AnimatePresence>
        {activeStoryDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setActiveStoryDetail(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
              style={{ backgroundColor: '#09090b' }}
            >
              <button
                onClick={() => setActiveStoryDetail(null)}
                className="absolute top-3 right-3 p-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar" data-lenis-prevent>
                <div className="h-48 w-full relative rounded-2xl overflow-hidden -mx-1">
                  <img src={activeStoryDetail.cover} alt="" className="h-full w-full object-cover brightness-90" />
                  <span className="absolute top-2 left-2 text-[8.5px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2.5 py-0.5 rounded-full">
                    {activeStoryDetail.difficulty} • {activeStoryDetail.time}
                  </span>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <img src={activeStoryDetail.authorAvatar} alt="" className="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">{activeStoryDetail.title}</h3>
                    <p className="text-[9.5px] text-zinc-500 mt-1.5">Published by {activeStoryDetail.author} in {activeStoryDetail.location}</p>
                  </div>
                </div>

                <p className="text-[10.5px] text-zinc-300 leading-relaxed font-medium pb-2 border-b border-white/5">
                  {activeStoryDetail.content}
                </p>

                {/* Comment area */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Story Comments ({activeStoryDetail.comments?.length || 0})</h4>
                  
                  <div className="space-y-2">
                    {activeStoryDetail.comments?.map((comm: any) => (
                      <div key={comm.id} className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl text-[10px] text-left flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200">{comm.author}</span>
                            <span className="text-[8px] text-zinc-500 font-mono">{comm.time}</span>
                          </div>
                          <p className="text-zinc-400 leading-relaxed mt-1 break-words">{comm.text}</p>
                        </div>
                        <button
                          onClick={() => handleLikeComment(activeStoryDetail.id, comm.id)}
                          className="flex items-center gap-1 text-[8.5px] font-bold font-mono text-zinc-500 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0 cursor-pointer"
                        >
                          <Heart className={`h-3.5 w-3.5 ${comm.likedByMe ? "text-rose-500 fill-rose-500" : "text-zinc-500"}`} />
                          <span>{comm.likes || 0}</span>
                        </button>
                      </div>
                    ))}
                    {(!activeStoryDetail.comments || activeStoryDetail.comments.length === 0) && (
                      <p className="text-[9px] text-zinc-500 font-mono py-2">No comments published. Write yours below!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky comment input field */}
              <div className="pt-3 border-t border-white/5 mt-3 shrink-0 bg-zinc-950/20">
                <div className="flex gap-2 bg-zinc-900 border border-white/5 p-1 rounded-xl items-center">
                  <input
                    type="text"
                    placeholder="Share your thoughts..."
                    value={storyCommentInput}
                    onChange={(e) => setStoryCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(activeStoryDetail.id)}
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full px-2 font-semibold"
                  />
                  <button
                    onClick={() => handleAddComment(activeStoryDetail.id)}
                    className="px-3.5 py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[9px] font-black rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Friends Overlay modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowInviteModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl overflow-hidden flex flex-col text-left gap-4"
              style={{ backgroundColor: '#09090b' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-brand-cyan" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Invite Companions</h3>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[10px] text-zinc-400 leading-normal">
                Share coordinates link to direct friends or input traveler usernames to trigger invitation tags inside the community lobby.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Traveler Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. sara_k"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 font-semibold outline-none focus:border-brand-cyan/50"
                  />
                  <button
                    onClick={handleInvite}
                    className="px-4 py-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    Invite
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Info Modal Overlay */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowInfoModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl overflow-hidden flex flex-col text-left gap-4"
              style={{ backgroundColor: '#09090b' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-brand-cyan" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Community Info</h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 text-center py-2">
                <div className="h-20 w-20 rounded-2xl bg-zinc-950 border border-brand-cyan overflow-hidden shadow-xl shrink-0">
                  <img
                    src={community.cover || ({"Adventure": "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop"} as Record<string, string>)[community.category] || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400&auto=format&fit=crop"}
                    alt={community.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-sm md:text-lg font-black uppercase tracking-tight text-white">{community.name}</h2>
                  <span className="inline-block mt-1 text-[8.5px] font-black uppercase tracking-widest text-brand-cyan bg-brand-cyan/15 border border-brand-cyan/20 px-2 py-0.5 rounded">
                    {community.category} Headquarter
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">About HQ</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {community.description}
                  </p>
                </div>

                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider">Ecosystem Statistics</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Explorers</span>
                      <span className="text-xs font-black text-white mt-0.5 block">{community.members.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Online</span>
                      <span className="text-xs font-black text-brand-emerald mt-0.5 block">84 Active</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Energy</span>
                      <span className="text-xs font-black text-brand-amber mt-0.5 block">{community.energyScore} Score</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 mt-2 shrink-0">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full py-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-brand-cyan/10"
                >
                  Close Info
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoom Image Overlay Modal */}
      <AnimatePresence>
        {zoomImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setZoomImage(null)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col items-center"
            >
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white hover:text-rose-400 transition-all cursor-pointer border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={zoomImage}
                alt="Zoomed Attachment"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Moderation / Role Management Modal */}
      <AnimatePresence>
        {modTargetUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setModTargetUser(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl overflow-hidden flex flex-col text-left gap-5 bg-zinc-950"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Member Moderation</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">@{modTargetUser.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModTargetUser(null)}
                  className="p-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Role Management Section */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-brand-purple font-black uppercase tracking-widest block">Role Assignment</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        updateRoleMutation.mutate({
                          communityId: communityId as string,
                          targetUserId: modTargetUser.userId,
                          roleId: "ADMIN"
                        });
                        setModTargetUser(null);
                      }}
                      className="p-3 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 hover:bg-brand-purple/20 text-brand-purple text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-purple/5"
                    >
                      <Shield className="w-4 h-4" />
                      Promote Admin
                    </button>
                    <button
                      onClick={() => {
                        updateRoleMutation.mutate({
                          communityId: communityId as string,
                          targetUserId: modTargetUser.userId,
                          roleId: "MEMBER"
                        });
                        setModTargetUser(null);
                      }}
                      className="p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      Demote Member
                    </button>
                  </div>
                  {realCommunity?.ownerId === currentUserId && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to pass ownership of this community to @${modTargetUser.username}? This cannot be undone.`)) {
                          transferOwnershipMutation.mutate({
                            communityId: communityId as string,
                            newOwnerId: modTargetUser.userId
                          });
                          setModTargetUser(null);
                        }
                      }}
                      className="w-full mt-1 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/5"
                    >
                      <Crown className="w-4 h-4" />
                      Pass Ownership
                    </button>
                  )}
                </div>

                {/* Punitive Actions Section */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <span className="text-[9px] font-mono text-red-400 font-black uppercase tracking-widest block">Punitive Moderation</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        muteMutation.mutate({
                          communityId: communityId as string,
                          targetUserId: modTargetUser.userId,
                          durationMinutes: 1440
                        });
                        setModTargetUser(null);
                      }}
                      className="p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between px-4 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <VolumeX className="w-4 h-4" />
                        Mute User (24h)
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">No Chat/Post</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove @${modTargetUser.username} from community?`)) {
                          kickMutation.mutate({
                            communityId: communityId as string,
                            targetUserId: modTargetUser.userId
                          });
                          setModTargetUser(null);
                        }
                      }}
                      className="p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between px-4 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserMinus className="w-4 h-4" />
                        Remove from Community
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Kick</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Permanently ban @${modTargetUser.username} from this community? They will never be able to re-enter or join again.`)) {
                          banMutation.mutate({
                            communityId: communityId as string,
                            targetUserId: modTargetUser.userId,
                            reason: "Admin permanent ban"
                          });
                          setModTargetUser(null);
                        }
                      }}
                      className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between px-4 cursor-pointer shadow-lg shadow-red-500/5"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Ban Permanently
                      </span>
                      <span className="text-[10px] font-mono text-red-400">No Re-entry</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 mt-1 shrink-0">
                <button
                  onClick={() => setModTargetUser(null)}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Redux Invite Modal */}
      <InviteModal communityId={communityId as string} />

      {/* Community Members Operational Center Modal */}
      <CommunityMembersModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        communityId={communityId as string}
        currentUserRole={realCommunity?.myRole || 'MEMBER'}
        isOwner={realCommunity?.isOwner || false}
      />

      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 glass-panel border-brand-purple/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
