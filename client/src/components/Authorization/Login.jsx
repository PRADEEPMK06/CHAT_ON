import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RxPerson, RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import { loginRoute } from "../../utils/APIRoutes";
import { toastOptions } from "../../utils/constants";
import OTPVerification from "./OTPVerification";

function Login({ isActive }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP verification state for unverified users
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    userId: null,
    email: null
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;

    if (!username || !password) {
      toast.error("Username or Password is incorrect", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, { username, password });

      if (!data.status) {
        // Check if user needs OTP verification
        if (data.requiresVerification) {
          toast.info(data.msg, toastOptions);
          setVerificationData({
            userId: data.userId,
            email: data.email
          });
          setShowOTPVerification(true);
        } else {
          toast.error(data.msg, toastOptions);
        }
      } else {
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(data)
        );
        navigate("/");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.msg || "Something went wrong. Please try again.",
        toastOptions
      );
    }
    setLoading(false);
  };

  // Handle back from OTP verification
  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
    setVerificationData({ userId: null, email: null });
  };

  // Show OTP Verification screen
  if (showOTPVerification) {
    return (
      <OTPVerification 
        userId={verificationData.userId}
        email={verificationData.email}
        onBack={handleBackFromOTP}
      />
    );
  }

  return (
    <>
      <div className="auth">
        <div className="form-container">
          <form className="form login" onSubmit={handleSubmit}>
            <div className="brand-logo">
              <span className="logo-icon">💬</span>
              <span className="logo-text">CHAT_ON</span>
            </div>
            <span className="title">Welcome Back!</span>
            <p className="subtitle">Sign in to continue chatting</p>

            {/* Username */}
            <div className="input-field">
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                value={values.username}
              />
              <RxPerson />
            </div>

            {/* Password */}
            <div className="input-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={values.password}
              />
              <FiLock />
              {showPassword ? (
                <RxEyeOpen
                  className="password-icon"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <RxEyeClosed
                  className="password-icon"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="input-field button" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Switch */}
            <div className="login-signup">
              <span className="text">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="login-link"
                  onClick={() => isActive("no")}
                >
                  Create One
                </button>
              </span>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
}
export default Login;