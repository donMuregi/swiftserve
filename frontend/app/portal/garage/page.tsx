'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, type ServiceRequest, type Notification, type WorkItem } from '@/lib/api';
import Footer from '@/components/Footer';

interface NewWorkItem {
  description: string;
  cost: string;
}

export default function GaragePortalPage() {
  const router = useRouter();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'in-service' | 'completed' | 'notifications'>('in-service');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkItemModal, setShowWorkItemModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [newWorkItem, setNewWorkItem] = useState<NewWorkItem>({ description: '', cost: '' });
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, notificationsData] = await Promise.all([
        api.getServiceRequests(),
        api.getNotifications(),
      ]);
      
      setServiceRequests(requestsData);
      setNotifications(notificationsData);
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
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      router.push('/');
    }
  };

  const handleOpenWorkItemModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowWorkItemModal(true);
  };

  const handleAddWorkItem = async () => {
    if (!selectedRequest || !newWorkItem.description || !newWorkItem.cost) return;
    
    setAddingItem(true);
    try {
      await api.addWorkItem(selectedRequest.id, newWorkItem.description, parseFloat(newWorkItem.cost));
      setNewWorkItem({ description: '', cost: '' });
      loadData();
      // Update selected request
      const updated = await api.getServiceRequests();
      const updatedRequest = updated.find((r: ServiceRequest) => r.id === selectedRequest.id);
      if (updatedRequest) setSelectedRequest(updatedRequest);
    } catch (error) {
      console.error('Failed to add work item:', error);
      alert(error instanceof Error ? error.message : 'Failed to add work item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveWorkItem = async (workItemId: number) => {
    if (!selectedRequest) return;
    
    try {
      await api.removeWorkItem(selectedRequest.id, workItemId);
      loadData();
      // Update selected request
      const updated = await api.getServiceRequests();
      const updatedRequest = updated.find((r: ServiceRequest) => r.id === selectedRequest.id);
      if (updatedRequest) setSelectedRequest(updatedRequest);
    } catch (error) {
      console.error('Failed to remove work item:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove work item');
    }
  };

  const handleCompleteService = async (requestId: number) => {
    try {
      await api.completeService(requestId);
      setShowWorkItemModal(false);
      setSelectedRequest(null);
      loadData();
    } catch (error) {
      console.error('Failed to complete service:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete service');
    }
  };

  // Cars at this garage being serviced
  const inServiceRequests = serviceRequests.filter(r => r.status === 'in_service');
  // Cars that were serviced and completed
  const completedRequests = serviceRequests.filter(r => ['completed', 'delivered'].includes(r.status));

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `KSH ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      {/* Work Item Modal */}
      {showWorkItemModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Service Details</h3>
              <p className="text-sm text-gray-500">
                {selectedRequest.car_details?.year} {selectedRequest.car_details?.make} {selectedRequest.car_details?.model}
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Work Items List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Work Done</h4>
                {selectedRequest.work_items && selectedRequest.work_items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRequest.work_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-green-600">{formatCurrency(item.cost)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveWorkItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No work items added yet</p>
                )}
              </div>

              {/* Add New Work Item */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Work Item</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Description (e.g., Oil change, Brake pads replacement)"
                    value={newWorkItem.description}
                    onChange={(e) => setNewWorkItem({ ...newWorkItem, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KSH</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newWorkItem.cost}
                        onChange={(e) => setNewWorkItem({ ...newWorkItem, cost: e.target.value })}
                        className="w-full pl-14 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <button
                      onClick={handleAddWorkItem}
                      disabled={!newWorkItem.description || !newWorkItem.cost || addingItem}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {addingItem ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                {(() => {
                  const garageCost = parseFloat(selectedRequest.garage_cost || '0');
                  let commissionRate = 0.10;
                  let commissionLabel = '10%';
                  
                  if (garageCost >= 100000) {
                    commissionRate = 0.05;
                    commissionLabel = '5%';
                  } else if (garageCost >= 50000) {
                    commissionRate = 0.06;
                    commissionLabel = '6%';
                  } else if (garageCost >= 10000) {
                    commissionRate = 0.08;
                    commissionLabel = '8%';
                  }
                  
                  const commission = garageCost * commissionRate;
                  const garageEarnings = garageCost - commission;
                  
                  return (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total Repair Cost:</span>
                        <span className="font-medium">{formatCurrency(garageCost)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Platform Commission ({commissionLabel}):</span>
                        <span className="font-medium text-red-600">- {formatCurrency(commission)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-300">
                        <span className="font-semibold text-gray-900">Your Earnings:</span>
                        <span className="font-bold text-green-700 text-lg">{formatCurrency(garageEarnings)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowWorkItemModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => handleCompleteService(selectedRequest.id)}
                disabled={!selectedRequest.work_items || selectedRequest.work_items.length === 0}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete Service
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
            <span className="text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Garage</span>
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
                className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
              >
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-900">Garage Account</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cars In Service</p>
                <p className="text-2xl font-bold text-gray-900">{inServiceRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedRequests.length}</p>
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
                <p className="text-sm text-gray-500 mb-1">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => !n.is_read).length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'in-service', label: 'Cars In Service', count: inServiceRequests.length },
              { id: 'completed', label: 'Completed', count: completedRequests.length },
              { id: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.is_read).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* In Service Tab */}
            {activeTab === 'in-service' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cars Currently Being Serviced</h3>
                {inServiceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No cars currently in service</p>
                    <p className="text-sm text-gray-400 mt-1">Cars delivered by drivers will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inServiceRequests.map((request) => (
                      <div key={request.id} className="border-2 border-purple-200 rounded-xl p-5 bg-purple-50/30">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                                </h4>
                                <p className="text-sm text-gray-500">Reg: {request.car_details?.registration_number}</p>
                                <p className="text-sm text-purple-600 font-medium mt-1">
                                  Service: {request.service_type?.replace(/_/g, ' ')}
                                </p>
                              </div>
                            </div>
                            {request.special_instructions && (
                              <p className="text-sm text-gray-500 bg-white p-2 rounded-lg border">
                                <span className="font-medium">Customer Notes:</span> {request.special_instructions}
                              </p>
                            )}
                            {/* Work Items Summary */}
                            {request.work_items && request.work_items.length > 0 && (
                              <div className="mt-3 p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {request.work_items.length} work item{request.work_items.length !== 1 ? 's' : ''} added
                                </p>
                                <p className="text-sm text-green-600 font-medium">
                                  Current Total: {formatCurrency(request.total_cost || '0')}
                                </p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleOpenWorkItemModal(request)}
                            className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Service
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Tab */}
            {activeTab === 'completed' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Services</h3>
                {completedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No completed services yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedRequests.map((request) => (
                      <div key={request.id} className="border rounded-xl p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.car_details?.year} {request.car_details?.make} {request.car_details?.model}
                            </h4>
                            <p className="text-sm text-gray-500">{request.service_type?.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Completed: {new Date(request.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            request.status === 'delivered' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {request.status === 'delivered' ? '✓ Returned to Owner' : '⏳ Awaiting Pickup by Driver'}
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
                          notification.is_read ? 'bg-white' : 'bg-purple-50 border-purple-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.is_read ? 'bg-gray-300' : 'bg-purple-500'
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
