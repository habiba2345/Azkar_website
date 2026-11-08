"""
URL configuration for AdhkarApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path,include


urlpatterns = [
    path("admin/", admin.site.urls),
    #simplejwt
    #دول اقدر استغى عنهم ب 'djoser.urls.jwt'
    #path('api/login/', TokenObtainPairView.as_view()),
    #path('api/refresh/', TokenRefreshView.as_view()),
    #هنا استعملنا مكتبة جاهزة اسمها doser ع تشتغل مع مكتبة simplejwt ع ال login , register,refresh
    # to register auth/users 
    path('auth/', include('djoser.urls')),
    #to login,refresh دي اللي بتديني ال tokens auth/jwt/create,refresh
    path('auth/', include('djoser.urls.jwt')),

    path('users/',include('users.urls')),
    path('adhkar/',include('adhkar.urls')),
    path('racking/',include('racking.urls')),
    path('quran/',include('quran.urls')),
]

# Serve uploaded media files (e.g. reward images) at MEDIA_URL during local
# development. This must live at the project root, NOT be appended inside
# users/urls.py, because that file is mounted under the 'users/' prefix
# (path('users/', include('users.urls'))) which previously made Django only
# serve media at /users/media/... while every URL the API returns (built via
# request.build_absolute_uri(MEDIA_URL + ...)) points at /media/... — a
# mismatch that caused reward images to 404.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
