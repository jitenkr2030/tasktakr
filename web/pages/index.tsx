import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to TaskTakr
        </Typography>
        <Typography variant="body1">
          Your on-demand service booking platform
        </Typography>
      </Box>
    </Container>
  );
}