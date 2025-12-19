'use client'

import { useEffect, useState } from 'react'
import { Linkedin, Building2, Newspaper, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { fetchContactEnrichment } from '@/lib/supabase'
import { ContactEnrichment } from '@/lib/database.types'

interface ContactEnrichmentPanelProps {
  contactId: string
}

export default function ContactEnrichmentPanel({ contactId }: ContactEnrichmentPanelProps) {
  const [enrichment, setEnrichment] = useState<ContactEnrichment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEnrichment()
  }, [contactId])

  async function loadEnrichment() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchContactEnrichment(contactId)
      setEnrichment(data)
    } catch (err) {
      console.error('Failed to load enrichment:', err)
      setError('Failed to load enrichment data')
    } finally {
      setLoading(false)
    }
  }

  // Loading state for pending/processing status
  if (loading || enrichment?.enrichment_status === 'pending' || enrichment?.enrichment_status === 'processing') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Intelligence</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-white font-medium mb-1">Enriching Contact Data</p>
              <p className="text-sm text-gray-400">
                {enrichment?.enrichment_status === 'processing'
                  ? 'Processing enrichment data...'
                  : 'Gathering intelligence from multiple sources...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || enrichment?.enrichment_status === 'failed') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Intelligence</h3>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Enrichment Failed</p>
              <p className="text-sm text-gray-400 mt-1">
                {error || 'Unable to retrieve enrichment data. Please try again later.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No enrichment data available
  if (!enrichment) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Intelligence</h3>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-center">
            No enrichment data available yet. Enrichment will be performed automatically.
          </p>
        </div>
      </div>
    )
  }

  // Parse recent news if it's a JSON string
  let newsItems: Array<{ title: string; url?: string; date?: string }> = []
  if (enrichment.recent_news) {
    try {
      newsItems = Array.isArray(enrichment.recent_news)
        ? enrichment.recent_news
        : JSON.parse(enrichment.recent_news)
    } catch {
      newsItems = []
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Contact Intelligence</h3>

      {/* LinkedIn Card */}
      {(enrichment.linkedin_url || enrichment.linkedin_headline || enrichment.linkedin_summary) && (
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-5 hover:border-blue-500/50 transition-all">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold">LinkedIn Profile</h4>
                {enrichment.linkedin_url && (
                  <a
                    href={enrichment.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {enrichment.linkedin_headline && (
                <p className="text-sm text-gray-300 mt-1">{enrichment.linkedin_headline}</p>
              )}
            </div>
          </div>
          {enrichment.linkedin_summary && (
            <p className="text-sm text-gray-400 leading-relaxed">{enrichment.linkedin_summary}</p>
          )}
        </div>
      )}

      {/* Company Intel Card */}
      {(enrichment.company_description || enrichment.company_industry || enrichment.company_size || enrichment.company_website || enrichment.company_funding_stage) && (
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-2xl p-5 hover:border-orange-500/50 transition-all">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold">Company Intel</h4>
                {enrichment.company_website && (
                  <a
                    href={enrichment.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
          {enrichment.company_description && (
            <p className="text-sm text-gray-400 leading-relaxed mb-3">{enrichment.company_description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {enrichment.company_industry && (
              <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {enrichment.company_industry}
              </span>
            )}
            {enrichment.company_size && (
              <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {enrichment.company_size}
              </span>
            )}
            {enrichment.company_funding_stage && (
              <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {enrichment.company_funding_stage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent News Card */}
      {newsItems.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/50 transition-all">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-white font-semibold">Recent News</h4>
          </div>
          <div className="space-y-3">
            {newsItems.slice(0, 3).map((news, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {news.url ? (
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-300 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span className="truncate">{news.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm text-gray-300">{news.title}</p>
                  )}
                  {news.date && (
                    <p className="text-xs text-gray-500 mt-1">{news.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(enrichment.twitter_url || enrichment.github_url) && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            {enrichment.twitter_url && (
              <a
                href={enrichment.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors border border-cyan-500/30"
              >
                <span>Twitter</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {enrichment.github_url && (
              <a
                href={enrichment.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Enrichment metadata */}
      {enrichment.last_enriched_at && (
        <p className="text-xs text-gray-600 text-center">
          Last updated {new Date(enrichment.last_enriched_at).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
