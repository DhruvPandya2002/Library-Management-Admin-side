import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import { useLocation, useNavigate } from "react-router-dom";

const AuthorForm = () => {
  const [name, setName] = useState("");
  const [numbering, setNumber] = useState(""); // State for author number
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);
  const [editingAuthorId, setEditingAuthorId] = useState(null); // State for tracking the author being edited
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Prefill the author name if passed through state (from previous form)
    if (location.state && location.state.name) {
      setName(location.state.name);
    }
  }, [location.state]);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const snapshot = await firestore.collection("authors").orderBy("numbering").get();
      const authorList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAuthors(authorList);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  // Consolidated submit function to handle both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !numbering) {
        setError("Please fill in all fields.");
        return;
      }

      const authorData = {
        name,
        numbering, // Save author number
      };

      if (editingAuthorId) {
        // If editing, update the author
        await firestore.collection("authors").doc(editingAuthorId).update(authorData);
        setSnackbarMessage("Author updated successfully.");
      } else {
        // If not editing, add a new author
        await firestore.collection("authors").add(authorData);
        setSnackbarMessage("Author added successfully.");
      }

      setSnackbarOpen(true);
      resetForm();
      fetchAuthors();
      setTimeout(() => {
        navigate(-1); // Go back to the previous page
      }, 2000);
    } catch (error) {
      console.error("Error adding/updating author:", error);
    }
  };

  const handleDeleteAuthor = (authorId) => {
    setConfirmDeleteId(authorId);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection("authors").doc(confirmDeleteId).delete();
      setSnackbarMessage("Author deleted successfully.");
      setSnackbarOpen(true);
      setConfirmDeleteId(null);
      fetchAuthors();
    } catch (error) {
      console.error("Error deleting author:", error);
    }
  };

  const handleEditAuthor = (author) => {
    setEditingAuthorId(author.id);
    setName(author.name);
    setNumber(author.numbering); // Set number for editing
  };

  const resetForm = () => {
    setName("");
    setNumber(""); // Reset the form inputs
    setEditingAuthorId(null); // Reset editing state
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editingAuthorId ? "Edit Author" : "Add Author"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Number"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={numbering}
          onChange={(e) => setNumber(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="primary" type="submit">
          {editingAuthorId ? "Update Author" : "Submit"}
        </Button>
        {editingAuthorId && (
          <Button onClick={resetForm} color="secondary" sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      <List>
        {authors.map((author) => (
          <ListItem key={author.id}>
            <ListItemText
              primary={`#${author.numbering} - ${author.name}`} // Display author number and name
            />
            <ListItemSecondaryAction>
              <IconButton onClick={() => handleEditAuthor(author)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteAuthor(author.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this author?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDelete} color="primary">
            Confirm
          </Button>
          <Button onClick={() => setConfirmDeleteId(null)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default AuthorForm;
