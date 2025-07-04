export interface Room {
  id: string;
  name: string;
  capacity?: number;
  description?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  bookedBy: string;
  bookedFor?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export type CalendarView = 'month' | 'week' | 'day';