// src/AdminComponents/Layout/CreateReel.jsx

import React from 'react';

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

/* -------------------------------- */
/* === Reusable Form Components === */
/* -------------------------------- */

// * Wrapper for a section in the form
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

// * Wrapper for individual form field with label
const FormField = ({ label, children, required = false }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// * Shared input classes (text, select, etc.)
const inputClasses =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500';

/* -------------------------------- */
/* === Main Component ===           */
/* -------------------------------- */
const CreateReel = () => {
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
          {/* Publication Date */}
          <FormField label="Publication Date" required>
            <div className="relative">
              <input
                type="text"
                defaultValue="09-09-2025"
                className={`${inputClasses} pl-10`}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarIcon />
              </div>
            </div>
          </FormField>

          {/* Artist */}
          <FormField label="Artist">
            <select className={inputClasses}>
              <option>Choose Artist...</option>
            </select>
          </FormField>

          {/* Client */}
          <FormField label="Client">
            <select className={inputClasses}>
              <option>Choose Client...</option>
            </select>
          </FormField>

          {/* Description with mock toolbar */}
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

      {/* Meta Data Section */}
      <FormSection title="Meta Data" hasSeparator={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Agency">
            <select className={inputClasses}>
              <option>Choose Agency...</option>
            </select>
          </FormField>
          <FormField label="Content Types">
            <select className={inputClasses}>
              <option>Choose Content Types...</option>
            </select>
          </FormField>
          <FormField label="Categories">
            <input
              type="text"
              placeholder="Choose one or more categories..."
              className={inputClasses}
            />
          </FormField>
          <FormField label="Version">
            <select className={inputClasses}>
              <option>Choose Version...</option>
            </select>
          </FormField>
          <FormField label="Artist">
            <input type="text" className={inputClasses} />
          </FormField>
          <FormField label="Year">
            <input type="text" className={inputClasses} />
          </FormField>
          <FormField label="Title">
            <input type="text" className={inputClasses} />
          </FormField>
          <FormField label="Director of Photography">
            <select className={inputClasses}>
              <option>Choose...</option>
            </select>
          </FormField>
          <FormField label="Producer">
            <input type="text" className={inputClasses} />
          </FormField>
          <FormField label="Photographer">
            <select className={inputClasses}>
              <option>Choose...</option>
            </select>
          </FormField>
          <FormField label="Simian Media ID">
            <input type="text" defaultValue="0" className={inputClasses} />
          </FormField>
          <FormField label="song title">
            <select className={inputClasses}>
              <option>Choose...</option>
            </select>
          </FormField>
        </div>
      </FormSection>
    </div>
  );
};

export default CreateReel;
