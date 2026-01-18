/**
 * Agents API - List all available agents
 *
 * GET /api/agents
 * Returns list of all registered agents with their metadata
 */

import { NextResponse } from 'next/server';
import { getAllAgentsInfo } from '@/lib/agents/registry';

export async function GET() {
  try {
    const agents = getAllAgentsInfo();

    return NextResponse.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    console.error('[API] Error fetching agents:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AGENTS_FETCH_ERROR',
          message: 'Failed to fetch agents',
          details: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}
