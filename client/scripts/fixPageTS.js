const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/profile/campfires/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix user -> authState
content = content.replace(
  'const user = useAppSelector((state) => state.auth.user);',
  'const authState = useAppSelector((state) => state.auth);'
);
content = content.replace(
  'const { data: hostedData } = useSearchCampfires({ hostId: user?.userId || \'\', limit: 100 });',
  'const { data: hostedData } = useSearchCampfires({ hostId: authState?.userId || \'\', limit: 100 });'
);

// 2. Move searchQuery up
content = content.replace(
  'const { data: searchData, isLoading: isLoadingSearch } = useSearchCampfires({ search: searchQuery });',
  '// moved search query'
);
content = content.replace(
  '  const [searchQuery, setSearchQuery] = useState("");',
  '  const [searchQuery, setSearchQuery] = useState("");\n  const { data: searchData, isLoading: isLoadingSearch } = useSearchCampfires({ search: searchQuery });'
);

// 3. Fix isPrivate -> visibility === 'PRIVATE'
content = content.replaceAll('room.isPrivate', 'room.visibility === "PRIVATE"');
content = content.replaceAll('createdRoom.isPrivate', 'createdRoom.visibility === "PRIVATE"');
content = content.replaceAll('activeRoom.isPrivate', 'activeRoom.visibility === "PRIVATE"');

fs.writeFileSync(filePath, content, 'utf8');
