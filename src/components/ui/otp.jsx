import  { useState, useRef, useEffect } from "react";
import SignUp from "./SignUp";
const OTP = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus to next input field after entering a digit
      if (value && index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Check if pasted content contains only digits
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 4);
      const newOtp = [...otp];
      
      digits.forEach((digit, index) => {
        if (index < 4) {
          newOtp[index] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus the appropriate input based on how many digits were pasted
      if (digits.length < 4 && inputRefs.current[digits.length]) {
        inputRefs.current[digits.length].focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 shadow-[0_0_15px_purple] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">We've sent a verification code to</p>
          <p className="text-purple-400 font-medium">your@email.com</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-14 h-14 text-center text-white text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            ))}
          </div>
        </div>
        
        <button
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition-colors"
        >
          Verify
        </button>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-4">
            Didn't receive a code?
          </p>
          <button 
            type="button" 
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Resend Code
          </button>
        </div>
        
        <p className="text-gray-400 text-sm text-center mt-6">
          <a href="/signUp" className="text-purple-400 hover:text-purple-300">
            ← Back to Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default OTP;