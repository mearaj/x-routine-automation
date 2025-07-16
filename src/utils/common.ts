import type {ControllerToLikeAndRtInput} from "@/utils/automatedTasks.ts";

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const matchesProfile = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/?$/.test(url);
}
export const matchesStatus = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/status\/\d+\/?$/.test(url);
}


export const likeRtThresholdDuration = 1000 * 60 * 60 * 12;
export const sourceToTargetThresholdDuration = 1000 * 60 * 60 * 12;
export const followingThresholdDuration = 1000 * 60 * 60 * 4;
export const minWaitingTimeForFollowing = 1000 * 15;
export const minWaitingTimeForTweet = 1000 * 15;
export const defaultUserInput: ControllerToLikeAndRtInput = {
  rtText: "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ",
  rtImageSearchText: "together we will rebuild",
  rtImageSearchPosition: 0,
  quoteText: "👇👇👇👇👇",
  gazaRtText: "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ\n" + "❤️ 💔 🤲 🇵🇸",
  gazaRtImageSearchText: "Save Gaza",
  gazaRtImageSearchPosition: 0,
  gazaRtQuoteText: "👇👇👇👇👇",
}
