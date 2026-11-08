// بانر بسيط بيقول للمستخدم كام ذكر خلّصه النهاردة، مع رسالة تشجيع بتتغير
// حسب العدد. البيانات جايه من GET /racking/today-summary/.
function encouragement(count) {
  if (count <= 0) return 'ابدأ يومك بذكر الله، كل ذكر بخطوة أقرب لطمأنينة القلب 🤍'
  if (count < 3) return 'بداية طيبة! كمّل على نفس النية 🌿'
  if (count < 6) return 'ما شاء الله، مستمر بشكل جميل اليوم ✨'
  return 'بارك الله فيك، يوم حافل بالذكر! 🌙'
}

export default function TodayProgress({ summary }) {
  if (!summary) return null
  const { completed_today: completedToday = 0, points_today: pointsToday = 0 } = summary

  return (
    <div
      className="card fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        padding: '16px 22px',
        margin: '0 auto 26px',
        maxWidth: 640,
        background: 'var(--color-cream-alt)',
      }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
          أنهيت <span style={{ color: 'var(--color-burgundy)' }}>{completedToday}</span>{' '}
          {completedToday === 1 ? 'ذكرًا' : 'أذكار'} اليوم
          {pointsToday > 0 && <> وكسبت {pointsToday} نقطة</>}
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-ink-soft)', fontSize: 14 }}>
          {encouragement(completedToday)}
        </p>
      </div>
    </div>
  )
}
