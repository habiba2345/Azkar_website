import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page container" style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p>الصفحة التي تبحث عنها غير موجودة.</p>
      <Link to="/" className="btn btn-primary">
        العودة للرئيسية
      </Link>
    </div>
  )
}
