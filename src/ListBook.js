import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Modal,
  Select,
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

  const handleEditBook = (id) => {
    navigate(`/edit-book/${id}`); // Redirect to edit book page with book ID
  };

  const handleDeleteBook = async (id) => {
    try {
      await firestore.collection("books").doc(id).delete();
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddNewBook}
        >
          Add New Book
        </Button>
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
                      onClick={() => handleDeleteBook(book.id)}
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
    </Container>
  );
};

export default BookList;
