import api from "./axios";

export const getFiles = async (sort, folderId) => {
    const params = {};

    if (sort) params.sort = sort;
    if (folderId) params.folderId = folderId;

    const response = await api.get("/files", { params });
    return response.data;
};

export const getPresignedUrl = async (id) => {
    const response = await api.get(`/files/${id}/presigned-url`);
    return response.data;
};

export const previewFile = async (id) => {
    const response = await api.get(`/files/${id}/preview`, { responseType: "blob" });
    return response.data;
};

export const downloadFile = async (id) => {
    const response = await api.get(`/files/${id}/download`, { responseType: "blob" });
    return response.data;
};

export const getFileById = async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
};

export const uploadFile = async (formData, onUploadProgress) => {
    const response = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
    });
    return response.data;
};

export const deleteFile = async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
};

export const updateFile = async (id, payload) => {
    const response = await api.put(`/files/${id}`, payload);
    return response.data;
};

export const searchFiles = async (name) => {
    const response = await api.get("/files/search", { params: { name } });
    return response.data;
};

export const moveFile = async (id, folderId) => {
    const response = await api.put(`/files/${id}/move`, { folderId });
    return response.data;
};
