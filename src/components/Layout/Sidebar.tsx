import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Plus, Clock, MapPin } from 'lucide-react';
import { Room, Booking } from '../../types';

interface SidebarProps {
  rooms: Room[];
  bookings: Booking[];
  onBookRoom: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  bookings,
  onBookRoom,
}) => {
  const today = new Date();
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.start);
    return bookingDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const getAvailableRooms = () => {
    const currentHour = new Date().getHours();
    const currentTime = new Date();
    
    return rooms.filter(room => {
      const hasCurrentBooking = bookings.some(booking => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        return booking.roomId === room.id &&
               start <= currentTime &&
               end > currentTime;
      });
      return !hasCurrentBooking;
    });
  };

  const availableRooms = getAvailableRooms();

  return (
    <div className="space-y-6">
      {/* Book Room Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBookRoom}
        className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
      >
        <Plus className="w-5 h-5 mr-2" />
        Book a Room
      </motion.button>

      {/* Today's Bookings */}
      <div>
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Today's Bookings</h3>
        </div>
        
        <div className="space-y-3">
          {todayBookings.length > 0 ? (
            todayBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <h4 className="font-medium text-gray-900 mb-1">{booking.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {booking.roomName}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(booking.start).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(booking.end).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    By: {booking.bookedBy}
                    {booking.bookedFor && ` (for ${booking.bookedFor})`}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No bookings for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Available Rooms */}
      <div>
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Available Rooms</h3>
        </div>
        
        <div className="space-y-2">
          {availableRooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{room.name}</div>
                {room.capacity && (
                  <div className="text-sm text-gray-600">{room.capacity} people</div>
                )}
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Available
              </span>
            </motion.div>
          ))}
          
          {rooms.filter(room => !availableRooms.includes(room)).map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{room.name}</div>
                {room.capacity && (
                  <div className="text-sm text-gray-600">{room.capacity} people</div>
                )}
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Occupied
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};