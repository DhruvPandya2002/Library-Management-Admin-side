import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Snackbar, Alert, Grid, Typography, Pagination, Stack } from "@mui/material";
import { firestore } from "./firebase"; // Firebase connection
import Papa from "papaparse"; // CSV parsing library
import { useNavigate } from "react-router-dom";

const StudentLoginForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const navigate = useNavigate();

  // Handle manual submission of student login details
  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill all the fields.");
      setOpenSnackbar(true);
      return;
    }

    try {
      // Store student details in Firestore
      await firestore.collection("students").add({
        name,
        email,
        password, // You should hash the password in real scenarios
      });

      setSuccessMessage("Student added successfully!");
      setOpenSnackbar(true);

      // Clear the form
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student.");
      setOpenSnackbar(true);
    }
  };

  // Handle CSV file upload and student registration
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setFile(file);
      parseCSV(file);
    } else {
      setError("Please upload a valid CSV file.");
      setOpenSnackbar(true);
    }
  };

  // Parse CSV and add students to Firestore
  const parseCSV = (file) => {
    Papa.parse(file, {
      complete: async (result) => {
        const studentsData = result.data.slice(1); // Skip header
        const students = studentsData.map((row) => ({
          name: row[0],
          email: row[1],
          password: row[2], // Ensure passwords are hashed in production
        }));

        try {
          // Add students to Firestore
          const studentPromises = students.map((student) =>
            firestore.collection("students").add(student)
          );
          await Promise.all(studentPromises);

          setStudentsList(students);
          setSuccessMessage("Students added successfully!");
          setOpenSnackbar(true);

          // Update displayed students after adding
          updateDisplayedStudents(students);
        } catch (err) {
          console.error("Error uploading students:", err);
          setError("Failed to upload students.");
          setOpenSnackbar(true);
        }
      },
      header: false,
    });
  };

  // Update displayed students based on pagination and search filter
  const updateDisplayedStudents = (students) => {
    const filteredStudents = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setDisplayedStudents(filteredStudents.slice(startIndex, endIndex));
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    updateDisplayedStudents(studentsList); // Recalculate displayed students for new page
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    updateDisplayedStudents(studentsList); // Update displayed students based on search
  };

  // Edit student details
  const handleEditStudent = async (student) => {
    const newName = prompt("Enter new name:", student.name);
    const newEmail = prompt("Enter new email:", student.email);
    const newPassword = prompt("Enter new password:", student.password);

    if (newName && newEmail && newPassword) {
      try {
        await firestore.collection("students").doc(student.id).update({
          name: newName,
          email: newEmail,
          password: newPassword, // Ideally, hash the password
        });
        setSuccessMessage("Student updated successfully!");
        setOpenSnackbar(true);
        // Update local list after editing
        const updatedStudents = studentsList.map(s =>
          s.id === student.id ? { ...s, name: newName, email: newEmail, password: newPassword } : s
        );
        setStudentsList(updatedStudents);
        updateDisplayedStudents(updatedStudents); // Refresh displayed students
      } catch (err) {
        console.error("Error updating student:", err);
        setError("Failed to update student.");
        setOpenSnackbar(true);
      }
    }
  };

  // Fetch students from Firestore on initial load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await firestore.collection("students").get();
        const students = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudentsList(students);
        updateDisplayedStudents(students); // Initialize displayed students
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to fetch students.");
        setOpenSnackbar(true);
      }
    };
    fetchStudents();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccessMessage("");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add Student Login Details
      </Typography>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error || successMessage}
        </Alert>
      </Snackbar>

      {/* Manual Form to Add Student */}
      <form onSubmit={handleAddStudent}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Add Student
          </Button>
        </Box>
      </form>

      {/* CSV Upload Section */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Upload Students via CSV
        </Typography>

        <input type="file" accept=".csv" onChange={handleCSVUpload} />
        {file && <Typography variant="body2">Selected file: {file.name}</Typography>}
      </Box>

      {/* Search Section */}
      <Box mt={4}>
        <TextField
          label="Search by Name or Email"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>

      {/* Display List of Added Students */}
      {displayedStudents.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Added Students:</Typography>
          <ul>
            {displayedStudents.map((student, index) => (
              <li key={index}>
                {student.name} - {student.email}
                {/* <Button onClick={() => handleEditStudent(student)} color="primary" sx={{ ml: 2 }}>
                  Edit
                </Button> */}
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <Stack spacing={2} alignItems="center" mt={2}>
            <Pagination
              count={Math.ceil(studentsList.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default StudentLoginForm;
