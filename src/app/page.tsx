'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mic,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { StatsCard } from '@/components/StatsCard'
import { fetchDashboardStats, fetchTasks, fetchContacts } from '@/lib/supabase'
import { Task, Contact } from '@/lib/database.types'
import { format, isToday, isPast, parseISO } from 'date-fns'

interface DashboardStats {
  totalContacts: number
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  overdueTasks: number
  totalVoiceInteractions: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, tasksData, contactsData] = await Promise.all([
          fetchDashboardStats(),
          fetchTasks(),
          fetchContacts(),
        ])
        setStats(statsData)
        setRecentTasks(tasksData?.slice(0, 5) || [])
        setRecentContacts(contactsData?.slice(0, 5) || [])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your CRM activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Contacts"
          value={stats?.totalContacts || 0}
          icon={Users}
          color="cyan"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          icon={Clock}
          color="orange"
          subtitle={`${stats?.completedTasks || 0} completed`}
        />
        <StatsCard
          title="Overdue Tasks"
          value={stats?.overdueTasks || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Voice Interactions"
          value={stats?.totalVoiceInteractions || 0}
          icon={Mic}
          color="purple"
        />
        <StatsCard
          title="Task Completion"
          value={stats?.totalTasks ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%'}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-orange-400" />
              Upcoming Tasks
            </h2>
            <a href="/tasks" className="text-sm text-cyan-400 hover:text-cyan-300">
              View all
            </a>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No tasks yet</p>
              <p className="text-sm text-gray-600">Create tasks using voice commands</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.filter(t => !t.is_completed).slice(0, 5).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Contacts */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Recent Contacts
            </h2>
            <a href="/contacts" className="text-sm text-cyan-400 hover:text-cyan-300">
              View all
            </a>
          </div>

          {recentContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No contacts yet</p>
              <p className="text-sm text-gray-600">Add contacts using voice commands</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <ContactRow key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
  const isDueToday = task.due_date && isToday(parseISO(task.due_date))

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className={`w-2 h-2 rounded-full ${
        isOverdue ? 'bg-red-500' : isDueToday ? 'bg-orange-500' : 'bg-gray-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${
              isOverdue ? 'text-red-400' : isDueToday ? 'text-orange-400' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              {isDueToday ? 'Today' : format(parseISO(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactRow({ contact }: { contact: Contact }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  const gradientClass = colorMap[contact.avatar_color] || colorMap.blue

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        <span className="text-sm font-bold text-white">
          {contact.first_name[0]}{contact.last_name[0]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {contact.first_name} {contact.last_name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {contact.role && contact.company
            ? `${contact.role} at ${contact.company}`
            : contact.company || contact.role || contact.email || 'No details'}
        </p>
      </div>
      {contact.tags && contact.tags.length > 0 && (
        <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {contact.tags[0]}
        </span>
      )}
    </div>
  )
}
