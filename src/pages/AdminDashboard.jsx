import { useAuth } from '../context/AuthContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-700 mb-4">Logged in as: <span className="font-medium">{user?.email}</span></p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Manage Users</h3>
          <p className="text-sm text-gray-600">Create, update, and deactivate users.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Platform Settings</h3>
          <p className="text-sm text-gray-600">Configure global LMS options.</p>
        </div>
      </div>
    </section>
  )
}