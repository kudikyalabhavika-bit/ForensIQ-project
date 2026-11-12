// Fictional demo data for the ForensIQ dashboard and pages.
// None of this is connected to a real database.

// ===== Dashboard stats =====
export const stats = [
  { id: 'active-cases', label: 'Active Cases', value: 24, change: '+8.2%', icon: 'folder-open', trend: 'up' },
  { id: 'saved-cases', label: 'Saved Cases', value: 86, change: '+12.4%', icon: 'save', trend: 'up' },
  { id: 'database-records', label: 'Database Records', value: 1284, change: '+4.7%', icon: 'database', trend: 'up' },
  { id: 'ai-matches', label: 'AI Matches', value: 312, change: '+18.6%', icon: 'scan-face', trend: 'up' },
]

// ===== Dashboard recent cases =====
export const recentCases = [
  {
    id: 'CASE-2026-014',
    name: 'Mall Road Investigation',
    suspect: 'Rahul Sharma',
    investigator: 'A. Patil',
    status: 'Active',
    lastUpdated: '2 hours ago',
  },
  {
    id: 'CASE-2026-015',
    name: 'Central Market Investigation',
    suspect: 'Amit Verma',
    investigator: 'S. Deshmukh',
    status: 'Under Investigation',
    lastUpdated: '5 hours ago',
  },
  {
    id: 'CASE-2026-016',
    name: 'Station Road Investigation',
    suspect: 'Vikram Joshi',
    investigator: 'R. Patil',
    status: 'Pending',
    lastUpdated: '1 day ago',
  },
  {
    id: 'CASE-2026-017',
    name: 'Riverside Park Case',
    suspect: 'Arjun Mehta',
    investigator: 'K. Singh',
    status: 'Active',
    lastUpdated: '1 day ago',
  },
  {
    id: 'CASE-2026-018',
    name: 'Old Town Robbery',
    suspect: 'Deepak Nair',
    investigator: 'M. Iyer',
    status: 'Closed',
    lastUpdated: '3 days ago',
  },
]

// ===== Dashboard activity timeline =====
export const activityTimeline = [
  { id: 1, text: 'Sketch generated', time: '2 hours ago', icon: 'pen-tool' },
  { id: 2, text: 'Case CASE-2026-014 created', time: '5 hours ago', icon: 'folder-plus' },
  { id: 3, text: 'Database record reviewed', time: 'Yesterday', icon: 'database' },
  { id: 4, text: 'AI analysis completed', time: 'Yesterday', icon: 'scan-face' },
  { id: 5, text: 'Evidence added', time: '2 days ago', icon: 'file-plus' },
]

// ===== Sidebar navigation items =====
export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
  { id: 'sketch', label: 'Sketch Generation', icon: 'pen-tool', path: '/sketch-generation' },
  { id: 'database', label: 'Criminal Database', icon: 'database', path: '/criminal-database' },
  { id: 'cases', label: 'Saved Cases', icon: 'folder-open', path: '/saved-cases' },
  { id: 'analysis', label: 'AI Match & Analysis', icon: 'scan-face', path: '/ai-analysis' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
]

// ===== Investigators =====
export const investigators = [
  'A. Patil',
  'S. Deshmukh',
  'R. Patil',
  'K. Singh',
  'M. Iyer',
]

// ===== Criminal Database — fictional records =====
export const criminals = [
  {
    id: 'CRIM-001',
    name: 'Rahul Sharma',
    age: 32,
    gender: 'Male',
    height: '5\'9"',
    location: 'Pune, Maharashtra',
    caseId: 'CASE-2026-014',
    status: 'Active',
    lastUpdated: '2 hours ago',
    aliases: 'Rahul, R.S.',
    crime: 'Theft',
    investigator: 'A. Patil',
  },
  {
    id: 'CRIM-002',
    name: 'Vikram Joshi',
    age: 28,
    gender: 'Male',
    height: '5\'11"',
    location: 'Mumbai, Maharashtra',
    caseId: 'CASE-2026-016',
    status: 'Pending',
    lastUpdated: '1 day ago',
    aliases: 'Vicky',
    crime: 'Assault',
    investigator: 'R. Patil',
  },
  {
    id: 'CRIM-003',
    name: 'Amit Verma',
    age: 35,
    gender: 'Male',
    height: '5\'8"',
    location: 'Nagpur, Maharashtra',
    caseId: 'CASE-2026-015',
    status: 'Under Investigation',
    lastUpdated: '5 hours ago',
    aliases: 'Amit, A.V.',
    crime: 'Fraud',
    investigator: 'S. Deshmukh',
  },
  {
    id: 'CRIM-004',
    name: 'Sneha Patil',
    age: 26,
    gender: 'Female',
    height: '5\'4"',
    location: 'Thane, Maharashtra',
    caseId: 'CASE-2026-019',
    status: 'Active',
    lastUpdated: '3 hours ago',
    aliases: 'Sneha',
    crime: 'Cyber Crime',
    investigator: 'A. Patil',
  },
  {
    id: 'CRIM-005',
    name: 'Karan Deshmukh',
    age: 30,
    gender: 'Male',
    height: '6\'0"',
    location: 'Nashik, Maharashtra',
    caseId: 'CASE-2026-020',
    status: 'Under Investigation',
    lastUpdated: '6 hours ago',
    aliases: 'Karan, K.D.',
    crime: 'Robbery',
    investigator: 'S. Deshmukh',
  },
  {
    id: 'CRIM-006',
    name: 'Pooja Naik',
    age: 24,
    gender: 'Female',
    height: '5\'3"',
    location: 'Pune, Maharashtra',
    caseId: 'CASE-2026-021',
    status: 'Closed',
    lastUpdated: '1 week ago',
    aliases: 'Pooja',
    crime: 'Forgery',
    investigator: 'R. Patil',
  },
  {
    id: 'CRIM-007',
    name: 'Arjun Mehta',
    age: 33,
    gender: 'Male',
    height: '5\'10"',
    location: 'Aurangabad, Maharashtra',
    caseId: 'CASE-2026-017',
    status: 'Active',
    lastUpdated: '1 day ago',
    aliases: 'Arjun, A.M.',
    crime: 'Burglary',
    investigator: 'K. Singh',
  },
  {
    id: 'CRIM-008',
    name: 'Deepak Nair',
    age: 29,
    gender: 'Male',
    height: '5\'7"',
    location: 'Mumbai, Maharashtra',
    caseId: 'CASE-2026-018',
    status: 'Closed',
    lastUpdated: '3 days ago',
    aliases: 'Deepak, D.N.',
    crime: 'Theft',
    investigator: 'M. Iyer',
  },
  {
    id: 'CRIM-009',
    name: 'Priya Kulkarni',
    age: 27,
    gender: 'Female',
    height: '5\'5"',
    location: 'Pimpri, Maharashtra',
    caseId: 'CASE-2026-022',
    status: 'Pending',
    lastUpdated: '2 days ago',
    aliases: 'Priya',
    crime: 'Extortion',
    investigator: 'K. Singh',
  },
  {
    id: 'CRIM-010',
    name: 'Sahil Pawar',
    age: 31,
    gender: 'Male',
    height: '5\'9"',
    location: 'Kolhapur, Maharashtra',
    caseId: 'CASE-2026-023',
    status: 'Under Investigation',
    lastUpdated: '4 hours ago',
    aliases: 'Sahil, S.P.',
    crime: 'Arms Act',
    investigator: 'M. Iyer',
  },
]

// ===== Previous cases per criminal (fictional) =====
export const previousCases = {
  'CRIM-001': [
    { id: 'CASE-2026-014', name: 'Mall Road Investigation', date: '20 Sep 2026', status: 'Active', location: 'Pune, Maharashtra' },
    { id: 'CASE-2026-009', name: 'Marketplace Theft', date: '15 Aug 2026', status: 'Closed', location: 'Pune, Maharashtra' },
    { id: 'CASE-2026-003', name: 'Jewelry Shop Burglary', date: '10 Jul 2026', status: 'Closed', location: 'Pune, Maharashtra' },
  ],
  'CRIM-002': [
    { id: 'CASE-2026-016', name: 'Station Road Investigation', date: '22 Sep 2026', status: 'Pending', location: 'Mumbai, Maharashtra' },
    { id: 'CASE-2026-010', name: 'Street Assault Case', date: '05 Aug 2026', status: 'Closed', location: 'Mumbai, Maharashtra' },
  ],
  'CRIM-003': [
    { id: 'CASE-2026-015', name: 'Central Market Investigation', date: '21 Sep 2026', status: 'Under Investigation', location: 'Nagpur, Maharashtra' },
    { id: 'CASE-2026-007', name: 'Online Fraud Ring', date: '18 Aug 2026', status: 'Closed', location: 'Nagpur, Maharashtra' },
  ],
  'CRIM-004': [
    { id: 'CASE-2026-019', name: 'Cyber Fraud Investigation', date: '23 Sep 2026', status: 'Active', location: 'Thane, Maharashtra' },
  ],
  'CRIM-005': [
    { id: 'CASE-2026-020', name: 'Highway Robbery Case', date: '23 Sep 2026', status: 'Under Investigation', location: 'Nashik, Maharashtra' },
    { id: 'CASE-2026-012', name: 'Bank Heist Attempt', date: '02 Sep 2026', status: 'Closed', location: 'Nashik, Maharashtra' },
  ],
  'CRIM-006': [
    { id: 'CASE-2026-021', name: 'Document Forgery Case', date: '15 Sep 2026', status: 'Closed', location: 'Pune, Maharashtra' },
  ],
  'CRIM-007': [
    { id: 'CASE-2026-017', name: 'Riverside Park Case', date: '22 Sep 2026', status: 'Active', location: 'Aurangabad, Maharashtra' },
    { id: 'CASE-2026-006', name: 'Residential Burglary', date: '12 Aug 2026', status: 'Closed', location: 'Aurangabad, Maharashtra' },
  ],
  'CRIM-008': [
    { id: 'CASE-2026-018', name: 'Old Town Robbery', date: '20 Sep 2026', status: 'Closed', location: 'Mumbai, Maharashtra' },
    { id: 'CASE-2026-002', name: 'Electronics Store Theft', date: '03 Jul 2026', status: 'Closed', location: 'Mumbai, Maharashtra' },
  ],
  'CRIM-009': [
    { id: 'CASE-2026-022', name: 'Blackmail Investigation', date: '21 Sep 2026', status: 'Pending', location: 'Pimpri, Maharashtra' },
  ],
  'CRIM-010': [
    { id: 'CASE-2026-023', name: 'Illegal Arms Recovery', date: '23 Sep 2026', status: 'Under Investigation', location: 'Kolhapur, Maharashtra' },
  ],
}

// ===== Evidence per criminal (fictional) =====
export const evidence = {
  'CRIM-001': [
    { id: 'EV-001', title: 'CCTV Footage', description: 'Mall Road camera footage showing suspect at 21:30 IST.', date: '20 Sep 2026', icon: 'video' },
    { id: 'EV-002', title: 'Fingerprint Sample', description: 'Partial fingerprint recovered from storefront glass.', date: '20 Sep 2026', icon: 'fingerprint' },
    { id: 'EV-003', title: 'Witness Statement', description: 'Shop owner identified suspect from photo array.', date: '21 Sep 2026', icon: 'file-text' },
  ],
  'CRIM-002': [
    { id: 'EV-004', title: 'Witness Statement', description: 'Two witnesses reported altercation near station.', date: '22 Sep 2026', icon: 'file-text' },
    { id: 'EV-005', title: 'Mobile Device Record', description: 'Call records placed suspect near the scene.', date: '22 Sep 2026', icon: 'smartphone' },
  ],
  'CRIM-003': [
    { id: 'EV-006', title: 'Digital Transaction Log', description: 'Suspicious bank transfers traced to suspect.', date: '21 Sep 2026', icon: 'credit-card' },
    { id: 'EV-007', title: 'Vehicle Registration', description: 'Vehicle linked to fraud transactions.', date: '21 Sep 2026', icon: 'car' },
  ],
  'CRIM-004': [
    { id: 'EV-008', title: 'Digital Forensic Image', description: 'Hard drive image from seized laptop.', date: '23 Sep 2026', icon: 'hard-drive' },
    { id: 'EV-009', title: 'Witness Statement', description: 'Victim reported unauthorized account access.', date: '23 Sep 2026', icon: 'file-text' },
  ],
  'CRIM-005': [
    { id: 'EV-010', title: 'CCTV Footage', description: 'Highway toll camera captured suspect vehicle.', date: '23 Sep 2026', icon: 'video' },
    { id: 'EV-011', title: 'Fingerprint Sample', description: 'Prints recovered from abandoned vehicle.', date: '23 Sep 2026', icon: 'fingerprint' },
  ],
  'CRIM-006': [
    { id: 'EV-012', title: 'Document Sample', description: 'Forged documents seized from residence.', date: '15 Sep 2026', icon: 'file-text' },
  ],
  'CRIM-007': [
    { id: 'EV-013', title: 'CCTV Footage', description: 'Park entrance camera showing suspect.', date: '22 Sep 2026', icon: 'video' },
    { id: 'EV-014', title: 'Fingerprint Sample', description: 'Prints from window latch at scene.', date: '22 Sep 2026', icon: 'fingerprint' },
    { id: 'EV-015', title: 'Vehicle Registration', description: 'Motorbike registered to suspect.', date: '22 Sep 2026', icon: 'car' },
  ],
  'CRIM-008': [
    { id: 'EV-016', title: 'Witness Statement', description: 'Store clerk identified suspect.', date: '20 Sep 2026', icon: 'file-text' },
    { id: 'EV-017', title: 'Mobile Device Record', description: 'Location data places suspect at scene.', date: '20 Sep 2026', icon: 'smartphone' },
  ],
  'CRIM-009': [
    { id: 'EV-018', title: 'Digital Communication Log', description: 'Threatening messages traced to suspect.', date: '21 Sep 2026', icon: 'message-square' },
  ],
  'CRIM-010': [
    { id: 'EV-019', title: 'Fingerprint Sample', description: 'Prints recovered from seized weapon.', date: '23 Sep 2026', icon: 'fingerprint' },
    { id: 'EV-020', title: 'Vehicle Registration', description: 'Unregistered vehicle at checkpoint.', date: '23 Sep 2026', icon: 'car' },
  ],
}

// ===== AI Match demo results (fictional) =====
export const aiMatchResults = [
  { id: 'CRIM-001', name: 'Rahul Sharma', matchScore: 94, confidence: 'High', criminalId: 'CRIM-001' },
  { id: 'CRIM-007', name: 'Arjun Mehta', matchScore: 78, confidence: 'Medium', criminalId: 'CRIM-007' },
  { id: 'CRIM-003', name: 'Amit Verma', matchScore: 65, confidence: 'Medium', criminalId: 'CRIM-003' },
  { id: 'CRIM-005', name: 'Karan Deshmukh', matchScore: 52, confidence: 'Low', criminalId: 'CRIM-005' },
  { id: 'CRIM-008', name: 'Deepak Nair', matchScore: 41, confidence: 'Low', criminalId: 'CRIM-008' },
]

// ===== Facial feature similarity (fictional) =====
export const featureSimilarity = [
  { feature: 'Eyes', score: 97 },
  { feature: 'Nose', score: 91 },
  { feature: 'Eyebrows', score: 93 },
  { feature: 'Face Shape', score: 95 },
  { feature: 'Jawline', score: 89 },
  { feature: 'Mouth', score: 88 },
  { feature: 'Hairline', score: 84 },
]

// ===== Matching feature chips =====
export const matchingFeatures = ['Eyes', 'Nose', 'Eyebrows', 'Face Shape', 'Jawline', 'Hairline']

// ===== Investigation cases =====
export const cases = [
  { id: 'CASE-2026-014', name: 'Mall Road Investigation', suspect: 'Rahul Sharma', investigator: 'A. Patil', status: 'Active', lastUpdated: '2 hours ago' },
  { id: 'CASE-2026-015', name: 'Central Market Investigation', suspect: 'Amit Verma', investigator: 'S. Deshmukh', status: 'Under Investigation', lastUpdated: '5 hours ago' },
  { id: 'CASE-2026-016', name: 'Station Road Investigation', suspect: 'Vikram Joshi', investigator: 'R. Patil', status: 'Pending', lastUpdated: '1 day ago' },
  { id: 'CASE-2026-017', name: 'Riverside Park Case', suspect: 'Arjun Mehta', investigator: 'K. Singh', status: 'Active', lastUpdated: '1 day ago' },
  { id: 'CASE-2026-018', name: 'Old Town Robbery', suspect: 'Deepak Nair', investigator: 'M. Iyer', status: 'Closed', lastUpdated: '3 days ago' },
  { id: 'CASE-2026-019', name: 'Cyber Fraud Investigation', suspect: 'Sneha Patil', investigator: 'A. Patil', status: 'Active', lastUpdated: '3 hours ago' },
  { id: 'CASE-2026-020', name: 'Highway Robbery Case', suspect: 'Karan Deshmukh', investigator: 'S. Deshmukh', status: 'Under Investigation', lastUpdated: '6 hours ago' },
  { id: 'CASE-2026-021', name: 'Document Forgery Case', suspect: 'Pooja Naik', investigator: 'R. Patil', status: 'Closed', lastUpdated: '1 week ago' },
]

// ===== Demo saved sketches (seeded into localStorage on first visit) =====
export const demoSketches = [
  {
    id: 'SKETCH-001',
    caseId: 'CASE-2026-014',
    suspect: 'Unknown Suspect',
    investigator: 'A. Patil',
    createdAt: '22 Sep 2026 • 02:33 PM',
    image: '',
    notes: 'Generated using Fabric.js facial features.',
    status: 'Generated',
  },
  {
    id: 'SKETCH-002',
    caseId: 'CASE-2026-015',
    suspect: 'Unknown Suspect',
    investigator: 'S. Deshmukh',
    createdAt: '22 Sep 2026 • 04:15 PM',
    image: '',
    notes: 'Suspect described as mid-30s male, short hair.',
    status: 'Generated',
  },
  {
    id: 'SKETCH-003',
    caseId: 'CASE-2026-016',
    suspect: 'Unknown Suspect',
    investigator: 'R. Patil',
    createdAt: '23 Sep 2026 • 09:20 AM',
    image: '',
    notes: 'Witness described a beard and sharp nose.',
    status: 'Active',
  },
]
