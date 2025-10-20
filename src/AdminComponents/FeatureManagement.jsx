// ✨ ЗМІНА 1: Імпортуємо useContext та DataRefreshContext (без змін)
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Check,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Download,
  Replace,
  CheckSquare,
  Sparkles, // ✨ ЗМІНА 2: Додаємо іконку для кнопки генерації
} from 'lucide-react';
// Переконайтеся, що шлях до AdminLayout правильний
import { DataRefreshContext } from './Layout/AdminLayout';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// =======================
// Helper Components (Modal, FormSection, etc.)
// =======================
const Modal = ({ isOpen, onClose, title, children, confirmText, onConfirm, successTitle = 'Success', successMessage }) => {
  const [actionStatus, setActionStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      setActionStatus('idle');
      setErrorMessage('');
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setActionStatus('processing');
    setErrorMessage('');
    try {
      await onConfirm();
      setActionStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setActionStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
  };
  
  const handleClose = () => {
    if (actionStatus !== 'processing') {
      onClose();
    }
  };

  const baseButtonClasses = 'inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onMouseDown={handleClose}>
      <div className="relative w-full max-w-md p-6 m-4 bg-white rounded-xl shadow-xl dark:bg-slate-900" onMouseDown={(e) => e.stopPropagation()}>
        {actionStatus === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">{successTitle}</h3>
            {successMessage && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{successMessage}</p>}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
              <button onClick={handleClose} disabled={actionStatus === 'processing'} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-4 text-slate-600 dark:text-slate-300">{children}</div>
            {actionStatus === 'error' && errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
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
const FormSection = ({ title, children }) => ( <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6"> {title && ( <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider"> {title} </h2> )} {children} </div> );
const FormField = ({ label, children }) => ( <div className="mb-4"> <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"> {label} </label> {children} </div> );
const inputClasses = 'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

// ✨ ЗМІНА 3: Модифікуємо PasswordInputField, щоб він приймав isVisible та onToggleVisibility як props
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
          className={`${inputClasses} pl-10 pr-10`}
        />
        <button
          type="button"
          onClick={onToggleVisibility} // Використовуємо onToggleVisibility з props
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label={isVisible ? 'Hide password' : 'Show password'} // Використовуємо isVisible з props
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />} {/* Використовуємо isVisible з props */}
        </button>
      </div>
    </FormField>
  );
};


// --- Main Page Component ---
function FeatureManagement() {
  // States for PDF File
  const [currentPdf, setCurrentPdf] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfToUpload, setPdfToUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // States for Password
  const [currentPassword, setCurrentPassword] = useState(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // ✨ ЗМІНА 4: Додаємо стани для видимості паролів у модалці
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // States for stats and history
  const [fileHistory, setFileHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  // ✨ ЗМІНА 5: Встановлюємо початковий стан isHistoryExpanded на false
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  
  // (без змін) Отримуємо ключ оновлення з контексту
  const { refreshKey } = useContext(DataRefreshContext);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      // Set all loading states to true at the beginning of a fetch
      setIsPdfLoading(true);
      setIsPasswordLoading(true);
      setIsHistoryLoading(true);
      setHistoryError(null);
      
      try {
        await Promise.all([
          // Fetch PDF
          (async () => {
            const pdfResponse = await fetch(`${API_BASE_URL}/feature-pdf/current`);
            if (pdfResponse.ok) setCurrentPdf(await pdfResponse.json());
            else throw new Error('Failed to fetch PDF data');
          })(),
          // Fetch Password
          (async () => {
            const passwordResponse = await fetch(`${API_BASE_URL}/feature-pdf-password/current`);
            if (passwordResponse.ok) {
              const passwordData = await passwordResponse.json();
              setCurrentPassword(passwordData.value);
            } else throw new Error('Failed to fetch password');
          })(),
          // Fetch History
          (async () => {
            const historyResponse = await fetch(`${API_BASE_URL}/feature-pdf/history-with-stats`);
            if (historyResponse.ok) {
              setFileHistory(await historyResponse.json());
            } else throw new Error('Failed to fetch file history');
          })()
        ]);
      } catch (error) {
          console.error("Error fetching data:", error);
          // Handle specific errors if needed, e.g., setHistoryError
          setHistoryError('Could not load some or all data.');
      } finally {
        // Set all loading states to false after all fetches are complete
        setIsPdfLoading(false);
        setIsPasswordLoading(false);
        setIsHistoryLoading(false);
      }
    };

    fetchInitialData();
  // (без змін) Додаємо refreshKey до масиву залежностей
  }, [refreshKey]);
  
  // --- Handlers for PDF File, Password, etc. (no changes in logic) ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfToUpload(file);
      setUploadError(null);
    } else if (file) {
      setPdfToUpload(null);
      alert('Please select a file in PDF format.');
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfToUpload) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const signedUrlRes = await fetch(`${API_BASE_URL}/generate-upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: pdfToUpload.name,
          fileType: pdfToUpload.type,
          destination: 'feature_pdf',
        }),
      });
      if (!signedUrlRes.ok) throw new Error('Could not get an upload URL.');
      const { signedUrl, gcsPath } = await signedUrlRes.json();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUrl, true);
        xhr.setRequestHeader('Content-Type', pdfToUpload.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload to GCS failed.')));
        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(pdfToUpload);
      });

      const saveMetaRes = await fetch(`${API_BASE_URL}/feature-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pdfToUpload.name, gcs_path: gcsPath }),
      });
      if (!saveMetaRes.ok) throw new Error('Could not save file metadata.');
      const { newFile } = await saveMetaRes.json();
      
      setCurrentPdf(newFile);
      setFileHistory(prev => [{ ...newFile, visits: 0, avg_completion_percentage: 0 }, ...prev]);
      setPdfToUpload(null);

    } catch (error) {
      console.error(error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentPdf?.gcs_path) return;
    try {
        const response = await fetch(`${API_BASE_URL}/generate-read-urls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gcsPaths: [currentPdf.gcs_path] }),
        });
        if (!response.ok) throw new Error('Failed to get download link');
        const urlsMap = await response.json();
        const downloadUrl = urlsMap[currentPdf.gcs_path];
        if (downloadUrl) {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', currentPdf.title);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error("Download error:", error);
        alert("Could not download the file.");
    }
  };

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);
  const handleCopyPassword = () => { if (!currentPassword) return; navigator.clipboard.writeText(currentPassword).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }); };
  
  // ✨ ЗМІНА 6: Оновлюємо handleCloseModal, щоб скидати стани видимості
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setIsNewPasswordVisible(false); // Скидаємо видимість
    setIsConfirmPasswordVisible(false); // Скидаємо видимість
  }, []);

  const handleConfirmPasswordChange = async () => {
    if (!newPassword || !confirmPassword) throw new Error('Please fill in both password fields.');
    if (newPassword !== confirmPassword) throw new Error('Passwords do not match. Please try again.');
    const response = await fetch(`${API_BASE_URL}/feature-pdf-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: newPassword }),
    });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to update password.'); }
    setCurrentPassword(newPassword);
  };
  
  // ✨ ЗМІНА 7: Додаємо функцію для генерації пароля
  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedPassword = '';
    for (let i = 0; i < 5; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setIsNewPasswordVisible(true);
    setIsConfirmPasswordVisible(true);
  };

  // --- Skeleton Components for Loading State ---
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

  const HistorySkeleton = () => (
    <div className="animate-pulse space-y-3">
      {[...Array(3)].map((_, i) => (
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

  const PasswordSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-md"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Feature Management
      </h1>

      {/* PDF Upload Section (без змін) */}
      <FormSection title="Document Management (PDF only)">
        {isPdfLoading ? <PdfSkeleton /> : currentPdf ? (
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className='flex items-center gap-3 min-w-0'>
                        <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate" title={currentPdf.title}>
                            {currentPdf.title}
                        </span>
                    </div>
                    <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Download size={16} /> Download
                    </button>
                </div>
                <div className="text-center">
                    <button onClick={() => fileInputRef.current.click()} className="text-sm text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-2">
                        <Replace size={16} /> Replace current file
                    </button>
                </div>
            </div>
        ) : (
            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <p>No document has been uploaded yet.</p>
                <button onClick={() => fileInputRef.current.click()} className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    Upload the first document
                </button>
            </div>
        )}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="application/pdf" />
        {pdfToUpload && (
            <div className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">New file ready for upload:</h3>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <p className="text-sm truncate font-mono" title={pdfToUpload.name}>{pdfToUpload.name}</p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPdfToUpload(null)} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white"><Trash2 size={16} /></button>
                        <button onClick={handleUploadPdf} disabled={isUploading} className="px-4 py-1.5 text-sm bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 disabled:bg-slate-400">
                            {isUploading ? <Loader2 className="animate-spin" /> : 'Confirm Upload'}
                        </button>
                    </div>
                </div>
                {isUploading && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                        <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
                {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
            </div>
        )}
      </FormSection>

      {/* Analytics & History Section */}
      <FormSection title="Analytics & History">
        {isHistoryLoading ? <HistorySkeleton /> : historyError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>Could not load history: {historyError}</span>
          </div>
        ) : fileHistory.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <p>No files have been uploaded yet.</p>
          </div>
        ) : (
          <div>
            <div className="space-y-3">
              {/* ✨ ЗМІНА 8: Логіка рендерингу (показувати 2 або всі) залишається, але початковий стан (Зміна 5) робить її згорнутою */}
              {(isHistoryExpanded ? fileHistory : fileHistory.slice(0, 2)).map((file) => (
                <div key={file.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                    <div className="flex items-center gap-4 sm:gap-6 text-sm w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2" title="Total visits">
                        <Eye size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">{file.visits}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Average Completion Percentage">
                        <CheckSquare size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {file.avg_completion_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* (без змін) Кнопка "Show all" / "Show less" */}
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

      {/* Password Change Section (без змін) */}
      <FormSection title="Security Settings">
        <FormField label="Current Password">
            {isPasswordLoading ? <PasswordSkeleton /> : (
                 <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <div className={`${inputClasses} pl-10 pr-20 flex items-center bg-slate-50 dark:bg-slate-800/50 select-none`}>
                        {currentPassword ? ( <span className="font-mono tracking-wider"> {isPasswordVisible ? currentPassword : '••••••••••••'} </span> ) : ( <span className="text-slate-400 italic">Password not set yet.</span> )}
                    </div>
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
        <div className="flex justify-end mt-6">
          <button type="button" onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-all"> Change Password </button>
        </div>
      </FormSection>

      {/* Modal for changing password */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Change Your Password" confirmText="Confirm Change" onConfirm={handleConfirmPasswordChange} successTitle="Password Updated" successMessage="Your password has been changed successfully.">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Please enter your new password below.</p>
              {/* ✨ ЗМІНА 9: Додаємо кнопку "Generate Password" */}
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                <Sparkles size={14} />
                Generate
              </button>
            </div>
            {/* ✨ ЗМІНА 10: Передаємо стани видимості та хендлери в PasswordInputField */}
            <PasswordInputField
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              isVisible={isNewPasswordVisible}
              onToggleVisibility={() => setIsNewPasswordVisible(prev => !prev)}
            />
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