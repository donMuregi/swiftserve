from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import models
from .models import (
    CarOwner, Car, Mechanic, Garage, GarageImage,
    ServiceRequest, ServiceRecord, ServiceItem, ServiceWorkItem, Notification,
    ProductCategory, Product, Order, OrderItem, ServiceInquiry
)
from .serializers import (
    CarOwnerSerializer, CarOwnerRegistrationSerializer, CarSerializer,
    MechanicSerializer, MechanicRegistrationSerializer,
    GarageSerializer, GarageRegistrationSerializer, GarageImageSerializer,
    ServiceRequestSerializer, ServiceRecordSerializer, ServiceItemSerializer,
    ServiceWorkItemSerializer, NotificationSerializer, ProductCategorySerializer, ProductSerializer,
    OrderSerializer, OrderItemSerializer
)
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    rate = '5/minute'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
@ensure_csrf_cookie
def login_view(request):
    """Login endpoint that creates a session"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to find user by email (username is set to email)
    user = authenticate(request, username=email, password=password)
    
    if user is not None:
        login(request, user)
        
        # Determine user type and return appropriate data
        user_type = 'unknown'
        user_data = {'id': user.id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name}
        
        try:
            car_owner = CarOwner.objects.get(user=user)
            user_type = 'car_owner'
            user_data['car_owner_id'] = car_owner.id
        except CarOwner.DoesNotExist:
            pass
        
        try:
            mechanic = Mechanic.objects.get(user=user)
            user_type = 'mechanic'
            user_data['mechanic_id'] = mechanic.id
            user_data['status'] = mechanic.status
        except Mechanic.DoesNotExist:
            pass
            
        try:
            garage = Garage.objects.get(user=user)
            user_type = 'garage'
            user_data['garage_id'] = garage.id
            user_data['status'] = garage.status
        except Garage.DoesNotExist:
            pass
        
        if user.is_staff:
            user_type = 'admin'
        
        return Response({
            'message': 'Login successful',
            'user_type': user_type,
            'user': user_data
        })
    else:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout endpoint"""
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Get CSRF token - call this on app load to set the CSRF cookie"""
    return Response({'message': 'CSRF cookie set'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current logged in user info"""
    user = request.user
    user_type = 'unknown'
    user_data = {'id': user.id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name}
    
    try:
        car_owner = CarOwner.objects.get(user=user)
        user_type = 'car_owner'
        user_data['car_owner_id'] = car_owner.id
    except CarOwner.DoesNotExist:
        pass
    
    try:
        mechanic = Mechanic.objects.get(user=user)
        user_type = 'mechanic'
        user_data['mechanic_id'] = mechanic.id
        user_data['status'] = mechanic.status
    except Mechanic.DoesNotExist:
        pass
        
    try:
        garage = Garage.objects.get(user=user)
        user_type = 'garage'
        user_data['garage_id'] = garage.id
        user_data['status'] = garage.status
    except Garage.DoesNotExist:
        pass
    
    if user.is_staff:
        user_type = 'admin'
    
    return Response({
        'user_type': user_type,
        'user': user_data
    })

class CarOwnerViewSet(viewsets.ModelViewSet):
    queryset = CarOwner.objects.select_related('user').all()
    serializer_class = CarOwnerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CarOwner.objects.select_related('user')
        if self.request.user.is_staff:
            return qs.all()
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = CarOwnerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            car_owner = serializer.save()
            return Response({
                'message': 'Registration successful',
                'car_owner': CarOwnerSerializer(car_owner).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            car_owner = CarOwner.objects.get(user=request.user)
            return Response(CarOwnerSerializer(car_owner).data)
        except CarOwner.DoesNotExist:
            return Response({'error': 'Car owner profile not found'}, status=status.HTTP_404_NOT_FOUND)

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.select_related('owner__user').all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Car.objects.select_related('owner__user')
        if self.request.user.is_staff:
            return qs.all()
        try:
            car_owner = CarOwner.objects.get(user=self.request.user)
            return qs.filter(owner=car_owner)
        except CarOwner.DoesNotExist:
            return Car.objects.none()

    def perform_create(self, serializer):
        car_owner = CarOwner.objects.get(user=self.request.user)
        serializer.save(owner=car_owner)

class MechanicViewSet(viewsets.ModelViewSet):
    queryset = Mechanic.objects.select_related('user').all()
    serializer_class = MechanicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Mechanic.objects.select_related('user')
        if self.request.user.is_staff:
            return qs.all()
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = MechanicRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            mechanic = serializer.save()
            
            # Send confirmation emails
            try:
                # Email to mechanic
                send_mail(
                    'SwiftCar - Application Received',
                    f'Dear {mechanic.user.get_full_name()},\n\nWe have received your application to become a SwiftCar mechanic. We will review your details and get back to you soon.\n\nThank you,\nSwiftCar Team',
                    settings.DEFAULT_FROM_EMAIL,
                    [mechanic.user.email],
                    fail_silently=True,
                )
                
                # Email to admin
                send_mail(
                    'SwiftCar - New Mechanic Application',
                    f'A new mechanic has applied:\n\nName: {mechanic.user.get_full_name()}\nEmail: {mechanic.user.email}\nPhone: {mechanic.phone_number}\n\nPlease review in the admin panel.',
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.ADMIN_EMAIL],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")
            
            return Response({
                'message': 'Application submitted successfully! We will review your details and get back to you soon.',
                'mechanic': MechanicSerializer(mechanic).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            mechanic = Mechanic.objects.get(user=request.user)
            return Response(MechanicSerializer(mechanic).data)
        except Mechanic.DoesNotExist:
            return Response({'error': 'Mechanic profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        mechanics = Mechanic.objects.filter(status='pending')
        return Response(MechanicSerializer(mechanics, many=True).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        mechanic = self.get_object()
        mechanic.status = 'approved'
        mechanic.save()
        
        # Send approval email
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
        
        return Response({'message': 'Mechanic approved successfully'})

class GarageViewSet(viewsets.ModelViewSet):
    queryset = Garage.objects.select_related('user').prefetch_related('images').all()
    serializer_class = GarageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Garage.objects.select_related('user').prefetch_related('images')
        if self.request.user.is_staff:
            return qs.all()
        # For garage owners, show their own garage
        if hasattr(self.request.user, 'garage_profile'):
            return qs.filter(user=self.request.user)
        # For drivers/mechanics and other users, show all approved garages
        return qs.filter(status='approved')

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = GarageRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            garage = serializer.save()
            
            # Send confirmation emails
            try:
                send_mail(
                    'SwiftCar - Garage Registration Received',
                    f'Dear {garage.owner_name},\n\nWe have received your garage registration. We will verify your details and get back to you soon.\n\nThank you,\nSwiftCar Team',
                    settings.DEFAULT_FROM_EMAIL,
                    [garage.owner_email],
                    fail_silently=True,
                )
                
                send_mail(
                    'SwiftCar - New Garage Registration',
                    f'A new garage has registered:\n\nName: {garage.name}\nOwner: {garage.owner_name}\nEmail: {garage.owner_email}\nPhone: {garage.owner_phone}\n\nPlease review in the admin panel.',
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.ADMIN_EMAIL],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")
            
            return Response({
                'message': 'Registration submitted successfully! We will verify your details and get back to you soon.',
                'garage': GarageSerializer(garage).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            garage = Garage.objects.get(user=request.user)
            return Response(GarageSerializer(garage).data)
        except Garage.DoesNotExist:
            return Response({'error': 'Garage profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        garages = Garage.objects.filter(status='pending')
        return Response(GarageSerializer(garages, many=True).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        garage = self.get_object()
        garage.status = 'approved'
        garage.save()
        
        # Get the frontend URL from settings or use default
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        portal_link = f'{frontend_url}/portal/garage'
        
        try:
            send_mail(
                'SwiftCar - Garage Approved',
                f'Dear {garage.owner_name},\n\n'
                f'Congratulations! Your garage "{garage.name}" registration has been approved.\n\n'
                f'You can now access your garage portal using the link below:\n\n'
                f'{portal_link}\n\n'
                f'Use your registered email ({garage.owner_email}) to log in.\n\n'
                f'Thank you for joining SwiftCar!\n\n'
                f'Best regards,\n'
                f'The SwiftCar Team',
                settings.DEFAULT_FROM_EMAIL,
                [garage.owner_email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email sending failed: {e}")
        
        return Response({'message': 'Garage approved successfully'})

    ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        garage = self.get_object()
        
        # Authorization: only the garage owner or admin can upload images
        if not request.user.is_staff and garage.user != request.user:
            return Response({'error': 'You can only upload images for your own garage'}, status=status.HTTP_403_FORBIDDEN)
        
        images = request.FILES.getlist('images')
        
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(images) > 10:
            return Response({'error': 'Maximum 10 images per upload'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate each image
        for image in images:
            if image.content_type not in self.ALLOWED_IMAGE_TYPES:
                return Response(
                    {'error': f'Invalid file type: {image.content_type}. Allowed: JPEG, PNG, WebP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if image.size > self.MAX_IMAGE_SIZE:
                return Response(
                    {'error': f'File {image.name} exceeds 5MB limit'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        for image in images:
            GarageImage.objects.create(garage=garage, image=image)
        
        return Response({'message': f'{len(images)} images uploaded successfully'})

class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.select_related(
        'car__owner__user', 'owner__user', 'assigned_mechanic__user', 'assigned_garage__user'
    ).prefetch_related('work_items').all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ServiceRequest.objects.select_related(
            'car__owner__user', 'owner__user', 'assigned_mechanic__user', 'assigned_garage__user'
        ).prefetch_related('work_items')
        
        if user.is_staff:
            return qs.all()
        
        # Car owner
        try:
            car_owner = CarOwner.objects.get(user=user)
            return qs.filter(owner=car_owner)
        except CarOwner.DoesNotExist:
            pass
        
        # Mechanic - see pending requests (to accept) plus their assigned requests
        try:
            mechanic = Mechanic.objects.get(user=user)
            # Show all pending requests + requests assigned to this mechanic
            return qs.filter(
                models.Q(status='pending') | models.Q(assigned_mechanic=mechanic)
            ).distinct()
        except Mechanic.DoesNotExist:
            pass
        
        # Garage
        try:
            garage = Garage.objects.get(user=user)
            return qs.filter(assigned_garage=garage)
        except Garage.DoesNotExist:
            pass
        
        return ServiceRequest.objects.none()

    def perform_create(self, serializer):
        car_owner = CarOwner.objects.get(user=self.request.user)
        # Save as pending - drivers will see and accept from their dashboard
        serializer.save(owner=car_owner, status='pending')

    @action(detail=True, methods=['post'])
    def accept_job(self, request, pk=None):
        """Driver accepts a pending service request"""
        service_request = self.get_object()
        
        # Check if the user is an approved mechanic/driver
        try:
            mechanic = Mechanic.objects.get(user=request.user, status='approved')
        except Mechanic.DoesNotExist:
            return Response({'error': 'Only approved drivers can accept jobs'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if request is still pending
        if service_request.status != 'pending':
            return Response({'error': 'This request has already been taken'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Assign the driver
        service_request.assigned_mechanic = mechanic
        service_request.status = 'assigned'
        service_request.save()
        
        # Notify the car owner
        Notification.objects.create(
            recipient_type='owner',
            recipient_owner=service_request.owner,
            title='Driver Assigned',
            message=f'A driver has accepted your service request and will pick up your car soon.'
        )
        
        return Response({'message': 'Job accepted successfully'})

    @action(detail=True, methods=['post'])
    def pickup_car(self, request, pk=None):
        """Driver picks up the car from owner"""
        service_request = self.get_object()
        
        try:
            mechanic = Mechanic.objects.get(user=request.user)
        except Mechanic.DoesNotExist:
            return Response({'error': 'Only drivers can perform this action'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.assigned_mechanic != mechanic:
            return Response({'error': 'You are not assigned to this request'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.status != 'assigned':
            return Response({'error': 'Cannot pick up car at this stage'}, status=status.HTTP_400_BAD_REQUEST)
        
        service_request.status = 'picked_up'
        service_request.save()
        
        # Notify owner
        Notification.objects.create(
            recipient_type='owner',
            recipient_owner=service_request.owner,
            title='Car Picked Up',
            message='Your car has been picked up by the driver and is on its way to the garage.'
        )
        
        return Response({'message': 'Car picked up successfully'})

    @action(detail=True, methods=['post'])
    def deliver_to_garage(self, request, pk=None):
        """Driver delivers car to selected garage"""
        service_request = self.get_object()
        garage_id = request.data.get('garage_id')
        
        try:
            mechanic = Mechanic.objects.get(user=request.user)
        except Mechanic.DoesNotExist:
            return Response({'error': 'Only drivers can perform this action'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.assigned_mechanic != mechanic:
            return Response({'error': 'You are not assigned to this request'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.status != 'picked_up':
            return Response({'error': 'Car must be picked up first'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            garage = Garage.objects.get(id=garage_id, status='approved')
        except Garage.DoesNotExist:
            return Response({'error': 'Garage not found'}, status=status.HTTP_404_NOT_FOUND)
        
        service_request.assigned_garage = garage
        service_request.status = 'in_service'
        service_request.save()
        
        # Notify garage
        Notification.objects.create(
            recipient_type='garage',
            recipient_garage=garage,
            title='New Car Arrived',
            message=f'A {service_request.car.make} {service_request.car.model} has been delivered for {service_request.service_type.replace("_", " ")}.'
        )
        
        # Notify owner
        Notification.objects.create(
            recipient_type='owner',
            recipient_owner=service_request.owner,
            title='Car At Garage',
            message=f'Your car has arrived at {garage.name} and service has begun.'
        )
        
        return Response({'message': 'Car delivered to garage successfully'})

    @action(detail=True, methods=['post'])
    def add_work_item(self, request, pk=None):
        """Garage adds a work item (service done) to the request"""
        service_request = self.get_object()
        
        try:
            garage = Garage.objects.get(user=request.user)
        except Garage.DoesNotExist:
            return Response({'error': 'Only garages can add work items'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.assigned_garage != garage:
            return Response({'error': 'This request is not at your garage'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.status != 'in_service':
            return Response({'error': 'Can only add work items when service is in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        description = request.data.get('description')
        cost = request.data.get('cost')
        
        if not description or cost is None:
            return Response({'error': 'Description and cost are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from decimal import Decimal
            cost = Decimal(str(cost))
        except:
            return Response({'error': 'Invalid cost value'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the work item
        work_item = ServiceWorkItem.objects.create(
            service_request=service_request,
            description=description,
            cost=cost
        )
        
        # Update garage_cost (sum of all work items)
        total_garage_cost = service_request.work_items.aggregate(total=models.Sum('cost'))['total'] or Decimal('0')
        service_request.garage_cost = total_garage_cost
        # Calculate total cost for customer
        service_request.total_cost = service_request.calculate_customer_total()
        service_request.save()
        
        return Response({
            'message': 'Work item added successfully',
            'work_item': ServiceWorkItemSerializer(work_item).data,
            'garage_cost': str(service_request.garage_cost),
            'total_cost': str(service_request.total_cost)
        })

    @action(detail=True, methods=['delete'])
    def remove_work_item(self, request, pk=None):
        """Garage removes a work item"""
        service_request = self.get_object()
        work_item_id = request.data.get('work_item_id')
        
        try:
            garage = Garage.objects.get(user=request.user)
        except Garage.DoesNotExist:
            return Response({'error': 'Only garages can remove work items'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.assigned_garage != garage:
            return Response({'error': 'This request is not at your garage'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            work_item = ServiceWorkItem.objects.get(id=work_item_id, service_request=service_request)
            work_item.delete()
            
            # Recalculate costs
            from decimal import Decimal
            total_garage_cost = service_request.work_items.aggregate(total=models.Sum('cost'))['total'] or Decimal('0')
            service_request.garage_cost = total_garage_cost
            service_request.total_cost = service_request.calculate_customer_total()
            service_request.save()
            
            return Response({
                'message': 'Work item removed',
                'garage_cost': str(service_request.garage_cost),
                'total_cost': str(service_request.total_cost)
            })
        except ServiceWorkItem.DoesNotExist:
            return Response({'error': 'Work item not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def complete_service(self, request, pk=None):
        """Garage marks service as complete"""
        service_request = self.get_object()
        
        try:
            garage = Garage.objects.get(user=request.user)
        except Garage.DoesNotExist:
            return Response({'error': 'Only garages can complete services'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.assigned_garage != garage:
            return Response({'error': 'This request is not at your garage'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.status != 'in_service':
            return Response({'error': 'Service is not in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate final costs before completing
        from decimal import Decimal
        total_garage_cost = service_request.work_items.aggregate(total=models.Sum('cost'))['total'] or Decimal('0')
        service_request.garage_cost = total_garage_cost
        service_request.total_cost = service_request.calculate_customer_total()
        service_request.status = 'completed'
        service_request.save()
        
        # Notify driver to pick up
        if service_request.assigned_mechanic:
            Notification.objects.create(
                recipient_type='mechanic',
                recipient_mechanic=service_request.assigned_mechanic,
                title='Service Complete',
                message=f'The service for {service_request.car.make} {service_request.car.model} is complete. Please pick up and return to owner.'
            )
        
        # Notify owner with cost details
        Notification.objects.create(
            recipient_type='owner',
            recipient_owner=service_request.owner,
            title='Service Complete',
            message=f'Your car service has been completed! Total cost: KSH {service_request.total_cost}. The driver will return your car soon.'
        )
        
        return Response({
            'message': 'Service marked as complete',
            'garage_cost': str(service_request.garage_cost),
            'total_cost': str(service_request.total_cost)
        })

    @action(detail=True, methods=['post'])
    def return_to_owner(self, request, pk=None):
        """Driver returns car to owner"""
        service_request = self.get_object()
        
        try:
            mechanic = Mechanic.objects.get(user=request.user)
        except Mechanic.DoesNotExist:
            return Response({'error': 'Only drivers can perform this action'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.assigned_mechanic != mechanic:
            return Response({'error': 'You are not assigned to this request'}, status=status.HTTP_403_FORBIDDEN)
        
        if service_request.status != 'completed':
            return Response({'error': 'Service must be completed first'}, status=status.HTTP_400_BAD_REQUEST)
        
        service_request.status = 'delivered'
        service_request.save()
        
        # Notify owner
        Notification.objects.create(
            recipient_type='owner',
            recipient_owner=service_request.owner,
            title='Car Returned',
            message='Your car has been returned. Thank you for using SwiftServe!'
        )
        
        return Response({'message': 'Car returned to owner successfully'})

    @action(detail=True, methods=['post'])
    def assign_mechanic(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        service_request = self.get_object()
        mechanic_id = request.data.get('mechanic_id')
        
        try:
            mechanic = Mechanic.objects.get(id=mechanic_id, status='approved')
            service_request.assigned_mechanic = mechanic
            service_request.status = 'assigned'
            service_request.save()
            return Response({'message': 'Mechanic assigned successfully'})
        except Mechanic.DoesNotExist:
            return Response({'error': 'Mechanic not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        # Only admins can use the generic update_status action
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        service_request = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(ServiceRequest.STATUS_CHOICES):
            service_request.status = new_status
            service_request.save()
            return Response({'message': 'Status updated successfully'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class ServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = ServiceRecord.objects.select_related(
        'car__owner__user', 'mechanic_pickup__user', 'mechanic_return__user', 'garage__user'
    ).prefetch_related('items').all()
    serializer_class = ServiceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ServiceRecord.objects.select_related(
            'car__owner__user', 'mechanic_pickup__user', 'mechanic_return__user', 'garage__user'
        ).prefetch_related('items')
        
        if user.is_staff:
            return qs.all()
        
        try:
            car_owner = CarOwner.objects.get(user=user)
            return qs.filter(car__owner=car_owner)
        except CarOwner.DoesNotExist:
            pass
        
        try:
            mechanic = Mechanic.objects.get(user=user)
            return qs.filter(mechanic_pickup=mechanic) | qs.filter(mechanic_return=mechanic)
        except Mechanic.DoesNotExist:
            pass
        
        try:
            garage = Garage.objects.get(user=user)
            return qs.filter(garage=garage)
        except Garage.DoesNotExist:
            pass
        
        return ServiceRecord.objects.none()

    @action(detail=True, methods=['post'])
    def add_service_item(self, request, pk=None):
        service_record = self.get_object()
        
        # Authorization: only admin or the garage assigned to this record can add items
        if not request.user.is_staff:
            try:
                garage = Garage.objects.get(user=request.user)
                if service_record.garage != garage:
                    return Response({'error': 'You are not authorized for this service record'}, status=status.HTTP_403_FORBIDDEN)
            except Garage.DoesNotExist:
                return Response({'error': 'Only garages or admins can add service items'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ServiceItemSerializer(data=request.data)
        
        if serializer.is_valid():
            item = serializer.save(service_record=service_record)
            
            # Update total cost
            service_record.total_cost += item.cost
            service_record.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Notification.objects.order_by('-created_at')
        
        if user.is_staff:
            return qs.all()
        
        try:
            car_owner = CarOwner.objects.get(user=user)
            return qs.filter(recipient_owner=car_owner)
        except CarOwner.DoesNotExist:
            pass
        
        try:
            mechanic = Mechanic.objects.get(user=user)
            return qs.filter(recipient_mechanic=mechanic)
        except Mechanic.DoesNotExist:
            pass
        
        try:
            garage = Garage.objects.get(user=user)
            return qs.filter(recipient_garage=garage)
        except Garage.DoesNotExist:
            pass
        
        return Notification.objects.none()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        
        # Authorization: ensure the notification belongs to the requesting user
        user = request.user
        authorized = user.is_staff
        if not authorized:
            try:
                car_owner = CarOwner.objects.get(user=user)
                if notification.recipient_owner == car_owner:
                    authorized = True
            except CarOwner.DoesNotExist:
                pass
            try:
                mechanic = Mechanic.objects.get(user=user)
                if notification.recipient_mechanic == mechanic:
                    authorized = True
            except Mechanic.DoesNotExist:
                pass
            try:
                garage = Garage.objects.get(user=user)
                if notification.recipient_garage == garage:
                    authorized = True
            except Garage.DoesNotExist:
                pass
        
        if not authorized:
            return Response({'error': 'You cannot mark this notification as read'}, status=status.HTTP_403_FORBIDDEN)
        
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})

    @action(detail=False, methods=['post'])
    def send_to_mechanics(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        title = request.data.get('title')
        message = request.data.get('message')
        
        mechanics = Mechanic.objects.filter(status='approved')
        for mechanic in mechanics:
            Notification.objects.create(
                recipient_type='mechanic',
                recipient_mechanic=mechanic,
                title=title,
                message=message
            )
        
        return Response({'message': f'Notification sent to {mechanics.count()} mechanics'})

    @action(detail=False, methods=['post'])
    def send_to_garages(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        title = request.data.get('title')
        message = request.data.get('message')
        
        garages = Garage.objects.filter(status='approved')
        for garage in garages:
            Notification.objects.create(
                recipient_type='garage',
                recipient_garage=garage,
                title=title,
                message=message
            )
        
        return Response({'message': f'Notification sent to {garages.count()} garages'})


class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Product.objects.select_related('category').filter(is_active=True)
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        
        if category:
            queryset = queryset.filter(category__slug=category)
        if featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = Product.objects.filter(is_active=True, is_featured=True)[:8]
        return Response(ProductSerializer(products, many=True).data)

    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        products = Product.objects.filter(is_active=True, sale_price__isnull=False)[:8]
        return Response(ProductSerializer(products, many=True).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer__user').prefetch_related('items').all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.select_related('customer__user').prefetch_related('items')
        if self.request.user.is_staff:
            return qs.all()
        try:
            car_owner = CarOwner.objects.get(user=self.request.user)
            return qs.filter(customer=car_owner)
        except CarOwner.DoesNotExist:
            return Order.objects.none()

    def perform_create(self, serializer):
        car_owner = CarOwner.objects.get(user=self.request.user)
        serializer.save(customer=car_owner)

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        try:
            car_owner = CarOwner.objects.get(user=request.user)
        except CarOwner.DoesNotExist:
            return Response({'error': 'Car owner profile required'}, status=status.HTTP_400_BAD_REQUEST)
        
        items = request.data.get('items', [])
        shipping_address = request.data.get('shipping_address')
        phone_number = request.data.get('phone_number')
        notes = request.data.get('notes', '')
        
        if not items:
            return Response({'error': 'No items in order'}, status=status.HTTP_400_BAD_REQUEST)
        
        subtotal = 0
        order_items = []
        
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'])
                quantity = item.get('quantity', 1)
                price = product.sale_price if product.is_on_sale else product.price
                total = price * quantity
                subtotal += total
                
                order_items.append({
                    'product': product,
                    'product_name': product.name,
                    'quantity': quantity,
                    'price': price,
                    'total': total
                })
            except Product.DoesNotExist:
                return Response({'error': f'Product not found: {item.get("product_id")}'}, status=status.HTTP_400_BAD_REQUEST)
        
        shipping_cost = 0 if subtotal >= 50 else 5
        total = subtotal + shipping_cost
        
        order = Order.objects.create(
            customer=car_owner,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            shipping_address=shipping_address,
            phone_number=phone_number,
            notes=notes
        )
        
        for item_data in order_items:
            OrderItem.objects.create(order=order, **item_data)
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_service_inquiry(request):
    """
    Handle service inquiry submissions for Fleet Management, NTSA Inspection, and Dedicated Drivers.
    Sends email notification to admin.
    """
    data = request.data
    
    # Required fields
    service_type = data.get('service_type')
    company_name = data.get('companyName') or data.get('institutionName') or data.get('company_name')
    contact_person = data.get('contactPerson') or data.get('contact_person')
    email = data.get('email')
    phone = data.get('phone')
    
    # Validate required fields
    if not all([service_type, company_name, contact_person, email, phone]):
        return Response(
            {'error': 'Missing required fields: service_type, company name, contact person, email, and phone are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate service type
    valid_service_types = ['fleet_management', 'ntsa_inspection', 'dedicated_drivers']
    if service_type not in valid_service_types:
        return Response(
            {'error': f'Invalid service type. Must be one of: {", ".join(valid_service_types)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Store all extra data in inquiry_data field
    inquiry_data = {k: v for k, v in data.items() if k not in ['service_type', 'companyName', 'institutionName', 'contactPerson', 'email', 'phone']}
    
    # Create the inquiry
    inquiry = ServiceInquiry.objects.create(
        service_type=service_type,
        company_name=company_name,
        contact_person=contact_person,
        email=email,
        phone=phone,
        inquiry_data=inquiry_data
    )
    
    # Prepare email content
    service_type_display = {
        'fleet_management': 'Fleet Management',
        'ntsa_inspection': 'NTSA Inspection Compliance',
        'dedicated_drivers': 'Dedicated Driver Services'
    }.get(service_type, service_type)
    
    # Build email body
    email_body = f"""
New Service Inquiry Received!

Service Type: {service_type_display}

Contact Information:
- Company/Institution: {company_name}
- Contact Person: {contact_person}
- Email: {email}
- Phone: {phone}

Additional Details:
"""
    for key, value in inquiry_data.items():
        if value:  # Only include non-empty values
            # Convert camelCase to readable format
            readable_key = ''.join(' ' + c if c.isupper() else c for c in key).strip().title()
            email_body += f"- {readable_key}: {value}\n"
    
    email_body += f"""

Submitted: {inquiry.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Please follow up with this inquiry promptly.
"""
    
    # Send email notification
    try:
        send_mail(
            subject=f'New {service_type_display} Inquiry - {company_name}',
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Failed to send email notification: {e}")
    
    # Also send confirmation email to the customer
    customer_email_body = f"""
Dear {contact_person},

Thank you for your interest in our {service_type_display} services!

We have received your inquiry and our team will contact you within 24 hours to discuss your requirements.

Inquiry Reference: INQ-{inquiry.id:06d}

If you have any urgent questions, please don't hesitate to contact us.

Best regards,
Swift Serve Team
"""
    
    try:
        send_mail(
            subject=f'Thank You for Your {service_type_display} Inquiry - Swift Serve',
            message=customer_email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send confirmation email to customer: {e}")
    
    return Response({
        'message': 'Inquiry submitted successfully',
        'reference': f'INQ-{inquiry.id:06d}'
    }, status=status.HTTP_201_CREATED)
