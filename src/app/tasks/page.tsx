'use client'

import { useEffect, useState } from 'react'
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertTriangle,
  Check,
  Clock,
  Filter,
  X
} from 'lucide-react'
import { fetchTasks, createTask, completeTask, deleteTask, updateTask } from '@/lib/supabase'
import { Task } from '@/lib/database.types'
import { format, parseISO, isToday, isPast, isTomorrow, addDays } from 'date-fns'

const priorityConfig = {
  high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle },
  medium: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Clock },
  low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Check },
}

const categoryConfig: Record<string, { color: string; label: string }> = {
  followUp: { color: 'text-purple-400', label: 'Follow Up' },
  email: { color: 'text-blue-400', label: 'Email' },
  call: { color: 'text-green-400', label: 'Call' },
  meeting: { color: 'text-orange-400', label: 'Meeting' },
  proposal: { color: 'text-cyan-400', label: 'Proposal' },
  reminder: { color: 'text-pink-400', label: 'Reminder' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const data = await fetchTasks()
      setTasks(data || [])
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.is_completed
      case 'completed':
        return task.is_completed
      case 'overdue':
        return !task.is_completed && task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
      default:
        return true
    }
  }).sort((a, b) => {
    // Completed tasks go to bottom
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1
    }
    // Then sort by due date
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  const handleToggleComplete = async (task: Task) => {
    try {
      if (!task.is_completed) {
        await completeTask(task.id)
        setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: true } : t))
      } else {
        await updateTask(task.id, { is_completed: false, completed_at: null })
        setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: false } : t))
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.is_completed).length,
    completed: tasks.filter(t => t.is_completed).length,
    overdue: tasks.filter(t => !t.is_completed && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 mt-1">
            {stats.pending} pending, {stats.completed} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <FilterButton
          label="All"
          count={stats.total}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          color="gray"
        />
        <FilterButton
          label="Pending"
          count={stats.pending}
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
          color="orange"
        />
        <FilterButton
          label="Completed"
          count={stats.completed}
          active={filter === 'completed'}
          onClick={() => setFilter('completed')}
          color="green"
        />
        <FilterButton
          label="Overdue"
          count={stats.overdue}
          active={filter === 'overdue'}
          onClick={() => setFilter('overdue')}
          color="red"
        />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <CheckSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No tasks found</p>
          <p className="text-sm text-gray-600 mt-1">
            {filter !== 'all' ? 'Try a different filter' : 'Add tasks using voice commands or the button above'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => handleToggleComplete(task)}
              onDelete={() => handleDeleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSave={async (task) => {
            try {
              const newTask = await createTask(task)
              setTasks([newTask, ...tasks])
              setShowAddModal(false)
            } catch (error) {
              console.error('Failed to create task:', error)
            }
          }}
        />
      )}
    </div>
  )
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  color
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  color: 'gray' | 'orange' | 'green' | 'red'
}) {
  const colorClasses = {
    gray: active ? 'bg-gray-700 border-gray-600' : 'bg-gray-800/50 border-gray-800',
    orange: active ? 'bg-orange-500/20 border-orange-500/50' : 'bg-gray-800/50 border-gray-800',
    green: active ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-800/50 border-gray-800',
    red: active ? 'bg-red-500/20 border-red-500/50' : 'bg-gray-800/50 border-gray-800',
  }

  const textClasses = {
    gray: active ? 'text-white' : 'text-gray-400',
    orange: active ? 'text-orange-400' : 'text-gray-400',
    green: active ? 'text-green-400' : 'text-gray-400',
    red: active ? 'text-red-400' : 'text-gray-400',
  }

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border ${colorClasses[color]} transition-all hover:border-gray-700`}
    >
      <p className={`text-2xl font-bold ${textClasses[color]}`}>{count}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </button>
  )
}

function TaskCard({
  task,
  onToggle,
  onDelete
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  const isOverdue = task.due_date && !task.is_completed && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
  const isDueToday = task.due_date && isToday(parseISO(task.due_date))
  const isDueTomorrow = task.due_date && isTomorrow(parseISO(task.due_date))

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium
  const category = categoryConfig[task.category] || { color: 'text-gray-400', label: task.category }

  const getDueDateLabel = () => {
    if (!task.due_date) return null
    if (isOverdue) return { text: `${Math.abs(Math.ceil((parseISO(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d overdue`, color: 'text-red-400' }
    if (isDueToday) return { text: 'Today', color: 'text-orange-400' }
    if (isDueTomorrow) return { text: 'Tomorrow', color: 'text-yellow-400' }
    return { text: format(parseISO(task.due_date), 'MMM d'), color: 'text-gray-500' }
  }

  const dueLabel = getDueDateLabel()

  return (
    <div className={`bg-gray-900/50 border rounded-xl p-4 transition-all ${
      task.is_completed ? 'border-gray-800 opacity-60' : isOverdue ? 'border-red-500/30' : 'border-gray-800'
    }`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.is_completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          {task.is_completed && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded border ${priority.color}`}>
              {task.priority}
            </span>
            <span className={`text-xs ${category.color}`}>
              {category.label}
            </span>
          </div>

          <h3 className={`text-base font-medium ${task.is_completed ? 'text-gray-500 line-through' : 'text-white'}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {dueLabel && (
              <span className={`text-xs flex items-center gap-1 ${dueLabel.color}`}>
                <Calendar className="w-3 h-3" />
                {dueLabel.text}
              </span>
            )}
            {task.related_contact_name && (
              <span className="text-xs text-gray-500">
                {task.related_contact_name}
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AddTaskModal({
  onClose,
  onSave
}: {
  onClose: () => void
  onSave: (task: Parameters<typeof createTask>[0]) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: 'reminder',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return
    onSave({
      ...formData,
      due_date: formData.due_date || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add Task</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Add more details..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 outline-none"
              >
                <option value="reminder">Reminder</option>
                <option value="followUp">Follow Up</option>
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="proposal">Proposal</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
