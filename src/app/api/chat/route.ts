/**
 * Chat API - Main conversation endpoint
 *
 * POST /api/chat
 * Uses Maestro agent to orchestrate responses from specialized agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/agents/registry';
import { contextManager } from '@/lib/agents/base/context';
import type { AgentContext, ChatMessage } from '@/lib/agents/base/types';

/**
 * Chat request schema
 */
interface ChatRequest {
  message: string;
  userId: string;
  conversationHistory?: ChatMessage[];
  sessionId?: string;
  dialect?: 'MSA' | 'Egyptian' | 'Gulf' | 'Levantine' | 'Maghrebi';
  profile?: {
    displayName?: string;
    preferredDialect?: 'MSA' | 'Egyptian' | 'Gulf' | 'Levantine' | 'Maghrebi';
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    gradeLevel?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();

    // Validate required fields
    if (!body.message || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: message, userId',
          },
        },
        { status: 400 }
      );
    }

    // Get Maestro agent (orchestrator)
    const maestro = getAgent('maestro');
    if (!maestro) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MAESTRO_NOT_FOUND',
            message: 'Maestro orchestrator agent not initialized',
          },
        },
        { status: 500 }
      );
    }

    // Build context
    const context: AgentContext = contextManager.buildContext({
      userId: body.userId,
      input: body.message,
      profile: body.profile,
      conversationHistory: body.conversationHistory || [],
      sessionId: body.sessionId,
    });

    // Set dialect
    if (body.dialect) {
      context.dialect = body.dialect;
    } else if (body.profile?.preferredDialect) {
      context.dialect = body.profile.preferredDialect;
    } else {
      // Auto-detect from conversation history
      const detectedDialect = contextManager.detectDialect(
        context.conversationHistory
      );
      if (detectedDialect) {
        context.dialect = detectedDialect;
      }
    }

    // Execute Maestro orchestration
    const response = await maestro.executeWithPipeline(body.message, context);

    // Build conversation history for next turn
    const updatedHistory = [
      ...context.conversationHistory,
      {
        role: 'agent' as const,
        content: response.content,
        timestamp: response.timestamp,
        agentId: response.agentId,
      },
    ];

    // Return response
    return NextResponse.json({
      success: true,
      message: {
        role: 'agent',
        content: response.content,
        agentId: response.agentId,
        agentName: response.agentName,
        timestamp: response.timestamp,
      },
      visualizations: response.visualizations || [],
      questions: response.questions || [],
      conversationHistory: updatedHistory,
      sessionId: context.sessionId,
      usage: {
        model: response.model,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        durationMs: response.durationMs,
      },
      orchestration: response.metadata?.orchestration,
    });
  } catch (error) {
    console.error('[API] Chat error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHAT_ERROR',
          message: 'Failed to process chat message',
          details: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}
