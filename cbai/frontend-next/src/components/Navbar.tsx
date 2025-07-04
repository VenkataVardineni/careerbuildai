'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Brain, ArrowLeft, Home, User, History, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import api from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('email'));
      
      // Listen for custom auth events
      const handleAuthChange = () => {
        setEmail(localStorage.getItem('email'));
      };
      
      // Listen for storage changes (when email is set/removed from other tabs)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'email') {
          setEmail(e.newValue);
        }
      };
      
      // Check for email changes periodically (fallback)
      const checkEmail = () => {
        const currentEmail = localStorage.getItem('email');
        if (currentEmail !== email) {
          setEmail(currentEmail);
        }
      };
      
      const interval = setInterval(checkEmail, 1000);
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('auth-change', handleAuthChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('auth-change', handleAuthChange);
        clearInterval(interval);
      };
    }
  }, [email]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('email');
    setEmail(null);
    setIsProfileDropdownOpen(false);
    
    // Dispatch custom event to notify navbar of auth change
    window.dispatchEvent(new Event('auth-change'));
    
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  const handleStartAsGuest = async () => {
    setIsGuestLoading(true);
    try {
      // Use custom axios instance instead of fetch
      const res = await api.post('/api/v1/auth/guest');
      const data = res.data;
      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
        setEmail(data.access_token);
        // Dispatch custom event to notify navbar of auth change
        window.dispatchEvent(new Event('auth-change'));
        router.push('/dashboard');
      }
    } catch (err) {
      // handle error
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/') }>
          <Brain className="text-indigo-600 w-7 h-7" />
          <span className="font-bold text-lg tracking-tight text-gray-800">CareerBuildAI</span>
        </div>
        <div className="flex items-center gap-4">
          {email ? (
            <>
              <Link href="/dashboard" className="font-medium text-indigo-600 transition-colors hover:text-indigo-800 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <Link href="/history" className="font-medium text-indigo-600 transition-colors hover:text-indigo-800 flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <Link href="/profiles" className="font-medium text-indigo-600 transition-colors hover:text-indigo-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                Manage Profiles
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium py-2 focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium py-2 px-3 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <Link href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold shadow">Login</Link>
              <Link href="/register" className="bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md font-semibold shadow">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 