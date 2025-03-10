import { connectToDatabase } from './mongodb';
import ServerModel, { IServer } from '../models/Server';

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

// Initialize the database with servers from the JSON file if needed
export async function initializeServersCollection() {
  // Only run on the server side
  if (!isServer) {
    console.log('Skipping database initialization on client side');
    return;
  }

  try {
    await connectToDatabase();
    
  } catch (error) {
    console.error('Error initializing servers collection:', error);
    throw error;
  }
}

// Get all servers from the database
export async function getAllServers() {
  if (isServer) {
    // Server-side: Use direct MongoDB access
    try {
      await connectToDatabase();
      const servers = await ServerModel.find({}).lean();
      return JSON.parse(JSON.stringify(servers));
    } catch (error) {
      console.error('Error fetching servers from MongoDB:', error);
      throw error;
    }
  } else {
    // Client-side: Use API route
    try {
      const response = await fetch('/api/servers');
      if (!response.ok) {
        throw new Error(`Failed to fetch servers: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching servers from API:', error);
      throw error;
    }
  }
}

// Get a server by key
export async function getServerByKey(key: string) {
  if (isServer) {
    // Server-side: Use direct MongoDB access
    try {
      await connectToDatabase();
      const server = await ServerModel.findOne({ key }).lean();
      return server ? JSON.parse(JSON.stringify(server)) : null;
    } catch (error) {
      console.error(`Error fetching server with key ${key} from MongoDB:`, error);
      throw error;
    }
  } else {
    // Client-side: Use API route
    try {
      const response = await fetch(`/api/servers?key=${encodeURIComponent(key)}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch server: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching server with key ${key} from API:`, error);
      throw error;
    }
  }
}

// Add new servers to the database
export async function addServers(servers: Partial<IServer>[]) {
  // Only run on the server side
  if (!isServer) {
    throw new Error('addServers can only be called on the server side');
  }

  try {
    await connectToDatabase();
    
    // Filter out servers with duplicate keys
    const existingKeys = new Set(
      (await ServerModel.find({}, 'key').lean()).map((s: any) => s.key)
    );
    
    const newServers = servers.filter(server => !existingKeys.has(server.key));
    const duplicateCount = servers.length - newServers.length;
    
    if (newServers.length > 0) {
      await ServerModel.insertMany(newServers);
    }
    
    return {
      success: true,
      importedCount: newServers.length,
      duplicateCount
    };
  } catch (error) {
    console.error('Error adding servers:', error);
    throw error;
  }
}

// Delete a server by key
export async function deleteServerByKey(key: string) {
  if (isServer) {
    // Server-side: Use direct MongoDB access
    try {
      await connectToDatabase();
      
      // Find and delete the server
      const result = await ServerModel.deleteOne({ key });
      
      return {
        success: true,
        deleted: result.deletedCount > 0
      };
    } catch (error) {
      console.error(`Error deleting server with key ${key} from MongoDB:`, error);
      throw error;
    }
  } else {
    // Client-side: Use API route
    try {
      const response = await fetch(`/api/servers/delete?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete server: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error deleting server with key ${key} from API:`, error);
      throw error;
    }
  }
}