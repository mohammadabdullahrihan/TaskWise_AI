export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // Storing as ISO string for easier state management and serialization
  status: TaskStatus;
  subtasks: string[];
}
