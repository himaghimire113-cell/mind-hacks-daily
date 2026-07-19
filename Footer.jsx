import React from 'react'
import { Box, Container, Typography, Divider } from '@mui/material'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        zIndex: 1,
        background: '#0a0a0a',
        borderTop: '1px solid rgba(76, 175, 80, 0.1)',
        py: 4,
        pointerEvents: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="GBM Logo"
              sx={{ width: 36, height: 36 }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #fff, #81C784)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GBM School
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}
          >
            All Rights Reserved © 2026 Gomendra Birtamodel English School
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            Birtamode - 4, Jhapa, Nepal
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
