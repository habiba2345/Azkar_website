from django.urls import path
from .views import *
urlpatterns = [
    path('reward/',ListCreateReward.as_view()),
    path('reward/<int:pk>/',GetUpdateDeleteReward.as_view()),
    path('userprofile/',UserProfileView.as_view()),
    path('MyReward/',UserRewardList.as_view()),
]