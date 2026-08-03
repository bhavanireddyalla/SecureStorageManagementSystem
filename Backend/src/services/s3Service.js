const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../config/s3");

const uploadFile = async (file, key) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3.send(command);

    return key;
};


const getFile = async (key) => {

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    return await s3.send(command);
};
const generatePresignedUrl = async (key) => {

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    const url = await getSignedUrl(
        s3,
        command,
        {
            expiresIn: 300 // 5 minutes
        }
    );

    return url;
};

const downloadFile = async (key) => {

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    const response = await s3.send(command);

    return response.Body;
};

const deleteFile = async (key) => {

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    await s3.send(command);
};

module.exports = {
    uploadFile,
    downloadFile,
    getFile,
    generatePresignedUrl,
    deleteFile
};