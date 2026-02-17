from django.contrib import admin
from django.core.mail import send_mail
from django.conf import settings
from .models import (
    CarOwner, Car, Mechanic, Garage, GarageImage,
    ServiceRequest, ServiceRecord, ServiceItem, Notification,
    ProductCategory, Product, Order, OrderItem, ServiceInquiry
)

@admin.register(CarOwner)
class CarOwnerAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'referral_code', 'referral_points', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone_number']
    list_filter = ['created_at']
    readonly_fields = ['referral_code', 'referral_points', 'created_at', 'updated_at']

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'make', 'model', 'year', 'owner', 'created_at']
    search_fields = ['registration_number', 'make', 'model', 'owner__user__email']
    list_filter = ['make', 'year', 'fuel_type', 'transmission']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Mechanic)
class MechanicAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'rating', 'status', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone_number', 'id_number']
    list_filter = ['status', 'rating', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['approve_mechanics', 'reject_mechanics']

    def approve_mechanics(self, request, queryset):
        for mechanic in queryset:
            mechanic.status = 'approved'
            mechanic.save()
            
            try:
                send_mail(
                    'SwiftCar - Application Approved',
                    f'Dear {mechanic.user.get_full_name()},\n\nCongratulations! Your application has been approved. You can now log in to your mechanic portal.\n\nThank you,\nSwiftCar Team',
                    settings.DEFAULT_FROM_EMAIL,
                    [mechanic.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")
        
        self.message_user(request, f"{queryset.count()} mechanics approved successfully")
    approve_mechanics.short_description = "Approve selected mechanics"

    def reject_mechanics(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} mechanics rejected")
    reject_mechanics.short_description = "Reject selected mechanics"

@admin.register(Garage)
class GarageAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner_name', 'location', 'status', 'created_at']
    search_fields = ['name', 'owner_name', 'owner_email', 'location']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['approve_garages', 'reject_garages']

    def approve_garages(self, request, queryset):
        for garage in queryset:
            garage.status = 'approved'
            garage.save()
            
            try:
                send_mail(
                    'SwiftCar - Garage Approved',
                    f'Dear {garage.owner_name},\n\nCongratulations! Your garage registration has been approved. You can now log in to your garage portal.\n\nThank you,\nSwiftCar Team',
                    settings.DEFAULT_FROM_EMAIL,
                    [garage.owner_email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")
        
        self.message_user(request, f"{queryset.count()} garages approved successfully")
    approve_garages.short_description = "Approve selected garages"

    def reject_garages(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} garages rejected")
    reject_garages.short_description = "Reject selected garages"

@admin.register(GarageImage)
class GarageImageAdmin(admin.ModelAdmin):
    list_display = ['garage', 'uploaded_at']
    list_filter = ['uploaded_at']

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'car', 'owner', 'status', 'assigned_mechanic', 'assigned_garage', 'created_at']
    search_fields = ['car__registration_number', 'owner__user__email', 'service_type']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

class ServiceItemInline(admin.TabularInline):
    model = ServiceItem
    extra = 1

@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'car', 'garage', 'mechanic_pickup', 'total_cost', 'date_taken']
    search_fields = ['car__registration_number', 'garage__name']
    list_filter = ['date_taken', 'garage']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ServiceItemInline]

@admin.register(ServiceItem)
class ServiceItemAdmin(admin.ModelAdmin):
    list_display = ['service_record', 'item_name', 'cost', 'created_at']
    search_fields = ['item_name', 'service_record__car__registration_number']
    list_filter = ['created_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient_type', 'is_read', 'created_at']
    search_fields = ['title', 'message']
    list_filter = ['recipient_type', 'is_read', 'created_at']
    readonly_fields = ['created_at']
    
    actions = ['send_to_all_mechanics', 'send_to_all_garages']

    def send_to_all_mechanics(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Please select only one notification to send", level='error')
            return
        
        notification = queryset.first()
        mechanics = Mechanic.objects.filter(status='approved')
        
        for mechanic in mechanics:
            Notification.objects.create(
                recipient_type='mechanic',
                recipient_mechanic=mechanic,
                title=notification.title,
                message=notification.message
            )
        
        self.message_user(request, f"Notification sent to {mechanics.count()} mechanics")
    send_to_all_mechanics.short_description = "Send to all approved mechanics"

    def send_to_all_garages(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Please select only one notification to send", level='error')
            return
        
        notification = queryset.first()
        garages = Garage.objects.filter(status='approved')
        
        for garage in garages:
            Notification.objects.create(
                recipient_type='garage',
                recipient_garage=garage,
                title=notification.title,
                message=notification.message
            )
        
        self.message_user(request, f"Notification sent to {garages.count()} garages")
    send_to_all_garages.short_description = "Send to all approved garages"


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ['total']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'sale_price', 'stock', 'is_featured', 'is_active']
    list_filter = ['category', 'is_featured', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    list_editable = ['is_featured', 'is_active', 'stock']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'customer__user__email', 'phone_number']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'quantity', 'price', 'total']
    search_fields = ['order__order_number', 'product_name']


@admin.register(ServiceInquiry)
class ServiceInquiryAdmin(admin.ModelAdmin):
    list_display = ['service_type', 'company_name', 'contact_person', 'email', 'phone', 'status', 'created_at']
    list_filter = ['service_type', 'status', 'created_at']
    search_fields = ['company_name', 'contact_person', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'inquiry_data']
    list_editable = ['status']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('company_name', 'contact_person', 'email', 'phone')
        }),
        ('Inquiry Details', {
            'fields': ('service_type', 'status', 'inquiry_data')
        }),
        ('Admin', {
            'fields': ('admin_notes', 'created_at', 'updated_at')
        }),
    )