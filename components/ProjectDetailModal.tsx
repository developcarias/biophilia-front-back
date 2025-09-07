
import React, { useEffect } from 'react';
import { Project } from '../types';
import { useI18n } from '../i18n';
import CloseIcon from './icons/CloseIcon';
import Editable from './Editable';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  basePath: string;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, basePath }) => {
  const { language } = useI18n();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition-colors z-10" aria-label="Close modal">
          <CloseIcon />
        </button>
        <div className="overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <img src={project.detailImageUrl} alt={project.title[language]} className="w-full h-auto object-cover rounded-lg shadow-md" />
            <div className="prose max-w-none text-brand-gray">
              <Editable localizedText={project.title} basePath={`${basePath}.title`}>
                <h2 id="project-modal-title" className="text-2xl md:text-3xl font-bold text-brand-green-dark mt-0 mb-4">{project.title[language]}</h2>
              </Editable>
              {/* FIX: Replaced non-existent 'details' property with 'description' to match the Project type. */}
              <Editable localizedText={project.description} basePath={`${basePath}.description`} multiline>
                <p className="whitespace-pre-line leading-relaxed">{project.description[language]}</p>
              </Editable>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;

// Add this basic fade-in animation to a style tag or your global CSS if you have one.
// For this project structure, we can add it directly to the index.html head for simplicity.
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);