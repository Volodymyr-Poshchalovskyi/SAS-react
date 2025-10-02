import React from 'react';
import { useUpload } from '../context/UploadContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

const UploadModal = () => {
    const { uploadStatus } = useUpload();

    if (!uploadStatus.isActive) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center">
                        {uploadStatus.isSuccess ? (
                            <CheckCircle2 size={22} className="mr-3 text-teal-500" />
                        ) : (
                            <Loader2 size={22} className="animate-spin mr-3" />
                        )}
                        {uploadStatus.message}
                    </h3>
                </div>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Please do not close or reload this page during the upload.
                </p>

                {uploadStatus.totalFiles > 0 && (
                    <>
                        <div className="mb-4">
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                                <span className="font-medium">Overall Progress</span>
                                <span className="font-mono">{uploadStatus.completedFiles} / {uploadStatus.totalFiles}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="h-2 rounded-full bg-teal-500 transition-all duration-300" style={{ width: `${(uploadStatus.completedFiles / uploadStatus.totalFiles) * 100}%` }}></div>
                            </div>
                        </div>
                        {uploadStatus.currentFileName && !uploadStatus.isSuccess && (
                            <div>
                                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span className="truncate w-4/5 font-medium">{uploadStatus.currentFileName}</span>
                                    <span className="font-mono">{Math.round(uploadStatus.currentFileProgress)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 transition-all duration-300" style={{ width: `${uploadStatus.currentFileProgress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {uploadStatus.error && (
                    <p className="text-xs text-red-500 mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md break-words">
                        <strong>Error:</strong> {uploadStatus.error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default UploadModal;