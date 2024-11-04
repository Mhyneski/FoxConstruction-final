import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { FaUserCircle, FaHome } from "react-icons/fa";

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    setDropdownAnchor(null);
  };

  const handleDashboardNavigation = () => {
    if (user?.role === "contractor") {
      navigate("/ContractorDashboard");
    } else if (user?.role === "user") {
      navigate("/UserDashboard");
    } else if (user?.role === "admin") {
      navigate("/AdminDashboard");
    }
  };

  const toggleDropdown = (event) => {
    setDropdownAnchor(event.currentTarget);
  };

  const closeDropdown = () => {
    setDropdownAnchor(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#f5f5f5",
        color: "#3f5930",
        boxShadow: "none",
        padding: "0.5rem 1rem",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Company Info */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "#a7b194",
            fontSize: { xs: "28px", md: "32px" },
          }}
        >
          FOX
          <Typography
            variant="body1"
            component="span"
            sx={{
              ml: 1,
              color: "#a7b194",
              fontSize: { xs: "12px", md: "14px" },
            }}
          >
            CONSTRUCTION CO.
          </Typography>
        </Typography>

        {/* Dashboard Button */}
        <Button
          startIcon={<FaHome style={{ color: "#3f5930" }} />}
          onClick={handleDashboardNavigation}
          sx={{
            color: "#3f5930",
            textTransform: "none",
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: "bold",
            gap: "8px",
            "&:hover": {
              backgroundColor: "transparent",
              color: "#6b7c61",
            },
          }}
        >
          Dashboard
        </Button>

        {/* User Info and Profile Icon */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography
              variant="body1"
              sx={{
                color: "#a7b194",
                fontWeight: "bold",
                fontSize: { xs: "14px", md: "inherit" },
              }}
            >
              Hi, {user.Username}
            </Typography>
            <IconButton
              onClick={toggleDropdown}
              sx={{
                color: "#a7b194",
                "&:hover": {
                  color: "#6b7c61",
                },
              }}
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
            >
              <FaUserCircle style={{ fontSize: "24px" }} />
            </IconButton>
            <Menu
              anchorEl={dropdownAnchor}
              open={Boolean(dropdownAnchor)}
              onClose={closeDropdown}
              PaperProps={{
                style: {
                  width: "200px",
                },
              }}
            >
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
