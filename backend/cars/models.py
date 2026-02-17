from django.db import models
from django.contrib.auth.models import User
import uuid

class CarOwner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='car_owner_profile')
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    referral_code = models.CharField(max_length=20, unique=True, blank=True)
    referral_points = models.IntegerField(default=0)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.user.email}"

class Car(models.Model):
    owner = models.ForeignKey(CarOwner, on_delete=models.CASCADE, related_name='cars')
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    registration_number = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=50)
    mileage = models.IntegerField(default=0)
    fuel_type = models.CharField(max_length=50, default='Petrol')
    transmission = models.CharField(max_length=50, default='Automatic')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - {self.registration_number}"

class Mechanic(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile')
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    passport_photo = models.ImageField(upload_to='mechanic_photos/', null=True, blank=True)
    id_number = models.CharField(max_length=50)
    license_number = models.CharField(max_length=50, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating', '-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - Rating: {self.rating}"

class Garage(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    name = models.CharField(max_length=200)
    owner_name = models.CharField(max_length=200)
    owner_phone = models.CharField(max_length=20)
    owner_email = models.EmailField()
    address = models.TextField()
    location = models.CharField(max_length=200)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='garage_profile')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.location}"

class GarageImage(models.Model):
    garage = models.ForeignKey(Garage, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='garage_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.garage.name}"

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned to Mechanic'),
        ('picked_up', 'Car Picked Up'),
        ('in_service', 'In Service at Garage'),
        ('completed', 'Service Completed'),
        ('returned', 'Car Returned'),
        ('cancelled', 'Cancelled'),
    ]
    
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='service_requests')
    owner = models.ForeignKey(CarOwner, on_delete=models.CASCADE, related_name='service_requests')
    pickup_location = models.TextField()
    preferred_date = models.DateField()
    preferred_time = models.TimeField()
    service_type = models.CharField(max_length=200)
    special_instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_mechanic = models.ForeignKey(Mechanic, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    assigned_garage = models.ForeignKey(Garage, on_delete=models.SET_NULL, null=True, blank=True, related_name='service_requests')
    # Cost fields
    garage_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Base repair cost
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)   # Customer total (repair + 5% service fee + 700 trip fee)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def get_commission_rate(self):
        """Get commission rate based on garage cost tier"""
        from decimal import Decimal
        cost = self.garage_cost
        if cost < 10000:
            return Decimal('0.10')  # 10%
        elif cost < 50000:
            return Decimal('0.08')  # 8%
        elif cost < 100000:
            return Decimal('0.06')  # 6%
        else:
            return Decimal('0.05')  # 5%

    def get_garage_commission(self):
        """Calculate the commission amount garage pays"""
        return self.garage_cost * self.get_commission_rate()

    def get_garage_earnings(self):
        """Calculate what garage earns after commission"""
        return self.garage_cost - self.get_garage_commission()

    def calculate_customer_total(self):
        """Calculate total cost for customer: repair cost + 5% service fee + 700 trip fee"""
        from decimal import Decimal
        service_fee = self.garage_cost * Decimal('0.05')
        trip_fee = Decimal('700.00')
        return self.garage_cost + service_fee + trip_fee

    def __str__(self):
        return f"Service Request #{self.id} - {self.car} - {self.status}"


class ServiceWorkItem(models.Model):
    """Items/work done by the garage on a service request"""
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='work_items')
    description = models.CharField(max_length=300)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - KSH {self.cost}"


class ServiceRecord(models.Model):
    service_request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE, related_name='service_record')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='service_records')
    mechanic_pickup = models.ForeignKey(Mechanic, on_delete=models.SET_NULL, null=True, related_name='pickups')
    mechanic_return = models.ForeignKey(Mechanic, on_delete=models.SET_NULL, null=True, blank=True, related_name='returns')
    garage = models.ForeignKey(Garage, on_delete=models.SET_NULL, null=True, related_name='service_records')
    garage_person_in_charge = models.CharField(max_length=200, blank=True)
    date_taken = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(null=True, blank=True)
    date_returned = models.DateTimeField(null=True, blank=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Service Record #{self.id} - {self.car}"

class ServiceItem(models.Model):
    service_record = models.ForeignKey(ServiceRecord, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item_name} - ${self.cost}"

class Notification(models.Model):
    RECIPIENT_CHOICES = [
        ('mechanic', 'Mechanic'),
        ('garage', 'Garage'),
        ('owner', 'Car Owner'),
    ]
    
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_CHOICES)
    recipient_mechanic = models.ForeignKey(Mechanic, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    recipient_garage = models.ForeignKey(Garage, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    recipient_owner = models.ForeignKey(CarOwner, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient_type}"


class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='category_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Product Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)
    stock = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def is_on_sale(self):
        return self.sale_price is not None and self.sale_price < self.price

    @property
    def discount_percentage(self):
        if self.is_on_sale:
            return int(((self.price - self.sale_price) / self.price) * 100)
        return 0


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    customer = models.ForeignKey(CarOwner, on_delete=models.SET_NULL, null=True, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    phone_number = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total = self.price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"


class ServiceInquiry(models.Model):
    """Model for service inquiries from the public service pages"""
    SERVICE_TYPE_CHOICES = [
        ('fleet_management', 'Fleet Management'),
        ('ntsa_inspection', 'NTSA Inspection'),
        ('dedicated_drivers', 'Dedicated Drivers'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('in_progress', 'In Progress'),
        ('converted', 'Converted to Client'),
        ('closed', 'Closed'),
    ]
    
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Contact Information
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Inquiry Data (stored as JSON for flexibility)
    inquiry_data = models.JSONField(default=dict)
    
    # Admin notes
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Service Inquiries'

    def __str__(self):
        return f"{self.get_service_type_display()} - {self.company_name} ({self.created_at.strftime('%Y-%m-%d')})"
