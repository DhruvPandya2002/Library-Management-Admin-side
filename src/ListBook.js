import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import { useNavigate } from "react-router-dom";

const BookList = () => {
  const theme = useTheme();
  const [books, setBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [page, setPage] = useState(0); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [selectedBookId, setSelectedBookId] = useState(null); // ID of book to delete
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch books from Firestore
    const fetchBooks = async () => {
      try {
        const snapshot = await firestore.collection("books").get();
        const booksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Filter books based on search input
    const searchTerm = searchInput.toLowerCase();
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        (book.tags && book.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    );
    setFilteredBooks(results);
  }, [searchInput, books]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddNewBook = () => {
    navigate("/add-book"); // Redirect to add book page
  };

  const handleUploadBooks = () => {
    navigate("/add-book-csv"); // Redirect to CSV book upload page
  };

  const handleEditBook = (id) => {
    navigate(`/edit-book/${id}`); // Redirect to edit book page with book ID
  };

  const handleDeleteDialogOpen = (id) => {
    setSelectedBookId(id); // Set the selected book ID
    setOpenDialog(true); // Open confirmation dialog
  };

  const handleDeleteDialogClose = () => {
    setOpenDialog(false); // Close confirmation dialog
    setSelectedBookId(null); // Reset selected book ID
  };

  const handleDeleteBook = async () => {
    if (!selectedBookId) return;

    try {
      await firestore.collection("books").doc(selectedBookId).delete();
      setBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== selectedBookId)
      );
      setFilteredBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== selectedBookId)
      );
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      handleDeleteDialogClose();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book List
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <TextField
          label="Search"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchChange}
          fullWidth
          sx={{ maxWidth: 300 }}
        />
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNewBook}
            sx={{ marginRight: 1 }}
          >
            Add New Book
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleUploadBooks}>
            Upload via CSV
          </Button>
        </Box>
      </Box>
      <TableContainer sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Title</TableCell>
              <TableCell align="left">Author</TableCell>
              <TableCell align="left">Tags</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBooks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((book) => (
                <TableRow key={book.id}>
                  <TableCell align="left">{book.title}</TableCell>
                  <TableCell align="left">{book.author}</TableCell>
                  <TableCell align="left">
                    {book.tags ? book.tags.join(", ") : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditBook(book.id)}
                      sx={{ marginRight: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteDialogOpen(book.id)}
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
        component="div"
        count={filteredBooks.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20]}
        sx={{ marginTop: 2 }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this book? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteBook} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookList;
