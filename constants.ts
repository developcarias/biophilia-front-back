

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
    values: {
      title: { en: '', es: '' },
      items: []
    },
    ourNumbers: {
      title: { en: '', es: '' },
      stats: [],
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
  aboutPage: {
    banner: { title: { en: '', es: '' }, imageUrl: '' },
    history: { title: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '' },
    mission: { title: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '', imageAlt: '' },
    vision: { title: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '', imageAlt: '' },
    work: { title: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '', imageAlt: '' },
  },
  projectsPage: {
    banner: { title: { en: '', es: '' }, imageUrl: '' },
    intro: { en: '', es: '' },
  },
  projectDetailPage: {
    backToProjects: { en: '', es: '' },
  },
  teamPage: {
    banner: { title: { en: '', es: '' }, imageUrl: '' },
  },
  blogPage: {
    banner: { title: { en: '', es: '' }, imageUrl: '' },
    featuredPostTitle: { en: '', es: '' },
    recentPostsTitle: { en: '', es: '' },
    sharePostTitle: { en: '', es: '' },
  },
  contactPage: {
    banner: { title: { en: '', es: '' }, imageUrl: '' },
    intro: { en: '', es: '' },
    addressTitle: { en: '', es: '' },
    phoneTitle: { en: '', es: '' },
    emailTitle: { en: '', es: '' },
    form: {
      title: { en: '', es: '' },
      nameLabel: { en: '', es: '' },
      emailLabel: { en: '', es: '' },
      messageLabel: { en: '', es: '' },
      buttonText: { en: '', es: '' },
    },
  },
  donatePage: {
    banner: { title: { en: '', es: '' }, imageUrl: '' },
    intro: { en: '', es: '' },
    form: {
      chooseAmount: { en: '', es: '' },
      customAmount: { en: '', es: '' },
      firstName: { en: '', es: '' },
      lastName: { en: '', es: '' },
      emailAddress: { en: '', es: '' },
      paymentPlaceholder: { en: '', es: '' },
      donateAmount: { en: '', es: '' },
    },
    thankYou: {
      title: { en: '', es: '' },
      text: { en: '', es: '' },
    },
  },
  projects: [],
  team: [],
  blog: []
};