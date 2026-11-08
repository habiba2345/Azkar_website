from django.urls import path
from .views import SurahListView, SurahDetailView

urlpatterns = [
    path('surahs/', SurahListView.as_view()),
    path('surahs/<int:number>/', SurahDetailView.as_view()),
]
