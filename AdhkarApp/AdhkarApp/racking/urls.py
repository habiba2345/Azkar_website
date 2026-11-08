from django.urls import path
from .views import *
urlpatterns = [
    path('userprogress/',RecordAdhkarProgressView.as_view()),
    path('today-summary/', TodaySummaryView.as_view()),
    path('notifications/', NotificationListCreate.as_view()),
    path('notifications/<int:pk>/', NotificationDetail.as_view()),
]