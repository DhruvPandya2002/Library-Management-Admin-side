import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Container,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupIcon from "@mui/icons-material/Group";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

const Dashboard = () => {
  // Example stats (replace with data from your backend)
  const stats = {
    totalBooks: 150,
    totalStudents: 75,
    booksIssued: 25,
  };

  // Example "User of the Week" data (replace with data from your backend)
  const usersOfTheWeek = [
    { id: 1, name: "John Doe", email: "john@example.com", booksIssued: 5, totalHoursSpent: 10 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", booksIssued: 4, totalHoursSpent: 8 },
    { id: 3, name: "Alice Johnson", email: "alice@example.com", booksIssued: 3, totalHoursSpent: 7 },
    { id: 4, name: "Mark Brown", email: "mark@example.com", booksIssued: 2, totalHoursSpent: 5 },
    { id: 5, name: "Emily Davis", email: "emily@example.com", booksIssued: 6, totalHoursSpent: 12 },
    { id: 6, name: "Chris Wilson", email: "chris@example.com", booksIssued: 1, totalHoursSpent: 3 },
    { id: 7, name: "Sophia Taylor", email: "sophia@example.com", booksIssued: 2, totalHoursSpent: 4 },
    { id: 8, name: "David White", email: "david@example.com", booksIssued: 4, totalHoursSpent: 9 },
    { id: 9, name: "Michael Scott", email: "michael@example.com", booksIssued: 3, totalHoursSpent: 6 },
  ];
  

  // Pagination state
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page change
  };

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 } }}>
      {/* Dashboard Stats */}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Total Books */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "12px",
              height: "100%",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#E3F2FD",
                borderRadius: "50%",
                padding: 1,
              }}
            >
              <MenuBookIcon sx={{ color: "#2196F3", fontSize: 40 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Total Books
              </Typography>
              <Typography variant="h4" sx={{ color: "#2196F3" }}>
                {stats.totalBooks}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Today Issues */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "12px",
              height: "100%",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#E8F5E9",
                borderRadius: "50%",
                padding: 1,
              }}
            >
              <GroupIcon sx={{ color: "#4CAF50", fontSize: 40 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Today Issues
              </Typography>
              <Typography variant="h4" sx={{ color: "#4CAF50" }}>
                {stats.totalStudents}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Today Visitors */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "12px",
              height: "100%",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#F3E5F5",
                borderRadius: "50%",
                padding: 1,
              }}
            >
              <PlaylistAddCheckIcon sx={{ color: "#9C27B0", fontSize: 40 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Today Visitors
              </Typography>
              <Typography variant="h4" sx={{ color: "#9C27B0" }}>
                {stats.booksIssued}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* User of the Week Table */}
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          User's of the Week
        </Typography>
        <TableContainer sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Books Issued</TableCell>
                <TableCell align="center">Total Hours Spend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersOfTheWeek
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center">{user.name}</TableCell>
                    <TableCell align="center">{user.email}</TableCell>
                    <TableCell align="center">{user.booksIssued}</TableCell>
                    <TableCell align="center">{user.totalHoursSpent}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          <TablePagination
            component="div"
            count={usersOfTheWeek.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 20]}
            sx={{ marginTop: 2 }}
          />
        </TableContainer>
      </Container>
    </Box>
  );
};

export default Dashboard;
