export interface UserSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  name: string;
  picture: string;
  role?: string;
}

export type AppMode = 'home' | 'work';

export type UserType =
  | 'STUDENT' | 'WORKING_PROFESSIONAL' | 'SENIOR' | 'ENTERPRISE' | 'ADMIN'
  | 'student' | 'working_professional' | 'seniors' | 'enterprise' | 'admin';

export type StudentSubType =
  | 'SCHOOL' | 'COMPETITIVE_EXAM' | 'UNIVERSITY'
  | 'school' | 'competitive_exam' | 'university';

export type WorkingProfessionalCategory =
  | 'SALARIED_EMPLOYEE' | 'SELF_EMPLOYED' | 'ENTREPRENEUR' | 'FREELANCER'
  | 'salaried' | 'self_employed' | 'entrepreneur' | 'freelancer';

export type WorkingProfessionalSubCategory = string;

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship?: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Grandparent' | 'Relative' | string;
  relation?: string;
  userType?: 'STUDENT' | 'SENIOR' | 'student' | 'seniors' | string;
  persona?: string;
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'invited' | string;
  invitedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'invited' | string;
  invitedAt?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  primaryEmail?: string;
  workEmail?: string;
  userType: UserType;
  studentSubType?: StudentSubType;
  professionalCategory?: WorkingProfessionalCategory;
  workingCategory?: WorkingProfessionalCategory;
  professionalSubCategory?: string;
  workingSubCategory?: string;
  industry?: string;
  organizationCode?: string;
  instituteCode?: string;
  familyMembers: FamilyMember[];
  teamMembers: TeamMember[];
  onboarded?: boolean;
  onboardedAt?: string;
  onboardingCompleted?: boolean;
  updatedAt?: string;
  connectedTools?: {
    googleWorkspace: boolean;
    googleChat: boolean;
    microsoft: boolean;
    whatsappPersonal: boolean;
    whatsappBusiness: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionResult[];
  pendingDraft?: DraftInfo;
  pendingImagePrompt?: ImagePromptProposal;
  mode?: AppMode;
  deepActionCard?: DeepActionCard;
}

export interface DeepActionCard {
  id: string;
  category: 'GMAIL' | 'CALENDAR' | 'SHEETS' | 'DOCS' | 'WHATSAPP' | 'TASKS' | 'GOOGLE_CHAT';
  title: string;
  objective: string;
  rationale: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'NEEDS_APPROVAL' | 'APPROVED' | 'DISCARDED' | 'EXECUTED';
  actionPayload: {
    targetPlatform: string;
    recipient?: string;
    subjectOrTitle?: string;
    preFilledContent?: string;
    deepLink?: string;
    directExecuteUrl?: string;
  };
  metricsImpact?: string;
}

export interface ImagePromptProposal {
  proposalId: string;
  originalPrompt: string;
  improvedPrompt: string;
  aspectRatio: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ActionResult {
  tool: string;
  summary: string;
  success: boolean;
  link?: string;
  imageUrl?: string;
  data?: any;
  deepCard?: DeepActionCard;
}

export interface DraftInfo {
  draftId: string;
  to: string;
  subject: string;
  body: string;
  platform?: 'GMAIL' | 'WHATSAPP' | 'GOOGLE_CHAT';
}

export interface SharedCollaborationItem {
  id: string;
  title: string;
  type: 'TASK' | 'EVENT' | 'GOAL' | 'IMAGE' | 'task' | 'calendar' | 'goal' | 'image';
  category?: 'home' | 'work';
  assignedTo?: string; // name or email
  assigneeName?: string;
  assigneeEmail?: string;
  assignedBy?: string;
  channel?: 'GOOGLE_CHAT' | 'WHATSAPP' | 'EMAIL';
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'pending' | 'in_progress' | 'done';
  dueDate?: string;
  mode?: AppMode;
  imageUrl?: string;
}
