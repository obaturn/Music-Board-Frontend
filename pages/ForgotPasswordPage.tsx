import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResetToken(null);
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.forgotPassword(email);
      setSuccess(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-spotify-dark p-8 rounded-xl shadow-spotify">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Forgot Password</h2>
        <p className="text-spotify-gray-light text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-500/20 text-green-400 p-3 rounded-md mb-4 text-center">{success}</p>}

        {resetToken && (
          <div className="bg-blue-500/20 text-blue-400 p-3 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">Demo Reset Token (remove in production):</p>
            <p className="text-xs font-mono break-all">{resetToken}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} data-form-type="forgot-password">
          <div className="mb-6">
            <label className="block text-spotify-gray-light text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="spotify-input w-full"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full spotify-button focus:outline-none focus:shadow-outline disabled:opacity-50 mb-4"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-spotify-green hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;