'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Linkedin,
  MoreVertical,
  Trash2,
  Edit2,
  X
} from 'lucide-react'
import { fetchContacts, createContact, deleteContact, updateContact } from '@/lib/supabase'
import { Contact } from '@/lib/database.types'
import ContactEnrichmentPanel from '@/components/ContactEnrichmentPanel'
import { format, parseISO } from 'date-fns'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const data = await fetchContacts()
      setContacts(data || [])
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase()
    return (
      contact.first_name.toLowerCase().includes(searchLower) ||
      contact.last_name.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  })

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    try {
      await deleteContact(id)
      setContacts(contacts.filter(c => c.id !== id))
      setSelectedContact(null)
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="text-gray-400 mt-1">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
        />
      </div>

      {/* Contact Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No contacts found</p>
          <p className="text-sm text-gray-600 mt-1">
            {searchQuery ? 'Try a different search term' : 'Add contacts using voice commands or the button above'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => setSelectedContact(contact)}
            />
          ))}
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={() => {
            setShowEditModal(true)
          }}
          onDelete={() => handleDeleteContact(selectedContact.id)}
        />
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSave={async (contact) => {
            try {
              const newContact = await createContact(contact)
              setContacts([newContact, ...contacts])
              setShowAddModal(false)
            } catch (error) {
              console.error('Failed to create contact:', error)
            }
          }}
        />
      )}

      {/* Edit Contact Modal */}
      {showEditModal && selectedContact && (
        <EditContactModal
          contact={selectedContact}
          onClose={() => setShowEditModal(false)}
          onSave={async (updated) => {
            try {
              const result = await updateContact(selectedContact.id, updated)
              setContacts(contacts.map(c => c.id === selectedContact.id ? result : c))
              setSelectedContact(result)
              setShowEditModal(false)
            } catch (error) {
              console.error('Failed to update contact:', error)
            }
          }}
        />
      )}
    </div>
  )
}

function ContactCard({ contact, onClick }: { contact: Contact; onClick: () => void }) {
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
    <div
      onClick={onClick}
      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
          <span className="text-lg font-bold text-white">
            {contact.first_name[0]}{contact.last_name[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            {contact.first_name} {contact.last_name}
          </h3>
          {(contact.role || contact.company) && (
            <p className="text-sm text-gray-400 truncate">
              {contact.role && contact.company
                ? `${contact.role} at ${contact.company}`
                : contact.role || contact.company}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </div>
        )}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {contact.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactDetailModal({
  contact,
  onClose,
  onEdit,
  onDelete
}: {
  contact: Contact
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <span className="text-2xl font-bold text-white">
                {contact.first_name[0]}{contact.last_name[0]}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {contact.first_name} {contact.last_name}
              </h2>
              {(contact.role || contact.company) && (
                <p className="text-gray-400">
                  {contact.role && contact.company
                    ? `${contact.role} at ${contact.company}`
                    : contact.role || contact.company}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {contact.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
              <Mail className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white">{contact.email}</p>
              </div>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
              <Phone className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-white">{contact.phone}</p>
              </div>
            </div>
          )}

          {contact.company && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
              <Building2 className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-white">{contact.company}</p>
              </div>
            </div>
          )}

          {contact.linkedin && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
              <Linkedin className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-500">LinkedIn</p>
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  {contact.linkedin}
                </a>
              </div>
            </div>
          )}

          {contact.notes && (
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Notes</p>
              <p className="text-white whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Enrichment Panel */}
          <ContactEnrichmentPanel contactId={contact.id} />

          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600">
            Added {format(parseISO(contact.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function AddContactModal({
  onClose,
  onSave
}: {
  onClose: () => void
  onSave: (contact: Parameters<typeof createContact>[0]) => void
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    linkedin: '',
    notes: '',
    tags: [] as string[],
    avatar_color: 'cyan'
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) return
    onSave(formData)
  }

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] })
      setTagInput('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add Contact</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none resize-none"
            />
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
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditContactModal({
  contact,
  onClose,
  onSave
}: {
  contact: Contact
  onClose: () => void
  onSave: (contact: Partial<Contact>) => void
}) {
  const [formData, setFormData] = useState({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company || '',
    role: contact.role || '',
    linkedin: contact.linkedin || '',
    notes: contact.notes || '',
    tags: contact.tags || [],
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) return
    onSave(formData)
  }

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] })
      setTagInput('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Contact</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none resize-none"
            />
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
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
