import { resolveMediaUrl } from '../api/api'

// Reward "tiers" are derived purely from points_threshold — nothing is
// added to the database. Existing rewards automatically get a ring color
// and fallback icon that matches how demanding they are, instead of every
// unlocked reward looking identical.
const TIERS = [
  { max: 800, ring: 'var(--color-ink-soft)', glow: 'var(--color-border)', icon: '⭐' },
  { max: 4000, ring: 'var(--color-camel)', glow: 'var(--color-camel-light)', icon: '🏅' },
  { max: 10000, ring: 'var(--color-success)', glow: '#d3e6d9', icon: '🌿' },
  { max: Infinity, ring: 'var(--color-burgundy)', glow: '#efd9a3', icon: '👑' },
]

function getTier(pointsThreshold) {
  const points = pointsThreshold ?? 0
  return TIERS.find((tier) => points <= tier.max) ?? TIERS[TIERS.length - 1]
}

export default function RewardCard({ reward, unlocked = false, unlockedAt }) {
  const title = reward.title ?? reward.reward_details
  const description = reward.description ?? reward.reward_description
  const image = resolveMediaUrl(reward.image ?? reward.reward_image)
  const tier = getTier(reward.points_threshold)

  return (
    <article
      className="card card-hover fade-in"
      style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
    >
      {/* Circular "medal" frame: cropping every reward image into the same
          circle (regardless of its original photo/illustration aspect ratio)
          makes mismatched source images (a real photo next to a cartoon icon)
          read as one consistent badge style. The ring color now also encodes
          the reward's tier (how many points it needs) instead of always
          being the same camel color. */}
      <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 14 }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--color-cream-alt)',
            border: `3px solid ${unlocked ? tier.ring : 'var(--color-border)'}`,
            boxShadow: unlocked ? `0 0 0 4px ${tier.glow}` : 'none',
            filter: unlocked ? 'none' : 'grayscale(70%)',
            opacity: unlocked ? 1 : 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <span
            style={{
              fontSize: 36,
              display: image ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {tier.icon}
          </span>
        </div>

        {/* Small sticker badge in the corner instead of a full-width banner —
            a compact ✓/🔒 sticker feels more like an achievement medal, and
            its color matches the tier ring when unlocked. */}
        <span
          title={unlocked ? 'مفتوحة' : 'مغلقة'}
          style={{
            position: 'absolute',
            bottom: -2,
            insetInlineEnd: -2,
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(43, 32, 28, 0.18)',
            background: unlocked ? tier.ring : '#fff',
            color: unlocked ? '#fff' : 'var(--color-ink-soft)',
          }}
        >
          {unlocked ? '✓' : '🔒'}
        </span>
      </div>

      <h3 style={{ fontSize: 17, margin: '0 0 4px' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: 13.5, margin: 0 }}>{description}</p>
      )}
      {!unlocked && reward.points_threshold != null && (
        <span className="badge" style={{ marginTop: 10 }}>
          تحتاج {reward.points_threshold} نقطة
        </span>
      )}
      {unlocked && unlockedAt && (
        <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 8, marginBottom: 0 }}>
          فُتحت في {new Date(unlockedAt).toLocaleDateString('ar-EG')}
        </p>
      )}
    </article>
  )
}
