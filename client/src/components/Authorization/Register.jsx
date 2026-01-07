import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RxPerson, RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { FiMail, FiLock, FiUnlock, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { registerRoute } from "../../utils/APIRoutes";
import { toastOptions } from "../../utils/constants";
import { getProfilePicUrl } from "../../utils/profileUtils";
import OTPVerification from "./OTPVerification";

function Register({ isLoginActive }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    profilePic: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // OTP verification state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    userId: null,
    email: null
  });

  // Update form values
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues({ ...values, profilePic: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Get profile pic to display (preview or gender-based default)
  const getDisplayProfilePic = () => {
    if (previewUrl) {
      return previewUrl;
    }
    return getProfilePicUrl(null, values.gender);
  };

  // Validation function
  const handleValidation = () => {
    const { username, email, password, confirmPassword } = values;

    if (!username || username.length < 3) {
      toast.error("Username should be at least 3 characters.", toastOptions);
      return false;
    }

    if (!email) {
      toast.error("Email is required.", toastOptions);
      return false;
    }

    if (!password || password.length < 6) {
      toast.error("Password should be at least 6 characters.", toastOptions);
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password must match.", toastOptions);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!handleValidation()) return;

    setLoading(true);
    try {
      const { username, email, password, gender, profilePic } = values;
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender);
      if (profilePic) {
        formData.append("profilePic", profilePic, profilePic.name);
      }

      const { data } = await axios.post(registerRoute, formData);

      if (!data.status) {
        toast.error(data.msg, toastOptions);
      } else if (data.requiresVerification) {
        // Show OTP verification
        toast.success(data.msg, toastOptions);
        setVerificationData({
          userId: data.userId,
          email: data.email
        });
        setShowOTPVerification(true);
      } else if (data.user) {
        // Dev mode: User auto-verified, login directly
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(data.user)
        );
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        toast.error(error.response.data.msg, toastOptions);
      } else {
        toast.error("Something went wrong. Please try again.", toastOptions);
      }
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
      <div className="register-wrapper form-container">
        <form className="form signup" onSubmit={handleSubmit}>
          <div className="brand-logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">CHAT_ON</span>
          </div>
          <span className="title">Create Account</span>
          <p className="subtitle">Join our community today</p>

          {/* Username */}
          <div className="input-field">
            <input
              type="text"
              name="username"
              placeholder="Enter your name"
              onChange={handleChange}
              value={values.username}
            />
            <RxPerson />
          </div>

          {/* Email */}
          <div className="input-field">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={values.email}
            />
            <FiMail />
          </div>

          {/* Gender Selection */}
          <div className="input-field gender-field">
            <FiUser />
            <select
              name="gender"
              value={values.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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
            <FiUnlock />
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

          {/* Confirm Password */}
          <div className="input-field">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              value={values.confirmPassword}
            />
            <FiLock />
            {showConfirm ? (
              <RxEyeOpen
                className="password-icon"
                onClick={() => setShowConfirm(false)}
              />
            ) : (
              <RxEyeClosed
                className="password-icon"
                onClick={() => setShowConfirm(true)}
              />
            )}
          </div>

          {/* Profile Picture */}
          <div className="input-field profile-pic-field">
            <label className="profile-pic-label">
              <img 
                src={getDisplayProfilePic()} 
                alt="Profile Preview" 
                className="profile-preview"
              />
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <span className="upload-overlay">
                <MdOutlineAddAPhoto />
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button type="submit" className="input-field button" disabled={loading}>
              {loading ? "Sending OTP..." : "Get Started"}
            </button>
          </div>

          {/* Switch to Login */}
          <div className="login-signup">
            <span className="text">
              Already have an account?{" "}
              <button
                type="button"
                className="login-link"
                onClick={() => isLoginActive("yes")}
              >
                Login Now
              </button>
            </span>
          </div>
        </form>
      </div>
    </>
  );
}

export default Register;