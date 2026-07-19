import React from 'react'
import { Box, IconButton, Typography, Slide } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useAppStore } from '../store'

const menuItems = [
  { label: 'Home', target: 'hero' },
  { label: 'About Us', target: 'about' },
  { label: 'Programs', target: 'programs' },
  { label: 'Contact', target: 'contact' },
  { label: 'Notices', target: 'notices' },
  { label: 'News', target: 'news' },
  { label: 'Gallery', target: 'gallery' },
  { label: 'Admission', target: 'admission' },
  { label: 'Facilities', target: 'facilities' },
]

export default function MobileMenu() {
  const { mobileMenuOpen, closeMobileMenu, setCameraTarget, activeSection } = useAppStore()

  const handleClick = (target) => {
    setCameraTarget(target)
    closeMobileMenu()
    setTimeout(() => {
      const el = document.getElementById(target)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  return (
    <Slide direction="right" in={mobileMenuOpen} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: '#0d0d0d',
          display: 'flex',
          flexDirection: 'column',
          pt: 8,
          pb: 4,
          px: 4,
        }}
      >
        {/* Close button - top right, matching image */}
        <IconButton
          onClick={closeMobileMenu}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: '#fff',
            '&:hover': { color: '#4CAF50' },
          }}
        >
          <CloseIcon sx={{ fontSize: 28 }} />
        </IconButton>

        {/* Menu items - matching image style */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {menuItems.map((item) => {
            const isActive = activeSection === item.target
            return (
              <Box key={item.target}>
                <Typography
                  onClick={() => handleClick(item.target)}
                  sx={{
                    fontSize: '1.6rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#4CAF50' : 'rgba(255,255,255,0.85)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    position: 'relative',
                    '&:hover': {
                      color: '#4CAF50',
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  {item.label}
                </Typography>
                {isActive && (
                  <Box
                    sx={{
                      width: 40,
                      height: 4,
                      background: '#4CAF50',
                      borderRadius: 2,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
            )
          })}
        </Box>

        {/* Bottom bar matching image */}
        <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              fontSize: '0.85rem',
            }}
          >
            gbm.edu.np — Private
          </Typography>
        </Box>
      </Box>
    </Slide>
  )
}
