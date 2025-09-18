// src/AdminComponents/Layout/CreateReel.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// Make sure to import your configured Supabase client
import { supabase } from '../../lib/supabaseClient'; // Adjust this path if needed

/* -------------------------------- */
/* === Small Reusable Icons ===     */
/* -------------------------------- */
const UploadIcon = () => ( <svg className="w-12 h-12 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" > <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /> </svg> );
const CalendarIcon = () => ( <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg> );
const PlusIcon = () => ( <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /> </svg> );
const TrashIcon = () => ( <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg> );

/* -------------------------------- */
/* === Reusable Form Components === */
/* -------------------------------- */
const FormSection = ({ title, children, hasSeparator = true }) => ( <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6"> {title && ( <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider"> {title} </h2> )} {children} {hasSeparator && ( <div className="mt-6 border-t border-slate-200 dark:border-slate-800"></div> )} </div> );
const FormField = ({ label, children, required = false }) => ( <div className="mb-4"> <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"> {label} {required && <span className="text-red-500">*</span>} </label> {children} </div> );
const inputClasses = 'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

/* ---------------------------------------------------- */
/* === ✨ NEW Searchable & Creatable Select Component ✨ === */
/* ---------------------------------------------------- */
const SearchableSelect = ({ label, options, value, onChange, placeholder, required = false }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    return options.filter(option =>
      option.name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        onChange(inputValue); // On blur, confirm the current input value
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, inputValue, onChange]);

  useEffect(() => { setInputValue(value); }, [value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

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
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // A small delay to allow click event on options to fire before blur
            setTimeout(() => {
              if (isOpen) {
                  onChange(inputValue);
                  setIsOpen(false);
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={inputClasses}
        />
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <ul>
                {filteredOptions.map((option) => (
                  <li
                    key={option.id}
                    onMouseDown={() => handleSelectOption(option.name)}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                {inputValue ? `No matches found. Create "${inputValue}"` : "Type to search..."}
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
};


/* -------------------------------- */
/* === Main Component ===           */
/* -------------------------------- */
const CreateReel = () => {
  // --- Form Data State ---
  const [formData, setFormData] = useState({
    title: '',
    allowDownload: false,
    publicationDate: new Date(),
    publishOption: 'schedule',
    artist: '',
    client: '',
    description: '',
    featuredCelebrity: '',
    contentType: 'promo',
    crafts: ['', ''],
    categories: [],
  });

  // --- UI & File States ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [mainPreviewUrl, setMainPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customPreview, setCustomPreview] = useState(null);
  const [customPreviewUrl, setCustomPreviewUrl] = useState(null);
  
  // --- ✨ Data from DB State ✨ ---
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // --- Refs ---
  const fileInputRef = useRef(null);
  const previewFileInputRef = useRef(null);

  // --- ✨ Effect to fetch data from Supabase ✨ ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [artistsRes, clientsRes, celebritiesRes] = await Promise.all([
          supabase.from('artists').select('id, name'),
          supabase.from('clients').select('id, name'),
          supabase.from('celebrities').select('id, name'),
        ]);

        if (artistsRes.error) throw artistsRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (celebritiesRes.error) throw celebritiesRes.error;

        setArtists(artistsRes.data);
        setClients(clientsRes.data);
        setCelebrities(celebritiesRes.data);
      } catch (error) {
        console.error('Failed to fetch options from database:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // --- Handlers ---
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCraftChange = (index, value) => {
    const newCrafts = [...formData.crafts];
    newCrafts[index] = value;
    handleFormChange('crafts', newCrafts);
  };
  const addCraft = () => handleFormChange('crafts', [...formData.crafts, '']);
  const removeCraft = (index) => handleFormChange('crafts', formData.crafts.filter((_, i) => i !== index));

  const handleCategoryKeyDown = (e) => {
    const newCategory = e.target.value.trim();
    if (e.key === 'Enter' && newCategory !== '') {
      e.preventDefault();
      if (formData.categories.length < 5 && !formData.categories.includes(newCategory)) {
        handleFormChange('categories', [...formData.categories, newCategory]);
      }
      e.target.value = '';
    }
  };
  const removeCategory = (tag) => {
    handleFormChange('categories', formData.categories.filter(t => t !== tag));
  };
  
  // ... (other handlers for file upload, preview, etc. remain largely the same)
  const isSchedulingDisabled = formData.publishOption === 'now';
  const handleFileValidation = (file, types = ['image/', 'video/']) => { if (!file) return false; const isValid = types.some(type => file.type.startsWith(type)); if (!isValid) { alert(`Please upload a valid file type (${types.join(', ')}).`); return false; } return true; };
  const handleFileSelect = (file) => { if (handleFileValidation(file)) setSelectedFile(file); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); };
  const handleFileInputChange = (e) => handleFileSelect(e.target.files[0]);
  const handleRemoveFile = () => setSelectedFile(null);
  const handleCustomPreviewSelect = (e) => { const file = e.target.files[0]; if (handleFileValidation(file, ['image/'])) { setCustomPreview(file); } };
  const removeCustomPreview = () => setCustomPreview(null);
  
  // --- Effects for File Previews ---
  useEffect(() => { if (!selectedFile) { setMainPreviewUrl(null); return; } const objectUrl = URL.createObjectURL(selectedFile); setMainPreviewUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [selectedFile]);
  useEffect(() => { if (!customPreview) { setCustomPreviewUrl(null); return; } const objectUrl = URL.createObjectURL(customPreview); setCustomPreviewUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [customPreview]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Title Section */}
      <FormSection>
        <FormField label="Title" required>
          <input type="text" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} placeholder="Enter title..." className={inputClasses} />
        </FormField>
      </FormSection>

      {/* Upload Section */}
      <FormSection title="Upload Content">
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-slate-300 border-dashed rounded-lg cursor-pointer transition-colors dark:border-slate-600 ${isDragging ? 'border-teal-500 bg-teal-50 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center text-center">
              <UploadIcon />
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Drag & Drop to upload</span></p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">or</p>
              <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-1.5 text-xs font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600">Choose File</button>
            </div>
          ) : (
            <div className="w-full h-full p-2">
              {mainPreviewUrl && selectedFile.type.startsWith('image/') && <img src={mainPreviewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />}
              {mainPreviewUrl && selectedFile.type.startsWith('video/') && <video src={mainPreviewUrl} controls className="w-full h-full object-contain rounded-md" />}
              <button type="button" onClick={handleRemoveFile} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors" aria-label="Remove file">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>
        <input id="dropzone-file" type="file" className="hidden" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*,video/*" />
      </FormSection>

      {/* Preview Section */}
      <FormSection title="Preview">
        {!customPreviewUrl ? (
          <div className="text-center text-slate-400 py-8">
            <p className="mb-4">Here will be shown your preview</p>
            <button type="button" onClick={() => previewFileInputRef.current.click()} className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">
              Choose preview
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center mb-4">
              <img src={customPreviewUrl} alt="Final Preview" className="w-full h-auto max-w-2xl max-h-[500px] rounded-lg shadow-md object-contain" />
            </div>
            <div className="flex items-center space-x-2">
              <button type="button" onClick={() => previewFileInputRef.current.click()} className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">
                Change preview
              </button>
              <button type="button" onClick={removeCustomPreview} className="px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-md">
                Remove preview
              </button>
            </div>
          </div>
        )}
        <input type="file" className="hidden" ref={previewFileInputRef} onChange={handleCustomPreviewSelect} accept="image/*" />
      </FormSection>

      {/* Download Permission Section */}
      <FormSection>
        <div className="flex items-center">
          <input id="allow-download" type="checkbox" checked={formData.allowDownload} onChange={(e) => handleFormChange('allowDownload', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          <label htmlFor="allow-download" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Allow download</label>
        </div>
      </FormSection>

      {/* Content Data Section */}
      <FormSection title="Content Data">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Publication Date" required>
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex items-center"><input id="schedule" type="radio" name="publishOption" value="schedule" checked={!isSchedulingDisabled} onChange={(e) => handleFormChange('publishOption', e.target.value)} className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500" /><label htmlFor="schedule" className="ml-2 text-sm text-slate-700 dark:text-slate-300">Schedule</label></div>
              <div className="flex items-center"><input id="publish-now" type="radio" name="publishOption" value="now" checked={isSchedulingDisabled} onChange={(e) => handleFormChange('publishOption', e.target.value)} className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500" /><label htmlFor="publish-now" className="ml-2 text-sm text-slate-700 dark:text-slate-300">Publish Now</label></div>
            </div>
            <div className="relative"><DatePicker selected={formData.publicationDate} onChange={(date) => handleFormChange('publicationDate', date)} disabled={isSchedulingDisabled} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className={`${inputClasses} pl-10 w-full`} /><div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon /></div></div>
          </FormField>
          {/* ✨ UPDATED ARTIST INPUT ✨ */}
          <SearchableSelect
            label="Artist"
            options={artists}
            value={formData.artist}
            onChange={(newValue) => handleFormChange('artist', newValue)}
            placeholder={isLoadingOptions ? 'Loading...' : 'Choose or type artist...'}
          />
          {/* ✨ UPDATED CLIENT INPUT ✨ */}
          <SearchableSelect
            label="Client"
            options={clients}
            value={formData.client}
            onChange={(newValue) => handleFormChange('client', newValue)}
            placeholder={isLoadingOptions ? 'Loading...' : 'Choose or type client...'}
          />

          <div className="md:col-span-3">
            <FormField label="Description">
              <div className="relative w-full">
                <textarea value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} maxLength="200" placeholder="Enter Clip Description..." className="flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 resize-none"></textarea>
                <div className="absolute bottom-2 right-2 text-xs text-slate-400"> {formData.description.length} / 200 </div>
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Meta Data Section */}
      <FormSection title="Meta Data" hasSeparator={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {/* ✨ UPDATED FEATURED CELEBRITY INPUT ✨ */}
          <SearchableSelect
            label="Featured Celebrity"
            options={celebrities}
            value={formData.featuredCelebrity}
            onChange={(newValue) => handleFormChange('featuredCelebrity', newValue)}
            placeholder={isLoadingOptions ? 'Loading...' : 'Choose or type celebrity...'}
          />
          <FormField label="Content Type">
            <select
              name="contentType"
              value={formData.contentType}
              onChange={(e) => handleFormChange('contentType', e.target.value)}
              className={inputClasses}
            >
              <option value="promo">Promo</option>
              <option value="tutorial">Tutorial</option>
              <option value="highlight">Highlight</option>
            </select>
          </FormField>
          <div className="md:col-span-2"><FormField label="Craft">{formData.crafts.map((craft, index) => (<div key={index} className="flex items-center space-x-2 mb-2"><input type="text" value={craft} onChange={(e) => handleCraftChange(index, e.target.value)} className={inputClasses} placeholder={`Craft #${index + 1}`} /><button type="button" onClick={() => removeCraft(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-md"><TrashIcon /></button></div>))}<button type="button" onClick={addCraft} className="mt-2 flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"><PlusIcon /><span>Add Craft</span></button></FormField></div>
          <div className="md:col-span-2"><FormField label={`Categories (${formData.categories.length}/5)`}><div className="flex flex-wrap items-center gap-2 p-2 border border-slate-300 dark:border-slate-700 rounded-md">{formData.categories.map((tag) => (<span key={tag} className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full">{tag}<button type="button" onClick={() => removeCategory(tag)} className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full">&times;</button></span>))}{formData.categories.length < 5 && (<input type="text" onKeyDown={handleCategoryKeyDown} placeholder="Add category and press Enter..." className="flex-grow bg-transparent focus:outline-none p-1" />)}</div></FormField></div>
        </div>
      </FormSection>

      {/* Fixed Deploy Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button type="button" className="px-3 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-transform transform hover:scale-105">
          Deploy & Upload
        </button>
      </div>
    </div>
  );
};

export default CreateReel;