/**
 * Gemini Function Calling Utilities
 *
 * Helper functions for tool/function calling with Gemini
 */

import type { FunctionDeclaration, Tool } from '@google/generative-ai';
import { z } from 'zod';

/**
 * Convert Zod schema to Gemini function parameters
 */
export function zodToGeminiSchema(schema: z.ZodObject<any>): any {
  const shape = schema._def.shape();
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    const zodType = value as z.ZodTypeAny;

    if (!zodType.isOptional()) {
      required.push(key);
    }

    properties[key] = zodTypeToJsonSchema(zodType);
  }

  return {
    type: 'object',
    properties,
    required,
  };
}

function zodTypeToJsonSchema(zodType: z.ZodTypeAny): any {
  const def = zodType._def;

  // Handle optional
  if (zodType instanceof z.ZodOptional) {
    return zodTypeToJsonSchema(zodType.unwrap());
  }

  // Handle string
  if (zodType instanceof z.ZodString) {
    const schema: any = { type: 'string' };
    if (def.checks) {
      for (const check of def.checks) {
        if (check.kind === 'email') schema.format = 'email';
        if (check.kind === 'url') schema.format = 'uri';
      }
    }
    return schema;
  }

  // Handle number
  if (zodType instanceof z.ZodNumber) {
    return { type: 'number' };
  }

  // Handle boolean
  if (zodType instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  // Handle array
  if (zodType instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodTypeToJsonSchema(zodType.element),
    };
  }

  // Handle enum
  if (zodType instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: zodType.options,
    };
  }

  // Handle object
  if (zodType instanceof z.ZodObject) {
    return zodToGeminiSchema(zodType);
  }

  // Default
  return { type: 'string' };
}

/**
 * Create a function declaration from a Zod schema
 */
export function createFunctionDeclaration(
  name: string,
  description: string,
  paramsSchema: z.ZodObject<any>
): FunctionDeclaration {
  return {
    name,
    description,
    parameters: zodToGeminiSchema(paramsSchema),
  };
}

/**
 * Common function declarations for Al-Biruni agents
 */

// Hand off to another agent
export const handoffToAgentFunction = createFunctionDeclaration(
  'handoff_to_agent',
  'Transfer the conversation to another specialized agent when their expertise is needed',
  z.object({
    agent_id: z.enum([
      'visualizer',
      'narrator',
      'problem_decomposer',
      'simulator',
      'socratic',
      'spaced_repetition',
      'adaptive_assessor',
      'cognitive_mirror',
      'memory_architect',
      'context_weaver',
      'research_companion',
      'language_coach',
      'engagement_monitor',
      'wellbeing',
    ]),
    reason: z.string(),
    context: z.object({}).passthrough().optional(),
  })
);

// Generate visualization
export const generateVisualizationFunction = createFunctionDeclaration(
  'generate_visualization',
  'Create an interactive React component to visualize a concept',
  z.object({
    concept: z.string(),
    visualization_type: z.enum([
      'graph',
      'animation',
      '3d_model',
      'diagram',
      'simulation',
      'chart',
    ]),
    description: z.string(),
    code_language: z.enum(['jsx', 'tsx']).default('tsx'),
  })
);

// Ask Socratic question
export const askSocraticQuestionFunction = createFunctionDeclaration(
  'ask_socratic_question',
  'Ask guiding questions to help student discover the answer themselves',
  z.object({
    questions: z.array(z.string()).min(1).max(5),
    hints: z.array(z.string()).optional(),
    follow_up_based_on: z
      .enum(['correct', 'incorrect', 'partial'])
      .optional(),
  })
);

// Create flashcard
export const createFlashcardFunction = createFunctionDeclaration(
  'create_flashcard',
  'Generate a flashcard for spaced repetition learning',
  z.object({
    front: z.string(),
    back: z.string(),
    hints: z.array(z.string()).optional(),
    kc_id: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  })
);

// Search knowledge base
export const searchKnowledgeBaseFunction = createFunctionDeclaration(
  'search_knowledge_base',
  'Search the knowledge base for relevant information',
  z.object({
    query: z.string(),
    subject: z.string().optional(),
    limit: z.number().min(1).max(20).default(5),
  })
);

// Detect student emotion
export const detectEmotionFunction = createFunctionDeclaration(
  'detect_emotion',
  'Analyze student emotion/stress level from their message',
  z.object({
    message: z.string(),
    context: z.object({}).passthrough().optional(),
  })
);

// Update student mastery
export const updateMasteryFunction = createFunctionDeclaration(
  'update_student_mastery',
  'Update student mastery level for a knowledge component based on performance',
  z.object({
    kc_id: z.string(),
    correct: z.boolean(),
    time_taken_seconds: z.number().optional(),
    confidence: z.enum(['low', 'medium', 'high']).optional(),
  })
);

/**
 * Common tool sets for different agent types
 */
export const AGENT_TOOLS: Record<string, Tool> = {
  maestro: {
    functionDeclarations: [
      handoffToAgentFunction,
      searchKnowledgeBaseFunction,
    ],
  },
  visualizer: {
    functionDeclarations: [generateVisualizationFunction],
  },
  socratic: {
    functionDeclarations: [
      askSocraticQuestionFunction,
      handoffToAgentFunction,
    ],
  },
  spaced_repetition: {
    functionDeclarations: [createFlashcardFunction, updateMasteryFunction],
  },
  wellbeing: {
    functionDeclarations: [detectEmotionFunction, handoffToAgentFunction],
  },
};

/**
 * Parse function call from Gemini response
 */
export function parseFunctionCall(response: any): {
  name: string;
  args: any;
} | null {
  try {
    const functionCall = response.functionCalls?.[0];
    if (!functionCall) return null;

    return {
      name: functionCall.name,
      args: functionCall.args,
    };
  } catch {
    return null;
  }
}

/**
 * Execute a function call
 */
export type FunctionImplementation = (args: any) => Promise<any>;

export async function executeFunctionCall(
  functionName: string,
  args: any,
  implementations: Record<string, FunctionImplementation>
): Promise<any> {
  const implementation = implementations[functionName];

  if (!implementation) {
    throw new Error(`Function ${functionName} not implemented`);
  }

  try {
    return await implementation(args);
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Format function result for Gemini
 */
export function formatFunctionResult(
  functionName: string,
  result: any
): any {
  return {
    functionResponse: {
      name: functionName,
      response: result,
    },
  };
}
