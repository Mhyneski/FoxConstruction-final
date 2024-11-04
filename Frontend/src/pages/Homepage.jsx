import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import HeroVideo from "../assets/Hevabi.mp4";
import Header from '../components/Header';

const Homepage = () => {
  const [isTextLoaded, setIsTextLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTextLoaded(true);
    }, 100);

    const handleUserInteraction = () => {
      setIsMuted(false);
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Header Component */}
      <Header />
      
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 'calc(100% - 64px)', // Adjust height to fit below the header
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mt: '64px', // Margin top to account for fixed header
        }}
      >
        <video
          src={HeroVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />

        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            opacity: isTextLoaded ? 1 : 0,
            transition: 'opacity 2s ease-in-out',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            BUILDING YOUR DREAMS.
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            CREATING REALITY.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Homepage;
