

import { PageContent } from './types';

// This is a placeholder for the initial structure.
// The actual content will be fetched from the backend API.
export const INITIAL_CONTENT: PageContent = {
  global: {
    logoUrl: "",
    navigation: [],
    socialLinks: [],
    footer: {
      slogan: { en: '', es: '' },
      copyright: { en: '', es: '' },
      contact: {
        address: "",
        email: "",
      },
    },
  },
  ui: {
    donateNow: { en: '', es: '' },
    supportMission: { en: '', es: '' },
    viewAllProjects: { en: '', es: '' },
    learnMore: { en: '', es: '' },
    readMore: { en: '', es: '' },
    contact: { en: '', es: '' },
    viewActions: { en: '', es: '' },
  },
  homePage: {
    heroSlides: [],
    welcome: {
      titlePart1: { en: '', es: '' },
      titlePart2: { en: '', es: '' },
      slogan: { en: '', es: '' },
      text: { en: '', es: '' },
      imageUrl: "",
      imageAlt: ""
    },
    actionLines: {
      title: { en: '', es: '' },
      items: []
    },
    latestProjects: {
      title: { en: '', es: '' },
      slogan: { en: '', es: '' },
      subtitle: { en: '', es: '' }
    },
    parallax1: {
      title: { en: '', es: '' },
      text: { en: '', es: '' },
      imageUrl: ''
    },
    // FIX: Added missing 'values' property to satisfy the HomePageContent interface.
    values: {
      title: { en: '', es: '' },
      items: []
    },
    ourNumbers: {
      title: { en: '', es: '' },
      stats: [],
      galleryImages: []
    },
    alliances: {
      title: { en: '', es: '' },
      description: { en: '', es: '' },
      partners: []
    },
    parallax2: {
      title: { en: '', es: '' },
      text: { en: '', es: '' },
      imageUrl: ''
    }
  },
  aboutPage: {} as any,
  projectsPage: {} as any,
  projectDetailPage: {} as any,
  teamPage: {} as any,
  blogPage: {} as any,
  contactPage: {} as any,
  donatePage: {} as any,
  projects: [],
  team: [],
  blog: []
};