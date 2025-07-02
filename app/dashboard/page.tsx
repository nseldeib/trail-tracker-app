"use client"

import { useEffect, useState } from "react"
import { supabase, type Todo, WORKOUT_EMOJIS, GOAL_EMOJIS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mountain, LogOut, Target, Calendar, TrendingUp, Plus, ArrowRight, CheckCircle, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import DailyCheckin from "@/components/daily-checkin"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<Todo[]>([])
  const [goals, setGoals] = useState<Todo[]>([])
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
      fetchRecentData()
    }
  }, [user])

  const fetchRecentData = async () => {
    // Fetch recent workouts
    const { data: workoutData } = await supabase
      .from("todos")
      .select("*")
      .in("emoji", WORKOUT_EMOJIS)
      .order("due_date", { ascending: false })
      .limit(3)

    // Fetch recent goals
    const { data: goalData } = await supabase
      .from("todos")
      .select("*")
      .in("emoji", GOAL_EMOJIS)
      .order("created_at", { ascending: false })
      .limit(3)

    setWorkouts(workoutData || [])
    setGoals(goalData || [])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Calculate stats
  const completedWorkouts = workouts.filter((w) => w.completed).length
  const completedGoals = goals.filter((g) => g.completed).length
  const totalWorkouts = workouts.length
  const totalGoals = goals.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
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
                <Link href="/dashboard" className="text-emerald-600 font-medium border-b-2 border-emerald-600 pb-1">
                  Dashboard
                </Link>
                <Link href="/dashboard/workouts" className="text-slate-600 hover:text-emerald-600 transition-colors">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back!</h2>
          <p className="text-slate-600">Here's an overview of your fitness journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Workouts</p>
                  <p className="text-3xl font-bold text-slate-800">{totalWorkouts}</p>
                </div>
                <Activity className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed Workouts</p>
                  <p className="text-3xl font-bold text-slate-800">{completedWorkouts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Goals</p>
                  <p className="text-3xl font-bold text-slate-800">{totalGoals}</p>
                </div>
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed Goals</p>
                  <p className="text-3xl font-bold text-slate-800">{completedGoals}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Check-in */}
        <div className="mb-8">
          <DailyCheckin userId={user.id} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Track a Workout</h3>
                  <p className="text-emerald-100 mb-4">Log your latest outdoor adventure</p>
                  <Link href="/dashboard/workouts">
                    <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workout
                    </Button>
                  </Link>
                </div>
                <Mountain className="h-16 w-16 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Set a Goal</h3>
                  <p className="text-teal-100 mb-4">Define your next fitness milestone</p>
                  <Link href="/dashboard/goals">
                    <Button className="bg-white text-teal-600 hover:bg-teal-50">
                      <Target className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </Link>
                </div>
                <Target className="h-16 w-16 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-emerald-600" />
                  Recent Workouts
                </CardTitle>
                <CardDescription>Your latest outdoor activities</CardDescription>
              </div>
              <Link href="/dashboard/workouts">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {workouts.length > 0 ? (
                workouts.slice(0, 3).map((workout) => (
                  <div key={workout.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <span className="text-xl">{workout.emoji || "🏃"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{workout.title}</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {workout.due_date ? new Date(workout.due_date).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    {workout.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Mountain className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No workouts yet</p>
                  <Link href="/dashboard/workouts">
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Add your first workout
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Goals */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Recent Goals
                </CardTitle>
                <CardDescription>Your fitness objectives</CardDescription>
              </div>
              <Link href="/dashboard/goals">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.length > 0 ? (
                goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <span className="text-xl">{goal.emoji || "🎯"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {goal.priority && (
                          <Badge
                            variant="outline"
                            className={
                              goal.priority === "high"
                                ? "text-red-600 border-red-200"
                                : goal.priority === "medium"
                                  ? "text-yellow-600 border-yellow-200"
                                  : "text-blue-600 border-blue-200"
                            }
                          >
                            {goal.priority}
                          </Badge>
                        )}
                        {goal.due_date && (
                          <span className="text-xs text-slate-500">
                            Due {new Date(goal.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {goal.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No goals yet</p>
                  <Link href="/dashboard/goals">
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Set your first goal
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
