"use client"

import { useState, useEffect } from "react"
import { supabase, type WikiEntry, WIKI_CATEGORIES, WIKI_STATUS_OPTIONS, WIKI_PRIORITY_OPTIONS } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Trash2,
  Filter,
  Star,
  StarOff,
  Link,
  Tag,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WikiWidgetProps {
  userId: string
}

export default function WikiWidget({ userId }: WikiWidgetProps) {
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    tag: "",
    category: "General",
    status: "draft",
    visibility: "",
  })
  const [newEntry, setNewEntry] = useState<Partial<WikiEntry>>({
    title: "",
    summary: "",
    content: "",
    tags: [],
    category: "General",
    status: "draft",
    priority: "medium",
    is_public: false,
    rating: undefined,
    related_links: [],
  })
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [linkInput, setLinkInput] = useState("")

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
    } finally {
      setLoading(false)
    }
  }

  const createEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("wiki_entries")
        .insert([{ ...newEntry, user_id: userId }])
        .select()
        .single()

      if (error) throw error

      setEntries([data, ...entries])
      setNewEntry({
        title: "",
        summary: "",
        content: "",
        tags: [],
        category: "General",
        status: "draft",
        priority: "medium",
        is_public: false,
        rating: undefined,
        related_links: [],
      })
      setShowNewEntryForm(false)
    } catch (error) {
      console.error("Error creating wiki entry:", error)
    }
  }

  const updateEntry = async (id: string, updates: Partial<WikiEntry>) => {
    try {
      const { data, error } = await supabase.from("wiki_entries").update(updates).eq("id", id).select().single()

      if (error) throw error

      setEntries(entries.map((entry) => (entry.id === id ? data : entry)))
      setEditingEntry(null)
    } catch (error) {
      console.error("Error updating wiki entry:", error)
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from("wiki_entries").delete().eq("id", id)

      if (error) throw error

      setEntries(entries.filter((entry) => entry.id !== id))
    } catch (error) {
      console.error("Error deleting wiki entry:", error)
    }
  }

  const addTag = (entryId: string, tag: string) => {
    if (!tag.trim()) return
    const entry = entries.find((e) => e.id === entryId)
    if (!entry || entry.tags.includes(tag.trim())) return

    const updatedTags = [...entry.tags, tag.trim()]
    updateEntry(entryId, { tags: updatedTags })
  }

  const removeTag = (entryId: string, tagToRemove: string) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return

    const updatedTags = entry.tags.filter((tag) => tag !== tagToRemove)
    updateEntry(entryId, { tags: updatedTags })
  }

  const addLink = (entryId: string, link: string) => {
    if (!link.trim()) return
    const entry = entries.find((e) => e.id === entryId)
    if (!entry || entry.related_links.includes(link.trim())) return

    const updatedLinks = [...entry.related_links, link.trim()]
    updateEntry(entryId, { related_links: updatedLinks })
  }

  const removeLink = (entryId: string, linkToRemove: string) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return

    const updatedLinks = entry.related_links.filter((link) => link !== linkToRemove)
    updateEntry(entryId, { related_links: updatedLinks })
  }

  const filteredEntries = entries.filter((entry) => {
    if (filters.tag && !entry.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) return false
    if (filters.category && entry.category !== filters.category) return false
    if (filters.status && entry.status !== filters.status) return false
    if (filters.visibility === "public" && !entry.is_public) return false
    if (filters.visibility === "private" && entry.is_public) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    const statusOption = WIKI_STATUS_OPTIONS.find((opt) => opt.value === status)
    return statusOption
      ? { label: statusOption.label, color: statusOption.color }
      : { label: status, color: "bg-gray-100 text-gray-800" }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityOption = WIKI_PRIORITY_OPTIONS.find((opt) => opt.value === priority)
    return priorityOption
      ? { label: priorityOption.label, color: priorityOption.color }
      : { label: priority, color: "bg-gray-100 text-gray-800" }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <BookOpen className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Personal Wiki
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Your knowledge base</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowNewEntryForm(!showNewEntryForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tag</label>
              <Input
                placeholder="Filter by tag..."
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">All categories</SelectItem>
                  {WIKI_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">All statuses</SelectItem>
                  {WIKI_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Visibility</label>
              <Select
                value={filters.visibility}
                onValueChange={(value) => setFilters({ ...filters, visibility: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All entries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All entries</SelectItem>
                  <SelectItem value="public">Public only</SelectItem>
                  <SelectItem value="private">Private only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* New Entry Form */}
        {showNewEntryForm && (
          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800">New Wiki Entry</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNewEntryForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />
              <Select
                value={newEntry.category}
                onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
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

            <Textarea
              placeholder="Summary..."
              value={newEntry.summary}
              onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })}
              rows={2}
            />

            <div className="flex items-center gap-4">
              <Select
                value={newEntry.status}
                onValueChange={(value: any) => setNewEntry({ ...newEntry, status: value })}
              >
                <SelectTrigger className="w-32">
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

              <Select
                value={newEntry.priority}
                onValueChange={(value: any) => setNewEntry({ ...newEntry, priority: value })}
              >
                <SelectTrigger className="w-32">
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

              <div className="flex items-center gap-2">
                <Switch
                  checked={newEntry.is_public}
                  onCheckedChange={(checked) => setNewEntry({ ...newEntry, is_public: checked })}
                />
                <span className="text-sm text-slate-600">Public</span>
              </div>

              <Button onClick={createEntry} disabled={!newEntry.title?.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No wiki entries yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={() => setShowNewEntryForm(true)}
              >
                Create your first entry
              </Button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-slate-200 rounded-lg bg-white">
                {/* Entry Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                      className="p-0 h-auto"
                    >
                      {expandedEntry === entry.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-800 truncate">{entry.title}</h3>
                        {entry.is_public ? (
                          <Eye className="h-3 w-3 text-slate-400" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      {entry.summary && <p className="text-sm text-slate-600 truncate">{entry.summary}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getStatusBadge(entry.status).color)}>
                      {getStatusBadge(entry.status).label}
                    </Badge>
                    <Badge className={cn("text-xs", getPriorityBadge(entry.priority).color)}>
                      {getPriorityBadge(entry.priority).label}
                    </Badge>
                    {entry.category && (
                      <Badge variant="outline" className="text-xs">
                        {entry.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedEntry === entry.id && (
                  <div className="border-t border-slate-200 p-4 space-y-4">
                    {editingEntry === entry.id ? (
                      /* Edit Mode */
                      <EditEntryForm
                        entry={entry}
                        onSave={(updates) => updateEntry(entry.id, updates)}
                        onCancel={() => setEditingEntry(null)}
                        onAddTag={(tag) => addTag(entry.id, tag)}
                        onRemoveTag={(tag) => removeTag(entry.id, tag)}
                        onAddLink={(link) => addLink(entry.id, link)}
                        onRemoveLink={(link) => removeLink(entry.id, link)}
                      />
                    ) : (
                      /* View Mode */
                      <ViewEntry
                        entry={entry}
                        onEdit={() => setEditingEntry(entry.id)}
                        onDelete={() => deleteEntry(entry.id)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Edit Entry Form Component
function EditEntryForm({
  entry,
  onSave,
  onCancel,
  onAddTag,
  onRemoveTag,
  onAddLink,
  onRemoveLink,
}: {
  entry: WikiEntry
  onSave: (updates: Partial<WikiEntry>) => void
  onCancel: () => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onAddLink: (link: string) => void
  onRemoveLink: (link: string) => void
}) {
  const [formData, setFormData] = useState({
    title: entry.title,
    summary: entry.summary || "",
    content: entry.content || "",
    category: entry.category || "General",
    status: entry.status,
    priority: entry.priority,
    is_public: entry.is_public,
    rating: entry.rating,
  })
  const [tagInput, setTagInput] = useState("")
  const [linkInput, setLinkInput] = useState("")

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Entry title..."
        />
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

      <Textarea
        value={formData.summary}
        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
        placeholder="Summary..."
        rows={2}
      />

      <Textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="Content..."
        rows={6}
      />

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
              <button onClick={() => onRemoveTag(tag)} className="ml-1 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddTag(tagInput)
                setTagInput("")
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onAddTag(tagInput)
              setTagInput("")
            }}
          >
            <Tag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Related Links */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Related Links</label>
        <div className="space-y-2 mb-2">
          {entry.related_links.map((link) => (
            <div key={link} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <Link className="h-4 w-4 text-slate-400" />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex-1 truncate"
              >
                {link}
              </a>
              <button onClick={() => onRemoveLink(link)} className="text-slate-400 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Add link..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddLink(linkInput)
                setLinkInput("")
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onAddLink(linkInput)
              setLinkInput("")
            }}
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="w-32">
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

          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className="w-32">
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

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
            <span className="text-sm text-slate-600">Public</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFormData({ ...formData, rating: formData.rating === rating ? undefined : rating })}
                className="text-yellow-400 hover:text-yellow-500"
              >
                {formData.rating && formData.rating >= rating ? (
                  <Star className="h-4 w-4 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

// View Entry Component
function ViewEntry({
  entry,
  onEdit,
  onDelete,
}: {
  entry: WikiEntry
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      {entry.content && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-slate-700">{entry.content}</div>
        </div>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Related Links */}
      {entry.related_links.length > 0 && (
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Related Links</label>
          <div className="space-y-2">
            {entry.related_links.map((link) => (
              <div key={link} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                <Link className="h-4 w-4 text-slate-400" />
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {link}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Updated {new Date(entry.updated_at).toLocaleDateString()}
          </span>
          {entry.rating && (
            <div className="flex items-center gap-1">
              {[...Array(entry.rating)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
