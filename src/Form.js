import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  Autocomplete,
  Grid,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { firestore } from "./firebase"; // Replace with your Firebase configuration

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for new fields
  const [isbn10, setIsbn10] = useState("");
  const [brand, setBrand] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");

  // State for existing fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [code, setCode] = useState("");
  const [isbnCode, setIsbnCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [authorOptions, setAuthorOptions] = useState([]);
  const [publisherOptions, setPublisherOptions] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch options and book details
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const authorsSnapshot = await firestore.collection("authors").get();
        const publishersSnapshot = await firestore.collection("publishers").get();
        const categoriesSnapshot = await firestore.collection("categories").get();
        const typesSnapshot = await firestore.collection("types").get();

        setAuthorOptions(authorsSnapshot.docs.map((doc) => doc.data()));
        setPublisherOptions(publishersSnapshot.docs.map((doc) => doc.data()));
        setCategoryList(categoriesSnapshot.docs.map((doc) => doc.data()));
        setTypeList(typesSnapshot.docs.map((doc) => doc.data()));
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    };

    const fetchBookDetails = async () => {
      if (id) {
        try {
          const doc = await firestore.collection("books").doc(id).get();
          if (doc.exists) {
            const data = doc.data();
            setIsbn10(data.isbn10 || "");
            setBrand(data.brand || "");
            setImageUrl(data.image_url || "");
            setSellerName(data.seller_name || "");
            setCategories(data.categories?.join(", ") || "");
            setTags(data.tags?.join(", ") || "");
            setTitle(data.title || "");
            setAuthor(data.author || "");
            setUrl(data.url || "");
            setPublisher(data.publisher || "");
            setCode(data.code || "");
            setIsbnCode(data.isbnCode || "");
            setSelectedCategory(data.category || "");
            setSelectedType(data.type || "");
          }
        } catch (err) {
          console.error("Error fetching book details:", err);
        }
      }
    };

    fetchOptions();
    fetchBookDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !selectedCategory) {
      setError("Please fill in all required fields.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const bookData = {
        isbn10,
        brand,
        image_url: imageUrl,
        seller_name: sellerName,
        categories: categories.split(",").map((category) => category.trim()),
        tags: tags.split(",").map((tag) => tag.trim()),
        title,
        author,
        url,
        publisher,
        code,
        isbnCode,
        category: selectedCategory,
        type: selectedType,
        updatedAt: firebase.firestore.Timestamp.now(),
      };

      if (id) {
        await firestore.collection("books").doc(id).update(bookData);
        setSuccessMessage("Book updated successfully!");
      } else {
        bookData.createdAt = firebase.firestore.Timestamp.now();
        await firestore.collection("books").add(bookData);
        setSuccessMessage("Book added successfully!");
      }

      setOpenSnackbar(true);
      navigate("/books");
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
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {id ? "Edit Book" : "Add New Book"}
      </Typography>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error || successMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={2}>
        {/* New Fields */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="ISBN10"
            variant="outlined"
            fullWidth
            value={isbn10}
            onChange={(e) => setIsbn10(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Brand"
            variant="outlined"
            fullWidth
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Image URL"
            variant="outlined"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Seller Name"
            variant="outlined"
            fullWidth
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Categories (comma-separated)"
            variant="outlined"
            fullWidth
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tags (comma-separated)"
            variant="outlined"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Grid>

        {/* Existing Fields */}
        {/* Title */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Grid>
        {/* Author */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            freeSolo
            options={authorOptions.map((option) => option.name)}
            value={author}
            onInputChange={(e, value) => setAuthor(value)}
            renderInput={(params) => <TextField {...params} label="Author" variant="outlined" />}
          />
        </Grid>
        {/* Rest */}
        {/* Add existing fields similarly */}
      </Grid>

      <Box mt={3}>
        <Button variant="contained" color="primary" type="submit" fullWidth>
          {id ? "Update Book" : "Add Book"}
        </Button>
      </Box>
    </Box>
  );
};

export default BookForm;
