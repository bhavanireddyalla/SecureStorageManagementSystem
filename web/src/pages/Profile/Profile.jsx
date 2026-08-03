import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Profile() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="section-panel">
                <p className="text-slate-500">No profile available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Profile</h1>
                    <p className="text-sm text-slate-500">Your user information and access role.</p>
                </div>
            </div>
            <section className="section-panel">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="text-lg font-semibold text-slate-900">{user.name}</p>
                    </div>
                    <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="text-lg font-semibold text-slate-900">{user.email}</p>
                    </div>
                    <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">Role</p>
                        <p className="text-lg font-semibold text-slate-900">{user.role}</p>
                    </div>
                    <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">User ID</p>
                        <p className="text-lg font-semibold text-slate-900">{user.userId || user.UserId}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Profile;