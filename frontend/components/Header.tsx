'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');
    if (user) {
      setIsLoggedIn(true);
      setUserType(storedUserType);
    }
  }, []);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const navLinks = [
    { href: '/register/car-owner', label: 'Personal Car Management' },
    { href: '/services/fleet-management', label: 'Fleet Management' },
    { href: '/services/ntsa-inspection', label: 'NTSA Inspection' },
  ];

  const headerClasses = transparent
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-lg shadow-xl'
          : 'bg-transparent'
      }`
    : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl sticky top-0 z-50';

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300 group-hover:scale-105">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">SWIFT SERVE</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {transparent && (
            <a href="#how-it-works" className="text-white/90 hover:text-orange-400 transition-colors font-medium">How it Works</a>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors font-medium ${
                pathname === link.href
                  ? 'text-orange-400'
                  : 'text-white/90 hover:text-orange-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link
              href={
                userType === 'car_owner'
                  ? '/portal/owner'
                  : userType === 'mechanic'
                  ? '/portal/driver'
                  : userType === 'garage'
                  ? '/portal/garage'
                  : '/portal/owner'
              }
              className="text-white/90 hover:text-orange-400 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Account
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-white/90 hover:text-orange-400 transition-colors font-medium">Sign In</Link>
              <Link
                href="/register/car-owner"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105"
              >
                Register
              </Link>
            </>
          )}
        </nav>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {transparent && (
              <a
                href="#how-it-works"
                className="block text-white/90 hover:text-orange-400 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </a>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block transition-colors font-medium py-2 ${
                  pathname === link.href
                    ? 'text-orange-400'
                    : 'text-white/90 hover:text-orange-400'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-700 pt-3">
              {isLoggedIn ? (
                <Link
                  href={
                    userType === 'car_owner'
                      ? '/portal/owner'
                      : userType === 'mechanic'
                      ? '/portal/driver'
                      : userType === 'garage'
                      ? '/portal/garage'
                      : '/portal/owner'
                  }
                  className="block text-white/90 hover:text-orange-400 transition-colors font-medium py-2 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-white/90 hover:text-orange-400 transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register/car-owner"
                    className="block mt-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
