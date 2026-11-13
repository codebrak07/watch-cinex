import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/cinex.png';

export default function NetflixAuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const { login, signup, loginWithGoogle, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setResetMessage('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error('Google Sign-In error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (showReset) {
      if (!email) {
        setError('Please enter your email address to reset your password.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setResetMessage('Password reset link sent! Please check your inbox.');
      } catch (err) {
        setError(err.message || 'Failed to send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const cred = await signup(email.trim(), password, name.trim());
        const disp = name.trim() || email.split('@')[0];
        localStorage.setItem('cinex_active_profile', JSON.stringify({ name: disp, avatar: disp.charAt(0).toUpperCase() }));
      } else {
        // Smart Sign-in with Auto-Signup fallback for new accounts
        try {
          await login(email.trim(), password);
          const disp = email.split('@')[0];
          localStorage.setItem('cinex_active_profile', JSON.stringify({ name: disp, avatar: disp.charAt(0).toUpperCase() }));
        } catch (loginErr) {
          if (loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/user-not-found') {
            try {
              // Automatically register if account doesn't exist yet
              await signup(email.trim(), password, name.trim() || email.split('@')[0]);
              const disp = name.trim() || email.split('@')[0];
              localStorage.setItem('cinex_active_profile', JSON.stringify({ name: disp, avatar: disp.charAt(0).toUpperCase() }));
            } catch (signupErr) {
              if (signupErr.code === 'auth/email-already-in-use') {
                throw loginErr;
              } else {
                throw signupErr;
              }
            }
          } else {
            throw loginErr;
          }
        }
      }
      onClose();
    } catch (err) {
      console.error('Firebase Auth error:', err);
      let msg = 'Failed to authenticate. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Incorrect password for this account. Please try again or click Need help?';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already in use. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.95) 100%), url('https://assets.nflxext.com/ffe/siteui/vlv3/ab17e75f-3d60-466a-b286-9a5d3f23b7e7/e428df13-ef90-449e-b9e7-03bbfaea2efd/IN-en-20240902-TRIFECTA-perspective_WEB_abf1dd53-b0f3-42bf-907d-e6b728515e06_large.jpg')`
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-[450px] bg-black/85 border border-zinc-800 rounded-lg p-8 sm:p-14 text-white shadow-2xl z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <img src={logoImg} alt="CineX" className="h-7 w-auto object-contain" />
        </div>

        <h1 className="text-3xl font-bold mb-7">
          {showReset ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </h1>

        {/* Netflix style error notification */}
        {error && (
          <div className="bg-[#e87c03] text-white text-sm px-4 py-3 rounded mb-5 flex items-start gap-2.5 font-medium leading-snug">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Reset Success Message */}
        {resetMessage && (
          <div className="bg-emerald-600/90 text-white text-sm px-4 py-3 rounded mb-5 flex items-start gap-2.5 font-medium leading-snug">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{resetMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && !showReset && (
            <div>
              <input
                type="text"
                placeholder="Name or nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#333333] border border-transparent focus:border-zinc-500 focus:bg-[#454545] rounded px-4 py-3.5 text-sm text-white placeholder-zinc-400 outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email or mobile number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#333333] border border-transparent focus:border-zinc-500 focus:bg-[#454545] rounded px-4 py-3.5 text-sm text-white placeholder-zinc-400 outline-none transition-colors"
            />
          </div>

          {!showReset && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#333333] border border-transparent focus:border-zinc-500 focus:bg-[#454545] rounded px-4 py-3.5 text-sm text-white placeholder-zinc-400 outline-none transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e50914] hover:bg-[#c11119] text-white font-semibold py-3.5 rounded mt-3 transition duration-200 cursor-pointer disabled:opacity-50 text-base shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              showReset ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In')
            )}
          </button>

          {!showReset && (
            <>
              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-zinc-700" />
                <span className="px-3 text-xs text-zinc-400 uppercase font-mono tracking-wider">OR</span>
                <div className="flex-1 border-t border-zinc-700" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-3 border border-white/20 cursor-pointer disabled:opacity-50 text-sm shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </>
          )}

          {!showReset && (
            <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#333] border-none text-[#e50914] focus:ring-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setError('');
                }}
                className="hover:underline cursor-pointer bg-transparent border-0 text-zinc-400 p-0"
              >
                Need help?
              </button>
            </div>
          )}

          {showReset && (
            <button 
              type="button"
              onClick={() => {
                setShowReset(false);
                setError('');
                setResetMessage('');
              }}
              className="text-xs text-zinc-400 hover:text-white text-center mt-2 cursor-pointer"
            >
              ← Back to Sign In
            </button>
          )}
        </form>

        <div className="mt-10 pt-4 text-sm text-zinc-400">
          {!showReset && (
            <p>
              {isSignUp ? 'Already have an account?' : 'New to CineX?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-white hover:underline font-semibold ml-1 cursor-pointer"
              >
                {isSignUp ? 'Sign in now.' : 'Sign up now.'}
              </button>
            </p>
          )}
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
            <span className="text-[#0071eb] hover:underline cursor-pointer">Learn more.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
