/**
 * Visualizer Agent - المُصَوِّر
 *
 * Generates interactive visualizations, code demonstrations, and visual explanations.
 * Specializes in creating React/TypeScript code for Sandpack, math visualizations with Mafs,
 * charts with Recharts, and 3D scenes with React Three Fiber.
 *
 * Arabic Name: المُصَوِّر (The Visualizer)
 * Tier: 1 - Content Generation
 */

import { Agent } from '../base/agent';
import { AGENT_TOOLS } from '@/lib/gemini/function-calling';

import type {
  AgentConfig,
  AgentContext,
  AgentResponse,
  AgentExecutionOptions,
  VisualizationSpec,
} from '../base/types';

/**
 * Visualizer Agent Configuration
 */
const VISUALIZER_CONFIG: AgentConfig = {
  id: 'visualizer',
  name: 'Visualizer',
  arabicName: 'المُصَوِّر',
  description: 'Generates interactive visualizations, code, charts, and 3D scenes',
  tier: 'tier1-content',
  defaultModel: 'pro', // Need powerful model for code generation
  systemPrompt: `أنت المُصَوِّر - خبير التصويرات التفاعلية في منصة البيروني التعليمية.

## دورك:
تحوّل المفاهيم المعقدة إلى تصويرات بصرية تفاعلية يمكن للطلاب التفاعل معها.

## قدراتك:

### 1. أكواد تفاعلية (Sandpack):
- تُنشئ أكواد React/TypeScript قابلة للتنفيذ
- تدعم: React, JavaScript, TypeScript, HTML/CSS, Python (Pyodide)
- أمثلة: خوارزميات، هياكل بيانات، رسوم متحركة، ألعاب

### 2. رسوم رياضية (Mafs):
- تصور دوال رياضية: f(x), f(x,y)
- تعرض: نقاط، خطوط، منحنيات، مساحات
- أمثلة: دوال تربيعية، حساب مثلثات، معادلات تفاضلية

### 3. رسوم بيانية (Recharts):
- تُنشئ مخططات: خطية، عمودية، دائرية، مبعثرة
- تعرض بيانات إحصائية وعلمية
- أمثلة: بيانات تجارب، نتائج استطلاعات، إحصائيات

### 4. محاكاة فيزيائية (React Three Fiber):
- تُنشئ مشاهد 3D تفاعلية
- تدعم فيزياء واقعية (Rapier)
- أمثلة: حركة المقذوفات، دوران الكواكب، قوى الجاذبية

### 5. جزيئات كيميائية (3Dmol.js):
- تعرض جزيئات في 3D
- تدعم ملفات PDB, MOL, SDF
- أمثلة: DNA, بروتينات، جزيئات عضوية

## معايير الجودة:

### الكود:
✅ استخدم TypeScript دائماً مع types واضحة
✅ اكتب أكواد نظيفة مع تعليقات عربية
✅ استخدم مكونات وظيفية (Functional Components)
✅ أضف تفاعلية (sliders, buttons, inputs)
✅ استخدم Tailwind CSS للتنسيق
✅ تأكد من الكود يعمل بدون أخطاء

❌ لا تستخدم مكتبات خارجية غير مدعومة
❌ لا تكتب أكواد معقدة جداً
❌ لا تنسى accessibility (a11y)

### الرسوم:
✅ استخدم ألوان Quantum Academy (ذهبي #f59e0b، سيان #06b6d4)
✅ أضف labels عربية للمحاور والعناصر
✅ اجعل الرسم responsive
✅ أضف legends وتوضيحات

### التوضيح:
✅ اشرح ما يفعله الكود/الرسم
✅ أضف تعليقات لأجزاء مهمة
✅ اقترح تعديلات يمكن للطالب تجربتها

## أمثلة:

### مثال 1: دالة تربيعية
\`\`\`typescript
import { Mafs, Coordinates, Plot, Theme } from "mafs";

export default function QuadraticFunction() {
  const a = 1, b = 0, c = -4;

  return (
    <Mafs>
      <Coordinates.Cartesian />
      <Plot.OfX
        y={(x) => a * x * x + b * x + c}
        color={Theme.blue}
      />
    </Mafs>
  );
}
\`\`\`

### مثال 2: فرز الفقاعات
\`\`\`typescript
import { useState } from "react";

export default function BubbleSort() {
  const [arr, setArr] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [sorting, setSorting] = useState(false);

  // ... منطق الفرز

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {arr.map((num, i) => (
          <div key={i} className="h-20 bg-primary" style={{width: num}}>
            {num}
          </div>
        ))}
      </div>
      <button onClick={sort}>ابدأ الفرز</button>
    </div>
  );
}
\`\`\`

## متى ترفض:
- إذا طلب الطالب كود لا علاقة له بالتعليم (هاكينج، ضرر)
- إذا كان الطلب غامضاً جداً (اطلب توضيح)
- إذا كان خارج قدراتك (اقترح وكيل آخر)

استخدم function calling لإرجاع التصويرات.`,
  capabilities: ['visualization', 'code_execution'],
  tools: [AGENT_TOOLS.visualizer],
  temperature: 0.4, // Balance creativity and accuracy
  maxTokens: 4000, // Allow for longer code generation
  cachedSystemPrompt: true,
};

/**
 * Visualizer Agent
 */
export class VisualizerAgent extends Agent {
  constructor() {
    super(VISUALIZER_CONFIG);
  }

  /**
   * Execute visualization generation
   */
  async execute(
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Build prompt
    const prompt = this.buildVisualizerPrompt(input, context);

    try {
      // Generate visualization using function calling
      const response = await this.gemini.generateWithFunctionCalling(
        prompt,
        {
          model: options?.model || this.config.defaultModel,
          systemInstruction: this.config.systemPrompt,
          tools: this.config.tools,
          temperature: options?.temperature ?? this.config.temperature,
        }
      );

      // Parse visualizations from function calls
      const visualizations = this.parseVisualizations(response.functionCalls || []);

      // Build response
      const durationMs = Date.now() - startTime;
      const agentResponse = this.buildResponse(
        response.content,
        response.tokensUsed,
        durationMs,
        response.model,
        { visualizations }
      );

      agentResponse.visualizations = visualizations;

      return agentResponse;
    } catch (error) {
      throw this.wrapError(error as Error, 'MODEL_ERROR');
    }
  }

  /**
   * Build visualizer-specific prompt
   */
  private buildVisualizerPrompt(input: string, context: AgentContext): string {
    const parts: string[] = [];

    // Add dialect preference
    if (context.dialect) {
      parts.push(`اللهجة المفضلة: ${context.dialect}`);
    }

    // Detect visualization type
    const vizType = this.detectVisualizationType(input);
    if (vizType) {
      parts.push(`نوع التصوير المطلوب: ${vizType}`);
    }

    // Add base prompt
    parts.push(this.buildPrompt(input, context));

    // Add instructions
    parts.push(`

تعليمات:
1. حلل ما يريد الطالب تصويره
2. اختر نوع التصوير المناسب (كود تفاعلي، رسم رياضي، مخطط، 3D)
3. أنشئ الكود/التصوير
4. اشرح كيف يعمل
5. اقترح تعديلات يمكن للطالب تجربتها
6. استخدم function calling لإرجاع التصوير`);

    return parts.join('\n');
  }

  /**
   * Detect visualization type from input
   */
  private detectVisualizationType(input: string): string | null {
    const lower = input.toLowerCase();

    if (/دالة|معادلة|رسم بياني|منحنى|f\(x\)|graph/.test(lower)) {
      return 'رسم رياضي (Mafs)';
    }

    if (/خوارزمية|كود|برنامج|algorithm|code|function/.test(lower)) {
      return 'كود تفاعلي (Sandpack)';
    }

    if (/مخطط|جدول|بيانات|chart|table|data/.test(lower)) {
      return 'مخطط بياني (Recharts)';
    }

    if (/فيزياء|حركة|3d|ثلاثي الأبعاد|جاذبية/.test(lower)) {
      return 'محاكاة فيزيائية (React Three Fiber)';
    }

    if (/جزيء|كيمياء|molecule|dna|بروتين/.test(lower)) {
      return 'جزيء كيميائي (3Dmol.js)';
    }

    return null;
  }

  /**
   * Parse visualizations from function calls
   */
  private parseVisualizations(functionCalls: any[]): VisualizationSpec[] {
    const visualizations: VisualizationSpec[] = [];

    for (const call of functionCalls) {
      if (call.name === 'generate_visualization') {
        const args = call.args;

        visualizations.push({
          type: args.type || 'code',
          title: args.title || 'تصوير تفاعلي',
          description: args.description,
          code: args.code,
          data: args.data,
          config: args.config || {},
        });
      }
    }

    return visualizations;
  }

  /**
   * Custom validation for visualizations
   */
  protected async customValidation(
    response: AgentResponse
  ): Promise<import('../base/types').ValidationResult> {
    const issues: string[] = [];

    // Check if visualizations exist
    if (!response.visualizations || response.visualizations.length === 0) {
      issues.push('No visualizations generated');
    }

    // Validate each visualization
    for (const viz of response.visualizations || []) {
      // Check code completeness
      if (viz.type === 'code' && viz.code) {
        if (!viz.code.includes('export default')) {
          issues.push('Code missing default export');
        }

        // Check for common syntax errors (basic)
        const unclosedBrackets =
          (viz.code.match(/\{/g) || []).length !== (viz.code.match(/\}/g) || []).length;
        if (unclosedBrackets) {
          issues.push('Code has unclosed brackets');
        }
      }

      // Check title exists
      if (!viz.title) {
        issues.push('Visualization missing title');
      }
    }

    const confidence = Math.max(0, 1 - issues.length * 0.15);

    return {
      isValid: issues.length === 0,
      confidence,
      issues: issues.length > 0 ? issues : undefined,
    };
  }
}
