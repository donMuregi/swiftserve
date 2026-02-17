'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, type ServiceRequest, type Notification } from '@/lib/api';
import Footer from '@/components/Footer';

interface Garage {
  id: number;
  name: string;
  address: string;
  location: string;
  status: string;
}

export default function DriverPortalPage() {
  const router = useRouter();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'my-jobs' | 'history' | 'notifications'>('available');
  const [selectedGarage, setSelectedGarage] = useState<number | null>(null);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, notificationsData, garagesData] = await Promise.all([
        api.getServiceRequests(),
        api.getNotifications(),
        api.getGarages(),
      ]);
      
      setServiceRequests(requestsData);
      setNotifications(notificationsData);
      setGarages(garagesData.filter((g: Garage) => g.status === 'approved'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Accept a pending job (just accept, no garage selection yet)
  const handleAcceptJob = async (requestId: number) => {
    try {
      await api.acceptJob(requestId);
      loadData();
    } catch (error) {
      console.error('Failed to accept job:', error);
      alert(error instanceof Error ? error.message : 'Failed to accept job');
    }
  };

  // Pick up the car from owner
  const handlePickupCar = async (requestId: number) => {
    try {
      await api.pickupCar(requestId);
      loadData();
    } catch (error) {
      console.error('Failed to pickup car:', error);
      alert(error instanceof Error ? error.message : 'Failed to pickup car');
    }
  };

  // Open garage selection modal before delivering
  const handleOpenGarageModal = (requestId: number) => {
    setCurrentRequestId(requestId);
    setShowGarageModal(true);
  };

  // Deliver car to selected garage
  const handleDeliverToGarage = async () => {
    if (!currentRequestId || !selectedGarage) return;
    
    try {
      await api.deliverToGarage(currentRequestId, selectedGarage);
      setShowGarageModal(false);
      setSelectedGarage(null);
      setCurrentRequestId(null);
      loadData();
    } catch (error) {
      console.error('Failed to deliver to garage:', error);
      alert(error instanceof Error ? error.message : 'Failed to deliver to garage');
    }
  };

  // Return car to owner after service is complete
  const handleReturnToOwner = async (requestId: number) => {
    try {
      await api.returnToOwner(requestId);
      loadData();
    } catch (error) {
      console.error('Failed to return car:', error);
      alert(error instanceof Error ? error.message : 'Failed to return car');
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
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      router.push('/');
    }
  };

  // Available pending jobs (not assigned to any driver yet)
  const pendingJobs = serviceRequests.filter(r => r.status === 'pending');
  // Jobs assigned to this driver but not yet picked up
  const assignedJobs = serviceRequests.filter(r => r.status === 'assigned');
  // Car has been picked up, needs to be delivered to garage
  const pickedUpJobs = serviceRequests.filter(r => r.status === 'picked_up');
  // At garage being serviced
  const inServiceJobs = serviceRequests.filter(r => r.status === 'in_service');
  // Service complete, ready to return to owner
  const completedJobs = serviceRequests.filter(r => r.status === 'completed');
  // Delivered back to owner
  const deliveredJobs = serviceRequests.filter(r => r.status === 'delivered');

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
      {/* Garage Selection Modal */}
      {showGarageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select Garage</h3>
            <p className="text-sm text-gray-500 mb-4">Choose which garage to take the car to for service</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {garages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No approved garages available</p>
              ) : (
                garages.map((garage) => (
                  <label
                    key={garage.id}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      selectedGarage === garage.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="garage"
                      value={garage.id}
                      checked={selectedGarage === garage.id}
                      onChange={() => setSelectedGarage(garage.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{garage.name}</p>
                      <p className="text-sm text-gray-500">{garage.location}</p>
                      <p className="text-xs text-gray-400">{garage.address}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGarageModal(false);
                  setSelectedGarage(null);
                  setCurrentRequestId(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeliverToGarage}
                disabled={!selectedGarage}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deliver to Garage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">SwiftServe</span>
            <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Driver</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-900">Driver Account</p>
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
                <p className="text-sm text-gray-500 mb-1">Available Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{pendingJobs.length}</p>
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
                <p className="text-sm text-gray-500 mb-1">My Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{assignedJobs.length + pickedUpJobs.length + inServiceJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ready for Return</p>
                <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
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
                <p className="text-sm text-gray-500 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{deliveredJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'available', label: 'Available Jobs', count: pendingJobs.length },
              { id: 'my-jobs', label: 'My Active Jobs', count: assignedJobs.length + pickedUpJobs.length + inServiceJobs.length + completedJobs.length },
              { id: 'history', label: 'History', count: deliveredJobs.length },
              { id: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.is_read).length },
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
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Available Jobs Tab - Pending requests any driver can accept */}
            {activeTab === 'available' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Jobs</h3>
                <p className="text-sm text-gray-500 mb-4">These are pending service requests. Accept a job to assign it to yourself.</p>
                {pendingJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No available jobs right now</p>
                    <p className="text-sm text-gray-400 mt-1">Check back soon for new requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingJobs.map((request) => (
                      <div key={request.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                                </h4>
                                <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                              </div>
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
                            {request.special_instructions && (
                              <p className="text-sm text-gray-500 mt-2">
                                <span className="font-medium">Notes:</span> {request.special_instructions}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAcceptJob(request.id)}
                            className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept Job
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Active Jobs Tab */}
            {activeTab === 'my-jobs' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Active Jobs</h3>

                {/* Assigned - need to pick up */}
                {assignedJobs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg inline-block mb-3">Ready to Pick Up</h4>
                    <div className="space-y-4">
                      {assignedJobs.map((request) => (
                        <div key={request.id} className="border-2 border-yellow-200 rounded-xl p-5 bg-yellow-50/30">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                              </h4>
                              <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-gray-600 mt-1">📍 {request.pickup_location}</p>
                            </div>
                            <button
                              onClick={() => handlePickupCar(request.id)}
                              className="px-5 py-2.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              Pick Up Car
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Picked up - need to deliver to garage */}
                {pickedUpJobs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-block mb-3">En Route - Deliver to Garage</h4>
                    <div className="space-y-4">
                      {pickedUpJobs.map((request) => (
                        <div key={request.id} className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50/30">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                              </h4>
                              <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-blue-600 mt-1 font-medium">Car picked up! Select a garage to deliver to.</p>
                            </div>
                            <button
                              onClick={() => handleOpenGarageModal(request.id)}
                              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Select Garage & Deliver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In service - waiting for garage */}
                {inServiceJobs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg inline-block mb-3">At Garage - Being Serviced</h4>
                    <div className="space-y-4">
                      {inServiceJobs.map((request) => (
                        <div key={request.id} className="border-2 border-purple-200 rounded-xl p-5 bg-purple-50/30">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                              </h4>
                              <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                              {request.garage_details && (
                                <p className="text-sm text-purple-600 mt-1 font-medium">🔧 At {request.garage_details.name}</p>
                              )}
                            </div>
                            <div className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg">
                              ⏳ Waiting for garage to complete service...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed - ready to return */}
                {completedJobs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-block mb-3">Service Complete - Return to Owner</h4>
                    <div className="space-y-4">
                      {completedJobs.map((request) => (
                        <div key={request.id} className="border-2 border-green-200 rounded-xl p-5 bg-green-50/30">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                              </h4>
                              <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-green-600 mt-1 font-medium">✅ Service completed! Return car to owner.</p>
                              <p className="text-sm text-gray-600">📍 Return to: {request.pickup_location}</p>
                            </div>
                            <button
                              onClick={() => handleReturnToOwner(request.id)}
                              className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Returned
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {assignedJobs.length === 0 && pickedUpJobs.length === 0 && inServiceJobs.length === 0 && completedJobs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No active jobs</p>
                    <p className="text-sm text-gray-400 mt-1">Accept a job from the Available Jobs tab to get started</p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed & Delivered Jobs</h3>
                {deliveredJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No completed jobs yet</p>
                    <p className="text-sm text-gray-400 mt-1">Jobs will appear here after you return them to owners</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveredJobs.map((request) => (
                      <div key={request.id} className="border rounded-xl p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                            </h4>
                            <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                            {request.garage_details && (
                              <p className="text-sm text-gray-400 mt-1">
                                Serviced at: {request.garage_details.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Completed: {new Date(request.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            ✓ Delivered
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.is_read ? 'bg-gray-300' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
