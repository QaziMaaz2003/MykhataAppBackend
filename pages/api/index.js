export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: 'MyKhataApp Backend API',
    version: '1.0.0',
    status: 'running',
    built_with: 'Next.js',
    endpoints: {
      health: '/api/health',
      transactions: '/api/transactions',
      documentation: 'See README.md',
    },
  });
}
