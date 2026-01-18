/**
 * Base Agent Types and Interfaces
 *
 * Core type definitions for the Al-Biruni multi-agent system.
 * All 18 specialized agents extend these base types.
 */

import type { Tool } from '@google/generative-ai';

/**
 * Arabic dialect types supported by the platform
 */
export type ArabicDialect =
  | 'MSA'          // Modern Standard Arabic
  | 'Egyptian'     // Egyptian Arabic (مصري)
  | 'Gulf'         // Gulf Arabic (خليجي)
  | 'Levantine'    // Levantine Arabic (شامي)
  | 'Maghrebi';    // North African Arabic (مغربي)

/**
 * Learning style preferences
 */
export type LearningStyle =
  | 'visual'       // Visual learners
  | 'auditory'     // Auditory learners
  | 'kinesthetic'  // Hands-on learners
  | 'reading';     // Reading/writing learners

/**
 * Gemini model variants
 */
export type GeminiModel =
  | 'flash-lite'   // Fastest, cheapest ($0.10/1M tokens)
  | 'flash'        // Balanced ($0.15/1M tokens)
  | 'pro';         // Most capable ($0.60/1M tokens)

/**
 * Agent capability categories
 */
export type AgentCapability =
  | 'visualization'      // Can generate interactive visualizations
  | 'code_execution'     // Can run code in Sandpack
  | 'question_generation' // Can generate Socratic questions
  | 'assessment'         // Can assess student knowledge
  | 'memory_management'  // Can manage student memory
  | 'research'           // Can search and synthesize information
  | 'language_coaching'  // Can help with language learning
  | 'well_being'         // Can monitor student well-being
  | 'orchestration';     // Can coordinate other agents

/**
 * Agent tier in the hierarchy
 */
export type AgentTier =
  | 'tier0-orchestration'  // Maestro
  | 'tier1-content'        // Content generation agents
  | 'tier2-learning'       // Learning optimization agents
  | 'tier3-support';       // Support and monitoring agents

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Student profile information
 */
export interface StudentProfile {
  userId: string;
  displayName?: string;
  preferredDialect?: ArabicDialect;
  learningStyle?: LearningStyle;
  gradeLevel?: number;
  subjects?: string[];
  timezone?: string;
}

/**
 * Agent execution context
 * Contains all information needed for an agent to process a request
 */
export interface AgentContext {
  // Student information
  userId: string;
  profile?: StudentProfile;

  // Language preferences
  dialect?: ArabicDialect;

  // Conversation state
  conversationHistory: ChatMessage[];
  currentTopic?: string;

  // Knowledge state
  masteryLevels?: Record<string, number>; // KC ID -> mastery (0-1)
  activeKnowledgeComponents?: string[];

  // Session metadata
  sessionId: string;
  timestamp: Date;

  // Additional context
  metadata?: Record<string, unknown>;
}

/**
 * Agent response structure
 */
export interface AgentResponse {
  // Main content
  content: string;

  // Response metadata
  agentId: string;
  agentName: string;
  model: GeminiModel;

  // Token usage and cost
  tokensUsed: {
    input: number;
    output: number;
    cached?: number;
  };
  cost: {
    usd: number;
  };

  // Timing
  durationMs: number;
  timestamp: Date;

  // Agent-specific data
  visualizations?: VisualizationSpec[];
  questions?: SocraticQuestion[];
  assessments?: AssessmentResult[];
  handoff?: AgentHandoff;

  // Self-reflection
  confidence?: number; // 0-1
  uncertainties?: string[];

  // Additional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Visualization specification
 */
export interface VisualizationSpec {
  type: 'code' | 'math' | 'physics' | 'chart' | 'chemistry' | '3d';
  title: string;
  description?: string;
  code?: string; // For Sandpack
  data?: unknown; // For charts, math viz
  config?: Record<string, unknown>;
}

/**
 * Socratic question structure
 */
export interface SocraticQuestion {
  question: string;
  purpose: 'probe' | 'clarify' | 'challenge' | 'redirect';
  expectedInsight?: string;
  hints?: string[];
}

/**
 * Assessment result
 */
export interface AssessmentResult {
  knowledgeComponentId: string;
  masteryEstimate: number; // 0-1
  confidence: number; // 0-1
  evidenceCount: number;
  recommendedNextReview?: Date;
}

/**
 * Agent handoff information
 */
export interface AgentHandoff {
  toAgentId: string;
  reason: string;
  context: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Validation result from self-reflection
 */
export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1
  issues?: string[];
  suggestions?: string[];
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  // Identity
  id: string;
  name: string; // English name
  arabicName: string; // Arabic name
  description: string;
  tier: AgentTier;

  // Model configuration
  defaultModel: GeminiModel;
  allowedModels?: GeminiModel[];

  // Prompts
  systemPrompt: string;
  cachedSystemPrompt?: boolean; // Use context caching

  // Capabilities
  capabilities: AgentCapability[];

  // Tools (for function calling)
  tools?: Tool[];

  // Constraints
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;

  // Rate limiting
  maxRequestsPerMinute?: number;

  // Memory
  conversationMemorySize?: number; // Number of messages to keep

  // Additional settings
  metadata?: Record<string, unknown>;
}

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  // Model override
  model?: GeminiModel;

  // Streaming
  stream?: boolean;
  onChunk?: (chunk: string) => void;

  // Temperature override
  temperature?: number;

  // Max tokens override
  maxTokens?: number;

  // Context caching
  useCache?: boolean;

  // Self-reflection
  enableSelfReflection?: boolean;

  // Memory update
  updateMemory?: boolean;

  // Timeout
  timeoutMs?: number;

  // Additional options
  metadata?: Record<string, unknown>;
}

/**
 * Agent memory entry
 */
export interface AgentMemory {
  userId: string;
  agentId: string;
  key: string;
  value: unknown;
  timestamp: Date;
  expiresAt?: Date;
}

/**
 * Agent metrics for monitoring
 */
export interface AgentMetrics {
  agentId: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatencyMs: number;
  errorRate: number;
  successRate: number;
  lastUpdated: Date;
}

/**
 * Agent error types
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public agentId: string,
    public code: AgentErrorCode,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export enum AgentErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  MODEL_ERROR = 'MODEL_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  CONTEXT_TOO_LARGE = 'CONTEXT_TOO_LARGE',
  TOOL_EXECUTION_FAILED = 'TOOL_EXECUTION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNKNOWN = 'UNKNOWN',
}
