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

const PublisherForm = () => {
  const [name, setName] = useState("");
  const [numbering, setNumber] = useState(""); // State for Publisher number
  const [publisher, setpublisher] = useState([]);
  const [error, setError] = useState(null);
  const [editingPublisherId, setEditingPublisherId] = useState(null); // State for tracking the Publisher being edited
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Prefill the Publisher name if passed through state (from previous form)
    if (location.state && location.state.name) {
      setName(location.state.name);
    }
  }, [location.state]);

  useEffect(() => {
    fetchpublisher();
  }, []);

  const fetchpublisher = async () => {
    try {
      const snapshot = await firestore.collection("publisher").orderBy("numbering").get();
      const PublisherList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setpublisher(PublisherList);
    } catch (error) {
      console.error("Error fetching publisher:", error);
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

      const PublisherData = {
        name,
        numbering, // Save Publisher number
      };

      if (editingPublisherId) {
        // If editing, update the Publisher
        await firestore.collection("publisher").doc(editingPublisherId).update(PublisherData);
        setSnackbarMessage("Publisher updated successfully.");
      } else {
        // If not editing, add a new Publisher
        await firestore.collection("publisher").add(PublisherData);
        setSnackbarMessage("Publisher added successfully.");
      }

      setSnackbarOpen(true);
      resetForm();
      fetchpublisher();
      setTimeout(() => {
        navigate(-1); // Go back to the previous page
      }, 2000);
    } catch (error) {
      console.error("Error adding/updating Publisher:", error);
    }
  };

  const handleDeletePublisher = (PublisherId) => {
    setConfirmDeleteId(PublisherId);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection("publisher").doc(confirmDeleteId).delete();
      setSnackbarMessage("Publisher deleted successfully.");
      setSnackbarOpen(true);
      setConfirmDeleteId(null);
      fetchpublisher();
    } catch (error) {
      console.error("Error deleting Publisher:", error);
    }
  };

  const handleEditPublisher = (Publisher) => {
    setEditingPublisherId(Publisher.id);
    setName(Publisher.name);
    setNumber(Publisher.numbering); // Set number for editing
  };

  const resetForm = () => {
    setName("");
    setNumber(""); // Reset the form inputs
    setEditingPublisherId(null); // Reset editing state
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editingPublisherId ? "Edit Publisher" : "Add Publisher"}
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
          {editingPublisherId ? "Update Publisher" : "Submit"}
        </Button>
        {editingPublisherId && (
          <Button onClick={resetForm} color="secondary" sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      <List>
        {publisher.map((Publisher) => (
          <ListItem key={Publisher.id}>
            <ListItemText
              primary={`#${Publisher.numbering} - ${Publisher.name}`} // Display Publisher number and name
            />
            <ListItemSecondaryAction>
              <IconButton onClick={() => handleEditPublisher(Publisher)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeletePublisher(Publisher.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this Publisher?</Typography>
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

export default PublisherForm;
