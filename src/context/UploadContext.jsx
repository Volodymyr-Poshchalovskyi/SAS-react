// src/context/UploadContext.jsx

import React, { createContext, useState, useContext, useRef } from 'react'; // Import useRef
import { supabase } from '../lib/supabaseClient';

const UploadContext = createContext();

export const useUpload = () => {
  return useContext(UploadContext);
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

// We need to pass the refs to this function so it can store the active XHR
const uploadFileToGCS = async (file, role, onProgress, activeXHRsRef) => {
  if (!file) return null;
  const cleanFileName = file.name.replace(
    /[%;;!@#$^&*()+=\[\]{}\\/|<>?]/g,
    '_'
  );

  const response = await fetch(`${API_BASE_URL}/generate-upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: cleanFileName,
      fileType: file.type,
      role: role,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to get signed URL: ${errorData.details || errorData.error}`
    );
  }
  const { signedUrl, gcsPath } = await response.json();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    // Store the XHR object
    activeXHRsRef.current.set(gcsPath, xhr);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      activeXHRsRef.current.delete(gcsPath); // Remove from tracking
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve(gcsPath);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      activeXHRsRef.current.delete(gcsPath); // Remove from tracking
      reject(new Error('Upload failed due to a network error.'));
    };
    xhr.ontimeout = () => {
      activeXHRsRef.current.delete(gcsPath); // Remove from tracking
      reject(new Error('Upload timed out.'));
    };

    // Check for cancellation *before* sending
    if (activeXHRsRef.current.get('__CANCELED__')) {
      xhr.abort();
      activeXHRsRef.current.delete(gcsPath);
      reject(new Error('Upload canceled before start.'));
      return;
    }

    xhr.send(file);
  });
};

export const UploadProvider = ({ children }) => {
  const [uploadStatus, setUploadStatus] = useState({
    isActive: false,
    message: '',
    error: null,
    isSuccess: false,
    totalFiles: 0,
    completedFiles: 0,
    currentFileName: '',
    currentFileProgress: 0,
  });

  // Refs to track active requests and cancellation state
  const activeXHRs = useRef(new Map());
  const isCanceled = useRef(false);

  const resetStatus = () => {
    setTimeout(() => {
      setUploadStatus({
        isActive: false,
        message: '',
        error: null,
        isSuccess: false,
        totalFiles: 0,
        completedFiles: 0,
        currentFileName: '',
        currentFileProgress: 0,
      });
    }, 5000); // Keep modal for 5 seconds after success/error
  };

  // New function to cancel all active uploads
  const cancelUpload = () => {
    console.log('Canceling upload...');
    isCanceled.current = true; // Set flag to stop loops
    activeXHRs.current.set('__CANCELED__', true); // Flag for pending requests

    activeXHRs.current.forEach((xhr, path) => {
      if (path !== '__CANCELED__') {
        xhr.abort(); // Abort active XHR
        console.log(`Aborted upload for: ${path}`);
      }
    });

    activeXHRs.current.clear();

    setUploadStatus((prev) => ({
      ...prev,
      isActive: true, // Keep modal open
      message: 'Upload Canceled',
      error: 'Upload was canceled by the user.',
      isSuccess: false,
      currentFileProgress: 0,
    }));

    resetStatus(); // Use existing reset logic
  };

  const startUpload = async (reelsToUpload, commonFormData) => {
    if (!reelsToUpload || reelsToUpload.length === 0) return;

    // Reset cancellation flag
    isCanceled.current = false;
    activeXHRs.current.clear();

    setUploadStatus({
      isActive: true,
      message: 'Preparing to upload...',
      error: null,
      isSuccess: false,
      totalFiles: reelsToUpload.length,
      completedFiles: 0,
      currentFileName: '',
      currentFileProgress: 0,
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found. Please log in.');

      const allUploadedRecords = [];

      for (const reel of reelsToUpload) {
        // Check for cancellation before each file
        if (isCanceled.current) {
          throw new Error('Upload was canceled by the user.');
        }

        const currentIndex = reelsToUpload.indexOf(reel);
        setUploadStatus((prev) => ({
          ...prev,
          message: `Processing file ${currentIndex + 1} of ${prev.totalFiles}`,
          currentFileName: reel.title,
          currentFileProgress: 0,
        }));

        const onMainProgress = (p) =>
          setUploadStatus((prev) => ({
            ...prev,
            message: `Uploading content...`,
            currentFileProgress: p,
          }));

        // Pass the ref to the upload function
        const content_gcs_path = await uploadFileToGCS(
          reel.selectedFile,
          'main',
          onMainProgress,
          activeXHRs
        );

        let preview_gcs_path;
        const isVideoFile = reel.selectedFile.type.startsWith('video/');

        // Check for cancellation again before uploading preview
        if (isCanceled.current) {
          throw new Error('Upload was canceled by the user.');
        }

        if (isVideoFile) {
          const fileName = content_gcs_path.split('/').pop();
          preview_gcs_path = `back-end/previews/${fileName}.jpg`;
        } else {
          const previewFile = reel.customPreviewFile || reel.selectedFile;
          // Pass the ref to the upload function
          preview_gcs_path = await uploadFileToGCS(
            previewFile,
            'preview',
            () => {},
            activeXHRs
          );
        }

        allUploadedRecords.push({
          user_id: user.id,
          title: reel.title,
          artists: commonFormData.artist.join(', '),
          client: commonFormData.client.join(', '),
          categories: commonFormData.categories.join(', '),
          publish_date:
            commonFormData.publishOption === 'now'
              ? new Date().toISOString()
              : commonFormData.publicationDate.toISOString(),
          video_gcs_path: content_gcs_path,
          preview_gcs_path: preview_gcs_path,
          description: commonFormData.description,
          featured_celebrity: commonFormData.featuredCelebrity.join(', '),
          content_type: commonFormData.contentType,
          craft: commonFormData.craft,
          allow_download: commonFormData.allowDownload,
        });

        setUploadStatus((prev) => ({
          ...prev,
          completedFiles: prev.completedFiles + 1,
        }));
      }

      // Check for cancellation before saving metadata
      if (isCanceled.current) {
        throw new Error('Upload was canceled by the user.');
      }

      setUploadStatus((prev) => ({
        ...prev,
        message: 'Saving metadata...',
        currentFileName: '',
      }));
      const { error: insertError } = await supabase
        .from('media_items')
        .insert(allUploadedRecords);
      if (insertError)
        throw new Error(`Database error: ${insertError.message}`);

      setUploadStatus((prev) => ({
        ...prev,
        message: 'All media uploaded!',
        isSuccess: true,
      }));
    } catch (err) {
      console.error('An error occurred during upload:', err);
      // Don't show error message if it was a user cancellation
      if (!isCanceled.current) {
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Upload Failed!',
          error: err.message,
          isSuccess: false,
        }));
      }
    } finally {
      activeXHRs.current.clear();
      isCanceled.current = false;
      resetStatus();
    }
  };

  const startUpdate = async (itemId, reelToUpdate, commonFormData) => {
    // Reset cancellation flag
    isCanceled.current = false;
    activeXHRs.current.clear();

    setUploadStatus({
      isActive: true,
      message: 'Preparing to update...',
      error: null,
      isSuccess: false,
      totalFiles: 1,
      completedFiles: 0,
      currentFileName: reelToUpdate.title,
      currentFileProgress: 0,
    });

    try {
      let videoPath = reelToUpdate.original_video_path;
      let previewPath = reelToUpdate.original_preview_path;

      const hasNewContent = reelToUpdate.selectedFile instanceof File;
      const hasNewPreview = reelToUpdate.customPreviewFile instanceof File;

      const onMainProgress = (p) =>
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Uploading new content...',
          currentFileProgress: hasNewPreview ? p / 2 : p,
        }));
      const onPreviewProgress = (p) =>
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Uploading new preview...',
          currentFileProgress: hasNewContent ? 50 + p / 2 : p,
        }));

      if (isCanceled.current)
        throw new Error('Upload was canceled by the user.');
      if (hasNewContent) {
        videoPath = await uploadFileToGCS(
          reelToUpdate.selectedFile,
          'main',
          onMainProgress,
          activeXHRs
        );
        if (reelToUpdate.selectedFile.type.startsWith('video/')) {
          previewPath = null;
        }
      }

      if (isCanceled.current)
        throw new Error('Upload was canceled by the user.');
      if (hasNewPreview) {
        previewPath = await uploadFileToGCS(
          reelToUpdate.customPreviewFile,
          'preview',
          onPreviewProgress,
          activeXHRs
        );
      }

      if (isCanceled.current)
        throw new Error('Upload was canceled by the user.');
      setUploadStatus((prev) => ({ ...prev, message: 'Updating metadata...' }));

      const recordToUpdate = {
        title: reelToUpdate.title,
        artists: commonFormData.artist.join(', '),
        client: commonFormData.client.join(', '),
        categories: commonFormData.categories.join(', '),
        publish_date:
          commonFormData.publishOption === 'now'
            ? new Date().toISOString()
            : commonFormData.publicationDate.toISOString(),
        video_gcs_path: videoPath,
        preview_gcs_path: previewPath,
        description: commonFormData.description,
        featured_celebrity: commonFormData.featuredCelebrity.join(', '),
        content_type: commonFormData.contentType,
        craft: commonFormData.craft,
        allow_download: commonFormData.allowDownload,
      };

      const response = await fetch(`${API_BASE_URL}/media-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordToUpdate),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || 'Failed to update media item.');
      }

      setUploadStatus((prev) => ({
        ...prev,
        message: 'Changes saved successfully!',
        isSuccess: true,
        completedFiles: 1,
      }));
    } catch (err) {
      console.error('An error occurred during update:', err);
      if (!isCanceled.current) {
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Update Failed!',
          error: err.message,
          isSuccess: false,
        }));
      }
    } finally {
      activeXHRs.current.clear();
      isCanceled.current = false;
      resetStatus();
    }
  };

  const value = {
    uploadStatus,
    startUpload,
    startUpdate,
    cancelUpload, // Expose the cancel function
  };

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
};
