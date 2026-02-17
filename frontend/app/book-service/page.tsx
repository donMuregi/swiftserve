'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Car } from '@/lib/api';
import Header from '@/components/Header';

export default function BookServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    car: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    pickup_location: '',
    notes: '',
  });

  useEffect(() => {
    initializeAndLoadData();
  }, []);

  const initializeAndLoadData = async () => {
    try {
      // Ensure CSRF token is set
      await api.initCsrf();
      
      const carsData = await api.getCars();
      setCars(carsData);
    } catch (error) {
      console.error('Failed to load cars:', error);
    } finally {
      setCarsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createServiceRequest({
        car: parseInt(formData.car),
        service_type: formData.service_type,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        pickup_location: formData.pickup_location,
        special_instructions: formData.notes,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    { value: 'general_service', label: 'General Service', description: 'Oil change, filter replacement, basic checkup' },
    { value: 'brake_service', label: 'Brake Service', description: 'Brake pads, rotors, brake fluid' },
    { value: 'tire_service', label: 'Tire Service', description: 'Rotation, alignment, replacement' },
    { value: 'ac_service', label: 'AC Service', description: 'AC repair, refrigerant recharge' },
    { value: 'engine_repair', label: 'Engine Repair', description: 'Diagnostics and engine repairs' },
    { value: 'transmission', label: 'Transmission Service', description: 'Transmission fluid, repairs' },
    { value: 'electrical', label: 'Electrical Service', description: 'Battery, alternator, wiring' },
    { value: 'full_checkup', label: 'Full Checkup', description: 'Comprehensive vehicle inspection' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Service Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your service request has been submitted successfully. A mechanic will be assigned shortly and you'll receive a confirmation notification.
          </p>
          <div className="space-y-3">
            <Link href="/portal/owner" className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Go to Dashboard
            </Link>
            <Link href="/" className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/portal/owner" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Book a Service</h1>
            <p className="text-gray-600">We'll pick up your car, service it, and deliver it back to you</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {carsLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your vehicles...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">You need to add a car first before booking a service</p>
              <Link href="/add-car" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Add Your First Car
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Car */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vehicle
                </label>
                <div className="grid gap-3">
                  {cars.map((car) => (
                    <label
                      key={car.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.car === car.id.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="car"
                        value={car.id}
                        checked={formData.car === car.id.toString()}
                        onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{car.year} {car.make} {car.model}</p>
                        <p className="text-sm text-gray-500">{car.registration_number}</p>
                      </div>
                      {formData.car === car.id.toString() && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {serviceTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.service_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service_type"
                        value={type.value}
                        checked={formData.service_type === type.value}
                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                        className="sr-only"
                      />
                      <span className="font-medium text-gray-900">{type.label}</span>
                      <span className="text-xs text-gray-500 mt-1">{type.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preferred Time
                  </label>
                  <select
                    required
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-900"
                  >
                    <option value="">Select time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pickup Location
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                  placeholder="Enter the full address where we should pick up your car"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-gray-900"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any specific issues or requests?"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-gray-900"
                />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>A mechanic will pick up your car at the scheduled time</li>
                    <li>Your car will be taken to a verified garage for service</li>
                    <li>Once complete, your car will be delivered back to you</li>
                  </ol>
                </div>
              </div>

              <div className="bg-gray-50 -mx-8 -mb-8 mt-8 px-8 py-6 rounded-b-xl border-t">
                <button
                  type="submit"
                  disabled={loading || !formData.car || !formData.service_type}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Book Service'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
