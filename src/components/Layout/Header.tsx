import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Settings, User, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: 'calendar' | 'admin';
  onViewChange: (view: 'calendar' | 'admin') => void;
  isAdmin: boolean;
}

const ADMIN_PASSWORD_KEY = 'manthan_minds_admin_password';
const DEFAULT_PASSWORD = 'admin123';

// Global password management
const getStoredPassword = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASSWORD;
  }
  return DEFAULT_PASSWORD;
};

const setStoredPassword = (password: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_PASSWORD_KEY, password);
  }
};

// Make password functions globally available
if (typeof window !== 'undefined') {
  (window as any).getAdminPassword = getStoredPassword;
  (window as any).setAdminPassword = setStoredPassword;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, isAdmin }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentStoredPassword, setCurrentStoredPassword] = useState(DEFAULT_PASSWORD);

  // Load stored password on component mount
  useEffect(() => {
    const storedPassword = getStoredPassword();
    setCurrentStoredPassword(storedPassword);
  }, []);

  // Listen for password updates from admin panel
  useEffect(() => {
    const handlePasswordUpdate = () => {
      const newPassword = getStoredPassword();
      setCurrentStoredPassword(newPassword);
    };

    // Listen for custom event when password is updated
    window.addEventListener('adminPasswordUpdated', handlePasswordUpdate);
    
    return () => {
      window.removeEventListener('adminPasswordUpdated', handlePasswordUpdate);
    };
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === currentStoredPassword) {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      onViewChange('admin');
      setAdminPassword('');
    } else {
      alert('Incorrect password');
      setAdminPassword('');
    }
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      onViewChange('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  return (
    <>
      <motion.header 
        className="bg-white shadow-sm border-b border-gray-200 h-16"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-full mx-auto px-6 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-4">
              {/* Company Logo */}
              <div className="flex items-center">
                <img 
                  src="/image.png" 
                  alt="Company Logo" 
                  className="h-10 w-auto"
                />
              </div>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">Manthan Minds</h1>
                <p className="text-sm text-gray-500 italic">where ideas take shape</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewChange('calendar')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'calendar'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>User Mode</span>
                </button>
                
                <button
                  onClick={handleAdminClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'admin' && isAdminAuthenticated
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAdminLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Admin Access</h3>
              </div>
              <p className="text-gray-600 mb-4">Enter admin password to continue</p>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};