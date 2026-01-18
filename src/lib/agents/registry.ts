/**
 * Agent Registry and Initialization
 *
 * Centralized registry for all Al-Biruni agents.
 * Initializes and manages the 18-agent ecosystem.
 */

import { agentRegistry } from './base/agent';

// Tier 0: Orchestration
import { MaestroAgent } from './orchestration/maestro';

// Tier 1: Content Generation
import {
  VisualizerAgent,
  SocraticAgent,
  ProblemDecomposerAgent,
  NarratorAgent,
} from './tier1-content';

/**
 * Initialize all agents and register them
 */
export function initializeAgents(): void {
  // Clear existing registry
  agentRegistry.clear();

  // Tier 0: Orchestration
  const maestro = new MaestroAgent();
  agentRegistry.register(maestro);

  // Tier 1: Content Generation
  const visualizer = new VisualizerAgent();
  const socratic = new SocraticAgent();
  const problemDecomposer = new ProblemDecomposerAgent();
  const narrator = new NarratorAgent();

  agentRegistry.register(visualizer);
  agentRegistry.register(socratic);
  agentRegistry.register(problemDecomposer);
  agentRegistry.register(narrator);

  // Log initialization
  console.log(`[Agents] Initialized ${agentRegistry.count()} agents:`);
  agentRegistry.getAll().forEach((agent) => {
    console.log(`  - ${agent.getId()}: ${agent.getArabicName()}`);
  });
}

/**
 * Get agent by ID with type safety
 */
export function getAgent(agentId: string) {
  return agentRegistry.get(agentId);
}

/**
 * Get all available agents
 */
export function getAllAgents() {
  return agentRegistry.getAll();
}

/**
 * Get agents by capability
 */
export function getAgentsByCapability(capability: string) {
  return agentRegistry.getByCapability(capability);
}

/**
 * Get agent info for UI
 */
export function getAgentInfo(agentId: string) {
  const agent = agentRegistry.get(agentId);
  if (!agent) return null;

  const config = agent.getConfig();

  return {
    id: config.id,
    name: config.name,
    arabicName: config.arabicName,
    description: config.description,
    tier: config.tier,
    capabilities: config.capabilities,
    defaultModel: config.defaultModel,
  };
}

/**
 * Get all agents info for UI
 */
export function getAllAgentsInfo() {
  return agentRegistry.getAll().map((agent) => {
    const config = agent.getConfig();
    return {
      id: config.id,
      name: config.name,
      arabicName: config.arabicName,
      description: config.description,
      tier: config.tier,
      capabilities: config.capabilities,
      defaultModel: config.defaultModel,
    };
  });
}

/**
 * Check if agent exists
 */
export function hasAgent(agentId: string): boolean {
  return agentRegistry.get(agentId) !== null;
}

// Auto-initialize on import
if (typeof window === 'undefined') {
  // Only initialize on server-side
  initializeAgents();
}
