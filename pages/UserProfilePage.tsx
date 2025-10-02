import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { User } from '../types';

const UserProfilePage: React.FC = () => {
  const { user, token, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile update states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account deletion states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const userProfile = await api.getProfile(token);
        setProfile(userProfile);
        setUsername(userProfile.username);
        setEmail(userProfile.email);
        setProfilePicturePreview(userProfile.profilePicture || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSuccess(null);
    setIsUpdatingProfile(true);

    try {
      const updatedUser = await api.updateProfile({
        username: username !== profile?.username ? username : undefined,
        email: email !== profile?.email ? email : undefined,
        profilePicture: profilePicture || undefined,
      }, token);

      setProfile(updatedUser);
      updateUser(updatedUser); // Update auth context
      setSuccess('Profile updated successfully!');
      setProfilePicture(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsChangingPassword(true);

    try {
      await api.changePassword(currentPassword, newPassword, token);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;

    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsDeletingAccount(true);

    try {
      await api.deleteAccount(token);
      // Logout user after account deletion
      logout();
      // Redirect to home
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-400">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Profile Information Section */}
      <div className="bg-spotify-dark rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview.startsWith('data:') || profilePicturePreview.startsWith('http')
                  ? profilePicturePreview
                  : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/profile-pictures/${profilePicturePreview}`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-spotify-green"
                onError={(e) => {
                  console.error('Profile picture failed to load:', e.currentTarget.src);
                  // Hide the broken image and show fallback
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {(!profilePicturePreview || profilePicturePreview.startsWith('data:') || !profilePicturePreview.startsWith('http')) && (
              <div className="w-24 h-24 bg-spotify-green rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-medium text-lg">{profile.username}</p>
            <p className="text-spotify-gray-light capitalize">{profile.role}</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-spotify-gray-light text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="spotify-input w-full"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-spotify-gray-light text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="spotify-input w-full"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-spotify-gray-light text-sm font-bold mb-2">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="spotify-input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="spotify-button disabled:opacity-50"
          >
            {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-spotify-dark rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-spotify-gray-light text-sm font-bold mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="spotify-input w-full"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-spotify-gray-light text-sm font-bold mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="spotify-input w-full"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-spotify-gray-light text-sm font-bold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="spotify-input w-full"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="spotify-button disabled:opacity-50"
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Deletion Section */}
      <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
        <h2 className="text-xl font-bold text-white mb-6">Danger Zone</h2>

        {!showDeleteConfirm ? (
          <div>
            <p className="text-spotify-gray-light mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div>
            <p className="text-white font-medium mb-4">
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </p>
            <p className="text-spotify-gray-light text-sm mb-4">
              Type <strong>DELETE</strong> in the box below to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="spotify-input w-full mb-4"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmation('');
                }}
                className="bg-spotify-gray hover:bg-spotify-gray-light text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;