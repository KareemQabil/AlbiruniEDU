/**
 * Maestro Agent - The Orchestrator
 *
 * The conductor of the Al-Biruni multi-agent symphony.
 * Analyzes queries, selects agents, and coordinates multi-agent workflows.
 *
 * Arabic Name: المايسترو (Al-Maestro)
 * Tier: 0 - Orchestration
 */

import { Agent, agentRegistry } from '../base/agent';
import { contextManager } from '../base/context';
import { estimateTokens, generateId, logAgentActivity } from '../base/utils';
import { AGENT_TOOLS } from '@/lib/gemini/function-calling';

import type {
  AgentConfig,
  AgentContext,
  AgentResponse,
  AgentExecutionOptions,
  AgentHandoff,
  ChatMessage,
  GeminiModel,
} from '../base/types';

/**
 * Intent categories for user queries
 */
export enum QueryIntent {
  EXPLAIN = 'explain',           // Wants concept explanation
  VISUALIZE = 'visualize',        // Wants visualization
  PRACTICE = 'practice',          // Wants practice problems
  SOLVE = 'solve',                // Wants step-by-step solution
  RESEARCH = 'research',          // Wants to research a topic
  ASSESS = 'assess',              // Wants knowledge assessment
  REVIEW = 'review',              // Wants to review material
  CREATE = 'create',              // Wants to create something
  DEBUG = 'debug',                // Wants help debugging code
  TRANSLATE = 'translate',        // Language help
  WELLBEING = 'wellbeing',        // Emotional/wellbeing support
  GENERAL = 'general',            // General conversation
}

/**
 * Agent selection result
 */
interface AgentSelection {
  agentIds: string[];
  reasoning: string;
  confidence: number;
  strategy: 'single' | 'sequential' | 'parallel';
}

/**
 * Complexity analysis result
 */
interface ComplexityAnalysis {
  score: number; // 0-1
  factors: {
    queryLength: number;
    technicalDepth: number;
    multipleTopics: boolean;
    requiresVisualization: boolean;
    requiresComputation: boolean;
  };
}

/**
 * Maestro Agent Configuration
 */
const MAESTRO_CONFIG: AgentConfig = {
  id: 'maestro',
  name: 'Maestro',
  arabicName: 'المايسترو',
  description: 'Orchestrates multi-agent workflows and routes queries to specialized agents',
  tier: 'tier0-orchestration',
  defaultModel: 'flash', // Fast routing decisions
  systemPrompt: `أنت المايسترو - منسق الوكلاء الذكي في منصة البيروني التعليمية.

## دورك:
أنت المنسق الرئيسي الذي يحلل استفسارات الطلاب ويختار الوكلاء المتخصصين المناسبين للإجابة.

## الوكلاء المتاحون:

### المستوى 1 - إنشاء المحتوى:
1. **المُصَوِّر** (visualizer) - ينشئ تصويرات تفاعلية وأكواد برمجية
2. **الرَّاوي** (narrator) - يروي المفاهيم من خلال قصص علماء العصر الذهبي الإسلامي
3. **المُحَلِّل** (problem-decomposer) - يحلل المسائل المعقدة إلى خطوات
4. **المُحَاكِي** (simulator) - يُنشئ محاكاة فيزيائية تفاعلية

### المستوى 2 - تحسين التعلم:
5. **السُّقْراطي** (socratic) - يطرح أسئلة سقراطية لتوجيه التفكير
6. **المُكَرِّر** (spaced-repetition) - يدير المراجعة المتباعدة
7. **المُقَيِّم** (adaptive-assessor) - يقيم المعرفة بشكل تكيفي
8. **المِرْآة** (cognitive-mirror) - يعكس أنماط تفكير الطالب

### المستوى 3 - الدعم:
9. **الباحث** (research-companion) - يساعد في البحث وتركيب المعلومات
10. **مُدَرِّب اللغة** (language-coach) - يساعد في تعلم اللغات
11. **المُراقِب** (engagement-monitor) - يراقب مستوى التفاعل
12. **الرفيق** (wellbeing) - يدعم الصحة النفسية والعاطفية

## مهمتك:
1. حلل نية السؤال (شرح، تصوير، حل مسألة، إلخ)
2. قيّم التعقيد (بسيط، متوسط، معقد)
3. اختر الوكيل أو الوكلاء المناسبين
4. قرر الاستراتيجية (وكيل واحد، تسلسلي، متوازي)

## قواعد الاختيار:
- لأسئلة الشرح البسيطة: الرَّاوي أو السُّقْراطي
- للتصويرات والرسوم: المُصَوِّر
- للمسائل المعقدة: المُحَلِّل + وكيل آخر
- للمحاكاة الفيزيائية: المُحَاكِي
- للبحث المُعمق: الباحث
- للدعم العاطفي: الرفيق

استخدم function calling لاختيار الوكلاء.`,
  capabilities: ['orchestration'],
  tools: [AGENT_TOOLS.maestro],
  temperature: 0.3, // Low temperature for consistent routing
  cachedSystemPrompt: true,
};

/**
 * Maestro Orchestration Agent
 */
export class MaestroAgent extends Agent {
  constructor() {
    super(MAESTRO_CONFIG);
  }

  /**
   * Execute orchestration
   */
  async execute(
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // 1. Analyze complexity
      const complexity = this.analyzeComplexity(input, context);
      logAgentActivity(this.config.id, 'complexity_analyzed', {
        score: complexity.score,
        factors: complexity.factors,
      });

      // 2. Detect intent
      const intent = this.detectIntent(input);
      logAgentActivity(this.config.id, 'intent_detected', { intent });

      // 3. Select agent(s)
      const selection = await this.selectAgents(input, context, complexity, intent);
      logAgentActivity(this.config.id, 'agents_selected', {
        agentIds: selection.agentIds,
        strategy: selection.strategy,
        confidence: selection.confidence,
      });

      // 4. Execute strategy
      let result: AgentResponse;

      if (selection.strategy === 'single') {
        result = await this.executeSingleAgent(
          selection.agentIds[0],
          input,
          context,
          options
        );
      } else if (selection.strategy === 'sequential') {
        result = await this.executeSequential(
          selection.agentIds,
          input,
          context,
          options
        );
      } else {
        result = await this.executeParallel(
          selection.agentIds,
          input,
          context,
          options
        );
      }

      // 5. Add orchestration metadata
      const durationMs = Date.now() - startTime;
      result.metadata = {
        ...result.metadata,
        orchestration: {
          complexity: complexity.score,
          intent,
          selectedAgents: selection.agentIds,
          strategy: selection.strategy,
          reasoning: selection.reasoning,
          totalDurationMs: durationMs,
        },
      };

      return result;
    } catch (error) {
      throw this.wrapError(error as Error, 'UNKNOWN');
    }
  }

  /**
   * Analyze query complexity
   */
  private analyzeComplexity(input: string, context: AgentContext): ComplexityAnalysis {
    const factors = {
      queryLength: 0,
      technicalDepth: 0,
      multipleTopics: false,
      requiresVisualization: false,
      requiresComputation: false,
    };

    // Query length
    const wordCount = input.split(/\s+/).length;
    factors.queryLength = Math.min(wordCount / 100, 1);

    // Technical depth
    const technicalTerms = [
      'معادلة', 'نظرية', 'برهان', 'تفاضل', 'تكامل',
      'خوارزمية', 'برمجة', 'فيزياء', 'كيمياء', 'دالة',
      'مصفوفة', 'احتمال', 'إحصاء', 'هندسة', 'جبر',
    ];
    const technicalCount = technicalTerms.filter(term => input.includes(term)).length;
    factors.technicalDepth = Math.min(technicalCount / 5, 1);

    // Multiple topics (has "و" connecting different subjects)
    factors.multipleTopics = (input.match(/و|أيضا|كذلك/g) || []).length > 2;

    // Requires visualization
    const vizKeywords = ['ارسم', 'صور', 'وضح', 'اعرض', 'رسم', 'شكل', 'مخطط', 'جدول'];
    factors.requiresVisualization = vizKeywords.some(kw => input.includes(kw));

    // Requires computation
    const computeKeywords = ['احسب', 'اوجد', 'حل', 'قيمة', 'نتيجة'];
    factors.requiresComputation = computeKeywords.some(kw => input.includes(kw));

    // Calculate overall score
    let score = 0.3; // Base score

    score += factors.queryLength * 0.2;
    score += factors.technicalDepth * 0.3;
    if (factors.multipleTopics) score += 0.15;
    if (factors.requiresVisualization) score += 0.1;
    if (factors.requiresComputation) score += 0.1;

    // Conversation depth
    if (context.conversationHistory.length > 10) score += 0.1;

    return {
      score: Math.min(1, score),
      factors,
    };
  }

  /**
   * Detect user intent
   */
  private detectIntent(input: string): QueryIntent {
    const lowerInput = input.toLowerCase();

    // Visualization
    if (/ارسم|صور|وضح|اعرض|رسم|شكل|مخطط/.test(lowerInput)) {
      return QueryIntent.VISUALIZE;
    }

    // Practice
    if (/تمرين|تدرب|مارس|سؤال|امتحان/.test(lowerInput)) {
      return QueryIntent.PRACTICE;
    }

    // Problem solving
    if (/احسب|اوجد|حل|المسألة|المعادلة/.test(lowerInput)) {
      return QueryIntent.SOLVE;
    }

    // Explanation
    if (/ما هو|ما هي|اشرح|وضح|فسر|ماذا/.test(lowerInput)) {
      return QueryIntent.EXPLAIN;
    }

    // Research
    if (/ابحث|معلومات|بحث|دراسة|تاريخ/.test(lowerInput)) {
      return QueryIntent.RESEARCH;
    }

    // Review
    if (/راجع|مراجعة|استعد|تكرار/.test(lowerInput)) {
      return QueryIntent.REVIEW;
    }

    // Assessment
    if (/اختبر|تقييم|قيم|مستوى/.test(lowerInput)) {
      return QueryIntent.ASSESS;
    }

    // Debug
    if (/خطأ|bug|error|مشكلة في الكود/.test(lowerInput)) {
      return QueryIntent.DEBUG;
    }

    // Wellbeing
    if (/متعب|قلق|صعب|محبط|مساعدة نفسية/.test(lowerInput)) {
      return QueryIntent.WELLBEING;
    }

    return QueryIntent.GENERAL;
  }

  /**
   * Select appropriate agents using LLM
   */
  private async selectAgents(
    input: string,
    context: AgentContext,
    complexity: ComplexityAnalysis,
    intent: QueryIntent
  ): Promise<AgentSelection> {
    // Build selection prompt
    const prompt = `حلل السؤال التالي واختر الوكلاء المناسبين:

السؤال: ${input}

التعقيد: ${(complexity.score * 100).toFixed(0)}%
النية: ${intent}

اختر الوكيل أو الوكلاء المناسبين واستخدم function calling.`;

    try {
      // Use Gemini to select agents
      const response = await this.gemini.generateWithFunctionCalling(
        prompt,
        {
          model: 'flash',
          systemInstruction: this.config.systemPrompt,
          tools: this.config.tools,
        }
      );

      // Parse function call
      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'handoff_to_agent') {
          return {
            agentIds: [call.args.agent_id as string],
            reasoning: call.args.reason as string,
            confidence: 0.9,
            strategy: 'single',
          };
        }
      }

      // Fallback: rule-based selection
      return this.fallbackSelection(intent, complexity);
    } catch (error) {
      logAgentActivity(this.config.id, 'selection_error', {
        error: (error as Error).message,
      });

      // Fallback to rule-based
      return this.fallbackSelection(intent, complexity);
    }
  }

  /**
   * Fallback rule-based agent selection
   */
  private fallbackSelection(
    intent: QueryIntent,
    complexity: ComplexityAnalysis
  ): AgentSelection {
    let agentIds: string[] = [];
    let reasoning = '';
    let strategy: 'single' | 'sequential' | 'parallel' = 'single';

    switch (intent) {
      case QueryIntent.VISUALIZE:
        agentIds = ['visualizer'];
        reasoning = 'السؤال يحتاج إلى تصوير بصري';
        break;

      case QueryIntent.SOLVE:
        if (complexity.score > 0.6) {
          agentIds = ['problem-decomposer', 'visualizer'];
          reasoning = 'مسألة معقدة تحتاج تحليل وتصوير';
          strategy = 'sequential';
        } else {
          agentIds = ['problem-decomposer'];
          reasoning = 'مسألة بسيطة تحتاج حل خطوة بخطوة';
        }
        break;

      case QueryIntent.EXPLAIN:
        if (complexity.factors.requiresVisualization) {
          agentIds = ['narrator', 'visualizer'];
          reasoning = 'شرح مع تصوير بصري';
          strategy = 'sequential';
        } else {
          agentIds = ['narrator'];
          reasoning = 'شرح مفاهيمي';
        }
        break;

      case QueryIntent.PRACTICE:
        agentIds = ['socratic'];
        reasoning = 'تمرين مع إرشاد سقراطي';
        break;

      case QueryIntent.RESEARCH:
        agentIds = ['research-companion'];
        reasoning = 'بحث وتركيب معلومات';
        break;

      case QueryIntent.REVIEW:
        agentIds = ['spaced-repetition'];
        reasoning = 'مراجعة متباعدة';
        break;

      case QueryIntent.ASSESS:
        agentIds = ['adaptive-assessor'];
        reasoning = 'تقييم تكيفي';
        break;

      case QueryIntent.WELLBEING:
        agentIds = ['wellbeing'];
        reasoning = 'دعم نفسي وعاطفي';
        break;

      default:
        agentIds = ['narrator'];
        reasoning = 'محادثة عامة';
    }

    return {
      agentIds,
      reasoning,
      confidence: 0.7,
      strategy,
    };
  }

  /**
   * Execute single agent
   */
  private async executeSingleAgent(
    agentId: string,
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const agent = agentRegistry.get(agentId);

    if (!agent) {
      // Agent not registered yet, return maestro's own response
      return this.handleMissingAgent(agentId, input, context);
    }

    return await agent.executeWithPipeline(input, context, options);
  }

  /**
   * Execute agents sequentially
   */
  private async executeSequential(
    agentIds: string[],
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    let currentContext = context;
    let combinedContent = '';
    let totalTokens = { input: 0, output: 0 };
    let totalCost = 0;

    for (const agentId of agentIds) {
      const agent = agentRegistry.get(agentId);
      if (!agent) continue;

      const response = await agent.executeWithPipeline(
        input,
        currentContext,
        options
      );

      combinedContent += response.content + '\n\n';
      totalTokens.input += response.tokensUsed.input;
      totalTokens.output += response.tokensUsed.output;
      totalCost += response.cost.usd;

      // Update context with response
      currentContext = contextManager.updateContext(
        currentContext,
        response.content,
        agentId
      );
    }

    return this.buildResponse(
      combinedContent.trim(),
      totalTokens,
      Date.now(),
      'flash',
      { strategy: 'sequential', agents: agentIds }
    );
  }

  /**
   * Execute agents in parallel
   */
  private async executeParallel(
    agentIds: string[],
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const promises = agentIds.map(async (agentId) => {
      const agent = agentRegistry.get(agentId);
      if (!agent) return null;

      return await agent.executeWithPipeline(input, context, options);
    });

    const responses = (await Promise.all(promises)).filter(
      (r): r is AgentResponse => r !== null
    );

    // Combine responses
    const combinedContent = responses.map((r) => r.content).join('\n\n---\n\n');
    const totalTokens = responses.reduce(
      (acc, r) => ({
        input: acc.input + r.tokensUsed.input,
        output: acc.output + r.tokensUsed.output,
      }),
      { input: 0, output: 0 }
    );
    const totalCost = responses.reduce((acc, r) => acc + r.cost.usd, 0);

    return this.buildResponse(
      combinedContent,
      totalTokens,
      Date.now(),
      'flash',
      { strategy: 'parallel', agents: agentIds }
    );
  }

  /**
   * Handle missing agent (not yet implemented)
   */
  private async handleMissingAgent(
    agentId: string,
    input: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    const prompt = this.buildPrompt(input, context);

    const { content, tokensUsed, durationMs } = await this.generateContent(
      prompt,
      { useCache: true }
    );

    return this.buildResponse(
      `[تنبيه: الوكيل "${agentId}" غير متوفر حالياً. إليك إجابة عامة]\n\n${content}`,
      tokensUsed,
      durationMs,
      this.config.defaultModel,
      { missingAgent: agentId }
    );
  }
}
