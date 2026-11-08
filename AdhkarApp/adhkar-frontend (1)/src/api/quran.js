import api from './api'

// GET /quran/surahs/ -> قائمة السور الـ 114 (رقم السورة، الاسم بالعربي والإنجليزي،
// عدد الآيات، مكية/مدنية) - الباك اند بيكاشها فمفيش ضغط زيادة على الخدمة الخارجية
export function fetchSurahs() {
  return api.get('/quran/surahs/')
}

// GET /quran/surahs/<number>/ -> نص السورة كاملة (كل آياتها) بالرسم العثماني
export function fetchSurahDetail(number) {
  return api.get(`/quran/surahs/${number}/`)
}
