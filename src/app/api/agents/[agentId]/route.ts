/**
 * Agent Execution API
 *
 * POST /api/agents/[agentId]
 * Executes a specific agent with the given input
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/agents/registry';
import { contextManager } from '@/lib/agents/base/context';
import type { AgentContext, ChatMessage } from '@/lib/agents/base/types';

/**
 * Request body schema
 */
interface ExecuteAgentRequest {
  input: string;
  userId: string;
  conversationHistory?: ChatMessage[];
  dialect?: 'MSA' | 'Egyptian' | 'Gulf' | 'Levantine' | 'Maghrebi';
  profile?: {
    displayName?: string;
    gradeLevel?: number;
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
  options?: {
    model?: 'flash-lite' | 'flash' | 'pro';
    temperature?: number;
    stream?: boolean;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;

    // Parse request body
    const body: ExecuteAgentRequest = await request.json();

    // Validate required fields
    if (!body.input || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: input, userId',
          },
        },
        { status: 400 }
      );
    }

    // Get agent
    const agent = getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: `Agent '${agentId}' not found`,
          },
        },
        { status: 404 }
      );
    }

    // Build context
    const context: AgentContext = contextManager.buildContext({
      userId: body.userId,
      input: body.input,
      profile: body.profile,
      conversationHistory: body.conversationHistory,
    });

    // Add dialect if provided
    if (body.dialect) {
      context.dialect = body.dialect;
    }

    // Execute agent
    const response = await agent.executeWithPipeline(
      body.input,
      context,
      body.options || {}
    );

    // Return response
    return NextResponse.json({
      success: true,
      agent: {
        id: response.agentId,
        name: response.agentName,
      },
      response: {
        content: response.content,
        visualizations: response.visualizations,
        questions: response.questions,
        confidence: response.confidence,
      },
      usage: {
        model: response.model,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        durationMs: response.durationMs,
      },
      metadata: response.metadata,
      timestamp: response.timestamp,
    });
  } catch (error) {
    console.error(`[API] Error executing agent:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AGENT_EXECUTION_ERROR',
          message: 'Failed to execute agent',
          details: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}
