import { useEffect, useState } from "react";
import { getDashboard } from "../../api/dashboardApi";
import Loader from "../../components/Loader";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await getDashboard();
                setDashboard(data);
            } catch (error) {
                console.error("Dashboard load failed", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">A clean overview of users, folders, and files.</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="section-panel">
                    <p className="text-sm text-slate-500">Total users</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-900">{dashboard?.totalUsers ?? 0}</p>
                </div>
                <div className="section-panel">
                    <p className="text-sm text-slate-500">Total folders</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-900">{dashboard?.totalFolders ?? 0}</p>
                </div>
                <div className="section-panel">
                    <p className="text-sm text-slate-500">Total files</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-900">{dashboard?.totalFiles ?? 0}</p>
                </div>
            </div>

            <section className="section-panel">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">Recent files</h2>
                    <p className="text-sm text-slate-500">Latest uploads across the system.</p>
                </div>
                {dashboard?.recentFiles?.length ? (
                    <div className="mt-4 grid gap-4">
                        {dashboard.recentFiles.map((file) => (
                            <div key={file.FileId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="font-semibold text-slate-900">{file.OriginalName}</p>
                                <p className="mt-1 text-sm text-slate-500">Uploaded: {new Date(file.CreatedAt).toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Type: {file.FileType}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-slate-500">No recent files available.</p>
                )}
            </section>
        </div>
    );
}

export default Dashboard;