import { withAuth } from '../../../lib/middleware/auth';
import { uploadToCloudinary } from '../../../lib/utils/cloudinary';
import { sendResponse, sendError } from '../../../lib/utils/response';

async function handler(req, res) {
  if (req.method === 'POST') {
    return handleUpload(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleUpload(req, res) {
  try {
    const { file } = req.body;

    if (!file) {
      return sendError(res, 400, 'No file provided');
    }

    const result = await uploadToCloudinary(file, `khataapp/${req.userId}`);

    if (!result.success) {
      return sendError(res, 500, 'Failed to upload image', result.error);
    }

    return sendResponse(res, 201, true, 'Image uploaded successfully', {
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return sendError(res, 500, 'Failed to upload image', error.message);
  }
}

export default withAuth(handler);
