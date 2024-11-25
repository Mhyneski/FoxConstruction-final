import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Fade,
} from '@mui/material';
import personImage from '../assets/HECTOR.jpeg';
import Header from '../components/Header';
import Footer from "../components/Footer";

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Header Component */}
        <Header />

        {/* About Us Section */}
        <Box sx={{ textAlign: "center", pt: 10, pb: 6  }}>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start", // Align items to the top
            justifyContent: "center",
            gap: { xs: 2, md: 11 }, // Adjust the gap between text and image
            px: 2,
          }}
        >
          {/* Text Container */}
          <Fade in={isVisible} timeout={1000}>
            <Box
              sx={{
                flex: 1,
                textAlign: { xs: "center", md: "justify" },
                maxWidth: "600px",
                px: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: "#3f5930", fontWeight: "bold", mb: 2, textAlign: "start" }}
              >
                About Us
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#3f5930",
                  lineHeight: 1.8,
                  textAlign: "justify",
                }}
              >
                Since 1999, Fox Construction has been quietly building a reputation in Pateros—literally.
                We don’t say much; we let the hammer do the talking. Founded by Hector Manalo, we bring
                expert craftsmanship to every project, covering all bases: carpentry, masonry, metal works,
                painting, plumbing, electrical, air conditioning, and landscaping. Whether you’re renovating
                or building from the ground up, we’re here to turn your vision into rock-solid reality.
                Quality, reliability, and precision—that’s the Fox Construction promise.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#3f5930",
                    fontStyle: "italic",
                    textAlign: "start",
                  }}
                >
                  Hector Manalo
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Image Container */}
          <Fade in={isVisible} timeout={1000}>
            <Box
              component="img"
              src={personImage}
              alt="Hector Manalo"
              sx={{
                zIndex: 1,
                flex: 1,
                width: { xs: "80%", sm: "60%", md: "300px", lg: "300px", xl: "300px" },
                maxHeight: "550px", // Ensure the image doesn't grow too large
                maxWidth: "550px",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                mx: { xs: "auto", md: 0 },
              }}
            />
          </Fade>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default AboutUs;
