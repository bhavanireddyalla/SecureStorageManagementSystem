import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/userApi";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("viewer");
    const [creating, setCreating] = useState(false);
    const [processingUserId, setProcessingUserId] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
            toast.error("Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            await loadUsers();
        };

        fetchUsers();
    }, []);

    const handleEditUser = async (user) => {
        const updatedName = window.prompt("New name:", user.Name);
        if (!updatedName || !updatedName.trim() || updatedName.trim() === user.Name) {
            return;
        }

        const updatedEmail = window.prompt("New email:", user.Email);
        if (!updatedEmail || !updatedEmail.trim() || updatedEmail.trim() === user.Email) {
            return;
        }

        const updatedRole = window.prompt("Role (admin/viewer):", user.Role);
        if (!updatedRole || !["admin", "viewer"].includes(updatedRole.toLowerCase().trim())) {
            toast.error("Role must be admin or viewer.");
            return;
        }

        try {
            setProcessingUserId(user.UserId);
            await updateUser(user.UserId, {
                name: updatedName.trim(),
                email: updatedEmail.trim(),
                role: updatedRole.toLowerCase().trim(),
            });
            toast.success("User updated successfully.");
            await loadUsers();
        } catch (error) {
            console.error("Update user failed", error);
            toast.error(error.response?.data?.message || "Update failed.");
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) {
            return;
        }

        try {
            setProcessingUserId(id);
            await deleteUser(id);
            toast.success("User deleted successfully.");
            await loadUsers();
        } catch (error) {
            console.error("Delete user failed", error);
            toast.error(error.response?.data?.message || "Delete failed.");
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Name, email, and password are required.");
            return;
        }

        try {
            setCreating(true);
            await createUser({ name, email, password, role });
            toast.success("User created successfully.");
            setName("");
            setEmail("");
            setPassword("");
            setRole("viewer");
            await loadUsers();
        } catch (error) {
            console.error("Failed to create user", error);
            toast.error(error.response?.data?.message || "Create user failed.");
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
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-sm text-slate-500">Create and review users for the secure storage system.</p>
                </div>
            </div>

            <section className="section-panel">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-semibold">Create New User</h2>
                    <p className="text-sm text-slate-500">Add a new user with access control.</p>
                </div>
                <form onSubmit={handleCreateUser} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="input-field"
                            placeholder="Full name"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="input-field"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="input-field"
                            placeholder="Password"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            className="input-field"
                        >
                            <option value="viewer">Viewer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                        <button type="submit" disabled={creating} className="primary-btn w-full">
                            {creating ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </section>

            {users.length ? (
                <section className="section-panel">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {users.map((user) => (
                                    <tr key={user.UserId}>
                                        <td className="px-4 py-3 text-sm text-slate-900">{user.Name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{user.Email}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{user.Role}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    disabled={processingUserId === user.UserId}
                                                    className="rounded bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:bg-slate-400"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.UserId)}
                                                    disabled={processingUserId === user.UserId}
                                                    className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-400"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <p className="text-slate-500">No users found.</p>
            )}
        </div>
    );
}

export default Users;