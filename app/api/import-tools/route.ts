import { NextRequest, NextResponse } from 'next/server';
import { addServers } from '@/lib/serverUtils';

// Configure dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const importedTools = await request.json();
    console.log('Received import request with tools:', JSON.stringify(importedTools, null, 2));
    
    // Validate the imported tools
    if (!Array.isArray(importedTools)) {
      console.log('Error: Imported data is not an array');
      return NextResponse.json(
        { error: 'Invalid format: Imported data must be an array of tools' },
        { status: 400 }
      );
    }
    
    // Analyze each tool for potential key generation
    const analyzedTools = importedTools.map(tool => {
      console.log('Analyzing tool:', tool.name || 'unnamed tool');
      
      // Check if tool has a homepage that could be used for key generation
      if (tool.homepage && !tool.key) {
        console.log('Tool has homepage but no key:', tool.homepage);
        try {
          const url = new URL(tool.homepage);
          const pathParts = url.pathname.split('/').filter(Boolean);
          
          // Potential auto-generated key logic
          let potentialKey = '';
          if (url.hostname === 'github.com' && pathParts.length >= 2) {
            potentialKey = pathParts.length > 2
              ? `${pathParts[1]}-${pathParts.slice(2).join('-')}`
              : pathParts[1];
          } else {
            potentialKey = pathParts.length > 0
              ? `${url.hostname}-${pathParts[0]}`
              : url.hostname;
          }
          
          console.log('Could generate key from homepage:', potentialKey);
        } catch (error) {
          console.log('Error parsing URL for key generation:', error);
        }
      }
      
      return tool;
    });
    
    // Process tools - auto-generate keys if needed
    const processedTools = importedTools.map(tool => {
      // If tool already has a key, use it
      if (tool.key) {
        console.log('Tool already has key:', tool.key);
        return tool;
      }
      
      // Otherwise, try to generate a key from homepage
      if (tool.homepage) {
        try {
          const url = new URL(tool.homepage);
          const pathParts = url.pathname.split('/').filter(Boolean);
          
          let generatedKey = '';
          if (url.hostname === 'github.com' && pathParts.length >= 2) {
            generatedKey = pathParts.length > 2
              ? `${pathParts[1]}-${pathParts.slice(2).join('-')}`
              : pathParts[1];
          } else {
            generatedKey = pathParts.length > 0
              ? `${url.hostname}-${pathParts[0]}`
              : url.hostname;
          }
          
          console.log('Generated key from homepage:', generatedKey);
          return { ...tool, key: generatedKey };
        } catch (error) {
          console.log('Error generating key from homepage:', error);
        }
      }
      
      // If we couldn't generate a key, use a fallback
      if (tool.name) {
        const fallbackKey = tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log('Using fallback key from name:', fallbackKey);
        return { ...tool, key: fallbackKey };
      }
      
      // If we still don't have a key, generate a random one
      const randomKey = `tool-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      console.log('Using random key:', randomKey);
      return { ...tool, key: randomKey };
    });
    
    // Validate each tool has required fields - key should now be present for all tools
    const validTools = processedTools.filter(tool => {
      const isValid = !!tool.key;
      if (!isValid) {
        console.log('Skipping invalid tool without key (should not happen):', tool);
      }
      return isValid;
    });
    
    if (validTools.length === 0) {
      return NextResponse.json(
        { error: 'No valid tools found in the imported data. Each tool must have a key.' },
        { status: 400 }
      );
    }
    
    // Add the tools to MongoDB
    const result = await addServers(validTools);
    
    // Create a more descriptive and user-friendly message
    let message = '';
    
    if (result.importedCount > 0) {
      message = `Successfully imported ${result.importedCount} tool${result.importedCount > 1 ? 's' : ''}!`;
      
      if (result.duplicateCount > 0) {
        message += ` ${result.duplicateCount} duplicate${result.duplicateCount > 1 ? 's were' : ' was'} skipped.`;
      }
    } else if (result.duplicateCount > 0) {
      message = `No new tools were imported. ${result.duplicateCount} duplicate${result.duplicateCount > 1 ? 's were' : ' was'} skipped.`;
    }
    
    return NextResponse.json({
      success: true,
      message,
      importedCount: result.importedCount,
      duplicateCount: result.duplicateCount
    });
  } catch (error) {
    console.error('Error importing tools:', error);
    return NextResponse.json(
      { error: 'Failed to import tools' },
      { status: 500 }
    );
  }
}