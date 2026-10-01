export interface UserSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  name: string;
  picture: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionResult[];
  pendingDraft?: DraftInfo;
}

export interface ActionResult {
  tool: string;
  summary: string;
  success: boolean;
  link?: string;
}

export interface DraftInfo {
  draftId: string;
  to: string;
  subject: string;
  body: string;
}
