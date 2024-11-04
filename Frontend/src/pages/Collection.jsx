import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ButtonBase,
  useTheme,
} from "@mui/material";
import Image1 from "../assets/IMAGE1.jpg";
import Image2 from "../assets/IMAGE2.jpg";
import Image3 from "../assets/IMAGE3.jpg";
import Image4 from "../assets/IMAGE4.jpg";
import Image5 from "../assets/IMAGE5.jpg";
import Image6 from "../assets/IMAGE6.jpg";
import Header from "../components/Header";

const Collection = () => {
  const theme = useTheme(); // To use consistent colors
  const collections = [
    { title: "Residential 1", image: Image1 },
    { title: "Residential 2", image: Image2 },
    { title: "Residential 3", image: Image3 },
    { title: "Residential 4", image: Image4 },
    { title: "Residential 5", image: Image5 },
    { title: "Residential 6", image: Image6 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % collections.length);
    }, 3000); // Carousel interval time

    return () => clearInterval(interval);
  }, [collections.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pb: 4 }}>
      {/* Header Component */}
      <Header />

      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#3f5930",
          mt: 4,
        }}
      >
        Our Collections
      </Typography>

      {/* Carousel Container */}
      <Box
        sx={{
          position: "relative",
          width: "80%",
          maxWidth: "1200px",
          mx: "auto",
          mt: 4,
          overflow: "hidden",
        }}
      >
        {/* Carousel Inner */}
        <Box
          sx={{
            display: "flex",
            transition: "transform 0.5s ease-in-out",
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {collections.map((collection, index) => (
            <Box
              key={index}
              sx={{
                flex: "0 0 100%",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={collection.image}
                alt={collection.title}
                sx={{
                  width: "100%",
                  height: { xs: "250px", md: "500px" },
                  objectFit: "cover",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                }}
              />
              {/* Overlay with Title */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  textAlign: "center",
                  py: 1,
                }}
              >
                <Typography variant="h6">{collection.title}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Dots for Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        {collections.map((_, index) => (
          <ButtonBase
            key={index}
            onClick={() => handleDotClick(index)}
            sx={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              bgcolor: currentIndex === index ? "#3f5930" : "#a7b194",
              m: 0.5,
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Collection;
