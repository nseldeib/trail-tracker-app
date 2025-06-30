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

interface GoalFormProps {
  goal?: Todo
  onClose: () => void
  onSave: () => void
}

export default function GoalForm({ goal, onClose, onSave }: GoalFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    emoji: goal?.emoji || "🎯",
    due_date: goal?.due_date ? new Date(goal.due_date).toISOString().split("T")[0] : "",
    priority: goal?.priority || "medium",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const goalData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      // Don't set project_id since it expects UUID
    }

    try {
      if (goal) {
        const { error } = await supabase.from("todos").update(goalData).eq("id", goal.id)

        if (error) throw error
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No user found")

        const { error } = await supabase.from("todos").insert([{ ...goalData, user_id: user.id }])

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

  const goalOptions = [
    { value: "🎯", label: "🎯 General Goal" },
    { value: "🏆", label: "🏆 Achievement" },
    { value: "📚", label: "📚 Learning Goal" },
    { value: "💡", label: "💡 Idea/Project" },
    { value: "🌟", label: "🌟 Personal Goal" },
    { value: "🔥", label: "🔥 Challenge" },
    { value: "⚡", label: "⚡ Quick Task" },
    { value: "🚀", label: "🚀 Big Goal" },
  ]

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emoji">Goal Type</Label>
                <Select value={formData.emoji} onValueChange={(value) => setFormData({ ...formData, emoji: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Run a marathon, Learn a new skill"
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

            <div>
              <Label htmlFor="due_date">Target Date (optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
