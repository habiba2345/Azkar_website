import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../api/adhkar'
import { getErrorMessage } from '../api/api'
import CategoryCard from '../components/CategoryCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      const { data } = await fetchCategories()
      setCategories(data.slice(0, 6))
      setStatus('done')
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر تحميل الأقسام'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <section
        style={{
          background: 'linear-gradient(160deg, var(--color-burgundy) 0%, var(--color-burgundy-dark) 100%)',
          color: 'var(--color-cream)',
          padding: '72px 0',
          textAlign: 'center',
        }}
      >
        <div className="container fade-in">
          <p style={{ letterSpacing: 2, color: 'var(--color-camel-light)', fontWeight: 700, marginBottom: 10 }}>
            بسم الله الرحمن الرحيم
          </p>
          <h1 style={{ color: 'var(--color-cream)', fontSize: 'clamp(30px, 5vw, 46px)' }}>
            أذكاري
          </h1>
          <p style={{ maxWidth: 560, margin: '0 auto 28px', color: 'var(--color-camel-light)', fontSize: 17 }}>
            رفيقك اليومي لأذكار الصباح والمساء وكل أوقاتك، احفظ تقدمك، واكسب النقاط والجوائز
            مع كل ذكر تُتمّه بقلبٍ حاضر.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/adhkar" className="btn btn-secondary">
              ابدأ بالأذكار
            </Link>
            <Link to="/categories" className="btn btn-outline" style={{ borderColor: 'var(--color-camel-light)', color: 'var(--color-cream)' }}>
              تصفح الأقسام
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '56px 0 0' }}>
        <div className="page-header">
          <h2>الأقسام</h2>
          <p>اختر القسم المناسب لوقتك، واستمر في أذكارك اليومية بسهولة وطمأنينة.</p>
        </div>

        {status === 'loading' && <Loading label="جاري تحميل الأقسام..." />}
        {status === 'error' && <ErrorMessage message={error} onRetry={load} />}
        {status === 'done' && categories.length === 0 && (
          <div className="empty-state">لا توجد أقسام متاحة حاليًا.</div>
        )}
        {status === 'done' && categories.length > 0 && (
          <div className="grid grid-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} category={cat} />
            ))}
          </div>
        )}

        {status === 'done' && categories.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link to="/categories" className="btn btn-outline">
              عرض كل الأقسام
            </Link>
          </div>
        )}
      </section>

      <section
        className="container"
        style={{
          margin: '64px auto 0',
          padding: '40px',
          background: 'var(--color-cream-alt)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: 10 }}>ذِكر الله طمأنينة القلب</h2>
        <p style={{ color: 'var(--color-ink-soft)', maxWidth: 600, margin: '0 auto' }}>
          داوم على أذكارك كل يوم، فهي زاد الروح وسكينة القلب. سجّل دخولك لتتبّع نقاطك
          وتفتح جوائز جديدة مع كل خطوة على هذا الطريق.
        </p>
      </section>
    </div>
  )
}
