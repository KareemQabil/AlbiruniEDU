# Al-Biruni EDU - Development Guide

## Project Overview

Al-Biruni is a revolutionary multi-agent Arabic-first educational AI platform serving 400+ million Arabic speakers. Named after the polymath Abu Rayhan al-Biruni (973-1048 CE), the platform combines 18 specialized AI agents with interactive visualizations, real-time code execution, and adaptive learning algorithms.

**Vision:** Become the world's first truly intelligent educational AI - not just a chatbot, but a team of specialized tutors working in concert to provide education rivaling human instruction.

## 🎯 Core Features

- **18 Specialized AI Agents** - Von Neumann Multi-Agent Framework
- **Arabic Dialect Auto-Detection** - Egyptian, Gulf, Levantine, MSA
- **Real-Time Code Execution** - Sandpack integration
- **Interactive Visualizations** - Mafs, React Three Fiber, Recharts
- **Workspace UI** - Premium glassy design with hierarchy
- **Offline-First PWA** - Service Worker + IndexedDB
- **RTL-First Design** - Complete Arabic language support

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** shadcn/ui (customized)
- **State:** Zustand + TanStack Query
- **Fonts:** IBM Plex Sans Arabic, Almarai

### Backend
- **Runtime:** Vercel Edge Functions
- **Database:** Supabase (PostgreSQL 16 + pgvector)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Real-time:** Supabase Realtime + WebSockets

### AI & ML
- **LLM:** Google Gemini 2.5 (Pro/Flash/Flash-Lite)
- **Smart Routing:** Cost-optimized model selection
- **Context Caching:** 75% token reduction
- **Voice:** Deepgram (ASR), ElevenLabs (TTS)

### Visualization & Interactivity
- **Code Execution:** Sandpack
- **Math Viz:** Mafs
- **3D/Physics:** React Three Fiber + Rapier
- **Charts:** Recharts
- **Chemistry:** 3Dmol.js

### Developer Tools
- **Testing:** Vitest + Playwright
- **Linting:** ESLint + Prettier
- **Type Safety:** TypeScript strict mode
- **Git:** Conventional Commits

## 📁 Project Structure

```
al-biruni/
├── .claude/                    # Claude Code config
│   ├── memory/                 # Conversation memory
│   └── context/                # Project context cache
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── AGENTS.md              # Agent specifications
│   ├── API.md                 # API documentation
│   ├── DESIGN_SYSTEM.md       # Design guidelines
│   ├── WORKFLOWS.md           # Development workflows
│   └── plans/                 # Implementation plans
├── public/
│   ├── fonts/                 # IBM Plex Sans Arabic, Almarai
│   ├── images/
│   └── locales/               # i18n translations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (workspace)/       # Main workspace routes
│   │   │   ├── dashboard/
│   │   │   ├── lessons/
│   │   │   ├── practice/
│   │   │   ├── progress/
│   │   │   └── settings/
│   │   ├── (auth)/           # Auth routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── reset-password/
│   │   ├── api/              # API routes
│   │   │   ├── agents/       # Agent endpoints
│   │   │   │   ├── maestro/
│   │   │   │   ├── visualizer/
│   │   │   │   ├── socratic/
│   │   │   │   ├── narrator/
│   │   │   │   └── [agent-id]/
│   │   │   ├── gemini/       # Gemini integration
│   │   │   ├── chat/         # Chat streaming
│   │   │   ├── webhooks/     # Webhook handlers
│   │   │   └── health/       # Health checks
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/           # React components
│   │   ├── ui/              # Base UI (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── workspace/       # Workspace UI
│   │   │   ├── sidebar.tsx
│   │   │   ├── command-palette.tsx
│   │   │   ├── panel-system.tsx
│   │   │   └── header.tsx
│   │   ├── agents/          # Agent-specific UI
│   │   │   ├── agent-card.tsx
│   │   │   ├── agent-selector.tsx
│   │   │   └── agent-status.tsx
│   │   ├── chat/           # Chat interface
│   │   │   ├── message-list.tsx
│   │   │   ├── message-input.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   └── typing-indicator.tsx
│   │   ├── lessons/        # Lesson components
│   │   │   ├── lesson-card.tsx
│   │   │   ├── lesson-viewer.tsx
│   │   │   └── lesson-progress.tsx
│   │   ├── visualizations/ # Viz components
│   │   │   ├── code-sandbox.tsx
│   │   │   ├── math-viz.tsx
│   │   │   ├── physics-sim.tsx
│   │   │   └── chart-viz.tsx
│   │   └── shared/         # Shared components
│   │       ├── loading.tsx
│   │       ├── error-boundary.tsx
│   │       └── empty-state.tsx
│   ├── lib/                # Core logic
│   │   ├── agents/         # Agent implementations
│   │   │   ├── base/       # Base agent class
│   │   │   │   ├── agent.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── utils.ts
│   │   │   ├── orchestration/
│   │   │   │   ├── maestro.ts
│   │   │   │   ├── router.ts
│   │   │   │   └── coordinator.ts
│   │   │   ├── tier1-content/
│   │   │   │   ├── visualizer.ts
│   │   │   │   ├── narrator.ts
│   │   │   │   ├── problem-decomposer.ts
│   │   │   │   └── simulator.ts
│   │   │   ├── tier2-learning/
│   │   │   │   ├── socratic.ts
│   │   │   │   ├── spaced-repetition.ts
│   │   │   │   ├── adaptive-assessor.ts
│   │   │   │   └── cognitive-mirror.ts
│   │   │   ├── tier3-support/
│   │   │   │   ├── research-companion.ts
│   │   │   │   ├── language-coach.ts
│   │   │   │   ├── engagement-monitor.ts
│   │   │   │   └── wellbeing.ts
│   │   │   └── prompts/    # Agent prompts
│   │   │       ├── socratic-prompts.ts
│   │   │       ├── visualizer-prompts.ts
│   │   │       └── ...
│   │   ├── gemini/         # Gemini SDK wrapper
│   │   │   ├── client.ts
│   │   │   ├── streaming.ts
│   │   │   ├── function-calling.ts
│   │   │   └── context-cache.ts
│   │   ├── supabase/       # Supabase client
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── database.ts
│   │   │   └── storage.ts
│   │   ├── dialect/        # Dialect detection
│   │   │   ├── detector.ts
│   │   │   ├── classifier.ts
│   │   │   └── adapters.ts
│   │   ├── fsrs/          # Spaced repetition
│   │   │   ├── scheduler.ts
│   │   │   ├── algorithm.ts
│   │   │   └── types.ts
│   │   ├── bkt/           # Bayesian Knowledge Tracing
│   │   │   ├── estimator.ts
│   │   │   └── types.ts
│   │   └── utils/         # Utilities
│   │       ├── cn.ts
│   │       ├── date.ts
│   │       ├── validation.ts
│   │       └── rtl.ts
│   ├── types/             # TypeScript types
│   │   ├── agents.ts
│   │   ├── database.ts
│   │   ├── api.ts
│   │   └── supabase.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── use-agent.ts
│   │   ├── use-chat.ts
│   │   ├── use-dialect.ts
│   │   └── use-workspace.ts
│   ├── stores/            # Zustand stores
│   │   ├── workspace.ts
│   │   ├── chat.ts
│   │   └── user.ts
│   └── styles/            # Global styles
│       └── globals.css
├── supabase/              # Supabase config
│   ├── migrations/        # DB migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_agents_tables.sql
│   │   ├── 003_learning_data.sql
│   │   └── ...
│   ├── functions/         # Edge functions
│   └── seed.sql          # Seed data
├── tests/                 # Tests
│   ├── unit/
│   │   ├── agents/
│   │   ├── dialect/
│   │   └── fsrs/
│   ├── integration/
│   │   ├── api/
│   │   └── agents/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── workspace.spec.ts
│       └── learning.spec.ts
├── scripts/               # Utility scripts
│   ├── seed-db.ts
│   ├── generate-types.ts
│   └── deploy.ts
├── CLAUDE.md             # ⭐ This file
├── .env.local            # Environment variables
├── .env.example          # Example env file
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── README.md
```

## 🎨 Design System

### Typography

**Primary Font:** IBM Plex Sans Arabic
- Excellent Arabic support with proper ligatures
- Clear at all sizes
- Professional and modern

**Secondary Font:** Almarai
- Used for headings and emphasis
- Bold weights for impact
- Great display font

**Font Sizes:**
```css
/* Arabic text requires larger sizes */
--text-xs: 0.875rem;     /* 14px */
--text-sm: 1rem;         /* 16px */
--text-base: 1.125rem;   /* 18px */
--text-lg: 1.25rem;      /* 20px */
--text-xl: 1.5rem;       /* 24px */
--text-2xl: 2rem;        /* 32px */
--text-3xl: 2.5rem;      /* 40px */
```

**Line Heights:**
- Arabic text: 1.8
- English text: 1.6

### Color Palette

**Quantum Academy Theme:**

```typescript
const colors = {
  // Primary - Quantum Gold
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Secondary - Cyber Cyan
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  // Main
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Neutral - Void Black to Pure White
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',  // Void black
  },

  // Accent - Success, Warning, Error
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}
```

### Glassmorphism

**Premium Glass Effect:**

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px 0 rgba(0, 0, 0, 0.37),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.glass-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
```

### RTL Support

**CSS Logical Properties:**

```css
/* ❌ Don't use directional properties */
margin-left: 1rem;
padding-right: 2rem;
text-align: left;

/* ✅ Use logical properties */
margin-inline-start: 1rem;
padding-inline-end: 2rem;
text-align: start;
```

**Tailwind RTL Utilities:**

```jsx
<div className="ms-4 me-2 rtl:text-right ltr:text-left">
  مرحباً
</div>
```

## 🤖 Agent Architecture

### Base Agent Class

All agents extend this base:

```typescript
// src/lib/agents/base/agent.ts

export interface AgentConfig {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  model: 'pro' | 'flash' | 'flash-lite';
  systemPrompt: string;
  tools?: Tool[];
  capabilities: string[];
}

export abstract class Agent {
  protected config: AgentConfig;
  protected gemini: GeminiClient;

  constructor(config: AgentConfig) {
    this.config = config;
    this.gemini = new GeminiClient(config.model);
  }

  // Main execution method
  abstract execute(
    input: string,
    context: AgentContext
  ): Promise<AgentResponse>;

  // Self-reflection
  async selfReflect(response: AgentResponse): Promise<ValidationResult> {
    // Each agent validates its own output
  }

  // Memory processing
  async updateMemory(context: AgentContext): Promise<void> {
    // Update agent's memory of student
  }
}
```

### Agent Orchestration

**Maestro Agent** - The conductor:

```typescript
class MaestroAgent extends Agent {
  async execute(input: string, context: AgentContext) {
    // 1. Analyze input complexity
    const complexity = await this.analyzeComplexity(input);

    // 2. Detect intent
    const intent = await this.detectIntent(input);

    // 3. Select appropriate agent(s)
    const agents = await this.selectAgents(complexity, intent);

    // 4. Orchestrate execution
    if (agents.length === 1) {
      return await this.singleAgentFlow(agents[0], input, context);
    } else {
      return await this.multiAgentFlow(agents, input, context);
    }
  }

  private async selectAgents(complexity, intent) {
    // Smart agent selection logic
  }
}
```

## 🔧 Code Style & Standards

### TypeScript

**Strict Mode Enabled:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Type Conventions:**

```typescript
// ✅ Good
interface IAgent {
  id: string;
  execute(input: string): Promise<Response>;
}

type AgentType = 'visualizer' | 'socratic' | 'narrator';

// ❌ Bad
interface agent {  // Should be PascalCase
  id: any;         // No 'any' types
}
```

### React Components

**Functional Components with Hooks:**

```typescript
// ✅ Preferred pattern
interface LessonViewProps {
  studentId: string;
  lessonId: string;
  onComplete: () => void;
}

export function LessonView({
  studentId,
  lessonId,
  onComplete
}: LessonViewProps) {
  // 1. Hooks
  const [loading, setLoading] = useState(false);
  const { data: lesson } = useLessonQuery(lessonId);

  // 2. Derived state
  const isReady = !loading && lesson;

  // 3. Event handlers
  const handleSubmit = async () => {
    setLoading(true);
    await submitAnswer();
    setLoading(false);
    onComplete();
  };

  // 4. Effects
  useEffect(() => {
    trackLessonView(lessonId);
  }, [lessonId]);

  // 5. Render
  if (!isReady) return <Loading />;

  return (
    <div className="lesson-container">
      {/* ... */}
    </div>
  );
}
```

### File Organization

**Import Order:**

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { z } from 'zod';

// 3. Internal components
import { Button, Card } from '@/components/ui';
import { AgentCard } from '@/components/agents';

// 4. Utilities and helpers
import { cn, formatDate } from '@/lib/utils';
import { detectDialect } from '@/lib/dialect';

// 5. Types
import type { Agent, AgentResponse } from '@/types';

// 6. Styles (if any)
import './styles.css';
```

### Naming Conventions

```typescript
// Components: PascalCase
VisualizerAgent.tsx
LessonCard.tsx

// Files: kebab-case
dialect-detector.ts
spaced-repetition.ts

// Functions: camelCase
detectDialect()
analyzeComplexity()

// Constants: SCREAMING_SNAKE_CASE
MAX_RETRIES = 3
DEFAULT_MODEL = 'flash'

// Types/Interfaces: PascalCase with I prefix for interfaces
interface IAgent {}
type AgentType = ...
```

## 🌐 Arabic & Internationalization

### Dialect Detection

```typescript
// Auto-detect on first user input
const dialect = await detectDialect(userInput);

// Dialect types
type ArabicDialect =
  | 'MSA'          // Modern Standard Arabic
  | 'Egyptian'     // Egyptian Arabic
  | 'Gulf'         // Gulf Arabic (Saudi, UAE, Kuwait)
  | 'Levantine'    // Levantine (Syria, Lebanon, Jordan, Palestine)
  | 'Maghrebi';    // North African (Morocco, Algeria, Tunisia)

// Store in user session
await updateUserDialect(userId, dialect);

// All agents adapt their responses
```

### i18n Structure

```typescript
// public/locales/ar/common.json
{
  "welcome": "مرحباً بك في البيروني",
  "start_learning": "ابدأ التعلم",
  "agents": {
    "visualizer": "المُصَوِّر",
    "socratic": "السُّقْراطي",
    "narrator": "الرَّاوي"
  }
}
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Users and Authentication (handled by Supabase Auth)

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  preferred_dialect TEXT CHECK (preferred_dialect IN ('MSA', 'Egyptian', 'Gulf', 'Levantine', 'Maghrebi')),
  learning_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Components
CREATE TABLE knowledge_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  prerequisites UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Mastery (FSRS + BKT)
CREATE TABLE student_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  kc_id UUID REFERENCES knowledge_components(id) ON DELETE CASCADE,

  -- FSRS parameters
  stability DECIMAL(8,2) DEFAULT 0,
  difficulty DECIMAL(4,3) DEFAULT 0.3,
  retrievability DECIMAL(4,3) DEFAULT 1.0,

  -- BKT parameters
  p_know DECIMAL(4,3) DEFAULT 0,
  p_learn DECIMAL(4,3) DEFAULT 0.3,
  p_slip DECIMAL(4,3) DEFAULT 0.1,
  p_guess DECIMAL(4,3) DEFAULT 0.25,

  -- Scheduling
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, kc_id)
);

-- Agent Sessions
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  input TEXT,
  output JSONB,
  context JSONB,
  duration_ms INTEGER,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  content JSONB,
  kc_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Progress
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_student_mastery_user ON student_mastery(user_id);
CREATE INDEX idx_student_mastery_next_review ON student_mastery(next_review_at);
CREATE INDEX idx_agent_sessions_user ON agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_created ON agent_sessions(created_at DESC);
CREATE INDEX idx_student_progress_user ON student_progress(user_id);
```

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/unit/dialect/detector.test.ts
import { describe, it, expect } from 'vitest';
import { detectDialect } from '@/lib/dialect/detector';

describe('Dialect Detector', () => {
  it('detects Egyptian dialect', async () => {
    const result = await detectDialect('ازيك يا معلم');
    expect(result.dialect).toBe('Egyptian');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('detects Gulf dialect', async () => {
    const result = await detectDialect('شلونك يا ولد');
    expect(result.dialect).toBe('Gulf');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('detects MSA', async () => {
    const result = await detectDialect('كيف حالك');
    expect(result.dialect).toBe('MSA');
  });
});
```

### Integration Tests

```typescript
// tests/integration/agents/socratic.test.ts
describe('Socratic Agent Integration', () => {
  it('guides student through problem solving', async () => {
    const agent = new SocraticAgent();

    const response = await agent.execute(
      "ما هي الجاذبية؟",
      { dialect: 'Egyptian', studentLevel: 'beginner' }
    );

    // Should ask questions, not give direct answers
    expect(response.type).toBe('questions');
    expect(response.questions).toHaveLength(3);
    expect(response.questions[0]).toContain('؟');
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/workspace.spec.ts
import { test, expect } from '@playwright/test';

test('complete learning session', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@albiruni.edu');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to lesson
  await page.click('[data-testid="lessons-nav"]');
  await page.click('[data-testid="lesson-card-1"]');

  // Interact with agent
  await page.fill('[data-testid="chat-input"]', 'ما هي المعادلة التربيعية؟');
  await page.click('[data-testid="send-button"]');

  // Verify response
  await expect(page.locator('[data-testid="agent-response"]')).toBeVisible();
});
```

## 📊 Performance Optimization

### Bundle Size

```typescript
// Dynamic imports for heavy components
const Visualizer = dynamic(() => import('@/components/agents/Visualizer'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const PhysicsSimulator = dynamic(() => import('@/components/visualizations/PhysicsSimulator'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Gemini API Optimization

```typescript
// Smart model routing
function selectModel(complexity: number): GeminiModel {
  if (complexity < 0.3) return 'flash-lite';  // $0.10/1M
  if (complexity < 0.7) return 'flash';       // $0.15/1M
  return 'pro';                                // $0.60/1M
}

// Context caching
const cachedPrompt = await gemini.cacheContent({
  model: 'gemini-2.5-flash',
  systemInstruction: SOCRATIC_PROMPT,
  ttl: '1h'
});
```

### Image Optimization

```jsx
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Al-Biruni"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

## 🔐 Security

### Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://loqhjfpuqjcwsgbfvpkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GpUe5IK5SJJHyvKjvzk2cw_M9nKHmR9
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GEMINI_API_KEY=AIzaSyDqYfdFpli93bKMnMvBx_KPTCXMYwOw3F8

# API Keys (never commit these!)
DEEPGRAM_API_KEY=your-key
ELEVENLABS_API_KEY=your-key

# Upstash Redis
UPSTASH_REDIS_URL=your-url
UPSTASH_REDIS_TOKEN=your-token
```

### Content Security Policy

```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.codesandbox.io;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  frame-src https://*.codesandbox.io https://*.csb.app;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.codesandbox.io wss://*.codesandbox.io;
`;
```

## 🚀 Deployment

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "GEMINI_API_KEY": "@gemini-api-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] TypeScript check (`npm run typecheck`)
- [ ] Linting passed (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API rate limiting enabled
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] PWA manifest and service worker
- [ ] Performance budget met

## 📚 Development Workflows

### Git Workflow

**Branch Naming:**
```
feature/agent-socratic
fix/dialect-detection-bug
docs/update-architecture
refactor/agent-orchestration
```

**Commit Messages (Conventional Commits):**
```
feat(agents): add Socratic Guide agent with Egyptian dialect support
fix(dialect): improve Gulf Arabic detection accuracy
docs(readme): update installation instructions
refactor(maestro): simplify agent selection logic
test(fsrs): add unit tests for FSRS scheduler
```

### Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run typecheck       # TypeScript type checking
npm run format          # Prettier formatting

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e        # E2E tests
npm run test:coverage   # Coverage report

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:reset        # Reset database
npm run db:types        # Generate TypeScript types

# Deployment
npm run deploy:staging  # Deploy to staging
npm run deploy:prod     # Deploy to production
```

## 🎯 Development Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Project setup and configuration
- ✅ Design system implementation
- ✅ Supabase integration
- ✅ Authentication flow
- ✅ Basic workspace UI

### Phase 2: Core Agents (Week 3-4)
- Maestro orchestration agent
- Dialect detection system
- First 3 agents (Visualizer, Socratic, Problem Decomposer)
- Agent API routes

### Phase 3: UI Integration (Week 5-6)
- Chat interface
- Visualization rendering
- Progress tracking
- Settings page

### Phase 4: Advanced Agents (Week 7-8)
- Spaced Repetition Engine
- Cognitive Mirror
- Memory Architect
- Research Companion

### Phase 5: Polish & Deploy (Week 9-10)
- Testing suite
- Performance optimization
- Documentation
- Production deployment

## 💡 Best Practices

### Component Design

```typescript
// ✅ Good: Single Responsibility
function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <LessonTitle title={lesson.title} />
      <LessonDescription description={lesson.description} />
      <LessonProgress progress={lesson.progress} />
    </Card>
  );
}

// ❌ Bad: Too many responsibilities
function LessonCard({ lesson, onEdit, onDelete, onShare }) {
  // Too much logic
}
```

### Error Handling

```typescript
// Client-side
try {
  const result = await agent.execute(input);
} catch (error) {
  if (error instanceof GeminiError) {
    toast.error('حدث خطأ في نظام الذكاء الاصطناعي');
  } else if (error instanceof NetworkError) {
    toast.error('تحقق من اتصالك بالإنترنت');
  } else {
    toast.error('حدث خطأ غير متوقع');
  }

  // Log to error tracking
  captureException(error);
}

// Server-side
return NextResponse.json(
  {
    error: {
      code: 'AGENT_TIMEOUT',
      message: 'Agent took too long to respond',
      details: { agentId, duration }
    }
  },
  { status: 504 }
);
```

### Accessibility

```jsx
// ✅ Good accessibility
<button
  aria-label="إرسال الإجابة"
  className="min-w-[44px] min-h-[44px]"
  onClick={handleSubmit}
>
  <SendIcon aria-hidden="true" />
  <span className="sr-only">إرسال</span>
</button>

// Support keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  {content}
</div>
```

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

**Last Updated:** 2026-01-18

**Remember:** This is a living document. Update it as patterns emerge and the project evolves!
