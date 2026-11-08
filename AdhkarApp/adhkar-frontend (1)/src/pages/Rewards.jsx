import { useEffect, useState } from 'react'
import { fetchRewards } from '../api/rewards'
import { getErrorMessage } from '../api/api'
import RewardCard from '../components/RewardCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Rewards() {
  const [rewards, setRewards] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      const { data } = await fetchRewards()
      setRewards(data)
      setStatus('done')
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر تحميل الجوائز'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="page container">
      <div className="page-header">
        <h1>الجوائز</h1>
        <p>اجمع النقاط من إتمام الأذكار يوميًا لتفتح هذه الجوائز.</p>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorMessage message={error} onRetry={load} />}
      {status === 'done' && rewards.length === 0 && (
        <div className="empty-state">لا توجد جوائز متاحة حاليًا.</div>
      )}
      {status === 'done' && rewards.length > 0 && (
        <div className="grid grid-3">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}
    </div>
  )
}
