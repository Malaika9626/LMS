import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function StudentDashboard() {
  const { user } = useAuth()
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Student Dashboard</h1>
      <p className="text-gray-700 mb-4">Logged in as: <span className="font-medium">{user?.email}</span></p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900">My Courses</h3>
          <p className="text-sm text-gray-600">Access lectures, notes, and resources.</p>
          <Link to="/courses" className="mt-2 inline-block rounded-md bg-gray-900 text-white px-3 py-1.5">Go to Courses</Link>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Assignments & Quizzes</h3>
          <p className="text-sm text-gray-600">Submit work and check deadlines.</p>
          <Link to="/assignments" className="mt-2 inline-block rounded-md bg-gray-900 text-white px-3 py-1.5">Go to Assignments</Link>
        </div>
      </div>
    </section>
  )
}