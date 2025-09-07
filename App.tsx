
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PageContent } from './types';
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

const AppContent = () => {
  const [content, setContent] = useState<PageContent>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = ReactRouterDOM.useNavigate();

  const API_URL = 'http://localhost:3001'; // Backend URL

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/content`);
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch content from backend:", error);
        // Fallback to initial content or show an error message
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };
  
  const handleUpdateContent = async (newContent: PageContent) => {
    try {
        const response = await fetch(`${API_URL}/api/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContent),
        });
        if (!response.ok) {
            throw new Error('Failed to save content');
        }
        setContent(newContent); // Optimistic update
        return true; // Indicate success
    } catch (error) {
        console.error("Error saving content:", error);
        alert("Failed to save content. Please check the server connection and try again.");
        return false; // Indicate failure
    }
  };

  if (isLoading) {
      return <div className="h-screen w-full flex items-center justify-center bg-brand-green-dark text-white text-2xl">Loading Biophilia Institute...</div>
  }

  return (
    <AdminProvider isLoggedIn={isLoggedIn} onUpdate={() => {}}>
      <div className="bg-brand-green-light min-h-screen flex flex-col font-sans text-brand-gray">
        {isLoggedIn && <AdminBar onLogout={handleLogout} />}
        <Header 
          content={content.global}
          uiText={content.ui}
        />
        <main className="flex-grow">
          <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route path="/" element={<HomePage content={content.homePage} uiText={content.ui} projects={content.projects} />} />
            <ReactRouterDOM.Route path="/about" element={<AboutPage content={content.aboutPage} valuesContent={content.homePage.values || {title: {en: 'Our Values', es: 'Nuestros Valores'}, items: []}} />} />
            <ReactRouterDOM.Route path="/projects" element={<ProjectsPage content={content.projectsPage} projects={content.projects} uiText={content.ui} />} />
            <ReactRouterDOM.Route path="/projects/:projectId" element={<ProjectDetailPage projects={content.projects} content={content.projectDetailPage} />} />
            <ReactRouterDOM.Route path="/team" element={<TeamPage content={content.teamPage} team={content.team} />} />
            <ReactRouterDOM.Route path="/blog" element={<BlogPage content={content.blogPage} posts={content.blog} uiText={content.ui} />} />
            <ReactRouterDOM.Route path="/blog/:slug" element={<BlogPostPage content={content.blogPage} posts={content.blog} uiText={content.ui} />} />
            <ReactRouterDOM.Route path="/contact" element={<ContactPage content={content.contactPage} globalContent={content.global} apiUrl={API_URL} />} />
            <ReactRouterDOM.Route path="/donate" element={<DonatePage content={content.donatePage} />} />
            <ReactRouterDOM.Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
            <ReactRouterDOM.Route 
              path="/admin" 
              element={
                isLoggedIn ? 
                  <AdminPage 
                    content={content} 
                    onUpdateContent={handleUpdateContent} 
                    apiUrl={API_URL}
                  /> : 
                  <ReactRouterDOM.Navigate to="/login" />
              } 
            />
          </ReactRouterDOM.Routes>
        </main>
        <div 
          className="bg-cover bg-center bg-fixed" 
          style={{backgroundImage: `url('${content.homePage.parallax2.imageUrl}')`}}
        >
          <Footer 
            content={content.global} 
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
