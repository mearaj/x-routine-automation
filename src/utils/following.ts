

export interface Following {
  username: string;
  mutual?: boolean;
  timestamp: number; // in case, no pinned post exists or is not a fundraiser
}
