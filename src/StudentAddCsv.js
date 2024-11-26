import {
    Alert,
    Box,
    Button,
    Snackbar,
    Typography,
  } from "@mui/material";
  import Grid from '@mui/material/Grid2';
  import React, { useState } from "react";
  import Papa from "papaparse";
  import firebase from "firebase/compat/app";
  import "firebase/firestore";
  import { firestore } from "./firebase"; // Replace with your Firebase configuration
  import { saveAs } from "file-saver";
  
  const StudentUpload = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
  
    // Handles file selection
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const skippedStudentsData = [];// to store the skipped student data
    // Processes the uploaded file
    const handleUpload = async () => {
      if (!file) {
        setError("Please select a file to upload.");
        setOpenSnackbar(true);
        return;
      }
    
      // Parse the CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          const students = result.data;          
          const batch = firestore.batch(); // Firestore batch operation
          const existingUsns = new Set(); // Track existing USNs          
          let skippedStudents = 0;
          console.log("USN",existingUsns);
    
          try {            
            const studentsSnapshot = await firestore.collection("students").get();
            studentsSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.usn) existingUsns.add(data.usn);
            });
    
            console.log("Existing data in Firestore:", {
              usns: Array.from(existingUsns),
            });
    
            // Step 2: Process each students in the CSV
            for (const [index, student] of students.entries()) {
              console.log(`Processing student #${index + 1}:`, student);
    
              // Validate required fields
              if (!student.usn || !student.name || !student.email || !student.password || !student.branch || !student.department || !student.batch ) {
                console.warn(
                  `Skipping student #${index + 1}: Missing required fields.`
                );

                skippedStudents++;
                skippedStudentsData.push(student);
                continue;
              }
    
              // Check for duplicate student.usn
              if (existingUsns.has(student.usn.trim())) {
                console.warn(
                  `Skipping duplicate USN (${student.usn}) for student #${index + 1}`
                );
                skippedStudents++;
                continue;
              }
    
              // Prepare Firestore document for the students
              const studentRef = firestore.collection("students").doc();             
    
              const studentData = {
                name: student.name.trim(),
                email: student.email.trim(),
                password: student.password.trim(),
                usn: student.usn.trim(),
                batch: student.batch.trim(),
                department: student.department.trim(),
                branch: student.branch.trim(),
                createdAt: firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.Timestamp.now(),
              };
    
              console.log(`student data prepared for Firestore:`, studentData);
              batch.set(studentRef, studentData);
              existingUsns.add(student.usn.trim()); // Add USNs to local set
            }
    
            // Step 3: Commit batch
            await batch.commit();
            setSuccessMessage(
              `studnet uploaded successfully! ${skippedStudents} duplicates skipped.`
            );
            setOpenSnackbar(true);
            if (skippedStudentsData.length > 0) {
              const csvContent = Papa.unparse(skippedStudentsData); // Convert to CSV format
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              setTimeout(() => {
                // saveAs(blob, "skipped_students.csv"); // Download the file
              }, 3000);
            }
          } catch (err) {
            console.error("Error during upload:", err.message);
            setError(`Error uploading students: ${err.message}`);
            setOpenSnackbar(true);
          }
        },
        error: (err) => {
          console.error("Error parsing CSV file:", err.message);
          setError(`CSV parsing error: ${err.message}`);
          setOpenSnackbar(true);
        },
      });
    };
    
    // Handles Snackbar close
    const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
      setError("");
      setSuccessMessage("");
    };
  
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Upload Books via CSV
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
  
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ marginBottom: 16 }}
            />
          </Grid>
  
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              fullWidth
            >
              Upload Books
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  export default StudentUpload;