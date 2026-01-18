/**
 * Supabase Database Utilities
 *
 * Helper functions for common database operations
 */

import { createClient, createServerComponentClient } from './client';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type UserProfile = Tables['user_profiles']['Row'];
type StudentMastery = Tables['student_mastery']['Row'];
type Lesson = Tables['lessons']['Row'];
type StudentProgress = Tables['student_progress']['Row'];
type AgentSession = Tables['agent_sessions']['Row'];
type Flashcard = Tables['flashcards']['Row'];

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(userId: string) {
  const supabase = createClient();

  // Try to get existing profile
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      display_name: null,
      preferred_dialect: 'MSA',
      learning_style: 'mixed',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return newProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get student mastery for a knowledge component
 */
export async function getStudentMastery(userId: string, kcId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('kc_id', kcId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    throw error;
  }

  return data;
}

/**
 * Update student mastery (FSRS + BKT parameters)
 */
export async function updateStudentMastery(
  userId: string,
  kcId: string,
  updates: Partial<StudentMastery>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_mastery')
    .upsert(
      {
        user_id: userId,
        kc_id: kcId,
        ...updates,
      },
      {
        onConflict: 'user_id,kc_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get all mastered knowledge components for a student
 */
export async function getMasteredKCs(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_mastery')
    .select('kc_id, mastery_level, knowledge_components(*)')
    .eq('user_id', userId)
    .eq('is_mastered', true);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get knowledge components that need review
 */
export async function getKCsNeedingReview(userId: string, limit = 20) {
  const supabase = createClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('student_mastery')
    .select('*, knowledge_components(*)')
    .eq('user_id', userId)
    .lte('next_review_at', now)
    .order('next_review_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get all published lessons
 */
export async function getPublishedLessons(subject?: string) {
  const supabase = createClient();

  let query = supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (subject) {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get lesson by slug
 */
export async function getLessonBySlug(slug: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get student progress for a lesson
 */
export async function getStudentProgress(userId: string, lessonId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Update student progress
 */
export async function updateStudentProgress(
  userId: string,
  lessonId: string,
  updates: Partial<StudentProgress>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        ...updates,
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Log an agent session
 */
export async function logAgentSession(
  userId: string,
  session: Partial<AgentSession>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agent_sessions')
    .insert({
      user_id: userId,
      ...session,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get recent agent sessions for a user
 */
export async function getRecentAgentSessions(userId: string, limit = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agent_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get flashcards due for review
 */
export async function getFlashcardsDue(userId: string, limit = 20) {
  const supabase = createClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .lte('due_date', now)
    .in('state', ['new', 'learning', 'review'])
    .order('due_date', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update flashcard after review
 */
export async function updateFlashcard(
  flashcardId: string,
  updates: Partial<Flashcard>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('flashcards')
    .update(updates)
    .eq('id', flashcardId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Log a flashcard review
 */
export async function logFlashcardReview(review: {
  user_id: string;
  flashcard_id: string;
  rating: number;
  time_taken_seconds?: number;
  state_before: string;
  stability_before: number;
  difficulty_before: number;
  state_after: string;
  stability_after: number;
  difficulty_after: number;
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('review_history')
    .insert(review)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get student's overall mastery score
 */
export async function getOverallMastery(userId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_student_overall_mastery', {
    student_id: userId,
  });

  if (error) {
    throw error;
  }

  return data || 0;
}

/**
 * Get student's current study streak
 */
export async function getStudyStreak(userId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_study_streak', {
    student_id: userId,
  });

  if (error) {
    throw error;
  }

  return data || 0;
}

/**
 * Start a new study session
 */
export async function startStudySession(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * End a study session
 */
export async function endStudySession(
  sessionId: string,
  updates: {
    ended_at?: string;
    duration_seconds?: number;
    total_exercises?: number;
    correct_exercises?: number;
    flashcards_reviewed?: number;
    focus_score?: number;
    breaks_taken?: number;
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('study_sessions')
    .update({
      ended_at: new Date().toISOString(),
      ...updates,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
