import { parseLessonMathText, textHasInlineMath, textNeedsMathRendering } from "../src/lib/math/inline-math";

const cases = {
  good:
    "For example, if you have a 100-meter run (approximately 328 feet) with a current of 15 A, you can calculate the voltage drop as follows:\n\\[\\text{Voltage Drop} = 100 \\times 0.0035 \\times 15 = 5.25 \\text{V}\\]\nThis voltage drop is within acceptable limits.",
  noClose:
    "For example, if you have a 100-meter run (approximately 328 feet) with a current of 15 A, you can calculate the voltage drop as follows: \\[ \\text{Voltage Drop} = 100 \\times 0.0035 \\times 15 = 5.25 \\text{V}",
  corrupted:
    "For example, if you have a 100-meter run (approximately 328 feet) with a current of 15 A, you can calculate the voltage drop as follows:\n\\[" +
    "\text{Voltage Drop} = 100 \\times 0.0035 \\times 15 = 5.25 \text{V}\\]\nThis voltage drop is within acceptable limits.",
};

for (const [name, text] of Object.entries(cases)) {
  console.log("===", name, "===");
  console.log("hasInline:", textHasInlineMath(text));
  console.log("needs:", textNeedsMathRendering(text));
  console.log(JSON.stringify(parseLessonMathText(text), null, 2));
}
