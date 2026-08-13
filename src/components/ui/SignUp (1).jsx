import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (fullName.trim() === "") {
      setError("Full name cannot be empty");
      return;
    }

    if (email.trim() === "") {
      setError("Email cannot be empty");
      return;
    }

    if (password.trim() === "") {
      setError("Password cannot be empty");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password strength check
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Simulate successful signup
    localStorage.setItem("userEmail", email);
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center  bg-gradient-to-br from-[#0f172a] via-[#3b0764] to-[#240046] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white bg-opacity-5 backdrop-blur-2xl border border-white border-opacity-10 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Gradient Border Effect */}
          <div className="absolute inset-[-1px] bg-gradient-to-br from-white/10 to-white/5 rounded-3xl -z-10 blur-sm"></div>

          {/* Inner Glowing Border */}
          <div className="absolute inset-1 border-2 border-white border-opacity-5 rounded-[1.5rem] pointer-events-none"></div>

          <div className="p-8 relative z-10">
            <div className="flex items-center justify-center mb-6">
              <User className="w-12 h-12 text-white text-opacity-80 mr-3" />
              <h2 className="text-3xl font-bold text-white text-opacity-90">
                Sign Up
              </h2>
            </div>
            <p className="text-center text-white text-opacity-70 mb-6">
              Create your account to get started
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-xl mb-6 shadow-lg border border-red-500 border-opacity-20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-white text-opacity-80 mb-1 font-medium"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-opacity-70" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 pl-10 py-3 bg-white bg-opacity-5 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-10 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-white text-opacity-80 mb-1 font-medium"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-opacity-70" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 pl-10 py-3 bg-white bg-opacity-5 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-10 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-white text-opacity-80 mb-1 font-medium"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-opacity-70" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 pl-10 pr-12 py-3 bg-white bg-opacity-5 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-10 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-white text-opacity-60 mt-1 pl-10">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-white text-opacity-80 mb-1 font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-opacity-70" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 pl-10 pr-12 py-3 bg-white bg-opacity-5 backdrop-blur-sm text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-10 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100 transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="form-checkbox rounded bg-white bg-opacity-5 border-white border-opacity-30 text-purple-600 focus:ring-purple-400"
                />
                <label
                  htmlFor="terms"
                  className="text-white text-opacity-70 text-sm"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 bg-opacity-70 hover:bg-opacity-90 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Create Account</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white border-opacity-20"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-purple-900 bg-opacity-70 backdrop-blur-sm px-3 text-white text-opacity-70 rounded-full">
                    Or sign up with
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 bg-white bg-opacity-5 backdrop-blur-sm text-white border border-white border-opacity-10 rounded-xl hover:border-opacity-20 hover:text-opacity-100 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="mr-2"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.75c-.99.67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.93-6.17-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.83 14.08c-.25-.67-.38-1.39-.38-2.13s.14-1.46.38-2.13V7.98H2.18C1.43 9.68 1 11.68 1 13.95s.43 4.27 1.18 6.02l3.65-2.89z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.02l3.65 2.89c.87-2.6 3.3-4.53 6.17-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>
            </form>

            <div className="mt-6 text-center text-white text-opacity-70 text-sm">
              Already have an account?
              <a
                href="/signin"
                className="ml-2 text-white hover:underline font-semibold"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
