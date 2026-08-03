import { useEffect, useState, useContext } from "react";
import {
    getFolders,
    getFolderTree,
    searchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
} from "../../api/folderApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

function Folders() {
    const { user } = useContext(AuthContext);
    const [folders, setFolders] = useState([]);
    const [folderTree, setFolderTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [folderName, setFolderName] = useState("");
    const [parentFolderId, setParentFolderId] = useState("");
    const [creating, setCreating] = useState(false);
    const [processingFolderId, setProcessingFolderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [error, setError] = useState("");

    const buildTreeNodes = (nodes, level = 0) =>
        nodes.flatMap((folder) => [
            { ...folder, indent: level * 16 },
            ...buildTreeNodes(folder.children || [], level + 1),
        ]);

    const loadFolderData = async () => {
        setLoading(true);
        setError("");

        try {
            const [flatFolders, tree] = await Promise.all([getFolders(sortBy), getFolderTree()]);
            setFolders(flatFolders);
            setFolderTree(tree);
            if (!parentFolderId && flatFolders.length > 0) {
                setParentFolderId(flatFolders[0].FolderId.toString());
            }
        } catch (error) {
            console.error("Failed to load folders", error);
            setError("Unable to load folders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            await loadFolderData();
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy]);

    const handleRenameFolder = async (folder) => {
        const newName = window.prompt("Enter a new folder name:", folder.FolderName);

        if (!newName || newName.trim() === folder.FolderName) {
            return;
        }

        try {
            setProcessingFolderId(folder.FolderId);
            await updateFolder(folder.FolderId, { folderName: newName.trim() });
            toast.success("Folder renamed successfully.");
            await loadFolderData();
        } catch (error) {
            console.error("Rename folder failed", error);
            toast.error(error.response?.data?.message || "Rename failed.");
        } finally {
            setProcessingFolderId(null);
        }
    };

    const handleMoveFolder = async (folder) => {
        const targetFolderId = window.prompt(
            `Enter a new parent folder ID from the list below (leave blank for root):\n${folders
                .map((item) => `${item.FolderId}: ${item.FolderName}`)
                .join("\n")}`,
            folder.ParentFolderId || ""
        );

        if (targetFolderId === null) {
            return;
        }

        const trimmed = targetFolderId.trim();
        const parentId = trimmed ? parseInt(trimmed, 10) : null;

        if (trimmed && !folders.some((item) => item.FolderId === parentId)) {
            toast.error("Invalid parent folder selected.");
            return;
        }

        try {
            setProcessingFolderId(folder.FolderId);
            await moveFolder(folder.FolderId, parentId);
            toast.success("Folder moved successfully.");
            await loadFolderData();
        } catch (error) {
            console.error("Move folder failed", error);
            toast.error(error.response?.data?.message || "Move failed.");
        } finally {
            setProcessingFolderId(null);
        }
    };

    const handleSearchFolders = async (event) => {
        event.preventDefault();
        if (!searchTerm.trim()) {
            await loadFolderData();
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await searchFolders(searchTerm.trim());
            setFolders(data);
        } catch (error) {
            console.error("Folder search failed", error);
            setError("Unable to search folders.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetSearch = async () => {
        setSearchTerm("");
        await loadFolderData();
    };

    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm("Delete this folder? This action cannot be undone.")) {
            return;
        }

        try {
            setProcessingFolderId(folderId);
            await deleteFolder(folderId);
            toast.success("Folder deleted successfully.");
            await loadFolderData();
        } catch (error) {
            console.error("Delete folder failed", error);
            toast.error(error.response?.data?.message || "Delete failed.");
        } finally {
            setProcessingFolderId(null);
        }
    };

    const handleCreateFolder = async (event) => {
        event.preventDefault();

        if (!folderName.trim()) {
            toast.error("Folder name is required.");
            return;
        }

        try {
            setCreating(true);
            await createFolder({ folderName, parentFolderId: parentFolderId || null });
            toast.success("Folder created successfully.");
            setFolderName("");
            setParentFolderId("");
            await loadFolderData();
        } catch (error) {
            console.error("Failed to create folder", error);
            toast.error(error.response?.data?.message || "Create folder failed.");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Folders</h1>
                    <p className="text-sm text-slate-500">View and manage nested folders with search and move support.</p>
                </div>
            </div>

            <section className="grid gap-4 lg:grid-cols-3">
                <div className="section-panel">
                    <h2 className="text-xl font-semibold">Search folders</h2>
                    <form onSubmit={handleSearchFolders} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Search by name</label>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="input-field"
                                placeholder="Search folders"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="input-field"
                            >
                                <option value="name">Name</option>
                                <option value="date">Created date</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button type="submit" className="primary-btn">
                                Search
                            </button>
                            <button type="button" onClick={handleResetSearch} className="secondary-btn">
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                <div className="section-panel lg:col-span-2">
                    <h2 className="text-xl font-semibold">Folder tree</h2>
                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                        {folderTree.length ? (
                            buildTreeNodes(folderTree).map((folder) => (
                                <div
                                    key={folder.FolderId}
                                    className="rounded border border-slate-100 bg-slate-50 p-3"
                                    style={{ marginLeft: folder.indent }}
                                >
                                    <p className="font-semibold text-slate-900">{folder.FolderName}</p>
                                    <p className="text-xs text-slate-400">ID {folder.FolderId}</p>
                                </div>
                            ))
                        ) : (
                            <p>No folder tree available.</p>
                        )}
                    </div>
                </div>
            </section>

            {user?.role === "admin" && (
                <section className="section-panel">
                    <h2 className="text-xl font-semibold">Create Folder</h2>
                    <form onSubmit={handleCreateFolder} className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Folder Name</label>
                            <input
                                value={folderName}
                                onChange={(event) => setFolderName(event.target.value)}
                                className="input-field"
                                placeholder="New folder name"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Parent Folder</label>
                            <select
                                value={parentFolderId}
                                onChange={(event) => setParentFolderId(event.target.value)}
                                className="input-field"
                            >
                                <option value="">No parent (root)</option>
                                {folders.map((folder) => (
                                    <option key={folder.FolderId} value={folder.FolderId}>
                                        {folder.FolderName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={creating} className="primary-btn w-full">
                                {creating ? "Creating..." : "Create Folder"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {folders.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {folders.map((folder) => (
                        <div key={folder.FolderId} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">{folder.FolderName}</h2>
                            <p className="mt-2 text-sm text-slate-500">ID: {folder.FolderId}</p>
                            <p className="mt-2 text-sm text-slate-500">Parent: {folder.ParentFolderId || "Root"}</p>
                            {user?.role === "admin" && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleRenameFolder(folder)}
                                        disabled={processingFolderId === folder.FolderId}
                                        className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:bg-slate-400"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => handleMoveFolder(folder)}
                                        disabled={processingFolderId === folder.FolderId}
                                        className="rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-slate-400"
                                    >
                                        Move
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFolder(folder.FolderId)}
                                        disabled={processingFolderId === folder.FolderId}
                                        className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-400"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500">No folders found.</p>
            )}
        </div>
    );
}

export default Folders;