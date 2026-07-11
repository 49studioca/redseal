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
  multimeter: lessonImageSrc("multimeter"),
  cableTray: lessonImageSrc("cable-tray"),
  conduitBend: lessonImageSrc("conduit-bend"),
  circuitBreaker: lessonImageSrc("circuit-breaker"),
  busDuct: lessonImageSrc("bus-duct"),
  groundingRod: lessonImageSrc("grounding-rod"),
  backupGenerator: lessonImageSrc("backup-generator"),
  switchgear: lessonImageSrc("switchgear"),
  transformer: lessonImageSrc("transformer"),
  junctionBox: lessonImageSrc("junction-box"),
  hvacControl: lessonImageSrc("hvac-control"),
  baseboardHeater: lessonImageSrc("baseboard-heater"),
  emergencyLight: lessonImageSrc("emergency-light"),
  cathodicAnode: lessonImageSrc("cathodic-anode"),
  variableFrequencyDrive: lessonImageSrc("variable-frequency-drive"),
  pumpControl: lessonImageSrc("pump-control"),
  plcRack: lessonImageSrc("plc-rack"),
  networkRack: lessonImageSrc("network-rack"),
  pneumaticValve: lessonImageSrc("pneumatic-valve"),
  utilityMeter: lessonImageSrc("utility-meter"),
  motorWiring: lessonImageSrc("motor-wiring"),
  fireAlarmDevice: lessonImageSrc("fire-alarm-device"),
  upsSystem: lessonImageSrc("ups-system"),
  proximitySensor: lessonImageSrc("proximity-sensor"),
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
  "442A-A-A-1": {
    video: {
      youtubeId: "o5CWnUFsevo",
      title: "Lockout/tagout — controlling hazardous energy",
    },
    images: [
      {
        src: IMG.electricalPanel,
        alt: "Industrial electrical panel with lockout devices",
        caption: "Safety-related work starts with hazard assessment, PPE, and lockout/tagout.",
      },
    ],
  },
  "442A-A-A-2": {
    video: {
      youtubeId: "YdZfUEb9s-o",
      title: "How to use a multimeter — voltage, continuity, and safe testing",
    },
    images: [
      {
        src: IMG.multimeter,
        alt: "Digital multimeter",
        caption: "Meters, pliers, drivers, and testers must be used per manufacturer specs.",
      },
    ],
  },
  "442A-A-A-3": {
    video: {
      youtubeId: "Vm_daEZ-veM",
      title: "Construction site safety and work organization",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Tape measure for layout and planning",
        caption: "Organizing work includes planning, material staging, permits, and crew coordination.",
      },
    ],
  },
  "442A-A-A-4": {
    video: {
      youtubeId: "5V6R_swdLGI",
      title: "How to bend and install EMT conduit",
    },
    images: [
      {
        src: IMG.conduitBend,
        alt: "Bent EMT conduit run",
        caption: "Support components include strut, trapeze, unistrut, and seismic bracing per code.",
      },
    ],
  },
  "442A-A-A-5": {
    video: {
      youtubeId: "fJeRabV5hNU",
      title: "Electrical system commissioning — from service to energized circuits",
    },
    images: [
      {
        src: IMG.wetRoomWiring,
        alt: "Panel wiring during commissioning",
        caption: "Commissioning verifies polarity, torque, insulation resistance, and safe energization.",
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
  "442A-B-B-7": {
    video: {
      youtubeId: "ka73EcknrYo",
      title: "How an electrical service works — utility, metering, and main panel",
    },
    images: [
      {
        src: IMG.utilityMeter,
        alt: "Utility electrical meter",
        caption: "Consumer/supply services connect utility feeds, metering, and main distribution.",
      },
    ],
  },
  "442A-B-B-8": {
    video: {
      youtubeId: "VGj32euYZ2c",
      title: "Circuit breaker basics — overload and short-circuit protection",
    },
    images: [
      {
        src: IMG.circuitBreaker,
        alt: "Circuit breakers in a panel",
        caption: "OCPDs include breakers, fuses, and coordinated protection in MCCs and panels.",
      },
    ],
  },
  "442A-B-B-9": {
    video: {
      youtubeId: "310jd_DxH2s",
      title: "What is three-phase power?",
    },
    images: [
      {
        src: IMG.busDuct,
        alt: "Busbar distribution",
        caption: "Low voltage distribution systems feed buses, panelboards, and branch circuits in plants.",
      },
    ],
  },
  "442A-B-B-10": {
    video: {
      youtubeId: "UMtftcKACRA",
      title: "UPS basics — offline, line-interactive, and online power conditioning",
    },
    images: [
      {
        src: IMG.upsSystem,
        alt: "Uninterruptible power supply unit",
        caption: "Power conditioning equipment protects sensitive loads from sags, surges, and harmonics.",
      },
    ],
  },
  "442A-B-B-11": {
    video: {
      youtubeId: "vAD3r_nF6L4",
      title: "Grounding, bonding, and ground fault detection",
    },
    images: [
      {
        src: IMG.groundingRod,
        alt: "Grounding electrode installation",
        caption: "Bonding and grounding paths limit fault energy and support GFCI/GFM operation.",
      },
    ],
  },
  "442A-B-B-12": {
    video: {
      youtubeId: "6idadtpqSrg",
      title: "Transfer switches and standby power generating systems",
    },
    images: [
      {
        src: IMG.backupGenerator,
        alt: "Standby generator installation",
        caption: "Generating systems use transfer equipment, synchronizing, and load control.",
      },
    ],
  },
  "442A-B-B-13": {
    video: {
      youtubeId: "QAwEtVPkwL0",
      title: "How photovoltaic solar systems connect to electrical infrastructure",
    },
    images: [
      {
        src: IMG.solarPanel,
        alt: "Rooftop solar array",
        caption: "Renewable generation and battery storage tie in through approved disconnects and inverters.",
      },
    ],
  },
  "442A-B-B-14": {
    video: {
      youtubeId: "igID6c7yifU",
      title: "Industrial distribution equipment and switchgear fundamentals",
    },
    images: [
      {
        src: IMG.switchgear,
        alt: "High-voltage switchgear",
        caption: "High voltage systems use switchgear, clearances, and strict lockout procedures.",
      },
    ],
  },
  "442A-B-B-15": {
    video: {
      youtubeId: "tXPy4OE7ApE",
      title: "Transformers — sizing, connections, and industrial installation",
    },
    images: [
      {
        src: IMG.transformer,
        alt: "Distribution transformer",
        caption: "Transformers step voltage for distribution; verify nameplate, taps, and grounding.",
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
  "442A-C-C-16": {
    video: {
      youtubeId: "kpxT71wrUkI",
      title: "Installing EMT conduit and raceway systems",
    },
    images: [
      {
        src: IMG.cableTray,
        alt: "Cable tray in an industrial plant",
        caption: "Raceways must be supported, bonded, and filled per CEC ampacity and bend rules.",
      },
    ],
  },
  "442A-C-C-17": {
    video: {
      youtubeId: "hKtedrJKyQs",
      title: "Branch circuitry — from panel to devices and loads",
    },
    images: [
      {
        src: IMG.junctionBox,
        alt: "Branch circuit junction box",
        caption: "Branch circuits supply receptacles, lighting, and equipment from panelboards.",
      },
    ],
  },
  "442A-C-C-18": {
    video: {
      youtubeId: "FDnwU2rv6o4",
      title: "Electrical panels and HVAC control wiring",
    },
    images: [
      {
        src: IMG.hvacControl,
        alt: "Programmable thermostat and HVAC controls",
        caption: "HVAC electrical includes starters, contactors, safeties, and control transformers.",
      },
    ],
  },
  "442A-C-C-19": {
    video: {
      youtubeId: "MS2fqnRYFcs",
      title: "Installing electric baseboard heaters",
    },
    images: [
      {
        src: IMG.baseboardHeater,
        alt: "Electric baseboard heater",
        caption: "Electric heat requires correct breaker sizing, controls, and line-voltage thermostats.",
      },
    ],
  },
  "442A-C-C-20": {
    video: {
      youtubeId: "cVjyDgFrb2g",
      title: "Exit and emergency lighting systems",
    },
    images: [
      {
        src: IMG.emergencyLight,
        alt: "Emergency exit sign with battery backup",
        caption: "Emergency lighting units require test switches, battery backup, and CEC compliance.",
      },
    ],
  },
  "442A-C-C-21": {
    video: {
      youtubeId: "qIuVmknmIpM",
      title: "Impressed current cathodic protection",
    },
    images: [
      {
        src: IMG.cathodicAnode,
        alt: "Sacrificial anode for cathodic protection",
        caption: "Cathodic protection ties anodes, reference cells, and rectifiers to buried metal.",
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
  "442A-D-D-22": {
    video: {
      youtubeId: "YRrE3fYArr8",
      title: "Motor starters and control devices — DOL and reversing",
    },
    images: [
      {
        src: IMG.motorStarter,
        alt: "Motor control centre starter bucket",
        caption: "Starters combine contactors, overloads, and control power for motor circuits.",
      },
    ],
  },
  "442A-D-D-23": {
    video: {
      youtubeId: "g7jFGOn6xfU",
      title: "What is a variable frequency drive (VFD)?",
    },
    images: [
      {
        src: IMG.variableFrequencyDrive,
        alt: "Variable frequency drive unit",
        caption: "Drives adjust motor speed via PWM; follow manufacturer wiring and STO guidance.",
      },
    ],
  },
  "442A-D-D-24": {
    video: {
      youtubeId: "c3SICJQ1Ih8",
      title: "PLC motor control with ladder logic",
    },
    images: [
      {
        src: IMG.pumpControl,
        alt: "Centrifugal pump and motor control",
        caption: "Non-rotating loads use starters, sensors, and interlocks similar to motor control.",
      },
    ],
  },
  "442A-D-D-25": {
    video: {
      youtubeId: "R4mqSFOW8nQ",
      title: "How circuit breakers and motor protection work",
    },
    images: [
      {
        src: IMG.motorWiring,
        alt: "Electric motor connection",
        caption: "Motors require correct voltage, overload setting, grounding, and alignment checks.",
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
  "442A-E-E-26": {
    video: {
      youtubeId: "P-5s_8EBMt4",
      title: "Installing fire alarm horn strobes",
    },
    images: [
      {
        src: IMG.fireAlarmDevice,
        alt: "Fire alarm pull station",
        caption: "Signalling includes horns, strobes, stack lights, and annunciators.",
      },
    ],
  },
  "442A-E-E-27": {
    video: {
      youtubeId: "d0iHCF58ZkI",
      title: "Structured cabling explained",
    },
    images: [
      {
        src: IMG.networkRack,
        alt: "Network patch panel",
        caption: "Communication systems use shielded pairs, fibre, trays, and segregation from power.",
      },
    ],
  },
  "442A-E-E-28": {
    video: {
      youtubeId: "E-A1kRbg2Yo",
      title: "Industrial Ethernet networks and field devices",
    },
    images: [
      {
        src: IMG.plcRack,
        alt: "Building automation control rack",
        caption: "BAS ties sensors, actuators, and controllers for HVAC, lighting, and access.",
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
  "442A-F-F-29": {
    video: {
      youtubeId: "zsajTNtxfAE",
      title: "PLC ladder logic — NO and NC contacts",
    },
    images: [
      {
        src: IMG.proximitySensor,
        alt: "Inductive proximity sensor for field I/O",
        caption: "I/O devices include proximity, photo eyes, transmitters, and solenoid valves.",
      },
    ],
  },
  "442A-F-F-30": {
    video: {
      youtubeId: "VsElyL2xVJ4",
      title: "Foundations of PLC systems and ladder logic",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Industrial control wiring in conduit",
        caption: "Automated systems use ladder logic, I/O mapping, and documented change control.",
      },
    ],
  },
  "442A-F-F-31": {
    video: {
      youtubeId: "nQGDqIQjoXc",
      title: "Industrial pneumatics — PLC wiring and testing",
    },
    images: [
      {
        src: IMG.pneumaticValve,
        alt: "Pneumatic cylinder and valve",
        caption: "Fluid power controls use regulators, valves, positioners, and electrical interlocks.",
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
  "403A-A-A-1": {
    video: {
      youtubeId: "YdZfUEb9s-o",
      title: "Carpentry tools — safe use and maintenance basics",
    },
    images: [
      {
        // Wikimedia Commons: File:Carpentry hand tools.jpg (hosted in storage)
        src: "https://jxenasjdyzpduklrdfnd.supabase.co/storage/v1/object/public/images/lesson-media/ai/403a-a-a-1/mre8z4xs.jpg",
        alt: "Carpentry hand tools laid out for use and maintenance",
        caption:
          "Inspect, maintain, and use carpentry hand and power tools per manufacturer specs before every task.",
      },
    ],
  },
  "403A-A-A-2": {
    video: {
      youtubeId: "Vm_daEZ-veM",
      title: "Construction site safety induction",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Jobsite safety awareness",
        caption: "Safety-related activities include PPE, hazard assessment, and fall protection.",
      },
    ],
  },
  "403A-A-A-3": {
    video: {
      youtubeId: "o5CWnUFsevo",
      title: "Scaffolding and temporary access structures",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Temporary access structure framing",
        caption: "Scaffold, ladders, and temporary platforms must be erected and inspected before use.",
      },
    ],
  },
  "403A-A-A-4": {
    video: {
      youtubeId: "fJeRabV5hNU",
      title: "Jobsite communication and mentoring",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Crew coordination on site",
        caption: "Clear communication and mentoring keep crews aligned on drawings and safety.",
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
  "403A-B-B-5": {
    video: {
      youtubeId: "wFdRbiGFx1M",
      title: "Reading construction drawings and documentation",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Plans and measuring tools",
        caption: "Interpret drawings, specs, and schedules before cutting or placing materials.",
      },
    ],
  },
  "403A-B-B-6": {
    video: {
      youtubeId: "Vm_daEZ-veM",
      title: "Organizing carpentry work on site",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Material staging and tools",
        caption: "Organize materials, sequencing, and crew tasks to reduce rework.",
      },
    ],
  },
  "403A-B-B-7": {
    video: {
      youtubeId: "3fP0LZMEV5w",
      title: "Building layout and measuring techniques",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Layout with tape measure",
        caption: "Square, level, and plumb layout controls every framing and finish module.",
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
  "403A-C-C-8": {
    video: {
      youtubeId: "tyQCAASaOUM",
      title: "Concrete formwork before the pour",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Wood formwork for concrete",
        caption: "Formwork construction includes ties, walers, bracing, and release agents.",
      },
    ],
  },
  "403A-C-C-9": {
    video: {
      youtubeId: "tyQCAASaOUM",
      title: "Placing and finishing concrete products",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Concrete placement tools",
        caption: "Install concrete, cement-based, and epoxy products to specified finish and cure.",
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
  "403A-D-D-10": {
    video: {
      youtubeId: "3fP0LZMEV5w",
      title: "Floor framing systems",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Floor joist framing",
        caption: "Floor systems include joists, beams, rim boards, and subfloor fastening.",
      },
    ],
  },
  "403A-D-D-11": {
    video: {
      youtubeId: "3fP0LZMEV5w",
      title: "Deck framing and ledger attachment",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Exterior deck framing context",
        caption: "Deck systems need correct ledger flashing, posts, beams, and guardrails.",
      },
    ],
  },
  "403A-D-D-12": {
    video: {
      youtubeId: "wFdRbiGFx1M",
      title: "Framing walls — precise stud layout",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Wall stud framing",
        caption: "Wall systems include plates, studs, headers, and sheathing on layout.",
      },
    ],
  },
  "403A-D-D-13": {
    video: {
      youtubeId: "3fP0LZMEV5w",
      title: "Roof and ceiling framing",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Roof and ceiling framing members",
        caption: "Roof and ceiling systems include rafters, trusses, ridges, and ceiling joists.",
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
  "403A-E-E-14": {
    video: {
      youtubeId: "WQU3Qq3p73I",
      title: "Installing exterior doors and windows",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Exterior opening installation",
        caption: "Doors and windows need plumb, square, flashed, and sealed installation.",
      },
    ],
  },
  "403A-E-E-15": {
    video: {
      youtubeId: "WQU3Qq3p73I",
      title: "Roofing installation basics",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Roof layout and measuring",
        caption: "Roofing includes underlayment, flashing, fasteners, and weather exposure.",
      },
    ],
  },
  "403A-E-E-16": {
    video: {
      youtubeId: "WQU3Qq3p73I",
      title: "How to install vinyl siding panels",
    },
    images: [
      {
        src: IMG.outdoorWiring,
        alt: "Exterior cladding and finishes",
        caption: "Exterior finishes need correct starter courses, trim, and expansion gaps.",
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
  "403A-F-F-17": {
    video: {
      youtubeId: "wfsmfJ_tkuk",
      title: "Wall and ceiling finish installation",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Interior wall and ceiling substrate",
        caption: "Wall and ceiling finishes depend on flat framing and correct fastener patterns.",
      },
    ],
  },
  "403A-F-F-18": {
    video: {
      youtubeId: "wfsmfJ_tkuk",
      title: "Flooring installation basics",
    },
    images: [
      {
        src: IMG.tapeMeasure,
        alt: "Flooring layout measuring",
        caption: "Flooring layout starts with square reference lines and expansion gaps.",
      },
    ],
  },
  "403A-F-F-19": {
    video: {
      youtubeId: "wfsmfJ_tkuk",
      title: "Installing interior doors and trim",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Interior door and trim tools",
        caption: "Interior doors and windows need plumb jambs, even reveals, and secure hardware.",
      },
    ],
  },
  "403A-F-F-20": {
    video: {
      youtubeId: "wfsmfJ_tkuk",
      title: "How to install baseboards and finish stairs",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Finish stairs and trim components",
        caption: "Finish components and stairs require accurate rise/run and tight mitres.",
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
  "403A-G-G-21": {
    video: {
      youtubeId: "JP4uP5DMGLo",
      title: "Renovation support and protection activities",
    },
    images: [
      {
        src: IMG.wrench,
        alt: "Renovation support tools",
        caption: "Renovation support includes protection, selective demo planning, and temporary support.",
      },
    ],
  },
  "403A-G-G-22": {
    video: {
      youtubeId: "JP4uP5DMGLo",
      title: "Building a new interior wall during renovation",
    },
    images: [
      {
        src: IMG.woodFraming,
        alt: "Renovation construction framing",
        caption: "Renovation construction ties new work into existing structure safely and squarely.",
      },
    ],
  },
};

export function blockMediaKey(
  tradeCode: string,
  blockCode: string,
  taskCode?: string,
) {
  const base = `${tradeCode.trim().toUpperCase()}-${blockCode.trim().toUpperCase()}`;
  return taskCode
    ? `${base}-${taskCode.trim().toUpperCase()}`
    : base;
}

export function getBlockMedia(
  tradeCode: string,
  blockCode: string,
  taskCode?: string,
): BlockMediaBundle | undefined {
  if (taskCode) {
    const taskMedia = BLOCK_MEDIA[blockMediaKey(tradeCode, blockCode, taskCode)];
    if (taskMedia) return taskMedia;
  }
  return BLOCK_MEDIA[blockMediaKey(tradeCode, blockCode)];
}

export function formatBlockMediaForPrompt(
  tradeCode: string,
  blockCode: string,
  taskCode?: string,
): string {
  const media = getBlockMedia(tradeCode, blockCode, taskCode);
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

/** Dev/build guard: each 442A per-task lesson must have a unique video and image. */
export function assertUnique442ATaskMedia(): void {
  const tradeCode = "442A";
  const usedVideos = new Map<string, string>();
  const usedImages = new Map<string, string>();

  for (const key of Object.keys(BLOCK_MEDIA)) {
    if (!key.startsWith(`${tradeCode}-`) || key.split("-").length < 4) continue;

    const media = BLOCK_MEDIA[key];
    const videoId = media?.video?.youtubeId;
    if (!videoId) throw new Error(`Task media ${key} is missing a video`);
    if (usedVideos.has(videoId)) {
      throw new Error(
        `Duplicate video ${videoId} on ${key} (already on ${usedVideos.get(videoId)})`,
      );
    }
    usedVideos.set(videoId, key);

    const imageSrc = media?.images?.[0]?.src;
    if (!imageSrc) throw new Error(`Task media ${key} is missing an image`);
    if (usedImages.has(imageSrc)) {
      throw new Error(
        `Duplicate image on ${key} (already on ${usedImages.get(imageSrc)})`,
      );
    }
    usedImages.set(imageSrc, key);
  }
}

assertUnique442ATaskMedia();
