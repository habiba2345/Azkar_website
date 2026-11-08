import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../api/api'
import ErrorMessage from '../components/ErrorMessage'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/profile'

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'بيانات الدخول غير صحيحة'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h1>تسجيل الدخول</h1>
        <p>مرحبًا بعودتك، سجّل دخولك لمتابعة تقدمك في الأذكار.</p>
      </div>

      <form className="form fade-in" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <div className="form-field">
          <label htmlFor="username">اسم المستخدم</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">كلمة المرور</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>

        <p className="form-footer-link">
          ليس لديك حساب؟ <Link to="/register">أنشئ حسابًا جديدًا</Link>
        </p>
      </form>
    </div>
  )
}
