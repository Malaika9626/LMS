const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const jsonFetch = async (path, options = {}) => {
  let token = null
  try { token = localStorage.getItem('auth_token') } catch {}
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const getCourses = () => jsonFetch('/courses')
export const getCourseById = (id) => jsonFetch(`/courses/${id}`)
export const updateCourse = (id, payload) =>
  jsonFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const createCourse = (payload) =>
  jsonFetch('/courses', { method: 'POST', body: JSON.stringify(payload) })
export const getAssignments = () => jsonFetch('/assignments')
export const getAssignmentById = (id) => jsonFetch(`/assignments/${id}`)
export const createAssignment = (payload) =>
  jsonFetch('/assignments', { method: 'POST', body: JSON.stringify(payload) })
export const submitAssignment = (id, payload) =>
  jsonFetch(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(payload) })
export const getMySubmission = (id) => jsonFetch(`/assignments/${id}/submission/me`)
export const getSubmissions = (params = {}) => {
  const qs = new URLSearchParams()
  if (params.assignmentId) qs.set('assignmentId', params.assignmentId)
  if (params.courseId) qs.set('courseId', params.courseId)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return jsonFetch(`/submissions${suffix}`)
}
export const getAnnouncements = () => jsonFetch('/announcements')
export const postAnnouncement = (payload) =>
  jsonFetch('/announcements', { method: 'POST', body: JSON.stringify(payload) })
export const updateAnnouncement = (id, payload) =>
  jsonFetch(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const getGradebook = () => jsonFetch('/gradebook')
export const createGradebookEntry = (payload) =>
  jsonFetch('/gradebook', { method: 'POST', body: JSON.stringify(payload) })
export const updateGradebookEntry = (id, payload) =>
  jsonFetch(`/gradebook/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

// Users
export const getStudents = () => jsonFetch('/students')

export const authLogin = ({ email, password }) =>
  jsonFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
export const authRegister = ({ email, password, role }) =>
  jsonFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) })

export { BASE_URL }