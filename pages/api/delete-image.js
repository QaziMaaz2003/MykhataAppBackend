import { withAuth } from '../../lib/middleware/auth';
import { deleteFromCloudinary } from '../../lib/utils/cloudinary';
import { sendResponse, sendError } from '../../lib/utils/response';
import { withCORS } from '../../lib/middleware/cors';

async function handler(req, res) {
  if (req.method === 'POST') {
    return handleDeleteImage(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleDeleteImage(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return sendError(res, 400, 'Image URL is required');
    }

    // Extract public ID from Cloudinary URL
    // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id]
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `khataapp/${filename.split('.')[0]}`;

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);

    if (!result.success) {
      return sendError(res, 500, 'Failed to delete image', result.error);
    }

    return sendResponse(res, 200, true, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete image error:', error);
    return sendError(res, 500, 'Failed to delete image', error.message);
  }
}

export default withCORS(withAuth(handler));
