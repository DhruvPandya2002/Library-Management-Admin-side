// import { Delete, Edit } from "@mui/icons-material";
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

const StudentList = () => {
  // const theme = useTheme(); 
  const [students, setStudent] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterStudents, setfilterStudents] = useState([]);
  const [page, setPage] = useState(0); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [selectedStudnetId, setselectedStudnetId] = useState(null); // ID of book to delete
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch books from Firestore
    const fetchStudents = async () => {
      try {
        const snapshot = await firestore.collection("students").get();
        const studentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudent(studentData);
        setfilterStudents(studentData);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchStudents();
  }, []);

  // search logic
  useEffect(() => {
    const searchTerm = searchInput.toLowerCase();
    const results = students.filter((student) =>
      (student.email?.toLowerCase().includes(searchTerm) ||
       student.name?.toLowerCase().includes(searchTerm) ||
       student.usn?.includes(searchTerm))
    );
    setfilterStudents(results);
  }, [searchInput, students]);
  

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

  const handleAddNewStudent = () => {
    navigate("/add-student"); // Redirect to add book page
  };

  const handleUploadStudents = () => {
    navigate("/add-student-csv"); // Redirect to CSV book upload page
  };

  const handleEditStudent = (id) => {
    navigate(`/edit-student/${id}`); // Redirect to edit book page with book ID
  };

  const handleDeleteDialogOpen = (id) => {
    setselectedStudnetId(id); // Set the selected book ID
    setOpenDialog(true); // Open confirmation dialog
  };

  const handleDeleteDialogClose = () => {
    setOpenDialog(false); // Close confirmation dialog
    setselectedStudnetId(null); // Reset selected book ID
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudnetId) return;

    try {
      await firestore.collection("students").doc(selectedStudnetId).delete();
      setStudent((prevStudents) =>
        prevStudents.filter((students) => students.id !== selectedStudnetId)
      );
      setfilterStudents((prevStudents) =>
        prevStudents.filter((students) => students.id !== selectedStudnetId)
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
        Students List
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
            onClick={handleAddNewStudent}
            sx={{ marginRight: 1 }}
          >
            Add Students
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleUploadStudents}>
            Upload via CSV
          </Button>
        </Box>
      </Box>
      <TableContainer sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Email</TableCell>              
              <TableCell align="left">Usn</TableCell>
              <TableCell align="left">Department</TableCell>
              <TableCell align="left">Branch</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterStudents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow key={student.id}>
                  <TableCell align="left">{student.name}</TableCell>
                  <TableCell align="left">{student.email}</TableCell>                  
                  <TableCell align="left">{student.usn}</TableCell>
                  <TableCell align="left">{student.department}</TableCell>
                  <TableCell align="left">{student.branch}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditStudent(student.id)}
                      sx={{ marginRight: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteDialogOpen(student.id)}
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
        count={filterStudents.length}
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
          <Button onClick={handleDeleteStudent} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentList;
