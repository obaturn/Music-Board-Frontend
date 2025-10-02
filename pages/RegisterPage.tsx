
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Frontend validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await register(username, email, password, role, profilePicture || undefined);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-spotify-dark p-8 rounded-xl shadow-spotify">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Register</h2>
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-500/20 text-green-400 p-3 rounded-md mb-4 text-center">{success}</p>}
        <form onSubmit={handleSubmit} data-form-type="register">
          <div className="mb-4">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className={`spotify-input w-full ${username && username.length < 3 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {username && username.length < 3 && (
              <p className="text-red-400 text-xs mt-1">Username must be at least 3 characters long</p>
            )}
            {username && username.length >= 3 && (
              <p className="text-green-400 text-xs mt-1">✓ Username looks good</p>
            )}
            {!username && (
              <p className="text-spotify-gray-light text-xs mt-1">Must be at least 3 characters long</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="spotify-input w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={`spotify-input w-full pr-10 ${password && password.length < 6 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-spotify-gray-light hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters long</p>
            )}
            {password && password.length >= 6 && (
              <p className="text-green-400 text-xs mt-1">✓ Password meets requirements</p>
            )}
            {!password && (
              <p className="text-spotify-gray-light text-xs mt-1">Must be at least 6 characters long</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={`spotify-input w-full pr-10 ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-spotify-gray-light hover:text-white"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
            )}
            {!confirmPassword && (
              <p className="text-spotify-gray-light text-xs mt-1">Re-enter your password</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="spotify-input w-full">
              <option value={UserRole.USER}>User</option>
              <option value={UserRole.EMPLOYER}>Employer</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="profilePicture">Profile Picture (Optional)</label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              className="spotify-input w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-spotify-green file:text-white hover:file:bg-spotify-green-hover"
            />
            <p className="text-xs text-spotify-gray-light mt-1">Supported formats: JPG, PNG, GIF, WebP (Max 5MB)</p>
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" disabled={isLoading} className="w-full spotify-button focus:outline-none focus:shadow-outline disabled:opacity-50">
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
           <p className="text-center text-spotify-gray-light text-sm mt-6">
            Already have an account? <Link to="/login" className="text-spotify-green hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
