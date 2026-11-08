export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px 0',
        textAlign: 'center',
        color: 'var(--color-ink-soft)',
        fontSize: 14,
      }}
    >
      <div className="container">
        <p style={{ margin: 0 }}>﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾</p>
        <p style={{ margin: '4px 0 0', fontSize: 13 }}>
          أذكاري © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
