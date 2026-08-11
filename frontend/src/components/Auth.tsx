import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, ClipboardList, ArrowRight, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import api from '../api';

interface AuthProps {
  onLoginSuccess: (token: string, user: User) => void;
  onBack?: () => void;
}

export default function Auth({ onLoginSuccess, onBack }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      onLoginSuccess(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #e8f4fd 0%, #dbeafe 30%, #eff6ff 50%, #dbeafe 70%, #e0f0fe 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Decorative background elements */}
      {/* Top-right dots */}
      <svg style={{ position: 'absolute', top: '40px', right: '60px', opacity: 0.3 }} width="80" height="80" viewBox="0 0 80 80">
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 5 }).map((_, c) => (
            <circle key={`${r}-${c}`} cx={8 + c * 16} cy={8 + r * 16} r="2.5" fill="#93c5fd" />
          ))
        )}
      </svg>
      {/* Bottom-left dots */}
      <svg style={{ position: 'absolute', bottom: '60px', left: '80px', opacity: 0.25 }} width="64" height="64" viewBox="0 0 64 64">
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <circle key={`${r}-${c}`} cx={8 + c * 16} cy={8 + r * 16} r="2" fill="#93c5fd" />
          ))
        )}
      </svg>

      {/* Bottom wave decoration */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '220px', opacity: 0.5 }} viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0,160 C320,220 480,100 720,140 C960,180 1120,80 1440,120 L1440,220 L0,220 Z" fill="url(#waveGrad1)" />
        <path d="M0,180 C240,140 480,200 720,170 C960,140 1200,200 1440,160 L1440,220 L0,220 Z" fill="url(#waveGrad2)" />
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top-left curved decoration */}
      <svg style={{ position: 'absolute', top: '-80px', left: '-80px', opacity: 0.15, width: '400px', height: '400px' }} viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="180" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#60a5fa" strokeWidth="1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
      </svg>

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 25px 60px rgba(96, 165, 250, 0.12), 0 4px 16px rgba(0,0,0,0.04)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '0.82rem',
              fontWeight: 500,
              padding: '0',
              marginBottom: '16px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        )}

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
          }}>
            <ClipboardList size={32} color="#ffffff" strokeWidth={1.8} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '1.55rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
          }}>
            Fundsroom Wholesale ERP
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: 0,
          }}>
            Welcome back! Please sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.8rem',
            padding: '10px 14px',
            borderRadius: '12px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.835rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '6px',
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
              }}>
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fundsroom.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.835rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
              }}>
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 44px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '22px',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: '#475569',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#3b82f6',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              />
              Remember me
            </label>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                fontSize: '0.82rem',
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading
                ? '#94a3b8'
                : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.15s, box-shadow 0.2s',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(59, 130, 246, 0.3)',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(59, 130, 246, 0.3)';
            }}
            onMouseDown={(e) => {
              if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Divider line */}
        <div style={{
          width: '100%',
          height: '1px',
          background: '#e2e8f0',
          margin: '24px 0 18px 0',
        }} />

        {/* Security badge */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={18} color="#3b82f6" />
          </div>
          <div>
            <p style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#1e293b',
              margin: '0 0 2px 0',
            }}>
              Secure & Protected
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.4,
            }}>
              Your data is safe with us. We use industry-standard security to protect your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

