import { Languages } from "lucide-react";
import { TRANSLATION_LANGUAGES } from "@/lib/translation/languages";

type TranslateFeatureShowcaseProps = {
  tradeName: string;
  tradeCode: string;
};

export function TranslateFeatureShowcase({
  tradeName,
  tradeCode,
}: TranslateFeatureShowcaseProps) {
  const supportedLanguages = TRANSLATION_LANGUAGES.filter(
    (l) => l.code !== "en",
  );

  return (
    <div className="mt-10 overflow-hidden rounded-[20px] border border-[#E5E0D8] bg-gradient-to-br from-[#EFF6FF] via-white to-[#F6F3EE]">
      <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:p-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-bold text-[#2563EB]">
            <Languages className="h-4 w-4" />
            Built for ESL apprentices
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold leading-tight tracking-tight text-[#1F2A37] sm:text-4xl">
            Click any word to translate
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
            {tradeName} lessons use technical English that can be tough if it is
            not your first language. Tap any word in a lesson, quiz, or
            explanation to see it in your language — without leaving your{" "}
            {tradeCode} study session.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm font-semibold text-[#334155]">
            {[
              `${supportedLanguages.length} languages including Punjabi, Spanish, Arabic, and Mandarin`,
              "Definitions and trade context — not just a dictionary lookup",
              "Save words to your personal vocabulary list",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {supportedLanguages.map((lang) => (
              <span
                key={lang.code}
                className="rounded-full border border-[#E5E0D8] bg-white px-2.5 py-1 text-xs font-semibold text-[#475569]"
                dir={lang.rtl ? "rtl" : "ltr"}
              >
                {lang.nativeLabel}
              </span>
            ))}
          </div>
        </div>

        {/* Visual mockup */}
        <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
          <div className="overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white shadow-[0_20px_50px_rgba(31,42,55,0.12)]">
            <div className="flex items-center gap-2 border-b border-[#ECE6DC] bg-[#F6F3EE] px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FCA5A5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FCD34D]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#86EFAC]" />
              </div>
              <span className="ml-2 truncate text-[11px] font-semibold text-[#64748B]">
                {tradeCode} · Block A — Lesson 3
              </span>
            </div>

            <div className="relative p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C0271E]">
                {tradeName} lesson
              </p>
              <h4 className="mt-1 font-[family-name:var(--font-barlow-semi)] text-base font-semibold text-[#1F2A37]">
                Motor control &amp; troubleshooting
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                Before energizing the circuit, verify lockout/tagout is in
                place. A{" "}
                <span className="relative cursor-pointer rounded bg-[#FEF2F2] px-1 py-0.5 font-semibold text-[#C0271E] ring-2 ring-[#C0271E]/25">
                  contactor
                </span>{" "}
                that fails to pull in may indicate a coil fault, low control
                voltage, or open interlock in the control circuit.
              </p>

              <div className="absolute bottom-6 left-5 right-5 sm:left-8 sm:right-auto sm:w-[280px]">
                <div className="rounded-xl border border-[#E5E0D8] bg-white p-4 shadow-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-[family-name:var(--font-barlow-semi)] text-base font-bold capitalize text-[#1F2A37]">
                        contactor
                      </div>
                      <div className="mt-0.5 text-[15px] font-semibold text-[#C0271E]">
                        contactor
                      </div>
                    </div>
                    <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
                      Español
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                    Interruptor electromagnético que cierra los circuitos de
                    potencia del motor cuando la bobina está energizada.
                  </p>
                  <div className="mt-3 rounded-lg bg-[#F6F3EE] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                      In this context
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#334155]">
                      Si el contactor no engancha, puede haber falla en la
                      bobina, voltaje bajo en control o un enclavamiento abierto
                      en el circuito.
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-lg bg-[#1F2A37] px-2.5 py-1 text-[10px] font-bold text-white">
                      Save word
                    </span>
                    <span className="rounded-lg border border-[#E5E0D8] px-2.5 py-1 text-[10px] font-semibold text-[#64748B]">
                      Close
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#ECE6DC] bg-[#FAFAF8] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                  <Languages className="h-3.5 w-3.5 text-[#C0271E]" />
                  Word translation
                </div>
                <div className="h-5 w-9 rounded-full bg-[#C0271E] p-0.5">
                  <div className="ml-auto h-4 w-4 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-[#2563EB] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:-right-4">
            Tap any word
          </div>
        </div>
      </div>
    </div>
  );
}
