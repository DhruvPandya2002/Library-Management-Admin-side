import CollectionsIcon from "@mui/icons-material/Collections";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LabelIcon from "@mui/icons-material/Label";
import MenuIcon from "@mui/icons-material/Menu";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppBar, Box, Button, CircularProgress, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Import Firebase auth
import AuthorForm from "./AuthorForm";
import CollectionForm from "./CollectionForm";
import Form from "./Form";
import BookList from "./ListBook";
import BookUpload from "./BookAddCsv";
import StudentUpload from "./StudentAddCsv";// upload
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import StudentList from "./StudentList";
import StudentForm from "./StudentForm";
import BookBorrow from  "./BookBorrow";
import Penalty from './Penalty';
import EntryLogs from './EntryLogs';
import Dashboard from './Dashboard';

const drawerWidth = 245;

const App = ({ darkMode, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }, [navigate]);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Redirect to login if not authenticated and trying to access protected route
      const publicRoutes = ["/login", "/reset-password"];
      if (!currentUser && !publicRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/Dashboard/" },
    { label: "List Book", icon: <PlaylistAddCheckIcon />, path: "/books/" },    
    { label: "Author Form", icon: <PersonIcon />, path: "/author-form" },
    { label: "Student List", icon: <PersonIcon />, path: "/studentList" },
    { label: "Types", icon: <LabelIcon />, path: "/types" },
    { label: "Category", icon: <CollectionsIcon />, path: "/categories" },
    { label: "Book Issue", icon: <MenuBookIcon />, path: "/BookBorrow" },
    { label: "Penalty", icon: <CurrencyRupeeIcon />, path: "/Penalty" },
    { label: "EntryLogs", icon: <SyncAltIcon />, path: "/EntryLogs" },
  ];

  const handleDrawerToggle = useCallback(() => setMobileOpen((prev) => !prev), []);

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              backgroundColor: location.pathname === item.path ? theme.palette.action.selected : "transparent",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: theme.palette.background.default,
        }}
      >
        <CircularProgress sx={{ background: theme.palette.background.default }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", background: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && user && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            DashBoard
          </Typography>
          <Button color="inherit" onClick={toggleTheme}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {user && !isMobile && (
        <Drawer variant="permanent" sx={{ width: 250, flexShrink: 0, "& .MuiDrawer-paper": { width: 250, boxSizing: "border-box" } }}>
          {drawerContent}
        </Drawer>
      )}

      {user && isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/add-book" element={user ? <Form /> : <Login />} />
          <Route path="/add-student" element={user ? <StudentForm /> : <Login />} />
          <Route path="/edit-book/:id" element={user ? <Form /> : <Login />} />
          <Route path="/edit-student/:id" element={user ? <StudentForm /> : <Login />} />
          <Route path="/add-book-csv" element={user ? <BookUpload /> : <Login />} />
          <Route path="/add-student-csv" element={user ? <StudentUpload /> : <Login />} />
          <Route path="/author-form" element={user ? <AuthorForm /> : <Login />} />
          <Route path="/studentList" element={user ? <StudentList /> : <Login />} />      
          <Route path="/categories" element={user ? <CollectionForm collectionName="categories" /> : <Login />} />
          <Route path="/books" element={user ? <BookList /> : <Login />} />
          <Route path="/BookBorrow" element={user ? <BookBorrow /> : <Login />} />
          <Route path="/Penalty" element={user ? <Penalty /> : <Login />} />
          <Route path="/EntryLogs" element={user ? <EntryLogs /> : <Login />} />
          <Route path="/Dashboard" element={user ? <Dashboard /> : <Login />} />
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
          <Route path="/types" element={user ? <CollectionForm collectionName="types" /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />        
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
