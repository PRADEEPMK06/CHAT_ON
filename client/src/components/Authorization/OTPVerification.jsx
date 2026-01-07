import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOTPRoute, resendOTPRoute } from "../../utils/APIRoutes";
import { toastOptions } from "../../utils/constants";

function OTPVerification({ userId, email, onBack }) {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef([]);

    // Timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Handle OTP input change
    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split("").forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    // Verify OTP
    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        
        if (otpString.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP", toastOptions);
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(verifyOTPRoute, {
                userId,
                otp: otpString
            });

            if (!data.status) {
                toast.error(data.msg, toastOptions);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                toast.success("Email verified successfully!", toastOptions);
                localStorage.setItem(
                    process.env.REACT_APP_LOCALHOST_KEY,
                    JSON.stringify(data.user)
                );
                setTimeout(() => navigate("/"), 1000);
            }
        } catch (error) {
            toast.error("Verification failed. Please try again.", toastOptions);
        }
        setLoading(false);
    };

    // Resend OTP
    const handleResend = async () => {
        if (resendTimer > 0) return;
        
        try {
            const { data } = await axios.post(resendOTPRoute, { userId });
            
            if (data.status) {
                toast.success("New OTP sent to your email!", toastOptions);
                setResendTimer(60);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(data.msg, toastOptions);
            }
        } catch (error) {
            toast.error("Failed to resend OTP. Please try again.", toastOptions);
        }
    };

    return (
        <>
            <div className="otp-wrapper form-container">
                <form className="form otp-form" onSubmit={handleVerify}>
                    <div className="brand-logo">
                        <span className="logo-icon">✉️</span>
                        <span className="logo-text">Verify Email</span>
                    </div>
                    <span className="title">Enter OTP</span>
                    <p className="subtitle">
                        We've sent a verification code to<br />
                        <strong>{email}</strong>
                    </p>

                    {/* OTP Input Fields */}
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="otp-input"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Timer Info */}
                    <p className="timer-info">
                        OTP expires in <strong>10 minutes</strong>
                    </p>

                    {/* Verify Button */}
                    <div>
                        <button 
                            type="submit" 
                            className="input-field button"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </div>

                    {/* Resend OTP */}
                    <div className="resend-section">
                        <span className="text">
                            Didn't receive the code?{" "}
                            <button
                                type="button"
                                className={`resend-link ${resendTimer > 0 ? "disabled" : ""}`}
                                onClick={handleResend}
                                disabled={resendTimer > 0}
                            >
                                {resendTimer > 0 
                                    ? `Resend in ${resendTimer}s` 
                                    : "Resend OTP"}
                            </button>
                        </span>
                    </div>

                    {/* Back Button */}
                    <div className="login-signup">
                        <span className="text">
                            <button
                                type="button"
                                className="login-link"
                                onClick={onBack}
                            >
                                ← Back to Registration
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}

export default OTPVerification;
