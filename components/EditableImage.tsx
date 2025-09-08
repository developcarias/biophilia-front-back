
import React from 'react';
import { useAdmin } from './AdminContext';
import PencilIcon from './icons/PencilIcon';

interface EditableImageProps {
  src: string;
  alt: string;
  basePath: string;
  className?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({ src, alt, basePath, className }) => {
  const { isLoggedIn, openMediaLibrary } = useAdmin();

  const handleEdit = () => {
    openMediaLibrary(basePath);
  };

  if (!isLoggedIn) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div className={`relative group/editable overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <button
        onClick={handleEdit}
        className="absolute top-2 right-2 z-10 p-2 bg-brand-yellow text-brand-green-dark rounded-full shadow-lg opacity-0 group-hover/editable:opacity-100 transition-opacity focus:opacity-100"
        aria-label="Edit image"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/editable:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
};

export default EditableImage;
