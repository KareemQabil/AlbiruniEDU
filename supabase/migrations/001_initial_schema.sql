-- ============================================================================
-- Al-Biruni EDU - Initial Database Schema
-- Migration: 001_initial_schema
-- Created: 2026-01-18
-- Description: Core tables for users, knowledge components, student mastery,
--              agent sessions, lessons, and progress tracking
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Arabic dialect types
CREATE TYPE arabic_dialect AS ENUM (
  'MSA',          -- Modern Standard Arabic
  'Egyptian',     -- Egyptian Arabic
  'Gulf',         -- Gulf Arabic (Saudi, UAE, Kuwait, Bahrain, Qatar, Oman)
  'Levantine',    -- Levantine (Syria, Lebanon, Jordan, Palestine)
  'Maghrebi'      -- North African (Morocco, Algeria, Tunisia, Libya)
);

-- Learning style preferences
CREATE TYPE learning_style AS ENUM (
  'visual',
  'auditory',
  'kinesthetic',
  'reading_writing',
  'mixed'
);

-- Lesson difficulty levels
CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

-- Student progress status
CREATE TYPE progress_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'mastered'
);

-- Agent types (for the 18 specialized agents)
CREATE TYPE agent_type AS ENUM (
  -- Tier 1: Content Generation
  'visualizer',
  'narrator',
  'problem_decomposer',
  'simulator',

  -- Tier 2: Learning Science
  'socratic',
  'spaced_repetition',
  'adaptive_assessor',
  'cognitive_mirror',
  'memory_architect',
  'context_weaver',

  -- Tier 3: Support & Scaffolding
  'research_companion',
  'language_coach',
  'engagement_monitor',
  'wellbeing',

  -- Orchestration
  'maestro'
);

-- ============================================================================
-- USER PROFILES
-- ============================================================================

-- Extended user profile beyond Supabase Auth
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,

  -- Learning Preferences
  preferred_dialect arabic_dialect DEFAULT 'MSA',
  learning_style learning_style DEFAULT 'mixed',
  native_language TEXT DEFAULT 'ar',
  target_languages TEXT[] DEFAULT ARRAY['en'],

  -- Settings
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  daily_goal_minutes INTEGER DEFAULT 30,
  preferred_study_time TIME,

  -- Metadata
  timezone TEXT DEFAULT 'Asia/Riyadh',
  country_code TEXT,
  education_level TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for fast lookups
  CONSTRAINT valid_daily_goal CHECK (daily_goal_minutes >= 5 AND daily_goal_minutes <= 480)
);

-- Index for dialect-based queries
CREATE INDEX idx_user_profiles_dialect ON user_profiles(preferred_dialect);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active_at DESC);

-- ============================================================================
-- KNOWLEDGE COMPONENTS
-- ============================================================================

-- Knowledge Components (KCs) - atomic learning units
CREATE TABLE knowledge_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identification
  code TEXT UNIQUE NOT NULL, -- e.g., "MATH_ALGEBRA_QUADRATIC_FORMULA"
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,

  -- Classification
  subject TEXT NOT NULL, -- Math, Physics, Chemistry, Biology, etc.
  topic TEXT NOT NULL,   -- Algebra, Mechanics, Organic Chemistry, etc.
  subtopic TEXT,

  -- Hierarchy
  prerequisites UUID[] DEFAULT '{}', -- Array of KC IDs
  related_kcs UUID[] DEFAULT '{}',
  difficulty difficulty_level DEFAULT 'beginner',

  -- Content
  learning_objectives TEXT[],
  common_misconceptions TEXT[],

  -- Metadata
  estimated_time_minutes INTEGER, -- Time to master
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_kc_subject ON knowledge_components(subject);
CREATE INDEX idx_kc_topic ON knowledge_components(topic);
CREATE INDEX idx_kc_difficulty ON knowledge_components(difficulty);
CREATE INDEX idx_kc_code ON knowledge_components(code);

-- ============================================================================
-- STUDENT MASTERY
-- ============================================================================

-- Student mastery tracking using FSRS + Bayesian Knowledge Tracing
CREATE TABLE student_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  kc_id UUID NOT NULL REFERENCES knowledge_components(id) ON DELETE CASCADE,

  -- FSRS (Free Spaced Repetition Scheduler) Parameters
  stability DECIMAL(8,2) DEFAULT 0,         -- Days until R drops from 100% to 90%
  difficulty DECIMAL(4,3) DEFAULT 0.3,      -- Inherent difficulty (0-1)
  retrievability DECIMAL(4,3) DEFAULT 1.0,  -- Probability of recall (0-1)

  -- Bayesian Knowledge Tracing (BKT) Parameters
  p_know DECIMAL(4,3) DEFAULT 0,      -- P(L) - Probability student knows the KC
  p_learn DECIMAL(4,3) DEFAULT 0.3,   -- P(T) - Probability of learning per opportunity
  p_slip DECIMAL(4,3) DEFAULT 0.1,    -- P(S) - Probability of making a mistake despite knowing
  p_guess DECIMAL(4,3) DEFAULT 0.25,  -- P(G) - Probability of guessing correctly

  -- Review Scheduling
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,

  -- Performance Metrics
  total_correct INTEGER DEFAULT 0,
  total_incorrect INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  average_response_time_seconds DECIMAL(8,2),

  -- Mastery Level (derived from BKT p_know)
  mastery_level DECIMAL(4,3) GENERATED ALWAYS AS (p_know) STORED,
  is_mastered BOOLEAN GENERATED ALWAYS AS (p_know >= 0.95) STORED,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, kc_id),
  CONSTRAINT valid_fsrs_params CHECK (
    stability >= 0 AND
    difficulty >= 0 AND difficulty <= 1 AND
    retrievability >= 0 AND retrievability <= 1
  ),
  CONSTRAINT valid_bkt_params CHECK (
    p_know >= 0 AND p_know <= 1 AND
    p_learn >= 0 AND p_learn <= 1 AND
    p_slip >= 0 AND p_slip <= 1 AND
    p_guess >= 0 AND p_guess <= 1
  )
);

-- Indexes for fast lookups
CREATE INDEX idx_student_mastery_user ON student_mastery(user_id);
CREATE INDEX idx_student_mastery_kc ON student_mastery(kc_id);
CREATE INDEX idx_student_mastery_next_review ON student_mastery(next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX idx_student_mastery_level ON student_mastery(user_id, mastery_level DESC);
CREATE INDEX idx_student_mastery_is_mastered ON student_mastery(user_id, is_mastered);

-- ============================================================================
-- LESSONS
-- ============================================================================

-- Structured learning content
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identification
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Content
  description_en TEXT,
  description_ar TEXT,
  content JSONB NOT NULL, -- Structured lesson content (text, images, videos, exercises)

  -- Classification
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',

  -- Knowledge Components covered
  kc_ids UUID[] NOT NULL DEFAULT '{}',
  prerequisite_lesson_ids UUID[] DEFAULT '{}',

  -- Metadata
  estimated_duration_minutes INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_duration CHECK (estimated_duration_minutes > 0)
);

-- Indexes
CREATE INDEX idx_lessons_subject ON lessons(subject);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX idx_lessons_published ON lessons(is_published, published_at DESC);
CREATE INDEX idx_lessons_slug ON lessons(slug);

-- ============================================================================
-- STUDENT PROGRESS
-- ============================================================================

-- Track student progress through lessons
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  -- Progress
  status progress_status DEFAULT 'not_started',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

  -- Time Tracking
  time_spent_seconds INTEGER DEFAULT 0,
  last_position JSONB, -- Store where user left off (section, slide, etc.)

  -- Performance
  exercises_completed INTEGER DEFAULT 0,
  exercises_correct INTEGER DEFAULT 0,
  quiz_score DECIMAL(5,2), -- Percentage score (0-100)

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_student_progress_user ON student_progress(user_id);
CREATE INDEX idx_student_progress_lesson ON student_progress(lesson_id);
CREATE INDEX idx_student_progress_status ON student_progress(user_id, status);
CREATE INDEX idx_student_progress_last_accessed ON student_progress(user_id, last_accessed_at DESC);

-- ============================================================================
-- AGENT SESSIONS
-- ============================================================================

-- Track all AI agent interactions
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Agent Information
  agent_type agent_type NOT NULL,
  agent_version TEXT DEFAULT '1.0',

  -- Request/Response
  input TEXT NOT NULL,
  output JSONB, -- Structured agent response
  context JSONB, -- Student context provided to agent

  -- Execution Metrics
  model_used TEXT, -- e.g., "gemini-2.5-flash"
  duration_ms INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10,6), -- Track API costs

  -- Quality Metrics
  self_reflection_score DECIMAL(4,3), -- Agent's confidence in its response
  student_feedback INTEGER CHECK (student_feedback >= 1 AND student_feedback <= 5), -- 1-5 stars
  was_helpful BOOLEAN,

  -- Metadata
  dialect_used arabic_dialect,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_sessions_user ON agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_agent_type ON agent_sessions(agent_type);
CREATE INDEX idx_agent_sessions_created ON agent_sessions(created_at DESC);
CREATE INDEX idx_agent_sessions_user_agent ON agent_sessions(user_id, agent_type, created_at DESC);

-- ============================================================================
-- FLASHCARDS
-- ============================================================================

-- Spaced repetition flashcards (generated by Spaced Repetition Engine agent)
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  kc_id UUID NOT NULL REFERENCES knowledge_components(id) ON DELETE CASCADE,

  -- Card Content
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  hints TEXT[],

  -- FSRS Scheduling
  due_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stability DECIMAL(8,2) DEFAULT 1,
  difficulty DECIMAL(4,3) DEFAULT 0.3,
  elapsed_days INTEGER DEFAULT 0,
  scheduled_days INTEGER DEFAULT 0,
  reps INTEGER DEFAULT 0,
  lapses INTEGER DEFAULT 0,
  state TEXT DEFAULT 'new', -- new, learning, review, relearning

  -- Timestamps
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_flashcards_due ON flashcards(user_id, due_date) WHERE state IN ('new', 'learning', 'review');
CREATE INDEX idx_flashcards_kc ON flashcards(kc_id);

-- ============================================================================
-- REVIEW HISTORY
-- ============================================================================

-- Track every flashcard review for analytics
CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,

  -- Review Details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4), -- 1=again, 2=hard, 3=good, 4=easy
  time_taken_seconds INTEGER,

  -- State Before Review
  state_before TEXT NOT NULL,
  stability_before DECIMAL(8,2),
  difficulty_before DECIMAL(4,3),

  -- State After Review
  state_after TEXT NOT NULL,
  stability_after DECIMAL(8,2),
  difficulty_after DECIMAL(4,3),

  -- Timestamps
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_review_history_user ON review_history(user_id);
CREATE INDEX idx_review_history_flashcard ON review_history(flashcard_id);
CREATE INDEX idx_review_history_reviewed_at ON review_history(reviewed_at DESC);

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================

-- Gamification: Track student achievements and badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Achievement Details
  code TEXT UNIQUE NOT NULL, -- e.g., "FIRST_LESSON", "WEEK_STREAK_7"
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,

  -- Visual
  icon_url TEXT,
  color TEXT, -- Hex color for badge

  -- Requirements
  criteria JSONB NOT NULL, -- Define unlock conditions
  points INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student achievements (unlocked badges)
CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_student_achievements_user ON student_achievements(user_id, unlocked_at DESC);

-- ============================================================================
-- STUDY SESSIONS
-- ============================================================================

-- Track focused study sessions for analytics
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Session Details
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- What was studied
  lesson_ids UUID[],
  kc_ids UUID[],

  -- Performance
  total_exercises INTEGER DEFAULT 0,
  correct_exercises INTEGER DEFAULT 0,
  flashcards_reviewed INTEGER DEFAULT 0,

  -- Engagement
  focus_score DECIMAL(4,3), -- Based on Engagement Monitor agent
  breaks_taken INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user ON study_sessions(user_id, started_at DESC);

-- ============================================================================
-- UPDATED AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_components_updated_at BEFORE UPDATE ON knowledge_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_mastery_updated_at BEFORE UPDATE ON student_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Student Mastery: Users can read/update their own mastery data
CREATE POLICY "Users can view own mastery" ON student_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery" ON student_mastery
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mastery" ON student_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Student Progress: Users can read/update their own progress
CREATE POLICY "Users can view own progress" ON student_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON student_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON student_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agent Sessions: Users can read/create their own sessions
CREATE POLICY "Users can view own sessions" ON agent_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON agent_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flashcards: Users can manage their own flashcards
CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- Review History: Users can read/create their own reviews
CREATE POLICY "Users can view own reviews" ON review_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews" ON review_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Student Achievements: Users can read their own achievements
CREATE POLICY "Users can view own achievements" ON student_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements" ON student_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study Sessions: Users can manage their own sessions
CREATE POLICY "Users can view own study sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update study sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for knowledge components and lessons
CREATE POLICY "Anyone can view knowledge components" ON knowledge_components
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view published lessons" ON lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get student's overall mastery score
CREATE OR REPLACE FUNCTION get_student_overall_mastery(student_id UUID)
RETURNS DECIMAL(4,3) AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(mastery_level), 0)
    FROM student_mastery
    WHERE user_id = student_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student's daily study streak
CREATE OR REPLACE FUNCTION get_study_streak(student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  LOOP
    -- Check if student had any activity on check_date
    SELECT EXISTS (
      SELECT 1 FROM study_sessions
      WHERE user_id = student_id
        AND DATE(started_at) = check_date
    ) INTO has_activity;

    -- If no activity, break the streak
    IF NOT has_activity THEN
      EXIT;
    END IF;

    -- Increment streak and check previous day
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'Extended user profile with learning preferences and settings';
COMMENT ON TABLE knowledge_components IS 'Atomic learning units (KCs) that students must master';
COMMENT ON TABLE student_mastery IS 'Student mastery tracking using FSRS + Bayesian Knowledge Tracing';
COMMENT ON TABLE lessons IS 'Structured learning content mapped to knowledge components';
COMMENT ON TABLE student_progress IS 'Track student progress through lessons';
COMMENT ON TABLE agent_sessions IS 'Log all AI agent interactions for analytics and debugging';
COMMENT ON TABLE flashcards IS 'Spaced repetition flashcards with FSRS scheduling';
COMMENT ON TABLE review_history IS 'Complete history of flashcard reviews for analytics';
COMMENT ON TABLE achievements IS 'Gamification badges and rewards';
COMMENT ON TABLE student_achievements IS 'Unlocked achievements per student';
COMMENT ON TABLE study_sessions IS 'Focused study session tracking for engagement analytics';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
