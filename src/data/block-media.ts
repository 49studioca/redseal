import { lessonImageSrc } from "@/lib/storage/lesson-images";

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

/** Curated lesson images — served from Supabase Storage `images` bucket. */
const IMG = {
  copperPipes: lessonImageSrc("copper-pipes"),
  pvcPipe: lessonImageSrc("pvc-pipe"),
  copperSolder: lessonImageSrc("copper-solder"),
  copperPress: lessonImageSrc("copper-press"),
  pvcDrain: lessonImageSrc("pvc-drain"),
  wrench: lessonImageSrc("wrench"),
  electricalPanel: lessonImageSrc("electrical-panel"),
  outdoorWiring: lessonImageSrc("outdoor-wiring"),
  wetRoomWiring: lessonImageSrc("wet-room-wiring"),
  motorStarter: lessonImageSrc("motor-starter"),
  smokeDetector: lessonImageSrc("smoke-detector"),
  solarPanel: lessonImageSrc("solar-panel"),
  welding: lessonImageSrc("welding"),
  woodFraming: lessonImageSrc("wood-framing"),
  tapeMeasure: lessonImageSrc("tape-measure"),
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
      youtubeId: "o5CWnUFsevo",
      title: "Lockout/tagout — controlling hazardous energy",
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
      youtubeId: "hKtedrJKyQs",
      title: "Basic residential wiring",
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
      youtubeId: "vAD3r_nF6L4",
      title: "Grounding and bonding an electrical panel",
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
      youtubeId: "YRrE3fYArr8",
      title: "How a direct online (DOL) motor starter works",
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
      youtubeId: "cVjyDgFrb2g",
      title: "What is a fire alarm system?",
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
      youtubeId: "QAwEtVPkwL0",
      title: "How a PV solar cell works",
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
      youtubeId: "dgtslF3v0yc",
      title: "Before you strike an arc — welding safety orientation",
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
      youtubeId: "pMtqDWUpJds",
      title: "Stick welding basics — equipment and joint setup",
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
      youtubeId: "4MKuUICV6-c",
      title: "Stick welding 101 — getting started with SMAW",
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
      youtubeId: "rhE1rIAxeps",
      title: "How to use a plasma cutter",
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
      youtubeId: "Z13fLeTrdXM",
      title: "Visual weld inspection tools every welder should know",
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
      youtubeId: "XwetxAWPzhA",
      title: "6011 & 6013 stick welding — uphill techniques",
    },
    images: [
      {
        src: IMG.welding,
        alt: "Pipe welding",
        caption: "Qualified procedures govern specialized weld applications.",
      },
    ],
  },

  "442A-A": {
    video: {
      youtubeId: "o5CWnUFsevo",
      title: "Lockout/tagout — controlling hazardous energy",
    },
    images: [
      {
        src: IMG.electricalPanel,
        alt: "Industrial electrical panel",
        caption: "Verify de-energization and lockout before commissioning or maintenance.",
      },
    ],
  },
  "442A-B": {
    video: {
      youtubeId: "vAD3r_nF6L4",
      title: "Grounding and bonding an electrical panel",
    },
    images: [
      {
        src: IMG.electricalPanel,
        alt: "Distribution and service equipment",
        caption: "Industrial service systems include transformers, protection, and bonding.",
      },
    ],
  },
  "442A-C": {
    video: {
      youtubeId: "hKtedrJKyQs",
      title: "Industrial wiring and raceway installation",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Industrial conduit and cable tray",
        caption: "Raceways, conductors, and enclosures in plant environments.",
      },
    ],
  },
  "442A-D": {
    video: {
      youtubeId: "YRrE3fYArr8",
      title: "How a direct online (DOL) motor starter works",
    },
    images: [
      {
        src: IMG.motorStarter,
        alt: "Motor control centre starter",
        caption: "Motor starters, drives, and control circuits are core exam topics.",
      },
    ],
  },
  "442A-E": {
    video: {
      youtubeId: "cVjyDgFrb2g",
      title: "Industrial signalling and communication systems",
    },
    images: [
      {
        src: IMG.smokeDetector,
        alt: "Signalling device",
        caption: "Signalling, communications, and building automation systems.",
      },
    ],
  },
  "442A-F": {
    video: {
      youtubeId: "YRrE3fYArr8",
      title: "PLC basics — inputs, outputs, and ladder logic",
    },
    images: [
      {
        src: IMG.motorStarter,
        alt: "Industrial control panel",
        caption: "Process control covers I/O devices, PLCs, and pneumatic/hydraulic controls.",
      },
    ],
  },

  "403A-A": {
    video: {
      youtubeId: "Vm_daEZ-veM",
      title: "Construction site safety induction",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Carpentry hand tools",
        caption: "Common occupational skills start with safe tool use and jobsite awareness.",
      },
    ],
  },
  "403A-B": {
    video: {
      youtubeId: "wFdRbiGFx1M",
      title: "Framing walls — precise stud layout",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Tape measure for layout",
        caption: "Accurate layout keeps studs on module and sheathing joints on centre.",
      },
    ],
  },
  "403A-C": {
    video: {
      youtubeId: "tyQCAASaOUM",
      title: "Concrete formwork before the pour",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Wood formwork framing",
        caption: "Formwork must be level, braced, and oiled before placing concrete.",
      },
    ],
  },
  "403A-D": {
    video: {
      youtubeId: "3fP0LZMEV5w",
      title: "House framing explained in 12 minutes",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Platform wood framing",
        caption: "Framing members include plates, studs, joists, and rafters.",
      },
    ],
  },
  "403A-E": {
    video: {
      youtubeId: "WQU3Qq3p73I",
      title: "How to install vinyl siding panels",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Exterior building envelope",
        caption: "Exterior finishing relies on proper flashing, trim, and expansion gaps.",
      },
    ],
  },
  "403A-F": {
    video: {
      youtubeId: "wfsmfJ_tkuk",
      title: "How to install baseboards step by step",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Finish carpentry tools",
        caption: "Interior finishing includes trim layout, cutting mitres, and tight joints.",
      },
    ],
  },
  "403A-G": {
    video: {
      youtubeId: "JP4uP5DMGLo",
      title: "Building a new interior wall during renovation",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Renovation framing",
        caption: "Renovations often combine selective demolition with new framed partitions.",
      },
    ],
  },
};

export function blockMediaKey(tradeCode: string, blockCode: string) {
  return `${tradeCode.trim().toUpperCase()}-${blockCode.trim().toUpperCase()}`;
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
