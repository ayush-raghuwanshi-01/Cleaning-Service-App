import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your sign-in logic here
    console.log('Sign in attempt with:', { email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-900 bg-opacity-90 p-4">
      <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg border border-purple-600 border-opacity-50 hover:border-opacity-100 transition-all duration-300 rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl text-white text-opacity-90 mb-2">Sign In</h2>
          <p className="text-white text-opacity-70 mb-4">Enter your email and password to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-white text-opacity-80 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50 border border-purple-600 border-opacity-50 rounded-md focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-white text-opacity-80 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50 border border-purple-600 border-opacity-50 rounded-md focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <a href="#" className="text-white text-opacity-80 hover:text-opacity-100 hover:underline">
                Forgot password?
              </a>
              <a href="#" className="text-white text-opacity-80 hover:text-opacity-100 hover:underline">
                Create account
              </a>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 bg-purple-700 bg-opacity-70 hover:bg-opacity-90 text-white rounded-md transition-all duration-300"
            >
              Sign In
            </button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white border-opacity-30"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-purple-900 bg-opacity-70 px-2 text-white text-opacity-70">
                  Or continue with
                </span>
              </div>
            </div>
            
            <button 
              type="button"
              className="w-full py-2 bg-white bg-opacity-10 text-white border border-purple-600 border-opacity-50 rounded-md hover:border-opacity-100 hover:text-opacity-100 transition-all duration-300"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;