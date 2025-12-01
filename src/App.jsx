import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Courses from './pages/Courses.jsx'
import Assignments from './pages/Assignments.jsx'
import Gradebook from './pages/Gradebook.jsx'
import Announcements from './pages/Announcements.jsx'
import Submissions from './pages/Submissions.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import AssignmentDetail from './pages/AssignmentDetail.jsx'
import { useAuth } from './context/AuthContext.jsx'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl sm:text-3xl font-semibold text-purple-700 hover:text-purple-800">SmartLearn</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/courses" className="text-gray-700 hover:text-gray-900">Courses</Link>
          <Link to="/assignments" className="text-gray-700 hover:text-gray-900">Assignments</Link>
          <Link to="/gradebook" className="text-gray-700 hover:text-gray-900">Gradebook</Link>
          <Link to="/announcements" className="text-gray-700 hover:text-gray-900">Announcements</Link>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Link to="/submissions" className="text-gray-700 hover:text-gray-900">Submissions</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/register" className="text-gray-700 hover:text-gray-900">Create Account</Link>
          )}
          {user ? (
            <>
              <span className="text-gray-600">{user.email} ({user.role})</span>
              <button onClick={handleLogout} className="inline-flex items-center rounded-md border px-3 py-1.5 text-gray-700 hover:bg-gray-50">Logout</button>
            </>
          ) : (
            <Link to="/login" className="ml-1 inline-flex items-center rounded-md border px-3 py-1.5 text-gray-700 hover:bg-gray-50">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

const PageShell = ({ title, children }) => (
  <section className="max-w-6xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h1>
    <div className="bg-white border rounded-lg p-6">{children}</div>
  </section>
)

  const Home = () => (
  <PageShell title="Welcome to SmartLearn LMS">
    <p className="text-gray-700">A minimal, responsive LMS built with React + Tailwind.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <CardLink to="/courses" label="Browse Courses" />
      <CardLink to="/assignments" label="Assignments & Quizzes" />
      <CardLink to="/gradebook" label="Gradebook" />
      <CardLink to="/announcements" label="Announcements" />
    </div>
  </PageShell>
)

const CardLink = ({ to, label }) => (
  <Link to={to} className="block border rounded-lg p-4 hover:bg-gray-50">
    <span className="font-medium text-gray-900">{label}</span>
    <p className="text-sm text-gray-600">Go to {label.toLowerCase()}.</p>
  </Link>
)

// Login moved to src/pages/Login.jsx

// Register moved to src/pages/Register.jsx

// Dashboard feature removed

// Removed unused RoleCard component

// Courses moved to src/pages/Courses.jsx

// Assignments moved to src/pages/Assignments.jsx

// Gradebook moved to src/pages/Gradebook.jsx

// Announcements moved to src/pages/Announcements.jsx

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:id"
            element={
              <ProtectedRoute>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gradebook"
            element={
              <ProtectedRoute>
                <Gradebook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute roles={["admin", "teacher"]}>
                <Submissions />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
