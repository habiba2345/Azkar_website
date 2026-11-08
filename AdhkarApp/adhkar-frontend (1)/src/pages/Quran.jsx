import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchSurahs, fetchSurahDetail } from '../api/quran'
import { getErrorMessage } from '../api/api'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

// نوع السورة بالعربي (الـ API بيرجعها بالإنجليزي: Meccan / Medinan)
const REVELATION_LABEL = {
  Meccan: 'مكية',
  Medinan: 'مدنية',
}

export default function Quran() {
  const [searchParams, setSearchParams] = useSearchParams()
  const surahNumber = searchParams.get('surah')

  const [surahs, setSurahs] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [listError, setListError] = useState('')

  const [surahDetail, setSurahDetail] = useState(null)
  const [detailStatus, setDetailStatus] = useState('idle') // idle | loading | done | error
  const [detailError, setDetailError] = useState('')

  // تحميل قائمة السور مرة واحدة بس عند فتح الصفحة
  const loadSurahs = async () => {
    setListStatus('loading')
    setListError('')
    try {
      const { data } = await fetchSurahs()
      setSurahs(data)
      setListStatus('done')
    } catch (err) {
      setListError(getErrorMessage(err, 'تعذر تحميل قائمة السور'))
      setListStatus('error')
    }
  }

  useEffect(() => {
    loadSurahs()
  }, [])

  // تحميل السورة المختارة كل ما رقم السورة في الرابط يتغير
  useEffect(() => {
    if (!surahNumber) {
      setSurahDetail(null)
      return
    }
    const loadDetail = async () => {
      setDetailStatus('loading')
      setDetailError('')
      try {
        const { data } = await fetchSurahDetail(surahNumber)
        setSurahDetail(data)
        setDetailStatus('done')
      } catch (err) {
        setDetailError(getErrorMessage(err, 'تعذر تحميل نص السورة'))
        setDetailStatus('error')
      }
    }
    loadDetail()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [surahNumber])

  const openSurah = (number) => setSearchParams({ surah: number })
  const backToList = () => setSearchParams({})

  return (
    <div className="page container">
      <div className="page-header">
        <h1>القرآن الكريم</h1>
        <p>اختر السورة اللي عايز تقرأها.</p>
      </div>

      {!surahNumber && (
        <>
          {listStatus === 'loading' && <Loading />}
          {listStatus === 'error' && <ErrorMessage message={listError} onRetry={loadSurahs} />}
          {listStatus === 'done' && surahs.length > 0 && (
            <div className="grid grid-3">
              {surahs.map((surah) => (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => openSurah(surah.number)}
                  className="card card-hover fade-in"
                  style={{
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: '50%',
                      background: 'var(--color-camel-light)',
                      color: 'var(--color-burgundy-dark)',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {surah.number}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700 }}>
                      {surah.name}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 4 }}>
                      {REVELATION_LABEL[surah.revelationType] || surah.revelationType} · {surah.numberOfAyahs} آية
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {surahNumber && (
        <div>
          <button type="button" className="btn btn-outline btn-sm" onClick={backToList} style={{ marginBottom: 24 }}>
            ← رجوع لقائمة السور
          </button>

          {detailStatus === 'loading' && <Loading label="جاري تحميل السورة..." />}
          {detailStatus === 'error' && (
            <ErrorMessage message={detailError} onRetry={() => setSearchParams({ surah: surahNumber })} />
          )}

          {detailStatus === 'done' && surahDetail && (
            <div className="card fade-in" style={{ padding: '32px 28px', maxWidth: 760, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: 26, marginBottom: 6 }}>{surahDetail.name}</h2>
                <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 14 }}>
                  {REVELATION_LABEL[surahDetail.revelationType] || surahDetail.revelationType} ·{' '}
                  {surahDetail.numberOfAyahs} آية
                </p>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  lineHeight: 2.4,
                  textAlign: 'justify',
                  margin: 0,
                }}
              >
                {surahDetail.ayahs?.map((ayah) => (
                  <span key={ayah.number}>
                    {ayah.text}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        margin: '0 6px',
                        borderRadius: '50%',
                        background: 'var(--color-camel-light)',
                        color: 'var(--color-burgundy-dark)',
                        fontSize: 13,
                        fontFamily: 'var(--font-body)',
                        fontWeight: 700,
                        verticalAlign: 'middle',
                      }}
                    >
                      {ayah.numberInSurah}
                    </span>{' '}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
