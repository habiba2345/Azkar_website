export default function Loading({ label = 'جاري التحميل...' }) {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}
