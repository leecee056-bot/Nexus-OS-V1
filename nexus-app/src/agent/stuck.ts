/**
 * Stuck detection (HAP-115): same error fingerprint ×3 → rollback + stop loop.
 */

import { errorFingerprint } from "./postWrite";
import {
  listCheckpoints,
  restoreCheckpoint,
} from "./checkpoints";

export type StuckTracker = {
  fingerprints: string[];
};

export function createStuckTracker(): StuckTracker {
  return { fingerprints: [] };
}

export function recordError(tracker: StuckTracker, text: string): number {
  const fp = errorFingerprint(text);
  if (!fp) return 0;
  tracker.fingerprints.push(fp);
  // count trailing streak of this fingerprint
  let n = 0;
  for (let i = tracker.fingerprints.length - 1; i >= 0; i--) {
    if (tracker.fingerprints[i] === fp) n++;
    else break;
  }
  return n;
}

export function isStuck(count: number, threshold = 3): boolean {
  return count >= threshold;
}

export async function rollbackLatest(baselineId?: string): Promise<string> {
  try {
    const items = await listCheckpoints();
    const target = baselineId || items[0]?.id;
    if (!target) return "Stuck: no checkpoint to restore.";
    return await restoreCheckpoint(target);
  } catch (e) {
    return e instanceof Error ? e.message : "Stuck rollback failed";
  }
}
