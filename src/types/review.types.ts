// src/types/review.types.ts
export interface ActionItem {
  owner: string;
  task: string;
  due: string | null;
}

export interface ReviewNote {
  id: string;
  title: string;
  tldr: string;
  summary: string;
  keyTakeaways: string[];
  actionItems: ActionItem[];
  date: string;
  submissionDate: string;
  notionUrl: string;
  reviewType: "next-day" | "week-later";
  reviewed: boolean;
  edits: string;
}

export interface ReviewSubmission {
  id: string;
  reviewType: "next-day" | "week-later";
  edits: string;
  reviewed?: boolean;
}

export interface ReviewResult {
  id: string;
  success: boolean;
  reviewType?: string;
  error?: string;
}

export interface ReviewApiResponse {
  success: boolean;
  reviewedCount: number;
  totalCount: number;
  successfulIds: string[];
  failureCount: number;
  results: ReviewResult[];
  message: string;
}

export interface PendingReviewsResponse {
  notes: ReviewNote[];
  reviewDate: string;
  counts: {
    nextDay: number;
    weekLater: number;
    total: number;
  };
  debug?: {
    yesterdayRange: DateRange;
    weekAgoRange: DateRange;
  };
  error?: string;
}

interface DateRange {
  start: string;
  end: string;
}

export interface ReviewEmailResponse {
  sent: boolean;
  to: string;
  total: number;
  nextDayCount: number;
  weekLaterCount: number;
  error?: string;
}
