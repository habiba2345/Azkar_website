import { useState } from 'react'
import { Link } from 'react-router-dom'
import { completeAdhkar } from '../api/racking'
import { updateAdhkar, deleteAdhkar } from '../api/adhkar'
import { getErrorMessage } from '../api/api'
import { useAuth } from '../hooks/useAuth'

// كارت عرض الذكر، وفيه 3 حاجات:
// 1) زرار "إتمام الذكر" (موجود من الأول) لتسجيل التقدم اليومي وكسب النقاط.
// 2) عداد تسبيح بسيط (+ / تصفير): في الأقسام العادية بيوقف عند عدد نقاط الذكر
//    بالظبط، وفي قسم "ذكر حر" بيعدّ من غير سقف (لحد ما لا نهاية).
// 3) لو الذكر ده ذكر المستخدم الخاص (is_owner)، بيظهر زراري "تعديل" و"حذف".
export default function AdhkarCard({ adhkar, onUpdated, onDeleted, onCompleted }) {
  const { isAuthenticated, refreshProfile } = useAuth()
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [message, setMessage] = useState('')

  // عداد التسبيح - بيبتدي من صفر مع كل تحميل للصفحة.
  // الأذكار اللي ليها "مالك" (owner) هي بس أذكار قسم "ذكر حر" الخاصة بالمستخدمين،
  // فديها العداد بيعدّ لحد ما لا نهاية من غير سقف. باقي الأقسام العداد بيوقف
  // عند عدد نقاط الذكر بالظبط.
  const isFreeDhikr = Boolean(adhkar.owner)
  const tasbihTarget = Math.max(1, Number(adhkar.points_value) || 1)
  const [tasbihCount, setTasbihCount] = useState(0)
  const isTasbihComplete = !isFreeDhikr && tasbihCount >= tasbihTarget

  const handleTasbihIncrement = () => {
    setTasbihCount((c) => (isFreeDhikr ? c + 1 : Math.min(c + 1, tasbihTarget)))
  }

  // حالة وضع التعديل
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(adhkar.title)
  const [editContent, setEditContent] = useState(adhkar.content)
  const [editPoints, setEditPoints] = useState(adhkar.points_value)
  const [editStatus, setEditStatus] = useState('idle') // idle | saving | error
  const [editError, setEditError] = useState('')

  const [deleteStatus, setDeleteStatus] = useState('idle') // idle | deleting | error
  const [deleteError, setDeleteError] = useState('')

  const handleComplete = async () => {
    setStatus('loading')
    setMessage('')
    try {
      await completeAdhkar(adhkar.id)
      setStatus('done')
      setMessage(`أحسنت! حصلت على ${adhkar.points_value} نقطة`)
      refreshProfile() // keep total_points in sync everywhere without a full reload
      onCompleted?.() // يحدّث بانر "أنهيت كام ذكر النهاردة" فوق
    } catch (error) {
      setStatus('error')
      setMessage(getErrorMessage(error, 'تعذر تسجيل إتمام الذكر'))
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setEditStatus('saving')
    setEditError('')
    try {
      const { data } = await updateAdhkar(adhkar.id, {
        title: editTitle,
        content: editContent,
        points_value: Number(editPoints) || 1,
      })
      setIsEditing(false)
      setEditStatus('idle')
      onUpdated?.(data)
    } catch (error) {
      setEditStatus('error')
      setEditError(getErrorMessage(error, 'تعذر حفظ التعديل'))
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(adhkar.title)
    setEditContent(adhkar.content)
    setEditPoints(adhkar.points_value)
    setEditStatus('idle')
    setEditError('')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('متأكد إنك عايز تحذف الذكر ده؟')) return
    setDeleteStatus('deleting')
    setDeleteError('')
    try {
      await deleteAdhkar(adhkar.id)
      onDeleted?.(adhkar.id)
    } catch (error) {
      setDeleteStatus('error')
      setDeleteError(getErrorMessage(error, 'تعذر حذف الذكر'))
    }
  }

  if (isEditing) {
    return (
      <article className="card fade-in adhkar-card" style={{ padding: 22, height: 'auto' }}>
        <form onSubmit={handleSaveEdit}>
          <div className="form-field">
            <label htmlFor={`title-${adhkar.id}`}>العنوان</label>
            <input
              id={`title-${adhkar.id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor={`content-${adhkar.id}`}>نص الذكر</label>
            <textarea
              id={`content-${adhkar.id}`}
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor={`points-${adhkar.id}`}>عدد النقاط</label>
            <input
              id={`points-${adhkar.id}`}
              type="number"
              min={1}
              value={editPoints}
              onChange={(e) => setEditPoints(e.target.value)}
              required
            />
          </div>
          {editError && <p style={{ color: 'var(--color-error)', fontSize: 13 }}>{editError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={editStatus === 'saving'}>
              {editStatus === 'saving' ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleCancelEdit}>
              إلغاء
            </button>
          </div>
        </form>
      </article>
    )
  }

  return (
    <article className="card card-hover fade-in adhkar-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, margin: 0 }}>{adhkar.title}</h3>
        <span className="badge" style={{ whiteSpace: 'nowrap' }}>
          {adhkar.points_value} نقطة
        </span>
      </div>

      <div className="adhkar-content">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            lineHeight: 1.9,
            color: 'var(--color-ink)',
            whiteSpace: 'pre-line',
            margin: 0,
          }}
        >
          {adhkar.content}
        </p>
      </div>

      {/* عداد التسبيح: بيعدّ لحد عدد نقاط الذكر ({tasbihTarget}) وبعدها بيوقف تلقائيًا */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          margin: '4px 0 14px',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleTasbihIncrement}
          disabled={isTasbihComplete}
          aria-label="عدّ الذكر"
          title={
            isFreeDhikr
              ? 'اضغط مع كل مرة تكرر فيها الذكر'
              : isTasbihComplete
                ? 'وصلت للعدد المطلوب'
                : 'اضغط مع كل مرة تكرر فيها الذكر'
          }
        >
          {isFreeDhikr
            ? `🔁 عدّ (${tasbihCount})`
            : isTasbihComplete
              ? `✓ اكتمل (${tasbihCount}/${tasbihTarget})`
              : `🔁 عدّ (${tasbihCount}/${tasbihTarget})`}
        </button>
        {tasbihCount > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setTasbihCount(0)}
            aria-label="تصفير العداد"
          >
            تصفير
          </button>
        )}
      </div>

      {isAuthenticated ? (
        <>
          <button
            type="button"
            className={`btn ${status === 'done' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleComplete}
            disabled={status === 'loading' || status === 'done'}
          >
            {status === 'loading' && 'جاري الحفظ...'}
            {status === 'done' && '✓ تم اليوم'}
            {status === 'idle' && 'إتمام الذكر'}
            {status === 'error' && 'حاول مرة أخرى'}
          </button>
          {message && (
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                fontSize: 13,
                color: status === 'error' ? 'var(--color-error)' : 'var(--color-success)',
              }}
            >
              {message}
            </p>
          )}
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 0 }}>
          <Link to="/login" style={{ color: 'var(--color-burgundy)', fontWeight: 700 }}>
            سجّل الدخول
          </Link>{' '}
          لتتبع تقدمك وكسب النقاط
        </p>
      )}

      {/* أزرار التعديل والحذف بتظهر بس لصاحب الذكر (ذكره الحر الخاص بيه) */}
      {adhkar.is_owner && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
            تعديل
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleDelete}
            disabled={deleteStatus === 'deleting'}
          >
            {deleteStatus === 'deleting' ? 'جاري الحذف...' : 'حذف'}
          </button>
          {deleteError && (
            <p style={{ color: 'var(--color-error)', fontSize: 13, margin: 0 }}>{deleteError}</p>
          )}
        </div>
      )}
    </article>
  )
}
