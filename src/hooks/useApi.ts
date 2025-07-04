import { useState, useEffect } from 'react';
import { Room, Booking } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const useApi = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE}/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) throw new Error('Failed to create room');
      const newRoom = await response.json();
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete room');
      }
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }
      const newBooking = await response.json();
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete booking');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      // Add a small delay to ensure server is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await Promise.all([fetchRooms(), fetchBookings()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return {
    rooms,
    bookings,
    loading,
    error,
    createRoom,
    deleteRoom,
    createBooking,
    deleteBooking,
    refreshData: () => Promise.all([fetchRooms(), fetchBookings()]),
  };
};