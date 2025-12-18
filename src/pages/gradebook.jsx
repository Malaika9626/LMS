import { useEffect, useState } from 'react'
import { getGradebook, updateGradebookEntry, createGradebookEntry, getCourses, getAssignments, getStudents } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Gradebook() {
  const { user } = useAuth()
  const isEditor = user?.role === 'admin' || user?.role === 'teacher'
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [saveMsg, setSaveMsg] = useState('')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [students, setStudents] = useState([])
  const [newGrade, setNewGrade] = useState('')
  const [newFeedback, setNewFeedback] = useState('')
  const [adding, setAdding] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const promises = [getGradebook(), getCourses(), getAssignments()]
        if (isEditor) promises.push(getStudents())
        const results = await Promise.all(promises)
        if (!mounted) return
        const [gb, cs, as, us] = results
        setRows(gb)
        setCourses(cs)
        setAssignments(as)
        if (isEditor && us) setStudents(us)
      } catch {
        if (mounted) setError('Failed to load gradebook')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [isEditor])

  if (loading) return <section className="max-w-6xl mx-auto px-4 py-8">Loading...</section>
  if (error) return <section className="max-w-6xl mx-auto px-4 py-8 text-red-600">{error}</section>

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Gradebook</h1>
      <p className="text-gray-700">View grades and teacher feedback.{isEditor && ' Admins/Teachers can add and edit grades.'}</p>
      {isEditor && (
        <form
          className="mt-4 grid gap-2 border rounded-lg p-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setAdding(true)
            setAddMsg('')
            try {
              const course = courses.find((c) => String(c.id) === String(selectedCourseId))
              const assignment = assignments.find((a) => String(a.id) === String(selectedAssignmentId))
              if (!course || !assignment || !studentEmail) {
                setAddMsg('Please select course, assignment and student email')
                setAdding(false)
                return
              }
              const payload = {
                course: course.title,
                assignment: assignment.title,
                grade: newGrade === '' ? null : Number(newGrade),
                feedback: newFeedback || '',
                studentEmail,
              }
              const created = await createGradebookEntry(payload)
              setRows((prev) => [created, ...prev])
              setSelectedCourseId('')
              setSelectedAssignmentId('')
              setStudentEmail('')
              setNewGrade('')
              setNewFeedback('')
              setAddMsg('Grade entry added')
            } catch {
              setAddMsg('Failed to add entry')
            } finally {
              setAdding(false)
            }
          }}
        >
          <h2 className="font-medium text-gray-900">Add new grade</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            <select
              className="border rounded-md px-3 py-2"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                setSelectedAssignmentId('')
              }}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              className="border rounded-md px-3 py-2"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
            >
              <option value="">Select assignment</option>
              {assignments
                .filter((a) => !selectedCourseId || String(a.courseId) === String(selectedCourseId))
                .map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
            </select>
            <select
              className="border rounded-md px-3 py-2"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.email} value={s.email}>{s.email}</option>
              ))}
            </select>
            <input
              type="number"
              className="border rounded-md px-3 py-2"
              placeholder="Grade (0-100)"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
            />
          </div>
          <textarea
            className="border rounded-md px-3 py-2 mt-2"
            rows={2}
            placeholder="Feedback (optional)"
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
          />
          <div className="flex items-center gap-3 mt-2">
            <button type="submit" disabled={adding} className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-60">
              {adding ? 'Adding…' : 'Add Grade'}
            </button>
            {addMsg && <span className="text-sm text-gray-600">{addMsg}</span>}
          </div>
        </form>
      )}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left border">Course</th>
              <th className="px-3 py-2 text-left border">Assignment</th>
              {isEditor && <th className="px-3 py-2 text-left border">Student</th>}
              <th className="px-3 py-2 text-left border">Grade</th>
              <th className="px-3 py-2 text-left border">Feedback</th>
              {isEditor && <th className="px-3 py-2 text-left border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 border">{r.course}</td>
                <td className="px-3 py-2 border">{r.assignment}</td>
                {isEditor && (
                  <td className="px-3 py-2 border">{r.studentEmail}</td>
                )}
                <td className="px-3 py-2 border">
                  {isEditor ? (
                    <input
                      type="number"
                      className="border rounded-md px-2 py-1 w-20"
                      value={r.grade ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value)
                        setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, grade: val } : x)))
                      }}
                    />
                  ) : (
                    <span>{r.grade}%</span>
                  )}
                </td>
                <td className="px-3 py-2 border">
                  {isEditor ? (
                    <textarea
                      className="border rounded-md px-2 py-1 w-64"
                      rows={2}
                      value={r.feedback ?? ''}
                      onChange={(e) => setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, feedback: e.target.value } : x)))}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{r.feedback}</div>
                  )}
                </td>
                {isEditor && (
                  <td className="px-3 py-2 border">
                    <button
                      className="rounded-md bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-60"
                      disabled={savingId === r.id}
                      onClick={async () => {
                        setSavingId(r.id)
                        setSaveMsg('')
                        try {
                          const payload = { grade: r.grade, feedback: r.feedback }
                          const updated = await updateGradebookEntry(r.id, payload)
                          setRows((prev) => prev.map((x) => (x.id === r.id ? updated : x)))
                          setSaveMsg('Saved')
                        } catch {
                          setSaveMsg('Failed to save')
                        } finally {
                          setSavingId(null)
                        }
                      }}
                    >
                      {savingId === r.id ? 'Saving…' : 'Save'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {saveMsg && <p className="text-sm text-gray-600 mt-2">{saveMsg}</p>}
      </div>
    </section>
  )
}