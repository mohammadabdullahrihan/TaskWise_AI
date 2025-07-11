'use client';

import { useState, useMemo } from 'react';
import type { Task } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { TaskCard } from '@/components/task-card';
import { TaskForm } from '@/components/task-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare for job interview',
    description: 'Technical interview for a React developer position at a top tech company. Focus on data structures, algorithms, and React ecosystem knowledge.',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    subtasks: [
      'Research company culture and products',
      'Practice common coding questions (LeetCode)',
      'Prepare thoughtful questions to ask the interviewer',
      'Review and update my resume and portfolio',
      'Choose an appropriate and professional outfit',
    ],
  },
  {
    id: '2',
    title: 'Plan birthday party',
    description: 'Organize a surprise birthday party for a friend. The party will have around 20 guests and should have a fun, relaxed atmosphere.',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    subtasks: [],
  },
    {
    id: '3',
    title: 'Weekly grocery shopping',
    description: 'Get all the essentials for the upcoming week, including fresh produce, dairy, and pantry staples. Remember to check for discounts.',
    status: 'completed',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    subtasks: ['Milk', 'Bread', 'Eggs', 'Vegetables (broccoli, carrots)', 'Fruits (apples, bananas)'],
  },
];


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const handleOpenDialog = (task?: Task) => {
    setEditingTask(task || null);
    setIsDialogOpen(true);
  };
  
  const handleSaveTask = (data: Omit<Task, 'id' | 'status' | 'subtasks'> & { id?: string }) => {
    if (editingTask) {
      // Edit existing task
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...data } : t));
      toast({ title: "Task Updated", description: "Your task has been successfully updated." });
    } else {
      // Add new task
      const newTask: Task = {
        ...data,
        id: uuidv4(),
        status: 'pending',
        subtasks: [],
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task Added", description: "A new task has been created." });
    }
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast({ title: "Task Deleted", description: "The task has been removed.", variant: "destructive" });
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };
  
  const handleSetSubtasks = (taskId: string, subtasks: string[]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks } : t));
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  return (
    <>
      <div className="min-h-screen text-foreground">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl font-bold text-primary">TaskWise AI</h1>
                <p className="text-muted-foreground">Your smart task management assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {layout === 'grid' ? <LayoutGrid className="mr-2 h-4 w-4" /> : <List className="mr-2 h-4 w-4" />}
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLayout('grid')}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Grid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayout('list')}>
                    <List className="mr-2 h-4 w-4" />
                    List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => handleOpenDialog()} size="lg">
                <PlusCircle className="mr-2" />
                <span>Add New Task</span>
              </Button>
            </div>
          </header>

          <main>
            <AnimatePresence>
              {sortedTasks.length > 0 ? (
                <motion.div
                  key={layout}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
                >
                  {sortedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      layout={layout}
                      onEdit={() => handleOpenDialog(task)}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onSetSubtasks={handleSetSubtasks}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                    <h2 className="text-2xl font-semibold mb-2">No tasks yet!</h2>
                    <p className="text-muted-foreground mb-4">Click "Add New Task" to get started.</p>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            task={editingTask ?? undefined} 
            onSave={handleSaveTask}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
