import {
    Alert,
    Box,
    Button,
    Snackbar,
    Typography,
    Grid,
  } from "@mui/material";
  import React, { useState } from "react";
  import Papa from "papaparse";
  import firebase from "firebase/compat/app";
import "firebase/firestore";
  import { firestore } from "./firebase"; // Replace with your Firebase configuration
  
  const BookUpload = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
  
    // Handles file selection
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    // Generates unique code based on type
    const generateUniqueCode = async (type, existingCodes) => {
      const prefix = type.substring(0, 2).toUpperCase();
      let sequence = 1;
      let code;
  
      do {
        code = `${prefix}${String(sequence).padStart(3, "0")}`;
        sequence++;
      } while (existingCodes.has(code));
  
      existingCodes.add(code);
      return code;
    };
  
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
          console.log("Parsed data:", result.data); // Log parsed data for debugging
  
          const books = result.data;
          const existingCodes = new Set(); // Set to track unique codes
          const batch = firestore.batch(); // Firestore batch operation
  
          try {
            for (const [index, book] of books.entries()) {
              console.log(`Processing book #${index + 1}:`, book);
  
              // Validate required fields
              if (!book.ISBN || !book.title || !book.type) {
                throw new Error(
                  `Missing required fields (ISBN, title, type) in book #${index + 1}: ${JSON.stringify(
                    book
                  )}`
                );
              }
  
              // Prepare Firestore document
              const bookRef = firestore.collection("books").doc();
              const code = await generateUniqueCode(book.type, existingCodes);
  
              const bookData = {
                ISBN: book.ISBN.trim(),
                publisher: book.publisher?.trim() || "",
                url: book.url?.trim() || "",
                title: book.title.trim(),
                categories: book.categories
                  ?.split(",")
                  .map((cat) => cat.trim())
                  .filter(Boolean), // Split and trim categories
                tags: book.tags
                  ?.split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean), // Split and trim tags
                author: book.author?.trim() || "",
                type: book.type.trim(),
                code,
                createdAt: firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.Timestamp.now(),
              };
  
              console.log(`Book data prepared for Firestore:`, bookData);
              batch.set(bookRef, bookData);
            }
  
            // Commit batch
            await batch.commit();
            setSuccessMessage("Books uploaded successfully!");
            setOpenSnackbar(true);
          } catch (err) {
            console.error("Error during upload:", err.message);
            setError(`Error uploading books: ${err.message}`);
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
  
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
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
  
  export default BookUpload;