// Transactions endpoints moved to /api/entries  
// This is kept for backward compatibility only

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;
  res.setHeader('Content-Type', 'application/json');

  try {
    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
      return res.status(200).json({
        success: true,
        message: `Transaction ${method.toLowerCase()} - use /api/entries instead`,
        data: {},
        timestamp: new Date().toISOString(),
      });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      success: false,
      message: `Method ${method} Not Allowed`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
