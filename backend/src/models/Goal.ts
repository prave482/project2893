import mongoose, { Document, Schema } from 'mongoose';

export interface IMilestone {
  title: string;
  completed: boolean;
}

export interface IGoal extends Document {
  title: string;
  description: string;
  category: 'health' | 'work' | 'personal' | 'finance';
  milestones: IMilestone[];
  deadline?: Date;
  progress: number; // 0-100
  createdAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const GoalSchema = new Schema<IGoal>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['health', 'work', 'personal', 'finance'],
      default: 'personal',
    },
    milestones: { type: [MilestoneSchema], default: [] },
    deadline: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.model<IGoal>('Goal', GoalSchema);
