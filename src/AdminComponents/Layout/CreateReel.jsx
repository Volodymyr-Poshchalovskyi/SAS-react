// src/AdminComponents/Layout/CreateReel.jsx
// ! React & Router
import React, { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// ! Libraries
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../../lib/supabaseClient';
import { X, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import Hls from 'hls.js';

// ! Local Imports (Context & API)
import { useUpload } from '../../context/UploadContext';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS & UTILITIES
// ========================================================================== //

/**
 * ? InlineHlsPlayer
 * A video player component with built-in HLS (m3u8) support.
 * Uses Hls.js library if supported, otherwise falls back to native playback.
 */
const InlineHlsPlayer = forwardRef(({ src, ...props }, ref) => {
  const internalVideoRef = useRef(null);
  // * Allow parent to pass its own ref or use the internal one
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
      // * Native HLS support (e.g., Safari)
      video.src = src;
    }

    // * Cleanup function to destroy HLS instance
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

/**
 * ? compressImage
 * Compresses an image file client-side using a canvas.
 * @param {File} file - The image file to compress.
 * @param {number} [maxSize=800] - The maximum width or height.
 * @returns {Promise<File>} A promise that resolves with the compressed file.
 */
const compressImage = (file, maxSize = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const { width, height } = img;

        // * If already small enough, return original file
        if (width <= maxSize && height <= maxSize) {
          resolve(file);
          return;
        }

        // * Calculate new dimensions
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

        // * Convert canvas to blob, then to file
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed.'));
              return;
            }
            const compressedFile = new File(
              [blob],
              `preview_${Date.now()}.jpg`,
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          0.9 // * JPEG quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- Icon Components ---
const UploadIcon = () => (
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
const FormSection = ({ title, children, hasSeparator = true }) => (
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

const FormField = ({ label, children, required = false }) => (
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

/**
 * ? SingleSearchableSelect
 * A searchable dropdown select component.
 */
const SingleSearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // * Memoized filter for search
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.name.toLowerCase().includes((inputValue || '').toLowerCase())
      ),
    [inputValue, options]
  );

  // * Click-outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // * Reset input value if closed without a valid selection
  useEffect(() => {
    if (!isOpen) {
      const isValid = options.some((opt) => opt.name === inputValue);
      if (!isValid) setInputValue(value || '');
    }
  }, [isOpen, value, options, inputValue]);

  // * Sync input value when parent 'value' prop changes
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
      <div className="relative" ref={wrapperRef}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={inputClasses}
          required={required}
        />
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <ul>
                {filteredOptions.map((option) => (
                  <li
                    key={option.id}
                    onMouseDown={() => handleSelectOption(option.name)} // * Use onMouseDown to fire before blur
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No matches found.
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
};

/**
 * ? MultiSelectCategories
 * A multi-select component that allows picking from a predefined list.
 */
const MultiSelectCategories = ({
  label,
  options,
  selectedOptions,
  onChange,
  placeholder,
  limit = 10,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // * Filtered options only show items that aren't already selected
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

  // * Click-outside handler
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
      <div className="relative" ref={wrapperRef}>
        <div
          className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-300 dark:border-slate-700 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          {/* Render selected option pills */}
          {selectedOptions.map((option) => (
            <span
              key={option}
              className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full"
            >
              {option}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // * Prevent container onClick
                  handleRemove(option);
                }}
                className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {/* Input field */}
          {selectedOptions.length < limit && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-grow bg-transparent focus:outline-none p-1 text-sm"
            />
          )}
        </div>
        {/* Dropdown list */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.length > 0 ? (
              <ul>
                {availableOptions.map((option) => (
                  <li
                    key={option.id}
                    onMouseDown={() => handleSelect(option.name)}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No available options.
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
};

/**
 * ? MultiCreatableSelect
 * A multi-select component that allows *creating new* tags/items.
 */
const MultiCreatableSelect = ({
  label,
  options,
  selectedOptions,
  onChange,
  placeholder,
  limit = 10,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // * Filter available options from the predefined list
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

  // * Add new item on 'Enter' key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  // * Click-outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setInputValue(''); // * Clear input on close
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // * Check if the current input value is a new, creatable item
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
      {/* * Hidden input for native form validation (required) */}
      <input
        type="text"
        value={selectedOptions.join(',')}
        required={required}
        className="hidden"
        onChange={() => {}}
      />
      <div className="relative" ref={wrapperRef}>
        <div
          className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-300 dark:border-slate-700 rounded-md"
          onClick={() => {
            setIsOpen(true);
            // * Focus the visible input field when clicking the container
            wrapperRef.current
              .querySelector('input[type=text]:not(.hidden)')
              .focus();
          }}
        >
          {/* Render pills */}
          {selectedOptions.map((option) => (
            <span
              key={option}
              className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full"
            >
              {option}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option);
                }}
                className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {/* Input field */}
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
          )}
        </div>
        {/* Dropdown list */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <ul onMouseDown={(e) => e.preventDefault()}>
              {/* "Add new" option */}
              {canAddCustom && (
                <li
                  onClick={() => handleAdd(inputValue)}
                  className="px-3 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer italic"
                >
                  Add "{inputValue.trim()}"
                </li>
              )}
              {/* Predefined options */}
              {availableOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleAdd(option.name)}
                  className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {option.name}
                </li>
              ))}
              {/* Empty state */}
              {!canAddCustom && availableOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No available options
                </div>
              )}
            </ul>
          </div>
        )}
      </div>
    </FormField>
  );
};

// ========================================================================== //
// ! SECTION 2: REEL PARTIAL FORM (SUB-COMPONENT)
// ========================================================================== //

/**
 * ? ReelPartialForm
 * A form section for an individual media item (title, file, preview).
 * This component is mapped over in the main `CreateReel` component.
 */
const ReelPartialForm = ({ reel, onUpdate, onFilesSelected, isEditMode }) => {
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
  const [editorVideoUrl, setEditorVideoUrl] = useState(null); // * URL for the frame selector

  const fileInputRef = useRef(null);
  const previewFileInputRef = useRef(null);
  const videoRef = useRef(null); // * Ref for the frame selector <video>

  // * Memoized check to determine if the content is a video
  const isVideo = useMemo(() => {
    if (selectedFile) return selectedFile.type.startsWith('video/');
    if (mainPreviewUrl) {
      const path = mainPreviewUrl.toLowerCase();
      // * Simple check: if it's not a common image, assume video/HLS
      return (
        !path.endsWith('.jpg') &&
        !path.endsWith('.jpeg') &&
        !path.endsWith('.png') &&
        !path.endsWith('.gif')
      );
    }
    return false;
  }, [selectedFile, mainPreviewUrl]);

  // * Memoized check for HLS content
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

  // * Effect: Auto-generate preview from video
  // * This runs ONLY in edit mode when a new video file is selected
  // * and no custom preview has been set yet.
  useEffect(() => {
    if (
      isEditMode &&
      selectedFile &&
      selectedFile.type.startsWith('video/') &&
      !customPreviewFile
    ) {
      let isCleanedUp = false;
      const videoElement = document.createElement('video');

      // * Failsafe timeout
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
      videoElement.currentTime = 0; // * Seek to start
      videoElement.play().catch(onError); // * Play is needed on some browsers
    }
  }, [selectedFile, customPreviewFile, id, onUpdate, isEditMode]);

  // * Effect: Cleanup blob URL for the video frame selector
  useEffect(() => {
    return () => {
      if (editorVideoUrl && editorVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editorVideoUrl);
      }
    };
  }, [editorVideoUrl]);

  // --- Handlers ---

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
      // * Use the local blob URL if a new file is selected, otherwise use the remote URL
      const urlToUse = selectedFile
        ? URL.createObjectURL(selectedFile)
        : mainPreviewUrl;
      setEditorVideoUrl(urlToUse);
      setIsEditingPreview(true);
    } else {
      // * If content is an image, just open file picker
      previewFileInputRef.current.click();
    }
  };

  // --- Sub-component: VideoFrameSelector ---

  const VideoFrameSelector = () => {
    const isHlsEditor = editorVideoUrl
      ? editorVideoUrl.toLowerCase().includes('.m3u8')
      : false;
    return (
      <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        {isHlsEditor ? (
          <InlineHlsPlayer
            ref={videoRef}
            src={editorVideoUrl}
            controls
            crossOrigin="anonymous" // * Required for canvas.toBlob
            className="w-full h-auto max-h-[400px] rounded-md mb-4 object-contain"
          />
        ) : (
          <video
            key={editorVideoUrl}
            ref={videoRef}
            src={editorVideoUrl}
            controls
            crossOrigin="anonymous" // * Required for canvas.toBlob
            className="w-full h-auto max-h-[400px] rounded-md mb-4 object-contain"
            onLoadedMetadata={() => {
              // * Seek to 1 second for a better default frame
              const video = videoRef.current;
              if (video) {
                video.currentTime = video.duration > 1 ? 1 : 0;
              }
            }}
          />
        )}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setIsEditingPreview(false)}
            className="px-5 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCaptureFrame}
            className="px-5 py-2 text-sm font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600"
          >
            Capture Frame as Preview
          </button>
        </div>
      </div>
    );
  };

  // --- Render ---

  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 space-y-8 relative mb-8">
      {/* Remove Button (only for multi-upload) */}
      {reel.isRemovable && (
        <button
          type="button"
          onClick={() => onUpdate(id, { shouldRemove: true })}
          className="absolute -top-4 -right-4 z-10 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          aria-label="Remove Media"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* Title Field */}
      <FormSection>
        <FormField label="Title" required>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate(id, { title: e.target.value })}
            placeholder="Enter unique title..."
            className={inputClasses}
            required
          />
        </FormField>
      </FormSection>

      {/* Content Upload Dropzone */}
      <FormSection title="Upload Content">
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
          {/* Empty State */}
          {!selectedFile && !mainPreviewUrl ? (
            <div className="flex flex-col items-center justify-center text-center">
              <UploadIcon />
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Drag & Drop file(s)</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                or
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600"
              >
                Choose File(s)
              </button>
            </div>
          ) : (
            // * Filled State (showing preview)
            <div className="w-full h-full p-2">
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
              ) : null}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        <input
          id={`dropzone-file-${id}`}
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*,video/*,video/quicktime,.mov"
          multiple
        />
      </FormSection>

      {/* Custom Preview Section */}
      <FormSection title="Preview" hasSeparator={false}>
        {/* State 1: Create mode, video selected */}
        {!isEditMode && isVideo && selectedFile ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            <p className="font-medium">
              Preview will be generated automatically.
            </p>
            <p className="text-xs mt-1">
              You can edit it after the initial upload.
            </p>
          </div>
        ) : // * State 2: Editing preview (frame selector is open)
        isEditingPreview && isVideo ? (
          <VideoFrameSelector />
        ) : // * State 3: Custom preview is set
        customPreviewUrl ? (
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center mb-4">
              <img
                src={customPreviewUrl}
                alt="Final Preview"
                className="w-full h-auto max-w-2xl max-h-[500px] rounded-lg shadow-md object-contain"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleOpenPreviewEditor}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Change preview
              </button>
            </div>
          </div>
        ) : // * State 4: Edit mode, new video selected, preview is auto-generating
        isEditMode && selectedFile && !customPreviewUrl && isVideo ? (
          <div className="text-center text-slate-400 py-8">
            <Loader2 className="animate-spin inline-block mr-2" />
            Generating preview...
          </div>
        ) : (
          // * State 5: Default empty state
          <div className="text-center text-slate-400 py-8">
            <p>Preview of your content will appear here</p>
          </div>
        )}
        {/* Hidden file input for *manually* selecting a preview image */}
        <input
          type="file"
          className="hidden"
          ref={previewFileInputRef}
          onChange={handleCustomPreviewSelect}
          accept="image/*"
        />
      </FormSection>
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
  const isEditMode = !!itemId;

  // ! State
  const createNewReelState = () => ({
    id: Date.now() + Math.random(), // * Unique client-side ID
    title: '',
    selectedFile: null, // * The File object
    customPreviewFile: null, // * The File object for the preview
    mainPreviewUrl: null, // * Blob/GCS URL for content
    customPreviewUrl: null, // * Blob/GCS URL for preview
    isRemovable: true, // * Can be removed (for multi-upload)
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
  const [commonFormData, setCommonFormData] = useState(initialCommonFormData);

  // * State for form select options
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // * Local toast state (for validation errors, etc.)
  const [toast, setToast] = useState({
    message: '',
    visible: false,
    type: 'error',
  });

  // ! Context
  // * Get upload functions and global status from UploadContext
  const { uploadStatus, startUpload, startUpdate } = useUpload();

  // ! Helper Functions
  const showToast = (message, type = 'error') => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast({ message: '', visible: false, type: 'error' });
    }, 3000);
  };

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

  // ! Effects

  // * Effect: Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      reels.forEach((reel) => {
        if (reel.mainPreviewUrl && reel.mainPreviewUrl.startsWith('blob:'))
          URL.revokeObjectURL(reel.mainPreviewUrl);
        if (reel.customPreviewUrl && reel.customPreviewUrl.startsWith('blob:'))
          URL.revokeObjectURL(reel.customPreviewUrl);
      });
    };
  }, [reels]);

  // * Effect: Fetch all dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        // * Fetch all in parallel
        const [
          artistsRes,
          clientsRes,
          celebritiesRes,
          contentTypesRes,
          categoriesRes,
          craftsRes,
        ] = await Promise.all([
          supabase.from('artists').select('id, name'),
          supabase.from('clients').select('id, name'),
          supabase.from('celebrities').select('id, name'),
          supabase.from('content_types').select('id, name'),
          supabase.from('categories').select('id, name'),
          supabase.from('crafts').select('id, name'),
        ]);
        if (artistsRes.error) throw artistsRes.error;
        setArtists(artistsRes.data);
        setClients(clientsRes.data);
        setCelebrities(celebritiesRes.data);
        setContentTypes(contentTypesRes.data);
        setCategories(categoriesRes.data);
        setCrafts(craftsRes.data);
      } catch (error) {
        console.error('Failed to fetch options from database:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // * Effect: Fetch item data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchItemData = async () => {
        setIsLoadingOptions(true);
        try {
          // * Step 1: Fetch the media item's metadata
          const response = await fetch(`${API_BASE_URL}/media-items/${itemId}`);
          if (!response.ok) throw new Error('Failed to fetch media item data.');
          const item = await response.json();

          // * Step 2: Get signed GCS URLs for the content
          const pathsToSign = [
            item.video_gcs_path,
            item.preview_gcs_path,
            item.video_hls_path, // * Also get HLS path
          ].filter(Boolean); // * Filter out null/empty paths

          const urlsMap = {};
          if (pathsToSign.length > 0) {
            const urlsResponse = await fetch(
              `${API_BASE_URL}/generate-read-urls`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gcsPaths: pathsToSign }),
              }
            );
            if (urlsResponse.ok) {
              const signedUrls = await urlsResponse.json();
              Object.assign(urlsMap, signedUrls);
            } else {
              console.error('Failed to get signed URLs for previews.');
            }
          }

          // * Helper to parse comma-separated strings from DB
          const parseString = (str) =>
            str
              ? str
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];

          // * Step 3: Populate the common form data
          setCommonFormData({
            allowDownload: item.allow_download,
            publicationDate: new Date(item.publish_date),
            publishOption: 'schedule', // * Edit mode always defaults to 'schedule'
            artist: parseString(item.artists),
            client: parseString(item.client),
            description: item.description || '',
            featuredCelebrity: parseString(item.featured_celebrity),
            contentType: item.content_type || '',
            craft: item.craft || '',
            categories: parseString(item.categories),
          });

          // * Step 4: Populate the reel form state
          setReels([
            {
              id: item.id,
              title: item.title,
              selectedFile: null, // * No file selected initially
              customPreviewFile: null,
              mainPreviewUrl:
                urlsMap[item.video_hls_path] || // * Prioritize HLS
                urlsMap[item.video_gcs_path] ||
                null,
              customPreviewUrl: urlsMap[item.preview_gcs_path] || null,
              // * Store original paths for comparison during update
              original_video_path: item.video_gcs_path,
              original_preview_path: item.preview_gcs_path,
              isRemovable: false, // * Cannot remove in edit mode
            },
          ]);
        } catch (error) {
          console.error(error);
          showToast(`Error: ${error.message}`);
          setTimeout(() => navigate('/adminpanel/library'), 3000);
        } finally {
          setIsLoadingOptions(false);
        }
      };
      fetchItemData();
    }
  }, [itemId, isEditMode, navigate]);

  // ! Handlers

  /**
   * Updates a specific reel in the `reels` state array.
   */
  const handleUpdateReel = (idToUpdate, updatedFields) => {
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

  /**
   * Handles file selection from dropzone or input.
   * * If multiple files are dropped, it creates new ReelPartialForms for them.
   */
  const handleFilesSelected = async (files, reelId) => {
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

  /**
   * Adds a new, empty ReelPartialForm to the page.
   */
  const handleAddReel = () =>
    setReels((prev) => [...prev, createNewReelState()]);

  /**
   * Generic handler for the common data form.
   */
  const handleCommonFormChange = (field, value) =>
    setCommonFormData((prev) => ({ ...prev, [field]: value }));

  const isSchedulingDisabled = commonFormData.publishOption === 'now';

  /**
   * ? handleSubmit
   * Main form submission handler.
   * Validates input and then delegates to `startUpload` or `startUpdate` from context.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // --- Validation ---
    for (const reel of reels) {
      if (!reel.title.trim()) {
        showToast(
          `Please provide a title for Media #${reels.indexOf(reel) + 1}.`
        );
        return;
      }
      // * In create mode, a file must be selected
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
        // --- EDIT MODE ---
        const reelToUpdate = reels[0];
        // * Call the update function from context
        await startUpdate(itemId, reelToUpdate, commonFormData);
        showToast('Update process started successfully!', 'success');

        // * Navigate back to library
        const returnPath = location.pathname.startsWith('/adminpanel')
          ? '/adminpanel/library'
          : '/userpanel/library';
        setTimeout(() => navigate(returnPath), 1000);
      } else {
        // --- CREATE MODE ---
        const reelsToUpload = reels.filter((r) => r.selectedFile);
        if (reelsToUpload.length === 0) {
          showToast('Please add at least one file to upload.');
          return;
        }

        // * Call the upload function from context
        await startUpload(reelsToUpload, commonFormData);
        showToast('Upload process started successfully!', 'success');

        // * Reset the form immediately on success
        setReels([createNewReelState()]);
        setCommonFormData(initialCommonFormData);
      }
    } catch (err) {
      // * This catches errors from starting the upload (e.g., validation)
      console.error('Failed to initiate upload:', err);
      showToast(err.message, 'error');
    }
    // * No 'finally' block needed, the context manages its own loading state
  };

  // ! Render

  // * Loading state for Edit Mode
  if (isLoadingOptions && isEditMode) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Loader2 className="animate-spin inline-block mr-2" /> Loading item
        data...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-36">
      {/* Local Toast (for validation, etc.) */}
      {toast.visible && (
        <div
          className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
          role="alert"
        >
          <strong className="font-bold">
            {toast.type === 'success' ? 'Success: ' : 'Error: '}
          </strong>
          <span className="block sm:inline">{toast.message}</span>
        </div>
      )}

      {/* --- Media Item Forms --- */}
      {reels.map((reel, index) => (
        <div key={reel.id}>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
            {isEditMode
              ? `Editing Media: ${reel.title || ''}`
              : `Media #${index + 1}`}
          </h2>
          <ReelPartialForm
            reel={reel}
            onUpdate={handleUpdateReel}
            onFilesSelected={handleFilesSelected}
            isEditMode={isEditMode}
          />
        </div>
      ))}

      {/* "Add Another" Button (Create Mode only) */}
      {!isEditMode && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAddReel}
            className="px-6 py-2 border-2 border-dashed border-teal-500 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
          >
            + Add Another Media
          </button>
        </div>
      )}
      <hr className="border-slate-300 dark:border-slate-700" />

      {/* --- Common Content Data Form --- */}
      <FormSection title="Common Content Data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Publication Date */}
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
          {/* Artist Select */}
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
          {/* Client Select */}
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
          {/* Celebrity Select */}
          <div className="md:col-span-2">
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
            />
          </div>
          {/* Description */}
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
          {/* Allow Download Checkbox */}
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
      </FormSection>

      {/* --- Common Meta Data Form --- */}
      <FormSection title="Common Meta Data" hasSeparator={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
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
            />
          </div>
          <div className="md:col-span-2">
            <SingleSearchableSelect
              label="Craft"
              options={crafts}
              value={commonFormData.craft}
              onChange={(newValue) => handleCommonFormChange('craft', newValue)}
              placeholder={isLoadingOptions ? 'Loading...' : 'Choose craft...'}
              required
            />
          </div>
          <div className="md:col-span-2">
            <MultiSelectCategories
              label="Categories"
              options={categories}
              selectedOptions={commonFormData.categories}
              onChange={(newSelection) =>
                handleCommonFormChange('categories', newSelection)
              }
              placeholder="Search and add categories..."
              limit={10}
            />
          </div>
        </div>
      </FormSection>

      {/* --- Submit Button --- */}
      {/* * This button's state is now controlled by the global UploadContext */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploadStatus.isActive} // * Disabled by global state
            className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            {uploadStatus.isActive // * Text reflects global state
              ? isEditMode
                ? 'Applying...'
                : 'Uploading...'
              : isEditMode
                ? 'Apply Changes'
                : 'Deploy & Upload All'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateReel;
