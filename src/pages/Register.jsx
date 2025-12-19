import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')

  async function onSubmit(e) {
    e.preventDefault()
    const res = await register(name, email, password, role)
    if (res?.ok) navigate('/courses', { replace: true })
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Register</h1>
      <form className="grid gap-3 max-w-md" onSubmit={onSubmit}>
        <input className="border rounded-md px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border rounded-md px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded-md px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className="border rounded-md px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="rounded-md bg-gray-900 text-white px-3 py-2">Create Account</button>
      </form>
    </section>
  )
}