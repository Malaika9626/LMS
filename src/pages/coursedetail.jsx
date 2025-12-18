import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCourseById, updateCourse } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isEditor = user?.role === 'admin' || user?.role === 'teacher'
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState('')
  const [resources, setResources] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    let mounted = true
    getCourseById(id)
      .then((res) => { if (mounted) { setCourse(res); setOverview(res?.overview || ''); setResources(res?.resources || '') } })
      .catch(() => { if (mounted) setError('Failed to load course') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  async function onSave(e) {
    e?.preventDefault?.()
    setSaving(true)
    setSaveMsg('')
    try {
      const updated = await updateCourse(id, { overview, resources })
      setCourse(updated)
      setSaveMsg('Saved')
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section className="max-w-6xl mx-auto px-4 py-8">Loading...</section>
  if (error || !course) return <section className="max-w-6xl mx-auto px-4 py-8 text-red-600">{error || 'Course not found'}</section>

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{course.title}</h1>
      <p className="text-gray-700">{course.description}</p>
      <div className="mt-4 grid gap-3">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Overview</h3>
          {isEditor ? (
            <textarea className="mt-2 w-full border rounded-md px-3 py-2 text-sm" rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} />
          ) : (
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{course.overview || 'Syllabus, schedule, and instructor info will render here.'}</div>
          )}
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Resources</h3>
          {isEditor ? (
            <textarea className="mt-2 w-full border rounded-md px-3 py-2 text-sm" rows={4} value={resources} onChange={(e) => setResources(e.target.value)} />
          ) : (
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{course.resources || 'Lecture notes, videos, and downloadable materials.'}</div>
          )}
        </div>
      </div>
      {isEditor && (
        <div className="mt-4 flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saveMsg && <span className="text-sm text-gray-600">{saveMsg}</span>}
        </div>
      )}
      <Link to="/courses" className="mt-6 inline-block rounded-md border px-3 py-1.5 text-gray-700 hover:bg-gray-50">Back to Courses</Link>
    </section>
  )
}