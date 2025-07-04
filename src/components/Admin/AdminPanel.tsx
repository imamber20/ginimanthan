import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, Calendar, TrendingUp, Key, Eye, EyeOff } from 'lucide-react';
import { Room, Booking } from '../../types';

interface AdminPanelProps {
  rooms: Room[];
  bookings: Booking[];
  onCreateRoom: (roomData: Omit<Room, 'id' | 'createdAt'>) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteBooking: (bookingId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  rooms,
  bookings,
  onCreateRoom,
  onDeleteRoom,
  onDeleteBooking,
}) => {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    description: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({
      name: newRoom.name,
      capacity: newRoom.capacity ? parseInt(newRoom.capacity) : undefined,
      description: newRoom.description || undefined,
    });
    setNewRoom({ name: '', capacity: '', description: '' });
    setShowAddRoom(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    const roomBookings = bookings.filter(b => b.roomId === roomId);
    if (roomBookings.length > 0) {
      alert('Cannot delete room with active bookings. Please cancel all bookings first.');
      return;
    }
    onDeleteRoom(roomId);
    setDeleteConfirm(null);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current stored password
    const currentStoredPassword = (window as any).getAdminPassword ? (window as any).getAdminPassword() : 'admin123';
    
    // Verify current password
    if (passwordData.currentPassword !== currentStoredPassword) {
      alert('Current password is incorrect');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Update password using the global function
    if ((window as any).setAdminPassword) {
      (window as any).setAdminPassword(passwordData.newPassword);
      
      // Dispatch custom event to notify header component
      window.dispatchEvent(new CustomEvent('adminPasswordUpdated'));
      
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } else {
      alert('Error updating password. Please try again.');
    }
  };

  const upcomingBookings = bookings
    .filter(b => new Date(b.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Rooms</p>
              <p className="text-3xl font-bold">{rooms.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold">{upcomingBookings.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Admin Settings</h3>
            <button
              onClick={() => setShowPasswordChange(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </button>
          </div>
        </div>

        {showPasswordChange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 border-b border-gray-200 bg-gray-50"
          >
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      {/* Room Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Meeting Rooms</h3>
            <button
              onClick={() => setShowAddRoom(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </button>
          </div>
        </div>

        {showAddRoom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 border-b border-gray-200 bg-gray-50"
          >
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Conference Room A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Optional)
                  </label>
                  <input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="8"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Room details, equipment, etc."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="divide-y divide-gray-200">
          {rooms.map((room) => (
            <div key={room.id} className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{room.name}</h4>
                <p className="text-sm text-gray-500">
                  {room.capacity && `${room.capacity} people`}
                  {room.description && (room.capacity ? ' • ' : '') + room.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {bookings.filter(b => b.roomId === room.id).length} bookings
                </span>
                {deleteConfirm === room.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Confirm Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(room.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Bookings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingBookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{booking.title}</h4>
                <p className="text-sm text-gray-500">
                  {booking.roomName} • {new Date(booking.start).toLocaleDateString()} at{' '}
                  {new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-500">
                  Booked by {booking.bookedBy}
                  {booking.bookedFor && ` for ${booking.bookedFor}`}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this booking?')) {
                    onDeleteBooking(booking.id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {upcomingBookings.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No upcoming bookings
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};