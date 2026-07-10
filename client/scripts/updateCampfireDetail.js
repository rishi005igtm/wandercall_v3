const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/profile/campfires/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
content = content.replace(
  'import { useParams, useRouter } from "next/navigation";',
  'import { useParams, useRouter } from "next/navigation";\nimport { useCampfire, useStartCampfire, useEndCampfire } from "../../../../hooks/api/useCampfire";\nimport { useAppSelector } from "../../../../lib/store/store";'
);

// 2. Fetch the campfire instead of reading from INITIAL_CAMPFIRES
content = content.replace(
  '  const [activeRoom, setActiveRoom] = useState<CampfireRoom | null>(null);',
  `  const { data: activeRoom, isLoading } = useCampfire(roomId);
  const startCampfire = useStartCampfire(roomId);
  const endCampfire = useEndCampfire(roomId);
  const authState = useAppSelector((state) => state.auth);
  const isUserHost = useMemo(() => {
    if (!activeRoom || !authState?.userId) return false;
    return activeRoom.hostId === authState.userId;
  }, [activeRoom, authState.userId]);`
);

// We need to disable the useEffect that loads the activeRoom locally
const oldEffect = `  useEffect(() => {
    // 1. Resolve active room
    let room: CampfireRoom | undefined;

    // Check custom hosted rooms in local storage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wandercall_hosted_campfires");
      if (stored) {
        try {
          const customRooms: CampfireRoom[] = JSON.parse(stored);
          room = customRooms.find(r => r.id === roomId);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Load from INITIAL_CAMPFIRES if not in custom hosted
    if (!room) {
      room = INITIAL_CAMPFIRES.find(r => r.id === roomId);
    }
    
    if (room) {
      setActiveRoom(room);
    } else {
      router.push("/profile/campfires");
    }
  }, [roomId, router]);`;

content = content.replace(oldEffect, '');

// Also remove the "if (!activeRoom) return null;" local storage init stuff if it's there
content = content.replace('if (!activeRoom) return null;', 'if (isLoading || !activeRoom) return null;');

// Now we need to update the host controls.
// Search for "Start Campfire" and replace its onClick
content = content.replace(
  'onClick={() => triggerToast("Starting campfire transmission...")}',
  'onClick={async () => { await startCampfire.mutateAsync(); triggerToast("Campfire started!"); }}'
);

content = content.replace(
  'onClick={() => triggerToast("Ending campfire session...")}',
  'onClick={async () => { await endCampfire.mutateAsync(); triggerToast("Campfire ended!"); router.push("/profile/campfires"); }}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully');
