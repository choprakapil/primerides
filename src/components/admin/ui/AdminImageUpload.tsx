"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

interface AdminImageUploadProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  folder?: "cars" | "blogs" | "cms" | "categories";
  helperText?: string;
  error?: string;
  className?: string;
}

export function AdminImageUpload({
  label = "Image Upload",
  required = false,
  value,
  onChange,
  folder = "cars",
  helperText = "PNG, JPG, or WebP up to 8MB. Recommended 1200x800 for vehicle catalog.",
  error,
  className = "",
}: AdminImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload image.");
      }

      onChange(json.data.url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {/* Label and Mode Switch */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 tracking-wide select-none">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#5955D1] hover:text-[#4743BA] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? "Use File Upload" : "Enter Image URL"}</span>
        </button>
      </div>

      {/* Mode 1: Manual URL fallback if explicitly requested */}
      {showUrlInput ? (
        <div className="space-y-1.5">
          <div className="flex items-center h-10 rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-[#5955D1] focus-within:ring-2 focus-within:ring-[#5955D1]/20 shadow-sm">
            <span className="h-full px-3 bg-slate-50 border-r border-[#e8edf2] text-slate-500 flex items-center justify-center shrink-0">
              <ImageIcon className="w-3.5 h-3.5 text-[#5955D1]" />
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/assets/img/cars/1.jpg or https://..."
              className="w-full h-full px-3 bg-transparent border-none outline-none text-xs text-[#1c274c] font-medium"
            />
          </div>
          <p className="text-[10.5px] text-slate-400">
            Paste a public path or remote web image link.
          </p>
        </div>
      ) : (
        /* Mode 2: Direct Drag & Drop / File Upload (Default) */
        <div>
          {value ? (
            /* Uploaded Image Preview & Action Card */
            <div className="card border p-3 rounded-3 mb-2">
              <div className="flex items-center gap-3.5">
                <div className="rounded-3 overflow-hidden bg-light border shrink-0 position-relative" style={{ width: "80px", height: "56px" }}>
                  <img
                    src={value}
                    alt="Uploaded preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/img/cars/1.jpg";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Image Attached</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                    {value}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1.5 rounded-lg border border-[#e8edf2] hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUploading ? "animate-spin text-[#5955D1]" : ""}`} />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    disabled={isUploading}
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3 p-6 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? "border-[#5955D1] bg-[#eeedfc] scale-[1.01]"
                  : "border-slate-300 hover:border-[#5955D1]/60 hover:bg-slate-50/70 bg-[#f8fafc]/60"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-2.5 rounded-3 bg-white border border-[#e8edf2] flex items-center justify-center text-[#5955D1] shadow-xs">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#5955D1]" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div className="text-xs font-bold text-[#1c274c]">
                {isUploading ? (
                  <span className="text-[#5955D1]">Uploading high-res image...</span>
                ) : (
                  <>
                    <span className="text-[#5955D1] underline decoration-[#5955D1]/50 underline-offset-2 hover:text-[#4743BA]">
                      Click to upload
                    </span>{" "}
                    or drag &amp; drop vehicle image
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {helperText}
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Errors */}
      {(uploadError || error) && (
        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 pt-0.5" role="alert">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{uploadError || error}</span>
        </p>
      )}
    </div>
  );
}
