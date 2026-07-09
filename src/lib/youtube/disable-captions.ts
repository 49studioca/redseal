import type { YTPlayer } from "@/lib/youtube/types";

/** Best-effort caption disable — cc_load_policy alone respects viewer YouTube prefs. */
export function disableYoutubeCaptions(player: YTPlayer): void {
  try {
    player.setOption?.("captions", "track", {});
    player.setOption?.("captions", "reload", true);
  } catch {
    // Player may not expose captions module yet.
  }

  try {
    player.unloadModule?.("captions");
    player.unloadModule?.("cc");
  } catch {
    // Module may already be unloaded or unavailable.
  }
}
