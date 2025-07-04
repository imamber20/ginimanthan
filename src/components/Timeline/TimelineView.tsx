import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Room, Booking } from '../../types';

interface TimelineViewProps {
  rooms: Room[];
  bookings: Booking[];
  onTimeSlotClick: (roomId: string, startTime: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  rooms,
  bookings,
  onTimeSlotClick,
  onBookingClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate time slots from 9 AM to 6 PM
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  // Room color mapping
  const getRoomColor = (roomId: string) => {
    const colors = [
      { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-100' },
      { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', light: 'bg-orange-100' },
      { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-100' },
      { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-100' },
      { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-100' },
      { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', light: 'bg-indigo-100' },
    ];
    
    const index = roomId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getBookingForSlot = (roomId: string, hour: number) => {
    const slotStart = new Date(currentDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(currentDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return bookings.find(booking => {
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      
      return booking.roomId === roomId &&
             bookingStart.toDateString() === currentDate.toDateString() &&
             bookingStart.getHours() === hour;
    });
  };

  const getBookingSpan = (booking: Booking) => {
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    return Math.max(1, Math.round(duration));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDate(currentDate)}
            </h2>
          </div>
          {isToday(currentDate) && (
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              Today
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[200px_1fr] h-full">
          {/* Time Column */}
          <div className="border-r border-gray-200 bg-gray-50">
            <div className="h-12 border-b border-gray-200 flex items-center px-4">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Time</span>
            </div>
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-gray-200 flex items-center px-4"
              >
                <span className="text-sm text-gray-600">{formatTime(hour)}</span>
              </div>
            ))}
          </div>

          {/* Rooms Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 min-w-full">
              {rooms.slice(0, 4).map((room) => {
                const roomColor = getRoomColor(room.id);
                
                return (
                  <div key={room.id} className="border-r border-gray-200 last:border-r-0">
                    {/* Room Header */}
                    <div className="h-12 border-b border-gray-200 flex items-center justify-center px-4 bg-gray-50">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                        {room.capacity && (
                          <div className="text-xs text-gray-500">{room.capacity} people</div>
                        )}
                      </div>
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map((hour) => {
                      const booking = getBookingForSlot(room.id, hour);
                      const isOccupied = !!booking;
                      
                      return (
                        <div
                          key={`${room.id}-${hour}`}
                          className="h-16 border-b border-gray-200 relative"
                        >
                          {isOccupied ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute inset-1 ${roomColor.bg} ${roomColor.hover} rounded-md p-2 cursor-pointer transition-colors`}
                              style={{
                                height: `${getBookingSpan(booking) * 64 - 8}px`,
                                zIndex: 10,
                              }}
                              onClick={() => onBookingClick(booking)}
                            >
                              <div className="text-white text-xs font-medium truncate">
                                {booking.title}
                              </div>
                              <div className="text-white text-opacity-80 text-xs truncate">
                                {booking.bookedBy}
                              </div>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => {
                                const slotTime = new Date(currentDate);
                                slotTime.setHours(hour, 0, 0, 0);
                                onTimeSlotClick(room.id, slotTime);
                              }}
                              className="w-full h-full hover:bg-gray-50 transition-colors group"
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                                Click to book
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};