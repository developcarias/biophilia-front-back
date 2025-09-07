import React, { useState } from 'react';
import { LocalizedText } from '../types';
import { generateText } from '../services/geminiService';
import PencilIcon from './icons/PencilIcon';
import CloseIcon from './icons/CloseIcon';
import Spinner from './icons/Spinner';
import { useAdmin } from './AdminContext';

interface EditableProps {
  basePath: string;
  localizedText: LocalizedText;
  children: React.ReactNode;
  multiline?: boolean;
}

const Editable: React.FC<EditableProps> = ({ basePath, localizedText, children, multiline = false }) => {
  const { isLoggedIn, onUpdate } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState<LocalizedText>({ en: '', es: '' });
  const [isLoadingEn, setIsLoadingEn] = useState(false);
  const [isLoadingEs, setIsLoadingEs] = useState(false);

  const handleOpen = () => {
    setEditText(localizedText);
    setIsEditing(true);
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setIsEditing(false);
    document.body.style.overflow = 'unset';
  };

  const handleSave = () => {
    onUpdate(basePath, editText);
    handleClose();
  };
  
  const handleGenerate = async (lang: 'en' | 'es') => {
    const setIsLoading = lang === 'en' ? setIsLoadingEn : setIsLoadingEs;
    setIsLoading(true);
    const prompt = `Rewrite and improve the following text for an environmental non-profit organization. Keep the tone inspiring and concise. Here is the text:\n\n"${editText[lang]}"`;
    try {
        const result = await generateText(prompt, lang);
        setEditText(prev => ({ ...prev, [lang]: result }));
    } catch(e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="relative group/editable">
      {children}
      <button
        onClick={handleOpen}
        className="absolute -top-1 -right-1 z-10 p-1.5 bg-brand-yellow text-brand-green-dark rounded-full shadow-lg opacity-0 group-hover/editable:opacity-100 transition-opacity focus:opacity-100"
        aria-label="Edit content"
      >
        <PencilIcon className="h-4 w-4" />
      </button>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleClose}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-brand-green-dark">Edit Content</h3>
              <button onClick={handleClose} aria-label="Close modal"><CloseIcon /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
                <div>
                    <label className="block text-sm font-bold text-brand-gray mb-1">English</label>
                    <InputComponent 
                        value={editText.en}
                        onChange={(e) => setEditText(prev => ({...prev, en: e.target.value}))}
                        className="shadow-inner appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-gray-50"
                        rows={multiline ? 8 : undefined}
                    />
                    <button onClick={() => handleGenerate('en')} disabled={isLoadingEn} className="mt-2 flex items-center bg-brand-accent text-white text-sm font-bold py-1 px-3 rounded hover:bg-brand-accent/90 disabled:bg-gray-400">
                        {isLoadingEn && <Spinner />} Generate with AI
                    </button>
                </div>
                 <div>
                    <label className="block text-sm font-bold text-brand-gray mb-1">Español</label>
                    <InputComponent 
                        value={editText.es}
                        onChange={(e) => setEditText(prev => ({...prev, es: e.target.value}))}
                        className="shadow-inner appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-gray-50"
                        rows={multiline ? 8 : undefined}
                    />
                    <button onClick={() => handleGenerate('es')} disabled={isLoadingEs} className="mt-2 flex items-center bg-brand-accent text-white text-sm font-bold py-1 px-3 rounded hover:bg-brand-accent/90 disabled:bg-gray-400">
                        {isLoadingEs && <Spinner />} Generar con IA
                    </button>
                </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
                <button onClick={handleClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button onClick={handleSave} className="bg-brand-green-dark hover:bg-brand-green-dark/90 text-white font-bold py-2 px-4 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editable;
