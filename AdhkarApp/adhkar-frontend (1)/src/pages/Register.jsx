import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../api/api'
import ErrorMessage from '../components/ErrorMessage'

const initialForm = { username: '', email: '', password: '', re_password: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.re_password) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setIsSubmitting(true)
    try {
      await register(form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر إنشاء الحساب'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h1>حساب جديد</h1>
        <p>انضم إلينا وابدأ في تتبع أذكارك اليومية وكسب النقاط.</p>
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
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
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
            autoComplete="new-password"
          />
        </div>

        <div className="form-field">
          <label htmlFor="re_password">تأكيد كلمة المرور</label>
          <input
            id="re_password"
            name="re_password"
            type="password"
            value={form.re_password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
        </button>

        <p className="form-footer-link">
          لديك حساب بالفعل؟ <Link to="/login">سجّل الدخول</Link>
        </p>
      </form>
    </div>
  )
}
