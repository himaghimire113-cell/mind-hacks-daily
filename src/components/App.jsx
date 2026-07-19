import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import LoadingScreen from './components/LoadingScreen'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import Scene3D from './components/Scene3D'
import ContentSections from './components/ContentSections'
import Footer from './components/Footer'
import { useAppStore } from './store'

export default function App() {
  const setActiveSection = useAppStore((s) => s.setActiveSection)

  useEffect(() => {
    const sections = ['hero', 'about', 'programs', 'stats-section', 'news', 'testimonials', 'contact']
    const observers = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { threshold: 0.3 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [setActiveSection])

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', background: '#0a0a0a' }}>
      <LoadingScreen />
      <Header />
      <MobileMenu />
      <Scene3D />
      <ContentSections />
      <Footer />
    </Box>
  )
}
