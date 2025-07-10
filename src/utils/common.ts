export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const matchesProfile = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/?$/.test(url);
}
export const matchesStatus = (url: string): boolean => {
  return /^https:\/\/x\.com\/[^/]+\/status\/\d+\/?$/.test(url);
}


export const likeRtThresholdDuration =  1000 * 60 * 60 * 12;
export const sourceToTargetThresholdDuration =  1000 * 60 * 60 * 12;
export const followingThresholdDuration =  1000 * 60 * 60 * 4;
export const minWaitingTimeForFollowing = 1000 * 12;
export const minWaitingTimeForTweet = 1000 * 12;
