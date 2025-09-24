import React, { useState, useRef, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../../lib/supabaseClient'; // Переконайтеся, що шлях правильний
import { X, Trash2, Loader2 } from 'lucide-react';

// --- Іконки та базові компоненти (без змін) ---
const UploadIcon = () => ( <svg className="w-12 h-12 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" > <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /> </svg> );
const CalendarIcon = () => ( <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg> );
const FormSection = ({ title, children, hasSeparator = true }) => ( <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6"> {title && ( <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider"> {title} </h2> )} {children} {hasSeparator && ( <div className="mt-6 border-t border-slate-200 dark:border-slate-800"></div> )} </div> );
const FormField = ({ label, children, required = false }) => ( <div className="mb-4"> <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"> {label} {required && <span className="text-red-500">*</span>} </label> {children} </div> );
const inputClasses = 'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

// --- Компоненти для вибору (без змін) ---
const SingleSearchableSelect = ({ label, options, value, onChange, placeholder, required = false }) => { const [inputValue, setInputValue] = useState(value || ''); const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef(null); const filteredOptions = useMemo(() => options.filter(option => option.name.toLowerCase().includes((inputValue || '').toLowerCase())), [inputValue, options]); useEffect(() => { function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []); useEffect(() => { if (!isOpen) { const isValid = options.some(opt => opt.name === inputValue); if (!isValid) setInputValue(value || ''); } }, [isOpen, value, options, inputValue]); useEffect(() => { setInputValue(value || ''); }, [value]); const handleSelectOption = (optionName) => { onChange(optionName); setInputValue(optionName); setIsOpen(false); }; return ( <FormField label={label} required={required}> <div className="relative" ref={wrapperRef}> <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onFocus={() => setIsOpen(true)} placeholder={placeholder} className={inputClasses} required={required} /> {isOpen && ( <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto"> {filteredOptions.length > 0 ? ( <ul> {filteredOptions.map((option) => ( <li key={option.id} onMouseDown={() => handleSelectOption(option.name)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"> {option.name} </li> ))} </ul> ) : ( <div className="px-3 py-2 text-sm text-slate-500">No matches found.</div> )} </div> )} </div> </FormField> ); };
const MultiSelectCategories = ({ label, options, selectedOptions, onChange, placeholder, limit = 10 }) => { const [inputValue, setInputValue] = useState(''); const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef(null); const availableOptions = useMemo(() => options.filter(opt => !selectedOptions.includes(opt.name)).filter(opt => opt.name.toLowerCase().includes(inputValue.toLowerCase())), [options, selectedOptions, inputValue]); const handleSelect = (optionName) => { if (selectedOptions.length < limit) onChange([...selectedOptions, optionName]); setInputValue(''); setIsOpen(false); }; const handleRemove = (optionName) => onChange(selectedOptions.filter(opt => opt !== optionName)); useEffect(() => { function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [wrapperRef]); return ( <FormField label={`${label} (${selectedOptions.length}/${limit})`}> <div className="relative" ref={wrapperRef}> <div className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-300 dark:border-slate-700 rounded-md" onClick={() => setIsOpen(true)}> {selectedOptions.map(option => ( <span key={option} className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full"> {option} <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(option); }} className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"> <X size={14} /> </button> </span> ))} {selectedOptions.length < limit && ( <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onFocus={() => setIsOpen(true)} placeholder={placeholder} className="flex-grow bg-transparent focus:outline-none p-1 text-sm" /> )} </div> {isOpen && ( <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto"> {availableOptions.length > 0 ? ( <ul> {availableOptions.map((option) => ( <li key={option.id} onMouseDown={() => handleSelect(option.name)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"> {option.name} </li> ))} </ul> ) : ( <div className="px-3 py-2 text-sm text-slate-500">No available options.</div> )} </div> )} </div> </FormField> ); };
const MultiCreatableSelect = ({ label, options, selectedOptions, onChange, placeholder, limit = 10, required = false }) => { const [inputValue, setInputValue] = useState(''); const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef(null); const availableOptions = useMemo(() => options.filter(opt => !selectedOptions.includes(opt.name) && opt.name.toLowerCase().includes(inputValue.toLowerCase())), [options, selectedOptions, inputValue]); const handleAdd = (itemName) => { const trimmedItem = itemName.trim(); if (trimmedItem && selectedOptions.length < limit && !selectedOptions.find(opt => opt.toLowerCase() === trimmedItem.toLowerCase())) { onChange([...selectedOptions, trimmedItem]); } setInputValue(''); setIsOpen(false); }; const handleRemove = (itemName) => onChange(selectedOptions.filter(opt => opt !== itemName)); const handleKeyDown = (e) => { if (e.key === 'Enter' && inputValue) { e.preventDefault(); handleAdd(inputValue); } }; useEffect(() => { function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) { setIsOpen(false); setInputValue(''); } } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [wrapperRef]); const canAddCustom = inputValue.trim() && !options.some(opt => opt.name.toLowerCase() === inputValue.trim().toLowerCase()) && !selectedOptions.some(opt => opt.toLowerCase() === inputValue.trim().toLowerCase()); return ( <FormField label={`${label} (${selectedOptions.length}/${limit})`} required={required}> <input type="text" value={selectedOptions.join(',')} required={required} className="hidden" onChange={() => {}}/> <div className="relative" ref={wrapperRef}> <div className="flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-300 dark:border-slate-700 rounded-md" onClick={() => { setIsOpen(true); wrapperRef.current.querySelector('input[type=text]:not(.hidden)').focus(); }}> {selectedOptions.map(option => ( <span key={option} className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full"> {option} <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(option); }} className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"> <X size={14} /> </button> </span> ))} {selectedOptions.length < limit && ( <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setIsOpen(true)} placeholder={placeholder} className="flex-grow bg-transparent focus:outline-none p-1 text-sm" /> )} </div> {isOpen && ( <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto"> <ul onMouseDown={(e) => e.preventDefault()}> { canAddCustom && ( <li onClick={() => handleAdd(inputValue)} className="px-3 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer italic"> Додати "{inputValue.trim()}" </li> )} {availableOptions.map((option) => ( <li key={option.id} onClick={() => handleAdd(option.name)} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"> {option.name} </li> ))} {!canAddCustom && availableOptions.length === 0 && ( <div className="px-3 py-2 text-sm text-slate-500">No available options</div> )} </ul> </div> )} </div> </FormField> ); };

// --- Компонент ReelPartialForm ---
// ✅ ЗМІНЕНО: Додано новий проп `onProcessMultipleFiles`
const ReelPartialForm = ({ reel, onUpdate, onRemove, onProcessMultipleFiles }) => {
    const { id, title, selectedFile, customPreview } = reel;
    const [isDragging, setIsDragging] = useState(false);
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    
    const fileInputRef = useRef(null);
    const previewFileInputRef = useRef(null);
    const videoRef = useRef(null);

    const mainPreviewUrl = useMemo(() => selectedFile ? URL.createObjectURL(selectedFile) : null, [selectedFile]);
    const customPreviewUrl = useMemo(() => customPreview ? URL.createObjectURL(customPreview) : null, [customPreview]);

    useEffect(() => { return () => { if (mainPreviewUrl) URL.revokeObjectURL(mainPreviewUrl); }; }, [mainPreviewUrl]);
    useEffect(() => { return () => { if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl); }; }, [customPreviewUrl]);

    const handleChange = (fieldOrFields, value) => {
        if (typeof fieldOrFields === 'string') { onUpdate(id, { [fieldOrFields]: value }); } 
        else { onUpdate(id, fieldOrFields); }
    };

    useEffect(() => {
        if (selectedFile && selectedFile.type.startsWith('video/') && !customPreview && !isEditingPreview) {
            let isCleanedUp = false;
            const videoElement = document.createElement('video');
            const timer = setTimeout(() => { console.error('Video preview generation timed out.'); cleanup(); }, 5000);
            const cleanup = () => { if (isCleanedUp) return; isCleanedUp = true; clearTimeout(timer); videoElement.removeEventListener('loadeddata', onLoadedData); videoElement.removeEventListener('error', onError); if (videoElement.src) { URL.revokeObjectURL(videoElement.src); }};
            const onLoadedData = () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => { if (blob) { const capturedFile = new File([blob], `preview_${Date.now()}.jpg`, { type: 'image/jpeg' }); handleChange('customPreview', capturedFile); } cleanup(); }, 'image/jpeg', 0.95);
            };
            const onError = () => { console.error('Error loading video for preview generation.'); cleanup(); };
            videoElement.addEventListener('loadeddata', onLoadedData);
            videoElement.addEventListener('error', onError);
            videoElement.src = URL.createObjectURL(selectedFile);
            videoElement.muted = true;
            videoElement.playsInline = true;
            videoElement.currentTime = 0;
            videoElement.play().catch(onError);
        }
    }, [selectedFile, customPreview, isEditingPreview]);

    const isImageFile = (file) => {
        if (!file) return false;
        const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return imageMimeTypes.includes(file.type) || imageExtensions.includes(extension);
    };

    const handleFileValidation = (file) => {
        if (!file) return false;
        const isValid = isImageFile(file) || file.type.startsWith('video/');
        if (!isValid) {
            alert(`Please upload a valid file type (images or videos).`);
            return false;
        }
        return true;
    };
    
    // ✅ ЗМІНЕНО: Повністю перероблений обробник для роботи з кількома файлами
    const handleFileSelect = (files) => {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(handleFileValidation);
        if (validFiles.length === 0) return;

        // Перший файл обробляємо в поточній секції
        const firstFile = validFiles[0];
        const fileNameWithoutExt = firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) || firstFile.name;
        
        setIsEditingPreview(false);

        if (isImageFile(firstFile)) {
            handleChange({
                title: fileNameWithoutExt,
                selectedFile: firstFile,
                customPreview: firstFile
            });
        } else if (firstFile.type.startsWith('video/')) {
            handleChange({
                title: fileNameWithoutExt,
                selectedFile: firstFile,
                customPreview: null
            });
        }

        // Решту файлів передаємо батьківському компоненту для створення нових секцій
        const otherFiles = validFiles.slice(1);
        if (otherFiles.length > 0) {
            onProcessMultipleFiles(otherFiles);
        }
    };

    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); };
    const handleFileInputChange = (e) => { handleFileSelect(e.target.files); };
    
    const handleRemoveFile = () => {
        setIsEditingPreview(false);
        handleChange({ title: '', selectedFile: null, customPreview: null });
    };

    const handleCustomPreviewSelect = (e) => {
        const file = e.target.files[0];
        if (isImageFile(file)) {
            handleChange('customPreview', file);
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
        canvas.toBlob((blob) => {
            if (blob) {
                const capturedFile = new File([blob], `preview_${Date.now()}.jpg`, { type: 'image/jpeg' });
                handleChange('customPreview', capturedFile);
                setIsEditingPreview(false);
            }
        }, 'image/jpeg', 0.95);
    };

    const VideoFrameSelector = () => (
        <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <video ref={videoRef} src={mainPreviewUrl} controls muted className="w-full h-auto max-h-[400px] rounded-md mb-4 object-contain" onLoadedMetadata={() => { const video = videoRef.current; if (video) { video.currentTime = video.duration > 1 ? 1 : 0; } }} />
            <div className="flex items-center space-x-4">
                <button type="button" onClick={() => setIsEditingPreview(false)} className="px-5 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                <button type="button" onClick={handleCaptureFrame} className="px-5 py-2 text-sm font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600">Capture Frame as Preview</button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Use the timeline to find the perfect frame, then capture it.</p>
        </div>
    );
    
    return (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 space-y-8 relative mb-8">
            <button type="button" onClick={() => onRemove(id)} className="absolute -top-4 -right-4 z-10 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75" aria-label="Remove Media"><Trash2 size={18} /></button>
            <FormSection>
                <FormField label="Title" required><input type="text" value={title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter unique title..." className={inputClasses} required /></FormField>
            </FormSection>
            <FormSection title="Upload Content">
                 <div onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}} onDragLeave={(e) => {e.preventDefault(); setIsDragging(false);}} onDrop={handleDrop} className={`relative flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-slate-300 border-dashed rounded-lg cursor-pointer transition-colors dark:border-slate-600 ${isDragging ? 'border-teal-500 bg-teal-50 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    {!selectedFile ? (
                        <div className="flex flex-col items-center justify-center text-center"><UploadIcon /><p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Drag & Drop file(s)</span></p><p className="text-xs text-slate-500 dark:text-slate-400 mb-2">or</p><button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-1.5 text-xs font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600">Choose File(s)</button></div>
                    ) : (
                        <div className="w-full h-full p-2">
                            {mainPreviewUrl && isImageFile(selectedFile) && <img src={mainPreviewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />}
                            {mainPreviewUrl && selectedFile.type.startsWith('video/') && <video src={mainPreviewUrl} controls className="w-full h-full object-contain rounded-md" />}
                            <button type="button" onClick={handleRemoveFile} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors" aria-label="Remove file"><X size={16}/></button>
                        </div>
                    )}
                </div>
                 {/* ✅ ЗМІНЕНО: Додано атрибут `multiple` */}
                <input id={`dropzone-file-${id}`} type="file" className="hidden" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*,video/*" multiple />
            </FormSection>
            <FormSection title="Preview" hasSeparator={false}>
                { isEditingPreview && selectedFile?.type.startsWith('video/') ? (
                    <VideoFrameSelector />
                ) : customPreviewUrl ? (
                    <div className="flex flex-col items-center">
                        <div className="w-full flex justify-center mb-4">
                            <img src={customPreviewUrl} alt="Final Preview" className="w-full h-auto max-w-2xl max-h-[500px] rounded-lg shadow-md object-contain" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => { selectedFile?.type.startsWith('video/') ? setIsEditingPreview(true) : previewFileInputRef.current.click(); }} className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">
                                Change preview
                            </button>
                            {isImageFile(selectedFile) && selectedFile !== customPreview && (
                               <button type="button" onClick={() => handleChange('customPreview', selectedFile)} className="px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-md">
                                  Restore original
                               </button>
                            )}
                        </div>
                    </div>
                ) : selectedFile && !customPreview ? (
                    <div className="text-center text-slate-400 py-8"><Loader2 className="animate-spin inline-block mr-2" />Generating preview...</div>
                ) : (
                    <div className="text-center text-slate-400 py-8"><p>Preview of your content will appear here</p></div>
                )}
                <input type="file" className="hidden" ref={previewFileInputRef} onChange={handleCustomPreviewSelect} accept="image/*" />
            </FormSection>
        </div>
    );
};


// --- Основний компонент CreateReel ---
const CreateReel = () => {
  const createNewReel = () => ({ id: Date.now() + Math.random(), title: '', selectedFile: null, customPreview: null, });
  const [reels, setReels] = useState([createNewReel()]);
  const [commonFormData, setCommonFormData] = useState({ allowDownload: false, publicationDate: new Date(), publishOption: 'schedule', artist: [], client: [], description: '', featuredCelebrity: [], contentType: '', craft: '', categories: [], });
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  
  useEffect(() => {
    const fetchOptions = async () => {
      try { const [ artistsRes, clientsRes, celebritiesRes, contentTypesRes, categoriesRes, craftsRes ] = await Promise.all([ supabase.from('artists').select('id, name'), supabase.from('clients').select('id, name'), supabase.from('celebrities').select('id, name'), supabase.from('content_types').select('id, name'), supabase.from('categories').select('id, name'), supabase.from('crafts').select('id, name'), ]); if (artistsRes.error) throw artistsRes.error; if (clientsRes.error) throw clientsRes.error; if (celebritiesRes.error) throw celebritiesRes.error; if (contentTypesRes.error) throw contentTypesRes.error; if (categoriesRes.error) throw categoriesRes.error; if (craftsRes.error) throw craftsRes.error; setArtists(artistsRes.data); setClients(clientsRes.data); setCelebrities(celebritiesRes.data); setContentTypes(contentTypesRes.data); setCategories(categoriesRes.data); setCrafts(craftsRes.data); } catch (error) { console.error('Failed to fetch options from database:', error); } finally { setIsLoadingOptions(false); }
    };
    fetchOptions();
  }, []);

  const handleAddReel = () => setReels(prev => [...prev, createNewReel()]);
  const handleRemoveReel = (idToRemove) => { reels.length > 1 ? setReels(prev => prev.filter(reel => reel.id !== idToRemove)) : alert("You cannot remove the last form."); };
  
  const handleUpdateReel = (idToUpdate, updatedFields) => {
    setReels(prev => 
        prev.map(reel => 
            reel.id === idToUpdate 
                ? { ...reel, ...updatedFields } 
                : reel
        )
    );
  };

  // ✅ НОВЕ: Обробник для створення нових секцій з файлів
  const handleProcessMultipleFiles = (files) => {
    const isImageFile = (file) => {
        if (!file) return false;
        const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return imageMimeTypes.includes(file.type) || imageExtensions.includes(extension);
    };

    const newReels = files.map(file => {
        const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newReel = createNewReel();
        
        newReel.title = fileNameWithoutExt;
        newReel.selectedFile = file;
        newReel.customPreview = isImageFile(file) ? file : null;

        return newReel;
    });

    setReels(prev => [...prev, ...newReels]);
  };
  
  const handleCommonFormChange = (field, value) => setCommonFormData(prev => ({ ...prev, [field]: value }));
  const isSchedulingDisabled = commonFormData.publishOption === 'now';

  const uploadFileToGCS = async (file) => {
    if (!file) return null;
    setUploadMessage(`Getting upload URL for ${file.name}...`);
    const response = await fetch('http://localhost:3001/generate-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get signed URL: ${errorData.details || errorData.error}`);
    }
    const { signedUrl, gcsPath } = await response.json();
    setUploadMessage(`Uploading ${file.name}...`);
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload to GCS: ${errorText}`);
    }
    return gcsPath;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    for (const reel of reels) {
      if (!reel.title.trim()) { alert(`Please provide a title for Media #${reels.indexOf(reel) + 1}.`); return; }
      if (!reel.selectedFile) { alert(`Please provide a content file for "${reel.title}".`); return; }
    }
    if (!commonFormData.craft) { alert('Please select a Craft.'); return; }

    setIsUploading(true);
    setUploadMessage('Starting upload process...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");

      const uploadPromises = reels.map(async (reel) => {
        const video_gcs_path = await uploadFileToGCS(reel.selectedFile);
        const preview_gcs_path = reel.customPreview ? await uploadFileToGCS(reel.customPreview) : null;
        return { reelData: reel, video_gcs_path, preview_gcs_path };
      });

      setUploadMessage('Uploading files...');
      const uploadResults = await Promise.all(uploadPromises);
      
      const recordsToInsert = uploadResults.map(result => ({
          user_id: user.id,
          title: result.reelData.title,
          artists: commonFormData.artist.join(', '),
          client: commonFormData.client.join(', '),
          categories: commonFormData.categories.join(', '),
          publish_date: commonFormData.publishOption === 'now' ? new Date().toISOString() : commonFormData.publicationDate.toISOString(),
          video_gcs_path: result.video_gcs_path,
          preview_gcs_path: result.preview_gcs_path,
      }));

      setUploadMessage('Saving metadata...');
      const { error: insertError } = await supabase.from('media_items').insert(recordsToInsert);
      if (insertError) throw new Error(`Database error: ${insertError.message}`);

      setUploadMessage('✅ Success! All media has been uploaded.');
      setReels([createNewReel()]);
      setCommonFormData({ allowDownload: false, publicationDate: new Date(), publishOption: 'schedule', artist: [], client: [], description: '', featuredCelebrity: [], contentType: '', craft: '', categories: [], });

    } catch (err) {
      console.error('An error occurred during the upload process:', err);
      setUploadMessage(`❌ Error: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadMessage('');
      }, 5000);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-36">
      {reels.map((reel, index) => (
        <div key={reel.id}>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4"> Media #{index + 1} </h2>
            {/* ✅ ЗМІНЕНО: Передаємо новий обробник в дочірній компонент */}
            <ReelPartialForm 
                reel={reel} 
                onUpdate={handleUpdateReel} 
                onRemove={handleRemoveReel}
                onProcessMultipleFiles={handleProcessMultipleFiles}
            />
        </div>
      ))}
      <div className="flex justify-center"> <button type="button" onClick={handleAddReel} className="px-6 py-2 border-2 border-dashed border-teal-500 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors" > + Add Another Media </button> </div>
      <hr className="border-slate-300 dark:border-slate-700" />
      <FormSection title="Common Content Data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="md:col-span-2">
            <FormField label="Publication Date" required>
                <div className="flex items-center space-x-6 mb-3">
                <div className="flex items-center"><input id="schedule" type="radio" name="publishOption" value="schedule" checked={!isSchedulingDisabled} onChange={(e) => handleCommonFormChange('publishOption', e.target.value)} className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500" /><label htmlFor="schedule" className="ml-2 text-sm text-slate-700 dark:text-slate-300">Schedule</label></div>
                <div className="flex items-center"><input id="publish-now" type="radio" name="publishOption" value="now" checked={isSchedulingDisabled} onChange={(e) => handleCommonFormChange('publishOption', e.target.value)} className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500" /><label htmlFor="publish-now" className="ml-2 text-sm text-slate-700 dark:text-slate-300">Publish Now</label></div>
                </div>
                <div className="relative"><DatePicker selected={commonFormData.publicationDate} onChange={(date) => handleCommonFormChange('publicationDate', date)} disabled={isSchedulingDisabled} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className={`${inputClasses} pl-10 w-full`} /><div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon /></div></div>
            </FormField>
          </div>
          <MultiCreatableSelect label="Artist" options={artists} selectedOptions={commonFormData.artist} onChange={(newValue) => handleCommonFormChange('artist', newValue)} placeholder={isLoadingOptions ? 'Loading...' : 'Choose or type artist...'} required limit={10} />
          <MultiCreatableSelect label="Client" options={clients} selectedOptions={commonFormData.client} onChange={(newValue) => handleCommonFormChange('client', newValue)} placeholder={isLoadingOptions ? 'Loading...' : 'Choose or type client...'} limit={10} />
          <div className="md:col-span-2"> <MultiCreatableSelect label="Featured Celebrity" options={celebrities} selectedOptions={commonFormData.featuredCelebrity} onChange={(newValue) => handleCommonFormChange('featuredCelebrity', newValue)} placeholder={isLoadingOptions ? 'Loading...' : 'Choose celebrity...'} limit={10} /> </div>
          <div className="md:col-span-2"> <FormField label="Description"> <div className="relative w-full"> <textarea value={commonFormData.description} onChange={(e) => handleCommonFormChange('description', e.target.value)} maxLength="200" placeholder="Enter Clip Description..." className="flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 resize-none"></textarea> <div className="absolute bottom-2 right-2 text-xs text-slate-400"> {commonFormData.description.length} / 200 </div> </div> </FormField> </div>
          <div className="flex items-center"> <input id="allow-download" type="checkbox" checked={commonFormData.allowDownload} onChange={(e) => handleCommonFormChange('allowDownload', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" /> <label htmlFor="allow-download" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Allow download</label> </div>
        </div>
      </FormSection>
      <FormSection title="Common Meta Data" hasSeparator={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
           <div className="md:col-span-2"> <SingleSearchableSelect label="Content Type" options={contentTypes} value={commonFormData.contentType} onChange={(newValue) => handleCommonFormChange('contentType', newValue)} placeholder={isLoadingOptions ? 'Loading...' : 'Choose content type...'} /> </div>
           <div className="md:col-span-2"> <SingleSearchableSelect label="Craft" options={crafts} value={commonFormData.craft} onChange={(newValue) => handleCommonFormChange('craft', newValue)} placeholder={isLoadingOptions ? 'Loading...' : 'Choose craft...'} required /> </div>
           <div className="md:col-span-2"> <MultiSelectCategories label="Categories" options={categories} selectedOptions={commonFormData.categories} onChange={(newSelection) => handleCommonFormChange('categories', newSelection)} placeholder="Search and add categories..." limit={10} /> </div>
        </div>
      </FormSection>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {isUploading && (
            <div className="absolute -top-12 right-0 w-max bg-slate-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg">
                <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    <span>{uploadMessage}</span>
                </div>
            </div>
          )}
          <button type="submit" disabled={isUploading} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100">
            {isUploading ? 'Uploading...' : 'Deploy & Upload All'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateReel;