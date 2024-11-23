import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { firestore } from "./firebase";

const CollectionForm = ({ collectionName }) => {
  const [name, setName] = useState("");
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore.collection(collectionName).get();
      const collectionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionList);
      setError(""); // Clear any previous errors
    } catch (error) {
      setError("Error fetching collections. Please try again.");
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Please fill in all fields.");
      return;
    }

    const collectionData = {
      name
    };

    setLoading(true);
    try {
      if (editingId) {
        await firestore.collection(collectionName).doc(editingId).update(collectionData);
        setSnackbarMessage("Collection updated successfully.");
      } else {
        await firestore.collection(collectionName).add(collectionData);
        setSnackbarMessage("Collection added successfully.");
      }

      resetForm();
      fetchCollections();
    } catch (error) {
      setError("Error adding/updating collection. Please try again.");
      console.error("Error adding/updating collection:", error);
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleEditCollection = (collection) => {
    setEditingId(collection.id);
    setName(collection.name);
    setError(""); // Clear error when editing
  };

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      setLoading(true);
      try {
        await firestore.collection(collectionName).doc(collectionId).delete();
        setSnackbarMessage("Collection deleted successfully.");
        fetchCollections();
      } catch (error) {
        setError("Error deleting collection. Please try again.");
        console.error("Error deleting collection:", error);
      } finally {
        setLoading(false);
        setSnackbarOpen(true);
      }
    }
  };

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setError("");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Drag-and-drop functionality
  const handleLongPressStart = (index) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleMouseDown = (index) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.getAttribute("data-index") !== null) {
      const dropIndex = parseInt(target.getAttribute("data-index"), 10);
      if (dropIndex !== draggedIndex) {
        handleDrop(dropIndex);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.getAttribute("data-index") !== null) {
      const dropIndex = parseInt(target.getAttribute("data-index"), 10);
      if (dropIndex !== draggedIndex) {
        handleDrop(dropIndex);
      }
    }
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return; // No valid drop
    const newCollections = [...collections];
    const [movedItem] = newCollections.splice(draggedIndex, 1);
    newCollections.splice(index, 0, movedItem);

    const updatedCollections = newCollections.map((item, idx) => ({
      ...item,
    }));

    setCollections(updatedCollections);
    setIsDragging(false); // Reset dragging state
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editingId ? `Edit ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}` : `Create New ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
        />

        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? "Loading..." : editingId ? "Update Collection" : "Submit"}
        </Button>
        {editingId && (
          <Button variant="outlined" color="secondary" onClick={resetForm} sx={{ ml: 2 }}>
            Cancel Edit it
          </Button>
        )}
      </form>

      <Typography variant="h6" sx={{ mt: 4 }}>
        {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}:
      </Typography>
      <List>
  {collections.map((collection, index) => (
    <React.Fragment key={collection.id}>
      <ListItem
        onMouseDown={() => handleMouseDown(index)}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        data-index={index}
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          backgroundColor: "inherit",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none", // Prevent text selection
    WebkitUserSelect: "none", // For Safari
    MozUserSelect: "none",
        }}
      >
        <IconButton edge="start" sx={{ color: "gray" }}>
          <DragIndicatorIcon />
        </IconButton>
        <ListItemText
          primary={`${collection.name}`}
          sx={{userSelect: "none", // Prevent text selection
            WebkitUserSelect: "none", // For Safari
            MozUserSelect: "none",}} // Apply the unselectable style here
        />
        <Box sx={{ ml: "auto" }}>
          <IconButton onClick={() => handleEditCollection(collection)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteCollection(collection.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </ListItem>
      <Divider />
    </React.Fragment>
  ))}
</List>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};


export default CollectionForm;
