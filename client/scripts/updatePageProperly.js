const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/profile/campfires/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Fix Imports
let i = 0;
while (i < lines.length) {
  if (lines[i].includes('import { useRouter } from "next/navigation";')) {
    lines.splice(i + 1, 0, 
      'import { useLiveCampfires, useTrendingCampfires, useSearchCampfires, useCreateCampfire } from "../../../hooks/api/useCampfireDiscovery";',
      'import { useAppSelector } from "../../../lib/store/store";'
    );
    break;
  }
  i++;
}

// 2. Fix hooks in CampfiresPage
let pageStart = lines.findIndex(l => l.includes('export default function CampfiresPage() {'));
let statesStart = lines.findIndex((l, index) => index > pageStart && l.includes('const [campfires, setCampfires] = useState<CampfireRoom[]>(INITIAL_CAMPFIRES);'));

if (statesStart !== -1) {
  lines.splice(statesStart, 2, 
    '  const [searchQuery, setSearchQuery] = useState("");',
    '  const { data: liveData, isLoading: isLoadingLive } = useLiveCampfires({ limit: 50 });',
    '  const { data: trendingData } = useTrendingCampfires({ limit: 5 });',
    '  const { data: searchData, isLoading: isLoadingSearch } = useSearchCampfires({ search: searchQuery });',
    '  const createCampfire = useCreateCampfire();',
    '  const authState = useAppSelector((state) => state.auth);',
    '  const campfires = ((searchQuery ? searchData?.pages[0]?.items : liveData?.pages[0]?.items) || []) as any[];'
  );
}

// 3. Fix hostedRooms in CampfiresPage
let hostedStart = lines.findIndex((l, index) => index > pageStart && l.includes('const [hostedRooms, setHostedRooms] = useState<CampfireRoom[]>(INITIAL_HOSTED_ROOMS);'));
if (hostedStart !== -1) {
  lines.splice(hostedStart, 1,
    '  const { data: hostedData } = useSearchCampfires({ hostId: authState?.userId || \'\', limit: 100 });',
    '  const hostedRooms = (hostedData?.pages[0]?.items || []) as any[];'
  );
}

// 4. Create function
let createStart = lines.findIndex((l, index) => index > pageStart && l.includes('const handleCreateCampfire = (e: React.FormEvent) => {'));
let createEnd = lines.findIndex((l, index) => index > createStart && l.includes('router.push(`/profile/campfires/${newRoom.id}--live`);'));

if (createStart !== -1 && createEnd !== -1) {
  lines.splice(createStart, createEnd - createStart + 1,
    '  const handleCreateCampfire = async (e: React.FormEvent) => {',
    '    e.preventDefault();',
    '    if (!newCampfire.title.trim()) return;',
    '',
    '    const createdRoom = await createCampfire.mutateAsync({',
    '      communityId: "77777777-7777-7777-7777-777777777777", // Placeholder',
    '      title: newCampfire.title,',
    '      description: newCampfire.description,',
    '      category: newCampfire.category as any,',
    '      mood: newCampfire.mood as any,',
    '      visibility: newCampfire.isPrivate ? "PRIVATE" : "PUBLIC",',
    '      status: "LIVE",',
    '      capacity: 50,',
    '      speakerLimit: 10,',
    '      listenerLimit: 40',
    '    } as any);',
    '',
    '    setShowCreateModal(false);',
    '',
    '    if (createdRoom.visibility === "PRIVATE") {',
    '      if (typeof window !== "undefined") {',
    '        sessionStorage.setItem(`authorized_campfire_${createdRoom.id}`, "true");',
    '      }',
    '      setAuthorized(true);',
    '    }',
    '    ',
    '    router.push(`/profile/campfires/${createdRoom.id}--live`);',
    '  };'
  );
}

// 4.5. Remove the old localStorage effect and saveHostedRooms
let effectStart = lines.findIndex(l => l.includes('// Load from localStorage on mount'));
let effectEnd = lines.findIndex((l, index) => index > effectStart && l.includes('localStorage.setItem("wandercall_hosted_campfires", JSON.stringify(rooms));'));

if (effectStart !== -1 && effectEnd !== -1) {
  // We want to delete from effectStart down to effectEnd + 2 lines (to close the function)
  lines.splice(effectStart, effectEnd - effectStart + 3);
}

let content = lines.join('\n');

// 5. Replace isPrivate
content = content.replaceAll('room.isPrivate', 'room.visibility === "PRIVATE"');
content = content.replaceAll('createdRoom.isPrivate', 'createdRoom.visibility === "PRIVATE"');
content = content.replaceAll('activeRoom.isPrivate', 'activeRoom.visibility === "PRIVATE"');

fs.writeFileSync(filePath, content, 'utf8');
