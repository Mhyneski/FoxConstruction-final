import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Link,
} from '@mui/material';
import { FaPhoneAlt, FaEnvelope, FaFacebookF } from 'react-icons/fa';
import Header from '../components/Header';

const Contacts = () => {
  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pb: 4 }}>
      <Header />

      {/* Header Section */}
      <Box sx={{ textAlign: "center", pt: 8 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#3f5930",
            fontWeight: "bold",
            mb: 2,
            pt: 10
          }}
        >
          FOX CONSTRUCTION
        </Typography>
      </Box>

      {/* Contact Details Section */}
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#3f5930", fontWeight: "bold" }}
        >
          Have a project in mind?
        </Typography>
        <Typography
          variant="h3"
          sx={{
            color: "#3f5930",
            fontWeight: "bold",
            mt: 1,
            mb: 2,
          }}
        >
          CONTACT US
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#3f5930", mb: 4 }}
        >
          37 G. MANALO STREET, PATEROS, METRO MANILA
        </Typography>

        {/* Contact Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Phone Information */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#3f5930",
            }}
          >
            <FaPhoneAlt size={20} />
            <Typography variant="body1" sx={{ color: "#3f5930" }}>
              642-5310 <br /> 09192134577
            </Typography>
          </Box>

          {/* Email Information */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#3f5930",
            }}
          >
            <FaEnvelope size={20} />
            <Typography variant="body1" sx={{ color: "#3f5930" }}>
              foxcondesignandbuild@gmail.com
            </Typography>
          </Box>

          {/* Social Media Information */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#3f5930",
            }}
          >
            <FaFacebookF size={20} />
            <Link
              href="https://www.facebook.com/foxconst"
              target="_blank"
              rel="noopener"
              sx={{
                textDecoration: "none",
                color: "#3f5930",
                "&:hover": {
                  color: "#6b7c61",
                },
              }}
            >
              Fox Construction
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Contacts;
