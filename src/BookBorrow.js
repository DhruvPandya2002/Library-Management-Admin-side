import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { firestore, Timestamp } from "./firebase";

const BookBorrow = () => {
  const [bookBorrow, SetbookBorrow] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredBooksBorrow, setFilteredBooksBorrow] = useState([]);
  const [page, setPage] = useState(0); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const [selectedImage, setSelectedImage] = useState(""); // State to store the selected image

  useEffect(() => {
    // Fetch bookBorrow from Firestore
    const fetchBooks = async () => {
      try {
        const snapshot = await firestore.collection("book-borrow").get();
        const booksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        SetbookBorrow(booksData);
        setFilteredBooksBorrow(booksData);
      } catch (error) {
        console.error("Error fetching bookBorrow:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Filter bookBorrow based on search input
    const searchTerm = searchInput.toLowerCase();
    const results = bookBorrow.filter((book) =>
      book.bookTitle.toLowerCase().includes(searchTerm)
    );
    setFilteredBooksBorrow(results);
  }, [searchInput, bookBorrow]);

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

  // Function to parse and format the custom date string
  const parseDate = (dateString) => {
    if (typeof dateString !== "string") { 
      return new Date();
    }
    // Match the date format "December 13, 2024 at 10:40:46 PM UTC+5:30"
    const dateRegex =
      /(\w+\s\d{1,2},\s\d{4})\sat\s([\d:]+)\s([APM]+)\sUTC([+-]\d{1,2}:\d{2})/;
    const match = dateString.match(dateRegex);
    if (match) {
      const [_, date, time, period, timezone] = match;
      const formattedDate = `${date} ${time} ${period} ${timezone}`;
      return new Date(formattedDate);
    }
    // If no match, return current date
    return new Date();
  };

  // const formatDate = (timestamp) => {
  //   const date = parseDate(timestamp);
  //   return date.toLocaleString("en-IN", {
  //     weekday: "long",
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //     second: "numeric",
  //     timeZoneName: "short",
  //   });
  // };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date =
      timestamp instanceof Timestamp
        ? timestamp.toDate()
        : new Date(timestamp); // Handle both Timestamp and Date strings
    return date.toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });
  };

  const handleOpenDialog = (image) => {
    setSelectedImage(image);
    setOpenDialog(true); // Open the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
    setSelectedImage(""); // Clear the selected image
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book Borrowed
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
      </Box>
      <TableContainer sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Title</TableCell>
              <TableCell align="left">Branch</TableCell>
              <TableCell align="left">Department</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">BorrowDate</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">ReturnDate</TableCell>
              <TableCell align="left">User Status</TableCell>
              <TableCell align="left">USN</TableCell>
              <TableCell align="left">Photo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBooksBorrow
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((book) => {
                return (
                  <TableRow key={book.id}>
                    <TableCell align="left">{book.bookTitle}</TableCell>
                    <TableCell align="left">{book.branch}</TableCell>
                    <TableCell align="left">{book.department}</TableCell>
                    <TableCell align="left">{book.email}</TableCell>
                    <TableCell align="left">{formatDate(book.borrowDate)}</TableCell>
                    <TableCell align="left">{book.name}</TableCell>
                    <TableCell align="left">{formatDate(book.returnDate)}</TableCell>
                    <TableCell align="left">{book.userStatus}</TableCell>
                    <TableCell align="left">{book.usn}</TableCell>
                    <TableCell align="left">                     
                      {book.photo ? (
                    <Button
                      variant="contained"
                      onClick={() => handleOpenDialog(book.photo)}                      
                    >
                      View
                    </Button>
                  ) : (
                    "No Photo"
                  )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredBooksBorrow.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20]}
        sx={{ marginTop: 2 }}
      />

       {/* Dialog for showing the image */}
       <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Return Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <img
              src={selectedImage}
              alt="Return Photo"
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookBorrow;