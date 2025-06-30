import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ActivityType = "running" | "climbing" | "hiking" | "snowboarding"
export type Difficulty = "easy" | "moderate" | "hard" | "extreme"

export interface Workout {
  id: string
  user_id: string
  activity_type: ActivityType
  title: string
  description?: string
  duration_minutes?: number
  distance_miles?: number
  difficulty?: Difficulty
  location?: string
  notes?: string
  date: string
  created_at: string
  updated_at: string
}

export interface WorkoutGoal {
  id: string
  user_id: string
  title: string
  description?: string
  activity_type?: ActivityType | "general"
  target_value?: number
  target_unit?: string
  current_value: number
  completed: boolean
  target_date?: string
  created_at: string
  updated_at: string
}

// Existing database types
export interface ExistingTodo {
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

export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  timezone?: string
  created_at: string
  updated_at: string
}
