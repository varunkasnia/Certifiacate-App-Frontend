'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { tokens, user } = response.data;
      
      Cookies.set('access_token', tokens.access, { expires: 1 });
      Cookies.set('refresh_token', tokens.refresh, { expires: 7 });
      
      router.push('/dashboard');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, messages]: [string, any]) => {
            let msg = '';
            if (Array.isArray(messages)) {
              msg = messages[0]?.toString() || messages[0] || '';
            } else if (typeof messages === 'object' && messages !== null) {
              msg = JSON.stringify(messages);
            } else {
              msg = String(messages);
            }
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
            return `${fieldName}: ${msg}`;
          })
          .join('. ');
        setError(errorMessages || errorData.error || 'Login failed');
      } else {
        setError(errorData?.error || errorData?.message || 'Login failed');
      }
      console.error('Login error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary-700">LIVEQUIZ AI</h1>
        <h2 className="text-xl font-semibold text-center mb-8">Login</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
