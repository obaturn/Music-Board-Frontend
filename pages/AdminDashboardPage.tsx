import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { User, UserRole, Music } from '../types';

interface AdminStats {
  totalUsers: number;
  totalMusic: number;
  totalArtists: number;
  totalAlbums: number;
  usersByRole: { _id: string; count: number }[];
  recentUsers: User[];
  recentMusic: Music[];
}

const AdminDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'music'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const [statsData, usersData] = await Promise.all([
          api.getAdminStats(token),
          api.getAllUsers(token)
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!token) return;

    try {
      await api.updateUserRole(userId, newRole, token);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.deleteUser(userId, token);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-spotify-gray-light">Manage users, content, and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-spotify-dark p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'User Management' },
          { id: 'music', label: 'Content Management' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-spotify-green text-white'
                : 'text-spotify-gray-light hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-spotify-dark p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-spotify-gray-light text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-spotify-dark p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-spotify-gray-light text-sm">Total Music</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMusic}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-spotify-dark p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-spotify-gray-light text-sm">Total Artists</p>
                  <p className="text-2xl font-bold text-white">{stats.totalArtists}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-spotify-dark p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-spotify-gray-light text-sm">Total Albums</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAlbums}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Users by Role Chart */}
          <div className="bg-spotify-dark p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">Users by Role</h3>
            <div className="space-y-3">
              {stats.usersByRole.map((roleData) => (
                <div key={roleData._id} className="flex items-center justify-between">
                  <span className="text-spotify-gray-light capitalize">{roleData._id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-spotify-gray h-2 rounded-full">
                      <div
                        className="bg-spotify-green h-2 rounded-full"
                        style={{ width: `${(roleData.count / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-8 text-right">{roleData.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-spotify-dark p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats.recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.username}</p>
                      <p className="text-spotify-gray-light text-sm capitalize">{user.role}</p>
                    </div>
                    <p className="text-spotify-gray-light text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-spotify-dark p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Recent Music</h3>
              <div className="space-y-3">
                {stats.recentMusic.slice(0, 5).map((music) => (
                  <div key={music._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-spotify-gray rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-spotify-gray-light" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{music.title}</p>
                      <p className="text-spotify-gray-light text-sm truncate">{music.artist}</p>
                    </div>
                    <p className="text-spotify-gray-light text-xs">
                      {new Date(music.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-spotify-dark rounded-xl overflow-hidden">
          <div className="p-6 border-b border-spotify-gray">
            <h3 className="text-xl font-bold text-white">User Management</h3>
            <p className="text-spotify-gray-light">Manage user accounts and permissions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-spotify-gray/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-spotify-gray-light uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-spotify-gray-light uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-spotify-gray-light uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-spotify-gray-light uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-spotify-gray-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-spotify-gray">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-spotify-gray/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-spotify-gray-light">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="bg-spotify-dark border border-spotify-gray rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="user">User</option>
                        <option value="employer">Employer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-spotify-gray-light">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Music Tab */}
      {activeTab === 'music' && (
        <div className="bg-spotify-dark p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">Content Management</h3>
          <p className="text-spotify-gray-light mb-6">Manage music, artists, and albums</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h4 className="text-white font-medium mb-1">Music Library</h4>
              <p className="text-spotify-gray-light text-sm">Manage uploaded tracks</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-white font-medium mb-1">Artists</h4>
              <p className="text-spotify-gray-light text-sm">Manage artist profiles</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="text-white font-medium mb-1">Albums</h4>
              <p className="text-spotify-gray-light text-sm">Manage album collections</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;