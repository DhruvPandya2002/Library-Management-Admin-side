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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // for redirection and params
import firebase from "firebase/compat/app";
import "firebase/firestore";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase"; // Replace with your Firebase configuration

const BookForm = () => {
  const { id } = useParams(); // Retrieve book ID from URL if updating
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [tags, setTags] = useState("");
  const [order, setOrder] = useState("");
  const [content, setContent] = useState("");
  const [code, setCode] = useState("");
  const [isbnCode, setIsbnCode] = useState("");
  const [newFlag, setNewFlag] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [authorOptions, setAuthorOptions] = useState([]);
  const [publisherOptions, setPublisherOptions] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch options and book details on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const authorsSnapshot = await firestore.collection("authors").get();
        const publishersSnapshot = await firestore.collection("publishers").get();
        const categoriesSnapshot = await firestore.collection("categories").get();
        const typesSnapshot = await firestore.collection("types").get();

        setAuthorOptions(authorsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setPublisherOptions(publishersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setCategoryList(categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setTypeList(typesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
            setTitle(data.title || "");
            setAuthor(data.author || "");
            setUrl(data.url || "");
            setPublisher(data.publisher || "");
            setTags(data.tags?.join(", ") || "");
            setOrder(data.order || "");
            setContent(data.content || "");
            setCode(data.code || "");
            setIsbnCode(data.isbnCode || "");
            setNewFlag(data.newFlag || false);
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

    // Basic validation
    if (!title || !selectedCategory) {
      setError("Please fill in all required fields.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const tagsArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      const bookData = {
        title,
        author,
        url,
        publisher,
        tags: tagsArray,
        code,
        isbnCode,
        category: selectedCategory,
        type: selectedType,
        updatedAt: firebase.firestore.Timestamp.now(),
      };

      if (id) {
        // Update book
        await firestore.collection("books").doc(id).update(bookData);
        setSuccessMessage("Book updated successfully!");
      } else {
        // Add new book
        bookData.createdAt = firebase.firestore.Timestamp.now();
        await firestore.collection("books").add(bookData);
        setSuccessMessage("Book added successfully!");
      }

      setOpenSnackbar(true);
      navigate("/books"); // Redirect to books list after submission
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

      <Grid
        container
        spacing={{ xs: 1, md: 2 }}
        columns={{ xs: 1, sm: 8, md: 12 }}
      >
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>Select a Category</em>
              </MenuItem>
              {categoryList.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <Autocomplete
            freeSolo
            options={authorOptions.map((option) => option.name)}
            value={author}
            onInputChange={(e, value) => setAuthor(value)}
            renderInput={(params) => <TextField {...params} label="Author" variant="outlined" />}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <Autocomplete
            freeSolo
            options={publisherOptions.map((option) => option.name)}
            value={publisher}
            onInputChange={(e, value) => setPublisher(value)}
            renderInput={(params) => <TextField {...params} label="Publisher" variant="outlined" />}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Tags (comma-separated)"
            variant="outlined"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Code"
            variant="outlined"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="ISBN Code"
            variant="outlined"
            fullWidth
            value={isbnCode}
            onChange={(e) => setIsbnCode(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Type"
            >
              <MenuItem value="">
                <em>Select a Type</em>
              </MenuItem>
              {typeList.map((type) => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Image Url"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Grid>
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
