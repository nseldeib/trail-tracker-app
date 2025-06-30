import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ActivityType = "running" | "climbing" | "hiking" | "snowboarding"
export type Difficulty = "easy" | "moderate" | "hard" | "extreme"

// Use existing todos table structure for both workouts and goals
export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  priority?: string
  due_date?: string
  project_id?: string
  event_id?: string
  starred?: boolean
  emoji?: string
  created_at: string
  updated_at: string
}

// Workout is a todo with specific emoji/categorization
export interface Workout extends Todo {
  // We'll use emoji to categorize workout types
  // We'll use description to store workout details
}

// Goal is a todo with goal-specific properties
export interface WorkoutGoal extends Todo {
  // Goals will have different emojis and can use due_date for target dates
}

export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  timezone?: string
  created_at: string
  updated_at: string
}

// Workout activity emojis for categorization
export const WORKOUT_EMOJIS = ["🏃", "🧗", "🥾", "🏂", "🚴", "🏊", "💪", "🧘"]

// Goal emojis for categorization
export const GOAL_EMOJIS = ["🎯", "🏆", "📚", "💡", "🌟", "🔥", "⚡", "🚀"]
