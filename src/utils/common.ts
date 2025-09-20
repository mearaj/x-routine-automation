import type {ControllerToLikeAndRtInput} from "@/utils/automatedTasks.ts";

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const matchesProfile = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/?$/.test(url);
}
export const matchesStatus = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/status\/\d+\/?$/.test(url);
}

export const RW_VIEW_URL = "https://view-awesome-table.com/-OU0D03DRAjPaOypjQCa/view";

export function getCurrentUsernameFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

export const extractUsername = (input: string): string | null => {
  const s = input.trim();
  // If it starts with @, validate strictly
  const mAt = s.match(/^@([A-Za-z0-9_]{1,15})$/);
  if (mAt) return mAt[1].toLowerCase();

  // Plain handle
  if (/^[A-Za-z0-9_]{1,15}$/.test(s)) return s.toLowerCase();

  // URL form
  const mUrl = s.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})(?:\/|$)/i);
  return mUrl ? mUrl[1].toLowerCase() : null;
};

export const likeRtThresholdDuration = 1000 * 60 * 60 * 24;
export const sourceToTargetThresholdDuration = 1000 * 60 * 60 * 24;
export const followingThresholdDuration = 1000 * 60 * 60 * 24;
export const minWaitingTimeForFollowing = 1000 * 108;
export const minWaitingTimeForTweet = 1000 * 108;
export const emptyUserInput: ControllerToLikeAndRtInput = {
  rtText: '',
  rtImage: null,
  quoteText: '',
  gazaRtText: '',
  gazaRtImage: null,
  gazaQuoteText: ''
}

export function extractUsernameFromXUrl(url: string) {
  try {
    const u = new URL(url);
    const pathSegments = u.pathname.split("/").filter(Boolean);
    return pathSegments[0] || null;
  } catch (e) {
    console.warn("Error extracting username from url", url, e);
    return null;
  }
}
