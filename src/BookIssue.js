import React, { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import { firestore } from "./firebase";

const BookIssuedList = () => {
  const [bookIssues, setBookIssues] = useState([]); // State to store book issue data
  const [page, setPage] = useState(0); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page

  useEffect(() => {
    // Fetch book issue data from Firestore
    const fetchBookIssues = async () => {
      try {
        const snapshot = await firestore.collection("bookIssues").get();
        const bookIssueData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookIssues(bookIssueData);
      } catch (error) {
        console.error("Error fetching book issues:", error);
      }
    };

    fetchBookIssues();
  }, []);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Issued Books
      </Typography>

      <TableContainer sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Student_Name</TableCell>
              <TableCell align="left">Student_Email</TableCell>
              <TableCell align="left">USN</TableCell>
              <TableCell align="left">Branch</TableCell>
              <TableCell align="left">Department</TableCell>
              <TableCell align="left">Borrow_Date</TableCell>
              <TableCell align="left">Return_Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookIssues
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell align="left">{issue.bookTitle}</TableCell>
                  <TableCell align="left">{issue.studentName}</TableCell>
                  <TableCell align="left">{issue.studentId}</TableCell>
                  <TableCell align="left">{issue.issuedDate}</TableCell>
                  <TableCell align="left">{issue.returnDate || "N/A"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={bookIssues.length}
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

export default BookIssuedList;
