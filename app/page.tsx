"use client"

import { useEffect, useState } from "react"
import { supabase, type Workout, type WorkoutGoal } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Mountain, LogOut, CheckCircle, Circle, Target, Calendar, TrendingUp } from "lucide-react"
import Auth from "@/components/auth"
import WorkoutForm from "@/components/workout-form"
import GoalForm from "@/components/todo-form"
import type { User } from "@supabase/supabase-js"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<WorkoutGoal[]>([])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>()
  const [editingGoal, setEditingGoal] = useState<WorkoutGoal | undefined>()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchWorkouts()
      fetchGoals()
    }
  }, [user])

  const fetchWorkouts = async () => {
    const { data, error } = await supabase.from("workouts").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error fetching workouts:", error)
    } else {
      setWorkouts(data || [])
    }
  }

  const fetchGoals = async () => {
    const { data, error } = await supabase.from("workout_goals").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching goals:", error)
    } else {
      setGoals(data || [])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const deleteWorkout = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      const { error } = await supabase.from("workouts").delete().eq("id", id)

      if (error) {
        console.error("Error deleting workout:", error)
      } else {
        fetchWorkouts()
      }
    }
  }

  const deleteGoal = async (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      const { error } = await supabase.from("workout_goals").delete().eq("id", id)

      if (error) {
        console.error("Error deleting goal:", error)
      } else {
        fetchGoals()
      }
    }
  }

  const toggleGoalComplete = async (goal: WorkoutGoal) => {
    const { error } = await supabase.from("workout_goals").update({ completed: !goal.completed }).eq("id", goal.id)

    if (error) {
      console.error("Error updating goal:", error)
    } else {
      fetchGoals()
    }
  }

  const updateGoalProgress = async (goal: WorkoutGoal, newValue: number) => {
    const { error } = await supabase.from("workout_goals").update({ current_value: newValue }).eq("id", goal.id)

    if (error) {
      console.error("Error updating goal progress:", error)
    } else {
      fetchGoals()
    }
  }

  const activityIcons = {
    running: "🏃",
    climbing: "🧗",
    hiking: "🥾",
    snowboarding: "🏂",
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    hard: "bg-orange-100 text-orange-800",
    extreme: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Mountain className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Trail Tracker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Welcome, {user.email}</span>
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
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Mountain className="h-4 w-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Your Workouts</h2>
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
                        <span className="text-2xl">{activityIcons[workout.activity_type]}</span>
                        <div>
                          <CardTitle className="text-lg">{workout.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(workout.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
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
                      {workout.difficulty && (
                        <Badge className={difficultyColors[workout.difficulty]}>{workout.difficulty}</Badge>
                      )}
                      {workout.duration_minutes && <Badge variant="outline">{workout.duration_minutes}min</Badge>}
                      {workout.distance_miles && <Badge variant="outline">{workout.distance_miles}mi</Badge>}
                    </div>

                    {workout.location && <p className="text-sm text-slate-500">📍 {workout.location}</p>}

                    {workout.notes && <p className="text-sm text-slate-600 italic">{workout.notes}</p>}
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
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Fitness Goals</h2>
              <Button
                onClick={() => setShowGoalForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((goal) => {
                const progressPercentage = goal.target_value
                  ? Math.min((goal.current_value / goal.target_value) * 100, 100)
                  : 0

                return (
                  <Card
                    key={goal.id}
                    className={`hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm ${goal.completed ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleGoalComplete(goal)}
                          className="mt-0.5 h-6 w-6"
                        >
                          {goal.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400" />
                          )}
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🎯</span>
                            {goal.activity_type !== "general" && (
                              <span className="text-lg">
                                {activityIcons[goal.activity_type as keyof typeof activityIcons]}
                              </span>
                            )}
                            <h3
                              className={`font-semibold ${goal.completed ? "line-through text-slate-500" : "text-slate-800"}`}
                            >
                              {goal.title}
                            </h3>
                          </div>

                          {goal.description && <p className="text-sm text-slate-600 mb-2">{goal.description}</p>}

                          {goal.target_value && (
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>
                                  {goal.current_value} / {goal.target_value} {goal.target_unit}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateGoalProgress(goal, goal.current_value + 1)}
                                  disabled={goal.completed}
                                >
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  +1
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Badge variant="default">Goal</Badge>
                            {goal.target_date && (
                              <Badge variant="outline" className="text-xs">
                                📅 {new Date(goal.target_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingGoal(goal)
                              setShowGoalForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {goals.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No goals set yet</h3>
                <p className="text-slate-500 mb-4">Set some fitness goals and track your progress!</p>
                <Button
                  onClick={() => setShowGoalForm(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Set Your First Goal
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
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

      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowGoalForm(false)
            setEditingGoal(undefined)
          }}
          onSave={() => {
            fetchGoals()
            setEditingGoal(undefined)
          }}
        />
      )}
    </div>
  )
}
