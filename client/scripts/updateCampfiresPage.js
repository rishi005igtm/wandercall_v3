const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/profile/campfires/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
  'import { useRouter } from "next/navigation";',
  'import { useRouter } from "next/navigation";\nimport { useLiveCampfires, useTrendingCampfires, useSearchCampfires, useCreateCampfire } from "../../../../hooks/api/useCampfireDiscovery";\nimport { useAppSelector } from "../../../../lib/store/store";'
);

// 2. State hooks
// Completely replace the initial state with proper hooks and correctly ordered variables
content = content.replace(
  '  // States\n  // ==========================================\n\n  const [campfires, setCampfires] = useState<CampfireRoom[]>(INITIAL_CAMPFIRES);\n  const [searchQuery, setSearchQuery] = useState("");',
  `  // States
  // ==========================================

  const [searchQuery, setSearchQuery] = useState("");
  const { data: liveData, isLoading: isLoadingLive } = useLiveCampfires({ limit: 50 });
  const { data: trendingData } = useTrendingCampfires({ limit: 5 });
  const { data: searchData, isLoading: isLoadingSearch } = useSearchCampfires({ search: searchQuery });
  const createCampfire = useCreateCampfire();
  const authState = useAppSelector((state) => state.auth);
  
  const campfires = ((searchQuery ? searchData?.pages[0]?.items : liveData?.pages[0]?.items) || []) as any;`
);

// 3. Hosted rooms
content = content.replace(
  'const [hostedRooms, setHostedRooms] = useState<CampfireRoom[]>(INITIAL_HOSTED_ROOMS);',
  `const { data: hostedData } = useSearchCampfires({ hostId: authState?.userId || '', limit: 100 });
  const hostedRooms = (hostedData?.pages[0]?.items || []) as any;`
);

// 4. Create function
const createFuncStart = content.indexOf('const handleCreateCampfire = (e: React.FormEvent) => {');
const createFuncEnd = content.indexOf('setNewCampfire({', createFuncStart);
if (createFuncStart !== -1 && createFuncEnd !== -1) {
  const originalCreate = content.substring(createFuncStart, createFuncEnd);
  const newCreate = `const handleCreateCampfire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampfire.title.trim()) return;

    const createdRoom = await createCampfire.mutateAsync({
      communityId: "77777777-7777-7777-7777-777777777777", // Placeholder
      title: newCampfire.title,
      description: newCampfire.description,
      category: newCampfire.category as any,
      mood: newCampfire.mood as any,
      visibility: newCampfire.isPrivate ? "PRIVATE" : "PUBLIC",
      status: "LIVE",
      capacity: 50,
      speakerLimit: 10,
      listenerLimit: 40
    } as any);

    setShowCreateModal(false);

    if (createdRoom.visibility === "PRIVATE") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(\`authorized_campfire_\${createdRoom.id}\`, "true");
      }
      setAuthorized(true);
    }
    
    router.push(\`/profile/campfires/\${createdRoom.id}--live\`);
  };

  /*`;
  content = content.substring(0, createFuncStart) + newCreate + content.substring(createFuncEnd);
  
  const closeComment = content.indexOf('router.push(`/profile/campfires/${newRoom.id}--live`);', createFuncEnd);
  content = content.substring(0, closeComment + 54) + '*/' + content.substring(closeComment + 54);
}

// 5. Replace isPrivate
content = content.replaceAll('room.isPrivate', 'room.visibility === "PRIVATE"');
content = content.replaceAll('createdRoom.isPrivate', 'createdRoom.visibility === "PRIVATE"');
content = content.replaceAll('activeRoom.isPrivate', 'activeRoom.visibility === "PRIVATE"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully');
