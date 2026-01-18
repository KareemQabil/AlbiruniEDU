/**
 * Base Agent Class
 *
 * Abstract base class for all Al-Biruni agents.
 * Implements core functionality: execution, self-reflection, memory, and metrics.
 */

import { GeminiClient } from '@/lib/gemini/client';
import { ContextCacheManager } from '@/lib/gemini/context-cache';
import { contextManager } from './context';
import {
  calculateCost,
  validateResponse,
  sanitizeInput,
  retryWithBackoff,
  RateLimiter,
  logAgentActivity,
} from './utils';

import type {
  AgentConfig,
  AgentContext,
  AgentResponse,
  AgentExecutionOptions,
  ValidationResult,
  AgentError,
  AgentErrorCode,
  GeminiModel,
  ChatMessage,
} from './types';

/**
 * Abstract base class for all agents
 */
export abstract class Agent {
  protected config: AgentConfig;
  protected gemini: GeminiClient;
  protected cacheManager: ContextCacheManager;
  protected rateLimiter: RateLimiter | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
    this.gemini = new GeminiClient(config.defaultModel);
    this.cacheManager = new ContextCacheManager();

    // Setup rate limiter if configured
    if (config.maxRequestsPerMinute) {
      this.rateLimiter = new RateLimiter(
        config.maxRequestsPerMinute,
        60 * 1000 // 1 minute
      );
    }
  }

  /**
   * Main execution method - must be implemented by each agent
   */
  abstract execute(
    input: string,
    context: AgentContext,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse>;

  /**
   * Execute with full pipeline (sanitization, rate limiting, retry, etc.)
   */
  async executeWithPipeline(
    input: string,
    context: AgentContext,
    options: AgentExecutionOptions = {}
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Log activity
      logAgentActivity(this.config.id, 'execute_start', {
        userId: context.userId,
        inputLength: input.length,
      });

      // 1. Sanitize input
      const sanitizedInput = sanitizeInput(input);

      // 2. Check rate limit
      if (this.rateLimiter) {
        await this.rateLimiter.acquire();
      }

      // 3. Execute with retry
      const response = await retryWithBackoff(
        () => this.execute(sanitizedInput, context, options),
        {
          maxRetries: 2,
          initialDelayMs: 1000,
        }
      );

      // 4. Self-reflection (if enabled)
      if (options.enableSelfReflection !== false) {
        const validation = await this.selfReflect(response);
        if (!validation.isValid) {
          logAgentActivity(this.config.id, 'self_reflection_failed', {
            issues: validation.issues,
          });
        }
        response.confidence = validation.confidence;
        response.uncertainties = validation.issues;
      }

      // 5. Update memory (if enabled)
      if (options.updateMemory !== false) {
        await this.updateMemory(context, response);
      }

      // Log success
      logAgentActivity(this.config.id, 'execute_success', {
        durationMs: Date.now() - startTime,
        tokensUsed: response.tokensUsed.input + response.tokensUsed.output,
        cost: response.cost.usd,
      });

      return response;
    } catch (error) {
      // Log error
      logAgentActivity(this.config.id, 'execute_error', {
        error: (error as Error).message,
        durationMs: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Self-reflection: validate own output
   */
  async selfReflect(response: AgentResponse): Promise<ValidationResult> {
    // Basic validation
    const basicValidation = validateResponse(response);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // Agent-specific validation (can be overridden)
    return await this.customValidation(response);
  }

  /**
   * Custom validation - override in subclasses for agent-specific checks
   */
  protected async customValidation(
    response: AgentResponse
  ): Promise<ValidationResult> {
    // Default: all checks passed
    return {
      isValid: true,
      confidence: 1.0,
    };
  }

  /**
   * Update agent's memory of the student
   */
  async updateMemory(
    context: AgentContext,
    response: AgentResponse
  ): Promise<void> {
    // Store interaction in memory
    await contextManager.storeMemory({
      userId: context.userId,
      agentId: this.config.id,
      key: 'last_interaction',
      value: {
        input: context.conversationHistory[context.conversationHistory.length - 1]?.content,
        output: response.content,
        timestamp: response.timestamp,
        tokensUsed: response.tokensUsed,
      },
      timestamp: new Date(),
    });

    // Agent-specific memory updates (can be overridden)
    await this.customMemoryUpdate(context, response);
  }

  /**
   * Custom memory update - override in subclasses
   */
  protected async customMemoryUpdate(
    context: AgentContext,
    response: AgentResponse
  ): Promise<void> {
    // Default: no custom updates
  }

  /**
   * Generate content using Gemini
   */
  protected async generateContent(
    prompt: string,
    options: {
      model?: GeminiModel;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
    } = {}
  ): Promise<{
    content: string;
    tokensUsed: { input: number; output: number; cached?: number };
    durationMs: number;
  }> {
    const model = options.model || this.config.defaultModel;
    const startTime = Date.now();

    try {
      // Use cached system prompt if enabled
      let systemInstruction = this.config.systemPrompt;
      let cachedTokens = 0;

      if (options.useCache && this.config.cachedSystemPrompt) {
        const cacheKey = `${this.config.id}_system_prompt`;
        try {
          await this.cacheManager.getOrCreateCache(
            cacheKey,
            this.config.systemPrompt,
            { ttlSeconds: 3600 }
          );
          cachedTokens = Math.floor(this.config.systemPrompt.length / 4);
        } catch (error) {
          // Cache failed, use regular prompt
          logAgentActivity(this.config.id, 'cache_error', {
            error: (error as Error).message,
          });
        }
      }

      // Generate content
      const response = await this.gemini.generate(prompt, {
        model,
        systemInstruction,
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? this.config.maxTokens,
      });

      const durationMs = Date.now() - startTime;

      return {
        content: response.content,
        tokensUsed: {
          input: response.tokensUsed.input,
          output: response.tokensUsed.output,
          cached: cachedTokens,
        },
        durationMs,
      };
    } catch (error) {
      throw this.wrapError(error as Error, 'MODEL_ERROR');
    }
  }

  /**
   * Stream content using Gemini
   */
  protected async *streamContent(
    prompt: string,
    options: {
      model?: GeminiModel;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || this.config.defaultModel;

    try {
      const stream = await this.gemini.stream(prompt, {
        model,
        systemInstruction: this.config.systemPrompt,
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? this.config.maxTokens,
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      throw this.wrapError(error as Error, 'MODEL_ERROR');
    }
  }

  /**
   * Build full prompt with context
   */
  protected buildPrompt(input: string, context: AgentContext): string {
    const parts: string[] = [];

    // Add context prefix
    const contextPrefix = contextManager.buildPromptPrefix(context);
    if (contextPrefix) {
      parts.push(contextPrefix);
    }

    // Add conversation history (recent messages only)
    const recentHistory = contextManager.trimHistory(
      context.conversationHistory.slice(0, -1), // Exclude current input
      this.config.conversationMemorySize || 10
    );

    if (recentHistory.length > 0) {
      parts.push('### المحادثة السابقة:');
      parts.push(contextManager.formatHistory(recentHistory));
      parts.push('');
    }

    // Add current input
    parts.push('### السؤال الحالي:');
    parts.push(input);

    return parts.join('\n');
  }

  /**
   * Build agent response
   */
  protected buildResponse(
    content: string,
    tokensUsed: { input: number; output: number; cached?: number },
    durationMs: number,
    model: GeminiModel,
    metadata?: Record<string, unknown>
  ): AgentResponse {
    const cost = calculateCost(
      model,
      tokensUsed.input,
      tokensUsed.output,
      tokensUsed.cached || 0
    );

    return {
      content,
      agentId: this.config.id,
      agentName: this.config.name,
      model,
      tokensUsed,
      cost: { usd: cost },
      durationMs,
      timestamp: new Date(),
      metadata,
    };
  }

  /**
   * Wrap error with agent context
   */
  protected wrapError(error: Error, code: AgentErrorCode): AgentError {
    const agentError = new Error(error.message) as AgentError;
    agentError.name = 'AgentError';
    agentError.agentId = this.config.id;
    agentError.code = code;
    agentError.metadata = { originalError: error };

    return agentError;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * Get agent name (Arabic)
   */
  getArabicName(): string {
    return this.config.arabicName;
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [...this.config.capabilities];
  }

  /**
   * Check if agent has capability
   */
  hasCapability(capability: string): boolean {
    return this.config.capabilities.includes(capability as any);
  }
}

/**
 * Agent registry for managing all agents
 */
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  /**
   * Register an agent
   */
  register(agent: Agent): void {
    this.agents.set(agent.getId(), agent);
    logAgentActivity('registry', 'agent_registered', {
      agentId: agent.getId(),
      agentName: agent.getArabicName(),
    });
  }

  /**
   * Get agent by ID
   */
  get(agentId: string): Agent | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents
   */
  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by capability
   */
  getByCapability(capability: string): Agent[] {
    return this.getAll().filter((agent) => agent.hasCapability(capability));
  }

  /**
   * Get agents by tier
   */
  getByTier(tier: string): Agent[] {
    return this.getAll().filter((agent) => agent.getConfig().tier === tier);
  }

  /**
   * Unregister agent
   */
  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /**
   * Clear all agents
   */
  clear(): void {
    this.agents.clear();
  }

  /**
   * Get agent count
   */
  count(): number {
    return this.agents.size;
  }
}

/**
 * Global agent registry
 */
export const agentRegistry = new AgentRegistry();
