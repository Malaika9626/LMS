import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAssignments, createAssignment, getCourses } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Assignments() {
  const { user } = useAuth()
  const isEditor = user?.role === 'admin' || user?.role === 'teacher'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [courseId, setCourseId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([getAssignments(), getCourses()])
      .then(([as, cs]) => { if (mounted) { setItems(as); setCourses(cs) } })
      .catch(() => { if (mounted) setError('Failed to load assignments') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <section className="max-w-6xl mx-auto px-4 py-8">Loading...</section>
  if (error) return <section className="max-w-6xl mx-auto px-4 py-8 text-red-600">{error}</section>

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Assignments & Quizzes</h1>
      <p className="text-gray-700">Submit assignments, attempt quizzes, and track deadlines.{isEditor && ' Admins/Teachers can post new assignments.'}</p>
      {isEditor && (
        <form
          className="mt-4 grid gap-2 border rounded-lg p-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setSaveMsg('')
            try {
              if (!title || !courseId) {
                setSaveMsg('Title and course are required')
                setSaving(false)
                return
              }
              const payload = { title, due: due || null, courseId: Number(courseId), description }
              const created = await createAssignment(payload)
              setItems((prev) => [created, ...prev])
              setTitle('')
              setDue('')
              setCourseId('')
              setDescription('')
              setSaveMsg('Assignment posted')
            } catch {
              setSaveMsg('Failed to post assignment')
            } finally {
              setSaving(false)
            }
          }}
        >
          <h2 className="font-medium text-gray-900">Post new assignment</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            <input
              className="border rounded-md px-3 py-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-md px-3 py-2"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <select
              className="border rounded-md px-3 py-2"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <textarea
            className="mt-2 w-full border rounded-md px-3 py-2 min-h-28"
            placeholder="Details / instructions"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-3 mt-2">
            <button type="submit" disabled={saving} className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-60">
              {saving ? 'Posting…' : 'Post Assignment'}
            </button>
            {saveMsg && <span className="text-sm text-gray-600">{saveMsg}</span>}
          </div>
        </form>
      )}
      <div className="mt-4 grid gap-4">
        {items.map((a) => (
          <Link key={a.id} to={`/assignments/${a.id}`} className="block border rounded-lg p-4 hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">{a.title}</h3>
            <p className="text-sm text-gray-600">Deadline: {a.due}</p>
            <span className="mt-2 inline-flex rounded-md bg-gray-900 text-white px-3 py-1.5">Upload / Attempt</span>
          </Link>
        ))}
      </div>
    </section>
  )
}