import { NextRequest, NextResponse } from 'next/server';
import { getAllServers, getServerByKey, initializeServersCollection } from '@/lib/serverUtils';

// Configure dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Initialize the servers collection if it's empty
    await initializeServersCollection();
    
    // Check if a key is provided in the query parameters
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key) {
      // Fetch a specific server by key
      const server = await getServerByKey(key);
      
      if (!server) {
        return NextResponse.json(
          { error: 'Server not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(server);
    }
    
    // Fetch all servers
    const servers = await getAllServers();
    return NextResponse.json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}