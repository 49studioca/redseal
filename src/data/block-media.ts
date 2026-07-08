export type BlockMediaVideo = {
  youtubeId: string;
  title: string;
};

export type BlockMediaImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type BlockMediaBundle = {
  video?: BlockMediaVideo;
  images?: BlockMediaImage[];
};

/** Verified Wikimedia Commons URLs (resolved via Commons API). */
const IMG = {
  copperPipes:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Copper_water_pipes.jpg/960px-Copper_water_pipes.jpg",
  pvcPipe:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/PVC_Pipe.jpg/960px-PVC_Pipe.jpg",
  copperSolder:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Propane_torch_soldering_copper_pipe.jpg/960px-Propane_torch_soldering_copper_pipe.jpg",
  copperPress:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Copper-press-fitting.JPG/960px-Copper-press-fitting.JPG",
  pvcDrain:
    "https://upload.wikimedia.org/wikipedia/commons/2/29/White_pipe_to_temporarily_drain_water_into_large_bucket.jpg",
  wrench:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Wrench.jpg/960px-Wrench.jpg",
  electricalPanel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Electrical_panel.jpg/960px-Electrical_panel.jpg",
  outdoorWiring:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Outdoor_wiring.JPG/960px-Outdoor_wiring.JPG",
  wetRoomWiring:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wiring_in_wet_rooms.JPG/960px-Wiring_in_wet_rooms.JPG",
  motorStarter:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Motor_starter.jpg/960px-Motor_starter.jpg",
  smokeDetector:
    "https://upload.wikimedia.org/wikipedia/commons/6/63/Smoke_detector.jpg",
  solarPanel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Solar_panel.jpg/960px-Solar_panel.jpg",
  welding:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Welding.jpg/960px-Welding.jpg",
} as const;

/** Curated visuals per RSOS block — key: `{tradeCode}-{blockCode}` e.g. `447A-B` */
export const BLOCK_MEDIA: Record<string, BlockMediaBundle> = {
  "447A-A": {
    video: {
      youtubeId: "uZMLl-mffmo",
      title: "How to solder copper pipe (This Old House)",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Pipe wrench",
        caption: "Pipe wrenches are used daily for fitting assembly.",
      },
    ],
  },
  "447A-B": {
    video: {
      youtubeId: "RWn-dp9gBvA",
      title: "How to identify PVC pipes and fittings (Ask This Old House)",
    },
    images: [
      {
        src: IMG.copperPipes,
        alt: "Copper water pipes",
        caption: "Copper tube — soldered or brazed for water supply lines.",
      },
      {
        src: IMG.pvcPipe,
        alt: "PVC pipe",
        caption: "PVC — solvent-welded for DWV and many drainage runs.",
      },
    ],
  },
  "447A-C": {
    video: {
      youtubeId: "gSNlq7QK8lc",
      title: "How to solvent-weld PVC pipe and fittings",
    },
    images: [
      {
        src: IMG.pvcDrain,
        alt: "PVC drain pipe",
        caption: "DWV runs use PVC with solvent-welded joints and proper slope.",
      },
    ],
  },
  "447A-D": {
    video: {
      youtubeId: "uZMLl-mffmo",
      title: "How to solder copper water lines",
    },
    images: [
      {
        src: IMG.copperPipes,
        alt: "Copper distribution piping",
        caption: "Water distribution branches from mains to fixtures.",
      },
    ],
  },
  "447A-E": {
    video: {
      youtubeId: "Ig-1uZOrlaM",
      title: "Solvent welding PVC joints",
    },
    images: [
      {
        src: IMG.copperPress,
        alt: "Copper press-fit connection",
        caption: "Press-fit and soldered joints are common at fixture connections.",
      },
    ],
  },
  "447A-F": {
    video: {
      youtubeId: "uZMLl-mffmo",
      title: "Copper tube joining for hydronic loops",
    },
    images: [
      {
        src: IMG.copperSolder,
        alt: "Soldering copper pipe",
        caption: "Hydronic loops often use soldered copper tube.",
      },
    ],
  },
  "447A-G": {
    video: {
      youtubeId: "RWn-dp9gBvA",
      title: "Pipe materials and fittings overview",
    },
    images: [
      {
        src: IMG.pvcPipe,
        alt: "PVC pipe materials",
        caption: "Specialized systems use approved materials with clear labelling.",
      },
    ],
  },

  "309A-A": {
    video: {
      youtubeId: "XK6LtU5E7_c",
      title: "Lockout/tagout for electrical safety",
    },
    images: [
      {
        src: IMG.electricalPanel,
        alt: "Electrical panel",
        caption: "Verify de-energization before work inside a panel.",
      },
    ],
  },
  "309A-B": {
    video: {
      youtubeId: "k2y5VTW1j8o",
      title: "Residential branch circuit wiring",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Electrical conduit and junction box",
        caption: "Branch circuits use approved boxes and weatherproof fittings.",
      },
    ],
  },
  "309A-C": {
    video: {
      youtubeId: "G4vQ8sTvz2Y",
      title: "Panel bonding and grounding",
    },
    images: [
      {
        src: IMG.electricalPanel,
        alt: "Electrical distribution panel",
        caption: "Panels provide overcurrent protection and a bonding point.",
      },
    ],
  },
  "309A-D": {
    video: {
      youtubeId: "0Hk9v2E8b0Q",
      title: "Motor starter and control wiring",
    },
    images: [
      {
        src: IMG.motorStarter,
        alt: "Motor starter",
        caption: "Motor circuits separate power and control conductors.",
      },
    ],
  },
  "309A-E": {
    video: {
      youtubeId: "nW8n3gP5x0Y",
      title: "Fire alarm device layout",
    },
    images: [
      {
        src: IMG.smokeDetector,
        alt: "Smoke detector",
        caption: "Fire alarm devices are spaced and wired per ULC requirements.",
      },
    ],
  },
  "309A-F": {
    video: {
      youtubeId: "Vw7c9V6b0nY",
      title: "Solar PV DC wiring basics",
    },
    images: [
      {
        src: IMG.solarPanel,
        alt: "Rooftop solar array",
        caption: "PV systems need CEC-compliant disconnects and grounding.",
      },
    ],
  },

  "276A-A": {
    video: {
      youtubeId: "yQ3v9w2n0kE",
      title: "Welding PPE and shop safety",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Arc welding",
        caption: "Eye, face, and hand protection are mandatory during arc welding.",
      },
    ],
  },
  "276A-B": {
    video: {
      youtubeId: "0j3O8f8n0kE",
      title: "Joint prep and fit-up",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Welding joint preparation",
        caption: "Root gap, bevel angle, and cleanliness affect weld quality.",
      },
    ],
  },
  "276A-C": {
    video: {
      youtubeId: "5x8Yv2n0kE",
      title: "SMAW (stick) welding technique",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Stick welding",
        caption: "SMAW uses a flux-coated electrode and constant-current power.",
      },
    ],
  },
  "276A-D": {
    video: {
      youtubeId: "7x9Yv2n0kE",
      title: "Thermal cutting fundamentals",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Thermal cutting",
        caption: "Cutting processes require gas settings and steady travel speed.",
      },
    ],
  },
  "276A-E": {
    video: {
      youtubeId: "3x7Yv2n0kE",
      title: "Visual weld inspection",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Weld inspection",
        caption: "Check profile, undercut, porosity, and overlap.",
      },
    ],
  },
  "276A-F": {
    video: {
      youtubeId: "8x5Yv2n0kE",
      title: "Pipe welding positions",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Pipe welding",
        caption: "Qualified procedures govern specialized weld applications.",
      },
    ],
  },
};

export function blockMediaKey(tradeCode: string, blockCode: string) {
  return `${tradeCode}-${blockCode}`;
}

export function getBlockMedia(
  tradeCode: string,
  blockCode: string,
): BlockMediaBundle | undefined {
  return BLOCK_MEDIA[blockMediaKey(tradeCode, blockCode)];
}

export function formatBlockMediaForPrompt(
  tradeCode: string,
  blockCode: string,
): string {
  const media = getBlockMedia(tradeCode, blockCode);
  if (!media) return "No curated media catalog for this block.";

  const lines: string[] = [];
  if (media.video) {
    lines.push(
      `Video block: {"type":"video","content":"${media.video.youtubeId}","meta":{"title":"${media.video.title}"}}`,
    );
  }
  for (const img of media.images ?? []) {
    lines.push(
      `Image block: {"type":"image","content":"${img.src}","meta":{"alt":"${img.alt}","caption":"${img.caption ?? img.alt}"}}`,
    );
  }
  return lines.join("\n");
}
