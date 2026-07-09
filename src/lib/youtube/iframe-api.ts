const YOUTUBE_IFRAME_API = "https://www.youtube.com/iframe_api";

let loadPromise: Promise<void> | null = null;

function waitForPlayer(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const interval = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

/** Loads the YouTube IFrame Player API once (shared across all lesson videos). */
export function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    const finish = () => {
      waitForPlayer().then(resolve);
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${YOUTUBE_IFRAME_API}"]`,
    );

    if (existing) {
      finish();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      finish();
    };

    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API;
    script.async = true;
    document.head.appendChild(script);
  });

  return loadPromise;
}
