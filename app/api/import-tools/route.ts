import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const importedTools = await request.json();
    
    // Validate the imported tools
    if (!Array.isArray(importedTools)) {
      return NextResponse.json(
        { error: 'Invalid format: Imported data must be an array of tools' },
        { status: 400 }
      );
    }
    
    // Validate each tool has required fields - only key is required
    const validTools = importedTools.filter(tool => {
      return tool.key;
    });
    
    if (validTools.length === 0) {
      return NextResponse.json(
        { error: 'No valid tools found in the imported data. Each tool must have a key.' },
        { status: 400 }
      );
    }
    
    // Read the current servers.json file
    const serversFilePath = path.join(process.cwd(), 'public', 'servers.json');
    const fileContent = await fsPromises.readFile(serversFilePath, 'utf8');
    const currentServers = JSON.parse(fileContent);
    
    // Check for duplicate keys
    const currentKeys = new Set(currentServers.map((server: any) => server.key));
    const newTools = validTools.filter(tool => !currentKeys.has(tool.key));
    const duplicateCount = validTools.length - newTools.length;
    
    // Merge the current servers with the new tools
    const updatedServers = [...currentServers, ...newTools];
    
    // Write the updated servers back to the file
    await fsPromises.writeFile(
      serversFilePath,
      JSON.stringify(updatedServers, null, 4),
      'utf8'
    );
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${newTools.length} tools. ${duplicateCount} duplicates were skipped.`,
      importedCount: newTools.length,
      duplicateCount
    });
  } catch (error) {
    console.error('Error importing tools:', error);
    return NextResponse.json(
      { error: 'Failed to import tools' },
      { status: 500 }
    );
  }
}