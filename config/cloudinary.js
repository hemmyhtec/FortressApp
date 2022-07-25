require('dotenv').config()

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

uploadToCloudinary = async(path, folder) => {
    try {
        const data = await cloudinary.uploader.upload(path, {
            folder
        });
        return { url: data.url, public_id: data.public_id };
    } catch (error) {
        console.log(error);
    }
}

removeFromCloudinary = async(public_id) => {
    await cloudinary.uploader.upload(public_id, function(error, result) {
        console.log(result, error)
    })
}

module.exports = { uploadToCloudinary, removeFromCloudinary };