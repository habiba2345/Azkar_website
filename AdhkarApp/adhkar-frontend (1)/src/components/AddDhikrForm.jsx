import { useState } from 'react'
import { createAdhkar } from '../api/adhkar'
import { getErrorMessage } from '../api/api'

// فورم إضافة "ذكر حر" - بيبان مطوي بالأول وبيتفتح بزرار.
// كل ذكر يتضاف هنا بيروح تلقائيًا لقسم "ذكر حر" (الباك اند هو اللي بيحدد ده).
export default function AddDhikrForm({ onAdded }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | error
  const [error, setError] = useState('')

  const resetForm = () => {
    setTitle('')
    setContent('')
    setError('')
    setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      // مفيش نقاط هنا - الباك اند بيدي الذكر الحر النقطة الافتراضية (1)،
      // والعداد في قسم "ذكر حر" أصلًا بيعدّ من غير سقف (مش مرتبط بالنقاط).
      const { data } = await createAdhkar({
        title: title.trim(),
        content: content.trim(),
      })
      onAdded?.(data)
      resetForm()
      setIsOpen(false)
    } catch (err) {
      setStatus('error')
      setError(getErrorMessage(err, 'تعذر إضافة الذكر'))
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={() => setIsOpen(true)}
      >
        + أضف ذكرك الخاص
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="form" style={{ maxWidth: '100%', padding: 24 }}>
      <h3 style={{ marginTop: 0, textAlign: 'center' }}>أضف ذكرًا في قسم "ذكر حر"</h3>

      <div className="form-field">
        <label htmlFor="new-dhikr-title">العنوان</label>
        <input
          id="new-dhikr-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: دعاء بعد الوضوء"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="new-dhikr-content">نص الذكر</label>
        <textarea
          id="new-dhikr-content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب نص الذكر هنا..."
          required
        />
      </div>

      {error && <p style={{ color: 'var(--color-error)', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'جاري الإضافة...' : 'إضافة الذكر'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            resetForm()
            setIsOpen(false)
          }}
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}
