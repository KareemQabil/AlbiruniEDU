/**
 * Problem Decomposer Agent - المُحَلِّل
 *
 * Breaks down complex problems into manageable steps and guides step-by-step solutions.
 * Specializes in mathematical problems, algorithms, and logical reasoning.
 *
 * Arabic Name: المُحَلِّل (The Analyzer/Decomposer)
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
 * Problem step structure
 */
interface ProblemStep {
  stepNumber: number;
  title: string;
  description: string;
  equation?: string;
  reasoning: string;
  result?: string;
}

/**
 * Problem decomposition structure
 */
interface ProblemDecomposition {
  problemType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: ProblemStep[];
  finalAnswer: string;
  verification?: string;
  tips?: string[];
}

/**
 * Problem Decomposer Agent Configuration
 */
const PROBLEM_DECOMPOSER_CONFIG: AgentConfig = {
  id: 'problem-decomposer',
  name: 'Problem Decomposer',
  arabicName: 'المُحَلِّل',
  description: 'Breaks down complex problems into clear, step-by-step solutions',
  tier: 'tier1-content',
  defaultModel: 'pro', // Need powerful model for mathematical reasoning
  systemPrompt: `أنت المُحَلِّل - خبير تحليل المسائل في منصة البيروني التعليمية.

## دورك:
تحلّل المسائل المعقدة إلى خطوات واضحة ومنطقية، وتُرشد الطالب خطوة بخطوة نحو الحل.

## منهجيتك (Polya's Method):

### 1. الفهم (Understand):
- ما المعطيات؟
- ما المطلوب؟
- ما الشروط والقيود؟
- هل المعلومات كافية؟

### 2. التخطيط (Plan):
- ما الاستراتيجية المناسبة؟
- هل رأيت مسألة مشابهة؟
- ما الصيغ أو النظريات المطلوبة؟
- ما الخطوات المتوقعة؟

### 3. التنفيذ (Execute):
- نفذ الخطة خطوة بخطوة
- اشرح كل خطوة بوضوح
- أظهر الحسابات والتحويلات
- تحقق من كل خطوة قبل الانتقال للتالية

### 4. المراجعة (Review):
- هل الحل منطقي؟
- هل يمكن التحقق من الإجابة؟
- هل هناك طريقة أخرى للحل؟
- ما الدروس المستفادة؟

## أنواع المسائل:

### 1. رياضيات:
- جبر (معادلات، متباينات، أنظمة)
- هندسة (مساحات، حجوم، زوايا)
- حساب مثلثات (sin, cos, tan)
- تفاضل وتكامل
- احتمالات وإحصاء

### 2. فيزياء:
- حركة (سرعة، تسارع، قوة)
- طاقة (كامنة، حركية)
- كهرباء ومغناطيسية
- بصريات
- ميكانيكا الكم

### 3. كيمياء:
- موازنة معادلات
- حسابات المولات
- تركيز المحاليل
- معادلات الغاز

### 4. برمجة:
- خوارزميات
- هياكل بيانات
- تحليل التعقيد الزمني
- تصحيح الأخطاء

### 5. منطق:
- استدلال
- براهين
- حل الألغاز

## معايير الجودة:

### الوضوح:
✅ كل خطوة واضحة ومبررة
✅ استخدم لغة بسيطة
✅ أظهر كل الحسابات الوسيطة
✅ لا تقفز خطوات

### الدقة:
✅ تحقق من الحسابات
✅ استخدم الوحدات الصحيحة
✅ انتبه للإشارات (+/-)
✅ تحقق من المنطق

### التعليمية:
✅ اشرح "لماذا" وليس فقط "كيف"
✅ اربط بمفاهيم سابقة
✅ أضف رسوم توضيحية إن أمكن
✅ قدم نصائح لتجنب الأخطاء الشائعة

## صيغة الخطوات:

### الخطوة N: [العنوان]
**ماذا نفعل:** [وصف الخطوة]
**لماذا:** [التبرير]
**الحسابات:**
\`\`\`
[المعادلات والحسابات]
\`\`\`
**النتيجة:** [نتيجة الخطوة]

---

## أمثلة:

### مثال 1: حل معادلة تربيعية
**المسألة:** حل x² - 5x + 6 = 0

#### الخطوة 1: تحديد نوع المعادلة
- معادلة تربيعية من الدرجة الثانية
- الصيغة العامة: ax² + bx + c = 0
- هنا: a=1, b=-5, c=6

#### الخطوة 2: اختيار طريقة الحل
- يمكن التحليل (أبسط)
- يمكن القانون العام (أشمل)
- سنستخدم التحليل

#### الخطوة 3: التحليل إلى عاملين
- نبحث عن عددين حاصل ضربهما = 6
- ومجموعهما = -5
- العددان: -2 و -3
- التحليل: (x - 2)(x - 3) = 0

#### الخطوة 4: إيجاد الحلول
- x - 2 = 0  →  x = 2
- x - 3 = 0  →  x = 3

#### الخطوة 5: التحقق
- x=2: (2)² - 5(2) + 6 = 4 - 10 + 6 = 0 ✓
- x=3: (3)² - 5(3) + 6 = 9 - 15 + 6 = 0 ✓

**الحل النهائي:** x = 2 أو x = 3

---

### مثال 2: مسألة فيزياء (سقوط حر)
**المسألة:** حجر سقط من ارتفاع 80م. احسب:
1. الزمن حتى يصل الأرض
2. سرعته عند الوصول

**المعطيات:**
- الارتفاع (h) = 80 m
- السرعة الابتدائية (v₀) = 0
- تسارع الجاذبية (g) = 10 m/s²

#### الخطوة 1: إيجاد الزمن
**المعادلة:** h = v₀t + ½gt²
**التعويض:** 80 = 0 + ½(10)t²
**الحل:**
- 80 = 5t²
- t² = 16
- t = 4 seconds

#### الخطوة 2: إيجاد السرعة النهائية
**المعادلة:** v = v₀ + gt
**التعويض:** v = 0 + (10)(4)
**النتيجة:** v = 40 m/s

**التحقق باستخدام:** v² = v₀² + 2gh
- v² = 0 + 2(10)(80)
- v² = 1600
- v = 40 m/s ✓

---

## التعامل مع الأخطاء:

إذا كان الطالب مخطئاً:
1. لا تقل "خطأ" مباشرة
2. اسأل: "هل يمكنك التحقق من هذه الخطوة؟"
3. وجّهه للخطأ بلطف
4. اشرح الفكرة الصحيحة
5. شجّعه على المحاولة مرة أخرى

## متى تتوقف:
- إذا كانت المسألة تحتاج تصوير → handoff to visualizer
- إذا كان الطالب يحتاج أسئلة سقراطية → handoff to socratic
- إذا كانت المسألة خارج نطاقك → handoff to maestro

استجب دائماً بخطوات واضحة ومنظمة.`,
  capabilities: [],
  temperature: 0.3, // Low temperature for accuracy
  maxTokens: 4000, // Allow for detailed solutions
  cachedSystemPrompt: true,
};

/**
 * Problem Decomposer Agent
 */
export class ProblemDecomposerAgent extends Agent {
  constructor() {
    super(PROBLEM_DECOMPOSER_CONFIG);
  }

  /**
   * Execute problem decomposition
   */
  async execute(
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Detect problem type
    const problemType = this.detectProblemType(input);

    // Build prompt
    const prompt = this.buildDecomposerPrompt(input, context, problemType);

    try {
      // Generate step-by-step solution
      const { content, tokensUsed, durationMs } = await this.generateContent(
        prompt,
        {
          model: options?.model || this.config.defaultModel,
          temperature: options?.temperature ?? this.config.temperature,
          maxTokens: options?.maxTokens ?? this.config.maxTokens,
          useCache: options?.useCache ?? true,
        }
      );

      // Parse steps from response
      const decomposition = this.parseDecomposition(content);

      // Build response
      const agentResponse = this.buildResponse(
        content,
        tokensUsed,
        durationMs,
        options?.model || this.config.defaultModel,
        { problemType, decomposition }
      );

      return agentResponse;
    } catch (error) {
      throw this.wrapError(error as Error, 'MODEL_ERROR');
    }
  }

  /**
   * Detect problem type
   */
  private detectProblemType(input: string): string {
    const lower = input.toLowerCase();

    // Mathematics
    if (/معادلة|equation|solve|حل/.test(lower)) {
      if (/تربيعية|quadratic|x²/.test(lower)) return 'معادلة تربيعية';
      if (/خطية|linear/.test(lower)) return 'معادلة خطية';
      if (/تفاضل|derivative/.test(lower)) return 'تفاضل';
      if (/تكامل|integral/.test(lower)) return 'تكامل';
      return 'معادلة رياضية';
    }

    // Geometry
    if (/مساحة|area|حجم|volume|محيط|perimeter/.test(lower)) {
      return 'هندسة';
    }

    // Physics
    if (/سرعة|velocity|تسارع|acceleration|قوة|force|طاقة|energy/.test(lower)) {
      return 'فيزياء';
    }

    // Chemistry
    if (/معادلة كيميائية|تفاعل|مول|mole|تركيز|concentration/.test(lower)) {
      return 'كيمياء';
    }

    // Programming
    if (/خوارزمية|algorithm|كود|code|برنامج|function/.test(lower)) {
      return 'برمجة';
    }

    // Logic/Reasoning
    if (/برهان|proof|استدلال|reasoning/.test(lower)) {
      return 'منطق';
    }

    return 'مسألة عامة';
  }

  /**
   * Build decomposer-specific prompt
   */
  private buildDecomposerPrompt(
    input: string,
    context: AgentContext,
    problemType: string
  ): string {
    const parts: string[] = [];

    // Add problem type
    parts.push(`نوع المسألة: ${problemType}`);

    // Add dialect preference
    if (context.dialect) {
      parts.push(`اللهجة المفضلة: ${context.dialect}`);
    }

    // Add base prompt
    parts.push(this.buildPrompt(input, context));

    // Add specific instructions
    parts.push(`

تعليمات:
1. ابدأ بفهم المسألة: ما المعطيات؟ ما المطلوب؟
2. حدد الاستراتيجية والصيغ المطلوبة
3. حلّل المسألة إلى خطوات واضحة
4. اشرح كل خطوة بالتفصيل مع الحسابات
5. تحقق من الحل النهائي
6. قدم نصائح لتجنب الأخطاء الشائعة

استخدم الصيغة:
**الخطوة N: [العنوان]**
[شرح الخطوة]
[الحسابات]
[النتيجة]`);

    return parts.join('\n');
  }

  /**
   * Parse problem decomposition from response
   */
  private parseDecomposition(content: string): ProblemDecomposition {
    const steps: ProblemStep[] = [];

    // Extract steps using regex
    const stepRegex = /\*\*الخطوة (\d+):(.*?)\*\*/g;
    let match;
    let stepNumber = 1;

    while ((match = stepRegex.exec(content)) !== null) {
      const title = match[2].trim();

      steps.push({
        stepNumber,
        title,
        description: '', // Would extract from content in production
        reasoning: '',
        equation: undefined,
        result: undefined,
      });

      stepNumber++;
    }

    // Extract final answer
    const finalAnswerMatch = content.match(/الحل النهائي:(.+?)(?:\n|$)/);
    const finalAnswer = finalAnswerMatch ? finalAnswerMatch[1].trim() : '';

    return {
      problemType: 'general',
      difficulty: steps.length > 5 ? 'hard' : steps.length > 3 ? 'medium' : 'easy',
      steps,
      finalAnswer,
    };
  }

  /**
   * Custom validation for problem solutions
   */
  protected async customValidation(
    response: AgentResponse
  ): Promise<import('../base/types').ValidationResult> {
    const issues: string[] = [];

    // Check if response has steps
    if (!response.content.includes('الخطوة')) {
      issues.push('Solution missing step-by-step breakdown');
    }

    // Check if there's a final answer
    if (!response.content.includes('الحل') && !response.content.includes('الجواب')) {
      issues.push('Solution missing final answer');
    }

    // Check for mathematical notation
    const hasMath = /\d+|[+\-*/=()]/.test(response.content);
    if (!hasMath && response.metadata?.problemType?.includes('رياضية')) {
      issues.push('Mathematical problem missing calculations');
    }

    const confidence = Math.max(0, 1 - issues.length * 0.2);

    return {
      isValid: issues.length === 0,
      confidence,
      issues: issues.length > 0 ? issues : undefined,
    };
  }
}
