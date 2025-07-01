"use client"

import { useEffect, useState } from "react"
import { supabase, type Todo, WORKOUT_EMOJIS, GOAL_EMOJIS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Mountain, LogOut, CheckCircle, Circle, Target, Calendar, Star } from "lucide-react"
import Auth from "@/components/auth"
import WorkoutForm from "@/components/workout-form"
import GoalForm from "@/components/todo-form"
import type { User } from "@supabase/supabase-js"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<Todo[]>([])
  const [goals, setGoals] = useState<Todo[]>([])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Todo | undefined>()
  const [editingGoal, setEditingGoal] = useState<Todo | undefined>()

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

  const fetchGoals = async () => {
    // Filter by goal emojis to identify goals
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .in("emoji", GOAL_EMOJIS)
      .order("created_at", { ascending: false })

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
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        console.error("Error deleting workout:", error)
      } else {
        fetchWorkouts()
      }
    }
  }

  const deleteGoal = async (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        console.error("Error deleting goal:", error)
      } else {
        fetchGoals()
      }
    }
  }

  const toggleComplete = async (item: Todo, isWorkout = false) => {
    const { error } = await supabase.from("todos").update({ completed: !item.completed }).eq("id", item.id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      if (isWorkout) {
        fetchWorkouts()
      } else {
        fetchGoals()
      }
    }
  }

  const toggleStar = async (item: Todo, isWorkout = false) => {
    const { error } = await supabase.from("todos").update({ starred: !item.starred }).eq("id", item.id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      if (isWorkout) {
        fetchWorkouts()
      } else {
        fetchGoals()
      }
    }
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  // Check if goals section should show nature background
  const showNatureBackground = goals.length === 0 || goals.every((goal) => goal.completed)

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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleComplete(workout, true)}
                          className="h-6 w-6"
                        >
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
                        <Button variant="ghost" size="icon" onClick={() => toggleStar(workout, true)}>
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
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800">Goals & Todos</h2>
              <Button
                onClick={() => setShowGoalForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            {showNatureBackground ? (
              <div
                className="relative text-center py-24 rounded-xl overflow-hidden shadow-2xl"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/nature-background.png')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "500px",
                }}
              >
                <div className="relative z-10 text-white max-w-2xl mx-auto px-6">
                  <Target className="h-20 w-20 text-white/90 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4">
                    {goals.length === 0 ? "No goals set yet" : "All goals completed! 🎉"}
                  </h3>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    {goals.length === 0
                      ? "Set some fitness goals and track your progress in this beautiful space! Let nature inspire your next adventure."
                      : "Amazing work! You've completed all your goals. Time to set new challenges and reach new heights!"}
                  </p>
                  <Button
                    onClick={() => setShowGoalForm(true)}
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 text-lg px-8 py-3"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    {goals.length === 0 ? "Set Your First Goal" : "Set New Goals"}
                  </Button>
                </div>

                {/* Nature Photo Credit */}
                <div className="absolute bottom-6 right-6 text-white/70 text-sm bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                  📸 Nature Photo of the Day
                </div>

                {/* Decorative elements */}
                <div className="absolute top-8 left-8 text-white/30 text-6xl">🏔️</div>
                <div className="absolute bottom-20 left-12 text-white/30 text-4xl">🌲</div>
                <div className="absolute top-16 right-16 text-white/30 text-5xl">☀️</div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm ${goal.completed ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleComplete(goal)}
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
                            <span className="text-lg">{goal.emoji || "🎯"}</span>
                            <h3
                              className={`font-semibold ${goal.completed ? "line-through text-slate-500" : "text-slate-800"}`}
                            >
                              {goal.title}
                            </h3>
                            {goal.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>

                          {goal.description && <p className="text-sm text-slate-600 mb-2">{goal.description}</p>}

                          <div className="flex items-center gap-2 flex-wrap">
                            {goal.priority && (
                              <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                                {goal.priority}
                              </Badge>
                            )}
                            {goal.due_date && (
                              <Badge variant="outline" className="text-xs">
                                📅 {new Date(goal.due_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleStar(goal)}>
                            <Star
                              className={`h-4 w-4 ${goal.starred ? "text-yellow-500 fill-current" : "text-slate-400"}`}
                            />
                          </Button>
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
                ))}
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
