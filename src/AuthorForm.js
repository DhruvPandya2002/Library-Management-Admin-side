import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { firestore } from "./firebase";
import { useLocation, useNavigate } from "react-router-dom";

const AuthorForm = () => {
  const [name, setName] = useState("");
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(0); // Current page number
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.name) {
      setName(location.state.name);
    }
  }, [location.state]);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const snapshot = await firestore.collection("authors").get();
      const authorList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAuthors(authorList);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name) {
        setError("Please fill in all fields.");
        return;
      }

      const authorData = { name };

      if (editingAuthorId) {
        await firestore
          .collection("authors")
          .doc(editingAuthorId)
          .update(authorData);
        setSnackbarMessage("Author updated successfully.");
      } else {
        await firestore.collection("authors").add(authorData);
        setSnackbarMessage("Author added successfully.");
      }

      setSnackbarOpen(true);
      resetForm();
      fetchAuthors();
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
  };

  const resetForm = () => {
    setName("");
    setEditingAuthorId(null);
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAuthors = authors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

      <TableContainer component={Paper} sx={{ border: "1px solid #ddd", borderRadius: "8px" , mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAuthors.map((author) => (
              <TableRow key={author.id}>
                <TableCell>{author.name}</TableCell>            
                <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditAuthor(author)}
                      sx={{ marginRight: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteAuthor(author.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>      
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={authors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

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
