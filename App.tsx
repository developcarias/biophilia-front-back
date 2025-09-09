

import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PageContent, User } from './types';
import { INITIAL_CONTENT } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DonatePage from './pages/DonatePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import AdminBar from './components/AdminBar';
import { I18nProvider } from './i18n';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TeamPage from './pages/TeamPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import ScrollToTop from './components/ScrollToTop';
import { AdminProvider } from './components/AdminContext';
import { produce } from 'immer';
import MediaLibrary from './components/MediaLibrary';

const AppContent = () => {
  const [displayContent, setDisplayContent] = useState<PageContent>(INITIAL_CONTENT);
  const [editableContent, setEditableContent] = useState<PageContent>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = ReactRouterDOM.useNavigate();

  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState('');

  // Dynamically set API_URL based on hostname
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://biophilia-front-back.onrender.com';

  useEffect(() => {
    // Check for saved login state
    try {
      const savedUser = localStorage.getItem('biophilia-admin-user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to parse saved user data:", error);
      localStorage.removeItem('biophilia-admin-user');
    }

    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/content`);
        if (!response.ok) throw new Error('Failed to fetch content');
        const data = await response.json();
        setDisplayContent(data);
        setEditableContent(JSON.parse(JSON.stringify(data))); // Deep copy for editing
      } catch (error) {
        console.error("Failed to fetch content from backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [API_URL]);

  const handleLogin = (user: User) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem('biophilia-admin-user', JSON.stringify(user));
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('biophilia-admin-user');
    navigate('/');
  };
  
  const handleUpdateAndSave = async (contentToSave: PageContent) => {
    try {
        const response = await fetch(`${API_URL}/api/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contentToSave),
        });
        if (!response.ok) throw new Error('Failed to save content');
        
        const savedContentCopy = JSON.parse(JSON.stringify(contentToSave));
        setDisplayContent(savedContentCopy);
        setEditableContent(savedContentCopy); // Keep editable content in sync with saved content
        
        return true; // Indicate success
    } catch (error) {
        console.error("Error saving content:", error);
        alert("Failed to save content. Please check the server connection and try again.");
        return false; // Indicate failure
    }
  };

  const handleFieldUpdate = (path: string, value: any) => {
      setEditableContent(produce(draft => {
        const keys = path.split('.');
        let current: any = draft;
        for (let i = 0; i < keys.length - 1; i++) {
          if (current === undefined) return;
          current = current[keys[i]];
        }
        if (current) {
          current[keys[keys.length - 1]] = value;
        }
      }));
  };

  const openMediaLibrary = (path: string) => {
    setMediaTarget(path);
    setIsMediaLibraryOpen(true);
  };

  const onMediaSelect = (url: string) => {
    handleFieldUpdate(mediaTarget, url);
    setIsMediaLibraryOpen(false);
  };
  
  if (isLoading) {
      return <div className="h-screen w-full flex items-center justify-center bg-brand-green-dark text-white text-2xl">Loading Biophilia Institute...</div>
  }
  
  // When logged in, render the editable content for a live preview experience.
  // Otherwise, render the public, saved content.
  const contentToRender = isLoggedIn ? editableContent : displayContent;

  return (
    <AdminProvider
      isLoggedIn={isLoggedIn}
      onUpdate={handleFieldUpdate}
      currentUser={currentUser}
      openMediaLibrary={openMediaLibrary}
    >
      {isMediaLibraryOpen && (
        <MediaLibrary
            apiUrl={API_URL}
            onSelect={onMediaSelect}
            onClose={() => setIsMediaLibraryOpen(false)}
        />
      )}
      <div className="bg-brand-green-light min-h-screen flex flex-col font-sans text-brand-gray">
        {isLoggedIn && <AdminBar onLogout={handleLogout} />}
        <Header 
          content={contentToRender.global}
          uiText={contentToRender.ui}
        />
        <main className="flex-grow">
          <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route path="/" element={<HomePage content={contentToRender.homePage} uiText={contentToRender.ui} projects={contentToRender.projects} />} />
            <ReactRouterDOM.Route path="/about" element={<AboutPage content={contentToRender.aboutPage} />} />
            <ReactRouterDOM.Route path="/projects" element={<ProjectsPage content={contentToRender.projectsPage} projects={contentToRender.projects} uiText={contentToRender.ui} />} />
            <ReactRouterDOM.Route path="/projects/:projectId" element={<ProjectDetailPage projects={contentToRender.projects} content={contentToRender.projectDetailPage} />} />
            <ReactRouterDOM.Route path="/team" element={<TeamPage content={contentToRender.teamPage} team={contentToRender.team} />} />
            <ReactRouterDOM.Route path="/blog" element={<BlogPage content={contentToRender.blogPage} posts={contentToRender.blog} uiText={contentToRender.ui} />} />
            <ReactRouterDOM.Route path="/blog/:slug" element={<BlogPostPage content={contentToRender.blogPage} posts={contentToRender.blog} uiText={contentToRender.ui} />} />
            <ReactRouterDOM.Route path="/contact" element={<ContactPage content={contentToRender.contactPage} globalContent={contentToRender.global} apiUrl={API_URL} />} />
            <ReactRouterDOM.Route path="/donate" element={<DonatePage content={contentToRender.donatePage} />} />
            <ReactRouterDOM.Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
            <ReactRouterDOM.Route 
              path="/admin" 
              element={
                isLoggedIn ? 
                  <AdminPage 
                    content={editableContent} 
                    onUpdateContent={handleUpdateAndSave} 
                    onDiscardChanges={() => setEditableContent(JSON.parse(JSON.stringify(displayContent)))}
                    apiUrl={API_URL}
                  /> : 
                  <ReactRouterDOM.Navigate to="/login" />
              } 
            />
          </ReactRouterDOM.Routes>
        </main>
        <div 
          className="bg-cover bg-center bg-fixed" 
          style={{backgroundImage: `url('${contentToRender.homePage?.parallax2?.imageUrl || ''}')`}}
        >
          <Footer 
            content={contentToRender.global} 
          />
        </div>
      </div>
    </AdminProvider>
  );
};

const App = () => (
  <I18nProvider>
    <ReactRouterDOM.HashRouter>
      <ScrollToTop />
      <AppContent />
    </ReactRouterDOM.HashRouter>
  </I18nProvider>
);

export default App;