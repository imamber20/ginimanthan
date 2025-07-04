import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const roomsFile = path.join(__dirname, 'data', 'rooms.json');
const bookingsFile = path.join(__dirname, 'data', 'bookings.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(roomsFile)) {
  const initialRooms = [
    {
      id: uuidv4(),
      name: 'Conference Room A',
      capacity: 8,
      description: 'Main conference room with projector',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Meeting Room B',
      capacity: 4,
      description: 'Small meeting room for team discussions',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Board Room',
      capacity: 12,
      description: 'Executive board room with video conferencing',
      createdAt: new Date().toISOString(),
    },
  ];
  fs.writeFileSync(roomsFile, JSON.stringify(initialRooms, null, 2));
}

if (!fs.existsSync(bookingsFile)) {
  fs.writeFileSync(bookingsFile, JSON.stringify([], null, 2));
}

// Helper functions
const readRooms = () => {
  try {
    const data = fs.readFileSync(roomsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rooms:', error);
    return [];
  }
};

const writeRooms = (rooms) => {
  try {
    fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
  } catch (error) {
    console.error('Error writing rooms:', error);
  }
};

const readBookings = () => {
  try {
    const data = fs.readFileSync(bookingsFile, 'utf8');
    const bookings = JSON.parse(data);
    
    // Clean up old bookings (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start);
      return bookingDate >= thirtyDaysAgo;
    });
    
    // Write back filtered bookings if any were removed
    if (filteredBookings.length !== bookings.length) {
      writeBookings(filteredBookings);
      console.log(`Cleaned up ${bookings.length - filteredBookings.length} old bookings`);
    }
    
    return filteredBookings;
  } catch (error) {
    console.error('Error reading bookings:', error);
    return [];
  }
};

const writeBookings = (bookings) => {
  try {
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error writing bookings:', error);
  }
};

const isTimeSlotAvailable = (roomId, startTime, endTime, excludeBookingId = null) => {
  const bookings = readBookings();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return !bookings.some(booking => {
    if (booking.id === excludeBookingId) return false;
    if (booking.roomId !== roomId) return false;
    
    const bookingStart = new Date(booking.start);
    const bookingEnd = new Date(booking.end);
    
    // Check for overlap
    return (
      (start >= bookingStart && start < bookingEnd) ||
      (end > bookingStart && end <= bookingEnd) ||
      (start <= bookingStart && end >= bookingEnd)
    );
  });
};

// Cleanup old bookings on server start
const cleanupOldBookings = () => {
  console.log('Performing initial cleanup of old bookings...');
  readBookings(); // This will trigger the cleanup
};

// Routes

// Get all rooms
app.get('/api/rooms', (req, res) => {
  const rooms = readRooms();
  res.json(rooms);
});

// Create a new room
app.post('/api/rooms', (req, res) => {
  const { name, capacity, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Room name is required' });
  }
  
  const rooms = readRooms();
  const newRoom = {
    id: uuidv4(),
    name,
    capacity: capacity || undefined,
    description: description || undefined,
    createdAt: new Date().toISOString(),
  };
  
  rooms.push(newRoom);
  writeRooms(rooms);
  
  res.status(201).json(newRoom);
});

// Delete a room
app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const rooms = readRooms();
  const bookings = readBookings();
  
  // Check if room has bookings
  const roomBookings = bookings.filter(booking => booking.roomId === id);
  if (roomBookings.length > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete room with active bookings' 
    });
  }
  
  const filteredRooms = rooms.filter(room => room.id !== id);
  
  if (filteredRooms.length === rooms.length) {
    return res.status(404).json({ message: 'Room not found' });
  }
  
  writeRooms(filteredRooms);
  res.json({ message: 'Room deleted successfully' });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const { roomId, roomName, title, description, start, end, bookedBy, bookedFor } = req.body;
  
  if (!roomId || !roomName || !title || !start || !end || !bookedBy) {
    return res.status(400).json({ 
      message: 'Missing required fields: roomId, roomName, title, start, end, bookedBy' 
    });
  }
  
  // Validate time slot
  const startTime = new Date(start);
  const endTime = new Date(end);
  
  if (startTime >= endTime) {
    return res.status(400).json({ 
      message: 'Start time must be before end time' 
    });
  }
  
  if (startTime < new Date()) {
    return res.status(400).json({ 
      message: 'Cannot book in the past' 
    });
  }
  
  // Check if room exists
  const rooms = readRooms();
  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  
  // Check availability
  if (!isTimeSlotAvailable(roomId, start, end)) {
    return res.status(409).json({ 
      message: 'Time slot is already booked' 
    });
  }
  
  const bookings = readBookings();
  const newBooking = {
    id: uuidv4(),
    roomId,
    roomName,
    title,
    description: description || undefined,
    start,
    end,
    bookedBy,
    bookedFor: bookedFor || undefined,
    createdAt: new Date().toISOString(),
  };
  
  bookings.push(newBooking);
  writeBookings(bookings);
  
  res.status(201).json(newBooking);
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const bookings = readBookings();
  
  const filteredBookings = bookings.filter(booking => booking.id !== id);
  
  if (filteredBookings.length === bookings.length) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  writeBookings(filteredBookings);
  res.json({ message: 'Booking deleted successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Cleanup old bookings every 24 hours
setInterval(cleanupOldBookings, 24 * 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  cleanupOldBookings(); // Initial cleanup on startup
});