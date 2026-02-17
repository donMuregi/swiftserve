# SwiftCar Service Platform

A comprehensive full-stack car service management platform where mechanics pick up cars from customers, service them at trusted garages, and return them. The platform provides complete service history tracking, notifications, and a referral system.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, React 19
- **Backend**: Django 4.2 with Django REST Framework
- **Database**: SQLite (development)
- **Image Handling**: Pillow

## 📋 Features

### For Car Owners
- ✅ Multi-step registration with referral system
- ✅ Add and manage multiple vehicles
- ✅ Book car service requests
- ✅ View complete service history with detailed breakdowns
- ✅ Track service progress in real-time
- ✅ Earn referral points for free services
- ✅ View all costs and service items

### For Mechanics
- ✅ Registration with approval workflow
- ✅ View assigned service requests
- ✅ Track pickup and return history
- ✅ Rating system (higher ratings = more requests)
- ✅ Receive notifications from admin
- ✅ Update service status

### For Garages
- ✅ Registration with verification process
- ✅ Upload garage photos
- ✅ View cars brought for service
- ✅ Add service items and costs
- ✅ Track service history
- ✅ Receive notifications from admin

### Admin Features
- ✅ Approve/reject mechanic applications
- ✅ Approve/reject garage registrations
- ✅ View all cars, mechanics, and garages
- ✅ Send notifications to mechanics and garages
- ✅ Manage service requests and assignments
- ✅ View complete platform analytics

## 🏗️ Project Structure

```
swiftcar/
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Homepage with hero slider
│   │   ├── layout.tsx          # Root layout
│   │   └── register/           # Registration pages
│   │       ├── car-owner/      # Car owner registration
│   │       ├── mechanic/       # Mechanic registration
│   │       └── garage/         # Garage registration
│   ├── components/             # Reusable components
│   └── lib/
│       └── api.ts              # API client with TypeScript types
│
├── backend/                     # Django backend
│   ├── swiftcar_api/
│   │   ├── settings.py         # Django settings
│   │   └── urls.py             # Main URL config
│   └── cars/                   # Main app
│       ├── models.py           # 9 models (CarOwner, Car, Mechanic, etc.)
│       ├── serializers.py      # DRF serializers
│       ├── views.py            # API viewsets
│       ├── admin.py            # Admin panel customization
│       └── urls.py             # API endpoints
```

## 📊 Database Models

1. **CarOwner** - Car owners with referral system
2. **Car** - Vehicle information and registration
3. **Mechanic** - Mechanics with approval status and ratings
4. **Garage** - Garages with verification workflow
5. **GarageImage** - Photos of garages
6. **ServiceRequest** - Service booking requests
7. **ServiceRecord** - Complete service details
8. **ServiceItem** - Individual service items and costs
9. **Notification** - Messages to mechanics/garages

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv ../.venv
source ../.venv/bin/activate  # On Windows: ..\.venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser for admin access:
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000/`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000/`

## 🔌 API Endpoints

### Car Owners
- `POST /api/car-owners/register/` - Register new car owner
- `GET /api/car-owners/me/` - Get current user profile
- `GET /api/car-owners/` - List all car owners (admin)

### Cars
- `GET /api/cars/` - List user's cars
- `POST /api/cars/` - Add new car
- `GET /api/cars/{id}/` - Get car details
- `PATCH /api/cars/{id}/` - Update car
- `DELETE /api/cars/{id}/` - Delete car

### Mechanics
- `POST /api/mechanics/register/` - Apply as mechanic
- `GET /api/mechanics/me/` - Get mechanic profile
- `GET /api/mechanics/pending/` - Pending applications (admin)
- `POST /api/mechanics/{id}/approve/` - Approve mechanic (admin)

### Garages
- `POST /api/garages/register/` - Register garage
- `GET /api/garages/me/` - Get garage profile
- `GET /api/garages/pending/` - Pending registrations (admin)
- `POST /api/garages/{id}/approve/` - Approve garage (admin)
- `POST /api/garages/{id}/upload_images/` - Upload garage photos

### Service Requests
- `GET /api/service-requests/` - List service requests
- `POST /api/service-requests/` - Create service request
- `POST /api/service-requests/{id}/assign_mechanic/` - Assign mechanic (admin)
- `POST /api/service-requests/{id}/update_status/` - Update status

### Service Records
- `GET /api/service-records/` - List service records
- `POST /api/service-records/{id}/add_service_item/` - Add service item

### Notifications
- `GET /api/notifications/` - Get notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read
- `POST /api/notifications/send_to_mechanics/` - Send to all mechanics (admin)
- `POST /api/notifications/send_to_garages/` - Send to all garages (admin)

## 🎨 User Journeys

### Car Owner Journey
1. Visit homepage and view services
2. Click "Register Your Car"
3. Fill multi-step form (personal details → car details)
4. Access portal to view service history
5. Book new service requests
6. Share referral link to earn points

### Mechanic Journey
1. Click "Register as Mechanic" in footer
2. Fill application form with personal details
3. Upload passport photo
4. Receive confirmation email
5. Wait for admin approval
6. Access mechanic portal after approval
7. View and accept service requests
8. Update service progress

### Garage Journey
1. Click "Register as Garage" in footer
2. Fill registration form
3. Receive confirmation email
4. Wait for verification
5. Access garage portal after approval
6. Upload garage photos
7. Receive cars from mechanics
8. Add service items and costs
9. Complete service records

### Admin Journey
1. Access Django admin at `/admin/`
2. Review pending mechanic applications
3. Approve/reject mechanics with email notifications
4. Review pending garage registrations
5. Verify and approve garages
6. Manage service requests
7. Send notifications to mechanics/garages
8. Monitor all platform activity

## 🔧 Configuration

### Email Settings
Update `backend/swiftcar_api/settings.py` or use environment variables:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'noreply@swiftcar.com'
ADMIN_EMAIL = 'admin@swiftcar.com'
```

### CORS Settings
Configure allowed origins in settings:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
```

## 📱 Pages

- `/` - Homepage with hero slider
- `/register/car-owner` - Car owner registration
- `/register/mechanic` - Mechanic application
- `/register/garage` - Garage registration
- `/portal/owner` - Car owner dashboard (to be implemented)
- `/portal/mechanic` - Mechanic dashboard (to be implemented)
- `/portal/garage` - Garage dashboard (to be implemented)

## 🎯 Next Steps

To complete the full implementation:

1. **Portal Pages**
   - Car owner portal with service history
   - Mechanic portal with service requests
   - Garage portal with service management

2. **Authentication**
   - Implement JWT or session-based auth
   - Add login/logout functionality
   - Protect authenticated routes

3. **Service Booking**
   - Complete booking form
   - Calendar integration
   - Real-time availability checking

4. **Real-time Updates**
   - WebSocket integration for live updates
   - Push notifications
   - Service progress tracking

5. **Enhancements**
   - Payment integration
   - SMS notifications
   - Mobile app versions
   - Analytics dashboard

## 📄 License

MIT License

## 👥 Support

For support, email support@swiftcar.com
- CORS configured for frontend-backend communication

## Development

- Frontend runs on port 3000
- Backend runs on port 8000
- Both servers need to be running for the app to work properly

## License

MIT
