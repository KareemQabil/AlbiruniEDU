/**
 * Agent Utility Functions
 *
 * Helper functions for agent operations, validation, and common tasks.
 */

import type {
  AgentResponse,
  ValidationResult,
  AgentMetrics,
  GeminiModel,
  ChatMessage,
  AgentContext,
} from './types';

/**
 * Cost per 1M tokens (USD)
 */
const MODEL_COSTS: Record<GeminiModel, { input: number; output: number; cached: number }> = {
  'flash-lite': { input: 0.075, output: 0.30, cached: 0.01875 },
  'flash': { input: 0.075, output: 0.30, cached: 0.01875 },
  'pro': { input: 1.25, output: 5.00, cached: 0.3125 },
};

/**
 * Calculate cost based on token usage
 */
export function calculateCost(
  model: GeminiModel,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  const costs = MODEL_COSTS[model];

  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  const cachedCost = (cachedTokens / 1_000_000) * costs.cached;

  return inputCost + outputCost + cachedCost;
}

/**
 * Estimate token count for text (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Arabic: ~4 characters per token
  // English: ~4 characters per token
  // This is a rough estimate
  return Math.ceil(text.length / 4);
}

/**
 * Validate agent response structure
 */
export function validateResponse(response: AgentResponse): ValidationResult {
  const issues: string[] = [];

  // Check required fields
  if (!response.content || response.content.trim().length === 0) {
    issues.push('Response content is empty');
  }

  if (!response.agentId) {
    issues.push('Missing agent ID');
  }

  if (!response.model) {
    issues.push('Missing model information');
  }

  // Check token usage
  if (!response.tokensUsed || response.tokensUsed.input < 0 || response.tokensUsed.output < 0) {
    issues.push('Invalid token usage data');
  }

  // Check cost
  if (!response.cost || response.cost.usd < 0) {
    issues.push('Invalid cost data');
  }

  // Check timing
  if (!response.durationMs || response.durationMs < 0) {
    issues.push('Invalid duration');
  }

  // Calculate confidence
  const confidence = issues.length === 0 ? 1.0 : Math.max(0, 1 - issues.length * 0.2);

  return {
    isValid: issues.length === 0,
    confidence,
    issues: issues.length > 0 ? issues : undefined,
  };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  // Remove potential injection attempts
  let sanitized = input.trim();

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Limit length
  const MAX_LENGTH = 4000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
}

/**
 * Extract code blocks from text
 */
export function extractCodeBlocks(text: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }

  return blocks;
}

/**
 * Extract equations from text
 */
export function extractEquations(text: string): Array<{ inline: boolean; equation: string }> {
  const equations: Array<{ inline: boolean; equation: string }> = [];

  // Block equations: $$...$$
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    equations.push({
      inline: false,
      equation: match[1].trim(),
    });
  }

  // Inline equations: $...$
  const inlineRegex = /\$([^$]+)\$/g;
  while ((match = inlineRegex.exec(text)) !== null) {
    // Skip if it's part of a block equation
    if (!text.substring(match.index - 1, match.index).includes('$')) {
      equations.push({
        inline: true,
        equation: match[1].trim(),
      });
    }
  }

  return equations;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Format cost in human-readable format
 */
export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${(usd * 1000).toFixed(3)}k`; // Show in thousandths
  if (usd < 1) return `$${(usd * 100).toFixed(2)}c`; // Show in cents
  return `$${usd.toFixed(2)}`;
}

/**
 * Format token count with K/M suffixes
 */
export function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1_000_000).toFixed(2)}M`;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffFactor = 2,
  } = options;

  let lastError: Error | null = null;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * backoffFactor, maxDelayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Rate limiter
 */
export class RateLimiter {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async acquire(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);

    // Check if we're at the limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitMs = this.windowMs - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return this.acquire(); // Retry
    }

    // Record this request
    this.requests.push(now);
  }

  reset(): void {
    this.requests = [];
  }
}

/**
 * Merge conversation histories
 */
export function mergeConversations(
  ...histories: ChatMessage[][]
): ChatMessage[] {
  const allMessages = histories.flat();

  // Sort by timestamp
  allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Remove duplicates (same content and timestamp)
  const unique: ChatMessage[] = [];
  const seen = new Set<string>();

  for (const msg of allMessages) {
    const key = `${msg.timestamp.getTime()}_${msg.content}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(msg);
    }
  }

  return unique;
}

/**
 * Calculate metrics from agent responses
 */
export function calculateMetrics(
  responses: AgentResponse[]
): AgentMetrics {
  if (responses.length === 0) {
    return {
      agentId: 'unknown',
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatencyMs: 0,
      errorRate: 0,
      successRate: 0,
      lastUpdated: new Date(),
    };
  }

  const agentId = responses[0].agentId;
  const totalRequests = responses.length;
  const totalTokens = responses.reduce(
    (sum, r) => sum + r.tokensUsed.input + r.tokensUsed.output,
    0
  );
  const totalCost = responses.reduce((sum, r) => sum + r.cost.usd, 0);
  const averageLatencyMs =
    responses.reduce((sum, r) => sum + r.durationMs, 0) / totalRequests;

  // For now, assume all succeeded (would track failures in production)
  const successRate = 1.0;
  const errorRate = 0.0;

  return {
    agentId,
    totalRequests,
    totalTokens,
    totalCost,
    averageLatencyMs,
    errorRate,
    successRate,
    lastUpdated: new Date(),
  };
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep for specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if text is primarily Arabic
 */
export function isArabicText(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF]/;
  const arabicChars = (text.match(new RegExp(arabicRegex, 'g')) || []).length;
  const totalChars = text.replace(/\s/g, '').length;

  return totalChars > 0 && arabicChars / totalChars > 0.5;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Parse JSON safely
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Build error message with context
 */
export function buildErrorMessage(
  error: Error,
  context: AgentContext
): string {
  return `Error in agent execution:
Agent: ${context.metadata?.agentId || 'unknown'}
User: ${context.userId}
Session: ${context.sessionId}
Error: ${error.message}
Stack: ${error.stack || 'N/A'}`;
}

/**
 * Log agent activity (production would use proper logging service)
 */
export function logAgentActivity(
  agentId: string,
  action: string,
  metadata?: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    agentId,
    action,
    metadata,
  };

  // In production, send to logging service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Agent Activity]', logEntry);
  }
}
