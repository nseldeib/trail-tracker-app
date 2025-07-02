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
    // Parse existing description to extract structured data
    let mileage = ""
    let location = ""
    let cleanDescription = workout?.description || ""

    if (workout?.description) {
      // Extract mileage (look for patterns like "5 miles", "3.2 mi", etc.)
      const mileageMatch = workout.description.match(/(\d+\.?\d*)\s*(miles?|mi)/i)
      if (mileageMatch) {
        mileage = mileageMatch[1]
        cleanDescription = cleanDescription.replace(mileageMatch[0], "").trim()
      }

      // Extract location (look for "Location:" or "At:" patterns)
      const locationMatch = workout.description.match(/(?:Location|At):\s*([^\n,]+)/i)
      if (locationMatch) {
        location = locationMatch[1].trim()
        cleanDescription = cleanDescription.replace(locationMatch[0], "").trim()
      }
    }

    return {
      emoji: workout?.emoji || "🏃",
      title: workout?.title || "",
      description: cleanDescription,
      priority: workout?.priority || "medium",
      due_date: workout?.due_date
        ? new Date(workout.due_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      mileage,
      location,
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Build description with structured data
    let combinedDescription = formData.description

    // Add mileage if provided
    if (formData.mileage) {
      const mileageText = `${formData.mileage} miles`
      combinedDescription = combinedDescription ? `${combinedDescription}\n${mileageText}` : mileageText
    }

    // Add location if provided
    if (formData.location) {
      const locationText = `Location: ${formData.location}`
      combinedDescription = combinedDescription ? `${combinedDescription}\n${locationText}` : locationText
    }

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
                placeholder="Duration, notes, difficulty level, weather conditions..."
                rows={3}
              />
            </div>

            {/* Add hiking-specific fields */}
            {(formData.emoji === "🥾" || formData.emoji === "🏃") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Distance (miles)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    step="0.1"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    placeholder="e.g., 5.2"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Blue Ridge Trail, Central Park"
                  />
                </div>
              </div>
            )}

            {/* Show location field for other activities too */}
            {formData.emoji !== "🥾" && formData.emoji !== "🏃" && (
              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where did this workout take place?"
                />
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
