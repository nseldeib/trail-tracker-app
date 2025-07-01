"use client"

import { useEffect, useState } from "react"
import { getDailyNaturePhoto } from "@/lib/unsplash"
import { Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NatureBackgroundProps {
  goals: any[]
  onAddGoal: () => void
}

export default function NatureBackground({ goals, onAddGoal }: NatureBackgroundProps) {
  const [photo, setPhoto] = useState<{ url: string; description: string; photographer: string } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Get today's nature photo
    const dailyPhoto = getDailyNaturePhoto()
    setPhoto(dailyPhoto)
  }, [])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    // Fallback to a solid gradient if image fails to load
    setPhoto({
      url: "",
      description: "Mountain landscape",
      photographer: "Nature",
    })
    setImageLoaded(true)
  }

  if (!photo) {
    return (
      <div className="relative text-center py-24 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 min-h-[500px] flex items-center justify-center">
        <div className="text-white">Loading today's nature photo...</div>
      </div>
    )
  }

  return (
    <div className="relative text-center py-24 rounded-xl overflow-hidden shadow-2xl min-h-[500px] flex items-center justify-center">
      {/* Background Image */}
      {photo.url && (
        <>
          <img
            src={photo.url || "/placeholder.svg"}
            alt={photo.description}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </>
      )}

      {/* Fallback gradient background */}
      {!photo.url && <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />}

      {/* Content */}
      <div className="relative z-10 text-white max-w-2xl mx-auto px-6">
        <Target className="h-20 w-20 text-white/90 mx-auto mb-6 drop-shadow-lg" />
        <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">
          {goals.length === 0 ? "No goals set yet" : "All goals completed! 🎉"}
        </h3>
        <p className="text-xl text-white/95 mb-8 leading-relaxed drop-shadow-md">
          {goals.length === 0
            ? "Set some fitness goals and track your progress in this beautiful space! Let nature inspire your next adventure."
            : "Amazing work! You've completed all your goals. Time to set new challenges and reach new heights!"}
        </p>
        <Button
          onClick={onAddGoal}
          size="lg"
          className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 text-lg px-8 py-3 drop-shadow-lg"
        >
          <Plus className="h-5 w-5 mr-3" />
          {goals.length === 0 ? "Set Your First Goal" : "Set New Goals"}
        </Button>
      </div>

      {/* Photo Credit */}
      <div className="absolute bottom-6 right-6 text-white/80 text-sm bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 drop-shadow-md">
        📸 Photo by {photo.photographer} • Daily Nature
      </div>

      {/* Decorative elements with better positioning */}
      <div className="absolute top-8 left-8 text-white/20 text-6xl drop-shadow-lg">🏔️</div>
      <div className="absolute bottom-20 left-12 text-white/20 text-4xl drop-shadow-lg">🌲</div>
      <div className="absolute top-16 right-16 text-white/20 text-5xl drop-shadow-lg">☀️</div>

      {/* Additional decorative elements */}
      <div className="absolute top-1/3 left-1/4 text-white/15 text-3xl drop-shadow-lg">🦅</div>
      <div className="absolute bottom-1/3 right-1/4 text-white/15 text-3xl drop-shadow-lg">🌿</div>
    </div>
  )
}
