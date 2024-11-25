import React from 'react';
import {
  Box,
  Typography,
  Link,
} from '@mui/material';
import { FaPhoneAlt, FaEnvelope, FaFacebookF, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from "../components/Footer";

const Contacts = () => {
  return (
    <>
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pb: 4 }}>
      <Header />

      {/* Main Content Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 10 },
          py: 6,
          marginLeft: 10,
          gap: 10,
          mt: 5, // Add margin to move the content down
          paddingTop: 15
        }}
      >
        {/* Google Map Section */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", md: "80%" },
            height: "450px",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            marginRight: 8,
            marginLeft: 8,
            zIndex: 1
          }}
        >
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1930.123456789123!2d121.123456789!3d14.56789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x123456789abcdef123%3A0x123456789abcdef123!2s37%20G.%20MANALO%20STREET%2C%20PATEROS%2C%20METRO%20MANILA!5e0!3m2!1sen!2sph!4v1234567890123"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </Box>

        {/* Contact Information Section */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // Align items to the start
            justifyContent: "center", // Center vertically relative to the map
            gap: 2,
            marginTop: 0,
            paddingTop: 0, 
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#3f5930", fontWeight: "bold", textAlign: "center", margin: 0 }}
          >
            Have a project in mind?
          </Typography>
          <Typography
            variant="h3"
            sx={{ color: "#3f5930", fontWeight: "bold", textAlign: "center", marginBottom: 3 }}
          >
            CONTACT US
          </Typography>

          {/* Phone Information */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "#3f5930",
              textAlign: "left",
              width: "100%",
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
              gap: 2,
              color: "#3f5930",
              textAlign: "left",
              width: "100%",
            }}
          >
            <FaEnvelope size={20} />
            <Typography variant="body1" sx={{ color: "#3f5930" }}>
              foxcondesignandbuild@gmail.com
            </Typography>
          </Box>


          {/* Office Address */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "#3f5930",
              textAlign: "left",
              width: "100%",
            }}
          >
            <FaMapMarkerAlt size={20} />
            <Typography variant="body1" sx={{ color: "#3f5930" }}>
              37 G. MANALO STREET, PATEROS, METRO MANILA
            </Typography>
          </Box>

          {/* Social Media Information */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "#3f5930",
              textAlign: "left",
              width: "100%",
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
    <Footer/>
    </>
  );
};

export default Contacts;
