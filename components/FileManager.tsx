
import React, { useCallback, useState } from 'react';
import { UploadedFile } from '../types';
import { FileUploadIcon } from './icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface FileManagerProps {
  uploadedFiles: UploadedFile[];
}

const parseBankStatement = httpsCallable(functions, 'parseBankStatement');

const FileManager: React.FC<FileManagerProps> = ({ uploadedFiles }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // filename
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file && file.type === 'text/xml') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        if (content) {
            setUploading(file.name);
            setError(null);
            try {
                await parseBankStatement({ xmlContent: content, fileName: file.name });
            } catch (err: any) {
                console.error("Cloud function error:", err);
                setError(`Error processing ${file.name}: ${err.message}`);
            } finally {
                setUploading(null);
            }
        }
      };
      reader.readAsText(file);
    } else {
      alert('Por favor, sube un archivo XML válido.');
    }
  }, []);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Administrar Archivos XML</h2>
        <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-brand-highlight bg-brand-secondary' : 'border-brand-accent bg-brand-primary'}`}
        >
            <input type="file" id="file-upload" accept=".xml" onChange={handleChange} className="hidden" disabled={!!uploading} />
            <label htmlFor="file-upload" className={uploading ? 'cursor-not-allowed' : 'cursor-pointer'}>
                <FileUploadIcon className="w-12 h-12 mx-auto text-gray-500" />
                {uploading ? (
                     <p className="mt-4 text-lg font-semibold text-brand-highlight">Subiendo {uploading}...</p>
                ) : (
                    <>
                        <p className="mt-4 text-lg font-semibold text-white">Arrastra y suelta un archivo XML aquí</p>
                        <p className="text-gray-400">o haz clic para seleccionar un archivo</p>
                        <span className="mt-4 inline-block px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold">
                            Subir Archivo
                        </span>
                    </>
                )}
            </label>
        </div>
        {error && <p className="text-center mt-4 text-red-400">{error}</p>}

        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Historial de Archivos Cargados</h3>
            <div className="bg-brand-secondary shadow-lg rounded-lg">
                {uploadedFiles.length === 0 ? (
                    <p className="p-8 text-center text-gray-400">No hay archivos cargados.</p>
                ) : (
                    <ul className="divide-y divide-brand-accent">
                    {[...uploadedFiles].sort((a, b) => (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0)).map(file => (
                        <li key={file.name} className="p-4 flex justify-between items-center">
                            <span className="font-mono text-gray-300">{file.name}</span>
                             <span className="text-sm text-gray-500">
                                {file.uploadedAt ? new Date(file.uploadedAt.seconds * 1000).toLocaleString() : ''}
                             </span>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
  );
};

export default FileManager;
