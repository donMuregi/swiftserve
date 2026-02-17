# SwiftCar Frontend

Next.js frontend application for SwiftCar.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Make sure the Django backend is running on `http://localhost:8000`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js App Router pages
- `lib/` - Utility functions and API client
- `components/` - Reusable React components

## Features

- View all available cars
- Modern, responsive design with Tailwind CSS
- TypeScript for type safety
- Integration with Django REST API backend
