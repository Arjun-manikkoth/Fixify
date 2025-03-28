"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary
exports.default = cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImages = (images) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedUrls = yield Promise.all(images.map((image, index) => __awaiter(void 0, void 0, void 0, function* () {
            const customName = `fixify_${Date.now()}_${index}`;
            const uploadedImage = yield cloudinary_1.v2.uploader.upload(`data:image/png;base64,${image.buffer.toString("base64")}`, {
                public_id: customName,
                overwrite: true,
                resource_type: "image",
            });
            return uploadedImage.secure_url;
        })));
        return uploadedUrls;
    }
    catch (error) {
        console.error("Error uploading images:", error.message);
        return [];
    }
});
exports.uploadImages = uploadImages;
