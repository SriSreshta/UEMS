// FILE: client/src/auth/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

// Updated mock users to match new login fields (email, ID, password, role)
const MOCK_USERS = [
  {
    role: 'student',
    email: 'student@mail.com',
    username: 'STU001', // roll number
    password: 'student123',
  },
  {
    role: 'faculty',
    email: 'faculty@mail.com',
    username: 'FAC001', // faculty ID
    password: 'faculty123',
  },
  {
    role: 'admin',
    email: 'admin@mail.com',
    username: 'ADM001', // admin ID
    password: 'admin123',
  },
]

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('uems_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = ({ email, username, password, role }) => {
    const found = MOCK_USERS.find(
      (u) =>
        u.role === role &&
        u.email === email &&
        u.username === username &&
        u.password === password
    )

    if (!found) return { ok: false, message: 'Invalid credentials' }

    const payload = {
      email: found.email,
      username: found.username,
      role: found.role,
    }

    setUser(payload)
    sessionStorage.setItem('uems_user', JSON.stringify(payload))

    return { ok: true, role: found.role }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('uems_user')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
