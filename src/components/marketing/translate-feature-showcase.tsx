"use client";

import {
  AnimatedTranslateDemo,
  type DemoLang,
  type TranslateDemoContent,
} from "@/components/marketing/animated-translate-demo";

type TranslateFeatureShowcaseProps = {
  tradeName: string;
  tradeCode: string;
  tradeSlug: string;
};

const SHARED_LANG_SHELL = [
  { code: "es", label: "Español" },
  { code: "fa", label: "فارسی", rtl: true },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية", rtl: true },
] as const;

function langsFrom(
  entries: Array<{
    translation: string;
    definition: string;
    context: string;
  }>,
): DemoLang[] {
  return SHARED_LANG_SHELL.map((shell, i) => ({
    ...shell,
    ...entries[i],
  }));
}

const TRADE_DEMOS: Record<
  string,
  Omit<TranslateDemoContent, "tradeName" | "tradeCode">
> = {
  "construction-electrician": {
    word: "contactor",
    lessonTitle: "Motor control & troubleshooting",
    sentenceBefore:
      "Before energizing the circuit, verify lockout/tagout is in place. A ",
    sentenceAfter:
      " that fails to pull in may indicate a coil fault, low control voltage, or open interlock in the control circuit.",
    langs: langsFrom([
      {
        translation: "contactor",
        definition:
          "Interruptor electromagnético que cierra los circuitos de potencia del motor cuando la bobina está energizada.",
        context:
          "Si el contactor no engancha, puede haber falla en la bobina, voltaje bajo en control o un enclavamiento abierto.",
      },
      {
        translation: "کنتاکتور",
        definition:
          "کلید الکترومغناطیسی که هنگام فعال شدن سیم‌پیچ، مدارهای قدرت موتور را می‌بندد.",
        context:
          "اگر کنتاکتور جذب نشود، ممکن است سیم‌پیچ خراب، ولتاژ کنترل پایین، یا اینترلاک باز باشد.",
      },
      {
        translation: "ਕੰਟੈਕਟਰ",
        definition:
          "ਇੱਕ ਇਲੈਕਟ੍ਰੋਮੈਗਨੈਟਿਕ ਸਵਿੱਚ ਜੋ ਕੋਇਲ ਚਾਲੂ ਹੋਣ ਤੇ ਮੋਟਰ ਪਾਵਰ ਸਰਕਟ ਬੰਦ ਕਰਦਾ ਹੈ।",
        context:
          "ਜੇ ਕੰਟੈਕਟਰ ਨਾ ਖਿੱਚੇ, ਤਾਂ ਕੋਇਲ ਖਰਾਬ, ਘੱਟ ਕੰਟਰੋਲ ਵੋਲਟੇਜ ਜਾਂ ਖੁੱਲ੍ਹਾ ਇੰਟਰਲਾਕ ਹੋ ਸਕਦਾ ਹੈ।",
      },
      {
        translation: "接触器",
        definition: "线圈通电时用于闭合电机功率回路的电磁开关。",
        context: "如果接触器不吸合，可能是线圈故障、控制电压偏低或联锁断路。",
      },
      {
        translation: "مُلَامِس",
        definition:
          "مفتاح كهرومغناطيسي يغلق دوائر قدرة المحرك عندما تكون الملفّة مُفعَّلة.",
        context:
          "إذا لم ينجذب الملامس فقد يكون هناك عطل في الملف أو جهد تحكم منخفض أو قفل مفتوح.",
      },
    ]),
  },
  "industrial-electrician": {
    word: "VFD",
    lessonTitle: "Drive setup & motor protection",
    sentenceBefore:
      "When commissioning a pump skid, confirm the motor nameplate matches the ",
    sentenceAfter:
      " parameters for voltage, FLA, and ramp settings before you start the first loaded cycle.",
    langs: langsFrom([
      {
        translation: "variador de frecuencia",
        definition:
          "Dispositivo que controla la velocidad del motor ajustando la frecuencia y la tensión de salida.",
        context:
          "Si el VFD dispara por sobrecorriente, revise la carga mecánica, el cableado del motor y los parámetros de rampa.",
      },
      {
        translation: "درایو فرکانس متغیر",
        definition:
          "دستگاهی که با تغییر فرکانس و ولتاژ خروجی، سرعت موتور را کنترل می‌کند.",
        context:
          "اگر VFD به‌خاطر اضافه جریان قطع شود، بار مکانیکی، سیم‌کشی موتور و تنظیمات رمپ را بررسی کنید.",
      },
      {
        translation: "ਵੇਰੀਏਬਲ ਫ੍ਰੀਕੁਐਂਸੀ ਡਰਾਈਵ",
        definition:
          "ਇੱਕ ਉਪਕਰਣ ਜੋ ਆਉਟਪੁੱਟ ਫ੍ਰੀਕੁਐਂਸੀ ਅਤੇ ਵੋਲਟੇਜ ਬਦਲ ਕੇ ਮੋਟਰ ਦੀ ਰਫ਼ਤਾਰ ਨਿਯੰਤਰਿਤ ਕਰਦਾ ਹੈ।",
        context:
          "ਜੇ VFD ਓਵਰਕਰੰਟ ਤੋਂ ਟ੍ਰਿਪ ਕਰੇ, ਮਕੈਨੀਕਲ ਲੋਡ, ਮੋਟਰ ਵਾਇਰਿੰਗ ਅਤੇ ਰੈਂਪ ਸੈਟਿੰਗਾਂ ਚੈੱਕ ਕਰੋ।",
      },
      {
        translation: "变频器",
        definition: "通过改变输出频率和电压来控制电机速度的装置。",
        context: "如果变频器因过流跳闸，检查机械负载、电机接线与加速斜坡参数。",
      },
      {
        translation: "محول تردد",
        definition:
          "جهاز يتحكم بسرعة المحرك عبر تغيير تردد وجهد الخرج.",
        context:
          "إذا تعطل الـ VFD بسبب زيادة التيار، افحص الحمل الميكانيكي وتوصيل المحرك وإعدادات التسارع.",
      },
    ]),
  },
  plumber: {
    word: "trap",
    lessonTitle: "DWV layout & fixture connections",
    sentenceBefore:
      "When roughing in a lavatory, size the fixture drain correctly and install the ",
    sentenceAfter:
      " so the water seal stays intact and sewer gas cannot enter the room.",
    langs: langsFrom([
      {
        translation: "sifón",
        definition:
          "Tramo curvado de tubería que retiene un sello de agua para bloquear los gases del alcantarillado.",
        context:
          "Si el sifón se seca o se descebó, puede haber siphonic action o ventilación insuficiente en el ramal.",
      },
      {
        translation: "سیفون",
        definition:
          "خم لوله‌ای که با نگه داشتن آب، گاز فاضلاب را از ورود به فضا جلوگیری می‌کند.",
        context:
          "اگر سیفون خشک شود یا آب آن خالی شود، ممکن است سیفون‌اَکشن یا تهویه ناکافی در شاخه وجود داشته باشد.",
      },
      {
        translation: "ਟ੍ਰੈਪ / ਸਾਈਫਨ",
        definition:
          "ਪਾਈਪ ਦਾ ਝੁਕਿਆ ਹਿੱਸਾ ਜੋ ਪਾਣੀ ਦੀ ਸੀਲ ਰੱਖ ਕੇ ਸੀਵਰ ਗੈਸ ਰੋਕਦਾ ਹੈ।",
        context:
          "ਜੇ ਟ੍ਰੈਪ ਸੁੱਕ ਜਾਵੇ ਜਾਂ ਖਾਲੀ ਹੋਵੇ, ਤਾਂ ਸਾਈਫਨਿਕ ਐਕਸ਼ਨ ਜਾਂ ਘੱਟ ਵੈਂਟਿੰਗ ਹੋ ਸਕਦੀ ਹੈ।",
      },
      {
        translation: "存水弯",
        definition: "保留水封以阻止下水道气体进入室内的弯管段。",
        context: "如果存水弯干涸或失水，可能是虹吸作用或支管通气不足。",
      },
      {
        translation: "مصيدة",
        definition:
          "جزء منحنٍ من الأنبوب يحافظ على ختم مائي لمنع غازات الصرف.",
        context:
          "إذا جفت المصيدة أو فقدت الماء فقد يكون هناك سيفون أو تهوية غير كافية.",
      },
    ]),
  },
  welder: {
    word: "penetration",
    lessonTitle: "Groove welds & joint prep",
    sentenceBefore:
      "Before calling the root pass complete, check both faces of the joint for full ",
    sentenceAfter:
      " so the weld metal fuses through the groove without leaving incomplete fusion.",
    langs: langsFrom([
      {
        translation: "penetración",
        definition:
          "Profundidad a la que el metal de aporte se fusiona a través de la junta soldada.",
        context:
          "Una penetración insuficiente puede dejar falta de fusión en la raíz y provocar rechazo en la prueba.",
      },
      {
        translation: "نفوذ جوش",
        definition:
          "عمقی که فلز جوش به داخل اتصال نفوذ کرده و آن را به هم جوش می‌دهد.",
        context:
          "نفوذ ناکافی ممکن است باعث عدم جوش‌خوردگی در ریشه شود و آزمون را رد کند.",
      },
      {
        translation: "ਪੈਨੀਟ੍ਰੇਸ਼ਨ",
        definition:
          "ਉਹ ਡੂੰਘਾਈ ਜਿੱਥੇ ਵੈਲਡ ਮੈਟਲ ਜੋੜ ਵਿੱਚ ਘੁਲ ਕੇ ਇੱਕ ਠੋਸ ਜੋੜ ਬਣਾਉਂਦਾ ਹੈ।",
        context:
          "ਘੱਟ ਪੈਨੀਟ੍ਰੇਸ਼ਨ ਨਾਲ ਰੂਟ ਵਿੱਚ incomplete fusion ਰਹਿ ਸਕਦਾ ਹੈ ਅਤੇ ਟੈਸਟ ਫੇਲ ਹੋ ਸਕਦਾ ਹੈ।",
      },
      {
        translation: "熔深",
        definition: "焊金属熔入并融合接头的深度。",
        context: "熔深不足可能在根部留下未熔合，导致探伤不合格。",
      },
      {
        translation: "اختراق",
        definition: "عمق انصهار معدن اللحام داخل الوصلة.",
        context:
          "قد يترك الاختراق غير الكافي عدم انصهار في الجذر ويرفض في الفحص.",
      },
    ]),
  },
  carpenter: {
    word: "joist",
    lessonTitle: "Floor framing & layout",
    sentenceBefore:
      "After snapping the bearing lines, place each floor ",
    sentenceAfter:
      " on layout so crown faces up, ends sit full bearing, and the rim board ties the assembly.",
    langs: langsFrom([
      {
        translation: "viga (joist)",
        definition:
          "Miembro horizontal que sostiene el piso o el techo entre apoyos.",
        context:
          "Si el joist está fuera de centro o sin apoyo completo, puede causar rechinar o desviación del piso.",
      },
      {
        translation: "تیرچه کف",
        definition:
          "عضو افقی که کف یا سقف را بین دو تکیه‌گاه نگه می‌دارد.",
        context:
          "اگر تیرچه از آکس خارج باشد یا تکیه‌گاه کامل نداشته باشد، ممکن است کف صدا کند یا تاب بردارد.",
      },
      {
        translation: "ਜੋਇਸਟ",
        definition:
          "ਇੱਕ ਲੇਟਵਾਂ ਮੈਂਬਰ ਜੋ ਫਰਸ਼ ਜਾਂ ਛੱਤ ਨੂੰ ਸਪੋਰਟਾਂ ਵਿਚਕਾਰ ਸਹਾਰਾ ਦਿੰਦਾ ਹੈ।",
        context:
          "ਜੇ ਜੋਇਸਟ ਆਫ਼-ਲੇਆਉਟ ਹੋਵੇ ਜਾਂ ਪੂਰਾ ਬੇਅਰਿੰਗ ਨਾ ਮਿਲੇ, ਫਰਸ਼ ਚਿੜਚਿੜਾ ਜਾਂ ਝੁਕ ਸਕਦਾ ਹੈ।",
      },
      {
        translation: "搁栅",
        definition: "在支座之间支撑楼板或顶棚的水平构件。",
        context: "如果搁栅偏位或端部支承不足，楼板可能异响或下挠。",
      },
      {
        translation: "رافدة",
        definition: "عنصر أفقي يحمل الأرضية أو السقف بين المساند.",
        context:
          "إذا خرجت الرافدة عن الخط أو لم تستند جيداً فقد يصدر الأرض صريراً أو انحرافاً.",
      },
    ]),
  },
};

function demoForTrade(
  tradeSlug: string,
  tradeName: string,
  tradeCode: string,
): TranslateDemoContent {
  const base =
    TRADE_DEMOS[tradeSlug] ?? TRADE_DEMOS["construction-electrician"];
  return {
    ...base,
    tradeName,
    tradeCode,
  };
}

export function TranslateFeatureShowcase({
  tradeName,
  tradeCode,
  tradeSlug,
}: TranslateFeatureShowcaseProps) {
  return (
    <AnimatedTranslateDemo
      className="mt-10 sm:mt-10"
      demo={demoForTrade(tradeSlug, tradeName, tradeCode)}
    />
  );
}
