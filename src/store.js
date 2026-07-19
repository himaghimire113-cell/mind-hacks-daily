import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Loading
  loaded: false,
  setLoaded: () => set({ loaded: true }),

  // Mobile menu
  mobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  // Performance mode
  performanceMode: false,
  togglePerformanceMode: () => set((s) => ({ performanceMode: !s.performanceMode })),

  // Camera target
  cameraTarget: 'hero',
  setCameraTarget: (target) => set({ cameraTarget: target }),

  // Active section for scroll sync
  activeSection: 'hero',
  setActiveSection: (section) => set({ activeSection: section }),

  // Program dialog
  programDialogOpen: false,
  selectedProgram: null,
  openProgramDialog: (program) => set({ programDialogOpen: true, selectedProgram: program }),
  closeProgramDialog: () => set({ programDialogOpen: false, selectedProgram: null }),

  // Contact snackbar
  contactSnackbar: { open: false, message: '' },
  showContactSnackbar: (message) => set({ contactSnackbar: { open: true, message } }),
  hideContactSnackbar: () => set({ contactSnackbar: { open: false, message: '' } }),
}))
