import React from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton, Typography,
  Switch, FormControlLabel, Tooltip
} from '@mui/material'
import {
  Menu as MenuIcon,
  Speed as SpeedIcon,
  Bolt as BoltIcon
} from '@mui/icons-material'
import { useAppStore } from '../store'

const navItems = [
  { label: 'Home', target: 'hero' },
  { label: 'About', target: 'about' },
  { label: 'Programs', target: 'programs' },
  { label: 'Contact', target: 'contact' },
]

export default function Header() {
  const { toggleMobileMenu, performanceMode, togglePerformanceMode, setCameraTarget } = useAppStore()

  const handleNavClick = (target) => {
    setCameraTarget(target)
    const el = document.getElementById(target)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(76, 175, 80, 0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1 }}>
        {/* Left: Hamburger + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={toggleMobileMenu}
            sx={{
              color: '#fff',
              '&:hover': { color: '#4CAF50' },
              transition: 'color 0.3s',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="GBM Logo"
              sx={{ width: 40, height: 40, filter: 'drop-shadow(0 0 8px rgba(76,175,80,0.4))' }}
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
                display: { xs: 'none', sm: 'block' },
              }}
            >
              GBM School
            </Typography>
          </Box>
        </Box>

        {/* Center: Desktop Nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                position: 'relative',
                '&:hover': {
                  color: '#4CAF50',
                  background: 'rgba(76, 175, 80, 0.08)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  width: 0,
                  height: 2,
                  background: '#4CAF50',
                  transition: 'all 0.3s',
                  transform: 'translateX(-50%)',
                },
                '&:hover::after': { width: '60%' },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Right: Performance Toggle + Enquire */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={performanceMode ? 'Performance Mode' : 'High Quality Mode'}>
            <IconButton
              onClick={togglePerformanceMode}
              size="small"
              sx={{
                color: performanceMode ? '#FFD700' : '#4CAF50',
                transition: 'color 0.3s',
              }}
            >
              {performanceMode ? <SpeedIcon fontSize="small" /> : <BoltIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            onClick={() => handleNavClick('contact')}
            sx={{
              background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
              fontWeight: 600,
              px: 3,
              display: { xs: 'none', sm: 'flex' },
              '&:hover': {
                background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
              },
            }}
          >
            Enquire
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
