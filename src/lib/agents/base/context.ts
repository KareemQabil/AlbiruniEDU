/**
 * Agent Context Management
 *
 * Utilities for managing agent execution context, conversation history,
 * and student state during agent interactions.
 */

import type {
  AgentContext,
  ChatMessage,
  StudentProfile,
  AgentMemory,
  ArabicDialect,
} from './types';

/**
 * Context manager for agent execution
 */
export class ContextManager {
  private memoryStore: Map<string, AgentMemory[]> = new Map();

  /**
   * Build agent context from request
   */
  buildContext(params: {
    userId: string;
    input: string;
    profile?: StudentProfile;
    conversationHistory?: ChatMessage[];
    sessionId?: string;
    metadata?: Record<string, unknown>;
  }): AgentContext {
    const {
      userId,
      input,
      profile,
      conversationHistory = [],
      sessionId = this.generateSessionId(),
      metadata = {},
    } = params;

    // Add current user input to history
    const currentMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    return {
      userId,
      profile,
      dialect: profile?.preferredDialect,
      conversationHistory: [...conversationHistory, currentMessage],
      sessionId,
      timestamp: new Date(),
      metadata,
    };
  }

  /**
   * Update context with agent response
   */
  updateContext(
    context: AgentContext,
    agentResponse: string,
    agentId: string
  ): AgentContext {
    const agentMessage: ChatMessage = {
      role: 'agent',
      content: agentResponse,
      timestamp: new Date(),
      agentId,
    };

    return {
      ...context,
      conversationHistory: [...context.conversationHistory, agentMessage],
      timestamp: new Date(),
    };
  }

  /**
   * Trim conversation history to fit context window
   */
  trimHistory(
    conversationHistory: ChatMessage[],
    maxMessages: number = 20
  ): ChatMessage[] {
    if (conversationHistory.length <= maxMessages) {
      return conversationHistory;
    }

    // Always keep system messages and recent messages
    const systemMessages = conversationHistory.filter(
      (msg) => msg.role === 'system'
    );
    const recentMessages = conversationHistory.slice(-maxMessages);

    // Combine, ensuring system messages come first
    return [...systemMessages, ...recentMessages];
  }

  /**
   * Format conversation history for prompt
   */
  formatHistory(
    conversationHistory: ChatMessage[],
    includeTimestamps: boolean = false
  ): string {
    return conversationHistory
      .map((msg) => {
        const timestamp = includeTimestamps
          ? `[${msg.timestamp.toISOString()}] `
          : '';
        const role =
          msg.role === 'user'
            ? 'الطالب'
            : msg.role === 'agent'
              ? msg.agentId || 'الوكيل'
              : 'النظام';
        return `${timestamp}${role}: ${msg.content}`;
      })
      .join('\n\n');
  }

  /**
   * Extract recent topics from conversation
   */
  extractTopics(conversationHistory: ChatMessage[]): string[] {
    // Simple keyword extraction
    // In production, this would use NLP
    const recentMessages = conversationHistory.slice(-5);
    const topics = new Set<string>();

    for (const msg of recentMessages) {
      // Extract keywords (simplified - would use proper NLP)
      const words = msg.content.split(/\s+/);
      for (const word of words) {
        if (word.length > 4) {
          topics.add(word);
        }
      }
    }

    return Array.from(topics).slice(0, 10);
  }

  /**
   * Store agent memory
   */
  async storeMemory(memory: AgentMemory): Promise<void> {
    const key = `${memory.userId}:${memory.agentId}`;
    const memories = this.memoryStore.get(key) || [];

    // Add new memory
    memories.push(memory);

    // Remove expired memories
    const now = new Date();
    const validMemories = memories.filter(
      (m) => !m.expiresAt || m.expiresAt > now
    );

    this.memoryStore.set(key, validMemories);

    // In production, persist to database
    // await supabase.from('agent_memories').insert(memory);
  }

  /**
   * Retrieve agent memory
   */
  async getMemory(
    userId: string,
    agentId: string,
    key?: string
  ): Promise<AgentMemory[]> {
    const memoryKey = `${userId}:${agentId}`;
    const memories = this.memoryStore.get(memoryKey) || [];

    if (key) {
      return memories.filter((m) => m.key === key);
    }

    return memories;
  }

  /**
   * Clear agent memory
   */
  async clearMemory(userId: string, agentId: string): Promise<void> {
    const key = `${userId}:${agentId}`;
    this.memoryStore.delete(key);

    // In production, delete from database
    // await supabase.from('agent_memories')
    //   .delete()
    //   .eq('user_id', userId)
    //   .eq('agent_id', agentId);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect dialect from conversation history
   */
  detectDialect(conversationHistory: ChatMessage[]): ArabicDialect | null {
    // In production, this would use the dialect detection service
    // For now, return null (will use user profile default)

    // Simple keyword-based detection (placeholder)
    const recentText = conversationHistory
      .slice(-3)
      .map((m) => m.content)
      .join(' ');

    // Egyptian indicators
    if (recentText.includes('ازيك') || recentText.includes('عامل ايه')) {
      return 'Egyptian';
    }

    // Gulf indicators
    if (recentText.includes('شلونك') || recentText.includes('وش')) {
      return 'Gulf';
    }

    // Levantine indicators
    if (recentText.includes('كيفك') || recentText.includes('شو')) {
      return 'Levantine';
    }

    return null;
  }

  /**
   * Calculate complexity score for input
   */
  calculateComplexity(input: string, context: AgentContext): number {
    let complexity = 0.5; // Base complexity

    // Length factor
    const wordCount = input.split(/\s+/).length;
    if (wordCount > 100) complexity += 0.2;
    else if (wordCount > 50) complexity += 0.1;

    // Technical keywords
    const technicalTerms = [
      'معادلة',
      'نظرية',
      'برهان',
      'تفاضل',
      'تكامل',
      'خوارزمية',
      'برمجة',
      'فيزياء',
      'كيمياء',
    ];
    const hasTechnicalTerms = technicalTerms.some((term) =>
      input.includes(term)
    );
    if (hasTechnicalTerms) complexity += 0.15;

    // Conversation depth
    if (context.conversationHistory.length > 10) complexity += 0.1;

    // Has code or equations
    if (input.includes('```') || input.includes('$')) complexity += 0.1;

    // Normalize to 0-1
    return Math.min(1, Math.max(0, complexity));
  }

  /**
   * Build prompt prefix with context
   */
  buildPromptPrefix(context: AgentContext): string {
    const parts: string[] = [];

    // Student info
    if (context.profile?.displayName) {
      parts.push(`الطالب: ${context.profile.displayName}`);
    }

    // Dialect
    if (context.dialect) {
      const dialectNames: Record<ArabicDialect, string> = {
        MSA: 'الفصحى',
        Egyptian: 'المصري',
        Gulf: 'الخليجي',
        Levantine: 'الشامي',
        Maghrebi: 'المغربي',
      };
      parts.push(`اللهجة المفضلة: ${dialectNames[context.dialect]}`);
    }

    // Current topic
    if (context.currentTopic) {
      parts.push(`الموضوع الحالي: ${context.currentTopic}`);
    }

    // Mastery levels (if available)
    if (context.masteryLevels && Object.keys(context.masteryLevels).length > 0) {
      const avgMastery =
        Object.values(context.masteryLevels).reduce((a, b) => a + b, 0) /
        Object.keys(context.masteryLevels).length;
      parts.push(`مستوى الإتقان المتوسط: ${(avgMastery * 100).toFixed(0)}%`);
    }

    return parts.length > 0 ? parts.join('\n') + '\n\n' : '';
  }

  /**
   * Extract mastery levels from context
   */
  getMasteryLevel(context: AgentContext, kcId: string): number | null {
    if (!context.masteryLevels) return null;
    return context.masteryLevels[kcId] ?? null;
  }

  /**
   * Check if context is too large
   */
  isContextTooLarge(context: AgentContext, maxTokens: number = 30000): boolean {
    // Rough estimation: 1 token ≈ 4 characters for Arabic
    const historyText = context.conversationHistory
      .map((m) => m.content)
      .join(' ');
    const estimatedTokens = historyText.length / 4;

    return estimatedTokens > maxTokens;
  }

  /**
   * Summarize old conversation history
   */
  async summarizeHistory(
    conversationHistory: ChatMessage[]
  ): Promise<ChatMessage> {
    // In production, use an LLM to summarize
    // For now, create a simple summary

    const summary = `تم إجراء ${conversationHistory.length} رسالة سابقة. ` +
      `المواضيع المطروحة: ${this.extractTopics(conversationHistory).slice(0, 3).join('، ')}.`;

    return {
      role: 'system',
      content: summary,
      timestamp: new Date(),
    };
  }
}

/**
 * Singleton instance
 */
export const contextManager = new ContextManager();
