import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [forgotPasswordToken, setForgotPasswordToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/v1/auth/forgot-password-request`,
        { email }
      );
      setMessage(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      // You might want to add a token verification endpoint in your backend
      // For now, we'll just proceed to step 3 if token is not empty
      if (forgotPasswordToken.trim()) {
        setStep(3);
      } else {
        setError("Please enter a valid token");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/reset-password`,
        { email, forgotPasswordToken, newPassword, confirmNewPassword }
      );
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-rose-100 rounded-lg shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-slate-700 text-center">
          {step === 1
            ? "Forgot Password"
            : step === 2
            ? "Verify Token"
            : "Reset Password"}
        </h1>
        <p className="text-slate-600 text-center">
          {step === 1
            ? "Enter your email to receive a reset token."
            : step === 2
            ? "Enter the token sent to your email."
            : "Enter your new password."}
        </p>
        {message && (
          <p className="text-green-600 text-center animate-fade-in">
            {message}
          </p>
        )}
        {error && (
          <p className="text-rose-600 text-center animate-fade-in">{error}</p>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-slate-700 font-medium"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-rose-500 focus:border-rose-500 text-rose-900 placeholder-slate-600"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-slate-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="inline-block mr-2 animate-spin" />
              )}
              Send Reset Token
            </button>
          </form>
        )}

        {/* Step 2: Token Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyToken} className="space-y-6">
            <div>
              <label
                htmlFor="token"
                className="block text-slate-700 font-medium"
              >
                Reset Token
              </label>
              <input
                type="text"
                id="token"
                value={forgotPasswordToken}
                onChange={(e) => setForgotPasswordToken(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-rose-500 focus:border-rose-500 text-rose-900 placeholder-slate-600"
                placeholder="Enter 6-digit token"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-slate-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="inline-block mr-2 animate-spin" />
              )}
              Verify Token
            </button>
          </form>
        )}

        {/* Step 3: Password Reset */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-slate-700 font-medium"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-rose-500 focus:border-rose-500 text-rose-900 placeholder-slate-600"
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-slate-700 font-medium"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-rose-500 focus:border-rose-500 text-rose-900 placeholder-slate-600"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="inline-block mr-2 animate-spin" />
              )}
              Reset Password
            </button>
          </form>
        )}

        <p className="text-center text-rose-600">
          <a href="/login" className="text-rose-800 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;
