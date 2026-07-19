import React, { useEffect, useState } from 'react'
import { Box, LinearProgress, Typography, Fade } from '@mui/material'
import { useAppStore } from '../store'

export default function LoadingScreen() {
  const loaded = useAppStore((s) => s.loaded)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setFadeOut(true), 400)
          setTimeout(() => useAppStore.getState().setLoaded(), 900)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
    return () => clearInterval(timer)
  }, [])

  if (loaded) return null

  return (
    <Fade in={!fadeOut} timeout={800}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 50%, #0a0a0a 100%)',
          gap: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4CAF50, #81C784)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            GBM School
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 3, fontSize: '0.85rem' }}>
            LOADING EXPERIENCE
          </Typography>
        </Box>

        <Box sx={{ width: { xs: '80%', sm: '400px' } }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #2E7D32, #4CAF50, #81C784)',
                borderRadius: 2,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'right',
              mt: 1,
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
            }}
          >
            {Math.min(Math.round(progress), 100)}%
          </Typography>
        </Box>
      </Box>
    </Fade>
  )
}
