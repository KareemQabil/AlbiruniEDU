/**
 * Socratic Guide Agent - السُّقْراطي
 *
 * Guides learning through Socratic questioning rather than direct answers.
 * Helps students discover knowledge through guided inquiry and critical thinking.
 *
 * Arabic Name: السُّقْراطي (The Socratic Guide)
 * Tier: 2 - Learning Optimization
 */

import { Agent } from '../base/agent';
import { AGENT_TOOLS } from '@/lib/gemini/function-calling';

import type {
  AgentConfig,
  AgentContext,
  AgentResponse,
  AgentExecutionOptions,
  SocraticQuestion,
} from '../base/types';

/**
 * Socratic Guide Agent Configuration
 */
const SOCRATIC_CONFIG: AgentConfig = {
  id: 'socratic',
  name: 'Socratic Guide',
  arabicName: 'السُّقْراطي',
  description: 'Guides learning through Socratic questioning and critical thinking',
  tier: 'tier2-learning',
  defaultModel: 'flash', // Fast enough for question generation
  systemPrompt: `أنت السُّقْراطي - المرشد الفلسفي في منصة البيروني التعليمية.

## فلسفتك:
أنت لا تُعطي إجابات مباشرة. بل تطرح أسئلة تُوجّه الطالب لاكتشاف الإجابة بنفسه.
كما قال سقراط: "أنا لا أعلّم أحداً شيئاً، بل أساعده على تعلّمه بنفسه."

## دورك:
توجيه الطلاب من خلال أسئلة متدرجة تُحفّز التفكير النقدي والاستكشاف الذاتي.

## أنواع الأسئلة السقراطية:

### 1. أسئلة التوضيح (Clarifying):
- "ماذا تقصد بـ...؟"
- "هل يمكنك أن تشرح ذلك بطريقة أخرى؟"
- "ما المثال الذي يمكن أن تعطيه؟"

### 2. أسئلة التحقيق (Probing):
- "لماذا تعتقد ذلك؟"
- "ما الدليل على هذا؟"
- "كيف توصلت لهذا الاستنتاج؟"

### 3. أسئلة الافتراضات (Assumptions):
- "ما الافتراضات التي بُنيت عليها هذه الفكرة؟"
- "هل هذا صحيح دائماً؟"
- "ماذا لو كان العكس؟"

### 4. أسئلة وجهات النظر (Perspectives):
- "ما وجهات النظر الأخرى؟"
- "كيف سينظر شخص آخر لهذا؟"
- "ما البديل؟"

### 5. أسئلة التضمينات (Implications):
- "ماذا سيحدث لو...؟"
- "ما النتائج المترتبة على ذلك؟"
- "إلى أين يقودنا هذا التفكير؟"

### 6. أسئلة ما وراء المعرفة (Metacognitive):
- "كيف وصلت لهذه الفكرة؟"
- "ما العقبات في تفكيرك؟"
- "هل أنت واثق من إجابتك؟ لماذا؟"

## منهجية التوجيه:

### المرحلة 1: الاستكشاف الأولي
- اطرح سؤالاً مفتوحاً عن فهم الطالب الحالي
- "ما الذي تعرفه عن...؟"
- "كيف تفسر...؟"

### المرحلة 2: التعمق
- اطرح أسئلة تُحفز التفكير الأعمق
- "لماذا يحدث ذلك؟"
- "ما العلاقة بين... و...؟"

### المرحلة 3: التحدي اللطيف
- قدم سيناريوهات تُتحدى فهمهم
- "ماذا لو...؟"
- "هل ينطبق ذلك على...؟"

### المرحلة 4: التوليف
- ساعد الطالب على ربط الأفكار
- "كيف يرتبط هذا بما تعلمته سابقاً؟"
- "ما الاستنتاج العام؟"

## قواعد ذهبية:

✅ DO:
- كن صبوراً ومشجعاً
- اطرح سؤالاً واحداً في المرة (لا تُغرق الطالب)
- قدّم تلميحات إذا كان الطالب عالقاً
- احتفِ بالأفكار الجيدة: "فكرة ممتازة! الآن فكر في..."
- استخدم أمثلة من الحياة اليومية
- تدرّج من البسيط للمعقد

❌ DON'T:
- لا تُعطي الإجابة مباشرة
- لا تكن محبطاً أو سلبياً
- لا تطرح أسئلة معقدة جداً في البداية
- لا تفترض معرفة مسبقة
- لا تستخدم مصطلحات تقنية دون شرح

## التعامل مع المستويات:

### طالب مبتدئ:
- ابدأ بأسئلة بسيطة جداً
- قدم تلميحات أكثر
- استخدم أمثلة ملموسة
- شجع كثيراً

### طالب متوسط:
- أسئلة أعمق قليلاً
- اربط بمعرفة سابقة
- شجع التفكير النقدي

### طالب متقدم:
- أسئلة فلسفية وتحليلية
- تحديات معقدة
- تشجيع على الاستكشاف المستقل

## أمثلة:

### مثال 1: شرح الجاذبية
طالب: "ما هي الجاذبية؟"

❌ إجابة سيئة: "الجاذبية هي قوة تجذب الأجسام نحو بعضها..."

✅ إجابة سقراطية:
"سؤال رائع! دعني أسألك:
- لماذا تسقط الأشياء للأسفل عندما تُفلتها؟
- هل تسقط كل الأشياء بنفس السرعة؟
- ماذا لو لم تكن هناك أرض تحتك؟"

### مثال 2: حل معادلة
طالب: "كيف أحل 2x + 5 = 15؟"

❌ إجابة سيئة: "اطرح 5 من الطرفين ثم اقسم على 2..."

✅ إجابة سقراطية:
"ممتاز! لديك معادلة. دعني أسألك:
- ما الذي نريد إيجاده؟ (x)
- ما الذي يمنعنا من رؤية x وحدها؟ (+5، و×2)
- كيف نتخلص من +5؟ (فكر في العملية العكسية)"

## متى تُعطي إجابة جزئية:
- إذا كان الطالب محبطاً جداً (أعطِ تلميحاً قوياً)
- إذا وصل لـ 80% من الإجابة (ساعده على إكمال الـ 20%)
- إذا طلب صراحة التحقق من إجابته (أكد أو صحح بلطف)

استخدم function calling لإرجاع الأسئلة السقراطية.`,
  capabilities: ['question_generation'],
  tools: [AGENT_TOOLS.socratic],
  temperature: 0.6, // Allow for creative questioning
  conversationMemorySize: 15, // Remember more context for guided inquiry
  cachedSystemPrompt: true,
};

/**
 * Socratic Guide Agent
 */
export class SocraticAgent extends Agent {
  constructor() {
    super(SOCRATIC_CONFIG);
  }

  /**
   * Execute Socratic guidance
   */
  async execute(
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Determine student level
    const studentLevel = this.determineStudentLevel(context);

    // Build prompt
    const prompt = this.buildSocraticPrompt(input, context, studentLevel);

    try {
      // Generate Socratic questions using function calling
      const response = await this.gemini.generateWithFunctionCalling(
        prompt,
        {
          model: options?.model || this.config.defaultModel,
          systemInstruction: this.config.systemPrompt,
          tools: this.config.tools,
          temperature: options?.temperature ?? this.config.temperature,
        }
      );

      // Parse questions from function calls
      const questions = this.parseQuestions(response.functionCalls || []);

      // Build response
      const durationMs = Date.now() - startTime;
      const agentResponse = this.buildResponse(
        response.content,
        response.tokensUsed,
        durationMs,
        response.model,
        { questions, studentLevel }
      );

      agentResponse.questions = questions;

      return agentResponse;
    } catch (error) {
      throw this.wrapError(error as Error, 'MODEL_ERROR');
    }
  }

  /**
   * Determine student level from context
   */
  private determineStudentLevel(context: AgentContext): 'beginner' | 'intermediate' | 'advanced' {
    // Check conversation history length
    const historyLength = context.conversationHistory.length;

    if (historyLength < 3) {
      return 'beginner'; // New to topic
    }

    // Check mastery levels if available
    if (context.masteryLevels) {
      const avgMastery =
        Object.values(context.masteryLevels).reduce((a, b) => a + b, 0) /
        Object.keys(context.masteryLevels).length;

      if (avgMastery > 0.7) return 'advanced';
      if (avgMastery > 0.4) return 'intermediate';
      return 'beginner';
    }

    // Check profile
    if (context.profile?.gradeLevel) {
      if (context.profile.gradeLevel >= 10) return 'advanced';
      if (context.profile.gradeLevel >= 7) return 'intermediate';
      return 'beginner';
    }

    return 'intermediate'; // Default
  }

  /**
   * Build Socratic prompt
   */
  private buildSocraticPrompt(
    input: string,
    context: AgentContext,
    studentLevel: string
  ): string {
    const parts: string[] = [];

    // Add student level
    parts.push(`مستوى الطالب: ${studentLevel}`);

    // Add dialect preference
    if (context.dialect) {
      parts.push(`اللهجة المفضلة: ${context.dialect}`);
    }

    // Detect question type
    const questionType = this.detectQuestionType(input);
    if (questionType) {
      parts.push(`نوع السؤال: ${questionType}`);
    }

    // Add base prompt
    parts.push(this.buildPrompt(input, context));

    // Add specific instructions
    parts.push(`

تعليمات:
1. لا تعطِ الإجابة مباشرة
2. اطرح 2-3 أسئلة سقراطية متدرجة
3. ابدأ بسؤال بسيط، ثم تعمق
4. شجع الطالب وكن إيجابياً
5. قدم تلميحات إذا لزم الأمر
6. استخدم function calling لإرجاع الأسئلة`);

    return parts.join('\n');
  }

  /**
   * Detect question type for appropriate response
   */
  private detectQuestionType(input: string): string | null {
    const lower = input.toLowerCase();

    if (/ما هو|ما هي|ماذا/.test(lower)) {
      return 'تعريف/شرح';
    }

    if (/لماذا|كيف/.test(lower)) {
      return 'سببي/آلية';
    }

    if (/احسب|أوجد|حل/.test(lower)) {
      return 'حسابي/حل مسألة';
    }

    if (/اشرح|وضح|فسر/.test(lower)) {
      return 'توضيح';
    }

    return null;
  }

  /**
   * Parse Socratic questions from function calls
   */
  private parseQuestions(functionCalls: any[]): SocraticQuestion[] {
    const questions: SocraticQuestion[] = [];

    for (const call of functionCalls) {
      if (call.name === 'ask_socratic_question') {
        const args = call.args;

        questions.push({
          question: args.question,
          purpose: args.purpose || 'probe',
          expectedInsight: args.expected_insight,
          hints: args.hints || [],
        });
      }
    }

    return questions;
  }

  /**
   * Custom validation for Socratic responses
   */
  protected async customValidation(
    response: AgentResponse
  ): Promise<import('../base/types').ValidationResult> {
    const issues: string[] = [];

    // Check if questions exist
    if (!response.questions || response.questions.length === 0) {
      issues.push('No Socratic questions generated');
    }

    // Check if response gave direct answer (should not)
    const directAnswerPatterns = [
      /الإجابة هي/,
      /النتيجة هي/,
      /الحل هو/,
      /^الجواب:/,
    ];

    if (directAnswerPatterns.some((pattern) => pattern.test(response.content))) {
      issues.push('Response contains direct answer (violates Socratic principle)');
    }

    // Check if questions are actually questions
    for (const q of response.questions || []) {
      if (!q.question.includes('؟')) {
        issues.push('Question missing question mark (؟)');
      }

      if (q.question.length < 10) {
        issues.push('Question too short');
      }
    }

    const confidence = Math.max(0, 1 - issues.length * 0.2);

    return {
      isValid: issues.length === 0,
      confidence,
      issues: issues.length > 0 ? issues : undefined,
    };
  }
}
