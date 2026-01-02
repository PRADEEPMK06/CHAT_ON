import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

const useInactivityLogout = (isAuthenticated = true) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);
    const warningTimeoutRef = useRef(null);

    const logout = useCallback(() => {
        localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
        navigate('/auth');
        // Show alert after navigation
        setTimeout(() => {
            alert('You have been logged out due to 10 minutes of inactivity for security purposes.');
        }, 100);
    }, [navigate]);

    const resetTimer = useCallback(() => {
        // Clear existing timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        if (!isAuthenticated) return;

        // Set warning timeout at 9 minutes (1 minute before logout)
        warningTimeoutRef.current = setTimeout(() => {
            console.warn('You will be logged out in 1 minute due to inactivity');
        }, INACTIVITY_TIMEOUT - 60000);

        // Set logout timeout at 10 minutes
        timeoutRef.current = setTimeout(() => {
            logout();
        }, INACTIVITY_TIMEOUT);
    }, [isAuthenticated, logout]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Events to track user activity
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'keypress'
        ];

        // Add event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Also listen to visibility change (user switching tabs)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                resetTimer();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initialize the timer
        resetTimer();

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        };
    }, [isAuthenticated, resetTimer]);

    return { resetTimer };
};

export default useInactivityLogout;
