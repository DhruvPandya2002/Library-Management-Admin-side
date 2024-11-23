import {
  Alert,
  Box,
  Button,
  // FormControl,
  // InputLabel,
  // MenuItem,
  // Select,
  Snackbar,
  TextField,
  Typography,
  // Autocomplete,
  // Dialog,
  // DialogActions,
  // DialogContent,
  // DialogTitle,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // for redirection and params
import firebase from "firebase/compat/app";
import "firebase/firestore";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase"; // Replace with your Firebase configuration
// import Cryptr from "cryptr";

// const cryptr = new Cryptr("myTotallySecretKey");


const StudentForm = () => {
  const { id } = useParams(); // Retrieve Student ID from URL if updating
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usn, setUsn] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);


  //********************************************************* */
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (id) {
        try {
          const doc = await firestore.collection("students").doc(id).get();
          if (doc.exists) {
            const data = doc.data();
            setName(data.name || "");
            setEmail(data.email || "");
            setPassword(data.password || ""); 
            setUsn(data.usn || "");            
            setBatch(data.batch || "");
            setDepartment(data.department || "");
            setBranch(data.branch || "");
          }
        } catch (err) {
          console.error("Error fetching book details:", err);
        }
      }
    };

    fetchStudentDetails();
  }, [id]);
  //******************************************************* */

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!usn || !name || !email || !password || !branch || !department || !batch) {
      setError("Please fill in all required fields.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const studentData = {
        usn,
        name,
        email,
        password,
        branch,
        department,
        batch,
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
      };

      if (id) {
        // Update book
        await firestore.collection("students").doc(id).update(studentData);
        setSuccessMessage("Student updated successfully!");
        navigate('/studentList')
      } else {
        // Add new book
        studentData.createdAt = firebase.firestore.Timestamp.now();
        await firestore.collection("students").add(studentData);
        setSuccessMessage("Student added successfully!");
        navigate('/studentList')
      }

      setOpenSnackbar(true);
      // navigate("/"); // Redirect to books list after submission
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit the form.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccessMessage("");
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 800, mx: "auto", p: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        {id ? "Edit Student" : "Add New Student"}
      </Typography>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>

      <Grid
        container
        spacing={{ xs: 1, md: 2 }}
        columns={{ xs: 1, sm: 8, md: 12 }}
      >
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Usn"
            variant="outlined"
            fullWidth
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Batch"
            variant="outlined"
            fullWidth
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Department"
            variant="outlined"
            fullWidth
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 12 }}>
          <TextField
            label="Branch"
            variant="outlined"
            fullWidth
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
          />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" color="primary" type="submit" fullWidth>
          {id ? "Update Student" : "Add Student"}
        </Button>
      </Box>
    </Box>
  );
};

export default StudentForm;
