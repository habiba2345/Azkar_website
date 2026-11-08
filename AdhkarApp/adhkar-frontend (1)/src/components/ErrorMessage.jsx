export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="alert alert-error">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline btn-sm"
          style={{ marginRight: 12, marginTop: 8 }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}
