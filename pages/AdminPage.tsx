import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageContent, Project, TeamMember, BlogPost, NavLink, ValueItem, HeroSlide, AlliancePartner, ContentBlockType, ProjectActivity, Statistic, User, SocialLink } from '../types';
import { useTranslate, TranslationKey } from '../i18n';
import { produce } from 'immer';
import PageBanner from '../components/PageBanner';
import { useAdmin } from '../components/AdminContext';

interface AdminPageProps {
  content: PageContent;
  onUpdateContent: (newContent: PageContent) => Promise<boolean>;
  onDiscardChanges: () => void;
  apiUrl: string;
}

type AdminTab = 'global' | 'home' | 'about' | 'projects' | 'team' | 'blog' | 'contact' | 'donate' | 'users';
const ADMIN_TAB_KEY = 'biophilia_admin_active_tab';
const ADMIN_SCROLL_KEY = 'biophilia_admin_scroll_pos';


// User Management Component
const UserManagement: React.FC<{ apiUrl: string }> = ({ apiUrl }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const t = useTranslate();
    const { currentUser } = useAdmin();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/users`);
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [apiUrl]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (!res.ok) throw new Error('Failed to create user');
            alert(t('userCreated'));
            setNewUser({ username: '', password: '' });
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to create user');
        }
    };
    
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const res = await fetch(`${apiUrl}/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: editingUser.username,
                    password: editingUser.password, // Send password only if it's being changed
                }),
            });
            if (!res.ok) throw new Error('Failed to update user');
            alert(t('userUpdated'));
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to update user');
        }
    };


    const handleDeleteUser = async (userId: number) => {
        if (window.confirm(t('confirmDeleteUser'))) {
            try {
                const res = await fetch(`${apiUrl}/api/users/${userId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete user');
                alert(t('userDeleted'));
                fetchUsers();
            } catch (error) {
                console.error(error);
                alert(error instanceof Error ? error.message : 'Failed to delete user');
            }
        }
    };
    
    if (isLoading) return <p>Loading users...</p>;

    return (
        <div>
            {editingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setEditingUser(null)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Edit User</h3>
                        <form onSubmit={handleUpdateUser}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={editingUser.username}
                                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                className="border p-2 rounded w-full mb-2"
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password (optional)"
                                value={editingUser.password || ''}
                                onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                className="border p-2 rounded w-full mb-4"
                            />
                             <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="bg-gray-300 text-black px-4 py-2 rounded">{t('cancel')}</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 p-4 border rounded-lg bg-white">
                <h3 className="text-xl font-semibold mb-4">{t('addNewUser')}</h3>
                <form onSubmit={handleCreateUser} className="flex items-end space-x-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-bold mb-1">{t('username')}</label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div className="flex-grow">
                        <label className="block text-sm font-bold mb-1">{t('password')}</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-brand-accent text-white px-4 py-2 rounded self-end">{t('addNewUser')}</button>
                </form>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">{t('userManagement')}</h3>
            <div className="space-y-2">
                {users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span>{user.username}</span>
                        <div className="space-x-2">
                             <button onClick={() => setEditingUser({...user, password: ''})} className="bg-blue-500 text-white text-sm px-3 py-1 rounded">{t('edit')}</button>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={currentUser?.id === user.id}
                                className="bg-red-600 text-white text-sm px-3 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ content, onUpdateContent, onDiscardChanges, apiUrl }) => {
  const [formData, setFormData] = useState<PageContent>(JSON.parse(JSON.stringify(content)));
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const t = useTranslate();
  const { openMediaLibrary } = useAdmin();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    return (sessionStorage.getItem(ADMIN_TAB_KEY) as AdminTab) || 'global';
  });

  useEffect(() => {
    const savedScroll = sessionStorage.getItem(ADMIN_SCROLL_KEY);
    if (savedScroll) {
        // Use a timeout to ensure the content has rendered before scrolling
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
    }

    const handleScroll = () => {
        sessionStorage.setItem(ADMIN_SCROLL_KEY, String(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]); // Rerun if tab changes to handle initial scroll for new tab content

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    sessionStorage.setItem(ADMIN_TAB_KEY, tab);
    sessionStorage.removeItem(ADMIN_SCROLL_KEY);
    window.scrollTo(0, 0);
  };


  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(content)));
  }, [content]);
  
  const TABS: { key: AdminTab; labelKey: TranslationKey }[] = [
    { key: 'global', labelKey: 'tabGlobal' },
    { key: 'home', labelKey: 'tabHome' },
    { key: 'about', labelKey: 'tabAbout' },
    { key: 'projects', labelKey: 'tabProjects' },
    { key: 'team', labelKey: 'tabTeam' },
    { key: 'blog', labelKey: 'tabBlog' },
    { key: 'contact', labelKey: 'tabContact' },
    { key: 'donate', labelKey: 'tabDonate' },
    { key: 'users', labelKey: 'tabUsers'},
  ];

  const handleInputChange = useCallback((path: string, value: string | boolean) => {
    setFormData(produce(draft => {
        const keys = path.split('.');
        let current: any = draft;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];
            if (current[key] === undefined || current[key] === null) {
                if (nextKey && /^\d+$/.test(nextKey)) {
                    current[key] = [];
                } else {
                    current[key] = {};
                }
            }
            current = current[key];
        }
        if (current !== undefined && current !== null) {
            current[keys[keys.length - 1]] = value;
        }
    }));
  }, []);
  
  const handleAddItem = useCallback((path: string, newItemTemplate: object | string) => {
    setFormData(produce(draft => {
        const pathParts = path.split('.');
        let current: any = draft;
        for (let i = 0; i < pathParts.length; i++) {
            if (i === pathParts.length - 1) {
                 if (current[pathParts[i]] === undefined || current[pathParts[i]] === null) {
                    current[pathParts[i]] = [];
                }
                if (Array.isArray(current[pathParts[i]])) {
                    const id = path === 'global.socialLinks' ? 'facebook' : `new_${Date.now()}`;
                    const newItem = typeof newItemTemplate === 'string' ? newItemTemplate : { ...newItemTemplate, id };
                    current[pathParts[i]].push(newItem);
                }
            } else {
                 if (current[pathParts[i]] === undefined) current[pathParts[i]] = {};
                 current = current[pathParts[i]];
            }
        }
    }));
  }, []);

  const handleRemoveItem = useCallback((path: string, index: number) => {
    setFormData(produce(draft => {
        const pathParts = path.split('.');
        let current: any = draft;
         for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        const arrayToModify = current[pathParts[pathParts.length-1]];
        if(Array.isArray(arrayToModify)) {
            arrayToModify.splice(index, 1);
        }
    }));
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    const success = await onUpdateContent(formData);
    if (success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
      window.scrollTo(0, 0);
    } else {
      setStatus('error');
    }
  };

  // RENDER HELPERS
  const renderTextField = useCallback((labelKey: TranslationKey | string, path: string, isTextarea: boolean = false, type: string = 'text') => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], formData as any) || '';
    const label = t(labelKey as TranslationKey, {});
    const displayLabel = label === labelKey ? labelKey : label;
    const InputComponent = isTextarea ? 'textarea' : 'input';
    return (
      <div className="mb-4">
        <label className="block text-brand-gray text-sm font-bold mb-2">{displayLabel}</label>
        <InputComponent
          type={type}
          value={value}
          onChange={(e) => handleInputChange(path, e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
          rows={isTextarea ? 10 : undefined}
        />
      </div>
    );
  }, [formData, handleInputChange, t]);
  
  const renderImageField = useCallback((label: string, path: string) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], formData as any) || '';
    return (
      <div className="mb-4">
          <label className="block text-brand-gray text-sm font-bold mb-2">{label}</label>
          <div className="flex items-center">
              <input
                  type="text"
                  value={value}
                  onChange={(e) => handleInputChange(path, e.target.value)}
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
                  placeholder="https://..."
              />
              <button
                  type="button"
                  onClick={() => openMediaLibrary(path)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
              >
                  Select
              </button>
          </div>
      </div>
  )}, [formData, handleInputChange, openMediaLibrary]);

  const renderLocalizedTextField = useCallback((baseLabel: string, basePath: string, isTextarea: boolean = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTextField(`${baseLabel} (EN)`, `${basePath}.en`, isTextarea)}
        {renderTextField(`${baseLabel} (ES)`, `${basePath}.es`, isTextarea)}
    </div>
  ), [renderTextField]);
  
  const handlers = useMemo(() => ({
    handleAddItem,
    handleRemoveItem,
    renderTextField,
    renderLocalizedTextField,
    renderImageField,
    t
  }), [handleAddItem, handleRemoveItem, renderTextField, renderLocalizedTextField, renderImageField, t]);
  
  return (
    <>
      <PageBanner title={t('adminPanelTitle')} imageUrl="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1920&h=1080&fit=crop" />
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm-px-6 lg:px-8">
          
          <div className="flex items-center space-x-4 mb-4 sticky top-[176px] bg-white py-4 z-10 border-b">
            <button onClick={handleSave} disabled={status === 'saving'} className="bg-brand-green-dark hover:bg-brand-green-dark/90 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400">{status === 'saving' ? 'Saving...' : t('saveChanges')}</button>
            <button onClick={onDiscardChanges} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline">{t('discardChanges')}</button>
            {status === 'success' && <div className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">{t('changesSaved')}</div>}
            {status === 'error' && <div className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg">Save failed.</div>}
          </div>

          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key ? 'border-brand-accent text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t(tab.labelKey)}</button>
              ))}
            </nav>
          </div>

          <div className="bg-brand-green-light p-6 rounded-lg shadow-inner">
            {activeTab === 'global' && <GlobalTab data={formData.global} handlers={handlers} />}
            {activeTab === 'home' && <HomeTab data={formData.homePage} handlers={handlers} />}
            {activeTab === 'about' && <AboutTab data={formData.aboutPage} handlers={handlers} />}
            {activeTab === 'projects' && <ProjectsTab data={formData} handlers={handlers} />}
            {activeTab === 'team' && <TeamTab data={formData} handlers={handlers} />}
            {activeTab === 'blog' && <BlogTab data={formData} handlers={handlers} />}
            {activeTab === 'contact' && <ContactTab data={formData.contactPage} handlers={handlers} />}
            {activeTab === 'donate' && <DonateTab data={formData.donatePage} handlers={handlers} />}
            {activeTab === 'users' && <UserManagement apiUrl={apiUrl} />}
          </div>
        </div>
      </div>
    </>
  );
};

// HELPER COMPONENTS (to be used by Tabs)
const AdminSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t pt-6 mt-6">
        <h3 className="text-xl font-semibold text-brand-green-dark mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const ListItemWrapper: React.FC<{ title: string; onRemove: () => void; children: React.ReactNode, nested?: boolean }> = ({ title, onRemove, children, nested=false }) => (
    <div className={`border p-4 rounded mb-4 relative ${nested ? 'bg-gray-50 shadow-sm' : 'bg-white shadow'}`}>
        <h4 className="font-bold mb-2 text-brand-gray">{title}</h4>
        {children}
        <button onClick={onRemove} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded">Remove</button>
    </div>
);


// MEMOIZED TAB COMPONENTS
const GlobalTab = React.memo(({data, handlers}: {data: PageContent['global'], handlers: any}) => {
    const { renderImageField, renderTextField, renderLocalizedTextField, handleAddItem, handleRemoveItem, t } = handlers;
    const newNavLinkTemplate: Omit<NavLink, 'id'> = { to: '/', label: { en: '', es: '' } };
    const newSocialLinkTemplate: Omit<SocialLink, 'id'> = { url: '#' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabGlobal')}</h2>
        {renderImageField('Logo URL', 'global.logoUrl')}
        <AdminSection title={t('sectionNavigation')}>
            {data?.navigation?.map((link: NavLink, index: number) => (
                <ListItemWrapper key={link.id} title={link.label.en || `Link ${index+1}`} onRemove={() => handleRemoveItem('global.navigation', index)}>
                    {renderTextField('URL Path (e.g., /about)', `global.navigation.${index}.to`)}
                    {renderLocalizedTextField('Label', `global.navigation.${index}.label`)}
                </ListItemWrapper>
            ))}
             <button onClick={() => handleAddItem('global.navigation', newNavLinkTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewLink')}</button>
        </AdminSection>
        <AdminSection title={t('sectionSocial')}>
            {data?.socialLinks?.map((link: SocialLink, index: number) => (
                 <ListItemWrapper key={index} title={link.id} onRemove={() => handleRemoveItem('global.socialLinks', index)}>
                    {renderTextField('Platform (facebook, instagram, linkedin, twitter)', `global.socialLinks.${index}.id`)}
                    {renderTextField('URL', `global.socialLinks.${index}.url`)}
                 </ListItemWrapper>
            ))}
            <button onClick={() => handleAddItem('global.socialLinks', newSocialLinkTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewLink')}</button>
        </AdminSection>
        <AdminSection title={t('sectionFooter')}>
            {renderLocalizedTextField('Slogan', 'global.footer.slogan')}
            {renderLocalizedTextField('Copyright', 'global.footer.copyright')}
            {renderTextField('Address', 'global.footer.contact.address')}
            {renderTextField('Email', 'global.footer.contact.email')}
        </AdminSection>
    </>
});

const HomeTab = React.memo(({data, handlers}: {data: PageContent['homePage'], handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, t } = handlers;
    const newHeroSlideTemplate: Omit<HeroSlide, 'id'> = { title: { en: '', es: '' }, subtitle: { en: '', es: '' }, imageUrl: '', projectId: '', activityId: '' };
    const newValueItemTemplate: Omit<ValueItem, 'id'> = { title: { en: '', es: '' }, slogan: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '' };
    const newStatTemplate: Omit<Statistic, 'id'> = { icon: 'LeafIcon', value: '0', label: { en: '', es: '' }, backgroundImages: [] };
    const newAlliancePartnerTemplate: Omit<AlliancePartner, 'id'> = { name: '', logoUrl: '' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabHome')}</h2>
        <AdminSection title={t('sectionHero')}>
        {data?.heroSlides?.map((slide, index) => (
            <ListItemWrapper key={slide.id} title={`Slide: ${slide.title?.en || `(Slide ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.heroSlides', index)}>
                {renderLocalizedTextField('Title', `homePage.heroSlides.${index}.title`)}
                {renderLocalizedTextField('Subtitle', `homePage.heroSlides.${index}.subtitle`, true)}
                {renderImageField('Image URL', `homePage.heroSlides.${index}.imageUrl`)}
                {renderTextField('Program ID (optional)', `homePage.heroSlides.${index}.projectId`)}
                {renderTextField('Activity ID (optional)', `homePage.heroSlides.${index}.activityId`)}
            </ListItemWrapper>
        ))}
        <button onClick={() => handleAddItem('homePage.heroSlides', newHeroSlideTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection title={t('sectionWelcome')}>
        {renderLocalizedTextField('Title Part 1', 'homePage.welcome.titlePart1')}
        {renderLocalizedTextField('Title Part 2', 'homePage.welcome.titlePart2')}
        {renderLocalizedTextField('Slogan', 'homePage.welcome.slogan')}
        {renderLocalizedTextField('Text', 'homePage.welcome.text', true)}
        {renderImageField('Image URL', 'homePage.welcome.imageUrl')}
        {renderTextField('Image Alt Text', 'homePage.welcome.imageAlt')}
        </AdminSection>
        <AdminSection title={t('sectionActionLines')}>
        {renderLocalizedTextField('Section Title', 'homePage.actionLines.title')}
        {data?.actionLines?.items?.map((item, index) => (
            <ListItemWrapper key={item.id} title={`Action Line: ${item.title?.en || `(Item ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.actionLines.items', index)}>
                {renderLocalizedTextField('Title', `homePage.actionLines.items.${index}.title`)}
                {renderLocalizedTextField('Slogan', `homePage.actionLines.items.${index}.slogan`)}
                {renderLocalizedTextField('Text', `homePage.actionLines.items.${index}.text`, true)}
                {renderImageField('Image URL', `homePage.actionLines.items.${index}.imageUrl`)}
            </ListItemWrapper>
        ))}
        <button onClick={() => handleAddItem('homePage.actionLines.items', newValueItemTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection title={`${t('sectionParallax')} 1`}>
        {renderLocalizedTextField('Title', `homePage.parallax1.title`)}
        {renderLocalizedTextField('Text', `homePage.parallax1.text`, true)}
        {renderImageField('Image URL', `homePage.parallax1.imageUrl`)}
        </AdminSection>
        <AdminSection title={t('sectionValues')}>
            {renderLocalizedTextField('Section Title', 'homePage.values.title')}
        {data?.values?.items?.map((item, index) => (
            <ListItemWrapper key={item.id} title={`Value: ${item.title?.en || `(Value ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.values.items', index)}>
                {renderLocalizedTextField('Title', `homePage.values.items.${index}.title`)}
                {renderLocalizedTextField('Text', `homePage.values.items.${index}.text`, true)}
                {renderImageField('Image URL (optional)', `homePage.values.items.${index}.imageUrl`)}
                {renderTextField('Icon Name (e.g., ValueConnectionIcon)', `homePage.values.items.${index}.icon`)}
            </ListItemWrapper>
        ))}
        <button onClick={() => handleAddItem('homePage.values.items', { title: { en: '', es: '' }, text: { en: '', es: '' }, icon: 'ValueConnectionIcon' })} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection title="Our Impact Section">
        {renderLocalizedTextField('Section Title', 'homePage.ourNumbers.title')}
        {data?.ourNumbers?.stats?.map((stat, index) => (
            <ListItemWrapper key={stat.id} title={`Stat: ${stat.label?.en || `(Stat ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.ourNumbers.stats', index)}>
                {renderTextField('Icon Name (e.g., LeafIcon)', `homePage.ourNumbers.stats.${index}.icon`)}
                {renderTextField('Value (Number)', `homePage.ourNumbers.stats.${index}.value`)}
                {renderLocalizedTextField('Label', `homePage.ourNumbers.stats.${index}.label`)}
                <h4 className="font-semibold text-brand-gray mt-4 mb-2">Background Images</h4>
                {stat.backgroundImages?.map((imgUrl, imgIndex) => (
                    <div key={imgIndex} className="flex items-center space-x-2 mb-2">
                        {renderImageField(`Image ${imgIndex + 1}`, `homePage.ourNumbers.stats.${index}.backgroundImages.${imgIndex}`)}
                        <button onClick={() => handleRemoveItem(`homePage.ourNumbers.stats.${index}.backgroundImages`, imgIndex)} className="bg-red-500 text-white px-2 py-1 text-xs rounded self-end mb-4">X</button>
                    </div>
                ))}
                <button onClick={() => handleAddItem(`homePage.ourNumbers.stats.${index}.backgroundImages`, '')} className="mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 text-sm rounded">Add Background Image</button>
            </ListItemWrapper>
        ))}
            <button onClick={() => handleAddItem('homePage.ourNumbers.stats', newStatTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection title={t('sectionAlliances')}>
        {renderLocalizedTextField('Section Title', `homePage.alliances.title`)}
        {renderLocalizedTextField('Description', `homePage.alliances.description`, true)}
            <h4 className="font-semibold text-brand-gray mt-6 mb-2">Partners</h4>
        {data?.alliances?.partners?.map((partner, index) => (
            <ListItemWrapper key={partner.id} title={`Partner: ${partner.name || `(Partner ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.alliances.partners', index)}>
                {renderTextField('Partner Name', `homePage.alliances.partners.${index}.name`)}
                {renderImageField('Logo URL', `homePage.alliances.partners.${index}.logoUrl`)}
            </ListItemWrapper>
        ))}
        <button onClick={() => handleAddItem('homePage.alliances.partners', newAlliancePartnerTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection title={`${t('sectionParallax')} 2`}>
        {renderLocalizedTextField('Title', `homePage.parallax2.title`)}
        {renderLocalizedTextField('Text', `homePage.parallax2.text`, true)}
        {renderImageField('Image URL', `homePage.parallax2.imageUrl`)}
        </AdminSection>
    </>
});

const AboutTab = React.memo(({data, handlers}: {data: PageContent['aboutPage'], handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, t } = handlers;
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabAbout')}</h2>
        <AdminSection title={t('sectionBanner')}>
            {renderLocalizedTextField('Title', 'aboutPage.banner.title')}
            {renderImageField('Image URL', 'aboutPage.banner.imageUrl')}
        </AdminSection>
        <AdminSection title={t('sectionHistory')}>
            {renderLocalizedTextField('Title', 'aboutPage.history.title')}
            {renderLocalizedTextField('Text', 'aboutPage.history.text', true)}
            {renderImageField('Image URL', 'aboutPage.history.imageUrl')}
        </AdminSection>
        <AdminSection title={t('sectionMission')}>
            {renderLocalizedTextField('Title', 'aboutPage.mission.title')}
            {renderLocalizedTextField('Text', 'aboutPage.mission.text', true)}
            {renderImageField('Image URL', 'aboutPage.mission.imageUrl')}
            {renderTextField('Image Alt Text', 'aboutPage.mission.imageAlt')}
        </AdminSection>
        <AdminSection title={t('sectionVision')}>
            {renderLocalizedTextField('Title', 'aboutPage.vision.title')}
            {renderLocalizedTextField('Text', 'aboutPage.vision.text', true)}
            {renderImageField('Image URL', 'aboutPage.vision.imageUrl')}
            {renderTextField('Image Alt Text', 'aboutPage.vision.imageAlt')}
        </AdminSection>
        <AdminSection title={t('sectionWork')}>
            {renderLocalizedTextField('Title', 'aboutPage.work.title')}
            {renderLocalizedTextField('Text', 'aboutPage.work.text', true)}
            {renderImageField('Image URL', 'aboutPage.work.imageUrl')}
            {renderTextField('Image Alt Text', 'aboutPage.work.imageAlt')}
        </AdminSection>
    </>
});

const ProjectsTab = React.memo(({data, handlers}: {data: PageContent, handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, t } = handlers;
    const newProjectActivityTemplate: Omit<ProjectActivity, 'id'> = { date: new Date().toISOString().split('T')[0], title: { en: '', es: '' }, description: { en: '', es: '' }, imageUrl: '' };
    const newProjectTemplate: Omit<Project, 'id'> = { title: { en: '', es: '' }, description: { en: '', es: '' }, imageUrl: '', imageAlt: '', activities: [], detailImageUrl: '' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabProjects')}</h2>
        <AdminSection title={t('sectionBanner')}>
            {renderLocalizedTextField('Title', 'projectsPage.banner.title')}
            {renderImageField('Image URL', 'projectsPage.banner.imageUrl')}
        </AdminSection>
            <AdminSection title={t('sectionIntro')}>{renderLocalizedTextField('Intro Text', 'projectsPage.intro', true)}</AdminSection>
        <AdminSection title="Program List">
            {data.projects?.map((project, index) => (
            <ListItemWrapper key={project.id} title={`Program: ${project.title?.en || `(Program ${index+1})`}`} onRemove={() => handleRemoveItem('projects', index)}>
                {renderTextField('Program ID (e.g. project_urban_forest)', `projects.${index}.id`)}
                {renderLocalizedTextField('Title', `projects.${index}.title`)}
                {renderLocalizedTextField('Description (for list page)', `projects.${index}.description`, true)}
                {renderImageField('List Image URL', `projects.${index}.imageUrl`)}
                {renderTextField('List Image Alt Text', `projects.${index}.imageAlt`)}
                <hr className="my-4"/>
                <h4 className="font-semibold text-brand-gray mb-2">Detail Page Banner</h4>
                {renderImageField('Detail Page Banner Image URL', `projects.${index}.detailImageUrl`)}
                <hr className="my-4"/>
                <h4 className="font-semibold text-brand-gray mb-2">Activities</h4>
                <div className="pl-4 border-l-2">
                {project.activities?.map((activity, actIndex) => (
                    <ListItemWrapper nested key={activity.id} title={`Activity: ${activity.title?.en || `(Activity ${actIndex+1})`}`} onRemove={() => handleRemoveItem(`projects.${index}.activities`, actIndex)}>
                        {renderTextField('Activity ID (e.g. activity_urban_forest_1)', `projects.${index}.activities.${actIndex}.id`)}
                        {renderTextField('Date', `projects.${index}.activities.${actIndex}.date`, false, 'date')}
                        {renderLocalizedTextField('Title', `projects.${index}.activities.${actIndex}.title`)}
                        {renderLocalizedTextField('Description', `projects.${index}.activities.${actIndex}.description`, true)}
                        {renderImageField('Image URL', `projects.${index}.activities.${actIndex}.imageUrl`)}
                    </ListItemWrapper>
                ))}
                <button onClick={() => handleAddItem(`projects.${index}.activities`, newProjectActivityTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">Add New Activity</button>
                </div>
            </ListItemWrapper>
            ))}
            <button onClick={() => handleAddItem('projects', newProjectTemplate)} className="mt-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2 px-4 rounded">{t('addNewProject')}</button>
        </AdminSection>
            <AdminSection title="Program Detail Page">
            {renderLocalizedTextField('Back to Programs Button', 'projectDetailPage.backToProjects')}
        </AdminSection>
    </>
});

const TeamTab = React.memo(({data, handlers}: {data: PageContent, handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, t } = handlers;
    const newTeamMemberTemplate: Omit<TeamMember, 'id'> = { name: { en: '', es: '' }, role: { en: '', es: '' }, bio: { en: '', es: '' }, imageUrl: '', imageAlt: '' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabTeam')}</h2>
        <AdminSection title={t('sectionBanner')}>
            {renderLocalizedTextField('Title', 'teamPage.banner.title')}
            {renderImageField('Image URL', 'teamPage.banner.imageUrl')}
        </AdminSection>
        <AdminSection title="Team Members">
            {data.team?.map((member, index) => (
                <ListItemWrapper key={member.id} title={member.name.en || `Member ${index+1}`} onRemove={() => handleRemoveItem('team', index)}>
                    {renderTextField('Member ID', `team.${index}.id`)}
                    {renderLocalizedTextField('Name', `team.${index}.name`)}
                    {renderLocalizedTextField('Role', `team.${index}.role`)}
                    {renderLocalizedTextField('Bio', `team.${index}.bio`, true)}
                    {renderImageField('Image URL', `team.${index}.imageUrl`)}
                    {renderTextField('Image Alt Text', `team.${index}.imageAlt`)}
                </ListItemWrapper>
            ))}
            <button onClick={() => handleAddItem('team', newTeamMemberTemplate)} className="mt-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2 px-4 rounded">{t('addNewTeamMember')}</button>
        </AdminSection>
    </>
});

const BlogTab = React.memo(({data, handlers}: {data: PageContent, handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, t } = handlers;
    const newBlogPostTemplate: Omit<BlogPost, 'id'> = { slug: '', title: { en: '', es: '' }, author: '', date: new Date().toISOString().split('T')[0], summary: { en: '', es: '' }, content: { en: '', es: '' }, imageUrl: '', imageAlt: '' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabBlog')}</h2>
        <AdminSection title={t('sectionBanner')}>
            {renderLocalizedTextField('Title', 'blogPage.banner.title')}
            {renderImageField('Image URL', 'blogPage.banner.imageUrl')}
        </AdminSection>
        <AdminSection title="Page Titles">
            {renderLocalizedTextField('Featured Post Title', 'blogPage.featuredPostTitle')}
            {renderLocalizedTextField('Recent Posts Title', 'blogPage.recentPostsTitle')}
            {renderLocalizedTextField('Share Post Title', 'blogPage.sharePostTitle')}
        </AdminSection>
        <AdminSection title="Blog Posts">
            {data.blog?.map((post, index) => (
                <ListItemWrapper key={post.id} title={post.title.en || `Post ${index+1}`} onRemove={() => handleRemoveItem('blog', index)}>
                    {renderTextField('Post ID', `blog.${index}.id`)}
                    {renderTextField('URL Slug', `blog.${index}.slug`)}
                    {renderLocalizedTextField('Title', `blog.${index}.title`)}
                    {renderTextField('Author', `blog.${index}.author`)}
                    {renderTextField('Date', `blog.${index}.date`, false, 'date')}
                    {renderLocalizedTextField('Summary', `blog.${index}.summary`, true)}
                    {renderLocalizedTextField('Content', `blog.${index}.content`, true)}
                    {renderImageField('Image URL', `blog.${index}.imageUrl`)}
                    {renderTextField('Image Alt Text', `blog.${index}.imageAlt`)}
                </ListItemWrapper>
            ))}
            <button onClick={() => handleAddItem('blog', newBlogPostTemplate)} className="mt-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2 px-4 rounded">{t('addNewPost')}</button>
        </AdminSection>
    </>
});

const ContactTab = React.memo(({data, handlers}: {data: PageContent['contactPage'], handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, t } = handlers;
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabContact')}</h2>
        <AdminSection title={t('sectionBanner')}>
            {renderLocalizedTextField('Title', 'contactPage.banner.title')}
            {renderImageField('Image URL', 'contactPage.banner.imageUrl')}
        </AdminSection>
        <AdminSection title={t('sectionIntro')}>
            {renderLocalizedTextField('Intro Text', 'contactPage.intro', true)}
        </AdminSection>
        <AdminSection title="Contact Info Titles">
            {renderLocalizedTextField('Address Title', 'contactPage.addressTitle')}
            {renderLocalizedTextField('Phone Title', 'contactPage.phoneTitle')}
            {renderLocalizedTextField('Email Title', 'contactPage.emailTitle')}
        </AdminSection>
            <AdminSection title={t('sectionForm')}>
            {renderLocalizedTextField('Form Title', 'contactPage.form.title')}
            {renderLocalizedTextField('Name Label', 'contactPage.form.nameLabel')}
            {renderLocalizedTextField('Email Label', 'contactPage.form.emailLabel')}
            {renderLocalizedTextField('Message Label', 'contactPage.form.messageLabel')}
            {renderLocalizedTextField('Button Text', 'contactPage.form.buttonText')}
        </AdminSection>
    </>
});

const DonateTab = React.memo(({data, handlers}: {data: PageContent['donatePage'], handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, t } = handlers;
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabDonate')}</h2>
        <AdminSection title={t('sectionBanner')}>
            {renderLocalizedTextField('Title', 'donatePage.banner.title')}
            {renderImageField('Image URL', 'donatePage.banner.imageUrl')}
        </AdminSection>
        <AdminSection title={t('sectionIntro')}>
            {renderLocalizedTextField('Intro Text', 'donatePage.intro', true)}
        </AdminSection>
        <AdminSection title="Donation Form">
            {renderLocalizedTextField('Choose Amount Label', 'donatePage.form.chooseAmount')}
            {renderLocalizedTextField('Custom Amount Label', 'donatePage.form.customAmount')}
            {renderLocalizedTextField('First Name Label', 'donatePage.form.firstName')}
            {renderLocalizedTextField('Last Name Label', 'donatePage.form.lastName')}
            {renderLocalizedTextField('Email Label', 'donatePage.form.emailAddress')}
            {renderLocalizedTextField('Payment Placeholder', 'donatePage.form.paymentPlaceholder')}
            {renderLocalizedTextField('Donate Button Text', 'donatePage.form.donateAmount')}
        </AdminSection>
            <AdminSection title="Thank You Message">
            {renderLocalizedTextField('Title', 'donatePage.thankYou.title')}
            {renderLocalizedTextField('Text', 'donatePage.thankYou.text', true)}
        </AdminSection>
    </>
});


export default AdminPage;