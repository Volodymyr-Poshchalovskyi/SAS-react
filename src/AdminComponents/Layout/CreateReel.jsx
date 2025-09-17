// src/AdminComponents/Layout/CreateReel.jsx

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/* -------------------------------- */
/* === Small Reusable Icons ===     */
/* -------------------------------- */
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

const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

/* -------------------------------- */
/* === Reusable Form Components === */
/* -------------------------------- */
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

/* -------------------------------- */
/* === Main Component ===           */
/* -------------------------------- */
const CreateReel = () => {
  // State for date picker
  const [publicationDate, setPublicationDate] = useState(new Date());
  const [publishOption, setPublishOption] = useState('schedule');
  const isSchedulingDisabled = publishOption === 'now';

  // State for Meta Data section
  const [metaData, setMetaData] = useState({
    artist: '',
    client: '',
    title: '',
    contentType: 'promo',
    featuredCelebrity: '',
  });

  const [crafts, setCrafts] = useState(['', '']);
  const [categories, setCategories] = useState([]);
  const [customFields, setCustomFields] = useState([{ key: '', value: '' }]);

  // --- Handlers for Meta Data ---
  const handleMetaDataChange = (e) => {
    const { name, value } = e.target;
    setMetaData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCraftChange = (index, value) => {
    const newCrafts = [...crafts];
    newCrafts[index] = value;
    setCrafts(newCrafts);
  };
  const addCraft = () => setCrafts([...crafts, '']);
  const removeCraft = (index) => setCrafts(crafts.filter((_, i) => i !== index));
  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      if (categories.length < 5 && !categories.includes(e.target.value.trim())) {
        setCategories([...categories, e.target.value.trim()]);
      }
      e.target.value = '';
    }
  };
  const removeCategory = (tagToRemove) => {
    setCategories(categories.filter((tag) => tag !== tagToRemove));
  };
  const handleCustomFieldChange = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };
  const addCustomField = () => setCustomFields([...customFields, { key: '', value: '' }]);
  const removeCustomField = (index) => setCustomFields(customFields.filter((_, i) => i !== index));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title Section */}
      <FormSection>
        <FormField label="Title" required>
          <input
            type="text"
            placeholder="Enter title..."
            className={inputClasses}
          />
        </FormField>
      </FormSection>

      {/* Upload Section */}
      <FormSection title="Upload Content">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-600 dark:hover:border-slate-500 transition-colors"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <UploadIcon />
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Drag & Drop to upload</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              or
            </p>
            <button
              type="button"
              className="px-4 py-1.5 text-xs font-semibold bg-teal-500 text-white rounded-md hover:bg-teal-600"
            >
              Choose File
            </button>
          </div>
          <input id="dropzone-file" type="file" className="hidden" />
        </label>
      </FormSection>

      {/* Image Previews Section */}
      <FormSection title="Images">
        <div className="text-sm text-slate-400">
          Image previews will appear here.
        </div>
      </FormSection>

      {/* Download Permission Section */}
      <FormSection>
        <div className="flex items-center">
          <input
            id="allow-download"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <label
            htmlFor="allow-download"
            className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Allow download
          </label>
        </div>
      </FormSection>

      {/* Content Data Section */}
      <FormSection title="Content Data">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Publication Date" required>
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex items-center">
                <input
                  id="schedule"
                  type="radio"
                  name="publishOption"
                  value="schedule"
                  checked={!isSchedulingDisabled}
                  onChange={(e) => setPublishOption(e.target.value)}
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
                  onChange={(e) => setPublishOption(e.target.value)}
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
                selected={publicationDate}
                onChange={(date) => setPublicationDate(date)}
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
          <FormField label="Artist">
            <select className={inputClasses}>
              <option>Choose Artist...</option>
            </select>
          </FormField>
          <FormField label="Client">
            <select className={inputClasses}>
              <option>Choose Client...</option>
            </select>
          </FormField>
          <div className="md:col-span-3">
            <FormField label="Description">
              <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-md">
                <div className="pb-2 mb-2 border-b border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                  [Toolbar for rich text editor]
                </div>
                <textarea
                  rows="4"
                  placeholder="Enter Clip Description..."
                  className="w-full bg-transparent focus:outline-none text-sm"
                ></textarea>
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* === MODIFIED META DATA SECTION === */}
      <FormSection title="Meta Data" hasSeparator={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <FormField label="Artist">
            <input name="artist" value={metaData.artist} onChange={handleMetaDataChange} type="text" className={inputClasses} />
          </FormField>
          <FormField label="Client">
            <input name="client" value={metaData.client} onChange={handleMetaDataChange} type="text" className={inputClasses} />
          </FormField>
          <FormField label="Title">
            <input name="title" value={metaData.title} onChange={handleMetaDataChange} type="text" className={inputClasses} />
          </FormField>
          <FormField label="Featured Celebrity">
            <input name="featuredCelebrity" value={metaData.featuredCelebrity} onChange={handleMetaDataChange} type="text" className={inputClasses} />
          </FormField>
          <FormField label="Content Type">
            <select name="contentType" value={metaData.contentType} onChange={handleMetaDataChange} className={inputClasses}>
              <option value="promo">Promo</option>
              <option value="tutorial">Tutorial</option>
              <option value="highlight">Highlight</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Craft">
              {crafts.map((craft, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={craft}
                    onChange={(e) => handleCraftChange(index, e.target.value)}
                    className={inputClasses}
                    placeholder={`Craft #${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeCraft(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCraft}
                className="mt-2 flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                <PlusIcon />
                <span>Add Craft</span>
              </button>
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label={`Categories (${categories.length}/5)`}>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-300 dark:border-slate-700 rounded-md">
                {categories.map((tag) => (
                  <span key={tag} className="flex items-center bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium px-2.5 py-1 rounded-full">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeCategory(tag)}
                      className="ml-2 -mr-1 p-0.5 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-700 rounded-full"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {categories.length < 5 && (
                  <input
                    type="text"
                    onKeyDown={handleCategoryKeyDown}
                    placeholder="Add category and press Enter..."
                    className="flex-grow bg-transparent focus:outline-none p-1"
                  />
                )}
              </div>
            </FormField>
          </div>
          
          <div className="md:col-span-2">
            <FormField label="Additional Custom Fields">
              {customFields.map((field, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center mb-2">
                   <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                      className={inputClasses}
                      placeholder="Key (e.g., Colorist)"
                    />
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      className={inputClasses}
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-md"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
               <button
                type="button"
                onClick={addCustomField}
                className="mt-2 flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                <PlusIcon />
                <span>Add Field</span>
              </button>
            </FormField>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default CreateReel;