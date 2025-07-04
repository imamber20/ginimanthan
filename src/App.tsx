import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Settings, Users } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { TimelineView } from './components/Timeline/TimelineView';
import { Sidebar } from './components/Layout/Sidebar';
import { BookingModal } from './components/Booking/BookingModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { useApi } from './hooks/useApi';

function App() {
  const [currentView, setCurrentView] = useState<'calendar' | 'admin'>('calendar');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; roomId?: string } | null>(null);
  const [isAdmin] = useState(true);

  const {
    rooms,
    bookings,
    loading,
    error,
    createRoom,
    deleteRoom,
    createBooking,
    deleteBooking,
  } = useApi();

  const handleTimeSlotClick = (roomId: string, startTime: Date) => {
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
    setSelectedSlot({ start: startTime, end: endTime, roomId });
    setShowBookingModal(true);
  };

  const handleCreateBooking = async (bookingData: any) => {
    try {
      await createBooking(bookingData);
      toast.success('Booking created successfully!');
      setSelectedSlot(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  const handleCreateRoom = async (roomData: any) => {
    try {
      await createRoom(roomData);
      toast.success('Room created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      toast.success('Room deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete room');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please make sure the backend server is running on port 3001.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Run: <code className="bg-gray-100 px-2 py-1 rounded">npm run server</code> in a separate terminal
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdmin={isAdmin}
      />
      
      {currentView === 'calendar' ? (
        <div className="flex h-[calc(100vh-64px)]">
          {/* Main Timeline View */}
          <div className="flex-1 p-6">
            <TimelineView
              rooms={rooms}
              bookings={bookings}
              onTimeSlotClick={handleTimeSlotClick}
              onBookingClick={(booking) => {
                toast.custom((t) => (
                  <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
                    <h4 className="font-medium text-gray-900 mb-2">{booking.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Room:</strong> {booking.roomName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Time:</strong> {new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Booked by:</strong> {booking.bookedBy}
                    </p>
                    {booking.bookedFor && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>For:</strong> {booking.bookedFor}
                      </p>
                    )}
                    {booking.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Description:</strong> {booking.description}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        if (confirm('Are you sure you want to cancel this booking?')) {
                          handleDeleteBooking(booking.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Cancel Booking
                    </button>
                  </div>
                ), { duration: 5000 });
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <Sidebar
              rooms={rooms}
              bookings={bookings}
              onBookRoom={() => setShowBookingModal(true)}
            />
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-gray-600">Manage rooms and bookings</p>
            </div>

            <AdminPanel
              rooms={rooms}
              bookings={bookings}
              onCreateRoom={handleCreateRoom}
              onDeleteRoom={handleDeleteRoom}
              onDeleteBooking={handleDeleteBooking}
            />
          </div>
        </div>
      )}

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedSlot(null);
        }}
        rooms={rooms}
        onSubmit={handleCreateBooking}
        selectedDate={selectedSlot?.start}
        selectedTime={selectedSlot?.start ? 
          `${selectedSlot.start.getHours().toString().padStart(2, '0')}:${selectedSlot.start.getMinutes().toString().padStart(2, '0')}` : 
          undefined
        }
        preselectedRoomId={selectedSlot?.roomId}
      />

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
}

export default App;