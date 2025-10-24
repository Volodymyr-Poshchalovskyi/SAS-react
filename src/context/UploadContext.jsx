// src/context/UploadContext.jsx

// ! React Imports
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react';

// ! Library Imports
import { supabase } from '../lib/supabaseClient'; // * Supabase client instance

// ! Local Imports (Added)
import { useAuth } from '../hooks/useAuth'; // * Hook to get auth session

// ========================================================================== //
// ! CONTEXT CREATION & HOOK
// ========================================================================== //

const UploadContext = createContext();

/**
 * ? useUpload Hook
 * Custom hook to easily consume the UploadContext.
 * @returns {object} The upload context value.
 */
export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    // * Check if used within provider
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

// ========================================================================== //
// ! CONSTANTS & HELPERS
// ========================================================================== //

const API_BASE_URL = import.meta.env.VITE_API_URL; // * Backend URL for signed URLs

/**
 * ? uploadFileToGCS Helper Function
 * Handles the process of uploading a single file to Google Cloud Storage.
 *
 * @param {File} file - The file object to upload.
 * @param {string} role - The role of the file ('main' or 'preview'), used by backend for destination.
 * @param {function} onProgress - Callback function to report upload progress (0-100).
 * @param {React.MutableRefObject<Map<string, XMLHttpRequest>>} activeXHRsRef - Ref pointing to a Map storing active XHR requests.
 * @param {string} token - The JWT auth token. (Added)
 * @returns {Promise<string>} A promise resolving with the GCS path upon successful upload.
 */
const uploadFileToGCS = async (
  file,
  role,
  onProgress,
  activeXHRsRef,
  token // <-- 1. Приймаємо токен
) => {
  if (!file) return null; // * Exit if no file provided

  // * Sanitize filename to prevent issues with GCS paths/URLs
  const cleanFileName = file.name.replace(
    /[%;;!@#$^&*()+=\[\]{}\\/|<>?]/g, // * Remove potentially problematic characters
    '_'
  );

  // * 1. Get Signed URL from our backend
  const response = await fetch(`${API_BASE_URL}/generate-upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // <-- 2. Додаємо токен в заголовок
    },
    body: JSON.stringify({
      fileName: cleanFileName,
      fileType: file.type,
      role: role,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // * Try to parse error details
    throw new Error(
      `Failed to get signed URL: ${
        errorData.details || errorData.error || response.statusText
      }`
    );
  }
  const { signedUrl, gcsPath } = await response.json();

  // * 2. Upload using XHR
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    // * Store the XHR object in the ref map for cancellation tracking
    activeXHRsRef.current.set(gcsPath, xhr);

    // * Progress event listener
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete); // * Call the progress callback
      }
    };

    // * Load event listener (success or failure based on status)
    xhr.onload = () => {
      activeXHRsRef.current.delete(gcsPath); // * Remove XHR from tracking map
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100); // * Ensure progress reaches 100% on success
        resolve(gcsPath); // * Resolve the promise with the GCS path
      } else {
        reject(
          new Error(
            `Upload failed with status ${xhr.status}: ${xhr.statusText}`
          )
        );
      }
    };

    // * Error event listeners
    xhr.onerror = () => {
      activeXHRsRef.current.delete(gcsPath);
      reject(new Error('Upload failed due to a network error.'));
    };
    xhr.ontimeout = () => {
      activeXHRsRef.current.delete(gcsPath);
      reject(new Error('Upload timed out.'));
    };
    xhr.onabort = () => {
      // * Handle explicit cancellation
      activeXHRsRef.current.delete(gcsPath);
      reject(new Error('Upload canceled by user.')); // * Specific error for cancellation
    };

    // * Check if cancellation was requested *before* sending the request
    if (activeXHRsRef.current.get('__CANCELED__')) {
      // xhr.abort(); // abort() is implicitly called by rejecting here before send()
      activeXHRsRef.current.delete(gcsPath);
      reject(new Error('Upload canceled before start.'));
      return;
    }

    // * Send the actual file data
    xhr.send(file);
  });
};

// ========================================================================== //
// ! UPLOAD PROVIDER COMPONENT
// ========================================================================== //

export const UploadProvider = ({ children }) => {
  // ! State
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

  // ! Refs
  const activeXHRs = useRef(new Map());
  const isCanceled = useRef(false);

  // ! Auth Hook (Added)
  const { session } = useAuth(); // <-- 3. Отримуємо сесію тут

  // ! Helper Functions
  /**
   * ? Resets the upload status after a delay.
   */
  const resetStatus = useCallback(() => {
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
      activeXHRs.current.clear();
      isCanceled.current = false;
    }, 5000); // * 5-second delay
  }, []);

  /**
   * ? Cancels all ongoing file uploads.
   */
  const cancelUpload = useCallback(() => {
    console.log('Canceling upload...');
    isCanceled.current = true;
    activeXHRs.current.set('__CANCELED__', true);

    activeXHRs.current.forEach((xhr, path) => {
      if (path !== '__CANCELED__') {
        try {
          xhr.abort();
          console.log(`Aborted upload for: ${path}`);
        } catch (e) {
          console.warn(`Could not abort XHR for ${path}:`, e);
        }
      }
    });

    activeXHRs.current.clear();

    setUploadStatus((prev) => ({
      ...prev,
      isActive: true,
      message: 'Upload Canceled',
      error: 'Upload was canceled by the user.',
      isSuccess: false,
      currentFileProgress: 0,
      currentFileName: '',
    }));

    resetStatus();
  }, [resetStatus]);

  // ! Main Upload/Update Functions exposed by the context
  /**
   * ? Starts the upload process for creating new media items.
   */
  const startUpload = useCallback(
    async (reelsToUpload, commonFormData) => {
      const MAX_UPLOAD_LIMIT = 100;
      if (!reelsToUpload || reelsToUpload.length === 0) return;
      if (reelsToUpload.length > MAX_UPLOAD_LIMIT) {
        throw new Error(
          `Uploading limit exceeded. Can be uploaded ${MAX_UPLOAD_LIMIT} files per time.`
        );
      }

      // <-- 4. Отримуємо токен із сесії
      const token = session?.access_token;
      if (!token) {
        throw new Error('User not authenticated. Please log in again.');
      }

      isCanceled.current = false;
      activeXHRs.current.clear();

      setUploadStatus({
        isActive: true,
        message: 'Preparing upload...',
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
        } = await supabase.auth.getUser(token); // <-- Передаємо токен
        if (!user) throw new Error('User not found. Please log in.');

        const allUploadedRecords = [];

        for (const [index, reel] of reelsToUpload.entries()) {
          if (isCanceled.current) throw new Error('Upload canceled by user.');

          setUploadStatus((prev) => ({
            ...prev,
            message: `Processing file ${index + 1} of ${prev.totalFiles}...`,
            currentFileName:
              reel.title || reel.selectedFile?.name || `File ${index + 1}`,
            currentFileProgress: 0,
          }));

          const onMainProgress = (p) =>
            setUploadStatus((prev) => ({
              ...prev,
              message: `Uploading content (${index + 1}/${
                reelsToUpload.length
              })...`,
              currentFileProgress: p,
            }));

          // * --- Upload Main Content File ---
          const content_gcs_path = await uploadFileToGCS(
            reel.selectedFile,
            'main',
            onMainProgress,
            activeXHRs,
            token // <-- 5. Передаємо токен
          );
          if (!content_gcs_path)
            throw new Error(`Failed to upload main content for ${reel.title}.`);

          let preview_gcs_path = null;
          const isVideoFile = reel.selectedFile.type.startsWith('video/');

          if (isCanceled.current) throw new Error('Upload canceled by user.');

          if (isVideoFile) {
            const fileName =
              content_gcs_path
                .split('/')
                .pop()
                ?.split('.')
                .slice(0, -1)
                .join('.') || content_gcs_path.split('/').pop();
            preview_gcs_path = `back-end/previews/${fileName}.jpg`;
          } else {
            const previewFile = reel.customPreviewFile || reel.selectedFile;
            if (previewFile) {
              setUploadStatus((prev) => ({
                ...prev,
                message: `Uploading preview (${index + 1}/${
                  reelsToUpload.length
                })...`,
              }));
              preview_gcs_path = await uploadFileToGCS(
                previewFile,
                'preview',
                () => {},
                activeXHRs,
                token // <-- 5. Передаємо токен
              );
            }
          }

          allUploadedRecords.push({
            user_id: user.id,
            title: reel.title || reel.selectedFile?.name || 'Untitled',
            artists: commonFormData.artist?.join(', ') || '',
            client: commonFormData.client?.join(', ') || '',
            categories: commonFormData.categories?.join(', ') || '',
            publish_date:
              commonFormData.publishOption === 'now'
                ? new Date().toISOString()
                : commonFormData.publicationDate?.toISOString() ||
                  new Date().toISOString(),
            video_gcs_path: content_gcs_path,
            preview_gcs_path: preview_gcs_path,
            description: commonFormData.description || '',
            featured_celebrity:
              commonFormData.featuredCelebrity?.join(', ') || '',
            content_type: commonFormData.contentType || '',
            craft: commonFormData.craft || '',
            allow_download: commonFormData.allowDownload || false,
          });

          setUploadStatus((prev) => ({
            ...prev,
            completedFiles: prev.completedFiles + 1,
          }));
        } // End of loop

        if (isCanceled.current) throw new Error('Upload canceled by user.');

        setUploadStatus((prev) => ({
          ...prev,
          message: 'Saving metadata...',
          currentFileName: '',
        }));
        const response = await fetch(`${API_BASE_URL}/media-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // * Передаємо токен для requireAuth
          },
          body: JSON.stringify(allUploadedRecords), // * Відправляємо всі зібрані дані
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.details ||
              errData.error ||
              `Failed to save metadata (status ${response.status}).`
          );
        }

        setUploadStatus((prev) => ({
          ...prev,
          message: 'All media uploaded successfully!',
          isSuccess: true,
        }));
      } catch (err) {
        console.error('An error occurred during upload:', err);
        if (!isCanceled.current) {
          setUploadStatus((prev) => ({
            ...prev,
            message: 'Upload Failed!',
            error: err.message,
            isSuccess: false,
          }));
        } else {
          console.log('Upload process terminated due to cancellation.');
        }
      } finally {
        activeXHRs.current.clear();
        isCanceled.current = false;
        resetStatus();
      }
    },
    [resetStatus, session] // <-- 6. Додаємо session в залежності
  );

  /**
   * ? Starts the update process for an existing media item.
   */
  const startUpdate = useCallback(
    async (itemId, reelToUpdate, commonFormData) => {
      isCanceled.current = false;
      activeXHRs.current.clear();

      // <-- 7. Отримуємо токен із сесії
      const token = session?.access_token;
      if (!token) {
        setUploadStatus((prev) => ({
          ...prev,
          isActive: true,
          message: 'Update Failed!',
          error: 'User not authenticated. Please log in again.',
          isSuccess: false,
        }));
        resetStatus();
        return;
      }

      setUploadStatus({
        isActive: true,
        message: 'Preparing update...',
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
        const totalSteps = (hasNewContent ? 1 : 0) + (hasNewPreview ? 1 : 0);
        let completedSteps = 0;

        const onMainProgress = (p) => {
          const progressContribution = totalSteps > 1 ? p / 2 : p;
          setUploadStatus((prev) => ({
            ...prev,
            message: 'Uploading new content...',
            currentFileProgress: progressContribution,
          }));
        };
        const onPreviewProgress = (p) => {
          const baseProgress = hasNewContent ? 50 : 0;
          const progressContribution = totalSteps > 1 ? p / 2 : p;
          setUploadStatus((prev) => ({
            ...prev,
            message: 'Uploading new preview...',
            currentFileProgress: baseProgress + progressContribution,
          }));
        };

        if (isCanceled.current) throw new Error('Update canceled by user.');
        if (hasNewContent) {
          videoPath = await uploadFileToGCS(
            reelToUpdate.selectedFile,
            'main',
            onMainProgress,
            activeXHRs,
            token // <-- 8. Передаємо токен
          );
          completedSteps++;
          if (
            reelToUpdate.selectedFile.type.startsWith('video/') &&
            !hasNewPreview
          ) {
            previewPath = null;
          }
        }

        if (isCanceled.current) throw new Error('Update canceled by user.');
        if (hasNewPreview) {
          previewPath = await uploadFileToGCS(
            reelToUpdate.customPreviewFile,
            'preview',
            onPreviewProgress,
            activeXHRs,
            token // <-- 8. Передаємо токен
          );
          completedSteps++;
        }

        if (isCanceled.current) throw new Error('Update canceled by user.');
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Updating metadata...',
          currentFileProgress: 100,
        }));

        const recordToUpdate = {
          title: reelToUpdate.title,
          artists: commonFormData.artist?.join(', ') || '',
          client: commonFormData.client?.join(', ') || '',
          categories: commonFormData.categories?.join(', ') || '',
          publish_date:
            commonFormData.publishOption === 'now'
              ? new Date().toISOString()
              : commonFormData.publicationDate?.toISOString() ||
                new Date().toISOString(),
          video_gcs_path: videoPath,
          preview_gcs_path: previewPath,
          description: commonFormData.description || '',
          featured_celebrity:
            commonFormData.featuredCelebrity?.join(', ') || '',
          content_type: commonFormData.contentType || '',
          craft: commonFormData.craft || '',
          allow_download: commonFormData.allowDownload || false,
        };

        const response = await fetch(`${API_BASE_URL}/media-items/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // <-- 9. Додаємо токен до PUT запиту
          },
          body: JSON.stringify(recordToUpdate),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.details ||
              errData.error ||
              `Failed to update media item (status ${response.status}).`
          );
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
        } else {
          console.log('Update process terminated due to cancellation.');
        }
      } finally {
        activeXHRs.current.clear();
        isCanceled.current = false;
        resetStatus();
      }
    },
    [resetStatus, session] // <-- 10. Додаємо session в залежності
  );

  // ! Context Value
  const value = useMemo(
    () => ({
      uploadStatus,
      startUpload,
      startUpdate,
      cancelUpload,
    }),
    [uploadStatus, startUpload, startUpdate, cancelUpload]
  );

  // ! Provider Return
  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
};
