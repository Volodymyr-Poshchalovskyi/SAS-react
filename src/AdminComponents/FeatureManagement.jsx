// src/AdminComponents/FeatureManagement.jsx

// ! React & Core Hooks
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';

// ! Lucide Icons
import {
  Upload, FileText, Trash2, Eye, EyeOff, KeyRound, Copy, Check,
  Loader2, CheckCircle, AlertTriangle, Download, Replace, CheckSquare,
  Sparkles, // Icon for password generation
} from 'lucide-react';

// ! Local Imports (Context & Config)
import { DataRefreshContext } from './Layout/AdminLayout'; // Context for manual refresh
const API_BASE_URL = import.meta.env.VITE_API_URL; // Backend API URL

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS
// ========================================================================== //

/**
 * ? Modal
 * A generic modal component for confirmations, displaying status, and forms.
 * Handles internal state for processing, success, and error display.
 */
const Modal = ({ isOpen, onClose, title, children, confirmText, onConfirm, successTitle = 'Success', successMessage }) => {
  // * Internal state to track the async confirmation action
  const [actionStatus, setActionStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // * Effect to handle Escape key press and reset state on open
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && actionStatus === 'idle') {
        onClose();
      }
    };
    if (isOpen) {
      setActionStatus('idle'); // Reset status when modal opens
      setErrorMessage('');
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, actionStatus]); // * actionStatus included to prevent closing while processing

  if (!isOpen) return null;

  // * Wrapper for the onConfirm prop to handle internal state changes
  const handleConfirmClick = async () => {
    setActionStatus('processing');
    setErrorMessage('');
    try {
      await onConfirm(); // * Execute the provided confirmation logic
      setActionStatus('success');
      setTimeout(() => { // * Auto-close after success
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Modal confirmation error:', error);
      setActionStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
      // * Keep modal open on error to show message
    }
  };

  // * Close handler that prevents closing while processing
  const handleClose = () => {
    if (actionStatus !== 'processing') {
      onClose();
    }
  };

  // * Shared button styles
  const baseButtonClasses = 'inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    // * Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onMouseDown={handleClose}>
      {/* Modal Content */}
      <div className="relative w-full max-w-md p-6 m-4 bg-white rounded-xl shadow-xl dark:bg-slate-900" onMouseDown={(e) => e.stopPropagation()}>
        {/* Success State */}
        {actionStatus === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">{successTitle}</h3>
            {successMessage && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{successMessage}</p>}
          </div>
        ) : (
          // * Idle, Processing, or Error State
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
              <button onClick={handleClose} disabled={actionStatus === 'processing'} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Body */}
            <div className="mt-4 text-slate-600 dark:text-slate-300">{children}</div>
            {/* Error Message */}
            {actionStatus === 'error' && errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={handleClose} disabled={actionStatus === 'processing'} className={`${baseButtonClasses} border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`}>Cancel</button>
              <button onClick={handleConfirmClick} disabled={actionStatus === 'processing'} className={`${baseButtonClasses} text-white bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500`}>
                {actionStatus === 'processing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmText}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ? FormSection
 * A styled container for grouping form elements with an optional title.
 */
const FormSection = ({ title, children }) => (
  <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6">
    {title && (
      <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
        {title}
      </h2>
    )}
    {children}
  </div>
);

/**
 * ? FormField
 * A simple wrapper component providing a label for a form input.
 */
const FormField = ({ label, children }) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    {children}
  </div>
);

// * Shared input styles
const inputClasses = 'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

/**
 * ? PasswordInputField
 * An input field specifically for passwords, including a toggle for visibility.
 * Visibility state is managed by the parent component via props.
 */
const PasswordInputField = ({ label, value, onChange, isVisible, onToggleVisibility }) => {
  return (
    <FormField label={label}>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••••••"
          className={`${inputClasses} pl-10 pr-10`} // * Padding for icons
        />
        {/* Visibility Toggle Button */}
        <button
          type="button"
          onClick={onToggleVisibility} // * Use the handler passed from parent
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FormField>
  );
};


// ========================================================================== //
// ! SECTION 2: SKELETON COMPONENTS
// ========================================================================== //

// * Skeleton loader for the PDF section
const PdfSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="w-32 h-9 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
);

// * Skeleton loader for the History section
const HistorySkeleton = () => (
    <div className="animate-pulse space-y-3">
      {[...Array(2)].map((_, i) => ( // * Show 2 skeleton rows initially
        <div key={i} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
);

// * Skeleton loader for the Password section
const PasswordSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-md"></div>
    </div>
);


// ========================================================================== //
// ! SECTION 3: MAIN COMPONENT - FeatureManagement
// ========================================================================== //

function FeatureManagement() {
  // ! State Variables
  // * PDF File State
  const [currentPdf, setCurrentPdf] = useState(null); // { id, title, gcs_path, created_at }
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfToUpload, setPdfToUpload] = useState(null); // File object selected by user
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // * Password State
  const [currentPassword, setCurrentPassword] = useState(null); // The actual password string
  const [isPasswordLoading, setIsPasswordLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Visibility for current password display
  const [copySuccess, setCopySuccess] = useState(false); // Feedback for copy button
  const [isModalOpen, setIsModalOpen] = useState(false); // Password change modal visibility
  const [newPassword, setNewPassword] = useState(''); // Input for new password in modal
  const [confirmPassword, setConfirmPassword] = useState(''); // Input for confirming new password
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false); // Visibility for new password input
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false); // Visibility for confirm password input

  // * History & Stats State
  const [fileHistory, setFileHistory] = useState([]); // Array of file objects with stats
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); // Controls "Show More/Less" for history

  // ! Refs & Context
  const fileInputRef = useRef(null); // Ref for hidden file input
  const { refreshKey } = useContext(DataRefreshContext); // For triggering manual refresh

  // ! Effect: Initial Data Fetch
  // * Fetches current PDF, password, and history on mount and manual refresh
  useEffect(() => {
    const fetchInitialData = async () => {
      // * Reset loading/error states
      setIsPdfLoading(true);
      setIsPasswordLoading(true);
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        // * Fetch all data concurrently
        await Promise.all([
          // Fetch Current PDF
          (async () => {
            const pdfResponse = await fetch(`${API_BASE_URL}/feature-pdf/current`);
            if (!pdfResponse.ok) throw new Error(`PDF Fetch Error: ${pdfResponse.statusText}`);
            const pdfData = await pdfResponse.json();
            setCurrentPdf(pdfData); // * Can be null if no PDF exists
          })(),
          // Fetch Current Password
          (async () => {
            const passwordResponse = await fetch(`${API_BASE_URL}/feature-pdf-password/current`);
             if (!passwordResponse.ok) throw new Error(`Password Fetch Error: ${passwordResponse.statusText}`);
            const passwordData = await passwordResponse.json();
            setCurrentPassword(passwordData.value); // * Can be null if no password exists
          })(),
          // Fetch PDF History with Stats
          (async () => {
            const historyResponse = await fetch(`${API_BASE_URL}/feature-pdf/history-with-stats`);
            if (!historyResponse.ok) throw new Error(`History Fetch Error: ${historyResponse.statusText}`);
            setFileHistory(await historyResponse.json());
          })()
        ]);
      } catch (error) {
          console.error("Error fetching initial data:", error);
          setHistoryError(error.message || 'Could not load required data.'); // * Display a general error
      } finally {
        // * Ensure all loading states are false regardless of success/error
        setIsPdfLoading(false);
        setIsPasswordLoading(false);
        setIsHistoryLoading(false);
      }
    };

    fetchInitialData();
  }, [refreshKey]); // * Re-run effect when refreshKey changes

  // ! PDF Handlers
  /**
   * Handles the selection of a new PDF file from the input.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfToUpload(file);
      setUploadError(null); // * Clear previous errors
    } else if (file) {
      // * If a file is selected but it's not a PDF
      setPdfToUpload(null);
      alert('Please select a file in PDF format.');
      if (fileInputRef.current) fileInputRef.current.value = ''; // * Reset file input
    }
  };

  /**
   * Handles the PDF upload process: gets signed URL, uploads to GCS, saves metadata.
   */
  const handleUploadPdf = async () => {
    if (!pdfToUpload) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // * 1. Get Signed URL from backend
      const signedUrlRes = await fetch(`${API_BASE_URL}/generate-upload-url`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: pdfToUpload.name, fileType: pdfToUpload.type, destination: 'feature_pdf',
        }),
      });
      if (!signedUrlRes.ok) {
         const errorText = await signedUrlRes.text();
         throw new Error(`Could not get upload URL: ${errorText}`);
      }
      const { signedUrl, gcsPath } = await signedUrlRes.json();

      // * 2. Upload directly to GCS using XHR for progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUrl, true);
        xhr.setRequestHeader('Content-Type', pdfToUpload.type);
        // * Progress handler
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };
        // * Success/Error handlers
        xhr.onload = () => (xhr.status === 200 || xhr.status === 201) ? resolve() : reject(new Error(`Upload to GCS failed with status ${xhr.status}.`));
        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(pdfToUpload);
      });

      // * 3. Save metadata (title, GCS path) to backend database
      const saveMetaRes = await fetch(`${API_BASE_URL}/feature-pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pdfToUpload.name, gcs_path: gcsPath }),
      });
       if (!saveMetaRes.ok) {
         const errorText = await saveMetaRes.text();
         throw new Error(`Could not save file metadata: ${errorText}`);
      }
      const { newFile } = await saveMetaRes.json();

      // * 4. Update UI state on success
      setCurrentPdf(newFile);
      // * Add new file to the beginning of the history (with initial stats)
      setFileHistory(prev => [{ ...newFile, visits: 0, avg_completion_percentage: 0 }, ...prev]);
      setPdfToUpload(null); // * Clear the selected file
      if (fileInputRef.current) fileInputRef.current.value = ''; // * Reset file input

    } catch (error) {
      console.error("PDF Upload Error:", error);
      setUploadError(error.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
      // * Reset progress after upload attempt (success or fail)
      // * Consider delaying reset on error if progress bar shows failure state
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  /**
   * Handles downloading the current PDF file via a signed GCS URL.
   */
  const handleDownloadPdf = async () => {
    if (!currentPdf?.gcs_path) return;
    try {
        // * 1. Get signed read URL from backend
        const response = await fetch(`${API_BASE_URL}/generate-read-urls`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gcsPaths: [currentPdf.gcs_path] }),
        });
        if (!response.ok) throw new Error('Failed to get download link');
        const urlsMap = await response.json();
        const downloadUrl = urlsMap[currentPdf.gcs_path];

        // * 2. Trigger download using an anchor element
        if (downloadUrl) {
            const link = document.createElement('a');
            link.href = downloadUrl;
            // * Suggest the original filename for download
            link.setAttribute('download', currentPdf.title || 'feature-document.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // * Clean up the temporary link
        } else {
             throw new Error('Download URL was not provided by the server.');
        }
    } catch (error) {
        console.error("Download error:", error);
        alert(`Could not download the file: ${error.message}`);
    }
  };

  // ! Password Handlers
  /**
   * Toggles the visibility of the *current* password display.
   */
  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  /**
   * Copies the current password to the clipboard.
   */
  const handleCopyPassword = () => {
      if (!currentPassword) return;
      navigator.clipboard.writeText(currentPassword).then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000); // * Show success feedback for 2s
      }).catch(err => {
          console.error('Failed to copy password:', err);
          alert('Could not copy password to clipboard.');
      });
  };

  /**
   * Closes the password change modal and resets its form state.
   * Uses useCallback for stability if passed to child components.
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // * Reset form fields and visibility states after modal closes
    setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setIsNewPasswordVisible(false);
        setIsConfirmPasswordVisible(false);
    }, 300); // * Delay allows fade-out animation
  }, []);

  /**
   * Handles the confirmation logic within the password change modal.
   * Performs validation and calls the backend API.
   */
  const handleConfirmPasswordChange = async () => {
    // * Basic validation
    if (!newPassword || !confirmPassword) throw new Error('Please fill in both password fields.');
    if (newPassword.length < 5) throw new Error('Password must be at least 5 characters long.'); // * Example validation
    if (newPassword !== confirmPassword) throw new Error('Passwords do not match. Please try again.');

    // * API Call
    const response = await fetch(`${API_BASE_URL}/feature-pdf-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newPassword }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // * Try parsing error
        throw new Error(errorData.error || 'Failed to update password.');
    }
    // * Update UI state on success
    setCurrentPassword(newPassword);
    // * Modal will close automatically via its internal state management
  };

  /**
   * Generates a random 5-character alphanumeric password and fills the modal fields.
   */
  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedPassword = '';
    for (let i = 0; i < 5; i++) { // * Generate 5 characters
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // * Set both fields and make them visible
    setNewPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setIsNewPasswordVisible(true);
    setIsConfirmPasswordVisible(true);
  };

  // ! Render Logic
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Feature Management
      </h1>

      {/* --- PDF Upload Section --- */}
      <FormSection title="Document Management (PDF only)">
        {isPdfLoading ? <PdfSkeleton /> : currentPdf ? (
            // * Display Current PDF Info
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {/* File Icon & Name */}
                    <div className='flex items-center gap-3 min-w-0'> {/* min-w-0 for truncation */}
                        <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate" title={currentPdf.title}>
                            {currentPdf.title}
                        </span>
                    </div>
                    {/* Download Button */}
                    <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0">
                        <Download size={16} /> Download
                    </button>
                </div>
                {/* Replace Button */}
                <div className="text-center">
                    <button onClick={() => fileInputRef.current?.click()} className="text-sm text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-2">
                        <Replace size={16} /> Replace current file
                    </button>
                </div>
            </div>
        ) : (
            // * Empty State for PDF
            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <p>No document has been uploaded yet.</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    Upload the first document
                </button>
            </div>
        )}
        {/* Hidden File Input */}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="application/pdf" />
        {/* UI for Selected File (Ready for Upload) */}
        {pdfToUpload && (
            <div className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">New file ready for upload:</h3>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <p className="text-sm truncate font-mono" title={pdfToUpload.name}>{pdfToUpload.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Remove Selected File Button */}
                        <button onClick={() => { setPdfToUpload(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white" aria-label="Remove selected file"><Trash2 size={16} /></button>
                        {/* Confirm Upload Button */}
                        <button onClick={handleUploadPdf} disabled={isUploading} className="px-4 py-1.5 text-sm bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 disabled:bg-slate-400 flex items-center justify-center min-w-[120px]">
                            {isUploading ? <Loader2 className="animate-spin" /> : 'Confirm Upload'}
                        </button>
                    </div>
                </div>
                {/* Upload Progress Bar */}
                {isUploading && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
                {/* Upload Error Message */}
                {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
            </div>
        )}
      </FormSection>

      {/* --- Analytics & History Section --- */}
      <FormSection title="Analytics & History">
        {isHistoryLoading ? <HistorySkeleton /> : historyError ? (
          // * Error State for History
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{historyError}</span>
          </div>
        ) : fileHistory.length === 0 ? (
          // * Empty State for History
          <div className="text-center p-8 text-slate-500">
            <p>No files have been uploaded yet.</p>
          </div>
        ) : (
          // * Display History List
          <div>
            <div className="space-y-3">
              {(isHistoryExpanded ? fileHistory : fileHistory.slice(0, 2)).map((file) => ( // * Show 2 initially or all if expanded
                <div key={file.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* File Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={file.title}>
                          {file.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Uploaded on: {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 text-sm w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <div className="flex items-center gap-2" title="Total visits">
                        <Eye size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">{file.visits}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Average Completion Percentage">
                        <CheckSquare size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {(file.avg_completion_percentage || 0).toFixed(1)}% {/* Default to 0 if null */}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* "Show More/Less" Button */}
            {fileHistory.length > 2 && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded"
                >
                  {isHistoryExpanded ? 'Show less' : `Show all (${fileHistory.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </FormSection>

      {/* --- Password Change Section --- */}
      <FormSection title="Security Settings">
        <FormField label="Current Password">
            {isPasswordLoading ? <PasswordSkeleton /> : (
                 <div className="relative">
                    {/* Icon inside input */}
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    {/* Display Area (looks like input but isn't) */}
                    <div className={`${inputClasses} pl-10 pr-20 flex items-center bg-slate-50 dark:bg-slate-800/50 select-none`}>
                        {currentPassword ? (
                            <span className="font-mono tracking-wider">
                              {/* Toggle between text and dots */}
                              {isPasswordVisible ? currentPassword : '•••••'} {/* Show 5 dots regardless of length */}
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Password not set yet.</span>
                        )}
                    </div>
                    {/* Action Buttons (Copy, Show/Hide) */}
                    <div className="absolute inset-y-0 right-0 flex items-center">
                        <button type="button" onClick={handleCopyPassword} disabled={!currentPassword} className="flex items-center justify-center w-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Copy password">
                            {copySuccess ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                        <button type="button" onClick={togglePasswordVisibility} disabled={!currentPassword} className="flex items-center justify-center w-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}>
                            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </FormField>
        {/* Change Password Button */}
        <div className="flex justify-end mt-6">
          <button type="button" onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-all">
            Change Password
          </button>
        </div>
      </FormSection>

      {/* --- Modal for changing password --- */}
      <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Change Feature Password"
          confirmText="Confirm Change"
          onConfirm={handleConfirmPasswordChange}
          successTitle="Password Updated"
          successMessage="The feature password has been changed successfully."
      >
        <div className="space-y-4">
            {/* Header with Generate Button */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Please enter and confirm the new 5-character password.</p>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                title="Generate a random 5-character password"
              >
                <Sparkles size={14} />
                Generate
              </button>
            </div>
            {/* New Password Input */}
            <PasswordInputField
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              isVisible={isNewPasswordVisible}
              onToggleVisibility={() => setIsNewPasswordVisible(prev => !prev)}
            />
            {/* Confirm Password Input */}
            <PasswordInputField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isVisible={isConfirmPasswordVisible}
              onToggleVisibility={() => setIsConfirmPasswordVisible(prev => !prev)}
            />
        </div>
      </Modal>
    </div>
  );
}

export default FeatureManagement;