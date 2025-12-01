import { useEffect, useState } from 'react'
import { getAnnouncements, postAnnouncement } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Announcements() {
  const { user } = useAuth()
  const isEditor = user?.role === 'admin' || user?.role === 'teacher'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    let mounted = true
    getAnnouncements()
      .then((res) => { if (mounted) setItems(res) })
      .catch(() => { if (mounted) setError('Failed to load announcements') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <section className="max-w-6xl mx-auto px-4 py-8">Loading...</section>
  if (error) return <section className="max-w-6xl mx-auto px-4 py-8 text-red-600">{error}</section>

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Announcements</h1>
      {isEditor && (
        <form
          className="mb-6 grid gap-2 border rounded-lg p-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setSaveMsg('')
            try {
              const created = await postAnnouncement({ title, body })
              setItems((prev) => [created, ...prev])
              setTitle('')
              setBody('')
              setSaveMsg('Announcement posted')
            } catch {
              setSaveMsg('Failed to post')
            } finally {
              setSaving(false)
            }
          }}
        >
          <h2 className="font-medium text-gray-900">Post new announcement</h2>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border rounded-md px-3 py-2"
            rows={4}
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800 disabled:opacity-60">
              {saving ? 'Posting…' : 'Post Announcement'}
            </button>
            {saveMsg && <span className="text-sm text-gray-600">{saveMsg}</span>}
          </div>
        </form>
      )}
      <div className="mt-4 grid gap-3">
        {items.map((a) => (
          <div key={a.id} className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900">{a.title}</h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{a.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}