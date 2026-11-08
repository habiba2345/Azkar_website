import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAdhkarList, FREE_CATEGORY_NAME } from '../api/adhkar'
import { fetchTodaySummary } from '../api/racking'
import { getErrorMessage } from '../api/api'
import { useAuth } from '../hooks/useAuth'
import AdhkarCard from '../components/AdhkarCard'
import AddDhikrForm from '../components/AddDhikrForm'
import TodayProgress from '../components/TodayProgress'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function AdhkarPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const [searchInput, setSearchInput] = useState(category)
  const [adhkarList, setAdhkarList] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [todaySummary, setTodaySummary] = useState(null)

  // بيتحدّث أول ما الصفحة تفتح، وبعد كل مرة المستخدم يتمّ ذكرًا (عشان
  // البانر التشجيعي فوق يفضل معبّر عن العدد الفعلي لحظة بلحظة)
  const loadTodaySummary = async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await fetchTodaySummary()
      setTodaySummary(data)
    } catch {
      // بانر تشجيعي بس، مش أساسي - لو فشل نتجاهله بهدوء
    }
  }

  useEffect(() => {
    loadTodaySummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // بنبين فورم "إضافة ذكر حر" في حالتين: المستخدم فلتر على قسم "ذكر حر" بالاسم،
  // أو أصلًا مفيش فلتر (بيشوف كل الأذكار) - علشان يقدر يضيف ذكره في أي وقت.
  const showAddForm = isAuthenticated && (!category || category.trim() === FREE_CATEGORY_NAME)

  const handleDhikrAdded = (newDhikr) => {
    setAdhkarList((list) => [newDhikr, ...list])
  }

  const handleDhikrUpdated = (updatedDhikr) => {
    setAdhkarList((list) => list.map((item) => (item.id === updatedDhikr.id ? updatedDhikr : item)))
  }

  const handleDhikrDeleted = (deletedId) => {
    setAdhkarList((list) => list.filter((item) => item.id !== deletedId))
  }

  const load = async (query) => {
    setStatus('loading')
    setError('')
    try {
      const { data } = await fetchAdhkarList(query)
      setAdhkarList(data)
      setStatus('done')
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر تحميل الأذكار'))
      setStatus('error')
    }
  }

  useEffect(() => {
    setSearchInput(category)
    load(category)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ category: searchInput.trim() })
    } else {
      setSearchParams({})
    }
  }

  const clearFilter = () => {
    setSearchInput('')
    setSearchParams({})
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h1>الأذكار</h1>
        <p>اقرأ الذكر بحضور قلب، ثم اضغط "إتمام الذكر" لتسجيل تقدمك اليومي.</p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        style={{ display: 'flex', gap: 10, maxWidth: 480, margin: '0 auto 30px', flexWrap: 'wrap' }}
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ابحث بالعنوان أو اسم القسم..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: '11px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--color-border)',
            background: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
          }}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          بحث
        </button>
        {category && (
          <button type="button" className="btn btn-outline btn-sm" onClick={clearFilter}>
            إزالة الفلتر
          </button>
        )}
      </form>

      {category && status !== 'loading' && (
        <p style={{ textAlign: 'center', color: 'var(--color-ink-soft)', marginTop: -14, marginBottom: 24 }}>
          نتائج البحث عن: <strong style={{ color: 'var(--color-burgundy)' }}>{category}</strong>
        </p>
      )}

      {isAuthenticated && <TodayProgress summary={todaySummary} />}

      {showAddForm && (
        <div style={{ maxWidth: 480, margin: '0 auto 30px' }}>
          <AddDhikrForm onAdded={handleDhikrAdded} />
        </div>
      )}

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorMessage message={error} onRetry={() => load(category)} />}
      {status === 'done' && adhkarList.length === 0 && (
        <div className="empty-state">لا توجد أذكار مطابقة لبحثك.</div>
      )}
      {status === 'done' && adhkarList.length > 0 && (
        <div className="grid grid-2">
          {adhkarList.map((item) => (
            <AdhkarCard
              key={item.id}
              adhkar={item}
              onUpdated={handleDhikrUpdated}
              onDeleted={handleDhikrDeleted}
              onCompleted={loadTodaySummary}
            />
          ))}
        </div>
      )}
    </div>
  )
}
