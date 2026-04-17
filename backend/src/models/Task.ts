import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  goalId?: mongoose.Types.ObjectId;
  scheduledAt?: Date;
  duration?: number; // in minutes
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    scheduledAt: { type: Date },
    duration: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
