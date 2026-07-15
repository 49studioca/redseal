import { apprenticeAvatarUrl } from "@/lib/avatars/options";

export type StoryQuote = {
  quote: string;
  highlight: string | null;
  name: string;
  role: string;
  place: string;
  initials: string;
  tradeSlug: string;
  /** Deterministic DiceBear seed for the avatar. */
  avatarSeed: string;
};

export const APPRENTICE_STORIES: StoryQuote[] = [
  {
    quote:
      "Failed the electrician exam by 4 points. Six weeks on here, passed the retake with an 84.",
    highlight: "84",
    name: "Dylan K.",
    role: "Construction Electrician",
    place: "Hamilton, ON",
    initials: "DK",
    tradeSlug: "construction-electrician",
    avatarSeed: "dylan-k-electrician",
  },
  {
    quote:
      "I stopped guessing which blocks to study. The weak-spot drills showed me DWV was killing my score.",
    highlight: null,
    name: "Amir S.",
    role: "Plumber",
    place: "Surrey, BC",
    initials: "AS",
    tradeSlug: "plumber",
    avatarSeed: "amir-s-plumber",
  },
  {
    quote:
      "English is my second language. Tapping a word mid-lesson for welding terms kept me studying instead of googling.",
    highlight: null,
    name: "Priya M.",
    role: "Welder",
    place: "Edmonton, AB",
    initials: "PM",
    tradeSlug: "welder",
    avatarSeed: "priya-m-welder",
  },
  {
    quote:
      "The timed mocks felt closer to exam day than any binder I bought. Booked my rewrite with a real readiness score.",
    highlight: null,
    name: "Marcus T.",
    role: "Carpenter",
    place: "Halifax, NS",
    initials: "MT",
    tradeSlug: "carpenter",
    avatarSeed: "marcus-t-carpenter",
  },
  {
    quote:
      "Plant stuff is dense. Having CEC-linked answers next to the drill questions finally clicked for me.",
    highlight: null,
    name: "Jordan L.",
    role: "Industrial Electrician",
    place: "Windsor, ON",
    initials: "JL",
    tradeSlug: "industrial-electrician",
    avatarSeed: "jordan-l-industrial",
  },
  {
    quote:
      "Night shifts left me tired. Fifteen-minute flashcard reps on break actually stuck.",
    highlight: null,
    name: "Chris R.",
    role: "Construction Electrician",
    place: "Calgary, AB",
    initials: "CR",
    tradeSlug: "construction-electrician",
    avatarSeed: "chris-r-electrician",
  },
  {
    quote:
      "I failed once on code questions. Province notes flagged the amendments I kept missing.",
    highlight: null,
    name: "Sofia V.",
    role: "Plumber",
    place: "Montreal, QC",
    initials: "SV",
    tradeSlug: "plumber",
    avatarSeed: "sofia-v-plumber",
  },
  {
    quote:
      "Positions and symbols used to blur together. Short drills after each video fixed that.",
    highlight: null,
    name: "Nate W.",
    role: "Welder",
    place: "Saskatoon, SK",
    initials: "NW",
    tradeSlug: "welder",
    avatarSeed: "nate-w-welder",
  },
  {
    quote:
      "Framing math tripped me up for months. Block-by-block quizzes finally made the layout clean.",
    highlight: null,
    name: "Elena P.",
    role: "Carpenter",
    place: "Ottawa, ON",
    initials: "EP",
    tradeSlug: "carpenter",
    avatarSeed: "elena-p-carpenter",
  },
  {
    quote:
      "VFDs and controls felt abstract until the lessons tied every answer back to plant scenarios.",
    highlight: null,
    name: "Omar H.",
    role: "Industrial Electrician",
    place: "Mississauga, ON",
    initials: "OH",
    tradeSlug: "industrial-electrician",
    avatarSeed: "omar-h-industrial",
  },
];

export { apprenticeAvatarUrl };
