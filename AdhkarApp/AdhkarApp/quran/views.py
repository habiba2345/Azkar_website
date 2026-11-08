import requests
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# بنستخدم خدمة alquran.cloud - API مجاني ومفتوح لنص القرآن الكريم
QURAN_API_BASE = "https://api.alquran.cloud/v1"
DEFAULT_EDITION = "quran-uthmani"  # نص القرآن بالرسم العثماني (عربي بدون ترجمة)
CACHE_TIMEOUT = 60 * 60 * 24  # يوم كامل - نص القرآن ثابت مبيتغيرش خالص


class SurahListView(APIView):
    """
    GET /quran/surahs/
    بيرجع قائمة السور الـ 114 (الاسم بالعربي والإنجليزي، عدد الآيات، مكية/مدنية).
    متاحة لأي زائر حتى لو مش مسجل دخول.
    """
    permission_classes = []

    def get(self, request):
        cache_key = "quran_surah_list"
        data = cache.get(cache_key)
        if data is None:
            try:
                resp = requests.get(f"{QURAN_API_BASE}/surah", timeout=8)
                resp.raise_for_status()
                data = resp.json().get("data", [])
            except requests.RequestException:
                return Response(
                    {"detail": "تعذر الاتصال بخدمة القرآن الكريم حاليًا، حاول لاحقًا."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            cache.set(cache_key, data, CACHE_TIMEOUT)
        return Response(data)


class SurahDetailView(APIView):
    """
    GET /quran/surahs/<number>/
    بيرجع نص السورة كاملة (كل آياتها) بالرسم العثماني.
    تقدر تبعت ?edition=... لو عايز نسخة تانية (زي تلاوة صوتية أو ترجمة) مستقبلًا.
    """
    permission_classes = []

    def get(self, request, number):
        if not (1 <= number <= 114):
            return Response(
                {"detail": "رقم السورة لازم يكون بين 1 و 114."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        edition = request.query_params.get("edition", DEFAULT_EDITION)
        cache_key = f"quran_surah_{number}_{edition}"
        data = cache.get(cache_key)
        if data is None:
            try:
                resp = requests.get(f"{QURAN_API_BASE}/surah/{number}/{edition}", timeout=8)
                resp.raise_for_status()
                data = resp.json().get("data")
            except requests.RequestException:
                return Response(
                    {"detail": "تعذر الاتصال بخدمة القرآن الكريم حاليًا، حاول لاحقًا."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            cache.set(cache_key, data, CACHE_TIMEOUT)
        return Response(data)
