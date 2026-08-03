import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
    getFiles,
    getPresignedUrl,
    previewFile,
    downloadFile,
    uploadFile,
    deleteFile,
    updateFile,
    searchFiles,
    moveFile,
} from "../../api/fileApi";
import { getFolderTree } from "../../api/folderApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

function Files() {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadLoading, setDownloadLoading] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [renameLoading, setRenameLoading] = useState(null);
    const [moveLoading, setMoveLoading] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [uploadFolderId, setUploadFolderId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [selectedFolderId, setSelectedFolderId] = useState("");
    const [error, setError] = useState("");

    const flattenFolders = (nodes, prefix = "") =>
        nodes.flatMap((folder) => [
            { label: `${prefix}${folder.FolderName}`, value: folder.FolderId },
            ...flattenFolders(folder.children || [], `${prefix}  `),
        ]);

    const loadFolders = async () => {
        const tree = await getFolderTree();
        const flat = flattenFolders(tree);
        setFolders(flat);
        if (!uploadFolderId && flat.length > 0) {
            setUploadFolderId(flat[0].value.toString());
        }
    };

    const loadFiles = async () => {
        setLoading(true);
        setError("");

        try {
            let fileData = [];

            if (searchTerm.trim()) {
                fileData = await searchFiles(searchTerm.trim());
            } else {
                fileData = await getFiles(sortBy, selectedFolderId || null);
            }

            setFiles(fileData);
        } catch (error) {
            console.error("Failed to load files", error);
            setError("Unable to load files.");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            await loadFolders();
            await loadFiles();
        } catch (error) {
            console.error("Failed to load files or folders", error);
            setError("Unable to load files or folders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            await loadData();
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!searchTerm.trim()) {
                await loadFiles();
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, selectedFolderId]);

    const handleDownload = async (file) => {
        try {
            setDownloadLoading(file.FileId);
            const blob = await downloadFile(file.FileId);
            const downloadUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = downloadUrl;
            anchor.download = file.OriginalName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Download failed.");
        } finally {
            setDownloadLoading(null);
        }
    };

    const previewableTypes = ["application/pdf", "image/png", "image/jpeg", "image/gif"];

    const handlePreviewFile = async (file) => {
        if (!previewableTypes.includes(file.FileType)) {
            toast.error("Preview is only available for PDF and image files.");
            return;
        }

        try {
            setPreviewLoading(file.FileId);
            const blob = await previewFile(file.FileId);
            const previewUrl = URL.createObjectURL(blob);
            window.open(previewUrl, "_blank");
            setTimeout(() => URL.revokeObjectURL(previewUrl), 10000);
        } catch (error) {
            console.error("Preview failed", error);
            toast.error("Preview failed.");
        } finally {
            setPreviewLoading(null);
        }
    };

    const handleDeleteFile = async (id) => {
        if (!window.confirm("Delete this file?")) {
            return;
        }

        try {
            setDeleteLoading(id);
            await deleteFile(id);
            toast.success("File deleted successfully.");
            await loadFiles();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error(error.response?.data?.message || "Delete failed.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleRenameFile = async (file) => {
        const newName = window.prompt("Enter a new file name:", file.OriginalName);

        if (!newName || newName.trim() === file.OriginalName) {
            return;
        }

        try {
            setRenameLoading(file.FileId);
            await updateFile(file.FileId, { originalName: newName.trim() });
            toast.success("File renamed successfully.");
            await loadFiles();
        } catch (error) {
            console.error("Rename failed", error);
            toast.error(error.response?.data?.message || "Rename failed.");
        } finally {
            setRenameLoading(null);
        }
    };

    const handleMoveFile = async (file) => {
        const targetFolderId = window.prompt(
            `Enter the target folder ID from the options below (leave blank for root):\n${folders
                .map((folder) => `${folder.value}: ${folder.label}`)
                .join("\n")}`,
            file.FolderId || ""
        );

        if (targetFolderId === null) {
            return;
        }

        const trimmed = targetFolderId.trim();
        const folderId = trimmed ? parseInt(trimmed, 10) : null;

        if (trimmed && !folders.find((folder) => folder.value === folderId)) {
            toast.error("Invalid folder selected.");
            return;
        }

        try {
            setMoveLoading(file.FileId);
            await moveFile(file.FileId, folderId);
            toast.success("File moved successfully.");
            await loadFiles();
        } catch (error) {
            console.error("Move failed", error);
            toast.error(error.response?.data?.message || "Move failed.");
        } finally {
            setMoveLoading(null);
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!fileToUpload) {
            toast.error("Select a file to upload.");
            return;
        }

        if (!uploadFolderId) {
            toast.error("Select a destination folder.");
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(fileToUpload.type)) {
            toast.error("Invalid file type. Allowed: JPEG, PNG, PDF, DOC, DOCX.");
            return;
        }

        if (fileToUpload.size > 10 * 1024 * 1024) {
            toast.error("File must be smaller than 10MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("folderId", uploadFolderId);

        try {
            setUploading(true);
            setUploadProgress(0);
            await uploadFile(formData, (progressEvent) => {
                if (progressEvent.total) {
                    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            });
            toast.success("File uploaded successfully.");
            setFileToUpload(null);
            await loadFiles();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error(error.response?.data?.message || "Upload failed.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        await loadFiles();
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Files</h1>
                    <p className="text-sm text-slate-500">Browse files, preview details, and manage uploads.</p>
                </div>
            </div>

            <section className="grid gap-4 lg:grid-cols-3">
                <div className="section-panel">
                    <h2 className="text-xl font-semibold">Browse</h2>
                    <form onSubmit={handleSearch} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Search Files</label>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="input-field"
                                placeholder="Search by name"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Folder</label>
                            <select
                                value={selectedFolderId}
                                onChange={(event) => setSelectedFolderId(event.target.value)}
                                className="input-field"
                            >
                                <option value="">All folders</option>
                                {folders.map((folder) => (
                                    <option key={folder.value} value={folder.value}>
                                        {folder.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="input-field"
                            >
                                <option value="date">Newest</option>
                                <option value="name">Name</option>
                                <option value="size">Size</option>
                            </select>
                        </div>
                        <button type="submit" className="primary-btn mt-2 w-full justify-center">
                            Search
                        </button>
                    </form>
                </div>

                <div className="section-panel lg:col-span-2">
                    <h2 className="text-xl font-semibold">Folder tree</h2>
                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                        {folders.length ? (
                            folders.map((folder) => (
                                <div key={folder.value} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2">
                                    <span>{folder.label}</span>
                                    <span className="text-xs text-slate-400">ID {folder.value}</span>
                                </div>
                            ))
                        ) : (
                            <p>No folders available.</p>
                        )}
                    </div>
                </div>
            </section>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {user?.role === "admin" && (
                <section className="section-panel">
                    <h2 className="text-xl font-semibold">Upload New File</h2>
                    <form onSubmit={handleUpload} className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">File</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(event) => setFileToUpload(event.target.files?.[0] ?? null)}
                                className="input-field"
                            />
                            <p className="mt-1 text-xs text-slate-500">Allowed: JPEG, PNG, PDF, DOC, DOCX · Max 10MB</p>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Folder</label>
                            <select
                                value={uploadFolderId}
                                onChange={(event) => setUploadFolderId(event.target.value)}
                                className="input-field"
                            >
                                <option value="">Select folder</option>
                                {folders.map((folder) => (
                                    <option key={folder.value} value={folder.value}>
                                        {folder.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={uploading} className="primary-btn w-full">

                                {uploading ? "Uploading..." : "Upload File"}
                            </button>
                        </div>
                    </form>
                    {uploading && (
                        <div className="mt-3 rounded bg-slate-100 p-3">
                            <p className="text-sm text-slate-600">Upload progress: {uploadProgress}%</p>
                            <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                                <div className="h-full rounded bg-blue-600" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    )}
                </section>
            )}

            {files.length ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Folder</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Uploaded</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Size</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {files.map((file) => (
                                <tr key={file.FileId}>
                                    <td className="px-4 py-3 text-sm text-slate-900">
                                        <Link to={`/files/${file.FileId}`} className="font-semibold text-blue-600 hover:underline">
                                            {file.OriginalName}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{file.FolderId || "Root"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(file.CreatedAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{Math.round((file.FileSize || 0) / 1024)} KB</td>
                                    <td className="px-4 py-3 text-sm text-slate-500 space-x-2">
                                        <button
                                            onClick={() => handlePreviewFile(file)}
                                            disabled={previewLoading === file.FileId}
                                            className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
                                        >
                                            {previewLoading === file.FileId ? "Previewing..." : "Preview"}
                                        </button>
                                        <button
                                            onClick={() => handleDownload(file)}
                                            disabled={downloadLoading === file.FileId}
                                            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                                        >
                                            {downloadLoading === file.FileId ? "Preparing..." : "Download"}
                                        </button>
                                        {user?.role === "admin" && (
                                            <>
                                                <button
                                                    onClick={() => handleRenameFile(file)}
                                                    disabled={renameLoading === file.FileId}
                                                    className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:bg-slate-400"
                                                >
                                                    {renameLoading === file.FileId ? "Renaming..." : "Rename"}
                                                </button>
                                                <button
                                                    onClick={() => handleMoveFile(file)}
                                                    disabled={moveLoading === file.FileId}
                                                    className="rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-slate-400"
                                                >
                                                    {moveLoading === file.FileId ? "Moving..." : "Move"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFile(file.FileId)}
                                                    disabled={deleteLoading === file.FileId}
                                                    className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-400"
                                                >
                                                    {deleteLoading === file.FileId ? "Deleting..." : "Delete"}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-slate-500">No files found.</p>
            )}
        </div>
    );
}

export default Files;
