import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "patient") {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/onboarding/profile");
      setOnboardingCompleted(data?.onboarding_completed);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // ✅ Dynamic Patient Menu
  const patientMenu = onboardingCompleted
    ? [
        {
          text: "Dashboard",
          action: () => handleNavigation("/dashboard")
        },
        {
          text: "My Profile",
          action: () => handleNavigation("/onboarding/summary")
        }
      ]
    : [
        {
          text: "Dashboard",
          action: () => handleNavigation("/dashboard")
        },
        {
          text: "Onboarding",
          action: () => handleNavigation("/onboarding/step1")
        }
      ];

  const doctorMenu = [
    {
      text: "Dashboard",
      action: () => handleNavigation("/dashboard")
    },
     {
    text: "Chat",
    action: () => handleNavigation("/chat")
  }
  ];

  const menuItems =
    user?.role === "doctor" ? doctorMenu : patientMenu;

const drawer = (
  <Box
    sx={{
      height: "100%",
      background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)",
      color: "white"
    }}
  >
    <Toolbar>
      <Typography variant="h6" fontWeight="bold">
        🏥 Healthcare
      </Typography>
    </Toolbar>

    <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

    <List sx={{ mt: 2 }}>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            onClick={item.action}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)"
              }
            }}
          >
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 500
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}

      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            logout();
            navigate("/");
          }}
          sx={{
            mx: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.15)"
            }
          }}
        >
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListItem>
    </List>
  </Box>
);

return (
  <Box sx={{ display: "flex" }}>
    {/* ================= AppBar ================= */}
<AppBar
  position="fixed"
  elevation={0}
  sx={{
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    ml: { sm: `${drawerWidth}px` },
    backgroundColor: "#ffffff",
    color: "#1e293b",
    borderBottom: "1px solid #e2e8f0"
  }}
>
  <Toolbar>
    <IconButton
      edge="start"
      onClick={handleDrawerToggle}
      sx={{ mr: 2, display: { sm: "none" } }}
    >
      <MenuIcon />
    </IconButton>

    <Typography variant="h6" fontWeight={600}>
      Welcome, {user?.full_name}
    </Typography>
  </Toolbar>
</AppBar>       

    {/* ================= Mobile Drawer ================= */}
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiDrawer-paper": {
          width: drawerWidth
        }
      }}
    >
      {drawer}
    </Drawer>

    {/* ================= Desktop Drawer ================= */}
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box"
        }
      }}
      open
    >
      {drawer}
    </Drawer>

    {/* ================= Main Content ================= */}
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` }
      }}
    >
      <Toolbar />
      {children}
    </Box>
  </Box>
);  
}