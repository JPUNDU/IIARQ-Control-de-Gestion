
import React, { useCallback, useState } from 'react';
import { UploadedFile } from '../types';
import { FileUploadIcon, TrashIcon } from './icons';

interface FileManagerProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const FileManager: React.FC<FileManagerProps> = ({ files, setFiles }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type === 'text/xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
            setFiles(prevFiles => {
                const fileExists = prevFiles.some(f => f.name === file.name);
                if (fileExists) {
                    if (window.confirm(`El archivo "${file.name}" ya existe. ¿Desea reemplazarlo?`)) {
                        return prevFiles.map(f => f.name === file.name ? { name: file.name, content } : f);
                    }
                    return prevFiles;
                }
                return [...prevFiles, { name: file.name, content }];
            });
        }
      };
      reader.readAsText(file);
    } else {
      alert('Por favor, sube un archivo XML válido.');
    }
  }, [setFiles]);
  
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

  const handleDelete = (fileName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el archivo "${fileName}"?`)) {
      setFiles(files.filter(f => f.name !== fileName));
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
            <input type="file" id="file-upload" accept=".xml" onChange={handleChange} className="hidden" />
            <label htmlFor="file-upload" className="cursor-pointer">
                <FileUploadIcon className="w-12 h-12 mx-auto text-gray-500" />
                <p className="mt-4 text-lg font-semibold text-white">Arrastra y suelta un archivo XML aquí</p>
                <p className="text-gray-400">o haz clic para seleccionar un archivo</p>
                <span className="mt-4 inline-block px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold">
                    Subir Archivo
                </span>
            </label>
        </div>

        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Archivos Cargados</h3>
            <div className="bg-brand-secondary shadow-lg rounded-lg">
                {files.length === 0 ? (
                    <p className="p-8 text-center text-gray-400">No hay archivos cargados.</p>
                ) : (
                    <ul className="divide-y divide-brand-accent">
                    {files.map(file => (
                        <li key={file.name} className="p-4 flex justify-between items-center">
                            <span className="font-mono text-gray-300">{file.name}</span>
                            <button onClick={() => handleDelete(file.name)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                <TrashIcon />
                            </button>
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
