// src/AdminComponents/Layout/CreateReel.jsx

// ! React & Router
// Додаємо useContext назад, якщо будемо використовувати DataRefreshContext пізніше
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useContext,
  useCallback,
} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// Поки що закоментуємо, щоб спростити
// import { DataRefreshContext } from './AdminLayout';

// ! Libraries
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import Hls from 'hls.js';

// ! Local Imports (Context & API)
import { useUpload } from '../../context/UploadContext'; // Використовуємо НОВИЙ контекст
import { useAuth } from '../../hooks/useAuth'; // Використовуємо НОВИЙ AuthContext
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS & UTILITIES
// ========================================================================== //

// ... (Весь код хелперів залишається БЕЗ ЗМІН: InlineHlsPlayer, compressImage, іконки, FormSection, FormField, inputClasses, SingleSearchableSelect, MultiSelectCategories, MultiCreatableSelect) ...
/**
 * ? InlineHlsPlayer
 * A video player component with built-in HLS (m3u8) support.
 * Uses Hls.js library if supported, otherwise falls back to native playback.
 */
export const InlineHlsPlayer = forwardRef(({ src, ...props }, ref) => {
  const internalVideoRef = useRef(null);
  const videoRef = ref || internalVideoRef;

  useEffect(() => {
    if (!src || !videoRef.current) return;
    const video = videoRef.current;
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, videoRef]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain rounded-md"
      playsInline
      {...props}
    />
  );
});
InlineHlsPlayer.displayName = 'InlineHlsPlayer';

/**
 * ? compressImage
 */
const compressImage = (file, maxSize = 800) => {
  // ... (код без змін) ...
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const { width, height } = img;
        if (width <= maxSize && height <= maxSize) {
          resolve(file);
          return;
        }
        let newWidth, newHeight;
        if (width > height) {
          newWidth = maxSize;
          newHeight = (height * maxSize) / width;
        } else {
          newHeight = maxSize;
          newWidth = (width * maxSize) / height;
        }
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed.'));
              return;
            }
            const compressedFile = new File(
              [blob],
              `preview_${Date.now()}.jpg`,
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          0.9
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- Icon Components ---
const UploadIcon = () => (
  /* ... (код без змін) ... */
  <svg
    className="w-12 h-12 text-slate-400"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 16"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
    />
  </svg>
);
const CalendarIcon = () => (
  /* ... (код без змін) ... */
  <svg
    className="w-5 h-5 text-slate-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// --- Form Layout Components ---
const FormSection = (
  { title, children, hasSeparator = true } /* ... (код без змін) ... */
) => (
  <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6">
    {title && (
      <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
        {title}
      </h2>
    )}
    {children}
    {hasSeparator && (
      <div className="mt-6 border-t border-slate-200 dark:border-slate-800"></div>
    )}
  </div>
);
const FormField = (
  { label, children, required = false } /* ... (код без змін) ... */
) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);
const inputClasses =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

// --- Form Select Components ---
const SingleSearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  /* ... (код без змін) ... */
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.name.toLowerCase().includes((inputValue || '').toLowerCase())
      ),
    [inputValue, options]
  );
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (!isOpen) {
      const isValid = options.some((opt) => opt.name === inputValue);
      if (!isValid) setInputValue(value || '');
    }
  }, [isOpen, value, options, inputValue]);
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  const handleSelectOption = (optionName) => {
    onChange(optionName);
    setInputValue(optionName);
    setIsOpen(false);
  };
  return (
    <FormField label={label} required={required}>
      {' '}
      <div className="relative" ref={wrapperRef}>
        {' '}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={inputClasses}
          required={required}
        />{' '}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {' '}
            {filteredOptions.length > 0 ? (
              <ul>
                {' '}
                {filteredOptions.map((option) => (
                  <li
                    key={option.id}
                    onMouseDown={() => handleSelectOption(option.name)}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {' '}
                    {option.name}{' '}
                  </li>
                ))}{' '}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                {' '}
                No matches found.{' '}
              </div>
            )}{' '}
          </div>
        )}{' '}
      </div>{' '}
    </FormField>
  );
};
const MultiSelectCategories = ({
  label,
  options,
  selectedOptions,
  onChange,
  placeholder,
  limit = 10,
}) => {
  /* ... (код без змін) ... */
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const availableOptions = useMemo(
    () =>
      options
        .filter((opt) => !selectedOptions.includes(opt.name))
        .filter((opt) =>
          opt.name.toLowerCase().includes(inputValue.toLowerCase())
        ),
    [options, selectedOptions, inputValue]
  );
  const handleSelect = (optionName) => {
    if (selectedOptions.length < limit)
      onChange([...selectedOptions, optionName]);
    setInputValue('');
    setIsOpen(false);
  };
  const handleRemove = (optionName) =>
    onChange(selectedOptions.filter((opt) => opt !== optionName));
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);
  return (
    <FormField label={`${label} (${selectedOptions.length}/${limit})`}>
      {' '}
      <div className="relative" ref={wrapperRef}>
        {' '}
        <div
          className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-300 dark:border-slate-700 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          {' '}
          {selectedOptions.map((option) => (
            <span
              key={option}
              className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full"
            >
              {' '}
              {option}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option);
                }}
                className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"
              >
                {' '}
                <X size={14} />{' '}
              </button>{' '}
            </span>
          ))}{' '}
          {selectedOptions.length < limit && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-grow bg-transparent focus:outline-none p-1 text-sm"
            />
          )}{' '}
        </div>{' '}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {' '}
            {availableOptions.length > 0 ? (
              <ul>
                {' '}
                {availableOptions.map((option) => (
                  <li
                    key={option.id}
                    onMouseDown={() => handleSelect(option.name)}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {' '}
                    {option.name}{' '}
                  </li>
                ))}{' '}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                {' '}
                No available options.{' '}
              </div>
            )}{' '}
          </div>
        )}{' '}
      </div>{' '}
    </FormField>
  );
};
const MultiCreatableSelect = ({
  label,
  options,
  selectedOptions,
  onChange,
  placeholder,
  limit = 10,
  required = false,
}) => {
  /* ... (код без змін) ... */
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const availableOptions = useMemo(
    () =>
      options.filter(
        (opt) =>
          !selectedOptions.includes(opt.name) &&
          opt.name.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [options, selectedOptions, inputValue]
  );
  const handleAdd = (itemName) => {
    const trimmedItem = itemName.trim();
    if (
      trimmedItem &&
      selectedOptions.length < limit &&
      !selectedOptions.find(
        (opt) => opt.toLowerCase() === trimmedItem.toLowerCase()
      )
    ) {
      onChange([...selectedOptions, trimmedItem]);
    }
    setInputValue('');
    setIsOpen(false);
  };
  const handleRemove = (itemName) =>
    onChange(selectedOptions.filter((opt) => opt !== itemName));
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setInputValue('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);
  const canAddCustom =
    inputValue.trim() &&
    !options.some(
      (opt) => opt.name.toLowerCase() === inputValue.trim().toLowerCase()
    ) &&
    !selectedOptions.some(
      (opt) => opt.toLowerCase() === inputValue.trim().toLowerCase()
    );
  return (
    <FormField
      label={`${label} (${selectedOptions.length}/${limit})`}
      required={required}
    >
      {' '}
      <input
        type="text"
        value={selectedOptions.join(',')}
        required={required}
        className="hidden"
        onChange={() => {}}
      />{' '}
      <div className="relative" ref={wrapperRef}>
        {' '}
        <div
          className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-300 dark:border-slate-700 rounded-md"
          onClick={() => {
            setIsOpen(true);
            wrapperRef.current
              .querySelector('input[type=text]:not(.hidden)')
              .focus();
          }}
        >
          {' '}
          {selectedOptions.map((option) => (
            <span
              key={option}
              className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full"
            >
              {' '}
              {option}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option);
                }}
                className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"
              >
                {' '}
                <X size={14} />{' '}
              </button>{' '}
            </span>
          ))}{' '}
          {selectedOptions.length < limit && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-grow bg-transparent focus:outline-none p-1 text-sm"
            />
          )}{' '}
        </div>{' '}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {' '}
            <ul onMouseDown={(e) => e.preventDefault()}>
              {' '}
              {canAddCustom && (
                <li
                  onClick={() => handleAdd(inputValue)}
                  className="px-3 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer italic"
                >
                  {' '}
                  Add "{inputValue.trim()}"{' '}
                </li>
              )}{' '}
              {availableOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleAdd(option.name)}
                  className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {' '}
                  {option.name}{' '}
                </li>
              ))}{' '}
              {!canAddCustom && availableOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-slate-500">
                  {' '}
                  No available options{' '}
                </div>
              )}{' '}
            </ul>{' '}
          </div>
        )}{' '}
      </div>{' '}
    </FormField>
  );
};

// ========================================================================== //
// ! SECTION 2: REEL PARTIAL FORM (SUB-COMPONENT)
// ========================================================================== //

const ReelPartialForm = ({ reel, onUpdate, onFilesSelected, isEditMode }) => {
  /* ... (код без змін) ... */
  const {
    id,
    title,
    selectedFile,
    customPreviewFile,
    mainPreviewUrl,
    customPreviewUrl,
  } = reel;
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [editorVideoUrl, setEditorVideoUrl] = useState(null);
  const fileInputRef = useRef(null);
  const previewFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const isVideo = useMemo(() => {
    if (selectedFile) return selectedFile.type.startsWith('video/');
    if (mainPreviewUrl) {
      const path = mainPreviewUrl.toLowerCase();
      return (
        !path.endsWith('.jpg') &&
        !path.endsWith('.jpeg') &&
        !path.endsWith('.png') &&
        !path.endsWith('.gif')
      );
    }
    return false;
  }, [selectedFile, mainPreviewUrl]);
  const isHls = useMemo(() => {
    return mainPreviewUrl
      ? mainPreviewUrl.toLowerCase().includes('.m3u8')
      : false;
  }, [mainPreviewUrl]);
  const isImageFile = (file) => {
    if (!file) return false;
    const imageMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return imageMimeTypes.includes(file.type);
  };
  useEffect(() => {
    if (
      isEditMode &&
      selectedFile &&
      selectedFile.type.startsWith('video/') &&
      !customPreviewFile
    ) {
      let isCleanedUp = false;
      const videoElement = document.createElement('video');
      const timer = setTimeout(() => {
        console.error('Video preview generation timed out.');
        cleanup();
      }, 5000);
      const cleanup = () => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        clearTimeout(timer);
        videoElement.removeEventListener('loadeddata', onLoadedData);
        videoElement.removeEventListener('error', onError);
        if (videoElement.src) {
          URL.revokeObjectURL(videoElement.src);
        }
      };
      const processAndSetPreview = async (capturedFile) => {
        try {
          const compressedPreview = await compressImage(capturedFile);
          onUpdate(id, { customPreviewFile: compressedPreview });
        } catch (error) {
          console.error('Failed to compress auto-generated preview:', error);
          onUpdate(id, { customPreviewFile: capturedFile });
        }
      };
      const onLoadedData = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const capturedFile = new File(
                [blob],
                `preview_${Date.now()}.jpg`,
                { type: 'image/jpeg' }
              );
              processAndSetPreview(capturedFile);
            }
            cleanup();
          },
          'image/jpeg',
          0.95
        );
      };
      const onError = (e) => {
        console.error('Error loading video for preview generation.', e);
        cleanup();
      };
      videoElement.addEventListener('loadeddata', onLoadedData);
      videoElement.addEventListener('error', onError);
      videoElement.src = URL.createObjectURL(selectedFile);
      videoElement.muted = false;
      videoElement.playsInline = true;
      videoElement.currentTime = 0;
      videoElement.play().catch(onError);
    }
  }, [selectedFile, customPreviewFile, id, onUpdate, isEditMode]);
  useEffect(() => {
    return () => {
      if (editorVideoUrl && editorVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editorVideoUrl);
      }
    };
  }, [editorVideoUrl]);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onFilesSelected(e.dataTransfer.files, id);
  };
  const handleFileInputChange = (e) => {
    onFilesSelected(e.target.files, id);
  };
  const handleRemoveFile = () => onFilesSelected(null, id);
  const handleCustomPreviewSelect = async (e) => {
    const file = e.target.files[0];
    if (isImageFile(file)) {
      try {
        const compressedFile = await compressImage(file);
        onUpdate(id, { customPreviewFile: compressedFile });
      } catch (error) {
        console.error('Failed to compress selected preview:', error);
        onUpdate(id, { customPreviewFile: file });
      }
      setIsEditingPreview(false);
    }
  };
  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const capturedFile = new File([blob], `preview_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          try {
            const compressedFile = await compressImage(capturedFile);
            onUpdate(id, { customPreviewFile: compressedFile });
          } catch (error) {
            console.error('Failed to compress captured frame:', error);
            onUpdate(id, { customPreviewFile: capturedFile });
          }
          setIsEditingPreview(false);
        }
      },
      'image/jpeg',
      0.95
    );
  };
  const handleOpenPreviewEditor = () => {
    if (isVideo) {
      const urlToUse = selectedFile
        ? URL.createObjectURL(selectedFile)
        : mainPreviewUrl;
      setEditorVideoUrl(urlToUse);
      setIsEditingPreview(true);
    } else {
      previewFileInputRef.current.click();
    }
  };
  const VideoFrameSelector = () => {
    const isHlsEditor = editorVideoUrl
      ? editorVideoUrl.toLowerCase().includes('.m3u8')
      : false;
    return (
      <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        {' '}
        {isHlsEditor ? (
          <InlineHlsPlayer
            ref={videoRef}
            src={editorVideoUrl}
            controls
            crossOrigin="anonymous"
            className="w-full h-auto max-h-[400px] rounded-md mb-4 object-contain"
          />
        ) : (
          <video
            key={editorVideoUrl}
            ref={videoRef}
            src={editorVideoUrl}
            controls
            crossOrigin="anonymous"
            className="w-full h-auto max-h-[400px] rounded-md mb-4 object-contain"
            onLoadedMetadata={() => {
              const video = videoRef.current;
              if (video) {
                video.currentTime = video.duration > 1 ? 1 : 0;
              }
            }}
          />
        )}{' '}
        <div className="flex items-center space-x-4">
          {' '}
          <button
            type="button"
            onClick={() => setIsEditingPreview(false)}
            className="px-5 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            {' '}
            Cancel{' '}
          </button>{' '}
          <button
            type="button"
            onClick={handleCaptureFrame}
            className="px-5 py-2 text-sm font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600"
          >
            {' '}
            Capture Frame as Preview{' '}
          </button>{' '}
        </div>{' '}
      </div>
    );
  };
  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 space-y-8 relative mb-8">
      {' '}
      {reel.isRemovable && (
        <button
          type="button"
          onClick={() => onUpdate(id, { shouldRemove: true })}
          className="absolute -top-4 -right-4 z-10 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          aria-label="Remove Media"
        >
          {' '}
          <Trash2 size={18} />{' '}
        </button>
      )}{' '}
      <FormSection>
        {' '}
        <FormField label="Title" required>
          {' '}
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate(id, { title: e.target.value })}
            placeholder="Enter unique title..."
            className={inputClasses}
            required
          />{' '}
        </FormField>{' '}
      </FormSection>{' '}
      <FormSection title="Upload Content">
        {' '}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-slate-300 border-dashed rounded-lg cursor-pointer transition-colors dark:border-slate-600 ${isDragging ? 'border-teal-500 bg-teal-50 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}
        >
          {' '}
          {!selectedFile && !mainPreviewUrl ? (
            <div className="flex flex-col items-center justify-center text-center">
              {' '}
              <UploadIcon />{' '}
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                {' '}
                <span className="font-semibold">Drag & Drop file(s)</span>{' '}
              </p>{' '}
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {' '}
                or{' '}
              </p>{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600"
              >
                {' '}
                Choose File(s){' '}
              </button>{' '}
            </div>
          ) : (
            <div className="w-full h-full p-2">
              {' '}
              {mainPreviewUrl && isVideo ? (
                isHls ? (
                  <InlineHlsPlayer src={mainPreviewUrl} controls />
                ) : (
                  <video
                    key={mainPreviewUrl}
                    src={mainPreviewUrl}
                    controls
                    className="w-full h-full object-contain rounded-md"
                  />
                )
              ) : mainPreviewUrl && !isVideo ? (
                <img
                  src={mainPreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-md"
                />
              ) : null}{' '}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Remove file"
              >
                {' '}
                <X size={16} />{' '}
              </button>{' '}
            </div>
          )}{' '}
        </div>{' '}
        <input
          id={`dropzone-file-${id}`}
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*,video/*,video/quicktime,.mov"
          multiple
        />{' '}
      </FormSection>{' '}
      <FormSection title="Preview" hasSeparator={false}>
        {' '}
        {!isEditMode && isVideo && selectedFile ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            {' '}
            <p className="font-medium">
              {' '}
              Preview will be generated automatically.{' '}
            </p>{' '}
            <p className="text-xs mt-1">
              {' '}
              You can edit it after the initial upload.{' '}
            </p>{' '}
          </div>
        ) : isEditingPreview && isVideo ? (
          <VideoFrameSelector />
        ) : customPreviewUrl ? (
          <div className="flex flex-col items-center">
            {' '}
            <div className="w-full flex justify-center mb-4">
              {' '}
              <img
                src={customPreviewUrl}
                alt="Final Preview"
                className="w-full h-auto max-w-2xl max-h-[500px] rounded-lg shadow-md object-contain"
              />{' '}
            </div>{' '}
            <div className="flex items-center space-x-2">
              {' '}
              <button
                type="button"
                onClick={handleOpenPreviewEditor}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                {' '}
                Change preview{' '}
              </button>{' '}
            </div>{' '}
          </div>
        ) : isEditMode && selectedFile && !customPreviewUrl && isVideo ? (
          <div className="text-center text-slate-400 py-8">
            {' '}
            <Loader2 className="animate-spin inline-block mr-2" /> Generating
            preview...{' '}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            {' '}
            <p>Preview of your content will appear here</p>{' '}
          </div>
        )}{' '}
        <input
          type="file"
          className="hidden"
          ref={previewFileInputRef}
          onChange={handleCustomPreviewSelect}
          accept="image/*"
        />{' '}
      </FormSection>{' '}
    </div>
  );
};

// ========================================================================== //
// ! SECTION 3: CREATE REEL (MAIN COMPONENT)
// ========================================================================== //

const CreateReel = () => {
  // ! Hooks
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!itemId; // Отримуємо ВСЕ з useAuth, включаючи supabase і стан завантаження auth
// Отримуємо ВСЕ з useAuth, включаючи supabase і стан завантаження auth
const { session, user, loading: authLoading, supabase } = useAuth(); // <--- ДОДАНО 'session'
  const createNewReelState = () => ({
    id: Date.now() + Math.random(),
    title: '',
    selectedFile: null,
    customPreviewFile: null,
    mainPreviewUrl: null,
    customPreviewUrl: null,
    isRemovable: true,
  });

  const [reels, setReels] = useState([createNewReelState()]);

  const initialCommonFormData = {
    allowDownload: false,
    publicationDate: new Date(),
    publishOption: 'now',
    artist: [],
    client: [],
    description: '',
    featuredCelebrity: [],
    contentType: '',
    craft: '',
    categories: [],
  };
  const [commonFormData, setCommonFormData] = useState(initialCommonFormData); // * State for form select options

  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true); // * Local toast state (for validation errors, etc.)

  const [toast, setToast] = useState({
    message: '',
    visible: false,
    type: 'error',
  }); // ! Context
  // Використовуємо НОВИЙ UploadContext

  const { uploadStatus, startUpload, startUpdate } = useUpload(); // Отримуємо triggerRefresh з DataRefreshContext
  // const { refreshKey, triggerRefresh } = useContext(DataRefreshContext);
  // ! Helper Functions
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, visible: true, type });
    // Функція скидання тосту залишається в setTimeout
    const timer = setTimeout(() => {
      setToast((currentToast) =>
        currentToast.message === message // Скидаємо, тільки якщо це той самий тост
          ? { message: '', visible: false, type: 'error' }
          : currentToast
      );
    }, 3000);
    // Очистка таймера при розмонтуванні або новому виклику (опціонально, але гарна практика)
    // return () => clearTimeout(timer); // Можна додати, якщо setToast асинхронний
  }, []);

  const isImageFile = (file) => {
    /* ... (код без змін) ... */
    if (!file) return false;
    const imageMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return imageMimeTypes.includes(file.type);
  }; // ! Effects
  // * Effect: Cleanup all blob URLs on unmount (Без змін)

  useEffect(() => {
    return () => {
      reels.forEach((reel) => {
        if (reel.mainPreviewUrl && reel.mainPreviewUrl.startsWith('blob:'))
          URL.revokeObjectURL(reel.mainPreviewUrl);
        if (reel.customPreviewUrl && reel.customPreviewUrl.startsWith('blob:'))
          URL.revokeObjectURL(reel.customPreviewUrl);
      });
    };
  }, [reels]); // * --- НОВА ЛОГІКА ЗАВАНТАЖЕННЯ ОПЦІЙ ---

  // ▼▼▼ Повертаємо логіку useEffect для focus listener ▼▼▼
  //   useEffect(() => {
  //     const handleFocus = () => {
  //       console.log("Window focused, triggering data refresh...");
  //       triggerRefresh();
  //     };

  //     window.addEventListener('focus', handleFocus);
  //     console.log("Focus listener added.");

  //     return () => {
  //       window.removeEventListener('focus', handleFocus);
  //       console.log("Focus listener removed.");
  //     };
  //   }, [triggerRefresh]);
  // ▲▲▲ Кінець додавання focus listener ▲▲▲

 useEffect(() => {
    // Якщо auth ще завантажується, або немає юзера, або сесії/токена - виходимо
    if (authLoading || !user || !session?.access_token) {
      console.log(
        `fetchOptions skipped: authLoading=${authLoading}, user=${!!user}, session=${!!session?.access_token}`
      );
      if (!authLoading && (!user || !session?.access_token)) {
        setIsLoadingOptions(false);
      }
      return;
    }

    const token = session.access_token;
    const fetchOptions = async () => {
      console.log(
        `[${new Date().toLocaleTimeString()}] Starting fetchOptions via backend...`
      );
      setIsLoadingOptions(true);

      const endpoints = [
        { name: 'artists', url: `${API_BASE_URL}/artists` },
        { name: 'clients', url: `${API_BASE_URL}/clients` },
        { name: 'celebrities', url: `${API_BASE_URL}/celebrities` },
        { name: 'contentTypes', url: `${API_BASE_URL}/content-types` },
        { name: 'categories', url: `${API_BASE_URL}/categories` },
        { name: 'crafts', url: `${API_BASE_URL}/crafts` },
      ];

      const fetchPromises = endpoints.map((endpoint) =>
        fetch(endpoint.url, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorBody = await response.json().catch(() => ({}));
              throw new Error(
                `Failed to fetch ${endpoint.name} (${response.status}): ${errorBody.error || response.statusText}`
              );
            }
            return { name: endpoint.name, data: await response.json() };
          })
          .catch((error) => {
            console.error(`Error fetching ${endpoint.name}:`, error);
            return { name: endpoint.name, error: error };
          })
      );

      try {
        const results = await Promise.allSettled(fetchPromises);

        let hasError = false;
        const newState = {};
        const setStatesMap = {
          artists: setArtists,
          clients: setClients,
          celebrities: setCelebrities,
          contentTypes: setContentTypes,
          categories: setCategories,
          crafts: setCrafts,
        };

        results.forEach((result) => {
          if (result.status === 'fulfilled' && !result.value.error) {
            newState[result.value.name] = result.value.data || [];
          } else {
            hasError = true;
            // Обробка rejected promise або помилки 4xx/5xx з бек-енду
            if (result.reason) {
              console.error(result.reason);
            }
          }
        });

        // Оновлюємо всі стани разом
        Object.entries(newState).forEach(([key, data]) => {
          if (setStatesMap[key]) {
            setStatesMap[key](data);
          }
        });

        if (hasError) {
          showToast(
            'Failed to load some dropdown options from backend. Check console.',
            'error'
          );
        } else {
          console.log(
            `[${new Date().toLocaleTimeString()}] All options loaded successfully via backend.`
          );
        }
      } catch (error) {
        console.error('Critical error during fetchOptions execution:', error);
        showToast(`Critical error loading options: ${error.message}`, 'error');
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
    // Запускаємо при зміні користувача або supabase клієнта
  }, [authLoading, user, supabase, showToast]); // Прибираємо refreshKey поки що
  // * --- НОВА ЛОГІКА ЗАВАНТАЖЕННЯ ДАНИХ ДЛЯ РЕДАГУВАННЯ ---

  useEffect(() => {
    // Якщо не режим редагування, або auth завантажується, або нема юзера/сесії/supabase - виходимо
    // ▼▼▼ ДОДАНО ПЕРЕВІРКУ НАЯВНОСТІ ТОКЕНА В СЕСІЇ ▼▼▼
    if (!isEditMode || authLoading || !user || !session?.access_token || !supabase) {
       console.log(`fetchItemData skipped: isEditMode=${isEditMode}, authLoading=${authLoading}, user=${!!user}, session=${!!session?.access_token}, supabase=${!!supabase}`);
       if(isEditMode && !authLoading && (!user || !session?.access_token)) {
          setIsLoadingOptions(false);
          showToast("Authentication required to edit item.");
          // Можливо, скинути форму або перенаправити
          // setCommonFormData(initialCommonFormData);
          // setReels([createNewReelState()]);
       }
       return;
    }
    // ▲▲▲ КІНЕЦЬ ЗМІНИ ▲▲▲

    const fetchItemData = async () => {
      console.log(`[${new Date().toLocaleTimeString()}] Starting fetchItemData...`);
      setIsLoadingOptions(true);
      let token = null;

      try {
        // ▼▼▼ ПОЧАТОК ВИПРАВЛЕННЯ: БЕРЕМО ТОКЕН З КОНТЕКСТУ ▼▼▼
        
        // ПРИБИРАЄМО ЦЕЙ БЛОК:
        // const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        // if (sessionError || !sessionData.session) {
        //   throw new Error('Authentication error getting session.');
        // }
        // token = sessionData.session.access_token;
        
        // ДОДАЄМО ЦЕ:
        token = session.access_token; // Беремо токен напряму
        console.log('Got token directly from AuthContext for fetchItemData.');
        
        // ▲▲▲ КІНЕЦЬ ВИПРАВЛЕННЯ ▲▲▲

        // * Step 1: Fetch the media item's metadata (З ТОКЕНОМ)
        const response = await fetch(`${API_BASE_URL}/media-items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }, // Використовуємо отриманий токен
        });
        if (!response.ok) {
           const errorBody = await response.text();
           console.error("Fetch media item error:", response.status, errorBody);
           throw new Error(`Failed to fetch media item data (${response.status})`);
        }
        const item = await response.json();
        console.log("Fetched item data:", item);

        // * Step 2: Get signed GCS URLs for the content (З ТОКЕНОМ)
        const pathsToSign = [item.video_gcs_path, item.preview_gcs_path, item.video_hls_path].filter(Boolean);
        let urlsMap = {};
        if (pathsToSign.length > 0) {
           console.log("Paths to sign:", pathsToSign);
           const urlsResponse = await fetch(`${API_BASE_URL}/generate-read-urls`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, // Використовуємо той самий токен
             body: JSON.stringify({ gcsPaths: pathsToSign }),
           });
           if (urlsResponse.ok) {
             urlsMap = await urlsResponse.json();
             console.log("Signed URLs map:", urlsMap);
           } else {
            const errorBody = await urlsResponse.text();
             console.error('Failed to get signed URLs:', urlsResponse.status, errorBody);
           }
        }

        const parseString = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

        // * Step 3 & 4: Populate form data and reels state
        setCommonFormData({
          allowDownload: item.allow_download || false,
          publicationDate: item.publish_date ? new Date(item.publish_date) : new Date(),
          publishOption: item.publish_date ? 'schedule' : 'now',
          artist: parseString(item.artists),
          client: parseString(item.client),
          description: item.description || '',
          featuredCelebrity: parseString(item.featured_celebrity),
          contentType: item.content_type || '',
          craft: item.craft || '',
          categories: parseString(item.categories),
        });

        setReels([
          {
            id: item.id,
            title: item.title || '',
            selectedFile: null,
            customPreviewFile: null,
            mainPreviewUrl: urlsMap[item.video_hls_path] || urlsMap[item.video_gcs_path] || null,
            customPreviewUrl: urlsMap[item.preview_gcs_path] || null,
            original_video_path: item.video_gcs_path,
            original_preview_path: item.preview_gcs_path,
            isRemovable: false,
          },
        ]);
        console.log(`[${new Date().toLocaleTimeString()}] Item data states updated successfully.`);

      } catch (error) {
        console.error('Error in fetchItemData:', error);
        showToast(`Error loading item: ${error.message}`, 'error');
      } finally {
        console.log(`[${new Date().toLocaleTimeString()}] Setting isLoadingOptions to false in fetchItemData.`);
        setIsLoadingOptions(false);
      }
    };

    fetchItemData();
    // ▼▼▼ ДОДАЄМО 'session' В ЗАЛЕЖНОСТІ ▼▼▼
  }, [isEditMode, authLoading, user, session, itemId, supabase, navigate, showToast]); // Прибираємо refreshKey поки що
  // ! Handlers (Без змін)

  const handleUpdateReel = (idToUpdate, updatedFields) => {
    /* ... */
    setReels((prevReels) => {
      // * Handle 'shouldRemove' action
      if (updatedFields.shouldRemove) {
        if (prevReels.length <= 1) {
          showToast('You cannot remove the last form.');
          return prevReels;
        }
        return prevReels.filter((r) => r.id !== idToUpdate);
      }

      // * Handle standard field updates
      return prevReels.map((reel) => {
        if (reel.id === idToUpdate) {
          const newReel = { ...reel, ...updatedFields };
          // * If a new custom preview *file* is set, create a new blob URL for it
          if (updatedFields.customPreviewFile instanceof File) {
            // * Revoke old blob URL if it exists
            if (
              reel.customPreviewUrl &&
              reel.customPreviewUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(reel.customPreviewUrl);
            }
            newReel.customPreviewUrl = URL.createObjectURL(
              updatedFields.customPreviewFile
            );
          }
          return newReel;
        }
        return reel;
      });
    });
  };
  const handleFilesSelected = async (files, reelId) => {
    /* ... */
    if (!files || files.length === 0) {
      // * This is the 'Remove file' case
      handleUpdateReel(reelId, {
        selectedFile: null,
        customPreviewFile: null,
        mainPreviewUrl: null,
        customPreviewUrl: null,
      });
      return;
    }

    const validFiles = Array.from(files).filter(
      (f) => isImageFile(f) || f.type.startsWith('video/')
    );
    if (validFiles.length === 0) return;

    const firstFile = validFiles[0];
    const otherFiles = validFiles.slice(1);

    // * Handle additional files (only in create mode)
    let newReels = [];
    if (otherFiles.length > 0 && !isEditMode) {
      const newReelsPromises = otherFiles.map(async (file) => {
        const fileNameWithoutExt =
          file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const fileUrl = URL.createObjectURL(file);
        const isImage = isImageFile(file);
        let customPreview = null;
        if (isImage) {
          try {
            customPreview = await compressImage(file);
          } catch (error) {
            console.error('Failed to compress additional file preview:', error);
            customPreview = file;
          }
        }
        const customPreviewUrl = customPreview
          ? URL.createObjectURL(customPreview)
          : null;

        return {
          ...createNewReelState(),
          title: fileNameWithoutExt,
          selectedFile: file,
          customPreviewFile: customPreview,
          mainPreviewUrl: fileUrl,
          customPreviewUrl: customPreviewUrl,
        };
      });
      newReels = await Promise.all(newReelsPromises);
    }

    // * Handle the first file (or the only file)
    const isFirstFileImage = isImageFile(firstFile);
    let compressedPreviewForFirst = null;
    if (isFirstFileImage) {
      try {
        compressedPreviewForFirst = await compressImage(firstFile);
      } catch (error) {
        console.error('Failed to compress first file preview:', error);
        compressedPreviewForFirst = firstFile;
      }
    }

    // * Update the state
    setReels((prev) => {
      const currentReelCount = prev.length;
      const additionalReelCount = newReels.length;
      const newTotalReelCount = currentReelCount + additionalReelCount;
      if (newTotalReelCount > MAX_UPLOAD_LIMIT) {
        showToast(
          `Неможливо додати ${additionalReelCount} файлів. Загальна кількість файлів у пакеті не може перевищувати ${MAX_UPLOAD_LIMIT}. Ви вже маєте ${currentReelCount}.`,
          'error'
        );
        return prev; // Повернути стан без змін
      }
      const updatedExistingReels = prev.map((reel) => {
        if (reel.id === reelId) {
          const fileNameWithoutExt =
            firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) ||
            firstFile.name;
          const fileUrl = URL.createObjectURL(firstFile);
          const customPreviewUrl = compressedPreviewForFirst
            ? URL.createObjectURL(compressedPreviewForFirst)
            : null;
          return {
            ...reel,
            title: reel.title || fileNameWithoutExt, // * Set title from filename if empty
            selectedFile: firstFile,
            customPreviewFile: compressedPreviewForFirst,
            mainPreviewUrl: fileUrl,
            customPreviewUrl: customPreviewUrl,
          };
        }
        return reel;
      });
      return [...updatedExistingReels, ...newReels]; // * Add the new forms
    });
  };
  const handleAddReel = () =>
    setReels((prev) => [...prev, createNewReelState()]);
  const handleCommonFormChange = (field, value) =>
    setCommonFormData((prev) => ({ ...prev, [field]: value }));
  const isSchedulingDisabled = commonFormData.publishOption === 'now'; // * handleSubmit використовує startUpload/startUpdate з контексту (Без змін)

  const handleSubmit = async (event) => {
    /* ... */
    event.preventDefault();

    // --- Validation ---
    for (const reel of reels) {
      if (!reel.title.trim()) {
        showToast(
          `Please provide a title for Media #${reels.indexOf(reel) + 1}.`
        );
        return;
      }
      if (!reel.selectedFile && !isEditMode && !reel.mainPreviewUrl) {
        showToast(`Please provide a content file for "${reel.title}".`);
        return;
      }
    }
    if (!commonFormData.craft) {
      showToast('Please select a Craft.');
      return;
    }
    if (!isEditMode && reels.filter((r) => r.selectedFile).length === 0) {
      showToast('Please add at least one file to upload.');
      return;
    }
    // --- End Validation ---

    try {
      if (isEditMode) {
        const reelToUpdate = reels[0];
        await startUpdate(itemId, reelToUpdate, commonFormData);
        showToast('Update process started successfully!', 'success');
        const returnPath = location.pathname.startsWith('/adminpanel')
          ? '/adminpanel/library'
          : '/userpanel/library';
        setTimeout(() => navigate(returnPath), 1000);
      } else {
        const reelsToUpload = reels.filter((r) => r.selectedFile);
        if (reelsToUpload.length === 0) {
          showToast('Please add at least one file to upload.');
          return;
        }
        if (reelsToUpload.length > MAX_UPLOAD_LIMIT) {
          showToast(
            `Imposible to upload ${reelsToUpload.length} files. Max limit – ${MAX_UPLOAD_LIMIT} per time.`,
            'error'
          );
          return;
        }

        await startUpload(reelsToUpload, commonFormData);
        showToast('Upload process started successfully!', 'success');
        setReels([createNewReelState()]);
        setCommonFormData(initialCommonFormData);
      }
    } catch (err) {
      console.error('Failed to initiate upload/update:', err);
      showToast(err.message || 'An unexpected error occurred.', 'error');
    }
  }; // ! Render (Без змін)
  // ... (весь JSX залишається тим самим, використовує isLoadingOptions, uploadStatus.isActive і т.д.) ...

  // * Loading state for Edit Mode or initial options load
  // Важливо: Показуємо лоадер, якщо *або* завантажуються опції, *або* дані для редагування
  if (isLoadingOptions) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Loader2 className="animate-spin inline-block mr-2" /> Loading data...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-36">
            {/* Local Toast */}     {' '}
      {toast.visible && (
        <div
          className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}
          role="alert"
        >
                   {' '}
          <strong className="font-bold">
            {toast.type === 'success' ? 'Success: ' : 'Error: '}
          </strong>
                    <span className="block sm:inline">{toast.message}</span>   
             {' '}
        </div>
      )}
            {/* --- Media Item Forms --- */}     {' '}
      {reels.map((reel, index) => (
        <div key={reel.id}>
                   {' '}
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                       {' '}
            {isEditMode
              ? `Editing Media: ${reel.title || ''}`
              : `Media #${index + 1}`}
                     {' '}
          </h2>
                   {' '}
          <ReelPartialForm
            reel={reel}
            onUpdate={handleUpdateReel}
            onFilesSelected={handleFilesSelected}
            isEditMode={isEditMode}
          />
                 {' '}
        </div>
      ))}
            {/* "Add Another" Button */}     {' '}
      {!isEditMode && (
        <div className="flex justify-center">
                   {' '}
          <button
            type="button"
            onClick={handleAddReel}
            className="px-6 py-2 border-2 border-dashed border-teal-500 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
          >
                        + Add Another Media          {' '}
          </button>
                 {' '}
        </div>
      )}
            <hr className="border-slate-300 dark:border-slate-700" />     {' '}
      {/* --- Common Content Data Form --- */}     {' '}
      <FormSection title="Common Content Data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField label="Publication Date" required>
              <div className="flex items-center space-x-6 mb-3">
                <div className="flex items-center">
                  <input
                    id="schedule"
                    type="radio"
                    name="publishOption"
                    value="schedule"
                    checked={!isSchedulingDisabled}
                    onChange={(e) =>
                      handleCommonFormChange('publishOption', e.target.value)
                    }
                    className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="schedule"
                    className="ml-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    Schedule
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="publish-now"
                    type="radio"
                    name="publishOption"
                    value="now"
                    checked={isSchedulingDisabled}
                    onChange={(e) =>
                      handleCommonFormChange('publishOption', e.target.value)
                    }
                    className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="publish-now"
                    className="ml-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    Publish Now
                  </label>
                </div>
              </div>
              <div className="relative">
                <DatePicker
                  selected={commonFormData.publicationDate}
                  onChange={(date) =>
                    handleCommonFormChange('publicationDate', date)
                  }
                  disabled={isSchedulingDisabled}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className={`${inputClasses} pl-10 w-full`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon />
                </div>
              </div>
            </FormField>
          </div>
          <MultiCreatableSelect
            label="Artist"
            options={artists}
            selectedOptions={commonFormData.artist}
            onChange={(newValue) => handleCommonFormChange('artist', newValue)}
            placeholder={
              isLoadingOptions ? 'Loading...' : 'Choose or type artist...'
            }
            required
            limit={10}
          />
          <MultiCreatableSelect
            label="Client"
            options={clients}
            selectedOptions={commonFormData.client}
            onChange={(newValue) => handleCommonFormChange('client', newValue)}
            placeholder={
              isLoadingOptions ? 'Loading...' : 'Choose or type client...'
            }
            limit={10}
          />
          <div className="md:col-span-2">
            {' '}
            <MultiCreatableSelect
              label="Featured Celebrity"
              options={celebrities}
              selectedOptions={commonFormData.featuredCelebrity}
              onChange={(newValue) =>
                handleCommonFormChange('featuredCelebrity', newValue)
              }
              placeholder={
                isLoadingOptions ? 'Loading...' : 'Choose celebrity...'
              }
              limit={10}
            />{' '}
          </div>
          <div className="md:col-span-2">
            <FormField label="Description">
              <div className="relative w-full">
                <textarea
                  value={commonFormData.description}
                  onChange={(e) =>
                    handleCommonFormChange('description', e.target.value)
                  }
                  maxLength="200"
                  placeholder="Enter Clip Description..."
                  className="flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 resize-none"
                ></textarea>
                <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                  {commonFormData.description.length} / 200
                </div>
              </div>
            </FormField>
          </div>
          <div className="flex items-center">
            <input
              id="allow-download"
              type="checkbox"
              checked={commonFormData.allowDownload}
              onChange={(e) =>
                handleCommonFormChange('allowDownload', e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label
              htmlFor="allow-download"
              className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Allow download
            </label>
          </div>
        </div>
             {' '}
      </FormSection>
            {/* --- Common Meta Data Form --- */}     {' '}
      <FormSection title="Common Meta Data" hasSeparator={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {' '}
          {/* Виправлено md:col-span-2 */}
          <div className="md:col-span-2">
            {' '}
            <SingleSearchableSelect
              label="Content Type"
              options={contentTypes}
              value={commonFormData.contentType}
              onChange={(newValue) =>
                handleCommonFormChange('contentType', newValue)
              }
              placeholder={
                isLoadingOptions ? 'Loading...' : 'Choose content type...'
              }
            />{' '}
          </div>
          <div className="md:col-span-2">
            {' '}
            <SingleSearchableSelect
              label="Craft"
              options={crafts}
              value={commonFormData.craft}
              onChange={(newValue) => handleCommonFormChange('craft', newValue)}
              placeholder={isLoadingOptions ? 'Loading...' : 'Choose craft...'}
              required
            />{' '}
          </div>
          <div className="md:col-span-2">
            {' '}
            <MultiSelectCategories
              label="Categories"
              options={categories}
              selectedOptions={commonFormData.categories}
              onChange={(newSelection) =>
                handleCommonFormChange('categories', newSelection)
              }
              placeholder="Search and add categories..."
              limit={10}
            />{' '}
          </div>
        </div>
             {' '}
      </FormSection>
            {/* --- Submit Button --- */}     {' '}
      <div className="fixed bottom-6 right-6 z-50">
               {' '}
        <div className="flex justify-end">
                   {' '}
          <button
            type="submit"
            disabled={uploadStatus.isActive}
            className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
          >
                       {' '}
            {uploadStatus.isActive
              ? isEditMode
                ? 'Applying...'
                : 'Uploading...'
              : isEditMode
                ? 'Apply Changes'
                : 'Deploy & Upload All'}
                     {' '}
          </button>
                 {' '}
        </div>
             {' '}
      </div>
         {' '}
    </form>
  );
};

export default CreateReel;
