from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    CarOwner, Car, Mechanic, Garage, GarageImage, 
    ServiceRequest, ServiceRecord, ServiceItem, ServiceWorkItem, Notification,
    ProductCategory, Product, Order, OrderItem
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CarOwnerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    referral_link = serializers.SerializerMethodField()
    
    class Meta:
        model = CarOwner
        fields = ['id', 'user', 'phone_number', 'address', 'referral_code', 'referral_points',
                  'referral_link', 'referred_by', 'created_at', 'updated_at']
        read_only_fields = ('referral_code', 'referral_points', 'created_at', 'updated_at')

    def get_referral_link(self, obj):
        return f"/register?ref={obj.referral_code}"

class CarOwnerRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    address = serializers.CharField()
    referral_code_used = serializers.CharField(required=False, allow_blank=True)
    # Car fields
    car_make = serializers.CharField(required=False, allow_blank=True)
    car_model = serializers.CharField(required=False, allow_blank=True)
    car_year = serializers.IntegerField(required=False)
    car_registration = serializers.CharField(required=False, allow_blank=True)
    car_color = serializers.CharField(required=False, allow_blank=True)
    car_mileage = serializers.IntegerField(required=False, default=0)
    car_fuel_type = serializers.CharField(required=False, default='petrol')
    car_transmission = serializers.CharField(required=False, default='automatic')

    class Meta:
        model = CarOwner
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'address', 'referral_code_used',
                  'car_make', 'car_model', 'car_year', 'car_registration', 'car_color', 'car_mileage', 'car_fuel_type', 'car_transmission']

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        referral_code_used = validated_data.pop('referral_code_used', None)
        
        # Extract car data
        car_data = {
            'make': validated_data.pop('car_make', ''),
            'model': validated_data.pop('car_model', ''),
            'year': validated_data.pop('car_year', None),
            'registration_number': validated_data.pop('car_registration', ''),
            'color': validated_data.pop('car_color', ''),
            'mileage': validated_data.pop('car_mileage', 0),
            'fuel_type': validated_data.pop('car_fuel_type', 'petrol'),
            'transmission': validated_data.pop('car_transmission', 'automatic'),
        }
        
        user_data = {
            'username': validated_data['email'],
            'email': validated_data['email'],
            'password': validated_data['password'],
            'first_name': validated_data['first_name'],
            'last_name': validated_data['last_name'],
        }
        
        user = User.objects.create_user(**user_data)
        
        referred_by = None
        if referral_code_used:
            try:
                referred_by = CarOwner.objects.get(referral_code=referral_code_used)
                referred_by.referral_points += 10
                referred_by.save()
            except CarOwner.DoesNotExist:
                pass
        
        car_owner = CarOwner.objects.create(
            user=user,
            phone_number=validated_data['phone_number'],
            address=validated_data['address'],
            referred_by=referred_by
        )
        
        # Create car if car data is provided
        if car_data.get('make') and car_data.get('model') and car_data.get('year') and car_data.get('registration_number'):
            Car.objects.create(
                owner=car_owner,
                **car_data
            )
        
        return car_owner

class CarSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.user.get_full_name', read_only=True)
    
    class Meta:
        model = Car
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')

class MechanicSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Mechanic
        fields = ['id', 'user', 'phone_number',
                  'rating', 'status', 'created_at', 'updated_at']
        read_only_fields = ('rating', 'status', 'created_at', 'updated_at')

class MechanicRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    address = serializers.CharField()
    id_number = serializers.CharField()
    license_number = serializers.CharField(required=False, allow_blank=True)
    passport_photo = serializers.ImageField(required=False)

    class Meta:
        model = Mechanic
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 
                 'address', 'id_number', 'license_number', 'passport_photo']

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user_data = {
            'username': validated_data['email'],
            'email': validated_data['email'],
            'password': validated_data['password'],
            'first_name': validated_data['first_name'],
            'last_name': validated_data['last_name'],
        }
        
        user = User.objects.create_user(**user_data)
        
        mechanic = Mechanic.objects.create(
            user=user,
            phone_number=validated_data['phone_number'],
            address=validated_data['address'],
            id_number=validated_data['id_number'],
            license_number=validated_data.get('license_number', ''),
            passport_photo=validated_data.get('passport_photo')
        )
        
        return mechanic

class GarageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GarageImage
        fields = '__all__'

class GarageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    images = GarageImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Garage
        fields = ['id', 'user', 'name', 'owner_name', 'address', 'location',
                  'status', 'images', 'created_at', 'updated_at']
        read_only_fields = ('status', 'created_at', 'updated_at')

class GarageRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    name = serializers.CharField()
    owner_name = serializers.CharField()
    owner_phone = serializers.CharField()
    owner_email = serializers.EmailField(required=False)
    address = serializers.CharField()
    location = serializers.CharField()

    class Meta:
        model = Garage
        fields = ['email', 'password', 'name', 'owner_name', 'owner_phone', 
                 'owner_email', 'address', 'location']

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.get('owner_email', validated_data['email'])
        user_data = {
            'username': validated_data['email'],
            'email': validated_data['email'],
            'password': validated_data['password'],
            'first_name': validated_data['owner_name'].split()[0],
            'last_name': ' '.join(validated_data['owner_name'].split()[1:]) if len(validated_data['owner_name'].split()) > 1 else '',
        }
        
        user = User.objects.create_user(**user_data)
        
        garage = Garage.objects.create(
            user=user,
            name=validated_data['name'],
            owner_name=validated_data['owner_name'],
            owner_phone=validated_data['owner_phone'],
            owner_email=email,
            address=validated_data['address'],
            location=validated_data['location']
        )
        
        return garage

class ServiceWorkItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceWorkItem
        fields = ['id', 'description', 'cost', 'created_at']
        read_only_fields = ('created_at',)


class ServiceRequestSerializer(serializers.ModelSerializer):
    car_details = CarSerializer(source='car', read_only=True)
    owner_details = CarOwnerSerializer(source='owner', read_only=True)
    mechanic_details = MechanicSerializer(source='assigned_mechanic', read_only=True)
    garage_details = GarageSerializer(source='assigned_garage', read_only=True)
    work_items = ServiceWorkItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = '__all__'
        read_only_fields = ('owner', 'assigned_mechanic', 'garage_cost', 'total_cost', 'created_at', 'updated_at')

class ServiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceItem
        fields = '__all__'

class ServiceRecordSerializer(serializers.ModelSerializer):
    items = ServiceItemSerializer(many=True, read_only=True)
    car_details = CarSerializer(source='car', read_only=True)
    mechanic_pickup_details = MechanicSerializer(source='mechanic_pickup', read_only=True)
    mechanic_return_details = MechanicSerializer(source='mechanic_return', read_only=True)
    garage_details = GarageSerializer(source='garage', read_only=True)
    
    class Meta:
        model = ServiceRecord
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',)


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('order_number', 'created_at', 'updated_at')
