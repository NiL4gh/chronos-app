function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── TEAM MEMBERS ────────────────────────────────────────────────────────────
export const teamMembers = [
  {
    id: 'u1',
    name: 'Priya Sharma',
    role: 'Lead Frontend Engineer',
    email: 'priya@acme.io',
    status: 'active',
    activityLevel: 88,
    currentProject: 'Redesign Landing Page',
    currentTask: 'Building hero section component',
    hoursToday: 5.5,
    hoursWeek: 32.5,
    avatar: null,
    hourlyRate: 95,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u2',
    name: 'Marcus Webb',
    role: 'Backend Engineer',
    email: 'marcus@acme.io',
    status: 'active',
    activityLevel: 71,
    currentProject: 'API Gateway v2',
    currentTask: 'Rate limiting middleware',
    hoursToday: 4.25,
    hoursWeek: 28.0,
    avatar: null,
    hourlyRate: 85,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u3',
    name: 'Aiko Tanaka',
    role: 'Product Designer',
    email: 'aiko@acme.io',
    status: 'idle',
    activityLevel: 22,
    currentProject: 'Design System v3',
    currentTask: 'Idle — last seen 34 min ago',
    hoursToday: 3.0,
    hoursWeek: 19.5,
    avatar: null,
    hourlyRate: 75,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u4',
    name: 'Daniel Osei',
    role: 'DevOps Engineer',
    email: 'daniel@acme.io',
    status: 'active',
    activityLevel: 95,
    currentProject: 'Infrastructure Migration',
    currentTask: 'Kubernetes cluster provisioning',
    hoursToday: 6.75,
    hoursWeek: 38.25,
    avatar: null,
    hourlyRate: 110,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u5',
    name: 'Sofia Reyes',
    role: 'QA Engineer',
    email: 'sofia@acme.io',
    status: 'active',
    activityLevel: 60,
    currentProject: 'Redesign Landing Page',
    currentTask: 'Writing E2E test suites',
    hoursToday: 4.0,
    hoursWeek: 24.0,
    avatar: null,
    hourlyRate: 80,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u6',
    name: 'Tom Eriksson',
    role: 'Full Stack Engineer',
    email: 'tom@acme.io',
    status: 'offline',
    activityLevel: 0,
    currentProject: 'Client Portal',
    currentTask: 'Offline',
    hoursToday: 0,
    hoursWeek: 12.0,
    avatar: null,
    hourlyRate: 65,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u7',
    name: 'Priya Sharma',
    role: 'Designer',
    email: 'priya.sharma@acme.io',
    status: 'active',
    activityLevel: 88,
    currentProject: 'Brand Redesign',
    currentTask: 'Creating component library',
    hoursToday: 5.5,
    hoursWeek: 28,
    avatar: null,
    hourlyRate: 90,
    availableHoursPerWeek: 40,
  },
  {
    id: 'u8',
    name: 'James Liu',
    role: 'QA Engineer',
    email: 'james@acme.io',
    status: 'idle',
    activityLevel: 22,
    currentProject: 'API Integration',
    currentTask: 'Reviewing test cases',
    hoursToday: 1.0,
    hoursWeek: 12,
    avatar: null,
    hourlyRate: 70,
    availableHoursPerWeek: 40,
  },
];

// ─── BILLING RATES ────────────────────────────────────────────────────────────
export const billingRates = {
  default: 95,
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const projects = [
  {
    id: 'p1',
    name: 'Redesign Landing Page',
    client: 'Acme Corp (Internal)',
    status: 'active',
    color: '#8b5cf6',
    goalType: 'monthly',
    goalHours: 80,
    loggedHours: 58.5,
    budget: 12000,
    spent: 8775,
    dueDate: daysFromNow(30),
    members: ['u1', 'u5'],
    description: 'Full redesign of the marketing site with new brand guidelines.',
    tags: ['design', 'frontend'],
  },
  {
    id: 'p2',
    name: 'API Gateway v2',
    client: 'Acme Corp (Internal)',
    status: 'active',
    color: '#06b6d4',
    goalType: 'weekly',
    goalHours: 40,
    loggedHours: 28.0,
    budget: 8000,
    spent: 5600,
    dueDate: daysFromNow(14),
    members: ['u2'],
    description: 'Rebuild API gateway with rate limiting, auth, and observability.',
    tags: ['backend', 'infra'],
  },
  {
    id: 'p3',
    name: 'Design System v3',
    client: 'Acme Corp (Internal)',
    status: 'paused',
    color: '#f59e0b',
    goalType: 'project',
    goalHours: 200,
    loggedHours: 142.0,
    budget: 20000,
    spent: 14200,
    dueDate: daysFromNow(120),
    members: ['u3'],
    description: 'Component library and token system for all product surfaces.',
    tags: ['design', 'system'],
  },
  {
    id: 'p4',
    name: 'Infrastructure Migration',
    client: 'CloudScale Inc.',
    status: 'active',
    color: '#10b981',
    goalType: 'monthly',
    goalHours: 120,
    loggedHours: 110.0,
    budget: 30000,
    spent: 27500,
    dueDate: daysFromNow(45),
    members: ['u4'],
    description: 'Migrate legacy VMs to Kubernetes on GCP.',
    tags: ['devops', 'cloud'],
  },
  {
    id: 'p5',
    name: 'Client Portal',
    client: 'Meridian Finance',
    status: 'active',
    color: '#f43f5e',
    goalType: 'weekly',
    goalHours: 30,
    loggedHours: 12.0,
    budget: 15000,
    spent: 6000,
    dueDate: daysFromNow(60),
    members: ['u6'],
    description: 'Self-service portal for Meridian Finance customers.',
    tags: ['frontend', 'backend'],
  },
  {
    id: 'p6',
    name: 'Brand Redesign',
    client: 'Internal',
    status: 'active',
    color: '#8b5cf6',
    goalType: 'monthly',
    goalHours: 60,
    loggedHours: 51,
    budget: 8000,
    spent: 7200,
    dueDate: daysFromNow(14),
    members: ['u7'],
    tags: ['design'],
    description: 'Complete brand identity overhaul',
  },
  {
    id: 'p7',
    name: 'API Integration',
    client: 'DataStream Inc',
    status: 'active',
    color: '#0ea5e9',
    goalType: 'project',
    goalHours: 120,
    loggedHours: 44,
    budget: 15000,
    spent: 5800,
    dueDate: daysFromNow(90),
    members: ['u8', 'u3'],
    tags: ['backend'],
    description: 'REST API integration with DataStream platform',
  },
];

// ─── TIME LOGS ────────────────────────────────────────────────────────────────
// The requirement is 24 entries spanning the last 14 days, with at least 3 entries
// per day for the last 5 weekdays.
const generateMockLogs = () => {
  const logs = [];
  const today = new Date();
  let idCount = 1;
  const users = [
    { id: 'u1', name: 'Priya Sharma' },
    { id: 'u2', name: 'Marcus Webb' },
    { id: 'u3', name: 'Aiko Tanaka' },
    { id: 'u4', name: 'Daniel Osei' },
    { id: 'u5', name: 'Sofia Reyes' },
    { id: 'u6', name: 'Tom Eriksson' },
    { id: 'u7', name: 'Priya Sharma' }, // another Priya
    { id: 'u8', name: 'James Liu' },
  ];
  const projs = [
    { id: 'p1', name: 'Redesign Landing Page' },
    { id: 'p2', name: 'API Gateway v2' },
    { id: 'p3', name: 'Design System v3' },
    { id: 'p4', name: 'Infrastructure Migration' },
    { id: 'p5', name: 'Client Portal' },
    { id: 'p6', name: 'Brand Redesign' },
    { id: 'p7', name: 'API Integration' },
  ];

  // Create 3 entries per day for the last 5 weekdays
  let daysAdded = 0;
  for (let i = 0; i < 14 && logs.length < 24; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    let entriesForDay = 1;
    if (!isWeekend && daysAdded < 5) {
      entriesForDay = 3;
      daysAdded++;
    } else if (isWeekend) {
      entriesForDay = i % 2 === 0 ? 1 : 0;
    }

    for (let j = 0; j < entriesForDay && logs.length < 24; j++) {
      const u = users[(i + j) % users.length];
      const p = projs[(i * j + 1) % projs.length];
      logs.push({
        id: 'tl' + idCount++,
        userId: u.id,
        userName: u.name,
        projectId: p.id,
        projectName: p.name,
        task: 'Development task ' + idCount,
        date: dateStr,
        startTime: '09:00',
        endTime: '11:00',
        duration: 2,
        source: j % 2 === 0 ? 'auto' : 'manual',
        billable: j !== 2, // 2 out of 3 are billable
      });
    }
  }

  // Fill the rest if not 24
  while (logs.length < 24) {
    const d = new Date(today);
    d.setDate(d.getDate() - 10);
    const dateStr = d.toISOString().split('T')[0];
    const u = users[logs.length % users.length];
    const p = projs[logs.length % projs.length];
    logs.push({
      id: 'tl' + idCount++,
      userId: u.id,
      userName: u.name,
      projectId: p.id,
      projectName: p.name,
      task: 'Development task ' + idCount,
      date: dateStr,
      startTime: '13:00',
      endTime: '14:30',
      duration: 1.5,
      source: 'auto',
      billable: true,
    });
  }

  return logs;
};

const rawLogs = generateMockLogs();

const filterLogs = (removeAutoTracked) => {
  const clean = [];
  const seen = new Set();
  for (const log of rawLogs) {
    if (log.duration < 0.1) continue;
    if (removeAutoTracked && log.task === "Auto Tracked Task") continue;
    const key = `${log.userId}|${log.date}|${log.startTime}|${log.endTime}|${log.task}`;
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(log);
  }
  return clean;
};

let processedLogs = filterLogs(true);
if (processedLogs.length < 20) {
  processedLogs = filterLogs(false);
}

export const timeLogs = processedLogs;

// ─── INVOICES ─────────────────────────────────────────────────────────────────
export const invoices = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-041',
    client: {
      name: 'CloudScale Inc.',
      email: 'billing@cloudscale.io',
      address: '340 Pine Street, Suite 800\nSan Francisco, CA 94104',
    },
    project: 'Infrastructure Migration',
    issueDate: daysFromNow(-14),
    dueDate: daysFromNow(10),
    status: 'pending',
    requiresSignature: false,
    lineItems: [
      { description: 'Kubernetes cluster provisioning', hours: 24.0, rate: 175, total: 4200 },
      { description: 'GCP IAM & networking setup', hours: 18.5, rate: 175, total: 3237.5 },
      { description: 'CI/CD pipeline configuration', hours: 12.0, rate: 175, total: 2100 },
      { description: 'Staging environment validation', hours: 8.0, rate: 175, total: 1400 },
    ],
    subtotal: 10937.5,
    tax: 984.375,
    total: 11921.875,
    notes: 'Payment due within 30 days. Bank transfer preferred.',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-040',
    client: {
      name: 'Meridian Finance',
      email: 'ap@meridianfinance.com',
      address: '1 Financial Plaza, 12th Floor\nNew York, NY 10005',
    },
    project: 'Client Portal',
    issueDate: daysFromNow(-45),
    dueDate: daysFromNow(-3),
    status: 'overdue',
    requiresSignature: true,
    lineItems: [
      { description: 'Portal architecture & setup', hours: 16.0, rate: 200, total: 3200 },
      { description: 'Authentication & SSO integration', hours: 10.0, rate: 200, total: 2000 },
      { description: 'Dashboard UI development', hours: 8.0, rate: 200, total: 1600 },
    ],
    subtotal: 6800,
    tax: 612,
    total: 7412,
    notes: 'Digital signature required before processing. See attached SOW.',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-039',
    client: {
      name: 'Acme Corp',
      email: 'finance@acme.io',
      address: '500 Tech Boulevard\nAustin, TX 78701',
    },
    project: 'Redesign Landing Page',
    issueDate: daysFromNow(-30),
    dueDate: daysFromNow(-5),
    status: 'paid',
    requiresSignature: false,
    lineItems: [
      { description: 'UX research & wireframes', hours: 20.0, rate: 150, total: 3000 },
      { description: 'Design implementation', hours: 32.0, rate: 150, total: 4800 },
      { description: 'QA & cross-browser testing', hours: 12.0, rate: 150, total: 1800 },
    ],
    subtotal: 9600,
    tax: 864,
    total: 10464,
    notes: 'Paid via ACH transfer. Thank you.',
  },
];

// ─── DASHBOARD METRICS ────────────────────────────────────────────────────────
export const dashboardMetrics = {
  totalHoursToday: 19.2,
  totalHoursTodayDelta: +2.4,
  activeProjects: 4,
  activeProjectsDelta: 0,
  profitabilityMargin: 72.4,
  profitabilityDelta: +3.1,
  weeklyHours: [
    { day: 'Mon', hours: 38.5 },
    { day: 'Tue', hours: 42.0 },
    { day: 'Wed', hours: 35.0 },
    { day: 'Thu', hours: 44.5 },
    { day: 'Fri', hours: 19.2 },
  ],
};

// ─── REPORTS (weekly summary) ─────────────────────────────────────────────────
export const reportRows = [
  { member: 'Priya Sharma', project: 'Redesign Landing Page', mon: 7.5, tue: 8.0, wed: 6.5, thu: 7.5, fri: 3.5, total: 33.0, billable: 33.0 },
  { member: 'Marcus Webb', project: 'API Gateway v2', mon: 6.0, tue: 7.5, wed: 8.0, thu: 6.5, fri: 4.25, total: 32.25, billable: 32.25 },
  { member: 'Aiko Tanaka', project: 'Design System v3', mon: 4.0, tue: 5.0, wed: 4.5, thu: 3.5, fri: 3.0, total: 20.0, billable: 0 },
  { member: 'Daniel Osei', project: 'Infrastructure Migration', mon: 8.5, tue: 9.0, wed: 7.5, thu: 8.5, fri: 6.75, total: 40.25, billable: 40.25 },
  { member: 'Sofia Reyes', project: 'Redesign Landing Page', mon: 5.0, tue: 6.0, wed: 5.5, thu: 5.5, fri: 4.0, total: 26.0, billable: 26.0 },
];

// ─── TODOS ────────────────────────────────────────────────────────────────────
export const todos = [
  { id: 'todo-1', userId: 'u1', title: 'Review API documentation updates', status: 'active', assignedBy: null, assignedByName: null, dueDate: daysFromNow(7), createdDate: daysFromNow(-7) },
  { id: 'todo-2', userId: 'u1', title: 'Update project estimates for Q3', status: 'done', assignedBy: null, assignedByName: null, dueDate: daysFromNow(-10), createdDate: daysFromNow(-14) },
  { id: 'todo-3', userId: 'u2', title: 'Write unit tests for auth module', status: 'active', assignedBy: null, assignedByName: null, dueDate: daysFromNow(14), createdDate: daysFromNow(-7) },
  { id: 'todo-4', userId: 'u1', title: 'Prepare sprint retrospective notes', status: 'pending-acceptance', assignedBy: 'u3', assignedByName: 'Aiko Tanaka', dueDate: daysFromNow(3), createdDate: daysFromNow(-5) },
  { id: 'todo-5', userId: 'u2', title: 'Fix rate limiting bug in staging', status: 'pending-acceptance', assignedBy: 'u1', assignedByName: 'Priya Sharma', dueDate: daysFromNow(7), createdDate: daysFromNow(-5) },
  { id: 'todo-6', userId: 'u3', title: 'Review design mockups for dashboard', status: 'active', assignedBy: 'u1', assignedByName: 'Priya Sharma', dueDate: daysFromNow(14), createdDate: daysFromNow(-7) },
  { id: 'todo-7', userId: 'u4', title: 'Provision staging environment', status: 'active', assignedBy: null, assignedByName: null, dueDate: daysFromNow(3), createdDate: daysFromNow(-14) },
  { id: 'todo-8', userId: 'u2', title: 'Document Kubernetes setup steps', status: 'done', assignedBy: 'u1', assignedByName: 'Priya Sharma', dueDate: daysFromNow(-5), createdDate: daysFromNow(-14) },
];

export const tasks = [
  {
    id: 'task-1',
    title: 'Implement rate limiting middleware',
    projectId: 'p2',
    projectName: 'API Gateway v2',
    assignedTo: 'u2',
    assignedToName: 'Marcus Webb',
    createdBy: 'u1',
    status: 'in-progress',
    priority: 'high',
    dueDate: daysFromNow(14),
    timeLogged: 4.25,
    description: 'Add token bucket rate limiting to all API endpoints.'
  },
  {
    id: 'task-2',
    title: 'Write E2E tests for auth flow',
    projectId: 'p2',
    projectName: 'API Gateway v2',
    assignedTo: 'u5',
    assignedToName: 'Sofia Reyes',
    createdBy: 'u1',
    status: 'todo',
    priority: 'high',
    dueDate: daysFromNow(21),
    timeLogged: 0,
    description: 'Cover login, refresh token, and logout flows.'
  },
  {
    id: 'task-3',
    title: 'Design hero section component',
    projectId: 'p1',
    projectName: 'Redesign Landing Page',
    assignedTo: 'u1',
    assignedToName: 'Priya Sharma',
    createdBy: 'u1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: daysFromNow(14),
    timeLogged: 5.5,
    description: 'Responsive hero with animation and CTA.'
  },
  {
    id: 'task-4',
    title: 'Set up Kubernetes cluster',
    projectId: 'p3',
    projectName: 'Infrastructure Migration',
    assignedTo: 'u4',
    assignedToName: 'Daniel Osei',
    createdBy: 'u1',
    status: 'done',
    priority: 'high',
    dueDate: daysFromNow(-20),
    timeLogged: 6.75,
    description: 'Provision and configure prod cluster on GCP.'
  },
  {
    id: 'task-5',
    title: 'Create component library documentation',
    projectId: 'p4',
    projectName: 'Design System v3',
    assignedTo: 'u7',
    assignedToName: 'Priya Sharma',
    createdBy: 'u1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: daysFromNow(28),
    timeLogged: 5.5,
    description: 'Document all components with usage examples.'
  },
  {
    id: 'task-6',
    title: 'Review dashboard mockups',
    projectId: 'p1',
    projectName: 'Redesign Landing Page',
    assignedTo: 'u3',
    assignedToName: 'Aiko Tanaka',
    createdBy: 'u1',
    status: 'todo',
    priority: 'low',
    dueDate: daysFromNow(28),
    timeLogged: 0,
    description: 'Review and provide feedback on new dashboard designs.'
  },
  {
    id: 'task-7',
    title: 'Fix mobile navigation breakpoints',
    projectId: 'p1',
    projectName: 'Redesign Landing Page',
    assignedTo: 'u1',
    assignedToName: 'Priya Sharma',
    createdBy: 'u1',
    status: 'todo',
    priority: 'medium',
    dueDate: daysFromNow(21),
    timeLogged: 0,
    description: 'Ensure nav works correctly on all screen sizes.'
  },
  {
    id: 'task-8',
    title: 'Configure CI/CD pipeline',
    projectId: 'p3',
    projectName: 'Infrastructure Migration',
    assignedTo: 'u4',
    assignedToName: 'Daniel Osei',
    createdBy: 'u1',
    status: 'done',
    priority: 'high',
    dueDate: daysFromNow(-25),
    timeLogged: 12,
    description: 'Set up GitHub Actions for automated deployment.'
  },
  {
    id: 'task-9',
    title: 'Integrate Stripe payment API',
    projectId: 'p5',
    projectName: 'Client Portal',
    assignedTo: 'u6',
    assignedToName: 'Tom Eriksson',
    createdBy: 'u1',
    status: 'todo',
    priority: 'high',
    dueDate: daysFromNow(42),
    timeLogged: 0,
    description: 'Payment flow for client subscription management.'
  },
  {
    id: 'task-10',
    title: 'QA regression testing sprint',
    projectId: 'p2',
    projectName: 'API Gateway v2',
    assignedTo: 'u8',
    assignedToName: 'James Liu',
    createdBy: 'u1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: daysFromNow(14),
    timeLogged: 1,
    description: 'Full regression test suite before v2 release.'
  },
  {
    id: 'task-11',
    title: 'Update API documentation',
    projectId: 'p2',
    projectName: 'API Gateway v2',
    assignedTo: 'u2',
    assignedToName: 'Marcus Webb',
    createdBy: 'u2',
    status: 'todo',
    priority: 'low',
    dueDate: daysFromNow(35),
    timeLogged: 0,
    description: 'Update OpenAPI spec with new endpoints.'
  },
  {
    id: 'task-12',
    title: 'Brand color system tokens',
    projectId: 'p6',
    projectName: 'Brand Redesign',
    assignedTo: 'u7',
    assignedToName: 'Priya Sharma',
    createdBy: 'u7',
    status: 'done',
    priority: 'high',
    dueDate: daysFromNow(-20),
    timeLogged: 3.5,
    description: 'Define and document all brand color tokens.'
  }
];
