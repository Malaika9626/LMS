import { useEffect, useState } from 'react'
import { getSubmissions, getCourses, getAssignments, createGradebookEntry } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Submissions() {
  const { user } = useAuth()
  const isEditor = user?.role === 'admin' || user?.role === 'teacher'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [courseId, setCourseId] = useState('')
  const [assignmentId, setAssignmentId] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [gradingId, setGradingId] = useState(null)
  const [gradeValue, setGradeValue] = useState('')
  const [feedbackValue, setFeedbackValue] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  const openSubmittedFile = (file) => {
    if (!file?.data) return
    try {
      const byteChars = atob(file.data)
      const byteNums = new Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i)
      const byteArray = new Uint8Array(byteNums)
      const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      // Open in a new tab from a direct user click to avoid blockers
      window.open(url, '_blank', 'noopener,noreferrer')
      // Revoke later to free memory
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (e) {
      console.error('Failed to open file', e)
      alert('Failed to open file. Try downloading instead.')
    }
  }

  useEffect(() => {
    let mounted = true
    Promise.all([getCourses(), getAssignments()])
      .then(([cs, as]) => { if (mounted) { setCourses(cs); setAssignments(as) } })
      .catch(() => { if (mounted) setError('Failed to load filters') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const params = {}
    if (courseId) params.courseId = courseId
    if (assignmentId) params.assignmentId = assignmentId
    getSubmissions(params)
      .then((res) => { if (mounted) setItems(res) })
      .catch(() => { if (mounted) setError('Failed to load submissions') })
    return () => { mounted = false }
  }, [courseId, assignmentId])

  if (!isEditor) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Submissions</h1>
        <p className="text-red-600">Access denied. Only admins and teachers can view submissions.</p>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Submissions</h1>
      <p className="text-gray-700">Browse student submissions. Filter by course or assignment.</p>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        <select
          className="border rounded-md px-3 py-2"
          value={courseId}
          onChange={(e) => { setCourseId(e.target.value); setAssignmentId('') }}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select
          className="border rounded-md px-3 py-2"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
        >
          <option value="">All assignments</option>
          {assignments
            .filter((a) => !courseId || String(a.courseId) === String(courseId))
            .map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
        </select>
        <div className="flex items-center text-sm text-gray-600">{items.length} submission{items.length !== 1 ? 's' : ''} found</div>
      </div>

      {loading && <p className="mt-4 text-gray-600">Loading…</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left border">Submitted</th>
              <th className="px-3 py-2 text-left border">Student</th>
              <th className="px-3 py-2 text-left border">Course</th>
              <th className="px-3 py-2 text-left border">Assignment</th>
              <th className="px-3 py-2 text-left border">Content</th>
              <th className="px-3 py-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2 border">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="px-3 py-2 border">{s.studentEmail}</td>
                <td className="px-3 py-2 border">{s.courseTitle || s.courseId}</td>
                <td className="px-3 py-2 border">{s.assignmentTitle || s.assignmentId}</td>
                <td className="px-3 py-2 border">
                  {s.file ? (
                    <span>File: {s.file.name} ({Math.round((s.file.size || 0) / 1024)} KB)</span>
                  ) : s.text ? (
                    <span>Text: {s.text.slice(0, 80)}{s.text.length > 80 ? '…' : ''}</span>
                  ) : (
                    <span className="text-gray-500">No content</span>
                  )}
                </td>
                <td className="px-3 py-2 border">
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-50"
                      onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    >
                      {expandedId === s.id ? 'Hide' : 'Details'}
                    </button>
                    <button
                      className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800"
                      onClick={() => {
                        setGradingId(gradingId === s.id ? null : s.id)
                        setGradeValue('')
                        setFeedbackValue('')
                        setActionMsg('')
                      }}
                    >
                      {gradingId === s.id ? 'Cancel' : 'Grade'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-600" colSpan={5}>No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        {items.map((s) => (
          <div key={s.id} className={`${expandedId === s.id || gradingId === s.id ? 'block' : 'hidden'} border border-gray-200 rounded-md p-3 mt-2 bg-white`}>
            {expandedId === s.id && (
              <div className="mb-2">
                <h3 className="font-medium text-gray-900">Submission Details</h3>
                <p className="text-sm text-gray-600">Submitted: {new Date(s.submittedAt).toLocaleString()}</p>
                {s.file && (
                  <p className="text-sm text-gray-800 mt-1">
                    File: {s.file.name} ({Math.round((s.file.size || 0) / 1024)} KB, {s.file.type || 'unknown type'})
                    {s.file.data && (
                      <button
                        type="button"
                        onClick={() => openSubmittedFile(s.file)}
                        className="ml-2 inline-flex items-center rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-50"
                      >
                        Open
                      </button>
                    )}
                  </p>
                )}
                {s.text && (
                  <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{s.text}</div>
                )}
                {!s.file && !s.text && (
                  <p className="text-sm text-gray-500 mt-1">No content included.</p>
                )}
              </div>
            )}
            {gradingId === s.id && (
              <form
                className="grid gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setActionMsg('')
                  try {
                    const payload = {
                      course: s.courseTitle || String(s.courseId),
                      assignment: s.assignmentTitle || String(s.assignmentId),
                      grade: gradeValue === '' ? null : Number(gradeValue),
                      feedback: feedbackValue || '',
                      studentEmail: s.studentEmail,
                    }
                    await createGradebookEntry(payload)
                    setActionMsg('Grade recorded')
                    setGradingId(null)
                    setGradeValue('')
                    setFeedbackValue('')
                  } catch (err) {
                    setActionMsg('Failed to record grade')
                  }
                }}
              >
                <div className="grid sm:grid-cols-3 gap-2">
                  <input
                    type="number"
                    className="border rounded-md px-3 py-2"
                    placeholder="Grade (0-100)"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                  />
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="Feedback (optional)"
                    value={feedbackValue}
                    onChange={(e) => setFeedbackValue(e.target.value)}
                  />
                  <button type="submit" className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800">Save Grade</button>
                </div>
                {actionMsg && <p className="text-sm text-gray-600 mt-1">{actionMsg}</p>}
              </form>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}