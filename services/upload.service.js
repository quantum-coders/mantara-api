import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import slugify from 'slugify';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'; // Asegúrate de que esta importación esté presente si usas createAttachmentFromUrl

const prisma = new PrismaClient();
const MAX_SLUG_LEN = 191;
const MAX_NAME_LEN = 191;

const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new AWS.S3({
	endpoint: spacesEndpoint,
	accessKeyId: process.env.SPACES_KEY,
	secretAccessKey: process.env.SPACES_SECRET,
});

const EXT_MAP = {
	'image/png': '.png',
	'image/jpeg': '.jpg',
	'image/gif': '.gif',
	'audio/mpeg': '.mp3',
	'audio/mp3': '.mp3',
};

function truncateName(originalName) {
	if(originalName.length <= MAX_NAME_LEN) {
		return originalName;
	}
	return originalName.slice(0, MAX_NAME_LEN - 3) + '...';
}

class UploadService {
	static async createAttachment(file, params = {}) {
		try {
			const paramMetas = params.metas || {};
			const mimeType = file.mimetype;
			const acl = params.acl || 'public-read';

			let extension = path.extname(file.originalname).toLowerCase();
			if(!extension && EXT_MAP[mimeType]) {
				extension = EXT_MAP[mimeType];
			} else if(!extension) {
				extension = '';
			}

			const baseName = path.basename(file.originalname, path.extname(file.originalname));
			const uuid = uuidv4();
			const slugBase = slugify(`${ uuid }-${ baseName }`, { lower: true, strict: true });

			let finalFilename = `${ slugBase }${ extension }`;

			if(finalFilename.length > MAX_SLUG_LEN) {
				const extLen = extension.length;
				const maxBaseLen = MAX_SLUG_LEN - extLen;
				const truncatedSlugBase = slugBase.slice(0, Math.max(0, maxBaseLen));
				finalFilename = `${ truncatedSlugBase }${ extension }`;
			}

			const safeName = truncateName(file.originalname);

			const date = new Date();
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');

			const fileBuffer = file.buffer;
			const keyPath = `upload/${ year }/${ month }/${ finalFilename }`;

			const s3Params = {
				Bucket: process.env.SPACES_BUCKET_NAME,
				Key: keyPath,
				Body: fileBuffer,
				ACL: acl,
				ContentType: mimeType,
			};

			const data = await s3.upload(s3Params).promise();

			const attachment = await prisma.attachment.create({
				data: {
					name: safeName,
					slug: finalFilename,
					url: data.Location,
					attachment: keyPath,
					mime: mimeType,
					size: file.size,
					source: 'digitalocean',
					acl,
					metas: {
						location: data.Location,
						s3: data,
						...paramMetas,
					},
				},
			});

			return attachment;
		} catch(error) {
			console.error('❌ [UploadService] createAttachment error:', error);
			throw error;
		}
	}

	// Mantén las otras funciones como downloadAttachment y createAttachmentFromUrl aquí
	// (createAttachmentFromUrl llama a la función createAttachment modificada)

	static async downloadAttachment(id) {
		try {
			const attachment = await prisma.attachment.findUnique({
				where: { id: parseInt(id) },
			});
			if(!attachment) throw new Error('Attachment not found');

			const s3Params = {
				Bucket: process.env.SPACES_BUCKET_NAME,
				Key: attachment.attachment,
			};

			const data = await s3.getObject(s3Params).promise();

			return { attachment, data };
		} catch(error) {
			console.error('❌ [UploadService] downloadAttachment error:', error);
			throw error;
		}
	}

	static async createAttachmentFromUrl(rawUrl, params = {}) {
		try {
			const parsedUrl = new URL(rawUrl);
			const originalName = path.basename(parsedUrl.pathname);

			const response = await axios.get(rawUrl, { responseType: 'arraybuffer' });
			const contentLength = parseInt(response.headers['content-length'] || '0', 10);
			const contentType = response.headers['content-type'] || '';

			if(response.status !== 200) {
				throw new Error(`Failed to download from URL: Status ${ response.status }`);
			}

			const file = {
				originalname: originalName,
				mimetype: contentType,
				buffer: Buffer.from(response.data),
				size: contentLength,
			};

			const attachment = await this.createAttachment(file, params);

			return attachment;
		} catch(error) {
			if(axios.isAxiosError(error)) {
				console.error('❌ [UploadService] Axios error downloading URL:', error.message, error.response?.status);
			} else {
				console.error('❌ [UploadService] createAttachmentFromUrl error:', error.message);
			}
			throw error;
		}
	}

	static async createAttachmentFromBuffer(buffer, params = {}) {
		try {
			if(!buffer || !(buffer instanceof Buffer)) {
				throw new Error('Buffer válido requerido');
			}

			const paramMetas = params.metas || {};
			const mimeType = params.contentType || 'image/png';
			const acl = params.acl || 'public-read';
			const fileName = params.fileName || `${ uuidv4() }.png`;

			// Extract extension from filename or use default based on contentType
			let extension = path.extname(fileName).toLowerCase();
			if(!extension && EXT_MAP[mimeType]) {
				extension = EXT_MAP[mimeType];
			} else if(!extension) {
				extension = '';
			}

			const baseName = path.basename(fileName, path.extname(fileName));
			const uuid = uuidv4();
			const slugBase = slugify(`${ uuid }-${ baseName }`, { lower: true, strict: true });

			let finalFilename = `${ slugBase }${ extension }`;

			if(finalFilename.length > MAX_SLUG_LEN) {
				const extLen = extension.length;
				const maxBaseLen = MAX_SLUG_LEN - extLen;
				const truncatedSlugBase = slugBase.slice(0, Math.max(0, maxBaseLen));
				finalFilename = `${ truncatedSlugBase }${ extension }`;
			}

			const safeName = truncateName(fileName);

			const date = new Date();
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');

			const keyPath = `upload/${ year }/${ month }/${ finalFilename }`;

			const s3Params = {
				Bucket: process.env.SPACES_BUCKET_NAME,
				Key: keyPath,
				Body: buffer,
				ACL: acl,
				ContentType: mimeType,
			};

			console.log('📤 [UploadService] Subiendo buffer a S3/Spaces:', {
				bucket: process.env.SPACES_BUCKET_NAME,
				keyPath,
				contentType: mimeType,
				size: buffer.length,
			});

			const data = await s3.upload(s3Params).promise();

			console.log('✅ [UploadService] Buffer subido exitosamente:', data.Location);

			const attachment = await prisma.attachment.create({
				data: {
					name: safeName,
					slug: finalFilename,
					url: data.Location,
					attachment: keyPath,
					mime: mimeType,
					size: buffer.length,
					source: 'digitalocean',
					acl,
					metas: {
						location: data.Location,
						s3: data,
						...paramMetas,
					},
				},
			});

			return attachment;
		} catch(error) {
			console.error('❌ [UploadService] createAttachmentFromBuffer error:', error);
			throw error;
		}
	}
}

export default UploadService;
