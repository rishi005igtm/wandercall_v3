const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/profile/campfires/page.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Fix Imports
let importIdx = lines.findIndex(l => l.includes('import { useRouter } from "next/navigation";'));
if (importIdx !== -1) {
  lines.splice(importIdx + 1, 0, 
    'import { useLiveCampfires, useTrendingCampfires, useSearchCampfires, useCreateCampfire } from "../../../hooks/api/useCampfireDiscovery";',
    'import { useAppSelector } from "../../../lib/store/store";'
  );
}

// 2. Fix CampfireRoom interface visibility
let interfaceIdx = lines.findIndex(l => l.includes('isPrivate: boolean;'));
if (interfaceIdx !== -1) {
  lines[interfaceIdx] = '  isPrivate?: boolean;\n  visibility?: "PUBLIC" | "PRIVATE";';
}

// 3. Replace state hooks
let statesStart = lines.findIndex(l => l.includes('const [campfires, setCampfires] = useState<CampfireRoom[]>(INITIAL_CAMPFIRES);'));
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

// 4. Replace hostedRooms and delete localstorage
let hostedStart = lines.findIndex(l => l.includes('const [hostedRooms, setHostedRooms] = useState<CampfireRoom[]>(INITIAL_HOSTED_ROOMS);'));
if (hostedStart !== -1) {
  lines.splice(hostedStart, 1,
    '  const { data: hostedData } = useSearchCampfires({ hostId: authState?.userId || \'\', limit: 100 });',
    '  const hostedRooms = (hostedData?.pages[0]?.items || []) as any[];'
  );
}

let effectStart = lines.findIndex(l => l.includes('// Load from localStorage on mount'));
let effectEnd = lines.findIndex((l, index) => index > effectStart && l.includes('localStorage.setItem("wandercall_hosted_campfires", JSON.stringify(rooms));'));
if (effectStart !== -1 && effectEnd !== -1) {
  lines.splice(effectStart, effectEnd - effectStart + 3);
}

// 5. Replace handleCreateRoomSubmit
let createStart = lines.findIndex(l => l.includes('const handleCreateRoomSubmit = (e: React.FormEvent) => {'));
let createEnd = lines.findIndex((l, index) => index > createStart && l.includes('router.push(`/profile/campfires/${getRoomSlug(createdRoom)}`);'));
if (createStart !== -1 && createEnd !== -1) {
  lines.splice(createStart, createEnd - createStart + 2,
    '  const handleCreateRoomSubmit = async (e: React.FormEvent) => {',
    '    e.preventDefault();',
    '    if (!newTitle.trim()) return;',
    '',
    '    const createdRoom = await createCampfire.mutateAsync({',
    '      communityId: "77777777-7777-7777-7777-777777777777",',
    '      title: newTitle,',
    '      description: newDescription || "Gather round the fire and share stories.",',
    '      category: newCategory as any,',
    '      mood: newMood as any,',
    '      visibility: newVisibility === "private" ? "PRIVATE" : "PUBLIC",',
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
    '    }',
    '    ',
    '    // reset fields',
    '    setNewTitle("");',
    '    setNewDescription("");',
    '    setNewPassword("");',
    '    setNewVisibility("public");',
    '',
    '    router.push(`/profile/campfires/${createdRoom.id}--live`);',
    '  };'
  );
}

// 6. Delete handleDeleteHosted because we don't have delete mutation implemented yet (or just ignore its local state)
let deleteStart = lines.findIndex(l => l.includes('const handleDeleteHosted = (id: string) => {'));
if (deleteStart !== -1) {
  let deleteEnd = lines.findIndex((l, index) => index > deleteStart && l.includes('saveHostedRooms(updated);'));
  if (deleteEnd !== -1) {
    // Just make it a no-op
    lines.splice(deleteStart + 1, deleteEnd - deleteStart + 1, '    // TODO: implement delete mutation', '  };');
  }
}

let content = lines.join('\n');

// 7. Replace isPrivate rendering
content = content.replaceAll('room.isPrivate', 'room.visibility === "PRIVATE"');
content = content.replaceAll('createdRoom.isPrivate', 'createdRoom.visibility === "PRIVATE"');
content = content.replaceAll('activeRoom.isPrivate', 'activeRoom.visibility === "PRIVATE"');

fs.writeFileSync(filePath, content, 'utf8');
