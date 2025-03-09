import mongoose, { Schema, Document, Model } from 'mongoose';

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

// Define the interface for a server document
export interface IServer extends Document {
  name?: string;
  key: string;
  command?: string;
  description?: string;
  args?: string[];
  env?: Record<string, string>;
  homepage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for a server
const ServerSchema: Schema = new Schema(
  {
    name: { type: String },
    key: { type: String, required: true, unique: true },
    command: { type: String },
    description: { type: String },
    args: { type: [String] },
    env: { type: Map, of: String },
    homepage: { type: String },
  },
  {
    timestamps: true,
    // Add toJSON transform to convert _id to id and remove __v
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Only create the model on the server side
let ServerModel: Model<IServer>;

if (isServer) {
  // Create and export the model
  ServerModel = mongoose.models.Server || mongoose.model<IServer>('Server', ServerSchema);
} else {
  // Provide a dummy model for client-side rendering
  ServerModel = {} as Model<IServer>;
}

export default ServerModel;