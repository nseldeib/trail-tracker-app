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
  const [formData, setFormData] = useState(() => {
    // Parse existing workout data if editing
    if (workout?.description) {
      const lines = workout.description.split("\n")
      let duration_hours = ""
      let duration_minutes = ""
      let distance = ""
      let distance_unit = "miles"
      let average_speed = ""
      let fastest_speed = ""
      const remaining_description = []

      for (const line of lines) {
        if (line.startsWith("Duration: ")) {
          const durationStr = line.replace("Duration: ", "")
          const hourMatch = durationStr.match(/(\d+)h/)
          const minuteMatch = durationStr.match(/(\d+)m/)
          if (hourMatch) duration_hours = hourMatch[1]
          if (minuteMatch) duration_minutes = minuteMatch[1]
        } else if (line.startsWith("Distance: ")) {
          const distanceStr = line.replace("Distance: ", "")
          const parts = distanceStr.split(" ")
          if (parts.length >= 2) {
            distance = parts[0]
            distance_unit = parts[1] === "km" ? "km" : "miles"
          }
        } else if (line.startsWith("Avg Speed: ")) {
          average_speed = line.replace("Avg Speed: ", "").split(" ")[0]
        } else if (line.startsWith("Max Speed: ")) {
          fastest_speed = line.replace("Max Speed: ", "").split(" ")[0]
        } else if (line.trim()) {
          remaining_description.push(line)
        }
      }

      return {
        emoji: workout.emoji || "🏃",
        title: workout.title || "",
        description: remaining_description.join("\n"),
        priority: workout.priority || "medium",
        due_date: workout.due_date
          ? new Date(workout.due_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        duration_hours,
        duration_minutes,
        distance,
        distance_unit,
        average_speed,
        fastest_speed,
      }
    }

    return {
      emoji: workout?.emoji || "🏃",
      title: workout?.title || "",
      description: workout?.description || "",
      priority: workout?.priority || "medium",
      due_date: workout?.due_date
        ? new Date(workout.due_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      duration_hours: "",
      duration_minutes: "",
      distance: "",
      distance_unit: "miles",
      average_speed: "",
      fastest_speed: "",
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Process workout metrics into description
    const workoutMetrics = []

    // Duration
    if (formData.duration_hours || formData.duration_minutes) {
      const hours = Number.parseInt(formData.duration_hours) || 0
      const minutes = Number.parseInt(formData.duration_minutes) || 0
      if (hours > 0 && minutes > 0) {
        workoutMetrics.push(`Duration: ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        workoutMetrics.push(`Duration: ${hours}h`)
      } else if (minutes > 0) {
        workoutMetrics.push(`Duration: ${minutes}m`)
      }
    }

    // Distance
    if (formData.distance) {
      workoutMetrics.push(`Distance: ${formData.distance} ${formData.distance_unit}`)
    }

    // Speed (for running/cycling)
    if (formData.average_speed && (formData.emoji === "🏃" || formData.emoji === "🚴")) {
      workoutMetrics.push(`Avg Speed: ${formData.average_speed} ${formData.distance_unit}/hr`)
    }

    if (formData.fastest_speed && (formData.emoji === "🏃" || formData.emoji === "🚴")) {
      workoutMetrics.push(`Max Speed: ${formData.fastest_speed} ${formData.distance_unit}/hr`)
    }

    // Combine metrics with existing description
    const combinedDescription = [...workoutMetrics, formData.description].filter(Boolean).join("\n")

    // Create workout data
    const workoutData = {
      emoji: formData.emoji,
      title: formData.title,
      description: combinedDescription,
      priority: formData.priority,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration_hours"
                    type="number"
                    min="0"
                    max="23"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    placeholder="Hours"
                  />
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="Minutes"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="distance">Distance</Label>
                <div className="flex gap-2">
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="0.0"
                  />
                  <Select
                    value={formData.distance_unit}
                    onValueChange={(value) => setFormData({ ...formData, distance_unit: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miles">Miles</SelectItem>
                      <SelectItem value="km">KM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Speed tracking for running activities */}
            {(formData.emoji === "🏃" || formData.emoji === "🚴") && formData.distance && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="average_speed">Average Speed ({formData.distance_unit}/hr)</Label>
                  <Input
                    id="average_speed"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.average_speed}
                    onChange={(e) => setFormData({ ...formData, average_speed: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="fastest_speed">Fastest Speed ({formData.distance_unit}/hr)</Label>
                  <Input
                    id="fastest_speed"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fastest_speed}
                    onChange={(e) => setFormData({ ...formData, fastest_speed: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            )}

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
