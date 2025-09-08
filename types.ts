

export interface LocalizedText {
  en: string;
  es: string;
}

export interface TitledText {
  title: LocalizedText;
  text: LocalizedText;
}

export interface ValueItem {
  id: string;
  title: LocalizedText;
  slogan?: LocalizedText;
  text: LocalizedText;
  imageUrl?: string;
  icon?: string;
}

export interface ProjectActivity {
  id: string;
  date: string; // ISO date string
  title: LocalizedText;
  description: LocalizedText;
  imageUrl: string;
}

export interface Project {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  detailDescription: LocalizedText;
  imageUrl: string;
  imageAlt: string;
  activities: ProjectActivity[];
  detailImageUrl: string;
}

export interface TeamMember {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
  imageUrl: string;
  imageAlt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedText;
  author: string;
  date: string; // ISO date string
  summary: LocalizedText;
  content: LocalizedText;
  imageUrl: string;
  imageAlt: string;
}

export interface AlliancePartner {
    id: string;
    name: string;
    logoUrl: string;
}

// User Management Type
export interface User {
  id: number;
  username: string;
  password?: string; // Only used for creating/updating
}

// NEW CMS STRUCTURE

export interface NavLink {
  id: string;
  to: string;
  label: LocalizedText;
  end?: boolean;
}

export interface SocialLink {
  id: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  url: string;
}

export interface GlobalContent {
  logoUrl: string;
  navigation: NavLink[];
  socialLinks: SocialLink[];
  footer: {
    slogan: LocalizedText;
    copyright: LocalizedText;
    contact: {
      address: string;
      email: string;
    };
  }
}

export interface UIText {
  donateNow: LocalizedText;
  supportMission: LocalizedText;
  viewAllProjects: LocalizedText;
  learnMore: LocalizedText;
  readMore: LocalizedText;
  contact: LocalizedText;
  viewActions: LocalizedText;
}

export interface HeroSlide {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  imageUrl: string;
  projectId?: string;
  activityId?: string;
}

export interface Statistic {
  id: string;
  icon: string;
  value: string;
  label: LocalizedText;
  backgroundImages?: string[];
}

export interface OurNumbersSection {
  title: LocalizedText;
  stats: Statistic[];
}


export interface HomePageContent {
  heroSlides: HeroSlide[];
  welcome: {
    titlePart1: LocalizedText; // "Welcome to"
    titlePart2: LocalizedText; // "Biophilia Institute"
    slogan: LocalizedText;
    text: LocalizedText;
    imageUrl: string;
    imageAlt: string;
  };
  actionLines: {
    title: LocalizedText;
    items: ValueItem[];
  };
  latestProjects: {
    title: LocalizedText;
    slogan: LocalizedText;
    subtitle: LocalizedText;
  };
  parallax1: {
    title: LocalizedText;
    text: LocalizedText;
    imageUrl: string;
  };
  values: {
    title: LocalizedText;
    items: ValueItem[];
  };
  ourNumbers: OurNumbersSection;
  alliances: {
    title: LocalizedText;
    description: LocalizedText;
    partners: AlliancePartner[];
  };
  parallax2: {
    title: LocalizedText;
    text: LocalizedText;
    imageUrl: string;
  }
}

export interface ContentBlockType {
  title: LocalizedText;
  text: LocalizedText;
  imageUrl: string;
  imageAlt: string;
}

export interface AboutPageContent {
  banner: {
    title: LocalizedText;
    imageUrl: string;
  };
  history: {
    title: LocalizedText;
    text: LocalizedText;
    imageUrl: string;
  };
  mission: ContentBlockType;
  vision: ContentBlockType;
  work: ContentBlockType;
}

export interface ProjectsPageContent {
   banner: {
    title: LocalizedText;
    imageUrl: string;
  };
  slogan: LocalizedText;
  intro: LocalizedText;
}

export interface ProjectDetailPageContent {
  backToProjects: LocalizedText;
}

export interface TeamPageContent {
   banner: {
    title: LocalizedText;
    imageUrl: string;
  };
}

export interface BlogPageContent {
   banner: {
    title: LocalizedText;
    imageUrl: string;
  };
  featuredPostTitle: LocalizedText;
  recentPostsTitle: LocalizedText;
  sharePostTitle: LocalizedText;
}

export interface ContactPageContent {
   banner: {
    title: LocalizedText;
    imageUrl: string;
  };
  intro: LocalizedText;
  addressTitle: LocalizedText;
  phoneTitle: LocalizedText;
  emailTitle: LocalizedText;
  form: {
    title: LocalizedText;
    nameLabel: LocalizedText;
    emailLabel: LocalizedText;
    messageLabel: LocalizedText;
    buttonText: LocalizedText;
  }
}

export interface DonatePageContent {
  banner: {
    title: LocalizedText;
    imageUrl: string;
  };
  intro: LocalizedText;
  form: {
    chooseAmount: LocalizedText;
    customAmount: LocalizedText;
    firstName: LocalizedText;
    lastName: LocalizedText;
    emailAddress: LocalizedText;
    paymentPlaceholder: LocalizedText;
    donateAmount: LocalizedText;
  };
  thankYou: {
    title: LocalizedText;
    text: LocalizedText;
  }
}

// The main PageContent interface that holds the entire site's content
export interface PageContent {
  global: GlobalContent;
  ui: UIText;
  homePage: HomePageContent;
  aboutPage: AboutPageContent;
  projectsPage: ProjectsPageContent;
  projectDetailPage: ProjectDetailPageContent;
  teamPage: TeamPageContent;
  blogPage: BlogPageContent;
  contactPage: ContactPageContent;
  donatePage: DonatePageContent;

  // These are lists of items that can be referenced by other pages but are managed centrally
  projects: Project[];
  team: TeamMember[];
  blog: BlogPost[];
}