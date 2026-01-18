/**
 * Gemini Context Caching
 *
 * Cache system prompts and common context to save 75% on tokens
 *
 * Note: Context caching is available in Gemini 1.5 Pro/Flash
 * Cached content costs 25% of regular input tokens
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CachedContent } from '@google/generative-ai';

export interface CacheConfig {
  ttlSeconds?: number; // Time to live (default: 3600 = 1 hour)
  displayName?: string;
}

/**
 * Context cache manager
 */
export class ContextCacheManager {
  private genAI: GoogleGenerativeAI;
  private caches: Map<string, CachedContent> = new Map();

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      throw new Error('Gemini API key required for context caching');
    }

    this.genAI = new GoogleGenerativeAI(key);
  }

  /**
   * Create or get a cached context
   */
  async getOrCreateCache(
    key: string,
    systemInstruction: string,
    config: CacheConfig = {}
  ): Promise<CachedContent> {
    // Check if we have a valid cached version
    const existing = this.caches.get(key);
    if (existing) {
      // Check if cache is still valid
      if (existing.expireTime) {
        const expireDate = new Date(existing.expireTime);
        if (expireDate > new Date()) {
          return existing;
        }
      }
    }

    // Create new cache
    try {
      const cache = await this.genAI.cacheManager.create({
        model: 'models/gemini-1.5-flash',
        displayName: config.displayName || key,
        systemInstruction,
        ttlSeconds: config.ttlSeconds || 3600, // 1 hour default
      });

      this.caches.set(key, cache);
      return cache;
    } catch (error) {
      console.error('Failed to create context cache:', error);
      throw error;
    }
  }

  /**
   * Get a cached context by key
   */
  async getCache(key: string): Promise<CachedContent | null> {
    return this.caches.get(key) || null;
  }

  /**
   * Delete a cached context
   */
  async deleteCache(key: string): Promise<void> {
    const cache = this.caches.get(key);
    if (cache) {
      try {
        await this.genAI.cacheManager.delete(cache.name);
        this.caches.delete(key);
      } catch (error) {
        console.error('Failed to delete cache:', error);
      }
    }
  }

  /**
   * List all caches
   */
  async listCaches(): Promise<CachedContent[]> {
    try {
      const caches = await this.genAI.cacheManager.list();
      return caches.cachedContents || [];
    } catch (error) {
      console.error('Failed to list caches:', error);
      return [];
    }
  }

  /**
   * Clear all expired caches
   */
  async clearExpiredCaches(): Promise<void> {
    const now = new Date();
    const toDelete: string[] = [];

    for (const [key, cache] of this.caches.entries()) {
      if (cache.expireTime) {
        const expireDate = new Date(cache.expireTime);
        if (expireDate <= now) {
          toDelete.push(key);
        }
      }
    }

    for (const key of toDelete) {
      await this.deleteCache(key);
    }
  }
}

/**
 * Common system prompts for caching
 */
export const CACHED_SYSTEM_PROMPTS = {
  socratic: `You are the Socratic Guide (السُّقْراطي), a specialized AI tutor who NEVER gives direct answers.

Your role:
- Ask 3-5 guiding questions that help students discover answers themselves
- Probe assumptions and encourage critical thinking
- Adapt to student's Arabic dialect (Egyptian, Gulf, Levantine, MSA)
- Be patient, encouraging, and never judgmental
- Use examples and analogies from Arabic culture and Islamic Golden Age

CRITICAL RULES:
- NEVER provide direct answers
- ALWAYS respond with questions
- Guide students to think deeply
- Celebrate their reasoning process

Example:
Student: "What is gravity?"
You: "قبل أن نبدأ، ما رأيك - لماذا تسقط الأشياء لأسفل وليس لأعلى؟ (Before we begin, what do you think - why do things fall down and not up?)"
`,

  visualizer: `You are the Visualizer (المُصَوِّر), an AI agent specialized in creating interactive React components.

Your role:
- Generate React/TypeScript code for visualizations
- Use Mafs for math graphs
- Use React Three Fiber for 3D physics
- Use Recharts for data visualization
- Create clean, educational, interactive components

CRITICAL RULES:
- Generate valid, working React code
- Include proper TypeScript types
- Make visualizations interactive and educational
- Add comments explaining key concepts
- Ensure code is safe (no eval, no external scripts)

Output format: Pure JSX/TSX code wrapped in \`\`\`tsx blocks
`,

  narrator: `You are the Narrator (الرَّاوي), a storytelling AI that frames concepts using cultural narratives.

Your role:
- Connect modern concepts to Islamic Golden Age scientists
- Use stories and historical context
- Make learning relatable through cultural examples
- Explain real-world applications
- Use rich, engaging Arabic language

Scientists you reference:
- Al-Khwarizmi (algebra, algorithms)
- Ibn al-Haytham (optics, scientific method)
- Al-Biruni (astronomy, mathematics, geography)
- Ibn Sina (medicine, philosophy)

CRITICAL RULES:
- Make learning memorable through stories
- Connect to student's cultural background
- Inspire curiosity about Islamic scientific heritage
`,

  problemDecomposer: `You are the Problem Decomposer (المُحَلِّل), an AI that breaks complex problems into manageable steps.

Your role:
- Decompose complex problems into 3-7 smaller sub-problems
- Create scaffolding from simple to complex
- Provide worked examples with annotations
- Check prerequisite knowledge first
- Build confidence through incremental success

CRITICAL RULES:
- Start with what student knows
- Break into logical, sequential steps
- Provide hints, not complete solutions
- Celebrate completion of each step

Format:
1. Identify prerequisites
2. Break into steps
3. Guide through each step
4. Build to final solution
`,
};

/**
 * Singleton cache manager
 */
let defaultCacheManager: ContextCacheManager | null = null;

export function getCacheManager(): ContextCacheManager {
  if (!defaultCacheManager) {
    defaultCacheManager = new ContextCacheManager();
  }
  return defaultCacheManager;
}

/**
 * Helper to get cached model with system instruction
 */
export async function getCachedModel(
  agentType: keyof typeof CACHED_SYSTEM_PROMPTS,
  config: CacheConfig = {}
) {
  const cacheManager = getCacheManager();
  const systemInstruction = CACHED_SYSTEM_PROMPTS[agentType];

  const cache = await cacheManager.getOrCreateCache(
    `agent-${agentType}`,
    systemInstruction,
    {
      displayName: `Al-Biruni ${agentType} Agent`,
      ...config,
    }
  );

  return cache;
}
