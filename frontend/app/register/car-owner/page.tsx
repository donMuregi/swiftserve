'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CarOwnerRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CarOwnerRegistrationContent />
    </Suspense>
  );
}

function CarOwnerRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Personal Details
  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    referral_code_used: referralCode,
  });

  // Car Details
  const [carData, setCarData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registration_number: '',
    color: '',
    mileage: 0,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalData.first_name || !personalData.last_name || !personalData.email || !personalData.password) {
      setError('Please fill in all required fields');
      return;
    }
    const passwordError = validatePassword(personalData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Combine personal data with car data
      const registrationData = {
        ...personalData,
        car_make: carData.make,
        car_model: carData.model,
        car_year: carData.year,
        car_registration: carData.registration_number,
        car_color: carData.color,
        car_mileage: carData.mileage,
        car_fuel_type: carData.fuel_type,
        car_transmission: carData.transmission,
      };
      await api.registerCarOwner(registrationData);
      
      // Small delay to ensure backend session is established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Auto-login after successful registration
      try {
        const loginResponse = await api.login(personalData.email, personalData.password);
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
        localStorage.setItem('userType', loginResponse.user_type);
        router.push('/portal/owner');
      } catch (loginErr) {
        // If auto-login fails, still redirect - they can login manually
        console.log('Auto-login failed, redirecting to login', loginErr);
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Register Your Car</h1>
            <p className="text-gray-600">Create your account and add your first vehicle</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Personal Details</span>
              <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Car Details</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <form onSubmit={handlePersonalSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={personalData.first_name}
                    onChange={(e) => setPersonalData({ ...personalData, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={personalData.last_name}
                    onChange={(e) => setPersonalData({ ...personalData, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={personalData.email}
                  onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={personalData.password}
                  onChange={(e) => setPersonalData({ ...personalData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  placeholder="Create a strong password"
                />
                {personalData.password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[
                        personalData.password.length >= 8,
                        /[A-Z]/.test(personalData.password),
                        /[a-z]/.test(personalData.password),
                        /[0-9]/.test(personalData.password),
                      ].map((met, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${met ? 'bg-green-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Min 8 chars, uppercase, lowercase, and a number</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={personalData.phone_number}
                  onChange={(e) => setPersonalData({ ...personalData, phone_number: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>
                <textarea
                  required
                  value={personalData.address}
                  onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-gray-900"
                  placeholder="Enter your full address"
                />
              </div>

              {referralCode && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-700">
                      Referral code applied: <strong>{referralCode}</strong>
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2: Car Details */}
          {step === 2 && (
            <form onSubmit={handleCarSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Make
                  </label>
                  <input
                    type="text"
                    required
                    value={carData.make}
                    onChange={(e) => setCarData({ ...carData, make: e.target.value })}
                    placeholder="Toyota"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={carData.model}
                    onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                    placeholder="Camry"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={carData.year}
                    onChange={(e) => setCarData({ ...carData, year: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    value={carData.registration_number}
                    onChange={(e) => setCarData({ ...carData, registration_number: e.target.value.toUpperCase() })}
                    placeholder="ABC 123"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    value={carData.color}
                    onChange={(e) => setCarData({ ...carData, color: e.target.value })}
                    placeholder="Silver"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={carData.mileage}
                    onChange={(e) => setCarData({ ...carData, mileage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fuel Type
                  </label>
                  <select
                    value={carData.fuel_type}
                    onChange={(e) => setCarData({ ...carData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Transmission
                  </label>
                  <select
                    value={carData.transmission}
                    onChange={(e) => setCarData({ ...carData, transmission: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
