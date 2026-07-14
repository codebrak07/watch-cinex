import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
    quizAnswer: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      alert("Please fill all details!");
      return;
    }
    if (!formData.terms) {
      alert("You must agree to the terms to continue.");
      return;
    }
    if (formData.quizAnswer !== '4') {
      alert("Wrong Math Answer! Try harder.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center font-sans relative px-4 py-12 overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#e50914]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#e50914]/5 blur-[150px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="register-form-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
            className="w-full max-w-md bg-black/80 border border-white/10 rounded-lg p-8 md:p-10 shadow-2xl relative z-10"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e50914] to-neutral-700 rounded-lg blur opacity-20 -z-10" />

            <h2 className="text-2xl font-bold tracking-tight mb-2 text-[#e50914] text-center font-sans uppercase">
              Create New Profile
            </h2>
            <p className="text-center text-xs text-neutral-400 mb-8 font-sans">
              Enter details below to sign up.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. ishanvi"
                  className="w-full bg-[#141414] border border-white/10 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] outline-none rounded px-4 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ishanvi@netflix.com"
                  className="w-full bg-[#141414] border border-white/10 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] outline-none rounded px-4 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-[#141414] border border-white/10 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] outline-none rounded px-4 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-white/10 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] outline-none rounded px-4 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-white/10 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] outline-none rounded px-4 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors font-sans"
                />
              </div>

              {/* Bot Verification Math Question */}
              <div className="bg-[#141414] p-4 rounded border border-white/5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#e50914] mb-2 font-bold font-sans">Verification Quiz</label>
                <p className="text-xs text-neutral-400 mb-2 font-sans">Solve: 2 + 2 × 2 - 2 = ?</p>
                <input
                  type="text"
                  required
                  value={formData.quizAnswer}
                  onChange={(e) => setFormData({ ...formData, quizAnswer: e.target.value })}
                  placeholder="Your answer"
                  className="w-full bg-black border border-white/10 focus:border-[#e50914] outline-none rounded px-3 py-1.5 text-xs text-white placeholder-neutral-600 font-mono"
                />
              </div>

              {/* Confusing Terms Checklist */}
              <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-neutral-400 select-none">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="mt-0.5 accent-[#e50914] cursor-pointer"
                />
                <span className="font-sans">
                  I agree that I am a certified Niggamon, and accept all terms of service including admitting Nigga is the undisputed GNOAT, greatest nigga of all time.
                </span>
              </label>

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  className="w-full bg-[#e50914] hover:bg-[#b20710] text-white font-mono text-xs tracking-wider uppercase font-bold py-3.5 px-8 rounded transition-colors shadow-lg cursor-pointer text-center"
                >
                  Confirm Register
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="register-message-box"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
            className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-lg p-10 text-center shadow-2xl relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e50914] to-neutral-700 rounded-lg blur opacity-30 -z-10" />

            <div className="w-16 h-16 rounded-full bg-[#e50914]/10 flex items-center justify-center mx-auto mb-8 text-[#e50914]">
              <span className="text-3xl">⚠️</span>
            </div>

            <p className="text-xl md:text-2xl font-medium text-white mb-8 tracking-tight font-sans leading-relaxed">
              ek acc banakar dia he usme khush rehna dusra acc kyu banana he niggamon
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-[#e50914] hover:bg-[#b20710] text-white font-mono text-xs tracking-wider uppercase font-bold py-3 px-8 rounded transition-colors shadow-lg"
            >
              Back to profiles
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
