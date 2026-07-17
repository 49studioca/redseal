/**
 * RedSeal Guide first-party analytics + Ads IDs.
 * Do not reuse CELPIP (or any other brand) measurement/Ads tags here.
 */

/** GA4 web stream: "web redsealguide" → https://www.redsealguide.com/ */
export const GA4_STREAM = {
  name: "web redsealguide",
  url: "https://www.redsealguide.com/",
  streamId: "15257285665",
  measurementId: "G-FM7SKL3XCY",
} as const;

export const GA_MEASUREMENT_ID = GA4_STREAM.measurementId;

/** Google Ads conversion linker tag (RedSeal client 7710616309). */
export const GOOGLE_ADS_ID = "AW-18254357419";

/** Site Subscribe conversion label (fired from track-purchase.ts). */
export const GOOGLE_ADS_SUBSCRIBE_SEND_TO =
  `${GOOGLE_ADS_ID}/FzzgCOWV2NEcEKvHrYBE` as const;
