import { NextRequest, NextResponse } from 'next/server';
import { deleteServerByKey } from '@/lib/serverUtils';

// Configure dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    // Get the key from the request URL
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'Server key is required' },
        { status: 400 }
      );
    }
    
    // Delete the server
    const result = await deleteServerByKey(key);
    
    if (!result.deleted) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted server with key: ${key}`
    });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}