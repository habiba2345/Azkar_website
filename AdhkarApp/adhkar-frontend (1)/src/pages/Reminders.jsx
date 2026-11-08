import { useEffect, useState } from 'react'
import {
  createNotification,
  deleteNotification,
  fetchNotifications,
  updateNotification,
} from '../api/racking'
import { getErrorMessage } from '../api/api'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

// Browser Notification API is the whole strategy here (no Firebase, no
// Service Worker, no push server) — it only works while the site is open in
// a tab, which matches what was asked for.
const NOTIFICATIONS_SUPPORTED = typeof window !== 'undefined' && 'Notification' in window

// Tracks which reminder ids already fired a notification today, so re-checking
// every few seconds doesn't spam the user repeatedly for the same reminder.
const NOTIFIED_STORAGE_KEY = 'adhkar_notified_reminders'

function loadNotifiedToday() {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    const today = new Date().toISOString().slice(0, 10)
    return parsed.date === today ? new Set(parsed.ids || []) : new Set()
  } catch {
    return new Set()
  }
}

function saveNotifiedToday(idsSet) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify({ date: today, ids: [...idsSet] }))
  } catch {
    // ignore storage errors (e.g. private browsing with storage disabled)
  }
}

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [newTime, setNewTime] = useState('06:00')
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [notifPermission, setNotifPermission] = useState(
    NOTIFICATIONS_SUPPORTED ? Notification.permission : 'unsupported'
  )

  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      const { data } = await fetchNotifications()
      setReminders(data)
      setStatus('done')
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر تحميل التذكيرات'))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Only ask for permission when the user explicitly clicks the button below —
  // never on page load.
  const handleEnableNotifications = async () => {
    if (!NOTIFICATIONS_SUPPORTED) return
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  // Polls the loaded reminders against the current time and fires a real
  // browser notification when one matches, as long as the tab stays open.
  // Each reminder notifies at most once per day (tracked in localStorage).
  useEffect(() => {
    if (!NOTIFICATIONS_SUPPORTED || notifPermission !== 'granted' || reminders.length === 0) {
      return undefined
    }

    const checkReminders = () => {
      const currentHHMM = new Date().toTimeString().slice(0, 5)
      const notifiedToday = loadNotifiedToday()
      let didNotify = false

      reminders.forEach((reminder) => {
        if (!reminder.is_enabled || !reminder.reminder_time) return
        const reminderHHMM = reminder.reminder_time.slice(0, 5)
        if (reminderHHMM === currentHHMM && !notifiedToday.has(reminder.id)) {
          new Notification('تذكير بالأذكار', {
            body: reminder.title ? `حان وقت: ${reminder.title}` : `حان الآن وقت أذكارك (${reminderHHMM})`,
          })
          notifiedToday.add(reminder.id)
          didNotify = true
        }
      })

      if (didNotify) saveNotifiedToday(notifiedToday)
    }

    checkReminders()
    const intervalId = setInterval(checkReminders, 20000)
    return () => clearInterval(intervalId)
  }, [notifPermission, reminders])

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')
    try {
      await createNotification({ title: newTitle.trim(), is_enabled: true, reminder_time: newTime })
      setNewTitle('')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر إضافة التذكير'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggle = async (reminder) => {
    try {
      const { data } = await updateNotification(reminder.id, {
        is_enabled: !reminder.is_enabled,
      })
      setReminders((list) => list.map((r) => (r.id === reminder.id ? { ...r, ...data } : r)))
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر تحديث التذكير'))
    }
  }

  const handleDelete = async (reminder) => {
    try {
      await deleteNotification(reminder.id)
      setReminders((list) => list.filter((r) => r.id !== reminder.id))
    } catch (err) {
      setError(getErrorMessage(err, 'تعذر حذف التذكير'))
    }
  }

  return (
    <div className="page container" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1>التذكيرات</h1>
        <p>أضف أوقاتًا تُذكّرك بأذكارك اليومية، وهتوصلك رسالة على إيميلك المسجّل به الحساب مع كل تذكير.</p>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        {!NOTIFICATIONS_SUPPORTED && (
          <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
            متصفحك لا يدعم إشعارات المتصفح، لكن يمكنك متابعة تذكيراتك من هذه الصفحة.
          </p>
        )}
        {NOTIFICATIONS_SUPPORTED && notifPermission === 'granted' && (
          <p style={{ margin: 0 }}>✓ تنبيهات المتصفح مفعّلة، وستصلك أثناء فتح الموقع.</p>
        )}
        {NOTIFICATIONS_SUPPORTED && notifPermission === 'default' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ margin: 0 }}>فعّل تنبيهات المتصفح لتصلك تذكيراتك أثناء فتح الموقع.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleEnableNotifications}>
              تفعيل تنبيهات المتصفح
            </button>
          </div>
        )}
        {NOTIFICATIONS_SUPPORTED && notifPermission === 'denied' && (
          <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
            تم رفض إذن الإشعارات. لتصلك التذكيرات، فعّل الإشعارات لهذا الموقع من إعدادات متصفحك ثم أعد تحميل الصفحة.
          </p>
        )}
      </div>

      <ErrorMessage message={error} />

      <form
        onSubmit={handleCreate}
        className="card"
        style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 30, flexWrap: 'wrap' }}
      >
        <div className="form-field" style={{ margin: 0, flex: 2, minWidth: 200 }}>
          <label htmlFor="reminder_title">عنوان التذكير</label>
          <input
            id="reminder_title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="مثال: أذكار الصباح"
            required
          />
        </div>
        <div className="form-field" style={{ margin: 0, flex: 1, minWidth: 140 }}>
          <label htmlFor="reminder_time">وقت التذكير</label>
          <input
            id="reminder_time"
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isCreating}>
          {isCreating ? 'جاري الإضافة...' : 'إضافة تذكير'}
        </button>
      </form>

      {status === 'loading' && <Loading />}
      {status === 'done' && reminders.length === 0 && (
        <div className="empty-state">لا توجد تذكيرات بعد. أضف أول تذكير لك أعلاه.</div>
      )}

      {status === 'done' && reminders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>{reminder.reminder_time?.slice(0, 5)}</span>
                  {reminder.sent_today && (
                    <span
                      className="badge"
                      style={{ fontSize: 12, padding: '2px 10px', color: 'var(--color-success)' }}
                      title="اتبعت لك رسالة تذكير على الإيميل النهاردة"
                    >
                      ✓ تم اليوم
                    </span>
                  )}
                </div>
                {reminder.title && (
                  <p style={{ margin: '4px 0 0', color: 'var(--color-ink-soft)', fontSize: 14 }}>
                    {reminder.title}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${reminder.is_enabled ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => handleToggle(reminder)}
                >
                  {reminder.is_enabled ? 'مُفعّل' : 'مُعطّل'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDelete(reminder)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
