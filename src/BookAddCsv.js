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
          const books = result.data;
          const existingCodes = new Set(); // Set to track unique codes
          const batch = firestore.batch(); // Firestore batch operation
          const existingISBNs = new Set(); // Track existing ISBNs
          const existingCategories = new Set(); // Track existing categories
          const existingAuthors = new Set(); // Track existing authors
          const existingTypes = new Set(); // Track existing types
          let skippedBooks = 0;
    
          try {
            // Step 1: Fetch existing data from Firestore
            const categoriesSnapshot = await firestore.collection("categories").get();
            categoriesSnapshot.forEach((doc) =>
              existingCategories.add(doc.id) // Assuming categories are stored by ID
            );
    
            const authorsSnapshot = await firestore.collection("authors").get();
            authorsSnapshot.forEach((doc) => existingAuthors.add(doc.id));
    
            const typesSnapshot = await firestore.collection("types").get();
            typesSnapshot.forEach((doc) => existingTypes.add(doc.id));
    
            const booksSnapshot = await firestore.collection("books").get();
            booksSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.ISBN) existingISBNs.add(data.ISBN);
            });
    
            console.log("Existing data in Firestore:", {
              categories: Array.from(existingCategories),
              authors: Array.from(existingAuthors),
              types: Array.from(existingTypes),
              ISBNs: Array.from(existingISBNs),
            });
    
            // Step 2: Process each book in the CSV
            for (const [index, book] of books.entries()) {
              console.log(`Processing book #${index + 1}:`, book);
    
              // Validate required fields
              if (!book.ISBN || !book.title || !book.type) {
                console.warn(
                  `Skipping book #${index + 1}: Missing required fields.`
                );
                skippedBooks++;
                continue;
              }
    
              // Check for duplicate ISBN
              if (existingISBNs.has(book.ISBN.trim())) {
                console.warn(
                  `Skipping duplicate ISBN (${book.ISBN}) for book #${index + 1}`
                );
                skippedBooks++;
                continue;
              }
    
              // Check and add new categories
              if (book.categories) {
                const categories = book.categories
                  .split(",")
                  .map((category) => category.trim());
                for (const category of categories) {
                  if (!existingCategories.has(category)) {
                    const categoryRef = firestore
                      .collection("categories")
                      .doc(category);
                    batch.set(categoryRef, { name: category });
                    existingCategories.add(category);
                  }
                }
              }
    
              // Check and add new author
              if (book.author && !existingAuthors.has(book.author.trim())) {
                const authorRef = firestore
                  .collection("authors")
                  .doc(book.author.trim());
                batch.set(authorRef, { name: book.author.trim() });
                existingAuthors.add(book.author.trim());
              }
    
              // Check and add new type
              if (!existingTypes.has(book.type.trim())) {
                const typeRef = firestore.collection("types").doc(book.type.trim());
                batch.set(typeRef, { name: book.type.trim() });
                existingTypes.add(book.type.trim());
              }
    
              // Prepare Firestore document for the book
              const bookRef = firestore.collection("books").doc();
              const code = await generateUniqueCode(
                book.type.trim(),
                existingCodes
              );
    
              const bookData = {
                ISBN: book.ISBN.trim(),
                publisher: book.publisher?.trim() || "",
                url: book.url?.trim() || "",
                title: book.title.trim(),
                categories: book.categories, // Keep categories as raw string
                tags: book.tags
                  ?.split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean), // Split and trim tags
                author: book.author?.trim() || "",
                type: book.type.trim(),
                code,
                createdAt: firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.Timestamp.now(),
                bookavailable: book.bookavailable 
              };
    
              console.log(`Book data prepared for Firestore:`, bookData);
              batch.set(bookRef, bookData);
              existingISBNs.add(book.ISBN.trim()); // Add ISBN to local set
            }
    
            // Step 3: Commit batch
            await batch.commit();
            setSuccessMessage(
              `Books uploaded successfully! ${skippedBooks} duplicates skipped.`
            );
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
  
  export default BookUpload;
  