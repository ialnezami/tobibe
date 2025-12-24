"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MedicalDocument {
  _id: string;
  documentType: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  documentDate: string;
  doctorId?: { name: string };
  tags: string[];
  createdAt: string;
}

export default function PatientDocumentsPage() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    documentType: "lab_result",
    title: "",
    description: "",
    documentDate: new Date().toISOString().split("T")[0],
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?type=${filter}` : "";
      const response = await fetch(`/api/patient/documents${params}`);
      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData({ ...formData, title: file.name });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);

      // First, upload the file
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/patient/documents/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        alert(uploadData.error || "Failed to upload file");
        setUploading(false);
        return;
      }

      // Then, create the document record
      const documentResponse = await fetch("/api/patient/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: formData.documentType,
          title: formData.title,
          description: formData.description || undefined,
          fileUrl: uploadData.fileUrl,
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
          mimeType: uploadData.mimeType,
          documentDate: formData.documentDate,
          tags: formData.tags
            ? formData.tags.split(",").map((tag) => tag.trim())
            : [],
        }),
      });

      const documentData = await documentResponse.json();
      if (documentResponse.ok) {
        alert("Document uploaded successfully!");
        setShowUploadForm(false);
        setSelectedFile(null);
        setFormData({
          documentType: "lab_result",
          title: "",
          description: "",
          documentDate: new Date().toISOString().split("T")[0],
          tags: "",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchDocuments();
      } else {
        alert(documentData.error || "Failed to create document record");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/patient/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      lab_result: "Lab Result",
      test_report: "Test Report",
      imaging: "Imaging",
      prescription_copy: "Prescription Copy",
      medical_certificate: "Medical Certificate",
      insurance: "Insurance",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      lab_result: "🧪",
      test_report: "📋",
      imaging: "📷",
      prescription_copy: "💊",
      medical_certificate: "📜",
      insurance: "🏥",
      other: "📄",
    };
    return icons[type] || "📄";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const documentTypes = [
    "lab_result",
    "test_report",
    "imaging",
    "prescription_copy",
    "medical_certificate",
    "insurance",
    "other",
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
            Medical Documents
          </h1>
          <p className="text-slate-600">
            Store and access your medical documents, lab results, and test reports
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowUploadForm(!showUploadForm)}>
          {showUploadForm ? "Cancel" : "+ Upload Document"}
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Medical Document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select File * (Max 10MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                required
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
              />
              {selectedFile && (
                <p className="text-sm text-slate-600 mt-2">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Type *
                </label>
                <select
                  required
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.documentDate}
                  onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Input
                label="Title *"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Blood Test Results - January 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                rows={3}
                placeholder="Additional information about this document"
              />
            </div>

            <div>
              <Input
                label="Tags (comma-separated)"
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., annual checkup, blood work, x-ray"
              />
            </div>

            <Button type="submit" variant="primary" isLoading={uploading}>
              Upload Document
            </Button>
          </form>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          All
        </button>
        {documentTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 text-sm font-medium ${
              filter === type
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {getDocumentTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-slate-600 mb-2">No documents uploaded yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Upload your medical documents, lab results, and test reports
            </p>
            <Button variant="primary" onClick={() => setShowUploadForm(true)}>
              Upload Your First Document
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getDocumentIcon(document.documentType)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{document.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{getDocumentTypeLabel(document.documentType)}</span>
                        <span>•</span>
                        <span>{new Date(document.documentDate).toLocaleDateString()}</span>
                        {document.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(document.fileSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {document.description && (
                    <p className="text-sm text-slate-600 mb-2 ml-11">{document.description}</p>
                  )}
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-11 mb-2">
                      {document.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {document.doctorId && (
                    <p className="text-xs text-slate-500 ml-11">
                      From: {document.doctorId.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <Button variant="outline" className="text-xs">
                      View
                    </Button>
                  </a>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => handleDelete(document._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


