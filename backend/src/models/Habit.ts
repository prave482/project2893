import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitEntry {
  date: Date;
  completed: boolean;
}

export interface IHabit extends Document {
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  history: IHabitEntry[];
  color: string;
  icon: string;
  createdAt: Date;
}

const HabitEntrySchema = new Schema<IHabitEntry>({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

const HabitSchema = new Schema<IHabit>(
  {
    title: { type: String, required: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    streak: { type: Number, default: 0 },
    history: { type: [HabitEntrySchema], default: [] },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '✅' },
  },
  { timestamps: true }
);

export default mongoose.model<IHabit>('Habit', HabitSchema);
