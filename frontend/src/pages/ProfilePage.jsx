import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const fileInputRef = useRef(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateProfile = (data) => {
    const newErrors = {};

    if (!data.name || data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (data.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    if (data.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(data.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    return newErrors;
  };

  const validatePassword = (data) => {
    const newErrors = {};

    if (!data.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!data.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (data.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.confirmPassword !== data.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));

    if (passwordErrors[name]) {
      const { [name]: removed, ...rest } = passwordErrors;
      setPasswordErrors(rest);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setFormData(prev => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const errors = validateProfile(formData);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Updating profile...');

    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        updateUser(response.data.data);
        toast.success('Profile updated successfully!', { id: loadingToast });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update profile',
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const errors = validatePassword(passwordData);
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setPasswordLoading(true);
    const loadingToast = toast.loading('Changing password...');

    try {
      const response = await api.put('/users/change-password', passwordData);
      if (response.data.success) {
        toast.success('Password changed successfully! Please login again.', {
          id: loadingToast,
          duration: 5000
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to change password',
        { id: loadingToast }
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    });
    setAvatarPreview(user?.avatar || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsEditing(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: UserIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon }
  ];

  // Get current avatar to display
  const displayAvatar = avatarPreview || user?.avatar;

  return (
    <Layout>
      <div className="space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
          <p className="text-sm text-gray-500">Manage your account information and security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600"></div>
              
              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={user?.name}
                        className="w-full h-full rounded-xl object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center"
                      style={{ display: displayAvatar ? 'none' : 'flex' }}
                    >
                      <span className="text-3xl font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name + Email */}
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {user?.name}
                  </h2>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    {user?.role}
                  </span>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Quick Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm text-gray-700 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-gray-700 truncate">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</p>
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Tabs */}
              <div className="border-b border-gray-100 px-5">
                <div className="flex gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${
                          isActive
                            ? 'border-emerald-600 text-emerald-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'general' && (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          General Information
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Update your personal details
                        </p>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-5">
                        
                        {/* Avatar Upload Section */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Picture
                          </label>
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            {/* Preview */}
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                {avatarPreview ? (
                                  <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl font-bold text-white">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700">
                                Upload a new avatar
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                PNG, JPG or JPEG. Max 2MB.
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={triggerFileInput}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                  <CameraIcon className="w-3.5 h-3.5" />
                                  Choose File
                                </button>

                                {avatarPreview && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    Remove
                                  </button>
                                )}
                              </div>

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone Number
                          </label>
                          <div className="relative">
                            <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
                              placeholder="9876543210"
                            />
                          </div>
                        </div>

                        {/* Buttons - SAME SIZE, CENTERED */}
                        <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="w-36 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-36 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <UserIcon className="w-4 h-4 text-emerald-600" />
                              <p className="text-xs text-gray-500 font-medium">Full Name</p>
                            </div>
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {user?.name || 'N/A'}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <EnvelopeIcon className="w-4 h-4 text-emerald-600" />
                              <p className="text-xs text-gray-500 font-medium">Email</p>
                            </div>
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {user?.email || 'N/A'}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <PhoneIcon className="w-4 h-4 text-emerald-600" />
                              <p className="text-xs text-gray-500 font-medium">Phone</p>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">
                              {user?.phone || 'Not provided'}
                            </p>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                              <p className="text-xs text-gray-500 font-medium">Role</p>
                            </div>
                            <p className="font-medium text-gray-800 text-sm capitalize">
                              {user?.role || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-700">
                            <strong>Note:</strong> Email address cannot be changed. Contact support if you need to update it.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'security' && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-800">
                        Security Settings
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Update your password to keep your account secure
                      </p>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <KeyIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                              passwordErrors.currentPassword
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                            }`}
                            placeholder="Enter your current password"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <KeyIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                              passwordErrors.newPassword
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                            }`}
                            placeholder="Minimum 6 characters"
                          />
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <KeyIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                              passwordErrors.confirmPassword
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                            }`}
                            placeholder="Re-enter new password"
                          />
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-xs text-emerald-700">
                          <strong>Important:</strong> After changing your password, you'll need to login again with the new password.
                        </p>
                      </div>

                      {/* Buttons - SAME SIZE, CENTERED */}
                      <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                            setPasswordErrors({});
                          }}
                          className="w-36 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="w-36 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {passwordLoading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;