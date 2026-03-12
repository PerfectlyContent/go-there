import { useState } from 'react';
import { motion } from 'framer-motion';

const VALID_USERNAME = 'gothere';
const VALID_PASSWORD = 'letmein';

function SignInScreen({ onSignIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      try {
        sessionStorage.setItem('go-there-auth', '1');
      } catch {}
      onSignIn();
    } else {
      setError('Invalid username or password');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full flex-col items-center justify-center bg-background-light px-6"
      style={{ height: '100dvh' }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-primary flex size-14 items-center justify-center bg-primary/10 rounded-2xl">
              <span className="material-symbols-outlined text-4xl">auto_awesome</span>
            </div>
          </div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Go There
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoComplete="username"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className="w-full h-12 rounded-full bg-primary text-white text-base font-bold shadow-lg shadow-primary/25 cursor-pointer transition-all"
          >
            Sign In
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

export default SignInScreen;
