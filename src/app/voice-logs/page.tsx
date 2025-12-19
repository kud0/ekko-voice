'use client'

import { useEffect, useState } from 'react'
import {
  Mic,
  MessageSquare,
  Search,
  User,
  Bot,
  Clock,
  Filter
} from 'lucide-react'
import { fetchVoiceLogs } from '@/lib/supabase'
import { VoiceLog } from '@/lib/database.types'
import { format, parseISO, isToday, isYesterday } from 'date-fns'

const intentColors: Record<string, { bg: string; text: string; label: string }> = {
  create_contact: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Contact' },
  create_task: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Task' },
  create_note: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Note' },
  query: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Query' },
  greeting: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Greeting' },
  error: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Error' },
}

export default function VoiceLogsPage() {
  const [logs, setLogs] = useState<VoiceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIntent, setFilterIntent] = useState<string>('')

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    try {
      const data = await fetchVoiceLogs(100)
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch voice logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' ||
      log.transcription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ai_response.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterIntent === '' || log.intent === filterIntent

    return matchesSearch && matchesFilter
  })

  const uniqueIntents = [...new Set(logs.map(l => l.intent))]

  function formatDate(dateStr: string) {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d, yyyy')
  }

  function formatTime(dateStr: string) {
    return format(parseISO(dateStr), 'h:mm a')
  }

  function getIntentStyle(intent: string) {
    return intentColors[intent] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: intent }
  }

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = formatDate(log.created_at)
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
    return groups
  }, {} as Record<string, VoiceLog[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading voice logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Voice Logs</h1>
          <p className="text-gray-400 mt-1">History of all voice interactions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-medium">{logs.length} interactions</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search voice logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={filterIntent}
            onChange={(e) => setFilterIntent(e.target.value)}
            className="pl-12 pr-8 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white appearance-none focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="">All Types</option>
            {uniqueIntents.map(intent => (
              <option key={intent} value={intent}>
                {getIntentStyle(intent).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/10">
            <Mic className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No voice logs yet</h2>
          <p className="text-gray-500 mb-2">Start using voice commands in the Ekko app</p>
          <p className="text-gray-600 text-sm">Your conversation history will appear here</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No logs match your search</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {date}
              </h2>
              <div className="space-y-4">
                {dateLogs.map(log => (
                  <VoiceLogCard key={log.id} log={log} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VoiceLogCard({ log }: { log: VoiceLog }) {
  const intentStyle = intentColors[log.intent] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: log.intent }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${intentStyle.bg} ${intentStyle.text}`}>
          {intentStyle.label}
        </span>
        <span className="text-xs text-gray-500">
          {format(parseISO(log.created_at), 'h:mm a')}
        </span>
      </div>

      {/* User Message */}
      <div className="flex gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">You said:</p>
          <p className="text-white">{log.transcription}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">Ekko:</p>
          <p className="text-gray-300">{log.ai_response}</p>
        </div>
      </div>
    </div>
  )
}
