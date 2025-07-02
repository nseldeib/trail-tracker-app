"use client"

import { useEffect, useState } from "react"
import { supabase, type Todo, GOAL_EMOJIS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Trash2,
  Mountain,
  LogOut,
  CheckCircle,
  Circle,
  Target,
  Calendar,
  Star,
  RefreshCw,
} from "lucide-react"
import GoalForm from "@/components/todo-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export default function GoalsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Todo[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Todo | undefined>()
  const [dailyPhoto, setDailyPhoto] = useState<string>("")
  const [photoLoading, setPhotoLoading] = useState(false)
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
      fetchGoals()
      fetchDailyPhoto()
    }
  }, [user])

  const fetchDailyPhoto = async () => {
    setPhotoLoading(true)
    try {
      // Use a more reliable approach with multiple fallbacks
      const today = new Date().toISOString().split("T")[0]
      const seed = today.replace(/-/g, "")

      // Try multiple image services as fallbacks
      const imageOptions = [
        `https://picsum.photos/seed/${seed}/1200/800`,
        `https://source.unsplash.com/1200x800/?nature,landscape&${seed}`,
        `/placeholder.svg?height=800&width=1200&query=mountain landscape`,
      ]

      // Test the first image URL
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        setDailyPhoto(imageOptions[0])
        setPhotoLoading(false)
      }

      img.onerror = () => {
        // Fallback to a gradient background if images fail
        setDailyPhoto("")
        setPhotoLoading(false)
      }

      img.src = imageOptions[0]
    } catch (error) {
      console.error("Error fetching daily photo:", error)
      setDailyPhoto("")
      setPhotoLoading(false)
    }
  }

  const fetchGoals = async () => {
    try {
      // Filter by goal emojis to identify goals
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .in("emoji", GOAL_EMOJIS)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching goals:", error)
        return
      }

      setGoals(data || [])
    } catch (error) {
      console.error("Error fetching goals:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
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

  const toggleComplete = async (item: Todo) => {
    const { error } = await supabase.from("todos").update({ completed: !item.completed }).eq("id", item.id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      fetchGoals()
    }
  }

  const toggleStar = async (item: Todo) => {
    const { error } = await supabase.from("todos").update({ starred: !item.starred }).eq("id", item.id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      fetchGoals()
    }
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  // Check if all goals are completed
  const allGoalsCompleted = goals.length > 0 && goals.every((goal) => goal.completed)
  const showNatureBackground = goals.length === 0 || allGoalsCompleted

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading your goals...</p>
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
                <Link href="/dashboard/workouts" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Workouts
                </Link>
                <Link
                  href="/dashboard/goals"
                  className="text-emerald-600 font-medium border-b-2 border-emerald-600 pb-1"
                >
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
            <h2 className="text-3xl font-bold text-slate-800">Goals & Todos</h2>
            <p className="text-slate-600 mt-1">Set and track your fitness objectives</p>
          </div>
          <div className="flex gap-2">
            {showNatureBackground && (
              <Button variant="outline" size="sm" onClick={fetchDailyPhoto} disabled={photoLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${photoLoading ? "animate-spin" : ""}`} />
                New Photo
              </Button>
            )}
            <Button
              onClick={() => setShowGoalForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Goals with nature background when empty or all completed */}
        <div className={`relative ${showNatureBackground ? "min-h-[600px]" : ""}`}>
          {showNatureBackground && (
            <div
              className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                dailyPhoto
                  ? "bg-cover bg-center bg-no-repeat"
                  : "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"
              }`}
              style={dailyPhoto ? { backgroundImage: `url(${dailyPhoto})` } : {}}
            >
              <div className="absolute inset-0 bg-black/20 rounded-xl" />
              {photoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                  <div className="bg-white/90 rounded-lg p-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={`relative z-10 ${showNatureBackground ? "p-8" : ""}`}>
            {!showNatureBackground && (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm ${goal.completed ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleComplete(goal)}
                          className="mt-1 h-8 w-8 shrink-0"
                        >
                          {goal.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400" />
                          )}
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{goal.emoji || "🎯"}</span>
                            <h3
                              className={`text-lg font-semibold ${goal.completed ? "line-through text-slate-500" : "text-slate-800"}`}
                            >
                              {goal.title}
                            </h3>
                            {goal.starred && <Star className="h-4 w-4 text-yellow-500 fill-current ml-2" />}
                          </div>

                          {goal.description && (
                            <p className="text-sm text-slate-600 mb-3 leading-relaxed">{goal.description}</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {goal.priority && (
                              <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                                {goal.priority} priority
                              </Badge>
                            )}
                            {goal.due_date && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(goal.due_date).toLocaleDateString()}
                              </Badge>
                            )}
                            {goal.completed && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
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

            {showNatureBackground && (
              <div className="text-center py-12">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-xl border border-white/20">
                  {goals.length === 0 ? (
                    <>
                      <Target className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">No goals set yet</h3>
                      <p className="text-slate-600 mb-6">Set some fitness goals and track your progress!</p>
                      <Button
                        onClick={() => setShowGoalForm(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Set Your First Goal
                      </Button>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">All Goals Completed! 🎉</h3>
                      <p className="text-slate-600 mb-6">
                        Amazing work! You've completed all your goals. Time to set new ones!
                      </p>
                      <Button
                        onClick={() => setShowGoalForm(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Set New Goals
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Forms */}
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
