import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  useTheme, // Import useTheme
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "./firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme(); // Access the theme

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate("/"); // Redirect to home page after login
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "83.5vh",
        backgroundColor: theme.palette.background.default, // Use theme background color
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Login
          </Typography>

          {/* Display error message if exists */}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mt: 3 }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 3 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>

          {/* Optionally, you can add a link to "forgot password" or "sign up" */}
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Forgot your password? <a href="/reset-password">Reset it here</a>
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Login  Credentials test-user@demo.com and Password= test123@
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
