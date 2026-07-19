import React from 'react'
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, IconButton, Button,
  Snackbar, Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'

const whyChooseCards = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
    title: 'Building Brilliant Futures',
    description: 'We nurture academic excellence and personal growth, preparing students to become tomorrow's leaders through innovative teaching methodologies.',
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 40, color: '#81C784' }} />,
    title: 'Empowering Innovators',
    description: 'Our curriculum integrates technology and creative thinking, fostering an environment where innovation thrives and ideas flourish.',
  },
]

const newsItems = [
  { title: 'Annual Sports Day 2026', date: 'Jan 15, 2026', excerpt: 'Join us for the biggest sports event of the year!' },
  { title: 'Science Exhibition Results', date: 'Jan 10, 2026', excerpt: 'Our students won 3 gold medals at the regional science fair.' },
  { title: 'New Computer Lab Inauguration', date: 'Jan 5, 2026', excerpt: 'State-of-the-art computer lab with 50+ workstations now open.' },
]

const galleryImages = [
  { title: 'Campus View', color: '#2E7D32' },
  { title: 'Classroom', color: '#4CAF50' },
  { title: 'Library', color: '#66BB6A' },
  { title: 'Sports Ground', color: '#81C784' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function ContentSections() {
  const {
    programDialogOpen, selectedProgram, closeProgramDialog,
    contactSnackbar, hideContactSnackbar, setCameraTarget
  } = useAppStore()

  const handleSectionClick = (target) => {
    setCameraTarget(target)
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Box sx={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
      {/* Hero Section */}
      <Box
        id="hero"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="md">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                mb: 3,
                background: 'linear-gradient(135deg, #fff 0%, #81C784 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Where Tradition meets Innovation
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 4,
                fontWeight: 300,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
              }}
            >
              Creating Leaders for the Next Generation
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => handleSectionClick('programs')}
              sx={{
                background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(76, 175, 80, 0.4)',
                },
              }}
            >
              Browse Programs
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Box
        id="about"
        sx={{
          minHeight: '60vh',
          py: 10,
          px: 2,
          background: 'linear-gradient(180deg, transparent 0%, rgba(13,13,13,0.8) 30%, rgba(13,13,13,0.8) 70%, transparent 100%)',
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(135deg, #fff, #4CAF50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose Us
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            {whyChooseCards.map((card, i) => (
              <Grid item xs={12} md={5} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Card
                    sx={{
                      background: 'rgba(13, 13, 13, 0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(76, 175, 80, 0.15)',
                      borderRadius: 4,
                      p: 3,
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>{card.icon}</Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#fff' }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Programs Section */}
      <Box
        id="programs"
        sx={{
          minHeight: '80vh',
          py: 10,
          px: 2,
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(135deg, #fff, #4CAF50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Our Programs
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.6)',
                mb: 8,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Click on the 3D cards to explore each program in detail, or browse below.
            </Typography>
          </motion.div>

          <Grid container spacing={3} justifyContent="center">
            {[
              { title: 'Pre-School', subs: 'Nursery, LKG, UKG', color: '#4CAF50' },
              { title: 'School', subs: 'Grade 1 - 10', color: '#2E7D32' },
              { title: 'College', subs: 'CS, Business, Hotel Mgmt, ADHM, BBS', color: '#1B5E20' },
            ].map((prog, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Card
                    onClick={() => handleSectionClick('programs')}
                    sx={{
                      background: 'rgba(13, 13, 13, 0.7)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${prog.color}30`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: prog.color,
                        boxShadow: `0 0 30px ${prog.color}30`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${prog.color}, ${prog.color}80)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {prog.title[0]}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#fff' }}>
                        {prog.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {prog.subs}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        id="stats-section"
        sx={{
          minHeight: '50vh',
          py: 10,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {[
              { value: '25,000+', label: 'Student Enrollment', color: '#4CAF50' },
              { value: '100%', label: 'Excellence', color: '#81C784' },
              { value: '25+', label: 'Years of Experience', color: '#2E7D32' },
            ].map((stat, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  style={{ textAlign: 'center' }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      color: stat.color,
                      textShadow: `0 0 40px ${stat.color}40`,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                    {stat.label}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* News & Gallery */}
      <Box
        id="news"
        sx={{
          minHeight: '70vh',
          py: 10,
          px: 2,
          background: 'linear-gradient(180deg, transparent 0%, rgba(13,13,13,0.6) 50%, transparent 100%)',
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* News */}
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, color: '#fff' }}>
                  Latest News
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {newsItems.map((news, i) => (
                    <Card
                      key={i}
                      sx={{
                        background: 'rgba(13, 13, 13, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(76, 175, 80, 0.1)',
                        borderRadius: 3,
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: 'rgba(76, 175, 80, 0.3)',
                          transform: 'translateX(8px)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                          {news.date}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, my: 0.5, fontSize: '1rem' }}>
                          {news.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {news.excerpt}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            {/* Gallery */}
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, color: '#fff' }}>
                  Gallery
                </Typography>
                <Grid container spacing={2}>
                  {galleryImages.map((img, i) => (
                    <Grid item xs={6} key={i}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Box
                          sx={{
                            aspectRatio: '4/3',
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${img.color}20, ${img.color}40)`,
                            border: `1px solid ${img.color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: img.color,
                              boxShadow: `0 0 20px ${img.color}30`,
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                            {img.title}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  sx={{ mt: 2, color: '#4CAF50', '&:hover': { color: '#81C784' } }}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box
        id="testimonials"
        sx={{
          minHeight: '60vh',
          py: 10,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography variant="h2" sx={{ mb: 6, fontWeight: 700, color: '#fff' }}>
              What People Say
            </Typography>
          </motion.div>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
            The 3D carousel above shows our testimonials in an immersive spatial format.
          </Typography>
        </Container>
      </Box>

      {/* Contact */}
      <Box
        id="contact"
        sx={{
          minHeight: '80vh',
          py: 10,
          px: 2,
          background: 'linear-gradient(180deg, transparent 0%, rgba(13,13,13,0.9) 50%, #0a0a0a 100%)',
          pointerEvents: 'auto',
        }}
      >
        <Container maxWidth="md">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(135deg, #fff, #4CAF50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Get in Touch
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            {[
              { label: 'Phone', value: '+977 9842624058', href: 'tel:+9779842624058' },
              { label: 'Email', value: 'gbmsmartschool@gmail.com', href: 'mailto:gbmsmartschool@gmail.com' },
              { label: 'Address', value: 'Birtamode - 4, Jhapa, Nepal', href: '#' },
            ].map((item, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Card
                    component="a"
                    href={item.href}
                    sx={{
                      background: 'rgba(13, 13, 13, 0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(76, 175, 80, 0.15)',
                      borderRadius: 4,
                      p: 3,
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 600, mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {item.value}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Program Dialog */}
      <Dialog
        open={programDialogOpen}
        onClose={closeProgramDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(13, 13, 13, 0.98)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', pr: 6 }}>
          {selectedProgram?.title}
          <IconButton
            onClick={closeProgramDialog}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'rgba(255,255,255,0.5)' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ color: '#4CAF50', mb: 2 }}>
            {selectedProgram?.subtitle}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            {selectedProgram?.description}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Contact Snackbar */}
      <Snackbar
        open={contactSnackbar.open}
        autoHideDuration={4000}
        onClose={hideContactSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={hideContactSnackbar}
          severity="info"
          sx={{
            background: 'rgba(13, 13, 13, 0.95)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#4CAF50' },
          }}
        >
          {contactSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
