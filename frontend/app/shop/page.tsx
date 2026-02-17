'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { api, Product, ProductCategory } from '@/lib/api';
import { useCart } from '@/lib/cart';

// Sample products with KSH pricing
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
  {
    id: 5,
    category: { id: 1, name: 'Engine Parts', slug: 'engine-parts', description: '', image: null },
    name: 'Spark Plug Set (4 Pack)',
    slug: 'spark-plug-set',
    description: 'High-performance iridium spark plugs for better ignition',
    price: '3999',
    sale_price: '3499',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80',
    stock: 75,
    is_featured: false,
    is_active: true,
    is_on_sale: true,
    discount_percentage: 12,
  },
  {
    id: 6,
    category: { id: 5, name: 'Lighting', slug: 'lighting', description: '', image: null },
    name: 'LED Headlight Bulbs (Pair)',
    slug: 'led-headlight-bulbs',
    description: 'Ultra bright 6000K LED headlight bulbs',
    price: '4999',
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&q=80',
    stock: 40,
    is_featured: false,
    is_active: true,
    is_on_sale: false,
    discount_percentage: 0,
  },
  {
    id: 7,
    category: { id: 6, name: 'Filters', slug: 'filters', description: '', image: null },
    name: 'Cabin Air Filter',
    slug: 'cabin-air-filter',
    description: 'HEPA cabin air filter for clean air circulation',
    price: '1999',
    sale_price: '1499',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    stock: 60,
    is_featured: false,
    is_active: true,
    is_on_sale: true,
    discount_percentage: 25,
  },
  {
    id: 8,
    category: { id: 3, name: 'Oil & Fluids', slug: 'oil-fluids', description: '', image: null },
    name: 'Brake Fluid DOT 4',
    slug: 'brake-fluid-dot4',
    description: 'High-performance brake fluid for optimal braking',
    price: '899',
    sale_price: null,
    image: 'https://images.unsplash.com/photo-1635784063459-8ac4dc37e38a?w=400&q=80',
    stock: 120,
    is_featured: false,
    is_active: true,
    is_on_sale: false,
    discount_percentage: 0,
  },
];

const sampleCategories: ProductCategory[] = [
  { id: 0, name: 'All Products', slug: 'all', description: '', image: null },
  { id: 1, name: 'Engine Parts', slug: 'engine-parts', description: '', image: null },
  { id: 2, name: 'Brake System', slug: 'brake-system', description: '', image: null },
  { id: 3, name: 'Oil & Fluids', slug: 'oil-fluids', description: '', image: null },
  { id: 4, name: 'Batteries', slug: 'batteries', description: '', image: null },
  { id: 5, name: 'Lighting', slug: 'lighting', description: '', image: null },
  { id: 6, name: 'Filters', slug: 'filters', description: '', image: null },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(sampleCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getProductCategories(),
        ]);
        if (productsData.length > 0) setProducts(productsData);
        if (categoriesData.length > 0) {
          setCategories([{ id: 0, name: 'All Products', slug: 'all', description: '', image: null }, ...categoriesData]);
        }
      } catch {
        // Keep sample data
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const filteredProducts = products
    .filter((product) => {
      if (selectedCategory !== 'all' && product.category?.slug !== selectedCategory) {
        return false;
      }
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const priceA = parseFloat(a.sale_price || a.price);
      const priceB = parseFloat(b.sale_price || b.price);
      return sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Auto Parts Shop</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Quality auto parts delivered to your doorstep or installed during service
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.image || 'https://via.placeholder.com/400x300'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {product.is_on_sale && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{product.discount_percentage}%
                  </div>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                    Low Stock
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-orange-500 font-medium mb-1">{product.category?.name || 'Auto Parts'}</p>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.sale_price ? (
                      <>
                        <span className="text-lg font-bold text-orange-500">KSH {parseInt(product.sale_price).toLocaleString()}</span>
                        <span className="text-sm text-gray-400 line-through">KSH {parseInt(product.price).toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">KSH {parseInt(product.price).toLocaleString()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      addedToCart === product.id
                        ? 'bg-green-500 text-white'
                        : product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-110'
                    }`}
                  >
                    {addedToCart === product.id ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
