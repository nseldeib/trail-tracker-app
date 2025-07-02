"use client"

import { useEffect, useState } from "react"
import { supabase, type Todo, WORKOUT_EMOJIS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Mountain, LogOut, CheckCircle, Circle, Calendar, Star } from "lucide-react"
import WorkoutForm from "@/components/workout-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export default function WorkoutsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<Todo[]>([])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Todo | undefined>()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {
        router.push("/auth/signin")
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push("/auth/signin")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  const fetchWorkouts = async () => {
    // Filter by workout emojis to identify workouts
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .in("emoji", WORKOUT_EMOJIS)
      .order("due_date", { ascending: false })

    if (error) {
      console.error("Error fetching workouts:", error)
    } else {
      setWorkouts(data || [])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const deleteWorkout = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        console.error("Error deleting workout:", error)
      } else {
        fetchWorkouts()
      }
    }
  }

  const toggleComplete = async (item: Todo) => {
    const { error } = await supabase.from("todos").update({ completed: !item.completed }).eq("id", item.id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      fetchWorkouts()
    }
  }

  const toggleStar = async (item: Todo) => {
    const { error } = await supabase.from("todos").update({ starred: !item.starred }).eq("id", item.id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      fetchWorkouts()
    }
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading your workouts...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Mountain className="h-8 w-8 text-emerald-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Trail Tracker
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/workouts"
                  className="text-emerald-600 font-medium border-b-2 border-emerald-600 pb-1"
                >
                  Workouts
                </Link>
                <Link href="/dashboard/goals" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Goals
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:block">Welcome, {user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Your Workouts</h2>
            <p className="text-slate-600 mt-1">Track and manage your outdoor adventures</p>
          </div>
          <Button
            onClick={() => setShowWorkoutForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleComplete(workout)} className="h-6 w-6">
                      {workout.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                    </Button>
                    <span className="text-2xl">{workout.emoji || "🏃"}</span>
                    <div>
                      <CardTitle className={`text-lg ${workout.completed ? "line-through text-slate-500" : ""}`}>
                        {workout.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {workout.due_date ? new Date(workout.due_date).toLocaleDateString() : "No date"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleStar(workout)}>
                      <Star
                        className={`h-4 w-4 ${workout.starred ? "text-yellow-500 fill-current" : "text-slate-400"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingWorkout(workout)
                        setShowWorkoutForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteWorkout(workout.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {workout.description && <p className="text-sm text-slate-600">{workout.description}</p>}

                <div className="flex flex-wrap gap-2">
                  {workout.priority && (
                    <Badge className={priorityColors[workout.priority as keyof typeof priorityColors]}>
                      {workout.priority} intensity
                    </Badge>
                  )}
                  {workout.completed && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workouts.length === 0 && (
          <div className="text-center py-12">
            <Mountain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No workouts yet</h3>
            <p className="text-slate-500 mb-4">Start tracking your outdoor adventures!</p>
            <Button
              onClick={() => setShowWorkoutForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Workout
            </Button>
          </div>
        )}
      </main>

      {/* Forms */}
      {showWorkoutForm && (
        <WorkoutForm
          workout={editingWorkout}
          onClose={() => {
            setShowWorkoutForm(false)
            setEditingWorkout(undefined)
          }}
          onSave={() => {
            fetchWorkouts()
            setEditingWorkout(undefined)
          }}
        />
      )}
    </div>
  )
}
