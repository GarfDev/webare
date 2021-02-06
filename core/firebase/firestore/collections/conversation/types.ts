export interface Conversation {
  id: string;
  participants: string[];
  allowed_attachments: string[];
  created_at: number;
}
