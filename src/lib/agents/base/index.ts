/**
 * Agent Base Infrastructure
 *
 * Exports all base agent classes, types, and utilities.
 */

// Main agent class
export { Agent, AgentRegistry, agentRegistry } from './agent';

// Context management
export { ContextManager, contextManager } from './context';

// Utility functions
export {
  calculateCost,
  estimateTokens,
  validateResponse,
  sanitizeInput,
  extractCodeBlocks,
  extractEquations,
  formatDuration,
  formatCost,
  formatTokens,
  retryWithBackoff,
  RateLimiter,
  mergeConversations,
  calculateMetrics,
  generateId,
  sleep,
  isArabicText,
  truncate,
  safeJSONParse,
  buildErrorMessage,
  logAgentActivity,
} from './utils';

// Types
export type {
  // Core types
  ArabicDialect,
  LearningStyle,
  GeminiModel,
  AgentCapability,
  AgentTier,

  // Message and context
  ChatMessage,
  StudentProfile,
  AgentContext,
  AgentResponse,

  // Visualizations and content
  VisualizationSpec,
  SocraticQuestion,
  AssessmentResult,
  AgentHandoff,

  // Configuration
  AgentConfig,
  AgentExecutionOptions,

  // Memory and metrics
  AgentMemory,
  AgentMetrics,

  // Validation
  ValidationResult,
} from './types';

export { AgentError, AgentErrorCode } from './types';
