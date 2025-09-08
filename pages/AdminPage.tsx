

import React, { useState, useEffect } from 'react';
import { PageContent, Project, TeamMember, BlogPost, NavLink, ValueItem, HeroSlide, AlliancePartner, ContentBlockType, ProjectActivity, Statistic } from '../types';
import { useTranslate, TranslationKey } from '../i18n';
import { produce } from 'immer';
import PageBanner from '../components/PageBanner';

interface MediaFile {
  name: string;
  url: string;
}

interface MediaLibraryProps {
  apiUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ apiUrl, onSelect, onClose }) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/media`);
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error("Failed to fetch media:", error);
            alert("Failed to load media library.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [apiUrl]);
    
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);

      try {
        const response = await fetch(`${apiUrl}/api/media/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        fetchMedia(); // Refresh list after upload
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };

    const handleDelete = async (filename: string) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}? This cannot be undone.`)) return;

        try {
            const response = await fetch(`${apiUrl}/api/media/${filename}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete failed');
            fetchMedia(); // Refresh list after delete
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete failed. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-brand-green-dark">Media Library</h3>
                    <div className="flex items-center space-x-4">
                        <label className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2 px-4 rounded cursor-pointer">
                            {isUploading ? 'Uploading...' : 'Upload New Image'}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} accept="image/*" />
                        </label>
                        <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? <p>Loading media...</p> : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {files.map(file => (
                                <div key={file.name} className="relative group border rounded-lg overflow-hidden">
                                    <img src={file.url} alt={file.name} className="w-full h-32 object-contain bg-gray-100" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col items-center justify-center p-2">
                                        <p className="text-xs text-white break-all text-center opacity-0 group-hover:opacity-100 transition-opacity">{file.name}</p>
                                        <div className="mt-2 space-x-2">
                                           <button onClick={() => { onSelect(file.url); onClose(); }} className="text-xs bg-blue-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Select</button>
                                           <button onClick={() => handleDelete(file.name)} className="text-xs bg-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AdminPageProps {
  content: PageContent;
  onUpdateContent: (newContent: PageContent) => Promise<boolean>;
  apiUrl: string;
}

type AdminTab = 'global' | 'home' | 'about' | 'projects' | 'team' | 'blog' | 'contact' | 'donate';

const AdminPage: React.FC<AdminPageProps> = ({ content, onUpdateContent, apiUrl }) => {
  const [formData, setFormData] = useState<PageContent>(JSON.parse(JSON.stringify(content)));
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<AdminTab>('global');
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState(''); // path to update with selected media URL
  const t = useTranslate();

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
  ];

  const handleInputChange = (path: string, value: string | boolean) => {
    setFormData(produce(draft => {
      const keys = path.split('.');
      let current: any = draft;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    }));
  };
  
  const handleAddItem = (path: string, newItemTemplate: object) => {
    setFormData(produce(draft => {
        const pathParts = path.split('.');
        let current: any = draft;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        const arrayToModify = current[pathParts[pathParts.length - 1]];
        if (Array.isArray(arrayToModify)) {
            arrayToModify.push({ ...newItemTemplate, id: `new_${Date.now()}` });
        }
    }));
  };

  const handleRemoveItem = (path: string, index: number) => {
    setFormData(produce(draft => {
        const pathParts = path.split('.');
        let arrayToModify: any[];
        let current: any = draft;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        arrayToModify = current[pathParts[pathParts.length-1]];
        arrayToModify.splice(index, 1);
    }));
  };

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

  const handleDiscard = () => {
    setFormData(JSON.parse(JSON.stringify(content)));
  };

  const openMediaLibrary = (path: string) => {
      setMediaTarget(path);
      setIsMediaLibraryOpen(true);
  }

  // RENDER HELPERS
  const renderTextField = (labelKey: TranslationKey | string, path: string, isTextarea: boolean = false) => {
    const keys = path.split('.');
    let value: any = formData;
    for (const key of keys) {
      if (value === undefined || value === null) { value = ''; break; }
      value = value[key];
    }

    const InputComponent = isTextarea ? 'textarea' : 'input';
    const label = t(labelKey as TranslationKey, {});
    const displayLabel = label === labelKey ? labelKey : label;

    return (
      <div className="mb-4">
        <label className="block text-brand-gray text-sm font-bold mb-2">{displayLabel}</label>
        <InputComponent
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(path, e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
          rows={isTextarea ? 10 : undefined}
        />
      </div>
    );
  };
  
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  const renderImageField = (label: string, path: string) => (
      <div className="mb-4">
          <label className="block text-brand-gray text-sm font-bold mb-2">{label}</label>
          <div className="flex items-center">
              <input
                  type="text"
                  value={getNestedValue(formData, path) || ''}
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
  );

  const renderLocalizedTextField = (baseLabel: string, basePath: string, isTextarea: boolean = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTextField(`${baseLabel} (EN)`, `${basePath}.en`, isTextarea)}
        {renderTextField(`${baseLabel} (ES)`, `${basePath}.es`, isTextarea)}
    </div>
  );
  
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
        <button onClick={onRemove} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded">{t('remove')}</button>
    </div>
  );

  // NEW ITEM TEMPLATES
  const newProjectActivityTemplate: Omit<ProjectActivity, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    title: { en: '', es: '' },
    description: { en: '', es: '' },
    imageUrl: ''
  };
  const newProjectTemplate: Omit<Project, 'id'> = { 
    title: { en: '', es: '' }, 
    description: { en: '', es: '' }, 
    imageUrl: '', 
    imageAlt: '', 
    activities: [],
    detailImageUrl: '',
  };
  const newValueItemTemplate: Omit<ValueItem, 'id'> = {
    title: { en: '', es: '' },
    slogan: { en: '', es: '' },
    text: { en: '', es: '' },
    imageUrl: ''
  };
   const newHeroSlideTemplate: Omit<HeroSlide, 'id'> = {
    title: { en: '', es: '' },
    subtitle: { en: '', es: '' },
    imageUrl: '',
    projectId: '',
    activityId: ''
  };
  const newAlliancePartnerTemplate: Omit<AlliancePartner, 'id'> = {
    name: '',
    logoUrl: ''
  };
  const newStatTemplate: Omit<Statistic, 'id'> = {
    icon: 'LeafIcon',
    value: '0',
    label: { en: '', es: '' }
  };
  
  return (
    <>
      {isMediaLibraryOpen && (
          <MediaLibrary 
              apiUrl={apiUrl} 
              onSelect={(url) => handleInputChange(mediaTarget, url)} 
              onClose={() => setIsMediaLibraryOpen(false)} 
          />
      )}
      <PageBanner title={t('adminPanelTitle')} imageUrl="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1920&h=1080&fit=crop" />
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center space-x-4 mb-4 sticky top-[176px] bg-white py-4 z-10 border-b">
            <button onClick={handleSave} disabled={status === 'saving'} className="bg-brand-green-dark hover:bg-brand-green-dark/90 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400">{status === 'saving' ? 'Saving...' : t('saveChanges')}</button>
            <button onClick={handleDiscard} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline">{t('discardChanges')}</button>
            {status === 'success' && <div className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">{t('changesSaved')}</div>}
            {status === 'error' && <div className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg">Save failed.</div>}
          </div>

          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key ? 'border-brand-accent text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t(tab.labelKey)}</button>
              ))}
            </nav>
          </div>

          <div className="bg-brand-green-light p-6 rounded-lg shadow-inner">
            {activeTab === 'home' && (<>
              <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabHome')}</h2>
              <AdminSection title={t('sectionHero')}>
                {formData.homePage.heroSlides.map((slide, index) => (
                    <ListItemWrapper key={slide.id} title={`Slide: ${slide.title.en || `(Slide ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.heroSlides', index)}>
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
                {formData.homePage.actionLines.items.map((item, index) => (
                    <ListItemWrapper key={item.id} title={`Action Line: ${item.title.en || `(Item ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.actionLines.items', index)}>
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
                {formData.homePage.values.items.map((item, index) => (
                    <ListItemWrapper key={item.id} title={`Value: ${item.title.en || `(Value ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.values.items', index)}>
                       {renderLocalizedTextField('Title', `homePage.values.items.${index}.title`)}
                       {renderLocalizedTextField('Text', `homePage.values.items.${index}.text`, true)}
                       {renderImageField('Image URL', `homePage.values.items.${index}.imageUrl`)}
                    </ListItemWrapper>
                ))}
                <button onClick={() => handleAddItem('homePage.values.items', (({ slogan, icon, ...rest }) => rest)(newValueItemTemplate))} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
              </AdminSection>
               <AdminSection title="Our Impact Section">
                {renderLocalizedTextField('Section Title', 'homePage.ourNumbers.title')}
                {formData.homePage.ourNumbers.stats.map((stat, index) => (
                    <ListItemWrapper key={stat.id} title={`Stat: ${stat.label.en || `(Stat ${index+1})`}`} onRemove={() => handleRemoveItem('homePage.ourNumbers.stats', index)}>
                       {renderTextField('Icon Name (e.g., LeafIcon)', `homePage.ourNumbers.stats.${index}.icon`)}
                       {renderTextField('Value (Number)', `homePage.ourNumbers.stats.${index}.value`)}
                       {renderLocalizedTextField('Label', `homePage.ourNumbers.stats.${index}.label`)}
                    </ListItemWrapper>
                ))}
                 <button onClick={() => handleAddItem('homePage.ourNumbers.stats', newStatTemplate)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
                 <h4 className="font-semibold text-brand-gray mt-6 mb-2">Gallery Images</h4>
                 {formData.homePage.ourNumbers.galleryImages.map((image, index) => (
                    <ListItemWrapper key={image.id} title={`Image ${index+1}`} onRemove={() => handleRemoveItem('homePage.ourNumbers.galleryImages', index)}>
                        {renderImageField('Image URL', `homePage.ourNumbers.galleryImages.${index}.url`)}
                        {renderTextField('Alt Text', `homePage.ourNumbers.galleryImages.${index}.alt`)}
                    </ListItemWrapper>
                 ))}
                 <button onClick={() => handleAddItem('homePage.ourNumbers.galleryImages', {url: '', alt: ''})} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 text-sm rounded">{t('addNewItem')}</button>
              </AdminSection>
              <AdminSection title={t('sectionAlliances')}>
                {renderLocalizedTextField('Section Title', `homePage.alliances.title`)}
                {renderLocalizedTextField('Description', `homePage.alliances.description`, true)}
                 <h4 className="font-semibold text-brand-gray mt-6 mb-2">Partners</h4>
                {formData.homePage.alliances.partners.map((partner, index) => (
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
            </>)}
            {activeTab === 'projects' && (<>
                <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabProjects')}</h2>
                <AdminSection title={t('sectionBanner')}>
                    {renderLocalizedTextField('Title', 'projectsPage.banner.title')}
                    {renderImageField('Image URL', 'projectsPage.banner.imageUrl')}
                </AdminSection>
                 <AdminSection title={t('sectionIntro')}>{renderLocalizedTextField('Intro Text', 'projectsPage.intro', true)}</AdminSection>
                <AdminSection title="Program List">
                  {formData.projects.map((project, index) => (
                    <ListItemWrapper key={project.id} title={`Program: ${project.title.en || `(Program ${index+1})`}`} onRemove={() => handleRemoveItem('projects', index)}>
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
                        {project.activities.map((activity, actIndex) => (
                            <ListItemWrapper nested key={activity.id} title={`Activity: ${activity.title.en || `(Activity ${actIndex+1})`}`} onRemove={() => handleRemoveItem(`projects.${index}.activities`, actIndex)}>
                                {renderTextField('Activity ID (e.g. activity_urban_forest_1)', `projects.${index}.activities.${actIndex}.id`)}
                                {renderTextField('Date (YYYY-MM-DD)', `projects.${index}.activities.${actIndex}.date`)}
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
            </>)}
            {/* Other tabs would be here, now using renderImageField instead of renderTextField for URLs */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
