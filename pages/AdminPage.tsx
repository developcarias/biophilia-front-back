


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PageContent, Project, TeamMember, BlogPost, NavLink, ValueItem, HeroSlide, AlliancePartner, ContentBlockType, ProjectActivity, Statistic, User, SocialLink, LocalizedText } from '../types';
import { useTranslate, TranslationKey } from '../i18n';
import { produce } from 'immer';
import PageBanner from '../components/PageBanner';
import { useAdmin } from '../components/AdminContext';
import DragHandleIcon from '../components/icons/DragHandleIcon';

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

    const fetchUsers = useCallback(async () => {
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
    }, [apiUrl]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
                    const newItem = typeof newItemTemplate === 'string' ? newItemTemplate : { ...newItemTemplate, id, display_order: current[pathParts[i]].length };
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

  const handleDragAndDrop = useCallback((path: string, draggedIndex: number, dropIndex: number) => {
    setFormData(produce(draft => {
      const keys = path.split('.');
      let current: any = draft;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const list = current[keys[keys.length - 1]];
      
      if (Array.isArray(list)) {
        const [draggedItem] = list.splice(draggedIndex, 1);
        list.splice(dropIndex, 0, draggedItem);
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

  // RENDER HELPERS - Pass value directly to remove formData dependency and optimize
  const renderTextField = useCallback((labelKey: TranslationKey | string, path: string, value: string, isTextarea: boolean = false, type: string = 'text') => {
    const label = t(labelKey as TranslationKey, {});
    const displayLabel = label === labelKey ? labelKey : label;
    const InputComponent = isTextarea ? 'textarea' : 'input';
    return (
      <div className="mb-4">
        <label className="block text-brand-gray text-sm font-bold mb-2">{displayLabel}</label>
        <InputComponent
          type={type}
          value={value || ''}
          onChange={(e) => handleInputChange(path, e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
          rows={isTextarea ? 10 : undefined}
        />
      </div>
    );
  }, [handleInputChange, t]);
  
  const renderImageField = useCallback((label: string, path: string, value: string) => {
    return (
      <div className="mb-4">
          <label className="block text-brand-gray text-sm font-bold mb-2">{label}</label>
          <div className="flex items-center">
              <input
                  type="text"
                  value={value || ''}
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
  )}, [handleInputChange, openMediaLibrary]);

  const renderLocalizedTextField = useCallback((baseLabel: string, basePath: string, value: LocalizedText, isTextarea: boolean = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTextField(`${baseLabel} (EN)`, `${basePath}.en`, value?.en, isTextarea)}
        {renderTextField(`${baseLabel} (ES)`, `${basePath}.es`, value?.es, isTextarea)}
    </div>
  ), [renderTextField]);
  
  const handlers = useMemo(() => ({
    handleAddItem,
    handleRemoveItem,
    handleDragAndDrop,
    renderTextField,
    renderLocalizedTextField,
    renderImageField,
    t
  }), [handleAddItem, handleRemoveItem, handleDragAndDrop, renderTextField, renderLocalizedTextField, renderImageField, t]);
  
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
const AdminSection: React.FC<{ titleKey: TranslationKey; children: React.ReactNode }> = ({ titleKey, children }) => {
    const t = useTranslate();
    return (
        <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold text-brand-green-dark mb-4">{t(titleKey)}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
};

interface DraggableListProps {
    items: any[];
    path: string;
    onDrop: (path: string, draggedIndex: number, dropIndex: number) => void;
    renderItem: (item: any, index: number) => React.ReactNode;
}

const DraggableList: React.FC<DraggableListProps> = ({ items, path, onDrop, renderItem }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            onDrop(path, dragItem.current, dragOverItem.current);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div>
            {items?.map((item, index) => (
                <div
                    key={item.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="mb-2"
                >
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
};

const ListItemWrapper: React.FC<{ title: string; onRemove: () => void; children: React.ReactNode; nested?: boolean }> = ({ title, onRemove, children, nested=false }) => (
    <div className={`border p-4 rounded relative flex items-start space-x-4 ${nested ? 'bg-gray-50 shadow-sm' : 'bg-white shadow'}`}>
        <div className="flex-shrink-0 pt-1 text-gray-400 cursor-move">
            <DragHandleIcon />
        </div>
        <div className="flex-grow">
            <h4 className="font-bold mb-2 text-brand-gray">{title}</h4>
            {children}
        </div>
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
        {renderImageField('Logo URL', 'global.logoUrl', data.logoUrl)}
        <AdminSection titleKey="sectionNavigation">
            {data?.navigation?.map((link: NavLink, index: number) => (
                <ListItemWrapper key={link.id} title={link.label.en || `Link ${index+1}`} onRemove={() => handleRemoveItem('global.navigation', index)}>
                    {renderTextField('URL Path (e.g., /about)', `global.navigation.${index}.to`, link.to)}
                    {renderLocalizedTextField('Label', `global.navigation.${index}.label`, link.label)}
                </ListItemWrapper>
            ))}
             <button onClick={() => handleAddItem('global.navigation', newNavLinkTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewLink')}</button>
        </AdminSection>
        <AdminSection titleKey="sectionSocial">
            {data?.socialLinks?.map((link: SocialLink, index: number) => (
                 <ListItemWrapper key={index} title={link.id} onRemove={() => handleRemoveItem('global.socialLinks', index)}>
                    {renderTextField('Platform (facebook, instagram, linkedin, twitter)', `global.socialLinks.${index}.id`, link.id)}
                    {renderTextField('URL', `global.socialLinks.${index}.url`, link.url)}
                 </ListItemWrapper>
            ))}
            <button onClick={() => handleAddItem('global.socialLinks', newSocialLinkTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewLink')}</button>
        </AdminSection>
        <AdminSection titleKey="sectionFooter">
            {renderLocalizedTextField('Slogan', 'global.footer.slogan', data.footer?.slogan)}
            {renderLocalizedTextField('Copyright', 'global.footer.copyright', data.footer?.copyright)}
            {renderTextField('Address', 'global.footer.contact.address', data.footer?.contact?.address)}
            {renderTextField('Email', 'global.footer.contact.email', data.footer?.contact?.email)}
        </AdminSection>
    </>
});

const HomeTab = React.memo(({data, handlers}: {data: PageContent['homePage'], handlers: any}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, handleDragAndDrop, t } = handlers;
    const newHeroSlideTemplate: Omit<HeroSlide, 'id'> = { title: { en: '', es: '' }, subtitle: { en: '', es: '' }, imageUrl: '', projectId: '', activityId: '' };
    const newValueItemTemplate: Omit<ValueItem, 'id'> = { title: { en: '', es: '' }, slogan: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '' };
    const newStatTemplate: Omit<Statistic, 'id'> = { iconUrl: 'https://img.icons8.com/ios-glyphs/90/ffffff/deciduous-tree.png', value: '0', label: { en: '', es: '' }, backgroundImages: [] };
    const newAlliancePartnerTemplate: Omit<AlliancePartner, 'id'> = { name: '', logoUrl: '' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabHome')}</h2>
        <AdminSection titleKey="sectionHero">
            <DraggableList
                items={data?.heroSlides || []}
                path="homePage.heroSlides"
                onDrop={handleDragAndDrop}
                renderItem={(slide: HeroSlide, index: number) => (
                    <ListItemWrapper key={slide.id} title={`Slide: ${slide.title?.en || `(Slide ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.heroSlides', index)}>
                        {renderLocalizedTextField('Title', `homePage.heroSlides.${index}.title`, slide.title)}
                        {renderLocalizedTextField('Subtitle', `homePage.heroSlides.${index}.subtitle`, slide.subtitle, true)}
                        {renderImageField('Image URL', `homePage.heroSlides.${index}.imageUrl`, slide.imageUrl)}
                        {renderTextField('Program ID (optional)', `homePage.heroSlides.${index}.projectId`, slide.projectId)}
                        {renderTextField('Activity ID (optional)', `homePage.heroSlides.${index}.activityId`, slide.activityId)}
                    </ListItemWrapper>
                )}
            />
            <button onClick={() => handleAddItem('homePage.heroSlides', newHeroSlideTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection titleKey="sectionWelcome">
            {renderLocalizedTextField('Title Part 1', 'homePage.welcome.titlePart1', data.welcome?.titlePart1)}
            {renderLocalizedTextField('Title Part 2', 'homePage.welcome.titlePart2', data.welcome?.titlePart2)}
            {renderLocalizedTextField('Slogan', 'homePage.welcome.slogan', data.welcome?.slogan)}
            {renderLocalizedTextField('Text', 'homePage.welcome.text', data.welcome?.text, true)}
            {renderImageField('Image URL', 'homePage.welcome.imageUrl', data.welcome?.imageUrl)}
            {renderTextField('Image Alt Text', 'homePage.welcome.imageAlt', data.welcome?.imageAlt)}
        </AdminSection>
        <AdminSection titleKey="sectionActionLines">
            {renderLocalizedTextField('Section Title', 'homePage.actionLines.title', data.actionLines?.title)}
            <DraggableList
                items={data?.actionLines?.items || []}
                path="homePage.actionLines.items"
                onDrop={handleDragAndDrop}
                renderItem={(item: ValueItem, index: number) => (
                    <ListItemWrapper key={item.id} title={`Action Line: ${item.title?.en || `(Item ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.actionLines.items', index)}>
                        {renderLocalizedTextField('Title', `homePage.actionLines.items.${index}.title`, item.title)}
                        {renderLocalizedTextField('Slogan', `homePage.actionLines.items.${index}.slogan`, item.slogan)}
                        {renderLocalizedTextField('Text', `homePage.actionLines.items.${index}.text`, item.text, true)}
                        {renderImageField('Image URL', `homePage.actionLines.items.${index}.imageUrl`, item.imageUrl)}
                    </ListItemWrapper>
                )}
            />
            <button onClick={() => handleAddItem('homePage.actionLines.items', newValueItemTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
         <AdminSection titleKey="sectionLatestProjects">
            {renderLocalizedTextField('Title', 'homePage.latestProjects.title', data.latestProjects?.title)}
            {renderLocalizedTextField('Slogan', 'homePage.latestProjects.slogan', data.latestProjects?.slogan)}
            {renderLocalizedTextField('Subtitle', 'homePage.latestProjects.subtitle', data.latestProjects?.subtitle, true)}
        </AdminSection>
        <AdminSection titleKey="sectionParallax">
            {renderLocalizedTextField('Parallax 1 Title', 'homePage.parallax1.title', data.parallax1?.title)}
            {renderLocalizedTextField('Parallax 1 Text', 'homePage.parallax1.text', data.parallax1?.text, true)}
            {renderImageField('Parallax 1 Image URL', 'homePage.parallax1.imageUrl', data.parallax1?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionOurNumbers">
          {renderLocalizedTextField('Section Title', 'homePage.ourNumbers.title', data.ourNumbers?.title)}
          <DraggableList
            items={data?.ourNumbers?.stats || []}
            path="homePage.ourNumbers.stats"
            onDrop={handleDragAndDrop}
            renderItem={(item: Statistic, index: number) => (
              <ListItemWrapper key={item.id} title={`Stat: ${item.label?.en || `(Item ${index + 1})`}`} onRemove={() => handleRemoveItem('homePage.ourNumbers.stats', index)}>
                {renderImageField('Icon URL', `homePage.ourNumbers.stats.${index}.iconUrl`, item.iconUrl)}
                {renderTextField('Value (e.g., 50+)', `homePage.ourNumbers.stats.${index}.value`, item.value)}
                {renderLocalizedTextField('Label', `homePage.ourNumbers.stats.${index}.label`, item.label)}
                
                <div className="mt-4 border-t pt-4">
                    <h5 className="font-semibold text-gray-600 mb-2">Background Images (for rotating carousel)</h5>
                    
                    {/* FIX: Simplified backgroundImages mapping to align with its defined type (string[] | undefined) and resolve a TypeScript error. */}
                    {(item.backgroundImages || []).map((bgUrl: string, bgIndex: number) => (
                        <div key={bgIndex} className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded-lg shadow-sm">
                            <div className="flex-grow">
                                {renderImageField(`Image ${bgIndex + 1}`, `homePage.ourNumbers.stats.${index}.backgroundImages.${bgIndex}`, bgUrl)}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(`homePage.ourNumbers.stats.${index}.backgroundImages`, bgIndex)}
                                className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-md hover:bg-red-700 transition-colors flex-shrink-0"
                            >
                                {t('remove')}
                            </button>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={() => handleAddItem(`homePage.ourNumbers.stats.${index}.backgroundImages`, '')}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 text-sm rounded"
                    >
                        Add Background Image
                    </button>
                </div>
              </ListItemWrapper>
            )}
          />
          <button onClick={() => handleAddItem('homePage.ourNumbers.stats', newStatTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
        <AdminSection titleKey="sectionAlliances">
            {renderLocalizedTextField('Title', 'homePage.alliances.title', data.alliances?.title)}
            {renderLocalizedTextField('Description', 'homePage.alliances.description', data.alliances?.description, true)}
            <DraggableList
                items={data?.alliances?.partners || []}
                path="homePage.alliances.partners"
                onDrop={handleDragAndDrop}
                renderItem={(item: AlliancePartner, index: number) => (
                    <ListItemWrapper key={item.id} title={`Partner: ${item.name || `(Item ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.alliances.partners', index)}>
                        {renderTextField('Name', `homePage.alliances.partners.${index}.name`, item.name)}
                        {renderImageField('Logo URL', `homePage.alliances.partners.${index}.logoUrl`, item.logoUrl)}
                    </ListItemWrapper>
                )}
            />
            <button onClick={() => handleAddItem('homePage.alliances.partners', newAlliancePartnerTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
         <AdminSection titleKey="sectionParallax">
            {renderLocalizedTextField('Parallax 2 Title', 'homePage.parallax2.title', data.parallax2?.title)}
            {renderLocalizedTextField('Parallax 2 Text', 'homePage.parallax2.text', data.parallax2?.text, true)}
            {renderImageField('Parallax 2 Image URL', 'homePage.parallax2.imageUrl', data.parallax2?.imageUrl)}
        </AdminSection>
    </>
});

const ContentBlockEditor: React.FC<{basePath: string, data: ContentBlockType, handlers: any}> = ({ basePath, data, handlers }) => {
    const { renderLocalizedTextField, renderImageField, renderTextField } = handlers;
    return <>
        {renderLocalizedTextField('Title', `${basePath}.title`, data?.title)}
        {renderLocalizedTextField('Text', `${basePath}.text`, data?.text, true)}
        {renderImageField('Image URL', `${basePath}.imageUrl`, data?.imageUrl)}
        {renderTextField('Image Alt Text', `${basePath}.imageAlt`, data?.imageAlt)}
    </>
}

const AboutTab = React.memo(({data, handlers}: {data: PageContent['aboutPage'], handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, handleDragAndDrop } = handlers;
    const newValueItemTemplate: Omit<ValueItem, 'id'> = { title: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '', icon: '' };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabAbout')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'aboutPage.banner.title', data.banner?.title)}
            {renderImageField('Image URL', 'aboutPage.banner.imageUrl', data.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionHistory">
            {renderLocalizedTextField('Title', 'aboutPage.history.title', data.history?.title)}
            {renderLocalizedTextField('Text', 'aboutPage.history.text', data.history?.text, true)}
            {renderImageField('Image URL', 'aboutPage.history.imageUrl', data.history?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionMission">
            <ContentBlockEditor basePath="aboutPage.mission" data={data.mission} handlers={handlers} />
        </AdminSection>
        <AdminSection titleKey="sectionVision">
            <ContentBlockEditor basePath="aboutPage.vision" data={data.vision} handlers={handlers} />
        </AdminSection>
        <AdminSection titleKey="sectionWork">
            <ContentBlockEditor basePath="aboutPage.work" data={data.work} handlers={handlers} />
        </AdminSection>
        <AdminSection titleKey="sectionValues">
            {renderLocalizedTextField('Section Title', 'aboutPage.values.title', data.values?.title)}
             <DraggableList
                items={data?.values?.items || []}
                path="aboutPage.values.items"
                onDrop={handleDragAndDrop}
                renderItem={(item: ValueItem, index: number) => (
                    <ListItemWrapper key={item.id} title={`Value: ${item.title?.en || `(Item ${index+1})`}`} onRemove={() => handleRemoveItem('aboutPage.values.items', index)}>
                        {renderLocalizedTextField('Title', `aboutPage.values.items.${index}.title`, item.title)}
                        {renderLocalizedTextField('Text', `aboutPage.values.items.${index}.text`, item.text, true)}
                        {renderImageField('Image URL', `aboutPage.values.items.${index}.imageUrl`, item.imageUrl)}
                        {renderTextField('Icon Name (e.g., ValueCollaborationIcon)', `aboutPage.values.items.${index}.icon`, item.icon)}
                    </ListItemWrapper>
                )}
            />
            <button onClick={() => handleAddItem('aboutPage.values.items', newValueItemTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
        </AdminSection>
    </>
});

const ProjectsTab = React.memo(({data, handlers}: {data: PageContent, handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, handleDragAndDrop } = handlers;
    const newProjectTemplate: Omit<Project, 'id' | 'activities'> = { title: { en: '', es: '' }, description: { en: '', es: '' }, detailDescription: { en: '', es: '' }, imageUrl: '', imageAlt: '', detailImageUrl: '', display_order: 0 };
    const newActivityTemplate: Omit<ProjectActivity, 'id'> = { date: new Date().toISOString().split('T')[0], title: { en: '', es: '' }, description: { en: '', es: '' }, imageUrl: '', display_order: 0 };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabProjects')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'projectsPage.banner.title', data.projectsPage?.banner?.title)}
            {renderImageField('Image URL', 'projectsPage.banner.imageUrl', data.projectsPage?.banner?.imageUrl)}
            {renderLocalizedTextField('Slogan', 'projectsPage.slogan', data.projectsPage?.slogan)}
            {renderLocalizedTextField('Intro Text', 'projectsPage.intro', data.projectsPage?.intro, true)}
        </AdminSection>
        {/* FIX: Replaced invalid translation key 'projectDetailPage' with 'sectionProjectDetail'. */}
        <AdminSection titleKey="sectionProjectDetail">
             {renderLocalizedTextField('Back to Programs Button', 'projectDetailPage.backToProjects', data.projectDetailPage?.backToProjects)}
        </AdminSection>

        <AdminSection titleKey="tabProjects">
            <DraggableList
                items={data?.projects || []}
                path="projects"
                onDrop={handleDragAndDrop}
                renderItem={(project: Project, projIndex: number) => (
                    <ListItemWrapper key={project.id} title={`Program: ${project.title?.en || `(Program ${projIndex+1})`}`} onRemove={() => handleRemoveItem('projects', projIndex)}>
                        {renderTextField('ID (must be unique)', `projects.${projIndex}.id`, project.id)}
                        {renderLocalizedTextField('Title', `projects.${projIndex}.title`, project.title)}
                        {renderLocalizedTextField('Description', `projects.${projIndex}.description`, project.description, true)}
                        {renderLocalizedTextField('Detail Page Description', `projects.${projIndex}.detailDescription`, project.detailDescription, true)}
                        {renderImageField('Image URL (Card)', `projects.${projIndex}.imageUrl`, project.imageUrl)}
                        {renderTextField('Image Alt Text', `projects.${projIndex}.imageAlt`, project.imageAlt)}
                        {renderImageField('Image URL (Detail Page Banner)', `projects.${projIndex}.detailImageUrl`, project.detailImageUrl)}
                        
                        <div className="mt-4 border-t pt-4">
                            <h5 className="font-semibold text-gray-600 mb-2">Activities</h5>
                             <DraggableList
                                items={project.activities || []}
                                path={`projects.${projIndex}.activities`}
                                onDrop={handleDragAndDrop}
                                renderItem={(activity: ProjectActivity, actIndex: number) => (
                                    <ListItemWrapper key={activity.id} title={`Activity: ${activity.title?.en || `(Activity ${actIndex+1})`}`} onRemove={() => handleRemoveItem(`projects.${projIndex}.activities`, actIndex)} nested>
                                        {renderTextField('Date', `projects.${projIndex}.activities.${actIndex}.date`, activity.date, false, 'date')}
                                        {renderLocalizedTextField('Title', `projects.${projIndex}.activities.${actIndex}.title`, activity.title)}
                                        {renderLocalizedTextField('Description', `projects.${projIndex}.activities.${actIndex}.description`, activity.description, true)}
                                        {renderImageField('Image URL', `projects.${projIndex}.activities.${actIndex}.imageUrl`, activity.imageUrl)}
                                    </ListItemWrapper>
                                )}
                            />
                            <button onClick={() => handleAddItem(`projects.${projIndex}.activities`, newActivityTemplate)} className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
                        </div>
                    </ListItemWrapper>
                )}
            />
            <button onClick={() => handleAddItem('projects', newProjectTemplate)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">{t('addNewProject')}</button>
        </AdminSection>
    </>
});

const TeamTab = React.memo(({data, handlers}: {data: PageContent, handlers: any}) => {
     const { t, renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem, handleDragAndDrop } = handlers;
    const newTeamMemberTemplate: Omit<TeamMember, 'id'> = { name: { en: '', es: '' }, role: { en: '', es: '' }, bio: { en: '', es: '' }, imageUrl: '', imageAlt: '', display_order: 0 };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabTeam')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'teamPage.banner.title', data.teamPage?.banner?.title)}
            {renderImageField('Image URL', 'teamPage.banner.imageUrl', data.teamPage?.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="tabTeam">
            <DraggableList
                items={data?.team || []}
                path="team"
                onDrop={handleDragAndDrop}
                renderItem={(member: TeamMember, index: number) => (
                    <ListItemWrapper key={member.id} title={`Member: ${member.name?.en || `(Member ${index+1})`}`} onRemove={() => handleRemoveItem('team', index)}>
                        {renderLocalizedTextField('Name', `team.${index}.name`, member.name)}
                        {renderLocalizedTextField('Role', `team.${index}.role`, member.role)}
                        {renderLocalizedTextField('Bio', `team.${index}.bio`, member.bio, true)}
                        {renderImageField('Image URL', `team.${index}.imageUrl`, member.imageUrl)}
                        {renderTextField('Image Alt Text', `team.${index}.imageAlt`, member.imageAlt)}
                    </ListItemWrapper>
                )}
            />
            <button onClick={() => handleAddItem('team', newTeamMemberTemplate)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">{t('addNewTeamMember')}</button>
        </AdminSection>
    </>
});

const BlogTab = React.memo(({data, handlers}: {data: PageContent, handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField, renderTextField, handleAddItem, handleRemoveItem } = handlers;
    const newPostTemplate: Omit<BlogPost, 'id'> = { slug: '', title: { en: '', es: '' }, author: '', date: new Date().toISOString().split('T')[0], summary: { en: '', es: '' }, content: { en: '', es: '' }, imageUrl: '', imageAlt: '' };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabBlog')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'blogPage.banner.title', data.blogPage?.banner?.title)}
            {renderImageField('Image URL', 'blogPage.banner.imageUrl', data.blogPage?.banner?.imageUrl)}
            {renderLocalizedTextField('Featured Post Title', 'blogPage.featuredPostTitle', data.blogPage?.featuredPostTitle)}
            {renderLocalizedTextField('Recent Posts Title', 'blogPage.recentPostsTitle', data.blogPage?.recentPostsTitle)}
            {renderLocalizedTextField('Share Post Title', 'blogPage.sharePostTitle', data.blogPage?.sharePostTitle)}
        </AdminSection>
        <AdminSection titleKey="tabBlog">
            {(data?.blog || []).map((post: BlogPost, index: number) => (
                <div key={post.id} className="border p-4 rounded bg-white shadow mb-2 relative">
                     <h4 className="font-bold mb-2 text-brand-gray">{`Post: ${post.title?.en || `(Post ${index+1})`}`}</h4>
                     {renderTextField('Slug', `blog.${index}.slug`, post.slug)}
                     {renderLocalizedTextField('Title', `blog.${index}.title`, post.title)}
                     {renderTextField('Author', `blog.${index}.author`, post.author)}
                     {renderTextField('Date', `blog.${index}.date`, post.date, false, 'date')}
                     {renderLocalizedTextField('Summary', `blog.${index}.summary`, post.summary, true)}
                     {renderLocalizedTextField('Content', `blog.${index}.content`, post.content, true)}
                     {renderImageField('Image URL', `blog.${index}.imageUrl`, post.imageUrl)}
                     {renderTextField('Image Alt Text', `blog.${index}.imageAlt`, post.imageAlt)}
                     <button onClick={() => handleRemoveItem('blog', index)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded">Remove</button>
                </div>
            ))}
             <button onClick={() => handleAddItem('blog', newPostTemplate)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">{t('addNewPost')}</button>
        </AdminSection>
    </>
});

const ContactTab = React.memo(({data, handlers}: {data: PageContent['contactPage'], handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField } = handlers;
    return <>
         <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabContact')}</h2>
         <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'contactPage.banner.title', data.banner?.title)}
            {renderImageField('Image URL', 'contactPage.banner.imageUrl', data.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionIntro">
             {renderLocalizedTextField('Text', 'contactPage.intro', data.intro, true)}
        </AdminSection>
        <AdminSection titleKey="sectionForm">
            {renderLocalizedTextField('Address Title', 'contactPage.addressTitle', data.addressTitle)}
            {renderLocalizedTextField('Phone Title', 'contactPage.phoneTitle', data.phoneTitle)}
            {renderLocalizedTextField('Email Title', 'contactPage.emailTitle', data.emailTitle)}
            {renderLocalizedTextField('Form Title', 'contactPage.form.title', data.form?.title)}
            {renderLocalizedTextField('Name Label', 'contactPage.form.nameLabel', data.form?.nameLabel)}
            {renderLocalizedTextField('Email Label', 'contactPage.form.emailLabel', data.form?.emailLabel)}
            {renderLocalizedTextField('Message Label', 'contactPage.form.messageLabel', data.form?.messageLabel)}
            {renderLocalizedTextField('Button Text', 'contactPage.form.buttonText', data.form?.buttonText)}
        </AdminSection>
    </>
});

const DonateTab = React.memo(({data, handlers}: {data: PageContent['donatePage'], handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField } = handlers;
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabDonate')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'donatePage.banner.title', data.banner?.title)}
            {renderImageField('Image URL', 'donatePage.banner.imageUrl', data.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionIntro">
             {renderLocalizedTextField('Text', 'donatePage.intro', data.intro, true)}
        </AdminSection>
        <AdminSection titleKey="sectionForm">
            {renderLocalizedTextField('Choose Amount', 'donatePage.form.chooseAmount', data.form?.chooseAmount)}
            {renderLocalizedTextField('Custom Amount', 'donatePage.form.customAmount', data.form?.customAmount)}
            {renderLocalizedTextField('First Name', 'donatePage.form.firstName', data.form?.firstName)}
            {renderLocalizedTextField('Last Name', 'donatePage.form.lastName', data.form?.lastName)}
            {renderLocalizedTextField('Email Address', 'donatePage.form.emailAddress', data.form?.emailAddress)}
            {renderLocalizedTextField('Payment Placeholder', 'donatePage.form.paymentPlaceholder', data.form?.paymentPlaceholder)}
            {renderLocalizedTextField('Donate Button Text (use {{amount}})', 'donatePage.form.donateAmount', data.form?.donateAmount)}
        </AdminSection>
        {/* FIX: Replaced invalid translation key 'thankYou' with 'sectionThankYou'. */}
        <AdminSection titleKey="sectionThankYou">
            {renderLocalizedTextField('Thank You Title', 'donatePage.thankYou.title', data.thankYou?.title)}
            {renderLocalizedTextField('Thank You Text (use {{amount}})', 'donatePage.thankYou.text', data.thankYou?.text)}
        </AdminSection>
    </>
});

export default AdminPage;