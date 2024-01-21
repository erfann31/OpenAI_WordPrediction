# editor_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('generate_predictions/', views.generate_predictions, name='generate_predictions'),
]
