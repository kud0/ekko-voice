'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  Settings,
  Mic,
  StickyNote
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Voice Logs', href: '/voice-logs', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Ekko CRM</h1>
          <p className="text-xs text-gray-500">Voice-First Assistant</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-sm font-semibold text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Alex Sole</p>
            <p className="text-xs text-gray-500 truncate">alex@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
