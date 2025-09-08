
import React, { useState, useEffect } from 'react';
import Spinner from './icons/Spinner';
import FolderIcon from './icons/FolderIcon';

interface MediaFile {
  name: string;
  url: string;
  type: 'file';
}

interface MediaDirectory {
    name: string;
    type: 'directory';
}

interface MediaLibraryProps {
  apiUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ apiUrl, onSelect, onClose }) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [directories, setDirectories] = useState<MediaDirectory[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMedia = async (path: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/media?path=${encodeURIComponent(path)}`);
            if (!response.ok) {
                if(response.status === 404) {
                    alert("Directory not found. Returning to root.");
                    setCurrentPath('/');
                } else {
                    throw new Error('Failed to load media');
                }
                return;
            }
            const data = await response.json();
            setDirectories(data.directories || []);
            setFiles(data.files || []);
        } catch (error) {
            console.error("Failed to fetch media:", error);
            alert("Failed to load media library.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia(currentPath);
    }, [apiUrl, currentPath]);
    
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', currentPath);
      setIsUploading(true);

      try {
        const response = await fetch(`${apiUrl}/api/media/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        fetchMedia(currentPath);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
        event.target.value = '';
      }
    };

    const handleDelete = async (filename: string) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}? This cannot be undone.`)) return;

        try {
            const response = await fetch(`${apiUrl}/api/media/${filename}?path=${encodeURIComponent(currentPath)}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete failed');
            fetchMedia(currentPath);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete failed. Please try again.");
        }
    };
    
    const handleDeleteFolder = async (dirName: string) => {
        const pathToDelete = [currentPath, dirName].join('/').replace(/\/+/g, '/');
        if (!window.confirm(`Are you sure you want to delete the folder "${dirName}" and all its contents? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/media/folder?path=${encodeURIComponent(pathToDelete)}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete folder');
            }
            fetchMedia(currentPath);
        } catch (error) {
            console.error('Folder deletion failed:', error);
            alert(`Error deleting folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter new folder name:');
        if (!folderName || folderName.trim() === '') return;
        if (/[\\/?%*:|"<>]/g.test(folderName)) {
            alert('Folder name contains invalid characters.');
            return;
        }

        const newPath = [currentPath, folderName].join('/').replace(/\/+/g, '/');

        try {
            const response = await fetch(`${apiUrl}/api/media/folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: newPath }),
            });
            if (!response.ok) throw new Error('Failed to create folder');
            fetchMedia(currentPath); // Refresh
        } catch (error) {
            console.error("Folder creation failed:", error);
            alert("Failed to create folder.");
        }
    };

    const handleDirectoryClick = (dirName: string) => {
        const newPath = [currentPath, dirName].join('/').replace(/\/+/g, '/');
        setCurrentPath(newPath);
    };
    
    const handleBreadcrumbClick = (path: string) => {
        setCurrentPath(path);
    };

    const Breadcrumbs = () => {
        const parts = currentPath.split('/').filter(Boolean);
        const crumbs = [{ name: 'Home', path: '/' }];
        parts.forEach((part, index) => {
            const path = '/' + parts.slice(0, index + 1).join('/');
            crumbs.push({ name: part, path });
        });

        return (
            <div className="bg-gray-100 p-2 rounded-md">
                <nav className="text-sm text-gray-600 flex items-center flex-wrap">
                    {crumbs.map((crumb, index) => (
                        <span key={crumb.path} className="flex items-center">
                            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                            {index === crumbs.length - 1 ? (
                                <span className="font-bold text-brand-green-dark">{crumb.name}</span>
                            ) : (
                                <button onClick={() => handleBreadcrumbClick(crumb.path)} className="hover:underline">
                                    {crumb.name}
                                </button>
                            )}
                        </span>
                    ))}
                </nav>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-brand-green-dark">Media Library</h3>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                 <div className="p-4 border-b flex items-center space-x-4">
                    <label className={`bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2 px-4 rounded cursor-pointer flex items-center ${isUploading ? 'bg-gray-400' : ''}`}>
                        {isUploading && <Spinner />}
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                        <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} accept="image/*,video/*" />
                    </label>
                    <button onClick={handleCreateFolder} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
                        New Folder
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <Breadcrumbs />
                    {isLoading ? <div className="flex justify-center items-center h-64"><Spinner/> Loading...</div> : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {directories.map(dir => (
                                <div key={dir.name} className="relative group border rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center p-2 text-center bg-gray-50 hover:bg-gray-100">
                                    <div
                                        onClick={() => handleDirectoryClick(dir.name)}
                                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                                        role="button"
                                        aria-label={`Open folder ${dir.name}`}
                                    >
                                        <FolderIcon className="w-16 h-16 text-yellow-500" />
                                        <p className="text-xs text-gray-700 break-all mt-2">{dir.name}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFolder(dir.name);
                                        }}
                                        className="absolute top-1 right-1 z-10 p-1 bg-red-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        aria-label={`Delete folder ${dir.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {files.map(file => (
                                <div key={file.name} className="relative group border rounded-lg overflow-hidden aspect-square">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-contain bg-gray-100" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col items-center justify-center p-2">
                                        <p className="text-xs text-white break-words text-center opacity-0 group-hover:opacity-100 transition-opacity mb-2">{file.name}</p>
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
