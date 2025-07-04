import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking, CalendarEvent } from '../../types';
import { motion } from 'framer-motion';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  bookings: Booking[];
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  onSelectSlot,
  onSelectEvent,
}) => {
  const events = useMemo(() => {
    return bookings.map((booking): CalendarEvent => ({
      id: booking.id,
      title: `${booking.roomName} - ${booking.title}`,
      start: new Date(booking.start),
      end: new Date(booking.end),
      resource: booking,
    }));
  }, [bookings]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-accent-500',
      'bg-success-500',
      'bg-warning-500',
    ];
    
    const colorIndex = event.resource.roomId.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    return {
      style: {
        backgroundColor: bgColor.includes('primary') ? '#3b82f6' :
                        bgColor.includes('secondary') ? '#8b5cf6' :
                        bgColor.includes('accent') ? '#10b981' :
                        bgColor.includes('success') ? '#22c55e' : '#f59e0b',
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px',
      },
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.WEEK}
          step={30}
          showMultiDayTimes
          className="custom-calendar"
        />
      </div>
    </motion.div>
  );
};