"use client"

import { useEffect, useState } from "react"
import { supabase, type Todo, type Profile } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Target, Trophy, TrendingUp, Plus, Dumbbell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DailyCheckin from "@/components/daily-checkin"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workouts, setWorkouts] = useState<Todo[]>([])
  const [goals, setGoals] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/signin")
      return
    }

    setUser(user)
    await Promise.all([fetchProfile(user.id), fetchWorkouts(user.id), fetchGoals(user.id)])
    setLoading(false)
  }

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (data) {
      setProfile(data)
    }
  }

  const fetchWorkouts = async (userId: string) => {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .in("emoji", ["🏃", "🧗", "🥾", "🏂", "🚴", "🏊", "💪", "🧘"])
      .order("created_at", { ascending: false })
      .limit(5)

    if (data) {
      setWorkouts(data)
    }
  }

  const fetchGoals = async (userId: string) => {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .in("emoji", ["🎯", "🏆", "📚", "💡", "🌟", "🔥", "⚡", "🚀"])
      .order("created_at", { ascending: false })
      .limit(5)

    if (data) {
      setGoals(data)
    }
  }

  const getCompletionRate = (items: Todo[]) => {
    if (items.length === 0) return 0
    const completed = items.filter((item) => item.completed).length
    return Math.round((completed / items.length) * 100)
  }

  const getStreakDays = () => {
    // Simple mock streak calculation
    return Math.floor(Math.random() * 15) + 1
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
          </h1>
          <p className="text-slate-600">Here's your fitness journey overview</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Daily Check-in */}
          <div className="lg:col-span-1">{user && <DailyCheckin userId={user.id} />}</div>

          {/* Right Column - Stats and Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Current Streak</p>
                      <p className="text-2xl font-bold text-emerald-600">{getStreakDays()} days</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Workout Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{getCompletionRate(workouts)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Goals Progress</p>
                      <p className="text-2xl font-bold text-purple-600">{getCompletionRate(goals)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Tabs defaultValue="workouts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workouts" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Recent Workouts
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Active Goals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workouts" className="space-y-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Workouts</CardTitle>
                      <CardDescription>Your latest training sessions</CardDescription>
                    </div>
                    <Link href="/dashboard/workouts">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Workout
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workouts.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No workouts yet. Start your fitness journey!</p>
                        <Link href="/dashboard/workouts">
                          <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700">Add Your First Workout</Button>
                        </Link>
                      </div>
                    ) : (
                      workouts.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{workout.emoji}</span>
                            <div>
                              <p className="font-medium text-slate-900">{workout.title}</p>
                              {workout.description && <p className="text-sm text-slate-600">{workout.description}</p>}
                            </div>
                          </div>
                          <Badge variant={workout.completed ? "default" : "secondary"}>
                            {workout.completed ? "Completed" : "Planned"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals" className="space-y-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Active Goals</CardTitle>
                      <CardDescription>Your current fitness objectives</CardDescription>
                    </div>
                    <Link href="/dashboard/goals">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Goal
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {goals.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No goals set yet. Define your targets!</p>
                        <Link href="/dashboard/goals">
                          <Button className="mt-3 bg-purple-600 hover:bg-purple-700">Set Your First Goal</Button>
                        </Link>
                      </div>
                    ) : (
                      goals.map((goal) => (
                        <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{goal.emoji}</span>
                              <div>
                                <p className="font-medium text-slate-900">{goal.title}</p>
                                {goal.description && <p className="text-sm text-slate-600">{goal.description}</p>}
                              </div>
                            </div>
                            <Badge variant={goal.completed ? "default" : "secondary"}>
                              {goal.completed ? "Achieved" : "In Progress"}
                            </Badge>
                          </div>
                          {goal.due_date && (
                            <p className="text-xs text-slate-500">
                              Target: {new Date(goal.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/workouts">
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold">Log Workout</h3>
                <p className="text-sm opacity-90">Track your training session</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/goals">
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold">Set Goal</h3>
                <p className="text-sm opacity-90">Define your next target</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white cursor-pointer">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">View Progress</h3>
              <p className="text-sm opacity-90">See your achievements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
