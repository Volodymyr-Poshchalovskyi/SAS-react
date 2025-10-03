// src/context/UploadContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { supabase } from '../lib/supabaseClient'; // Переконайтесь, що шлях правильний

const UploadContext = createContext();

export const useUpload = () => {
    return useContext(UploadContext);
};

// ✨ ЗМІНА: Використовуємо змінну середовища для URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Функція завантаження файлу, винесена з компонента
const uploadFileToGCS = async (file, role, onProgress) => {
    if (!file) return null;
    // ✨ ЗМІНА: Замінено 'http://localhost:3001' на змінну API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/generate-upload-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, fileType: file.type, role: role }), });
    if (!response.ok) { const errorData = await response.json(); throw new Error(`Failed to get signed URL: ${errorData.details || errorData.error}`); }
    const { signedUrl, gcsPath } = await response.json();
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (event) => { if (event.lengthComputable) { const percentComplete = Math.round((event.loaded / event.total) * 100); onProgress(percentComplete); } };
        xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { onProgress(100); resolve(gcsPath); } else { reject(new Error(`Upload failed: ${xhr.statusText}`)); } };
        xhr.onerror = () => reject(new Error('Upload failed due to a network error.'));
        xhr.ontimeout = () => reject(new Error('Upload timed out.'));
        xhr.send(file);
    });
};

export const UploadProvider = ({ children }) => {
    const [uploadStatus, setUploadStatus] = useState({
        isActive: false, message: '', error: null, isSuccess: false,
        totalFiles: 0, completedFiles: 0, currentFileName: '', currentFileProgress: 0,
    });

    const startUpload = async (reelsToUpload, commonFormData) => {
        // ... (решта коду залишається без змін)
        if (!reelsToUpload || reelsToUpload.length === 0) return;

        setUploadStatus({
            isActive: true, message: 'Preparing to upload...', error: null, isSuccess: false,
            totalFiles: reelsToUpload.length, completedFiles: 0, currentFileName: '', currentFileProgress: 0,
        });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found. Please log in.');

            const allUploadedRecords = [];

            for (const reel of reelsToUpload) {
                const currentIndex = reelsToUpload.indexOf(reel);
                setUploadStatus(prev => ({ ...prev, message: `Processing file ${currentIndex + 1} of ${prev.totalFiles}`, currentFileName: reel.title, currentFileProgress: 0 }));
                
                const finalPreviewFile = reel.customPreviewFile;

                const onMainProgress = p => setUploadStatus(prev => ({ ...prev, message: `Uploading content...`, currentFileProgress: finalPreviewFile ? p / 2 : p }));
                const onPreviewProgress = p => setUploadStatus(prev => ({ ...prev, message: `Uploading preview...`, currentFileProgress: 50 + (p / 2) }));

                const content_gcs_path = await uploadFileToGCS(reel.selectedFile, 'main', onMainProgress);
                const preview_gcs_path = finalPreviewFile ? await uploadFileToGCS(finalPreviewFile, 'preview', onPreviewProgress) : null;
                
                allUploadedRecords.push({
                    user_id: user.id, title: reel.title, artists: commonFormData.artist.join(', '), client: commonFormData.client.join(', '), categories: commonFormData.categories.join(', '), publish_date: commonFormData.publishOption === 'now' ? new Date().toISOString() : commonFormData.publicationDate.toISOString(), video_gcs_path: content_gcs_path, preview_gcs_path: preview_gcs_path, description: commonFormData.description, featured_celebrity: commonFormData.featuredCelebrity.join(', '), content_type: commonFormData.contentType, craft: commonFormData.craft, allow_download: commonFormData.allowDownload,
                });
                
                setUploadStatus(prev => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
            }

            setUploadStatus(prev => ({ ...prev, message: 'Saving metadata...', currentFileName: '' }));
            const { error: insertError } = await supabase.from('media_items').insert(allUploadedRecords);
            if (insertError) throw new Error(`Database error: ${insertError.message}`);
            
            setUploadStatus(prev => ({ ...prev, message: 'All media uploaded!', isSuccess: true }));

        } catch (err) {
            console.error('An error occurred during upload:', err);
            setUploadStatus(prev => ({ ...prev, message: 'Upload Failed!', error: err.message, isSuccess: false }));
        } finally {
            setTimeout(() => {
                setUploadStatus(prev => ({ ...prev, isActive: false }));
            }, 5000);
        }
    };

    const value = {
        uploadStatus,
        startUpload,
    };

    return (
        <UploadContext.Provider value={value}>
            {children}
        </UploadContext.Provider>
    );
};