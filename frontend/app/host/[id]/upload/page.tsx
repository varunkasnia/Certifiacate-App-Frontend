'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizAPI } from '@/lib/api';

export default function UploadDocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileList = files as any;
      await quizAPI.uploadDocuments(quizId, fileList);
      router.push(`/host/${quizId}/generate`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push(`/host/${quizId}/generate`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Upload Learning Materials</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supported formats: PDF, PPTX, DOCX, TXT, Images (JPG, PNG)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.bmp"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload & Continue'}
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Skip (Manual Entry)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
