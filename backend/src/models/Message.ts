import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sessionId: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String, required: true },
  },
  { timestamps: false }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
