import api from "./axios";

export const getFolders = async (sort) => {
    const params = {};
    if (sort) params.sort = sort;

    const response = await api.get("/folders", { params });
    return response.data;
};

export const getFolderTree = async () => {
    const response = await api.get("/folders/tree");
    return response.data;
};

export const searchFolders = async (name) => {
    const response = await api.get("/folders/search", { params: { name } });
    return response.data;
};

export const createFolder = async (folder) => {
    const response = await api.post("/folders", folder);
    return response.data;
};

export const updateFolder = async (id, folder) => {
    const response = await api.put(`/folders/${id}`, folder);
    return response.data;
};

export const moveFolder = async (id, parentFolderId) => {
    const response = await api.put(`/folders/${id}/move`, { parentFolderId });
    return response.data;
};

export const deleteFolder = async (id) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
};