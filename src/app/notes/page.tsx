'use client'

import { useEffect, useState } from 'react'
import {
  StickyNote,
  Pin,
  PinOff,
  Trash2,
  X,
  Search,
  Mic
} from 'lucide-react'
import { fetchNotes, deleteNote, toggleNotePin } from '@/lib/supabase'
import { Note } from '@/lib/database.types'
import { format, parseISO } from 'date-fns'

const noteColors = [
  { name: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { name: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  { name: 'green', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  { name: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  { name: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
  { name: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  { name: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await fetchNotes()
      setNotes(data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned)
  const unpinnedNotes = filteredNotes.filter(n => !n.is_pinned)

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return
    try {
      await deleteNote(id)
      setNotes(notes.filter(n => n.id !== id))
      setSelectedNote(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  async function handleTogglePin(note: Note) {
    try {
      const updated = await toggleNotePin(note.id, !note.is_pinned)
      setNotes(notes.map(n => n.id === updated.id ? updated : n))
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  function getColorClasses(color: string) {
    return noteColors.find(c => c.name === color) || noteColors[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Notes</h1>
          <p className="text-gray-400 mt-1">Voice-created notes and reminders</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl">
          <Mic className="w-5 h-5" />
          <span className="text-sm font-medium">Voice-First</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
        />
      </div>

      {/* Empty State */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10">
            <StickyNote className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No notes yet</h2>
          <p className="text-gray-500 mb-2">Create notes using voice commands in the Ekko app</p>
          <p className="text-gray-600 text-sm">Try saying: "Take a note about the meeting"</p>
        </div>
      ) : (
        <>
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Pin className="w-4 h-4" />
                Pinned
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    colorClasses={getColorClasses(note.color)}
                    onClick={() => setSelectedNote(note)}
                    onDelete={() => handleDelete(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  Other Notes
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    colorClasses={getColorClasses(note.color)}
                    onClick={() => setSelectedNote(note)}
                    onDelete={() => handleDelete(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* View Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNote(null)} />
          <div className="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className={`text-xl font-semibold ${getColorClasses(selectedNote.color).text}`}>
                {selectedNote.title}
              </h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-300 whitespace-pre-wrap">{selectedNote.content}</p>
              <p className="text-xs text-gray-500 mt-6">
                Created {format(parseISO(selectedNote.created_at), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button
                onClick={() => { handleTogglePin(selectedNote); setSelectedNote(null); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
              >
                {selectedNote.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                {selectedNote.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => handleDelete(selectedNote.id)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface NoteCardProps {
  note: Note
  colorClasses: { bg: string; border: string; text: string }
  onClick: () => void
  onDelete: () => void
  onTogglePin: () => void
}

function NoteCard({ note, colorClasses, onClick, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${colorClasses.bg} ${colorClasses.border}`}
    >
      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className={`p-1.5 rounded-lg hover:bg-black/20 ${colorClasses.text}`}
          title={note.is_pinned ? 'Unpin' : 'Pin'}
        >
          {note.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg hover:bg-black/20 text-red-400"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pinned indicator */}
      {note.is_pinned && (
        <Pin className={`absolute top-3 left-3 w-4 h-4 ${colorClasses.text}`} />
      )}

      {/* Content */}
      <h3 className={`font-semibold mb-2 ${colorClasses.text} ${note.is_pinned ? 'ml-6' : ''}`}>
        {note.title}
      </h3>
      <p className="text-gray-300 text-sm line-clamp-4 whitespace-pre-wrap">
        {note.content}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-gray-500">
          {format(parseISO(note.updated_at), 'MMM d, yyyy · h:mm a')}
        </p>
      </div>
    </div>
  )
}
