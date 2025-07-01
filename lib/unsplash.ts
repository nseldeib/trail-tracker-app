// Unsplash API integration for nature photos
const UNSPLASH_ACCESS_KEY = "demo" // In production, you'd use a real API key
const UNSPLASH_API_URL = "https://api.unsplash.com"

export interface UnsplashPhoto {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
  }
  description: string | null
  alt_description: string | null
}

// Get a deterministic photo based on the current date
export function getDailyPhotoSeed(): string {
  const today = new Date()
  const dateString = today.toISOString().split("T")[0] // YYYY-MM-DD format
  return dateString
}

// Fallback nature photos for when API is unavailable
const FALLBACK_NATURE_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
    description: "Mountain landscape with lake reflection",
    photographer: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
    description: "Forest path through tall trees",
    photographer: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop",
    description: "Mountain peak with clouds",
    photographer: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
    description: "Serene lake surrounded by mountains",
    photographer: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop",
    description: "Alpine meadow with wildflowers",
    photographer: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop",
    description: "Misty forest landscape",
    photographer: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=1200&h=800&fit=crop",
    description: "Snow-capped mountain range",
    photographer: "Unsplash",
  },
]

// Get daily nature photo with fallback
export function getDailyNaturePhoto(): { url: string; description: string; photographer: string } {
  const seed = getDailyPhotoSeed()

  // Create a simple hash from the date string to get consistent daily selection
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get array index
  const index = Math.abs(hash) % FALLBACK_NATURE_PHOTOS.length
  return FALLBACK_NATURE_PHOTOS[index]
}

// Fetch from Unsplash API (for future enhancement)
export async function fetchUnsplashNaturePhoto(): Promise<UnsplashPhoto | null> {
  try {
    // For demo purposes, we'll use the fallback photos
    // In production, you would implement the actual API call:
    /*
    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?query=nature,mountain,forest,landscape&orientation=landscape&w=1200&h=800`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash')
    }
    
    return await response.json()
    */

    return null
  } catch (error) {
    console.error("Error fetching from Unsplash:", error)
    return null
  }
}

// Get optimized image URL with parameters
export function getOptimizedImageUrl(baseUrl: string, width = 1200, height = 800): string {
  // Add Unsplash optimization parameters
  const url = new URL(baseUrl)
  url.searchParams.set("w", width.toString())
  url.searchParams.set("h", height.toString())
  url.searchParams.set("fit", "crop")
  url.searchParams.set("crop", "entropy")
  return url.toString()
}
