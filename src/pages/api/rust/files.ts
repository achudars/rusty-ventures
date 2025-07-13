import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rustDir = path.join(process.cwd(), 'public', 'rust', 'src');
    
    // Check if directory exists, if not create a fallback
    let files: string[] = [];
    try {
      files = await fs.readdir(rustDir);
    } catch {
      // If the directory doesn't exist, return some default files
      console.warn('Rust src directory not found, returning default files');
      return res.json({ files: ['hello.rs', 'calculator.rs'] });
    }
    
    // Filter for .rs files and exclude mod.rs
    const rustFiles = files
      .filter(file => file.endsWith('.rs') && file !== 'mod.rs')
      .sort((a, b) => {
        // Ensure hello.rs is always first
        if (a === 'hello.rs') return -1;
        if (b === 'hello.rs') return 1;
        return a.localeCompare(b);
      });

    return res.json({ files: rustFiles });
  } catch (error) {
    console.error('Error reading Rust files:', error);
    return res.status(500).json({ error: 'Failed to read Rust files' });
  }
}
