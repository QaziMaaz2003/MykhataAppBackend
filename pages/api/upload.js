import formidable from 'formidable';
import fs from 'fs';
import { withAuth } from '../../lib/middleware/auth';
import { uploadToCloudinary } from '../../lib/utils/cloudinary';
import { sendResponse, sendError } from '../../lib/utils/response';
import { withCORS } from '../../lib/middleware/cors';

// Disable body parsing for this endpoint
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method === 'POST') {
    return handleUpload(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleUpload(req, res) {
  try {
    // Parse form data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];

    if (!file) {
      return sendError(res, 400, 'No file provided');
    }

    // Read file data
    const fileData = fs.readFileSync(file.filepath);
    const base64Data = fileData.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Data}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(dataURI, `khataapp/${req.userId}`);

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

export default withCORS(withAuth(handler));
