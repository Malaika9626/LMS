import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/courses'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await login(email, password)
      if (res?.ok) {
        navigate(from, { replace: true })
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  // If already logged in, redirect away from login
  if (user) {
    navigate(from, { replace: true })
    return null
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Login</h1>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <input className="border rounded-md px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border rounded-md px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button type="submit" className="rounded-md bg-gray-900 text-white px-3 py-2 hover:bg-gray-800">Sign In</button>
          </form>
        </div>
      </div>
    </section>
  )
}git