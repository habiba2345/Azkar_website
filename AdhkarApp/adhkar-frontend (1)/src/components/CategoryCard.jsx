import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/adhkar?category=${encodeURIComponent(category.name)}`}
      className="card card-hover fade-in"
      style={{ padding: 24, display: 'block' }}
    >
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>{category.name}</h3>
      {category.description && (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: 14, minHeight: 42 }}>
          {category.description}
        </p>
      )}
      <span className="badge">{category.adhkar_count ?? 0} ذكر</span>
    </Link>
  )
}
