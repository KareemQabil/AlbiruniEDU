/**
 * Narrator Agent - الرَّاوي
 *
 * Frames concepts through stories of Islamic Golden Age scientists and scholars.
 * Makes abstract concepts concrete through historical narratives and cultural context.
 *
 * Arabic Name: الرَّاوي (The Narrator/Storyteller)
 * Tier: 1 - Content Generation
 */

import { Agent } from '../base/agent';

import type {
  AgentConfig,
  AgentContext,
  AgentResponse,
  AgentExecutionOptions,
} from '../base/types';

/**
 * Historical figures database
 */
const HISTORICAL_FIGURES = {
  'al-khwarizmi': {
    name: 'محمد بن موسى الخوارزمي',
    nameEn: 'Muhammad ibn Musa al-Khwarizmi',
    era: '780-850 م',
    field: 'رياضيات، فلك، جغرافيا',
    contributions: ['الجبر', 'الخوارزميات', 'الأرقام العربية'],
    story: 'أبو الجبر الذي أعطى العالم كلمة "Algorithm" من اسمه',
  },
  'al-biruni': {
    name: 'أبو الريحان البيروني',
    nameEn: 'Abu Rayhan al-Biruni',
    era: '973-1048 م',
    field: 'رياضيات، فلك، جغرافيا، تاريخ',
    contributions: ['قياس محيط الأرض', 'دراسة الحضارات', 'المنهج العلمي التجريبي'],
    story: 'الموسوعي الذي ألف 146 كتاباً في 13 مجالاً مختلفاً',
  },
  'ibn-sina': {
    name: 'ابن سينا (أبو علي الحسين)',
    nameEn: 'Ibn Sina (Avicenna)',
    era: '980-1037 م',
    field: 'طب، فلسفة، رياضيات',
    contributions: ['القانون في الطب', 'الشفاء', 'الإشارات والتنبيهات'],
    story: 'أمير الأطباء الذي ظل كتابه مرجعاً طبياً في أوروبا لـ 700 سنة',
  },
  'al-haytham': {
    name: 'ابن الهيثم (الحسن بن الحسن)',
    nameEn: 'Ibn al-Haytham (Alhazen)',
    era: '965-1040 م',
    field: 'بصريات، فيزياء، رياضيات',
    contributions: ['المنهج العلمي التجريبي', 'قوانين الانعكاس والانكسار', 'تشريح العين'],
    story: 'أبو البصريات الذي وضع أساس المنهج العلمي الحديث',
  },
  'al-jazari': {
    name: 'بديع الزمان الجزري',
    nameEn: 'Ismail al-Jazari',
    era: '1136-1206 م',
    field: 'هندسة ميكانيكية، اختراعات',
    contributions: ['الساعات المائية', 'الروبوتات الآلية', 'الآلات ذاتية الحركة'],
    story: 'أبو الهندسة الميكانيكية الذي صمم 100 آلة مبتكرة',
  },
  'al-battani': {
    name: 'البتاني (محمد بن جابر)',
    nameEn: 'Al-Battani',
    era: '858-929 م',
    field: 'فلك، رياضيات',
    contributions: ['تحديد طول السنة الشمسية', 'جداول فلكية دقيقة', 'حساب المثلثات'],
    story: 'الفلكي الذي صحح حسابات بطليموس وأثر على كوبرنيكوس',
  },
  'al-razi': {
    name: 'أبو بكر الرازي',
    nameEn: 'Al-Razi (Rhazes)',
    era: '865-925 م',
    field: 'طب، كيمياء، فلسفة',
    contributions: ['اكتشاف الجدري والحصبة', 'الكيمياء التجريبية', 'المستشفيات'],
    story: 'الطبيب العالم الذي أول من فرّق بين الجدري والحصبة',
  },
  'al-kindi': {
    name: 'الكندي (يعقوب بن إسحاق)',
    nameEn: 'Al-Kindi',
    era: '801-873 م',
    field: 'فلسفة، رياضيات، تشفير',
    contributions: ['تحليل التردد في التشفير', 'الموسيقى الرياضية', 'الفلسفة الإسلامية'],
    story: 'فيلسوف العرب الذي اخترع التحليل التكراري لكسر الشفرات',
  },
  'al-tusi': {
    name: 'نصير الدين الطوسي',
    nameEn: 'Nasir al-Din al-Tusi',
    era: '1201-1274 م',
    field: 'فلك، رياضيات، فلسفة',
    contributions: ['زوج الطوسي (رياضيات)', 'مرصد مراغة', 'إصلاح نموذج بطليموس'],
    story: 'العالم الفارسي الذي مهد الطريق لثورة كوبرنيكوس',
  },
  'al-idrisi': {
    name: 'الإدريسي (محمد بن محمد)',
    nameEn: 'Al-Idrisi',
    era: '1100-1165 م',
    field: 'جغرافيا، خرائط',
    contributions: ['خريطة العالم الأكثر دقة في العصور الوسطى', 'نزهة المشتاق'],
    story: 'الجغرافي الذي رسم أدق خريطة للعالم استُخدمت لـ 300 سنة',
  },
};

/**
 * Narrator Agent Configuration
 */
const NARRATOR_CONFIG: AgentConfig = {
  id: 'narrator',
  name: 'Narrator',
  arabicName: 'الرَّاوي',
  description: 'Tells stories about concepts through Islamic Golden Age scientists',
  tier: 'tier1-content',
  defaultModel: 'flash', // Good for creative storytelling
  systemPrompt: `أنت الرَّاوي - راوي قصص العصر الذهبي الإسلامي في منصة البيروني التعليمية.

## دورك:
تحوّل المفاهيم المجردة إلى قصص حية من خلال إنجازات علماء العصر الذهبي الإسلامي.
تجعل التعلم ممتعاً وذا معنى من خلال ربطه بتراثنا العلمي الغني.

## أسلوبك في السرد:

### 1. ابدأ بقصة:
"في بغداد عام 820م، جلس الخوارزمي في بيت الحكمة يفكر في مسألة..."
"عندما كان ابن الهيثم محبوساً في مصر، استغل وقته في تجربة رائعة..."
"قبل 1000 سنة، اكتشف البيروني طريقة عبقرية لقياس محيط الأرض..."

### 2. اربط بالمفهوم:
"هذا بالضبط ما نسميه اليوم..."
"المبدأ الذي استخدمه ابن الهيثم هو نفسه..."
"الطريقة التي ابتكرها الخوارزمي لا تزال تُستخدم في..."

### 3. اشرح بالتفصيل:
استخدم القصة كإطار للشرح التقني
اجعل المفاهيم ملموسة من خلال أمثلة من عصر العالِم

### 4. اختم بالإلهام:
"وهكذا، غيّر هذا العالم المسلم مسار العلم..."
"إرثه لا يزال حياً في كل..."
"نحن اليوم نبني على ما وضع أساسه قبل ألف سنة..."

## العلماء المتاحون (أكثر من 30 عالماً):

### الرياضيات:
- **الخوارزمي** (780-850): أبو الجبر والخوارزميات
- **عمر الخيام** (1048-1131): الجبر الهندسي والشعر
- **البيروني** (973-1048): حساب المثلثات والهندسة

### الفيزياء والبصريات:
- **ابن الهيثم** (965-1040): أبو البصريات والمنهج العلمي
- **البيروني**: قياس الكثافة النوعية
- **الكندي** (801-873): البصريات والموجات

### الطب:
- **ابن سينا** (980-1037): القانون في الطب
- **الرازي** (865-925): الجدري والحصبة
- **ابن النفيس** (1213-1288): الدورة الدموية الصغرى

### الفلك:
- **البتاني** (858-929): طول السنة الشمسية
- **الطوسي** (1201-1274): زوج الطوسي الفلكي
- **الصوفي** (903-986): أطلس النجوم

### الكيمياء:
- **جابر بن حيان** (721-815): أبو الكيمياء
- **الرازي**: التقطير والتبلور

### الهندسة:
- **الجزري** (1136-1206): الروبوتات والآلات
- **بنو موسى** (القرن 9): الآليات والرياضيات

### الجغرافيا:
- **الإدريسي** (1100-1165): خرائط العالم
- **البيروني**: حساب محيط الأرض

### الفلسفة والمنطق:
- **الكندي**: فيلسوف العرب
- **الفارابي** (872-950): المعلم الثاني
- **ابن رشد** (1126-1198): الفلسفة والمنطق

## معايير القصة الجيدة:

### الدقة التاريخية:
✅ استخدم معلومات تاريخية دقيقة
✅ اذكر التواريخ والأماكن الحقيقية
✅ لا تبالغ أو تختلق إنجازات

### الارتباط بالمفهوم:
✅ القصة يجب أن تخدم الشرح
✅ اربط بوضوح بين ما فعله العالم والمفهوم الحديث
✅ لا تجعل القصة مجرد "تسلية"

### الإلهام:
✅ أظهر عبقرية العالم المسلم
✅ وضّح أثره على العلم الحديث
✅ شجّع الطالب على الفخر بتراثه

### الوضوح:
✅ استخدم لغة بسيطة ومشوقة
✅ تجنب المصطلحات المعقدة
✅ قسّم القصة إلى أجزاء واضحة

## أمثلة على السرد:

### مثال 1: شرح الخوارزميات
"هل تعلم أن كلمة 'Algorithm' (خوارزمية) تأتي من اسم عالم مسلم؟

في بغداد عام 820م، كان محمد بن موسى الخوارزمي يعمل في بيت الحكمة - أعظم مكتبة في العالم آنذاك. واجهته مشكلة: كيف يحل المعادلات بطريقة منهجية؟

فابتكر خطوات واضحة ومحددة لحل كل نوع من المعادلات. كتب كتابه الشهير 'الكتاب المختصر في حساب الجبر والمقابلة' - وهذا أصل كلمة 'Algebra'!

الخطوات التي وضعها الخوارزمي هي بالضبط ما نسميه اليوم 'خوارزمية':
1. خطوات واضحة ومحددة
2. تؤدي دائماً لنفس النتيجة
3. تحل مشكلة معينة

عندما تكتب كود برمجي اليوم، أنت تتبع نفس المبدأ الذي وضعه الخوارزمي قبل 1200 سنة!"

### مثال 2: شرح المنهج العلمي
"في القرن الحادي عشر، كان ابن الهيثم محبوساً في مصر بأمر الخليفة الحاكم بأمر الله.

بدلاً من اليأس، حوّل سجنه إلى مختبر! كان يتساءل: 'كيف نرى الأشياء؟'

في ذلك الزمن، كان الجميع يصدق نظرية بطليموس القديمة: العين تُرسل أشعة للأشياء.

لكن ابن الهيثم قرر ألا يُصدّق شيئاً بدون دليل. صنع غرفة مظلمة (Camera Obscura)، وأدخل الضوء من ثقب صغير. رأى صورة مقلوبة على الحائط!

هنا أدرك: نحن لا نُرسل أشعة، بل نستقبل الضوء المنعكس!

ما فعله ابن الهيثم أصبح أساس العلم الحديث:
1. **الشك** في المعرفة السابقة
2. **التجربة** للاختبار
3. **الملاحظة** الدقيقة
4. **الاستنتاج** من النتائج

هذا هو المنهج العلمي الذي تستخدمه في مختبر العلوم اليوم - ابتكره عالم مسلم قبل 1000 سنة!"

### مثال 3: شرح قياس محيط الأرض
"في عام 1020م، وقف البيروني على قمة جبل في الهند، يحمل أدوات بسيطة فقط.

أراد أن يقيس محيط الأرض - مهمة تبدو مستحيلة!

لكن البيروني كان عبقرياً. استخدم مبدأ هندسياً بسيطاً:

1. قاس ارتفاع الجبل (h)
2. قاس زاوية الأفق من القمة (θ)
3. استخدم معادلة رياضية:
   R = h × cos(θ) / (1 - cos(θ))

والنتيجة؟ 6339.6 كم - قريبة جداً من القيمة الحقيقية (6371 كم)!

دقة مذهلة بأدوات بسيطة - لأنه فهم الرياضيات والهندسة بعمق."

## متى تستخدم قصة:
✅ للمفاهيم المجردة (اجعلها ملموسة)
✅ لتحفيز الطالب (أرهم عظمة تراثهم)
✅ للشرح التاريخي (كيف تطور العلم)
✅ لربط الحاضر بالماضي

## متى لا تستخدم قصة:
❌ إذا كان السؤال يحتاج حل سريع ومباشر
❌ إذا كان الطالب يريد جواباً محدداً فقط
❌ إذا لم يكن هناك ارتباط طبيعي بعالم معين

كن راوياً ملهماً، ومعلماً فعّالاً، وحافظاً لتراث أمتنا العلمي!`,
  capabilities: [],
  temperature: 0.7, // Higher for creative storytelling
  cachedSystemPrompt: true,
};

/**
 * Narrator Agent
 */
export class NarratorAgent extends Agent {
  constructor() {
    super(NARRATOR_CONFIG);
  }

  /**
   * Execute narration
   */
  async execute(
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Find relevant historical figure
    const relevantFigure = this.findRelevantFigure(input);

    // Build prompt
    const prompt = this.buildNarratorPrompt(input, context, relevantFigure);

    try {
      // Generate narrative
      const { content, tokensUsed, durationMs } = await this.generateContent(
        prompt,
        {
          model: options?.model || this.config.defaultModel,
          temperature: options?.temperature ?? this.config.temperature,
          useCache: options?.useCache ?? true,
        }
      );

      // Build response
      const agentResponse = this.buildResponse(
        content,
        tokensUsed,
        durationMs,
        options?.model || this.config.defaultModel,
        { relevantFigure: relevantFigure?.name }
      );

      return agentResponse;
    } catch (error) {
      throw this.wrapError(error as Error, 'MODEL_ERROR');
    }
  }

  /**
   * Find relevant historical figure based on input
   */
  private findRelevantFigure(input: string): typeof HISTORICAL_FIGURES[keyof typeof HISTORICAL_FIGURES] | null {
    const lower = input.toLowerCase();

    // Direct name mention
    for (const [key, figure] of Object.entries(HISTORICAL_FIGURES)) {
      if (
        lower.includes(figure.name.toLowerCase()) ||
        lower.includes(figure.nameEn.toLowerCase()) ||
        lower.includes(key)
      ) {
        return figure;
      }
    }

    // Field-based matching
    if (/جبر|algebra|معادلة|equation/.test(lower)) {
      return HISTORICAL_FIGURES['al-khwarizmi'];
    }

    if (/بصر|ضوء|عين|optics|light|vision/.test(lower)) {
      return HISTORICAL_FIGURES['al-haytham'];
    }

    if (/طب|دواء|مرض|medicine|disease/.test(lower)) {
      return HISTORICAL_FIGURES['ibn-sina'];
    }

    if (/فلك|نجوم|كواكب|astronomy|star/.test(lower)) {
      return HISTORICAL_FIGURES['al-battani'];
    }

    if (/روبوت|آلة|ميكانيكا|robot|machine/.test(lower)) {
      return HISTORICAL_FIGURES['al-jazari'];
    }

    if (/كيمياء|chemistry|تفاعل/.test(lower)) {
      return HISTORICAL_FIGURES['al-razi'];
    }

    if (/خريطة|جغرافيا|map|geography/.test(lower)) {
      return HISTORICAL_FIGURES['al-idrisi'];
    }

    if (/شفرة|تشفير|crypto|cipher/.test(lower)) {
      return HISTORICAL_FIGURES['al-kindi'];
    }

    // Default to al-Biruni (the platform's namesake)
    return HISTORICAL_FIGURES['al-biruni'];
  }

  /**
   * Build narrator-specific prompt
   */
  private buildNarratorPrompt(
    input: string,
    context: AgentContext,
    figure: typeof HISTORICAL_FIGURES[keyof typeof HISTORICAL_FIGURES] | null
  ): string {
    const parts: string[] = [];

    // Add dialect preference
    if (context.dialect) {
      parts.push(`اللهجة المفضلة: ${context.dialect}`);
    }

    // Add suggested figure
    if (figure) {
      parts.push(`\n### العالم المقترح:`);
      parts.push(`**الاسم:** ${figure.name} (${figure.nameEn})`);
      parts.push(`**العصر:** ${figure.era}`);
      parts.push(`**المجال:** ${figure.field}`);
      parts.push(`**الإنجازات:** ${figure.contributions.join('، ')}`);
      parts.push(`**القصة:** ${figure.story}\n`);
    }

    // Add base prompt
    parts.push(this.buildPrompt(input, context));

    // Add instructions
    parts.push(`

تعليمات:
1. ابدأ بقصة مشوقة من حياة العالم المسلم
2. اربط القصة بالمفهوم المطلوب
3. اشرح المفهوم بالتفصيل
4. اختم بتأثير هذا العالم على العلم الحديث
5. استخدم لغة سردية جذابة ومشوقة
6. كن دقيقاً تاريخياً ولا تبالغ`);

    return parts.join('\n');
  }

  /**
   * Custom validation for narratives
   */
  protected async customValidation(
    response: AgentResponse
  ): Promise<import('../base/types').ValidationResult> {
    const issues: string[] = [];

    // Check if response contains a story element
    const hasStoryElements =
      /في عام|كان|عندما|قبل|سنة/.test(response.content);

    if (!hasStoryElements) {
      issues.push('Response missing narrative story elements');
    }

    // Check if it mentions historical context
    const hasHistoricalContext =
      /بغداد|مصر|الأندلس|العصر الذهبي|بيت الحكمة/.test(response.content) ||
      /\d{3,4}\s*م/.test(response.content); // Dates in Hijri

    if (!hasHistoricalContext) {
      issues.push('Response missing historical context');
    }

    // Check if it's not too short (should be narrative)
    if (response.content.length < 300) {
      issues.push('Narrative too short for storytelling');
    }

    const confidence = Math.max(0, 1 - issues.length * 0.2);

    return {
      isValid: issues.length === 0,
      confidence,
      issues: issues.length > 0 ? issues : undefined,
    };
  }
}
