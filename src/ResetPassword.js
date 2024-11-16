import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "./firebase"; // Adjust this import based on your project structure

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme(); 
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    setLoading(true);  // Start loading
    setError("");  // Clear previous errors
    setSuccess("");  // Clear previous success messages

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      setSuccess("A password reset email has been sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send password reset email. Please check your email address.");
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Redirect to login after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000); // Redirect after 5 seconds
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [success, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: theme.palette.background.default,  // Light background color
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Reset Password
          </Typography>

          {/* Display success message */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }} aria-live="polite">
              {success}
            </Alert>
          )}

          {/* Display error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mt: 3 }}
            disabled={loading}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePasswordReset}
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading || !isValidEmail(email)} // Disable if loading or invalid email
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Remembered your password? <a href="/login">Go back to login</a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
