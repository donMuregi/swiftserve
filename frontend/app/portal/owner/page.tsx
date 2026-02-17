'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, type Car, type ServiceRecord, type ServiceRequest } from '@/lib/api';
import Footer from '@/components/Footer';

export default function OwnerPortalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'history' | 'requests'>('overview');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [historyCarFilter, setHistoryCarFilter] = useState<string>('all');
  const [historyTimeFilter, setHistoryTimeFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, carsData, recordsData, requestsData] = await Promise.all([
        api.getMyProfile(),
        api.getCars(),
        api.getServiceRecords(),
        api.getServiceRequests(),
      ]);
      
      setProfile(profileData);
      setCars(carsData);
      setServiceRecords(recordsData);
      setServiceRequests(requestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local storage and redirect even if API fails
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      router.push('/');
    }
  };

  const copyReferralLink = () => {
    if (profile?.referral_link) {
      const fullLink = `${window.location.origin}${profile.referral_link}`;
      navigator.clipboard.writeText(fullLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `KSH ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✓ Driver Assigned' },
      picked_up: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: '🚗 Picked Up' },
      in_service: { bg: 'bg-purple-100', text: 'text-purple-800', label: '🔧 In Service' },
      completed: { bg: 'bg-orange-100', text: 'text-orange-800', label: '✓ Service Complete' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Delivered' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">SwiftServe</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Welcome back</p>
              <p className="font-medium text-gray-900">{profile?.user?.first_name} {profile?.user?.last_name}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-600 font-medium">
                  {profile?.user?.first_name?.[0]}{profile?.user?.last_name?.[0]}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-900">{profile?.user?.first_name} {profile?.user?.last_name}</p>
                    <p className="text-xs text-gray-500">{profile?.user?.email}</p>
                  </div>
                  <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Home
                  </Link>
                  <Link href="/shop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Shop Auto Parts
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Services Done</p>
                <p className="text-2xl font-bold text-gray-900">{serviceRecords.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Referral Points</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.referral_points || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )},
              { id: 'cars', label: 'My Cars', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              )},
              { id: 'history', label: 'Service History', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )},
              { id: 'requests', label: 'Requests', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )},
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Referral Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Refer & Earn</h3>
                      <p className="text-blue-100 text-sm">Share your referral link and earn points for free services</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}${profile?.referral_link || ''}`}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/20 text-white placeholder-white/70 text-sm border border-white/20"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {copySuccess ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-blue-100">Your code: <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{profile?.referral_code}</span></p>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Link
                      href="/book-service"
                      className="group block p-5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Book Service</h4>
                      <p className="text-sm text-gray-500">Schedule a new car service</p>
                    </Link>
                    <Link
                      href="/add-car"
                      className="group block p-5 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors border border-transparent hover:border-green-200"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Add Car</h4>
                      <p className="text-sm text-gray-500">Register another vehicle</p>
                    </Link>
                    <div className="block p-5 bg-gray-50 rounded-xl border">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Your Points</h4>
                      <p className="text-sm text-gray-500">{profile?.referral_points || 0} points earned</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Cars Tab */}
            {activeTab === 'cars' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Cars</h3>
                  <Link
                    href="/add-car"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Car
                  </Link>
                </div>
                {cars.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No cars registered yet</p>
                    <Link href="/add-car" className="text-blue-600 hover:text-blue-700 font-medium">
                      Add your first car
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cars.map((car) => (
                      <div key={car.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {car.year} {car.make} {car.model}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Registration</span>
                            <span className="font-medium text-gray-900">{car.registration_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Color</span>
                            <span className="font-medium text-gray-900">{car.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mileage</span>
                            <span className="font-medium text-gray-900">{car.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fuel Type</span>
                            <span className="font-medium text-gray-900 capitalize">{car.fuel_type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Service History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Car Filter */}
                    <select
                      value={historyCarFilter}
                      onChange={(e) => setHistoryCarFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="all">All Cars</option>
                      {cars.map((car) => (
                        <option key={car.id} value={car.id.toString()}>
                          {car.year} {car.make} {car.model} - {car.registration_number}
                        </option>
                      ))}
                    </select>
                    
                    {/* Time Range Filter */}
                    <select
                      value={historyTimeFilter}
                      onChange={(e) => setHistoryTimeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="all">All Time</option>
                      <option value="1m">Last Month</option>
                      <option value="3m">Last 3 Months</option>
                      <option value="6m">Last 6 Months</option>
                      <option value="1y">Last Year</option>
                      <option value="2y">Last 2 Years</option>
                      <option value="5y">Last 5 Years</option>
                      <option value="10y">Last 10 Years</option>
                    </select>
                  </div>
                </div>
                {(() => {
                  // Filter completed/delivered requests
                  let filteredRequests = serviceRequests.filter(r => ['completed', 'delivered'].includes(r.status));
                  
                  // Apply car filter
                  if (historyCarFilter !== 'all') {
                    filteredRequests = filteredRequests.filter(r => r.car?.toString() === historyCarFilter);
                  }
                  
                  // Apply time filter
                  if (historyTimeFilter !== 'all') {
                    const now = new Date();
                    let cutoffDate = new Date();
                    
                    switch (historyTimeFilter) {
                      case '1m':
                        cutoffDate.setMonth(now.getMonth() - 1);
                        break;
                      case '3m':
                        cutoffDate.setMonth(now.getMonth() - 3);
                        break;
                      case '6m':
                        cutoffDate.setMonth(now.getMonth() - 6);
                        break;
                      case '1y':
                        cutoffDate.setFullYear(now.getFullYear() - 1);
                        break;
                      case '2y':
                        cutoffDate.setFullYear(now.getFullYear() - 2);
                        break;
                      case '5y':
                        cutoffDate.setFullYear(now.getFullYear() - 5);
                        break;
                      case '10y':
                        cutoffDate.setFullYear(now.getFullYear() - 10);
                        break;
                    }
                    
                    filteredRequests = filteredRequests.filter(r => new Date(r.updated_at) >= cutoffDate);
                  }
                  
                  if (filteredRequests.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-gray-500 mb-4">
                          {historyCarFilter !== 'all' || historyTimeFilter !== 'all' 
                            ? 'No service history matching your filters' 
                            : 'No service history yet'}
                        </p>
                        {historyCarFilter === 'all' && historyTimeFilter === 'all' && (
                          <Link href="/book-service" className="text-blue-600 hover:text-blue-700 font-medium">
                            Book your first service
                          </Link>
                        )}
                        {(historyCarFilter !== 'all' || historyTimeFilter !== 'all') && (
                          <button
                            onClick={() => { setHistoryCarFilter('all'); setHistoryTimeFilter('all'); }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Showing {filteredRequests.length} service{filteredRequests.length !== 1 ? 's' : ''}
                      </p>
                      {filteredRequests.map((request) => (
                        <div key={request.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                              </h4>
                              <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="sm:text-right">
                              {request.garage_cost && parseFloat(request.garage_cost) > 0 && (
                                <p className="text-xl font-bold text-green-700">
                                  {formatCurrency(parseFloat(request.garage_cost) * 1.05 + 700)}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                {new Date(request.updated_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-gray-600">Garage:</span>
                              <span className="font-medium text-gray-900">{request.garage_details?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-600">Pickup:</span>
                              <span className="font-medium text-gray-900">{request.pickup_location}</span>
                            </div>
                          </div>

                          {/* Work Items List */}
                          {request.work_items && request.work_items.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-2">Services Performed</p>
                              <ul className="space-y-1 mb-3">
                                {request.work_items.map((item) => (
                                  <li key={item.id} className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-600">{item.description}</span>
                                  </li>
                                ))}
                              </ul>
                              {/* Cost Breakdown */}
                              {(() => {
                                const repairCost = parseFloat(request.garage_cost || '0');
                                const serviceFee = repairCost * 0.05;
                                const tripFee = 700;
                                const total = repairCost + serviceFee + tripFee;
                                
                                return (
                                  <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-gray-900">Total Cost:</span>
                                      <span className="text-lg font-bold text-green-700">{formatCurrency(total)}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {getStatusBadge(request.status)}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Service Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Service Requests</h3>
                  <Link
                    href="/book-service"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Request
                  </Link>
                </div>
                {serviceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No service requests yet</p>
                    <Link href="/book-service" className="text-blue-600 hover:text-blue-700 font-medium">
                      Book a service now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.map((request) => (
                      <div key={request.id} className="border rounded-xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                            </h4>
                            <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium text-gray-900">{request.preferred_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-600">Pickup:</span>
                            <span className="font-medium text-gray-900">{request.pickup_location}</span>
                          </div>
                        </div>

                        {/* Work Items & Cost Section - Show when service is complete or delivered */}
                        {['completed', 'delivered'].includes(request.status) && request.work_items && request.work_items.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              Services Performed
                            </h5>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <ul className="space-y-2 mb-4">
                                {request.work_items.map((item) => (
                                  <li key={item.id} className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">{item.description}</span>
                                  </li>
                                ))}
                              </ul>
                              {/* Total Cost */}
                              {(() => {
                                const repairCost = parseFloat(request.garage_cost || '0');
                                const serviceFee = repairCost * 0.05;
                                const tripFee = 700;
                                const total = repairCost + serviceFee + tripFee;
                                
                                return (
                                  <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-gray-900">Total Cost</span>
                                      <span className="text-lg font-bold text-green-700">{formatCurrency(total)}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* In Progress Indicator */}
                        {request.status === 'in_service' && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center gap-3 text-purple-700 bg-purple-50 rounded-lg p-3">
                              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm font-medium">Your car is currently being serviced at the garage...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
