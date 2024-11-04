import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Fade,
} from '@mui/material';
import personImage from '../assets/HECTOR.jpeg';
import Header from '../components/Header';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Component */}
      <Header />

      {/* About Us Section */}
      <Box sx={{ textAlign: "center", pt: 10, pb: 4 }}>
        <Typography variant="h2" sx={{ color: "#3f5930", fontWeight: "bold" }}>
          About Us
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          px: 2,
        }}
      >
        {/* Text Container */}
        <Fade in={isVisible} timeout={1000}>
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: "center", md: "left" },
              px: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{ color: "#3f5930", fontWeight: "bold", mb: 2 }}
            >
              Welcome To Fox Construction Company
            </Typography>
            <Typography variant="body1" sx={{ color: "#3f5930", lineHeight: 1.8 }}>
              Since 1999, Fox Construction has been quietly building a reputation in Pateros—literally.
              We don’t say much; we let the hammer do the talking. Founded by Hector Manalo, we bring
              expert craftsmanship to every project, covering all bases: carpentry, masonry, metal works,
              painting, plumbing, electrical, air conditioning, and landscaping. Whether you’re renovating
              or building from the ground up, we’re here to turn your vision into rock-solid reality.
              Quality, reliability, and precision—that’s the Fox Construction promise.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: "#3f5930", fontStyle: "italic" }}>
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
              flex: 1,
              width: { xs: "80%", md: "400px" },
              maxWidth: "100%",
              borderRadius: "8px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
              mx: { xs: "auto", md: 0 },
            }}
          />
        </Fade>
      </Box>
    </Box>
  );
};

export default AboutUs;
