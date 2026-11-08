import api from './api'

// GET /adhkar/categories/ -> [{ name, description, adhkar_count }]
// Note: the backend does not expose a category id, so we can't filter/link by id.
// We instead filter the adhkar list by category name using the search endpoint below.
export function fetchCategories(search = '') {
  const params = search ? { search } : {}
  return api.get('/adhkar/categories/', { params })
}

// GET /adhkar/adhkar/ -> [{ id, category, title, content, points_value }]
// `search` matches against title OR category__name (backend SearchFilter on ['title','category__name'])
export function fetchAdhkarList(search = '') {
  const params = search ? { search } : {}
  return api.get('/adhkar/adhkar/', { params })
}

export function fetchAdhkarDetail(id) {
  return api.get(`/adhkar/adhkar/${id}/`)
}

// اسم القسم الثابت اللي بيروح له أي ذكر يضيفه المستخدم بنفسه (لازم يطابق
// FREE_CATEGORY_NAME في adhkar/models.py على الباك اند)
export const FREE_CATEGORY_NAME = 'ذكر حر'

// POST /adhkar/adhkar/ -> الباك اند بيحط الذكر تلقائيًا في قسم "ذكر حر"
// ويخلي المستخدم الحالي هو "المالك"، مهما كانت قيمة category اللي بنبعتها.
// مفيش points_value هنا - المستخدم بيضيف العنوان والنص بس، والباك اند
// بيدي القيمة الافتراضية (1) لوحده.
export function createAdhkar({ title, content }) {
  return api.post('/adhkar/adhkar/', { title, content })
}

// PATCH /adhkar/adhkar/<id>/ -> متاح بس لصاحب الذكر (أو الأدمن)
export function updateAdhkar(id, { title, content, points_value }) {
  return api.patch(`/adhkar/adhkar/${id}/`, { title, content, points_value })
}

// DELETE /adhkar/adhkar/<id>/ -> متاح بس لصاحب الذكر (أو الأدمن)
export function deleteAdhkar(id) {
  return api.delete(`/adhkar/adhkar/${id}/`)
}
