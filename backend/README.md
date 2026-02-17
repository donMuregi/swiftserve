# SwiftCar Backend

Django REST API backend for SwiftCar application.

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

- `/api/cars/` - List and create cars
- `/api/cars/<id>/` - Retrieve, update, and delete a specific car
- `/admin/` - Django admin panel
