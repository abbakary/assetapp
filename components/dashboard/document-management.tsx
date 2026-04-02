"use client";

import { useState, useRef, useCallback } from "react";
import {
  FileText,
  FileImage,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Grid3X3,
  List,
  Download,
  Eye,
  Upload,
  Filter,
  Calendar,
  Tag,
  X,
  Check,
  Trash2,
  File,
  Image,
  FileSpreadsheet,
  AlertCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockDocuments, mockAssets } from "@/lib/mock-data";
import FileStorage from "@/lib/file-storage";
import { DocumentViewer } from "./document-viewer";
import type { Document } from "@/lib/types";

const documentTypeIcons: Record<string, React.ElementType> = {
  title: FileText,
  plan: FileImage,
  permit: FileText,
  warranty: FileText,
  photo: Image,
  maintenance: FileSpreadsheet,
};

const documentTypeColors: Record<string, string> = {
  title: "text-blue-400",
  plan: "text-emerald-400",
  permit: "text-amber-400",
  warranty: "text-purple-400",
  photo: "text-pink-400",
  maintenance: "text-orange-400",
};

interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "document";
  children?: FolderNode[];
  documentType?: string;
}

const folderStructure: FolderNode[] = [
  {
    id: "all",
    name: "All Documents",
    type: "folder",
    children: [
      { id: "titles", name: "Titles", type: "folder", children: [] },
      { id: "plans", name: "Plans", type: "folder", children: [] },
      { id: "permits", name: "Permits", type: "folder", children: [] },
      { id: "warranties", name: "Warranties", type: "folder", children: [] },
      { id: "photos", name: "Photos", type: "folder", children: [] },
      { id: "maintenance", name: "Maintenance Records", type: "folder", children: [] },
    ],
  },
];

interface FolderTreeProps {
  node: FolderNode;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

function FolderTree({ node, level, selectedId, onSelect, expandedIds, onToggle }: FolderTreeProps) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0.5 hover:bg-secondary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <FolderOpen className={cn("h-4 w-4", isSelected ? "text-primary" : "text-amber-400")} />
        <span className={cn("text-sm", isSelected && "font-medium")}>{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <FolderTree
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  preview?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], assetId: string, documentType: string, tags: string[]) => Promise<void> | void;
}

function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedAsset, setSelectedAsset] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [tags, setTags] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFiles = (fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: "uploading" as const,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress: 100, status: "completed" as const } : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f))
          );
        }
      }, 200);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!selectedAsset || !documentType || files.length === 0) return;

    const completedFiles = files.filter((f) => f.status === "completed").map((f) => f.file);
    await onUpload(completedFiles, selectedAsset, documentType, tags.split(",").map((t) => t.trim()).filter(Boolean));

    // Cleanup
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setSelectedAsset("");
    setDocumentType("");
    setTags("");
    onClose();
  };

  const allCompleted = files.length > 0 && files.every((f) => f.status === "completed");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Asset & Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Link to Asset <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-secondary px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select an asset</option>
                {mockAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-secondary px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select type</option>
                <option value="title">Title / Deed</option>
                <option value="plan">Building Plan</option>
                <option value="permit">Permit / License</option>
                <option value="warranty">Warranty</option>
                <option value="photo">Photo</option>
                <option value="maintenance">Maintenance Record</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., ownership, legal, 2024"
              className="w-full bg-secondary px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              dragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary/30"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-primary/20 rounded-full">
                <Upload className={cn("h-8 w-8", dragActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {dragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse. Supports PDF, DOC, DOCX, JPG, PNG, XLS
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files ({files.length})</p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                  >
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              uploadedFile.status === "completed" ? "bg-emerald-500" : "bg-primary"
                            )}
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {uploadedFile.status === "completed" ? (
                            <Check className="h-4 w-4 text-emerald-500 inline" />
                          ) : (
                            `${Math.round(uploadedFile.progress)}%`
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="p-1.5 hover:bg-secondary rounded"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-secondary/30">
          <p className="text-xs text-muted-foreground">
            {!selectedAsset && <span className="text-amber-500">Select an asset</span>}
            {selectedAsset && !documentType && <span className="text-amber-500">Select document type</span>}
            {selectedAsset && documentType && files.length === 0 && (
              <span className="text-amber-500">Add files to upload</span>
            )}
            {selectedAsset && documentType && files.length > 0 && !allCompleted && (
              <span>Uploading files...</span>
            )}
            {allCompleted && <span className="text-emerald-500">Ready to submit</span>}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAsset || !documentType || !allCompleted}
              className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Document file data map for storing and retrieving uploaded file data
const documentFileDataMap = new Map<string, string>();

export function DocumentManagementDashboard() {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["all"]));
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(mockDocuments[0]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const handleUpload = async (files: File[], assetId: string, documentType: string, tags: string[]) => {
    const newDocs: Document[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const documentId = `DOC-${Date.now()}-${idx}`;

      try {
        // Store file in localStorage
        const storedFile = await FileStorage.storeFile(file, assetId, documentType, documentId);

        // Store the data URL for quick access
        documentFileDataMap.set(documentId, storedFile.dataUrl);

        newDocs.push({
          id: documentId,
          assetId,
          name: file.name,
          type: documentType as Document["type"],
          uploadDate: storedFile.uploadDate,
          size: storedFile.size,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    if (newDocs.length > 0) {
      setDocuments((prev) => [...newDocs, ...prev]);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.assetId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const documentTypeFilters = [
    { value: "all", label: "All Documents" },
    { value: "title", label: "Titles" },
    { value: "plan", label: "Plans" },
    { value: "warranty", label: "Warranties" },
    { value: "permit", label: "Permits" },
    { value: "photo", label: "Photos" },
    { value: "maintenance", label: "Maintenance" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Document Management System</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Documents
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {documentTypeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedType(filter.value)}
            className={cn(
              "px-4 py-2 rounded-md text-sm transition-colors",
              selectedType === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Folder Tree */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border bg-secondary/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="p-2">
            <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wider">Asset ID</p>
            <div className="space-y-1 mt-2">
              {mockAssets.slice(0, 5).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSearchQuery(asset.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary/50 transition-colors",
                    searchQuery === asset.id && "bg-primary/20 text-primary"
                  )}
                >
                  {asset.id} - {asset.name.slice(0, 15)}...
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wider">Document Type</p>
              {folderStructure.map((node) => (
                <FolderTree
                  key={node.id}
                  node={node}
                  level={0}
                  selectedId={selectedFolder}
                  onSelect={setSelectedFolder}
                  expandedIds={expandedFolders}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Document List/Grid */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded hover:bg-secondary">
                <Filter className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-secondary">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => {
                const Icon = documentTypeIcons[doc.type] || FileText;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    onDoubleClick={() => {
                      setSelectedDocument(doc);
                      setIsPreviewOpen(true);
                    }}
                    className={cn(
                      "p-4 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors border-2",
                      selectedDocument?.id === doc.id ? "border-primary" : "border-transparent"
                    )}
                  >
                    <div className="aspect-[4/3] bg-secondary rounded-lg flex items-center justify-center mb-3">
                      <Icon className={cn("h-12 w-12", documentTypeColors[doc.type])} />
                    </div>
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size}</p>
                    <p className="text-xs text-muted-foreground mt-1">Asset: {doc.assetId}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-secondary/30 text-xs text-muted-foreground font-medium">
                <div className="col-span-1">
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Asset</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Size</div>
                <div className="col-span-2">Actions</div>
              </div>
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents found</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const Icon = documentTypeIcons[doc.type] || FileText;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      onDoubleClick={() => {
                        setSelectedDocument(doc);
                        setIsPreviewOpen(true);
                      }}
                      className={cn(
                        "grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer hover:bg-secondary/30 transition-colors",
                        selectedDocument?.id === doc.id && "bg-primary/10"
                      )}
                    >
                      <div className="col-span-1">
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", documentTypeColors[doc.type])} />
                        <span className="text-sm truncate">{doc.name}</span>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">{doc.assetId}</div>
                      <div className="col-span-2 text-sm text-muted-foreground">{doc.uploadDate}</div>
                      <div className="col-span-1 text-sm text-muted-foreground">{doc.size}</div>
                      <div className="col-span-2 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setIsPreviewOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-secondary"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-secondary">
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Document Preview */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border bg-secondary/30">
            <h3 className="font-medium">Document Preview</h3>
          </div>
          {selectedDocument ? (
            <div className="p-4 space-y-4">
              <div
                onClick={() => setIsPreviewOpen(true)}
                className="aspect-[4/3] bg-secondary rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                <div className="text-center">
                  {selectedDocument.type === "photo" ? (
                    <Image className="h-16 w-16 text-pink-400 mx-auto mb-2" />
                  ) : (
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  )}
                  <p className="text-sm text-primary">Click to Preview</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">{selectedDocument.name.replace(/\.[^/.]+$/, "")}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Asset:</span>
                    <span>{selectedDocument.assetId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{selectedDocument.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span>{selectedDocument.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Size:</span>
                    <span>{selectedDocument.size}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex-1 bg-secondary text-foreground py-2 rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a document to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />
      <DocumentViewer
        document={selectedDocument}
        fileData={selectedDocument ? documentFileDataMap.get(selectedDocument.id) : undefined}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
