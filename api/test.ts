export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    return res.status(200).json({ 
      message: 'API test successful',
      method: req.method,
      hasToken: !!apiToken,
      tokenLength: apiToken ? apiToken.length : 0,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
  }
}