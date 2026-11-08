import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchMyRewards } from '../api/rewards'
import { getErrorMessage } from '../api/api'
import RewardCard from '../components/RewardCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile() {
  const { user, refreshProfile } = useAuth()
  const [rewards, setRewards] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      // total_points on `user` can be stale (it's only fetched at login/init),
      // so refresh it every time this page is visited, in parallel with rewards.
      const [, rewardsRes] = await Promise.all([refreshProfile(), fetchMyRewards()])
      setRewards(rewardsRes.data)
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
        <h1>الملف الشخصي</h1>
      </div>

      <div
        className="card fade-in"
        style={{
          maxWidth: 480,
          margin: '0 auto 48px',
          padding: 28,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-camel-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            margin: '0 auto 16px',
          }}
        >
          👤
        </div>
        <h2 style={{ marginBottom: 4 }}>{user?.username}</h2>
        <p style={{ color: 'var(--color-ink-soft)', marginBottom: 18 }}>{user?.email}</p>
        <div className="badge" style={{ fontSize: 15, padding: '8px 20px' }}>
          {user?.total_points ?? 0} نقطة
        </div>
        <div style={{ marginTop: 20 }}>
          <Link to="/reminders" className="btn btn-outline btn-sm">
            إدارة التذكيرات
          </Link>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2>جوائزي</h2>
        <p>الجوائز التي فتحتها بمداومتك على الأذكار.</p>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorMessage message={error} onRetry={load} />}
      {status === 'done' && rewards.length === 0 && (
        <div className="empty-state">لم تفتح أي جوائز بعد. أكمل أذكارك لكسب النقاط!</div>
      )}
      {status === 'done' && rewards.length > 0 && (
        <div className="grid grid-3">
          {rewards.map((r, idx) => (
            <RewardCard key={idx} reward={r} unlocked unlockedAt={r.unlocked_at} />
          ))}
        </div>
      )}
    </div>
  )
}
