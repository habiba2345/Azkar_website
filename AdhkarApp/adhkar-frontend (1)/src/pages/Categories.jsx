import { useEffect, useState } from 'react'
import { fetchCategories } from '../api/adhkar'
import { getErrorMessage } from '../api/api'
import CategoryCard from '../components/CategoryCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      const { data } = await fetchCategories()
      setCategories(data)
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
    <div className="page container">
      <div className="page-header">
        <h1>الأقسام</h1>
        <p>تصفح جميع أقسام الأذكار، واختر ما يناسب وقتك وحالك.</p>
      </div>

      {status === 'loading' && <Loading />}
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
    </div>
  )
}
