"use client";

import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  files: any[];
  onFilesAdded: (newFiles: any[]) => void;
  onFileRemove: (index: number) => void;
}

export default function FileUpload({ files, onFilesAdded, onFileRemove }: FileUploadProps) {
  const onDrop = (acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  return (
    <div className="w-full space-y-4">
      <div 
        {...getRootProps()} 
        className={`glass-panel border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {isDragActive ? 'Drop your PDFs here...' : 'Drag & Drop your PDFs'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index} 
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name || file.originalName}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onFileRemove(index); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
