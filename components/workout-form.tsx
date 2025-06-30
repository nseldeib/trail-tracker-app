"use client"

import type React from "react"

import { useState } from "react"
import { supabase, type ActivityType, type Difficulty, type Workout } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save } from "lucide-react"

interface WorkoutFormProps {
  workout?: Workout
  onClose: () => void
  onSave: () => void
}

export default function WorkoutForm({ workout, onClose, onSave }: WorkoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    activity_type: workout?.activity_type || ("running" as ActivityType),
    title: workout?.title || "",
    description: workout?.description || "",
    duration_minutes: workout?.duration_minutes?.toString() || "",
    distance_miles: workout?.distance_miles?.toString() || "",
    difficulty: workout?.difficulty || ("moderate" as Difficulty),
    location: workout?.location || "",
    notes: workout?.notes || "",
    date: workout?.date || new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const workoutData = {
      ...formData,
      duration_minutes: formData.duration_minutes ? Number.parseInt(formData.duration_minutes) : null,
      distance_miles: formData.distance_miles ? Number.parseFloat(formData.distance_miles) : null,
    }

    try {
      if (workout) {
        const { error } = await supabase.from("workouts").update(workoutData).eq("id", workout.id)

        if (error) throw error
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found")

        const { error } = await supabase.from("workouts").insert([{ ...workoutData, user_id: user.id }])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving workout:", error)
      alert("Error saving workout")
    } finally {
      setLoading(false)
    }
  }

  const activityIcons = {
    running: "🏃",
    climbing: "🧗",
    hiking: "🥾",
    snowboarding: "🏂",
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{activityIcons[formData.activity_type]}</span>
            {workout ? "Edit Workout" : "Add New Workout"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity_type">Activity Type</Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value: ActivityType) => setFormData({ ...formData, activity_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">🏃 Running</SelectItem>
                    <SelectItem value="climbing">🧗 Climbing</SelectItem>
                    <SelectItem value="hiking">🥾 Hiking</SelectItem>
                    <SelectItem value="snowboarding">🏂 Snowboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning trail run"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your workout"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="60"
                />
              </div>
              <div>
                <Label htmlFor="distance">Distance (miles)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={formData.distance_miles}
                  onChange={(e) => setFormData({ ...formData, distance_miles: e.target.value })}
                  placeholder="5.0"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: Difficulty) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Rocky Mountain National Park"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about your workout"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Workout"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
