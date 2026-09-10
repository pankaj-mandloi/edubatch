import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  CalendarIcon as CalendarIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
        { name: 'Batches', href: '/batches', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
        { name: 'Enrollments', href: '/enrollments', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
        { name: 'Attendance', href: '/attendance', icon: CalendarIcon, iconSolid: CalendarIconSolid },
        { name: 'Notices', href: '/notices', icon: BellIcon, iconSolid: BellIconSolid },
        { name: 'Payments', href: '/payments', icon: CreditCardIcon, iconSolid: CreditCardIconSolid },
        { name: 'Profile', href: '/profile', icon: UserIcon, iconSolid: UserIconSolid }
      ];
    }

    if (user?.role === 'teacher') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
        { name: 'Batches', href: '/batches', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
        { name: 'Enrollments', href: '/enrollments', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
        { name: 'Attendance', href: '/attendance', icon: CalendarIcon, iconSolid: CalendarIconSolid },
        { name: 'Notices', href: '/notices', icon: BellIcon, iconSolid: BellIconSolid },
        { name: 'Profile', href: '/profile', icon: UserIcon, iconSolid: UserIconSolid }
      ];
    }

    return [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
      { name: 'Batches', href: '/batches', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
      { name: 'My Enrollments', href: '/enrollments', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
      { name: 'My Attendance', href: '/attendance', icon: CalendarIcon, iconSolid: CalendarIconSolid },
      { name: 'Notices', href: '/notices', icon: BellIcon, iconSolid: BellIconSolid },
      { name: 'Payments', href: '/payments', icon: CreditCardIcon, iconSolid: CreditCardIconSolid },
      { name: 'Profile', href: '/profile', icon: UserIcon, iconSolid: UserIconSolid }
    ];
  };

  const navigation = getNavigationItems();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ Changed w-72 to w-64 */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        pt-16
      `}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-emerald-50 lg:hidden"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>

        <nav className="mt-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = isActive ? item.iconSolid : item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-100/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;