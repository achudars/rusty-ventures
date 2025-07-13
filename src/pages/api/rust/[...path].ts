import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: pathParam } = req.query;
    
    if (!pathParam || !Array.isArray(pathParam)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    const pathSegments = pathParam;
    
    if (pathSegments.length === 0) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    
    // Validate all path segments
    for (const segment of pathSegments) {
      if (!segment || segment.includes('..')) {
        return res.status(400).json({ error: 'Invalid path segment' });
      }
    }
    
    // The last segment should be a Rust file
    const filename = pathSegments[pathSegments.length - 1];
    if (!filename.endsWith('.rs')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    let filePath: string;
    
    // Check if this is a test file path (starts with 'tests')
    if (pathSegments[0] === 'tests') {
      // Construct path to tests directory
      filePath = path.join(process.cwd(), 'public', 'rust', ...pathSegments);
    } else {
      // Regular source file in src directory
      filePath = path.join(process.cwd(), 'public', 'rust', 'src', ...pathSegments);
    }
    
    // Read the file
    const content = await readFile(filePath, 'utf-8');
    
    // Return the file content as plain text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(content);
  } catch (error) {
    console.error('Error reading Rust file:', error);
    return res.status(404).json({ error: 'File not found' });
  }
}
