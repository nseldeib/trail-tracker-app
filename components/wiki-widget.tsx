"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase, type WikiEntry, WIKI_CATEGORIES, WIKI_STATUS_OPTIONS, WIKI_PRIORITY_OPTIONS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  StarOff,
  Globe,
  Lock,
  Filter,
  Search,
  Upload,
  ExternalLink,
  Calendar,
  Tag,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WikiWidgetProps {
  userId: string
}

export default function WikiWidget({ userId }: WikiWidgetProps) {
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [editingEntries, setEditingEntries] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterVisibility, setFilterVisibility] = useState<string>("all")
  const [filterTag, setFilterTag] = useState<string>("all")

  // Form states for editing
  const [editForms, setEditForms] = useState<Record<string, Partial<WikiEntry>>>({})

  useEffect(() => {
    fetchEntries()
  }, [userId])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("wiki_entries")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error fetching wiki entries:", error)
      toast({
        title: "Error",
        description: "Failed to load wiki entries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createEntry = async () => {
    const newEntry = {
      user_id: userId,
      title: "New Entry",
      summary: "",
      content: "",
      tags: [],
      category: "General",
      status: "draft" as const,
      priority: "medium" as const,
      is_public: false,
      rating: null,
      related_links: [],
    }

    try {
      const { data, error } = await supabase.from("wiki_entries").insert([newEntry]).select().single()

      if (error) throw error

      setEntries([data, ...entries])
      setExpandedEntries(new Set([data.id]))
      setEditingEntries(new Set([data.id]))
      setEditForms({ [data.id]: { ...data } })

      toast({
        title: "Success",
        description: "New entry created",
      })
    } catch (error) {
      console.error("Error creating entry:", error)
      toast({
        title: "Error",
        description: "Failed to create entry",
        variant: "destructive",
      })
    }
  }

  const updateEntry = async (entryId: string) => {
    const formData = editForms[entryId]
    if (!formData) return

    try {
      const { error } = await supabase
        .from("wiki_entries")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)

      if (error) throw error

      setEntries(
        entries.map((entry) =>
          entry.id === entryId ? { ...entry, ...formData, updated_at: new Date().toISOString() } : entry,
        ),
      )

      setEditingEntries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(entryId)
        return newSet
      })

      setEditForms((prev) => {
        const newForms = { ...prev }
        delete newForms[entryId]
        return newForms
      })

      toast({
        title: "Success",
        description: "Entry updated",
      })
    } catch (error) {
      console.error("Error updating entry:", error)
      toast({
        title: "Error",
        description: "Failed to update entry",
        variant: "destructive",
      })
    }
  }

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase.from("wiki_entries").delete().eq("id", entryId)

      if (error) throw error

      setEntries(entries.filter((entry) => entry.id !== entryId))
      setExpandedEntries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(entryId)
        return newSet
      })

      toast({
        title: "Success",
        description: "Entry deleted",
      })
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    }
  }

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const startEditing = (entry: WikiEntry) => {
    setEditingEntries((prev) => new Set([...prev, entry.id]))
    setEditForms((prev) => ({ ...prev, [entry.id]: { ...entry } }))
  }

  const cancelEditing = (entryId: string) => {
    setEditingEntries((prev) => {
      const newSet = new Set(prev)
      newSet.delete(entryId)
      return newSet
    })
    setEditForms((prev) => {
      const newForms = { ...prev }
      delete newForms[entryId]
      return newForms
    })
  }

  const updateFormField = (entryId: string, field: keyof WikiEntry, value: any) => {
    setEditForms((prev) => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [field]: value,
      },
    }))
  }

  // Get all unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [entries])

  // Filter entries based on search and filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          entry.title.toLowerCase().includes(query) ||
          entry.summary?.toLowerCase().includes(query) ||
          entry.content?.toLowerCase().includes(query) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Category filter
      if (filterCategory !== "all" && entry.category !== filterCategory) {
        return false
      }

      // Status filter
      if (filterStatus !== "all" && entry.status !== filterStatus) {
        return false
      }

      // Visibility filter
      if (filterVisibility !== "all") {
        if (filterVisibility === "public" && !entry.is_public) return false
        if (filterVisibility === "private" && entry.is_public) return false
      }

      // Tag filter
      if (filterTag !== "all" && !entry.tags.includes(filterTag)) {
        return false
      }

      return true
    })
  }, [entries, searchQuery, filterCategory, filterStatus, filterVisibility, filterTag])

  const renderStars = (rating: number | null, entryId: string, isEditing: boolean) => {
    const currentRating = isEditing ? editForms[entryId]?.rating || 0 : rating || 0

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => isEditing && updateFormField(entryId, "rating", star)}
            disabled={!isEditing}
            className={`${isEditing ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            {star <= currentRating ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Personal Wiki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Personal Wiki
            </CardTitle>
            <CardDescription>Your personal knowledge base</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={createEntry} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-xs font-medium text-gray-600">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {WIKI_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {WIKI_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600">Visibility</Label>
                <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600">Tag</Label>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              {entries.length === 0 ? "No wiki entries yet" : "No entries match your filters"}
            </p>
            {entries.length === 0 && (
              <Button onClick={createEntry} variant="outline" size="sm" className="mt-2 bg-transparent">
                Create your first entry
              </Button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id)
            const isEditing = editingEntries.has(entry.id)
            const formData = editForms[entry.id] || entry

            return (
              <Card key={entry.id} className="border border-gray-200">
                <CardContent className="p-4">
                  {/* Entry Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button onClick={() => toggleExpanded(entry.id)} className="mt-1 p-1 hover:bg-gray-100 rounded">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <Input
                            value={formData.title}
                            onChange={(e) => updateFormField(entry.id, "title", e.target.value)}
                            className="font-medium mb-2"
                            placeholder="Entry title"
                          />
                        ) : (
                          <h3 className="font-medium text-gray-900 mb-1">{entry.title}</h3>
                        )}

                        {/* Metadata badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={WIKI_STATUS_OPTIONS.find((s) => s.value === entry.status)?.color}
                          >
                            {WIKI_STATUS_OPTIONS.find((s) => s.value === entry.status)?.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={WIKI_PRIORITY_OPTIONS.find((p) => p.value === entry.priority)?.color}
                          >
                            {WIKI_PRIORITY_OPTIONS.find((p) => p.value === entry.priority)?.label}
                          </Badge>
                          <Badge variant="outline">{entry.category}</Badge>
                          <div className="flex items-center gap-1">
                            {entry.is_public ? (
                              <Globe className="h-3 w-3 text-green-600" />
                            ) : (
                              <Lock className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                          {renderStars(entry.rating, entry.id, false)}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.updated_at).toLocaleDateString()}
                          </span>
                        </div>

                        {entry.summary && !isEditing && <p className="text-sm text-gray-600 mt-2">{entry.summary}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isEditing ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => startEditing(entry)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateEntry(entry.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => cancelEditing(entry.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          {/* Summary */}
                          <div>
                            <Label className="text-sm font-medium">Summary</Label>
                            <Textarea
                              value={formData.summary || ""}
                              onChange={(e) => updateFormField(entry.id, "summary", e.target.value)}
                              placeholder="Brief summary..."
                              rows={2}
                            />
                          </div>

                          {/* Content */}
                          <div>
                            <Label className="text-sm font-medium">Content</Label>
                            <Textarea
                              value={formData.content || ""}
                              onChange={(e) => updateFormField(entry.id, "content", e.target.value)}
                              placeholder="Detailed content..."
                              rows={6}
                            />
                          </div>

                          {/* Metadata Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Category</Label>
                              <Select
                                value={formData.category || "General"}
                                onValueChange={(value) => updateFormField(entry.id, "category", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {WIKI_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) => updateFormField(entry.id, "status", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {WIKI_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Priority</Label>
                              <Select
                                value={formData.priority}
                                onValueChange={(value) => updateFormField(entry.id, "priority", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {WIKI_PRIORITY_OPTIONS.map((priority) => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                      {priority.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`public-${entry.id}`}
                                checked={formData.is_public}
                                onCheckedChange={(checked) => updateFormField(entry.id, "is_public", checked)}
                              />
                              <Label htmlFor={`public-${entry.id}`} className="text-sm font-medium">
                                Public
                              </Label>
                            </div>
                          </div>

                          {/* Tags */}
                          <div>
                            <Label className="text-sm font-medium">Tags (comma-separated)</Label>
                            <Input
                              value={formData.tags?.join(", ") || ""}
                              onChange={(e) =>
                                updateFormField(
                                  entry.id,
                                  "tags",
                                  e.target.value
                                    .split(",")
                                    .map((tag) => tag.trim())
                                    .filter(Boolean),
                                )
                              }
                              placeholder="tag1, tag2, tag3"
                            />
                          </div>

                          {/* Rating */}
                          <div>
                            <Label className="text-sm font-medium">Rating</Label>
                            <div className="mt-1">{renderStars(formData.rating, entry.id, true)}</div>
                          </div>

                          {/* Related Links */}
                          <div>
                            <Label className="text-sm font-medium">Related Links (one per line)</Label>
                            <Textarea
                              value={formData.related_links?.join("\n") || ""}
                              onChange={(e) =>
                                updateFormField(entry.id, "related_links", e.target.value.split("\n").filter(Boolean))
                              }
                              placeholder="https://example.com"
                              rows={3}
                            />
                          </div>

                          {/* File Upload */}
                          <div>
                            <Label className="text-sm font-medium">File Upload</Label>
                            <div className="mt-1">
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload File
                              </Button>
                              {formData.file_url && <span className="ml-2 text-sm text-gray-600">File attached</span>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Summary */}
                          {entry.summary && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
                              <p className="text-sm text-gray-600">{entry.summary}</p>
                            </div>
                          )}

                          {/* Content */}
                          {entry.content && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Content</h4>
                              <div className="text-sm text-gray-600 whitespace-pre-wrap">{entry.content}</div>
                            </div>
                          )}

                          {/* Tags */}
                          {entry.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rating */}
                          {entry.rating && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Rating</h4>
                              {renderStars(entry.rating, entry.id, false)}
                            </div>
                          )}

                          {/* Related Links */}
                          {entry.related_links.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Related Links</h4>
                              <div className="space-y-1">
                                {entry.related_links.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {link}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* File */}
                          {entry.file_url && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Attachment</h4>
                              <a
                                href={entry.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <Upload className="h-3 w-3" />
                                View File
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
