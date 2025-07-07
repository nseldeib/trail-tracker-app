"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase, type Todo, EMOTION_OPTIONS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Heart, Save, Edit, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DailyCheckinProps {
  userId: string
}

export default function DailyCheckinSimple({ userId }: DailyCheckinProps) {
  const [checkin, setCheckin] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    score: 5,
    notes: "",
    emotions: [] as string[],
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchTodaysCheckin()
  }, [userId])

  const fetchTodaysCheckin = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId)
        .eq("emoji", "❤️")
        .eq("due_date", today)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching check-in:", error)
        return
      }

      if (data) {
        setCheckin(data)
        // Parse the description to get score, notes, and emotions
        const description = data.description || ""
        const parts = description.split("|")
        const score = Number.parseInt(parts[0]) || 5
        const notes = parts[1] || ""
        const emotions = parts[2] ? parts[2].split(",") : []

        setFormData({
          score,
          notes,
          emotions,
        })
      } else {
        // No check-in for today, start editing
        setEditing(true)
      }
    } catch (error) {
      console.error("Error fetching check-in:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const today = new Date().toISOString().split("T")[0]
      const description = `${formData.score}|${formData.notes}|${formData.emotions.join(",")}`

      const checkinData = {
        user_id: userId,
        title: `Daily Check-in - ${new Date().toLocaleDateString()}`,
        description,
        emoji: "❤️",
        due_date: today,
        completed: true,
        priority: "medium",
      }

      if (checkin) {
        // Update existing check-in
        const { data, error } = await supabase.from("todos").update(checkinData).eq("id", checkin.id).select().single()

        if (error) {
          console.error("Error updating check-in:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to update check-in",
            variant: "destructive",
          })
          return
        }

        setCheckin(data)
      } else {
        // Create new check-in
        const { data, error } = await supabase.from("todos").insert([checkinData]).select().single()

        if (error) {
          console.error("Error creating check-in:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to save check-in",
            variant: "destructive",
          })
          return
        }

        setCheckin(data)
      }

      setEditing(false)
      toast({
        title: "Success",
        description: checkin ? "Check-in updated!" : "Check-in saved!",
      })
    } catch (error) {
      console.error("Error saving check-in:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleEmotion = (emotion: string) => {
    setFormData((prev) => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter((e) => e !== emotion)
        : [...prev.emotions, emotion],
    }))
  }

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-600"
    if (score <= 6) return "text-yellow-600"
    return "text-green-600"
  }

  const getScoreLabel = (score: number) => {
    if (score <= 2) return "Poor"
    if (score <= 4) return "Below Average"
    if (score <= 6) return "Average"
    if (score <= 8) return "Good"
    return "Excellent"
  }

  if (!editing && checkin) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle className="text-lg">Today's Check-in</CardTitle>
              <CardDescription>How you're feeling today</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(formData.score)}`}>{formData.score}/10</div>
              <div className="text-sm text-slate-600">{getScoreLabel(formData.score)}</div>
            </div>
            {formData.emotions && formData.emotions.length > 0 && (
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {formData.emotions.map((emotion) => {
                    const emotionOption = EMOTION_OPTIONS.find((e) => e.value === emotion)
                    return (
                      <Badge key={emotion} className={emotionOption?.color || "bg-gray-100 text-gray-800"}>
                        {emotionOption?.label || emotion}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          {formData.notes && (
            <div>
              <p className="text-sm text-slate-600 italic">"{formData.notes}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          {checkin ? "Update Today's Check-in" : "How are you feeling today?"}
        </CardTitle>
        <CardDescription>Rate your overall well-being and track your emotions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-medium">Overall Score (1-10)</Label>
            <div className="mt-2 space-y-3">
              <Slider
                value={[formData.score]}
                onValueChange={(value) => setFormData({ ...formData, score: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>1 - Poor</span>
                <span className={`font-medium ${getScoreColor(formData.score)}`}>
                  {formData.score}/10 - {getScoreLabel(formData.score)}
                </span>
                <span>10 - Excellent</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">How are you feeling? (Select all that apply)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EMOTION_OPTIONS.map((emotion) => (
                <Button
                  key={emotion.value}
                  type="button"
                  variant={formData.emotions.includes(emotion.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleEmotion(emotion.value)}
                  className={`justify-start text-left h-auto py-2 px-3 ${
                    formData.emotions.includes(emotion.value)
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {emotion.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional thoughts about how you're feeling today..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : checkin ? "Update Check-in" : "Save Check-in"}
            </Button>
            {checkin && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false)
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
