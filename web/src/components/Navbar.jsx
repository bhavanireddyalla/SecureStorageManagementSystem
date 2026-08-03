import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="bg-white/95 border-b border-slate-200 text-slate-900 shadow-sm backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
                <div>
                    <NavLink to="/dashboard" className="text-xl font-semibold tracking-tight">
                        Secure Storage
                    </NavLink>
                    <p className="text-sm text-slate-500">Secure document and folder management</p>
                </div>
                <nav className="flex flex-wrap gap-2 items-center">
                    <NavLink to="/dashboard" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/folders" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                        Folders
                    </NavLink>
                    <NavLink to="/files" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                        Files
                    </NavLink>
                    {user?.role === "admin" && (
                        <NavLink to="/users" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                            Users
                        </NavLink>
                    )}
                    <NavLink to="/profile" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                        Profile
                    </NavLink>
                </nav>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{user?.name || "Guest"}</span>
                    <button onClick={handleLogout} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
