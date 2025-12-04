import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { submitAssignment, getAssignmentById, getMySubmission } from '../services/api.js'

export default function AssignmentDetail() {
  const { id } = useParams()
  const [file, setFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const fileInputRef = useRef(null)
  const [text, setText] = useState('')
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mySubmission, setMySubmission] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    getAssignmentById(id)
      .then((res) => { if (mounted) setAssignment(res) })
      .catch(() => { if (mounted) setError('Failed to load assignment') })
      .finally(() => { if (mounted) setLoading(false) })
    getMySubmission(id)
      .then((res) => { if (mounted) setMySubmission(res) })
      .catch(() => { /* ignore */ })
    return () => { mounted = false }
  }, [id])

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      let data64 = fileData?.data || ''
      if (file && !data64) {
        data64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result
            if (typeof result === 'string') {
              const idx = result.indexOf('base64,')
              const base64 = idx !== -1 ? result.slice(idx + 7) : ''
              resolve(base64)
            } else {
              resolve('')
            }
          }
          reader.onerror = (err) => reject(err)
          reader.readAsDataURL(file)
        })
      }
      const fileMeta = file
        ? { name: file.name, size: file.size, type: file.type, ...(data64 ? { data: data64 } : {}) }
        : null
      const res = await submitAssignment(id, { file: fileMeta, text })
      if (res?.ok) {
        alert(`Submitted assignment ${id}${file ? ' with file' : ''}${text ? ' and text' : ''}.`)
        setFile(null)
        setFileData(null)
        setText('')
        setMySubmission(res.submission || null)
      } else {
        alert('Submission failed. Please try again.')
      }
    } catch (err) {
      alert(`Submission failed: ${err?.message || 'Unexpected error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Assignment {assignment?.title ?? id}</h1>
      {assignment?.due && <p className="text-sm text-gray-600 mb-4">Deadline: {assignment.due}</p>}
      {mySubmission && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-gray-800">
          <p className="font-medium text-green-800">Already submitted</p>
          <p className="mt-1">Submitted on {new Date(mySubmission.submittedAt).toLocaleString()}.</p>
          {mySubmission.file && (
            <p className="mt-1">File: {mySubmission.file.name} ({Math.round(mySubmission.file.size / 1024)} KB)</p>
          )}
          {mySubmission.text && (
            <p className="mt-1">Text: {mySubmission.text.slice(0, 120)}{mySubmission.text.length > 120 ? '…' : ''}</p>
          )}
        </div>
      )}
      {assignment?.description && (
        <div className="text-gray-800 whitespace-pre-wrap mb-6">{assignment.description}</div>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-600">Loading…</p>}
      <form className="mt-4 grid gap-3 max-w-xl" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload file</label>
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              setFile(f)
              setFileData(null)
              if (f) {
                const reader = new FileReader()
                reader.onload = () => {
                  const result = reader.result
                  if (typeof result === 'string') {
                    const idx = result.indexOf('base64,')
                    const base64 = idx !== -1 ? result.slice(idx + 7) : ''
                    setFileData({ name: f.name, size: f.size, type: f.type, data: base64 })
                  }
                }
                reader.readAsDataURL(f)
              }
            }}
          />
          {file && !fileData?.data && (
            <p className="text-xs text-gray-500 mt-1">Preparing file…</p>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-gray-900 text-white px-3 py-1.5"
          >
            {file ? 'Change File' : 'Upload File'}
          </button>
          {file && (
            <p className="text-sm text-gray-600 mt-1">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Text submission</label>
          <textarea className="w-full border rounded-md px-3 py-2 min-h-32" placeholder="Write your solution here..." value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={`rounded-md text-white px-3 py-2 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
      <Link to="/assignments" className="mt-6 inline-block rounded-md border px-3 py-1.5 text-gray-700 hover:bg-gray-50">Back to Assignments</Link>
    </section>
  )
}