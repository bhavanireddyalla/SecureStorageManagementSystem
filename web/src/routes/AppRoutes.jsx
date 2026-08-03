import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Files from "../pages/Files/Files";
import FileDetails from "../pages/Files/FileDetails";
import Folders from "../pages/Folders/Folders";
import Users from "../pages/Users/Users";
import Profile from "../pages/Profile/Profile";

import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

function ProtectedLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-100 pb-10">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {children}
                </div>
            </main>
        </>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <ProtectedLayout>
                            <Dashboard />
                        </ProtectedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/files"
                element={
                    <ProtectedRoute>
                        <ProtectedLayout>
                            <Files />
                        </ProtectedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/files/:id"
                element={
                    <ProtectedRoute>
                        <ProtectedLayout>
                            <FileDetails />
                        </ProtectedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/folders"
                element={
                    <ProtectedRoute>
                        <ProtectedLayout>
                            <Folders />
                        </ProtectedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <ProtectedLayout>
                            <Users />
                        </ProtectedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProtectedLayout>
                            <Profile />
                        </ProtectedLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;