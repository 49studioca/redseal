/** Curated lesson images — source URLs used once by sync script, served from Supabase Storage. */
export const LESSON_IMAGE_ASSETS = {
  "copper-pipes": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Copper_water_pipes.jpg/960px-Copper_water_pipes.jpg",
    storagePath: "lesson-media/copper-pipes.jpg",
  },
  "pvc-pipe": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/PVC_Pipe.jpg/960px-PVC_Pipe.jpg",
    storagePath: "lesson-media/pvc-pipe.jpg",
  },
  "copper-solder": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Propane_torch_soldering_copper_pipe.jpg/960px-Propane_torch_soldering_copper_pipe.jpg",
    storagePath: "lesson-media/copper-solder.jpg",
  },
  "copper-press": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Copper-press-fitting.JPG/960px-Copper-press-fitting.JPG",
    storagePath: "lesson-media/copper-press.jpg",
  },
  "pvc-drain": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/White_pipe_to_temporarily_drain_water_into_large_bucket.jpg",
    storagePath: "lesson-media/pvc-drain.jpg",
  },
  wrench: {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Wrench.jpg/960px-Wrench.jpg",
    storagePath: "lesson-media/wrench.jpg",
  },
  "electrical-panel": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Electrical_panel.jpg/960px-Electrical_panel.jpg",
    storagePath: "lesson-media/electrical-panel.jpg",
  },
  "outdoor-wiring": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Outdoor_wiring.JPG/960px-Outdoor_wiring.JPG",
    storagePath: "lesson-media/outdoor-wiring.jpg",
  },
  "wet-room-wiring": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wiring_in_wet_rooms.JPG/960px-Wiring_in_wet_rooms.JPG",
    storagePath: "lesson-media/wet-room-wiring.jpg",
  },
  "motor-starter": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Motor_starter.jpg/960px-Motor_starter.jpg",
    storagePath: "lesson-media/motor-starter.jpg",
  },
  "smoke-detector": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/63/Smoke_detector.jpg",
    storagePath: "lesson-media/smoke-detector.jpg",
  },
  "solar-panel": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Solar_panel.jpg/960px-Solar_panel.jpg",
    storagePath: "lesson-media/solar-panel.jpg",
  },
  welding: {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Welding.jpg/960px-Welding.jpg",
    storagePath: "lesson-media/welding.jpg",
  },
  "wood-framing": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/House_framing.jpg/960px-House_framing.jpg",
    storagePath: "lesson-media/wood-framing.jpg",
  },
  "tape-measure": {
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Tape_measure.jpg/960px-Tape_measure.jpg",
    storagePath: "lesson-media/tape-measure.jpg",
  },
} as const;

export type LessonImageKey = keyof typeof LESSON_IMAGE_ASSETS;
