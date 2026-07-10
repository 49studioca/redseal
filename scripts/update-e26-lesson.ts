/**
 * Persist a curated deep lesson for 442A E-26 (signalling systems).
 * Fixes thin / typeless AI content with exam-relevant teaching blocks.
 *
 * Usage: npx tsx scripts/update-e26-lesson.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvFile();

const content_blocks = [
  {
    type: "heading",
    content: "What industrial signalling systems do",
  },
  {
    type: "text",
    content:
      "Industrial signalling systems tell people and machines what is happening on the plant floor: machine status, process alarms, evacuation tones, and emergency notification. As an industrial electrician (442A), you install and maintain horns, strobes, stack (tower) lights, panel annunciators, and fire-alarm notification appliances so operators get the right message at the right place. Good signalling is not decoration — it is part of the safety and control system, and it must remain reliable after vibration, dust, washdown, and years of service.",
  },
  {
    type: "text",
    content:
      "Keep the scope clear for this task. Signalling is the audible and visual indication layer. Plant communication systems (PA, intercom, data networks) and building automation (BAS/BMS) are separate RSOS tasks. On the job you will still coordinate with those systems — for example a PLC may drive a stack light, or a fire panel may supervise notification circuits — but your focus here is selecting, wiring, powering, testing, and maintaining the signalling devices themselves.",
  },
  {
    type: "callout",
    content:
      "Before you pull cable, ask: Who must see or hear this signal? From how far? In what ambient noise and lighting? Is the area classified, washdown, outdoor, or high vibration? Device choice follows the answer.",
    meta: { variant: "tip" },
  },
  {
    type: "heading",
    content: "Device types and when to use them",
  },
  {
    type: "text",
    content:
      "Audible devices (horns, buzzers, electronic sounders) cut through visual clutter but fail in high ambient noise or when workers wear hearing protection. Visual devices (strobes, beacons, LED stack lights) work when noise is high or hearing protection is required, and they support accessibility. Stack lights usually encode machine state with colour and flash patterns (for example green = run, amber = attention, red = fault). Annunciators and graphic panels gather many alarm points in one place for operators and maintenance. Fire-alarm horns and strobes are notification appliances: they are listed for that use, spaced and powered to published candela/dB ratings, and often supervised by the fire alarm control unit.",
  },
  {
    type: "text",
    content:
      "Match the enclosure and listing to the environment. Use NEMA/IP-rated housings for dust and washdown, corrosion-resistant materials in chemical areas, and explosion-proof or intrinsically safe equipment where the area classification requires it. Confirm voltage (24 V DC is common for industrial and fire notification; 120 V AC still appears on older plant horns), current draw, duty cycle, and whether the device needs a separate power supply or is loop-powered from a panel. Never substitute a general-purpose beacon for a listed fire notification appliance on a fire circuit.",
  },
  {
    type: "image",
    content:
      "https://jxenasjdyzpduklrdfnd.supabase.co/storage/v1/object/public/images/lesson-media/fire-alarm-device.jpg",
    meta: {
      alt: "Fire alarm pull station",
      caption:
        "Signalling includes horns, strobes, stack lights, and annunciators — select listed devices for the application.",
    },
  },
  {
    type: "heading",
    content: "Power, supervision, and circuit design",
  },
  {
    type: "text",
    content:
      "Most modern industrial signalling runs on dedicated low-voltage DC supplies or from PLC/IO modules. Size the supply for continuous load plus inrush (strobes and electronic horns can spike at turn-on). Provide overcurrent protection appropriate to the conductors and supply, and keep signalling power separate from noisy motor circuits when possible. On fire-alarm notification circuits, the control unit typically supervises the loop for open and short faults using end-of-line resistors or addressable supervision — do not remove EOL devices or parallel unauthorized loads onto a supervised circuit.",
  },
  {
    type: "text",
    content:
      "Class B (style B) notification circuits are common: a single path with an end-of-line resistor; an open silences devices beyond the break. Class A (style A) returns the circuit to the panel so a single open still leaves a path to devices. Know which style the panel and drawings specify before you land field wiring. For PLC-driven stack lights and machine horns, document whether outputs are sourcing or sinking, whether lamps are LED or incandescent, and whether flash patterns are generated in the device or in the PLC program.",
  },
  {
    type: "callout",
    content:
      "Warning: On supervised fire or security signalling circuits, an extra parallel device, wrong EOL value, or ground fault can put the circuit into trouble and may prevent notification during an alarm. Treat as-built drawings and panel manuals as part of the install.",
    meta: { variant: "warning" },
  },
  {
    type: "heading",
    content: "Installation practice on the plant floor",
  },
  {
    type: "text",
    content:
      "Plan device locations for line-of-sight and sound coverage: above aisle intersections, at egress paths, on machine cells where operators stand, and away from corners that shadow strobes. Mount at manufacturer-recommended heights and orientations. Use raceway, tray, or cable types allowed by the CEC for the location, support conductors properly, and maintain separation from high-voltage and VFD motor leads to reduce induced noise on low-voltage signalling pairs. Land shields at the panel end only unless the manufacturer specifies otherwise. Label every device and conductor so the next electrician can troubleshoot without guessing.",
  },
  {
    type: "text",
    content:
      "Follow the Canadian Electrical Code for wiring methods, bonding, and equipment in the location (including wet, hazardous, and emergency systems rules that apply to your install). Fire alarm work also follows the applicable ULC installation standards and the approved shop drawings — spacing of horns and strobes is not a guess; it is based on room size, ambient sound, and listed candela ratings. Coordinate lockout/tagout with operations before opening panels or interrupting plant alarm circuits that may be live for production.",
  },
  {
    type: "video",
    content: "P-5s_8EBMt4",
    meta: { title: "Installing fire alarm horn strobes" },
  },
  {
    type: "heading",
    content: "Voltage drop on long notification runs",
  },
  {
    type: "text",
    content:
      "Long runs of small conductors to horns and strobes can drop voltage enough that devices sound weak or flash dim — especially at the far end of a Class B circuit. CEC Rule 8-102(1)(a) limits branch-circuit voltage drop to 3% of system voltage at the farthest outlet for power, heating, or lighting loads; treat signalling power the same way in practice so devices stay within their operating range. For a 24 V DC notification circuit, 3% is only 0.72 V — plan conductor size and loop length carefully.",
  },
  {
    type: "math",
    content: "V_d = \\frac{2 \\times K \\times I \\times L}{CM}",
  },
  {
    type: "text",
    content:
      "Worked example (copper, approximate K = 12.9 ohm·cmil/ft): a 24 V DC horn/strobe circuit draws 1.5 A total at the far end of a 200 ft one-way run on 16 AWG (CM ≈ 2583). Voltage drop is \\( V_d = \\frac{2 \\times 12.9 \\times 1.5 \\times 200}{2583} \\approx 3.0\\ \\text{V} \\), which is about 12.5% of 24 V — far above a 3% target. Upsize to 12 AWG (CM ≈ 6530) and the drop falls to roughly \\( 1.2\\ \\text{V} \\) (about 5%). If that is still too high, shorten the run, add a booster/power supply closer to the devices, or split the circuit. Always confirm with the panel manufacturer’s NAC voltage-drop worksheets when doing fire alarm work.",
  },
  {
    type: "heading",
    content: "Commissioning, maintenance, and troubleshooting",
  },
  {
    type: "text",
    content:
      "After install, commission systematically: verify supply voltage at the panel and at the farthest device under load, confirm polarity on DC circuits, test each audible and visual appliance, and walk the coverage area. For fire systems, perform the required acceptance tests with the AHJ or commissioning agent and record results. For machine signalling, verify that PLC states match the stack-light colours and that silence/acknowledge behaviour matches the control narrative. Leave as-built drawings, EOL locations, and device addresses with the customer.",
  },
  {
    type: "text",
    content:
      "Maintenance keeps signalling trustworthy. Schedule functional tests, clean lenses and horn grills in dusty areas, check mounting hardware after vibration, and replace aging batteries in panels that back up notification power. When a device fails, start with the obvious: power present, correct voltage under load, intact conductors, correct EOL, and no ground faults. On supervised circuits, a trouble light often points to opens, shorts, or wrong resistance before the device itself is bad. Swap with a known-good listed device only after the circuit proves healthy — otherwise you mask a wiring fault.",
  },
  {
    type: "callout",
    content:
      "Tip: Carry a tone generator / cable tracer and a DC clamp or meter that can read both voltage and current. Many “dead horn” calls are open NAC legs, reversed polarity on polarized devices, or voltage collapse under load — not a failed speaker cone.",
    meta: { variant: "tip" },
  },
  {
    type: "heading",
    content: "Check your understanding",
  },
  {
    type: "check_question",
    content:
      "Why must you preserve the end-of-line resistor (or listed supervision method) on a supervised fire-alarm notification circuit?",
    meta: {
      answer:
        "Supervision detects opens and shorts so the panel can show trouble and still indicate that notification may be impaired. Removing or bypassing the EOL (or adding unauthorized parallel loads) can hide faults and leave devices silent during an alarm.",
    },
  },
  {
    type: "check_question",
    content:
      "A 24 V DC strobe circuit may drop about 3 V at the farthest device under load. Is that acceptable if you are targeting a 3% voltage-drop limit, and what should you do?",
    meta: {
      answer:
        "No. 3% of 24 V is only 0.72 V, so a 3 V drop (~12.5%) is excessive. Upsize conductors, shorten the run, split the circuit, or add a local power supply / booster so devices stay within rated voltage.",
      steps:
        "Allowable drop ≈ 0.03 × 24 V = 0.72 V. Compare measured or calculated V_d to that limit; if higher, reduce I×L/CM (larger CM, shorter L, or less load per circuit).",
    },
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("lessons")
    .update({
      title: "Installing and Maintaining Industrial Signalling Systems",
      summary:
        "Install, power, supervise, test, and maintain industrial horns, strobes, stack lights, and notification appliances to CEC and listed-system requirements.",
      content_blocks,
      estimated_minutes: 35,
      chapter_task_code: "E-26",
      review_status: "approved",
    })
    .eq("slug", "block-e-e-26-442a")
    .select("id, slug, title, estimated_minutes")
    .single();

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const textChars = content_blocks
    .filter((b) => ["text", "heading", "callout"].includes(b.type))
    .map((b) => b.content)
    .join("").length;

  console.log("Updated E-26:", data);
  console.log({
    blocks: content_blocks.length,
    textChars,
    types: content_blocks.map((b) => b.type),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
