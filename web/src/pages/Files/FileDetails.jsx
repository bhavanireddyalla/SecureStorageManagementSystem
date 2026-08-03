import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileById, getPresignedUrl } from "../../api/fileApi";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

function FileDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewError, setPreviewError] = useState("");

    useEffect(() => {
        const loadFile = async () => {
            try {
                const data = await getFileById(id);
                setFile(data);
            } catch (error) {
                console.error("File details load failed", error);
                toast.error(error.response?.data?.message || "Unable to load file details.");
            } finally {
                setLoading(false);
            }
        };

        loadFile();
    }, [id]);

    const handleDownload = async () => {
        try {
            setDownloadLoading(true);
            const response = await getPresignedUrl(id);
            window.open(response.url, "_blank");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Download failed.");
        } finally {
            setDownloadLoading(false);
        }
    };

    const handlePreview = async () => {
        try {
            const response = await getPresignedUrl(id);
            setPreviewUrl(response.url);
            setPreviewError("");
        } catch (error) {
            console.error("Preview failed", error);
            setPreviewError("Preview is not available for this file type.");
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!file) {
        return (
            <section className="section-panel">
                <p className="text-slate-500">File details could not be loaded.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="primary-btn mt-4"
                >
                    Back
                </button>
            </section>
        );
    }

    const previewableTypes = ["application/pdf", "image/png", "image/jpeg", "image/gif"];
    const canPreview = previewableTypes.includes(file.FileType);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">File details</h1>
                    <p className="text-sm text-slate-500">Review file metadata or download a secure copy.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="secondary-btn"
                >
                    Back
                </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="section-panel">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">Metadata</h2>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            {file.FileType}
                        </div>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div>
                            <p className="font-medium text-slate-900">Name</p>
                            <p>{file.OriginalName}</p>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Folder</p>
                            <p>{file.FolderId || "Root"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Size</p>
                            <p>{Math.round((file.FileSize || 0) / 1024)} KB</p>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Uploaded</p>
                            <p>{new Date(file.CreatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={downloadLoading}
                            className="primary-btn"
                        >
                            {downloadLoading ? "Preparing..." : "Download"}
                        </button>
                        {canPreview && (
                            <button
                                onClick={handlePreview}
                                className="secondary-btn"
                            >
                                Preview
                            </button>
                        )}
                    </div>
                </section>

                <section className="section-panel">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">Preview</h2>
                        <p className="text-sm text-slate-500">PDF and image preview only</p>
                    </div>
                    {previewError ? (
                        <p className="mt-4 text-sm text-red-600">{previewError}</p>
                    ) : previewUrl ? (
                        <div className="mt-4 min-h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                            {file.FileType.startsWith("image/") ? (
                                <img src={previewUrl} alt={file.OriginalName} className="h-full w-full object-contain" />
                            ) : (
                                <iframe src={previewUrl} className="h-[450px] w-full" title="File preview" />
                            )}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">Preview is available for PDF and image files.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default FileDetails;
