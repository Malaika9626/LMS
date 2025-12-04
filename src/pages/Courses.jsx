import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCourses, createCourse } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Courses() {
  const { user } = useAuth()
  const isEditor = user?.role === 'admin' || user?.role === 'teacher'
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [overview, setOverview] = useState('')
  const [resources, setResources] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    let mounted = true
    getCourses()
      .then((res) => { if (mounted) setCourses(res) })
      .catch(() => { if (mounted) setError('Failed to load courses') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <section className="max-w-6xl mx-auto px-4 py-8">Loading...</section>
  if (error) return <section className="max-w-6xl mx-auto px-4 py-8 text-red-600">{error}</section>

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Courses</h1>
      <p className="text-gray-700">Browse available courses and materials.{isEditor && ' Admins/Teachers can create new courses.'}</p>
      {isEditor && (
        <form
          className="mt-4 grid gap-2 border rounded-lg p-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setSaveMsg('')
            try {
              const payload = { title, description, overview, resources }
              const created = await createCourse(payload)
              setCourses((prev) => [created, ...prev])
              setTitle('')
              setDescription('')
              setOverview('')
              setResources('')
              setSaveMsg('Course created')
            } catch {
              setSaveMsg('Failed to create course')
            } finally {
              setSaving(false)
            }
          }}
        >
          <div className="grid sm:grid-cols-2 gap-2">
            <input
              className="border rounded-md px-3 py-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="border rounded-md px-3 py-2"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-24"
            placeholder="Overview"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
          />
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-24"
            placeholder="Resources"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Course'}
            </button>
            {saveMsg && <span className="text-sm text-gray-600">{saveMsg}</span>}
          </div>
        </form>
      )}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <Link key={c.id} to={`/courses/${c.id}`} className="block border rounded-lg p-4 hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">{c.title}</h3>
            <p className="text-sm text-gray-600">{c.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}