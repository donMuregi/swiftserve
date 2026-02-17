'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { api, Product } from '@/lib/api';
import { useCart } from '@/lib/cart';

const heroSlides = [
  {
    title: 'Car Service at Your Doorstep',
    description: 'We pick up your car from home, service it, and return it to you.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80',
  },
  {
    title: 'Trusted Mechanics & Garages',
    description: 'Your car is in safe hands with our verified professionals.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
  },
  {
    title: 'Quality Auto Parts Shop',
    description: 'Get genuine parts delivered to your doorstep or installed during service.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80',
  },
];

// Sample products (will be replaced by API data when available)
const sampleProducts: Product[] = [
  {
    id: 1,
    category: { id: 1, name: 'Engine Parts', slug: 'engine-parts', description: '', image: null },
    name: 'Premium Air Filter',
    slug: 'premium-air-filter',
    description: 'High-quality air filter for optimal engine performance',
    price: '2499',
    sale_price: '1999',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    stock: 50,
    is_featured: true,
    is_active: true,
    is_on_sale: true,
    discount_percentage: 20,
  },
  {
    id: 2,
    category: { id: 2, name: 'Brake System', slug: 'brake-system', description: '', image: null },
    name: 'Ceramic Brake Pads Set',
    slug: 'ceramic-brake-pads-set',
    description: 'Premium ceramic brake pads for smooth stopping',
    price: '8999',
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80',
    stock: 30,
    is_featured: true,
    is_active: true,
    is_on_sale: false,
    discount_percentage: 0,
  },
  {
    id: 3,
    category: { id: 3, name: 'Oil & Fluids', slug: 'oil-fluids', description: '', image: null },
    name: 'Synthetic Motor Oil 5W-30',
    slug: 'synthetic-motor-oil-5w30',
    description: 'Full synthetic motor oil for maximum engine protection',
    price: '3499',
    sale_price: '2999',
    image: 'https://images.unsplash.com/photo-1635784063459-8ac4dc37e38a?w=400&q=80',
    stock: 100,
    is_featured: true,
    is_active: true,
    is_on_sale: true,
    discount_percentage: 14,
  },
  {
    id: 4,
    category: { id: 4, name: 'Batteries', slug: 'batteries', description: '', image: null },
    name: 'Heavy Duty Car Battery',
    slug: 'heavy-duty-car-battery',
    description: '12V 600CCA battery with 3-year warranty',
    price: '14999',
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400&q=80',
    stock: 25,
    is_featured: true,
    is_active: true,
    is_on_sale: false,
    discount_percentage: 0,
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const { addToCart, getCartCount } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredProducts = await api.getFeaturedProducts();
        if (featuredProducts.length > 0) {
          setProducts(featuredProducts);
        }
      } catch {
        // Keep sample products if API fails
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header transparent />

      {/* Hero Slider with Enhanced Gradients */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[8000ms]"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <div className={`transform transition-all duration-1000 delay-300 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                      <span className="bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">
                        {slide.title}
                      </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-10">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/register/car-owner"
                        className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 flex items-center"
                      >
                        Get Started
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      <a
                        href="#how-it-works"
                        className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg hover:scale-105"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Animated Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide ? 'bg-gradient-to-r from-orange-400 to-orange-500 w-14' : 'bg-white/40 w-8 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 right-10 animate-bounce hidden md:block">
          <div className="w-10 h-16 border-2 border-white/30 rounded-full flex justify-center pt-3">
            <div className="w-1.5 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10,000+', label: 'Happy Customers' },
              { number: '500+', label: 'Expert Mechanics' },
              { number: '100+', label: 'Partner Garages' },
              { number: '50,000+', label: 'Services Completed' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{stat.number}</p>
                <p className="text-orange-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Services Section - NEW */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Corporate Solutions</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Professional Transport Services
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive fleet management, NTSA compliance, and dedicated driver solutions for schools, corporates, and institutions across Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Fleet Management */}
            <Link href="/services/fleet-management" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 h-full hover:shadow-2xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fleet Management</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive vehicle fleet management for <strong>schools</strong> and <strong>corporate organizations</strong>. 
                  Scheduled maintenance, cost analytics, GPS tracking, and compliance management.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    School bus fleet management
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Corporate vehicle tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Maintenance scheduling
                  </li>
                </ul>
                <span className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Learn More
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* NTSA Inspection */}
            <Link href="/services/ntsa-inspection" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 border-2 border-green-200 hover:border-green-400 transition-all duration-300 h-full hover:shadow-2xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">NTSA Inspection Compliance</h3>
                <p className="text-gray-600 mb-4">
                  Full <strong>NTSA inspection</strong> and compliance services for <strong>PSV vehicles</strong>, matatus, buses, and school transport. 
                  We handle safety certification and documentation.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    PSV safety certification
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Speed governor verification
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Documentation review
                  </li>
                </ul>
                <span className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  Learn More
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Dedicated Drivers */}
            <Link href="/services/dedicated-drivers" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 h-full hover:shadow-2xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Dedicated Driver Services</h3>
                <p className="text-gray-600 mb-4">
                  Professional, vetted <strong>drivers for schools</strong> and <strong>institutions</strong>. 
                  Background-checked, trained, and certified for safe student and staff transport.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    School bus drivers
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Corporate chauffeurs
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Background verified
                  </li>
                </ul>
                <span className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                  Learn More
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>

          {/* Keywords for SEO */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Serving schools, corporates, SACCOs, tour companies, and transport operators across Nairobi and Kenya.
              Fleet management Kenya | NTSA inspection services | School bus drivers | Corporate transport solutions | PSV compliance
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                How Swift Serve Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've made car servicing simple. Here's how our process works from start to finish.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/4 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"></div>
            
            {[
              {
                step: '01',
                title: 'Register',
                description: 'Sign up and add your vehicle details to our secure platform.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Schedule',
                description: 'Book a service and tell us when and where to pick up your car.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'We Service',
                description: 'Our mechanics handle pickup, service at trusted garages, and return.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                step: '04',
                title: 'Track & Pay',
                description: 'View detailed service records and pay securely through your portal.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 h-full border border-gray-100 hover:border-orange-200 group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold text-orange-500 mb-2 block">Step {item.step}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Premium Services</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Everything Your Car Needs
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                From routine maintenance to major repairs, our network of certified garages and experienced mechanics ensure your vehicle receives the best care possible.
              </p>
              
              <div className="space-y-5">
                {[
                  { title: 'Regular Maintenance', desc: 'Oil changes, filter replacements, and routine checkups' },
                  { title: 'Brake Services', desc: 'Pad replacements, rotor resurfacing, and brake fluid changes' },
                  { title: 'Engine Diagnostics', desc: 'Complete computer diagnostics and engine tune-ups' },
                  { title: 'Tire Services', desc: 'Rotation, balancing, alignment, and replacements' },
                ].map((service, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{service.title}</h4>
                      <p className="text-gray-600">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/register/car-owner"
                className="inline-flex items-center mt-8 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105"
              >
                Book a Service
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl opacity-20 blur-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80"
                alt="Mechanic servicing car"
                className="relative rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Verified Garages</p>
                    <p className="text-gray-600">All partners are certified</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white"></div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">500+</p>
                    <p className="text-xs text-gray-600">Mechanics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="shop" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Quality Parts</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Auto Parts Shop
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Get genuine auto parts delivered to your doorstep or installed during your service.
              </p>
            </div>
            <Link 
              href="/shop" 
              className="mt-6 md:mt-0 inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition-colors group"
            >
              View All Products
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x300'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.is_on_sale && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                      -{product.discount_percentage}%
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:text-white shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs text-orange-500 font-medium mb-1">{product.category?.name || 'Auto Parts'}</p>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.sale_price ? (
                        <>
                          <span className="text-xl font-bold text-orange-500">KSH {parseInt(product.sale_price).toLocaleString()}</span>
                          <span className="text-sm text-gray-400 line-through">KSH {parseInt(product.price).toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">KSH {parseInt(product.price).toLocaleString()}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 ${
                        addedToCart === product.id ? 'bg-green-500' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                      }`}
                    >
                      {addedToCart === product.id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4wMiIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Why Choose Swift Serve
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We're redefining how car owners experience vehicle maintenance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Doorstep Pickup',
                description: 'No more driving to the garage. We come to you, wherever you are.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
              },
              {
                title: 'Full Transparency',
                description: 'Every service item, every cost, documented and accessible in your portal.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: 'Vetted Professionals',
                description: 'Every mechanic and garage is verified and rated by real customers.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Real-time Updates',
                description: 'Track your car\'s service progress from pickup to delivery.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
              },
              {
                title: 'Referral Rewards',
                description: 'Invite friends and earn credits towards your next service.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Service History',
                description: 'Access complete maintenance records for all your vehicles.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl p-8 hover:from-gray-800 hover:to-gray-700/50 transition-all duration-500 border border-gray-700 hover:border-orange-500/50 hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Registration Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Join Our Network</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Become a Partner
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our growing network of mechanics and garages. Expand your customer base and grow your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mechanic Card */}
            <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-orange-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
              <div className="relative p-10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Become a Driver</h3>
                <p className="text-gray-600 mb-6">
                  Join our team of certified drivers. Set your own schedule, pick up and deliver cars, and earn competitive rates.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Flexible working hours', 'Steady stream of jobs', 'Weekly payments', 'Training & support'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register/driver"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105"
                >
                  Apply Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Garage Card */}
            <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-orange-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
              <div className="relative p-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-gray-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Register Your Garage</h3>
                <p className="text-gray-600 mb-6">
                  Partner with Swift Serve to receive service requests from our growing customer base. Expand your reach without marketing costs.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Increased visibility', 'Direct customer bookings', 'Easy invoicing', 'Rating & reviews'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register/garage"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 font-semibold shadow-lg hover:shadow-gray-500/30 hover:scale-105"
                >
                  Register Garage
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-800/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Hassle-Free Car Service?
          </h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            Join thousands of car owners who trust Swift Serve for their vehicle maintenance needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register/car-owner"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Register Your Car Today
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-xl hover:bg-white/10 transition-all duration-300 font-bold text-lg hover:scale-105"
            >
              Browse Auto Parts
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
