/**
 * Gemini Type Definitions
 */

import type { GeminiModel } from './client';

/**
 * Agent message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

/**
 * Agent context for generating responses
 */
export interface AgentContext {
  userId: string;
  dialect?: 'MSA' | 'Egyptian' | 'Gulf' | 'Levantine' | 'Maghrebi';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'mixed';
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
  currentTopic?: string;
  recentKCs?: string[]; // Recently studied knowledge components
  conversationHistory?: ChatMessage[];
  metadata?: Record<string, any>;
}

/**
 * Agent response
 */
export interface AgentResponse {
  content: string;
  model: GeminiModel;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    usd: number;
  };
  duration: {
    ms: number;
  };
  metadata?: {
    functionCalls?: Array<{
      name: string;
      args: any;
    }>;
    selfReflection?: {
      confidence: number;
      reasoning: string;
    };
    handoff?: {
      toAgent: string;
      reason: string;
    };
  };
}

/**
 * Complexity estimation result
 */
export interface ComplexityEstimate {
  score: number; // 0-1
  model: GeminiModel; // Recommended model
  reasoning: string;
  indicators: {
    simple: string[];
    complex: string[];
  };
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  cached?: number; // Cached tokens (25% cost)
}

/**
 * Cost breakdown
 */
export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cachedCost?: number;
  totalCost: number;
  currency: 'USD';
}

/**
 * Model performance metrics
 */
export interface ModelMetrics {
  model: GeminiModel;
  avgLatencyMs: number;
  avgTokensInput: number;
  avgTokensOutput: number;
  avgCostUsd: number;
  requestCount: number;
  errorRate: number;
}

/**
 * Streaming chunk
 */
export interface StreamChunk {
  type: 'token' | 'metadata' | 'error' | 'done';
  content?: string;
  metadata?: {
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
    durationMs?: number;
  };
  error?: string;
}

/**
 * Function call result
 */
export interface FunctionCallResult {
  name: string;
  args: any;
  result: any;
  error?: string;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  model: GeminiModel;
  systemPrompt: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  tools?: any[]; // Function declarations
  cachingEnabled?: boolean;
  cacheTTL?: number;
}

/**
 * Orchestration decision
 */
export interface OrchestrationDecision {
  selectedAgent: string;
  reason: string;
  confidence: number;
  fallbackAgents?: string[];
}
