import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse"; // Install using `npm install papaparse`

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
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
    navigate("/add-book");
  };

  const handleEditBook = (id) => {
    navigate(`/edit-book/${id}`);
  };

  const handleDeleteBook = async (id) => {
    try {
      await firestore.collection("books").doc(id).delete();
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true, // Assumes the first row contains column names
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const data = results.data;

            // Add each book to Firestore
            const batch = firestore.batch(); // Use batch for efficiency
            data.forEach((book) => {
              const docRef = firestore.collection("books").doc(); // Auto-generate an ID
              batch.set(docRef, {
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                tags: book.tags?.split(",").map((tag) => tag.trim()) || [],
                isbnCode: book.isbnCode,
                code: book.code,
                type: book.type,
                category: book.category,
                imageUrl: book.imageUrl,
                brand: book.brand,
                isbn10: book.isbn10,
                sellerName: book.sellerName,
                createdAt: new Date(),
              });
            });

            await batch.commit();
            alert("Books added successfully!");
            setBooks((prevBooks) => [...prevBooks, ...data]);
          } catch (error) {
            console.error("Error uploading CSV data:", error);
            alert("Failed to upload CSV data.");
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV file.");
        },
      });
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
            sx={{ marginRight: 2 }}
          >
            Add New Book
          </Button>
          <Button
            variant="contained"
            color="secondary"
            component="label"
          >
            Upload CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleCSVUpload}
            />
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
