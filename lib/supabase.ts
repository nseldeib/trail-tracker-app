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

export interface DailyCheckin {
  id: string
  user_id: string
  date: string
  score: number
  notes?: string
  emotions?: string[]
  created_at: string
  updated_at: string
}

// Emotion/condition options for daily check-ins
export const EMOTION_OPTIONS = [
  { value: "energized", label: "⚡ Energized", color: "bg-yellow-100 text-yellow-800" },
  { value: "fatigued", label: "😴 Fatigued", color: "bg-gray-100 text-gray-800" },
  { value: "motivated", label: "🔥 Motivated", color: "bg-orange-100 text-orange-800" },
  { value: "stressed", label: "😰 Stressed", color: "bg-red-100 text-red-800" },
  { value: "happy", label: "😊 Happy", color: "bg-green-100 text-green-800" },
  { value: "anxious", label: "😟 Anxious", color: "bg-purple-100 text-purple-800" },
  { value: "focused", label: "🎯 Focused", color: "bg-blue-100 text-blue-800" },
  { value: "sore", label: "💪 Sore", color: "bg-indigo-100 text-indigo-800" },
  { value: "strong", label: "💪 Strong", color: "bg-emerald-100 text-emerald-800" },
  { value: "peaceful", label: "🧘 Peaceful", color: "bg-teal-100 text-teal-800" },
]

// Workout activity emojis for categorization
export const WORKOUT_EMOJIS = ["🏃", "🧗", "🥾", "🏂", "🚴", "🏊", "💪", "🧘"]

// Goal emojis for categorization
export const GOAL_EMOJIS = ["🎯", "🏆", "📚", "💡", "🌟", "🔥", "⚡", "🚀"]
