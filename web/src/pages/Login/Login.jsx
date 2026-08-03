import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../api/authApi";

function Login() {
    const { register, handleSubmit } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const submit = async (data) => {
        try {
            setLoading(true);
            const response = await loginUser(data);
            login(response);
            toast.success("Login successful");
            if (response.user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/files");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 py-10">
            <div className="surface-card w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Secure Storage Login</h1>
                    <p className="mt-2 text-sm text-slate-500">Access secure file and folder management.</p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            className="input-field"
                            placeholder="Email"
                            type="email"
                            {...register("email", { required: true })}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            className="input-field"
                            placeholder="Password"
                            type="password"
                            {...register("password", { required: true })}
                        />
                    </div>

                    <button className="primary-btn w-full" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
