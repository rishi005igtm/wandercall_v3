export const COMMUNITY_RANKING_CONFIG = {
  weights: {
    popularity: 0.15, // Total members score
    liveActivity: 0.25, // Live event / campfire status score
    onlineMembers: 0.2, // Real-time active users inside the community right now
    recentMessages: 0.15, // Chat activity velocity
    growth: 0.1, // Member acquisition growth rate
    friendPresence: 0.1, // Online friends currently exploring or visiting inside
    distance: 0.05, // Geo-aware cluster / location proximity match
    trending: 0.05, // Momentum / engagement spike indicator
  },
  thresholds: {
    minOnlineForActive: 1, // STRICT RULE: At least 1 user currently inside (Owner, Admin, Member, or Guest) makes the community ACTIVE
    defaultRadiusKm: 25,
    presenceTtlSeconds: 120, // Auto cleanup TTL for stale heartbeats
  },
  clusterCategories: [
    {
      id: 'c-adventure',
      name: 'Adventure',
      category: 'Adventure',
      theme: 'Trekking, Diving, Surfing',
      color: 'stroke-brand-cyan fill-brand-cyan/20',
      glow: 'rgba(6, 182, 212, 0.4)',
      icon: '🏔️',
    },
    {
      id: 'c-food',
      name: 'Food & Eats',
      category: 'Food',
      theme: 'Street Food, Heritage Cafes',
      color: 'stroke-brand-purple fill-brand-purple/20',
      glow: 'rgba(139, 92, 246, 0.4)',
      icon: '🍛',
    },
    {
      id: 'c-photography',
      name: 'Photography',
      category: 'Photography',
      theme: 'Landscapes, Wildlife, Street',
      color: 'stroke-brand-emerald fill-brand-emerald/20',
      glow: 'rgba(16, 185, 129, 0.4)',
      icon: '📸',
    },
    {
      id: 'c-storytelling',
      name: 'Storytelling',
      category: 'Storytelling',
      theme: 'History Trails, Writing',
      color: 'stroke-brand-amber fill-brand-amber/20',
      glow: 'rgba(245, 158, 11, 0.4)',
      icon: '🖋️',
    },
    {
      id: 'c-travel',
      name: 'Travel & Nomads',
      category: 'Travel',
      theme: 'Solo Backpackers, Homestays',
      color: 'stroke-rose-500 fill-rose-500/20',
      glow: 'rgba(244, 63, 94, 0.4)',
      icon: '✈️',
    },
    {
      id: 'c-fitness',
      name: 'Fitness & Runs',
      category: 'Fitness',
      theme: 'Trail Runs, Road Cycling',
      color: 'stroke-blue-500 fill-blue-500/20',
      glow: 'rgba(59, 130, 246, 0.4)',
      icon: '🚴',
    },
    {
      id: 'c-learning',
      name: 'Learning & Craft',
      category: 'Learning',
      theme: 'Survival Skills, Astro-gazing',
      color: 'stroke-orange-500 fill-orange-500/20',
      glow: 'rgba(249, 115, 22, 0.4)',
      icon: '🎒',
    },
    {
      id: 'c-nightlife',
      name: 'Nightlife',
      category: 'Nightlife',
      theme: 'Campfires, Pub Crawls',
      color: 'stroke-pink-500 fill-pink-500/20',
      glow: 'rgba(236, 72, 153, 0.4)',
      icon: '🌌',
    },
    {
      id: 'c-technology',
      name: 'Technology',
      category: 'Technology',
      theme: 'AI Explorers, Nomadic Tech',
      color: 'stroke-indigo-500 fill-indigo-500/20',
      glow: 'rgba(99, 102, 241, 0.4)',
      icon: '💻',
    },
    {
      id: 'c-music',
      name: 'Music',
      category: 'Music',
      theme: 'Campfire Jams, Acoustic Trails',
      color: 'stroke-yellow-500 fill-yellow-500/20',
      glow: 'rgba(234, 179, 8, 0.4)',
      icon: '🎸',
    },
    {
      id: 'c-wellness',
      name: 'Wellness',
      category: 'Wellness',
      theme: 'Sunrise Yoga, Meditation Woods',
      color: 'stroke-teal-500 fill-teal-500/20',
      glow: 'rgba(20, 184, 166, 0.4)',
      icon: '🧘',
    },
    {
      id: 'c-nature',
      name: 'Nature',
      category: 'Nature',
      theme: 'Botanical Walks, Bird Watching',
      color: 'stroke-green-500 fill-green-500/20',
      glow: 'rgba(34, 197, 94, 0.4)',
      icon: '🌲',
    },
  ],
};
