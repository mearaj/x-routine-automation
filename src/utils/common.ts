import type {ControllerToLikeAndRtInput} from "@/utils/automatedTasks.ts";
import {DEFAULT_RT_IMAGE_BASE64} from "./rtImage.ts";
import {DEFAULT_GAZA_RT_IMAGE_BASE64} from "./gazaRtImage.ts";

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const matchesProfile = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/?$/.test(url);
}
export const matchesStatus = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/status\/\d+\/?$/.test(url);
}


export function getCurrentUsernameFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

export const extractUsername = (input: string): string | null => {
  input = input.trim();
  if (input.startsWith('@')) return input.slice(1);
  if (/^[a-zA-Z0-9_]{1,15}$/.test(input)) return input;
  const urlMatch = input.match(/^https?:\/\/(?:www\.)?(x|twitter)\.com\/([a-zA-Z0-9_]{1,15})(\/|$)/);
  if (urlMatch) return urlMatch[2];

  return null;
};

export const likeRtThresholdDuration = 1000 * 60 * 60 * 12;
export const sourceToTargetThresholdDuration = 1000 * 60 * 60 * 12;
export const followingThresholdDuration = 1000 * 60 * 60 * 12;
export const minWaitingTimeForFollowing = 1000 * 18;
export const minWaitingTimeForTweet = 1000 * 18;
export const defaultUserInput: ControllerToLikeAndRtInput = {
  rtText: "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ",
  rtImage: {
    base64: DEFAULT_RT_IMAGE_BASE64,
    type: "image/gif",
    name: "defaultRtImage.gif"
  },
  quoteText: "👇👇👇👇👇",
  gazaRtText: "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ\n" + "❤️ 💔 🤲 🇵🇸",
  gazaRtImage: {
    base64: DEFAULT_GAZA_RT_IMAGE_BASE64,
    type: "image/gif",
    name: "defaultGazaRtImage.gif"
  },
  gazaQuoteText: "👇👇👇👇👇",
}

export function extractUsernameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const pathSegments = u.pathname.split("/").filter(Boolean);
    return pathSegments[0] || null;
  } catch (e) {
    console.warn("Error extracting username from url", url, e);
    return null;
  }
}
