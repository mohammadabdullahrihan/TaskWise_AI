'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit,
  MoreVertical,
  Sparkles,
  Trash2,
  ListTodo,
  Loader2,
} from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { suggestSubtasks } from '@/ai/flows/suggest-subtasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId:string, status: TaskStatus) => void;
  onSetSubtasks: (taskId: string, subtasks: string[]) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, onSetSubtasks }: TaskCardProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSuggestSubtasks = async () => {
    setIsSuggesting(true);
    try {
      const result = await suggestSubtasks({
        taskTitle: task.title,
        taskDescription: task.description,
      });
      if (result && result.subtasks) {
        onSetSubtasks(task.id, result.subtasks);
        toast({
          title: 'Subtasks Generated!',
          description: 'AI has suggested some subtasks for you.',
        });
      }
    } catch (error) {
      console.error('Failed to suggest subtasks:', error);
      toast({
        title: 'AI Suggestion Failed',
        description: 'Could not generate subtasks. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <>
      <Card className={`flex flex-col transition-all duration-300 ${task.status === 'completed' ? 'bg-card/60 opacity-70' : 'bg-card'}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
             <CardTitle className="font-headline text-lg leading-tight">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Due by {format(new Date(task.dueDate), 'PPP')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col items-start gap-4 p-4">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                    <Switch
                        id={`status-${task.id}`}
                        checked={task.status === 'completed'}
                        onCheckedChange={(checked) => onStatusChange(task.id, checked ? 'completed' : 'pending')}
                        aria-label="Task status"
                    />
                    <Label htmlFor={`status-${task.id}`} className="flex items-center gap-2 cursor-pointer">
                        {task.status === 'completed' ? (
                            <Badge variant="outline" className="border-accent text-accent-foreground">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                            </Badge>
                        )}
                    </Label>
                </div>

                <Button variant="outline" size="sm" onClick={handleSuggestSubtasks} disabled={isSuggesting}>
                {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Subtasks
                </Button>
            </div>
            
            {task.subtasks.length > 0 && (
                <div className="w-full pt-2">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><ListTodo className="w-4 h-4 text-primary" /> Subtasks</h4>
                    <ul className="space-y-2">
                        {task.subtasks.map((subtask, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                            <span>{subtask}</span>
                        </li>
                        ))}
                    </ul>
                </div>
            )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
