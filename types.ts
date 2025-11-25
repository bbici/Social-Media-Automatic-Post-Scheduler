
export type Platform = 'twitter' | 'linkedin' | 'instagram' | 'tiktok';

export interface DraftContent {
  text: string;
  media?: string; // Base64 data URL
  mediaType: 'image' | 'video' | 'none';
  scheduledTime?: string;
}

export interface AdaptedPost {
  platform: Platform;
  content: string;
  hashtags: string[];
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'none';
  isPosted: boolean;
  error?: string;
  scheduledTime?: string;
}

export interface UserSettings {
  activePlatforms: Platform[];
  userName: string;
  userHandle: string;
  avatar: string;
}

export interface ApiConfig {
  twitter?: {
    bearerToken: string;
  };
  linkedin?: {
    accessToken: string;
    personUrn: string; // e.g., urn:li:person:12345
  };
  instagram?: {
    accessToken: string;
    accountId: string;
  };
  tiktok?: {
    accessToken: string;
    openId: string;
  };
}

export interface ProfileData {
  headline: string;
  about: string;
  experience: string;
  skills: string;
}

export interface OptimizedProfileResult {
  critique: string;
  optimizedHeadline: string[];
  optimizedAbout: string;
  optimizedExperience: string;
  strategicTips: string;
}

export interface PostGeneratorData {
  topic: string;
  tone: 'Professional' | 'Casual' | 'Thought Leadership' | 'Controversial';
  audience: string;
}

export interface PhotoAnalysisResult {
  score: number;
  feedback: string;
  improvements: string[];
}

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  joinedAt: number;
  isVerified?: boolean;
  isSuspended?: boolean; // New field for account suspension
}

export interface PostTemplate {
  id: string;
  name: string;
  content: string;
}

export interface SavedDraft {
  id: string;
  name: string;
  content: DraftContent;
  platforms: Platform[];
  lastModified: number;
}
