from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CarOwnerViewSet, CarViewSet, MechanicViewSet, GarageViewSet,
    ServiceRequestViewSet, ServiceRecordViewSet, NotificationViewSet,
    ProductCategoryViewSet, ProductViewSet, OrderViewSet,
    login_view, logout_view, current_user_view, get_csrf_token,
    submit_service_inquiry
)

router = DefaultRouter()
router.register(r'car-owners', CarOwnerViewSet, basename='car-owner')
router.register(r'cars', CarViewSet, basename='car')
router.register(r'mechanics', MechanicViewSet, basename='mechanic')
router.register(r'garages', GarageViewSet, basename='garage')
router.register(r'service-requests', ServiceRequestViewSet, basename='service-request')
router.register(r'service-records', ServiceRecordViewSet, basename='service-record')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'product-categories', ProductCategoryViewSet, basename='product-category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/user/', current_user_view, name='current-user'),
    path('auth/csrf/', get_csrf_token, name='csrf-token'),
    path('service-inquiry/', submit_service_inquiry, name='service-inquiry'),
]
