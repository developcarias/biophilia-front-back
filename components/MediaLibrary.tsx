
import React, { useState, useEffect } from 'react';
import Spinner from './icons/Spinner';

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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-brand-green-dark">Media Library</h3>
                    <div className="flex items-center space-x-4">
                        <label className={`bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2 px-4 rounded cursor-pointer flex items-center ${isUploading ? 'bg-gray-400' : ''}`}>
                            {isUploading && <Spinner />}
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
                                <div key={file.name} className="relative group border rounded-lg overflow-hidden aspect-square">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-contain bg-gray-100" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col items-center justify-center p-2">
                                        <p className="text-xs text-white break-all text-center opacity-0 group-hover:opacity-100 transition-opacity mb-2">{file.name}</p>
                                        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button onClick={() => { onSelect(file.url); }} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Select</button>
                                           <button onClick={() => handleDelete(file.name)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Delete</button>
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

export default MediaLibrary;
