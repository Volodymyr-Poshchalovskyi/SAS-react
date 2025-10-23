// src/context/UploadContext.jsx

// ! React Imports
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react'; // <-- Import useMemo here

// ! Library Imports
import { supabase } from '../lib/supabaseClient'; // * Supabase client instance

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
 * 1. Cleans the filename.
 * 2. Fetches a signed upload URL from the backend API.
 * 3. Uses XMLHttpRequest (XHR) to perform the upload, allowing progress tracking and cancellation.
 * 4. Tracks the active XHR request using the provided ref map.
 *
 * @param {File} file - The file object to upload.
 * @param {string} role - The role of the file ('main' or 'preview'), used by backend for destination.
 * @param {function} onProgress - Callback function to report upload progress (0-100).
 * @param {React.MutableRefObject<Map<string, XMLHttpRequest>>} activeXHRsRef - Ref pointing to a Map storing active XHR requests (key: gcsPath, value: XHR object).
 * @returns {Promise<string>} A promise resolving with the GCS path upon successful upload.
 */
const uploadFileToGCS = async (file, role, onProgress, activeXHRsRef) => {
  if (!file) return null; // * Exit if no file provided

  // * Sanitize filename to prevent issues with GCS paths/URLs
  const cleanFileName = file.name.replace(
    /[%;;!@#$^&*()+=\[\]{}\\/|<>?]/g, // * Remove potentially problematic characters
    '_'
  );

  // * 1. Get Signed URL from our backend
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
    const errorData = await response.json().catch(() => ({})); // * Try to parse error details
    throw new Error(
      `Failed to get signed URL: ${errorData.details || errorData.error || response.statusText}`
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
  // * Main state object holding all info about the current upload process
  const [uploadStatus, setUploadStatus] = useState({
    isActive: false, // * Is an upload/update currently in progress? (Controls modal visibility)
    message: '', // * User-facing status message (e.g., "Uploading file 1 of 3")
    error: null, // * Stores any error message that occurred
    isSuccess: false, // * Flag indicating successful completion of the entire process
    totalFiles: 0, // * Total number of files in the current batch
    completedFiles: 0, // * Number of files successfully uploaded so far
    currentFileName: '', // * Name of the file currently being processed/uploaded
    currentFileProgress: 0, // * Progress (0-100) of the current file upload
  });

  // ! Refs
  // * Stores active XHR requests (Map<gcsPath, XMLHttpRequest>) for cancellation
  const activeXHRs = useRef(new Map());
  // * Flag to signal cancellation request across async operations
  const isCanceled = useRef(false);

  // ! Helper Functions
  /**
   * ? Resets the upload status after a delay.
   * Typically called after success or error to allow the user to see the final status message.
   */
  const resetStatus = useCallback(() => {
    // * Delay allows the modal to show final status before disappearing
    setTimeout(() => {
      setUploadStatus({
        // * Reset to initial state
        isActive: false,
        message: '',
        error: null,
        isSuccess: false,
        totalFiles: 0,
        completedFiles: 0,
        currentFileName: '',
        currentFileProgress: 0,
      });
      // * Clear refs just in case, although they should be cleared by the upload/cancel functions
      activeXHRs.current.clear();
      isCanceled.current = false;
    }, 5000); // * 5-second delay
  }, []); // * No dependencies, safe to useCallback

  /**
   * ? Cancels all ongoing file uploads.
   * Sets a cancellation flag, aborts active XHR requests, updates the status message.
   */
  const cancelUpload = useCallback(() => {
    console.log('Canceling upload...');
    isCanceled.current = true; // * Signal ongoing/pending operations to stop
    activeXHRs.current.set('__CANCELED__', true); // * Special flag for pending uploadFileToGCS calls

    // * Iterate through the map of active XHRs and abort each one
    activeXHRs.current.forEach((xhr, path) => {
      if (path !== '__CANCELED__') {
        // * Skip the special flag entry
        try {
          xhr.abort(); // * Abort the XHR request
          console.log(`Aborted upload for: ${path}`);
        } catch (e) {
          console.warn(`Could not abort XHR for ${path}:`, e);
        }
      }
    });

    // * Clear the tracking map immediately after aborting
    activeXHRs.current.clear();

    // * Update the UI status to reflect cancellation
    setUploadStatus((prev) => ({
      ...prev,
      isActive: true, // * Keep modal temporarily active to show the cancellation message
      message: 'Upload Canceled',
      error: 'Upload was canceled by the user.', // * Set specific error message
      isSuccess: false,
      currentFileProgress: 0, // * Reset progress
      // * Keep totalFiles and completedFiles as they were for context? Or reset? Resetting seems clearer.
      // totalFiles: 0,
      // completedFiles: 0,
      currentFileName: '',
    }));

    resetStatus(); // * Schedule the status reset to hide the modal after delay
  }, [resetStatus]); // * Dependency on resetStatus

  // ! Main Upload/Update Functions exposed by the context
  /**
   * ? Starts the upload process for creating new media items.
   * Loops through provided 'reels', uploads content and previews, then saves metadata.
   * Handles progress updates and cancellation checks.
   *
   * @param {Array<object>} reelsToUpload - Array of objects representing items to upload. Each object should have `selectedFile`, `customPreviewFile` (optional), `title`.
   * @param {object} commonFormData - Object containing metadata common to all uploaded items (artist, client, dates, etc.).
   */
  const startUpload = useCallback(
    async (reelsToUpload, commonFormData) => {
      if (!reelsToUpload || reelsToUpload.length === 0) return;

      // * Reset cancellation flags and tracking map
      isCanceled.current = false;
      activeXHRs.current.clear();

      // * Set initial loading status
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
        // * Ensure user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found. Please log in.');

        const allUploadedRecords = []; // * Array to store metadata for batch insert

        // * Process each reel item sequentially
        for (const [index, reel] of reelsToUpload.entries()) {
          // * --- Cancellation Check ---
          if (isCanceled.current) throw new Error('Upload canceled by user.');

          // * Update status for the current file
          setUploadStatus((prev) => ({
            ...prev,
            message: `Processing file ${index + 1} of ${prev.totalFiles}...`,
            currentFileName:
              reel.title || reel.selectedFile?.name || `File ${index + 1}`,
            currentFileProgress: 0,
          }));

          // * Progress callback for the main content file upload
          const onMainProgress = (p) =>
            setUploadStatus((prev) => ({
              ...prev,
              message: `Uploading content (${index + 1}/${reelsToUpload.length})...`,
              currentFileProgress: p,
            }));

          // * --- Upload Main Content File ---
          const content_gcs_path = await uploadFileToGCS(
            reel.selectedFile,
            'main',
            onMainProgress,
            activeXHRs
          );
          if (!content_gcs_path)
            throw new Error(`Failed to upload main content for ${reel.title}.`);

          // * Determine or upload preview file
          let preview_gcs_path = null;
          const isVideoFile = reel.selectedFile.type.startsWith('video/');

          // * --- Cancellation Check ---
          if (isCanceled.current) throw new Error('Upload canceled by user.');

          if (isVideoFile) {
            // * For videos, backend generates preview later based on content path
            // * We construct the *expected* preview path here for the DB record
            // ! This assumes a consistent naming convention in the backend/cloud function
            const fileName =
              content_gcs_path
                .split('/')
                .pop()
                ?.split('.')
                .slice(0, -1)
                .join('.') || content_gcs_path.split('/').pop();
            preview_gcs_path = `back-end/previews/${fileName}.jpg`; // * Store expected path
            // ? Alternatively, leave preview_gcs_path null and let backend fill it? Depends on workflow.
          } else {
            // * For images, use custom preview if provided, else use the main file itself
            const previewFile = reel.customPreviewFile || reel.selectedFile;
            if (previewFile) {
              setUploadStatus((prev) => ({
                ...prev,
                message: `Uploading preview (${index + 1}/${reelsToUpload.length})...`,
              }));
              // * Upload the preview file (no progress update needed for small previews?)
              preview_gcs_path = await uploadFileToGCS(
                previewFile,
                'preview',
                () => {},
                activeXHRs
              );
            }
          }

          // * Add metadata for this item to the batch array
          allUploadedRecords.push({
            user_id: user.id,
            title: reel.title || reel.selectedFile?.name || 'Untitled', // * Use filename as fallback title
            // * Join array fields into comma-separated strings for DB
            artists: commonFormData.artist?.join(', ') || '',
            client: commonFormData.client?.join(', ') || '',
            categories: commonFormData.categories?.join(', ') || '',
            publish_date:
              commonFormData.publishOption === 'now'
                ? new Date().toISOString()
                : commonFormData.publicationDate?.toISOString() ||
                  new Date().toISOString(),
            video_gcs_path: content_gcs_path, // * Always store the main content path here
            preview_gcs_path: preview_gcs_path,
            description: commonFormData.description || '',
            featured_celebrity:
              commonFormData.featuredCelebrity?.join(', ') || '',
            content_type: commonFormData.contentType || '',
            craft: commonFormData.craft || '',
            allow_download: commonFormData.allowDownload || false,
            // * Store original file type if needed
            // file_type: reel.selectedFile.type,
          });

          // * Update completed file count
          setUploadStatus((prev) => ({
            ...prev,
            completedFiles: prev.completedFiles + 1,
          }));
        } // End of loop

        // * --- Cancellation Check ---
        if (isCanceled.current) throw new Error('Upload canceled by user.');

        // * --- Save Metadata to Database ---
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Saving metadata...',
          currentFileName: '',
        }));
        const { error: insertError } = await supabase
          .from('media_items')
          .insert(allUploadedRecords);
        if (insertError)
          throw new Error(`Database insert error: ${insertError.message}`);

        // * --- Final Success State ---
        setUploadStatus((prev) => ({
          ...prev,
          message: 'All media uploaded successfully!',
          isSuccess: true,
        }));
      } catch (err) {
        console.error('An error occurred during upload:', err);
        // * Only show error in UI if it wasn't a user cancellation
        if (!isCanceled.current) {
          setUploadStatus((prev) => ({
            ...prev,
            message: 'Upload Failed!',
            error: err.message,
            isSuccess: false,
          }));
        } else {
          // * If canceled, the cancelUpload function already set the status
          console.log('Upload process terminated due to cancellation.');
        }
      } finally {
        // * Always clear tracking refs and schedule modal reset
        activeXHRs.current.clear();
        isCanceled.current = false; // Reset cancellation flag for future uploads
        resetStatus();
      }
    },
    [resetStatus]
  ); // * Dependency on resetStatus

  /**
   * ? Starts the update process for an existing media item.
   * Uploads new content/preview files if provided, then calls the backend PUT endpoint
   * to update metadata and handle old file deletion.
   * Handles progress updates and cancellation checks.
   *
   * @param {string|number} itemId - The ID of the media item to update.
   * @param {object} reelToUpdate - Object representing the item with potential new `selectedFile` or `customPreviewFile`. Should also include `original_video_path` and `original_preview_path`.
   * @param {object} commonFormData - Object containing updated metadata.
   */
  const startUpdate = useCallback(
    async (itemId, reelToUpdate, commonFormData) => {
      // * Reset cancellation state
      isCanceled.current = false;
      activeXHRs.current.clear();

      // * Set initial update status
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
        // * Determine original paths
        let videoPath = reelToUpdate.original_video_path;
        let previewPath = reelToUpdate.original_preview_path;

        // * Check if new files were provided
        const hasNewContent = reelToUpdate.selectedFile instanceof File;
        const hasNewPreview = reelToUpdate.customPreviewFile instanceof File;
        const totalSteps = (hasNewContent ? 1 : 0) + (hasNewPreview ? 1 : 0); // * Max 2 upload steps
        let completedSteps = 0;

        // * Progress callbacks - adjust progress based on whether one or two files are uploading
        const onMainProgress = (p) => {
          const progressContribution = totalSteps > 1 ? p / 2 : p; // * 50% if preview also uploading, else 100%
          setUploadStatus((prev) => ({
            ...prev,
            message: 'Uploading new content...',
            currentFileProgress: progressContribution,
          }));
        };
        const onPreviewProgress = (p) => {
          const baseProgress = hasNewContent ? 50 : 0; // * Start from 50% if content was uploaded
          const progressContribution = totalSteps > 1 ? p / 2 : p; // * 50% if content also uploaded, else 100%
          setUploadStatus((prev) => ({
            ...prev,
            message: 'Uploading new preview...',
            currentFileProgress: baseProgress + progressContribution,
          }));
        };

        // * --- Cancellation Check & Upload New Content ---
        if (isCanceled.current) throw new Error('Update canceled by user.');
        if (hasNewContent) {
          videoPath = await uploadFileToGCS(
            reelToUpdate.selectedFile,
            'main',
            onMainProgress,
            activeXHRs
          );
          completedSteps++;
          // * If new content is a video, the backend will handle preview generation,
          // * so we should nullify the preview path unless a *new* custom preview is also provided.
          // * The backend PUT endpoint needs logic to delete the old preview if videoPath changes and previewPath becomes null.
          if (
            reelToUpdate.selectedFile.type.startsWith('video/') &&
            !hasNewPreview
          ) {
            previewPath = null;
          }
        }

        // * --- Cancellation Check & Upload New Preview ---
        if (isCanceled.current) throw new Error('Update canceled by user.');
        if (hasNewPreview) {
          previewPath = await uploadFileToGCS(
            reelToUpdate.customPreviewFile,
            'preview',
            onPreviewProgress,
            activeXHRs
          );
          completedSteps++;
        }

        // * --- Cancellation Check & Update Metadata ---
        if (isCanceled.current) throw new Error('Update canceled by user.');
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Updating metadata...',
          currentFileProgress: 100,
        })); // * Show 100% before API call

        // * Prepare the payload for the backend PUT request
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
          video_gcs_path: videoPath, // * Send the potentially new video path
          preview_gcs_path: previewPath, // * Send the potentially new or nulled preview path
          description: commonFormData.description || '',
          featured_celebrity:
            commonFormData.featuredCelebrity?.join(', ') || '',
          content_type: commonFormData.contentType || '',
          craft: commonFormData.craft || '',
          allow_download: commonFormData.allowDownload || false,
        };

        // * Call the backend PUT endpoint (which handles updating DB and deleting old GCS files)
        const response = await fetch(`${API_BASE_URL}/media-items/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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

        // * --- Final Success State ---
        setUploadStatus((prev) => ({
          ...prev,
          message: 'Changes saved successfully!',
          isSuccess: true,
          completedFiles: 1, // * Mark the single update operation as complete
        }));
      } catch (err) {
        console.error('An error occurred during update:', err);
        // * Only show error in UI if it wasn't a user cancellation
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
        // * Always clear tracking refs and schedule modal reset
        activeXHRs.current.clear();
        isCanceled.current = false;
        resetStatus();
      }
    },
    [resetStatus]
  ); // * Dependency on resetStatus

  // ! Context Value
  // * Memoize value to prevent unnecessary re-renders of consumers if state objects don't change identity
  const value = useMemo(
    () => ({
      // <-- This is line 483
      uploadStatus,
      startUpload,
      startUpdate,
      cancelUpload, // * Expose the cancel function
    }),
    [uploadStatus, startUpload, startUpdate, cancelUpload]
  );

  // ! Provider Return
  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
};
