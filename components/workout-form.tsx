"use client"

import type React from "react"

import { useState } from "react"
import { supabase, type Todo } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save } from "lucide-react"

interface WorkoutFormProps {
  workout?: Todo
  onClose: () => void
  onSave: () => void
}

export default function WorkoutForm({ workout, onClose, onSave }: WorkoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    emoji: workout?.emoji || "🏃",
    title: workout?.title || "",
    description: workout?.description || "",
    priority: workout?.priority || "medium",
    due_date: workout?.due_date
      ? new Date(workout.due_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Create workout data - we'll use emoji to identify workouts vs goals
    const workoutData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      // Don't set project_id since it expects UUID
    }

    try {
      if (workout) {
        const { error } = await supabase.from("todos").update(workoutData).eq("id", workout.id)

        if (error) throw error
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found")

        const { error } = await supabase.from("todos").insert([{ ...workoutData, user_id: user.id }])

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

  const activityOptions = [
    { value: "🏃", label: "🏃 Running" },
    { value: "🧗", label: "🧗 Climbing" },
    { value: "🥾", label: "🥾 Hiking" },
    { value: "🏂", label: "🏂 Snowboarding" },
    { value: "🚴", label: "🚴 Cycling" },
    { value: "🏊", label: "🏊 Swimming" },
    { value: "💪", label: "💪 Strength Training" },
    { value: "🧘", label: "🧘 Yoga" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{formData.emoji}</span>
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
                <Label htmlFor="emoji">Activity Type</Label>
                <Select value={formData.emoji} onValueChange={(value) => setFormData({ ...formData, emoji: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="due_date">Workout Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Workout Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning trail run, Rock climbing session"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Workout Details</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Duration, distance, location, notes, difficulty level..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="priority">Intensity/Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Intensity</SelectItem>
                  <SelectItem value="medium">Medium Intensity</SelectItem>
                  <SelectItem value="high">High Intensity</SelectItem>
                </SelectContent>
              </Select>
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
