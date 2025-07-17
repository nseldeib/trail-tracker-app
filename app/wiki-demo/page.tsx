"use client"

import WikiWidget from "@/components/wiki-widget"

export default function WikiDemoPage() {
  // Using a demo user ID for preview purposes
  const demoUserId = "demo-user-123"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Wiki Demo</h1>
          <p className="text-gray-600">
            A comprehensive knowledge management system with inline editing, filtering, and organization features.
          </p>
        </div>

        <WikiWidget userId={demoUserId} />
      </div>
    </div>
  )
}
