"use client"

import type React from "react"

import { useState } from "react"
import { supabase, type ActivityType, type WorkoutGoal } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save } from "lucide-react"

interface GoalFormProps {
  goal?: WorkoutGoal
  onClose: () => void
  onSave: () => void
}

export default function GoalForm({ goal, onClose, onSave }: GoalFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    activity_type: goal?.activity_type || ("general" as ActivityType | "general"),
    target_value: goal?.target_value?.toString() || "",
    target_unit: goal?.target_unit || "sessions",
    target_date: goal?.target_date || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const goalData = {
      ...formData,
      target_value: formData.target_value ? Number.parseFloat(formData.target_value) : null,
    }

    try {
      if (goal) {
        const { error } = await supabase.from("workout_goals").update(goalData).eq("id", goal.id)

        if (error) throw error
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found")

        const { error } = await supabase.from("workout_goals").insert([{ ...goalData, user_id: user.id }])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving goal:", error)
      alert("Error saving goal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{goal ? "Edit Goal" : "Add New Goal"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="activity_type">Activity Category</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value: ActivityType | "general") => setFormData({ ...formData, activity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">🎯 General Fitness</SelectItem>
                  <SelectItem value="running">🏃 Running</SelectItem>
                  <SelectItem value="climbing">🧗 Climbing</SelectItem>
                  <SelectItem value="hiking">🥾 Hiking</SelectItem>
                  <SelectItem value="snowboarding">🏂 Snowboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Run a marathon, Climb 5.10 route"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about your goal..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.1"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder="26.2"
                />
              </div>
              <div>
                <Label htmlFor="target_unit">Unit</Label>
                <Select
                  value={formData.target_unit}
                  onValueChange={(value) => setFormData({ ...formData, target_unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="kilometers">Kilometers</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="target_date">Target Date (optional)</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Goal"}
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
