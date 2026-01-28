import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useHousekeepingTasks, useHousekeepingStaff, useCreateHousekeepingTask, useUpdateHousekeepingTask, HousekeepingTask } from '@/hooks/useHousekeeping';
import { useRooms } from '@/hooks/useRooms';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Star,
  Timer,
  ClipboardCheck,
  Sparkles,
  Bed,
  Wrench,
  Moon,
  Shirt,
  Play,
  Check,
  UserPlus,
  TrendingUp,
  Award,
  Loader2,
} from 'lucide-react';

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'verified';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
type TaskType = 'daily-cleaning' | 'checkout-cleaning' | 'deep-cleaning' | 'turndown' | 'maintenance-request' | 'laundry';

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]', icon: Play },
  completed: { label: 'Completed', color: 'bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]', icon: Check },
  verified: { label: 'Verified', color: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]', icon: CheckCircle2 },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  normal: { label: 'Normal', color: 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]' },
  high: { label: 'High', color: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]' },
  urgent: { label: 'Urgent', color: 'bg-destructive/10 text-destructive' },
};

const taskTypeConfig: Record<TaskType, { label: string; icon: React.ElementType }> = {
  'daily-cleaning': { label: 'Daily Cleaning', icon: Sparkles },
  'checkout-cleaning': { label: 'Checkout Cleaning', icon: Bed },
  'deep-cleaning': { label: 'Deep Cleaning', icon: ClipboardCheck },
  turndown: { label: 'Turndown Service', icon: Moon },
  'maintenance-request': { label: 'Maintenance', icon: Wrench },
  laundry: { label: 'Laundry', icon: Shirt },
};

export default function Housekeeping() {
  const { data: tasks = [], isLoading: tasksLoading } = useHousekeepingTasks();
  const { data: housekeepingStaff = [], isLoading: staffLoading } = useHousekeepingStaff();
  const { data: rooms = [] } = useRooms();
  const createTask = useCreateHousekeepingTask();
  const updateTask = useUpdateHousekeepingTask();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    roomId: '',
    type: '' as TaskType,
    priority: 'normal' as TaskPriority,
    assignedTo: '',
    notes: '',
  });

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedToday = tasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
  const urgentCount = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed' && t.status !== 'verified').length;

  const handleCreateTask = () => {
    if (!newTask.roomId || !newTask.type) {
      toast.error('Please select a room and task type');
      return;
    }

    createTask.mutate({
      room_id: newTask.roomId,
      assigned_to: newTask.assignedTo || null,
      type: newTask.type,
      status: 'pending',
      priority: newTask.priority,
      notes: newTask.notes || null,
      estimated_duration: 30,
      actual_duration: null,
      scheduled_for: new Date().toISOString(),
      started_at: null,
      completed_at: null,
    }, {
      onSuccess: () => {
        setIsNewTaskOpen(false);
        setNewTask({ roomId: '', type: '' as TaskType, priority: 'normal', assignedTo: '', notes: '' });
      }
    });
  };

  const handleAssignStaff = (taskId: string, staffId: string) => {
    updateTask.mutate({ id: taskId, updates: { assigned_to: staffId } });
    toast.success('Staff assigned successfully');
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    const updates: Partial<HousekeepingTask> = { status };
    
    if (status === 'in-progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'verified') {
      updates.completed_at = new Date().toISOString();
    }
    
    updateTask.mutate({ id: taskId, updates });
  };

  const availableStaff = housekeepingStaff.filter((s) => s.status !== 'off-duty');

  const isLoading = tasksLoading || staffLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Housekeeping"
        subtitle="Manage cleaning tasks and staff assignments"
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--chart-1))]/10">
                <Play className="h-5 w-5 text-[hsl(var(--chart-1))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10">
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--chart-3))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedToday}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentCount}</p>
                <p className="text-sm text-muted-foreground">Urgent Tasks</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Assign a housekeeping task to a room
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Room</Label>
                      <Select
                        value={newTask.roomId}
                        onValueChange={(v) => setNewTask({ ...newTask, roomId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.number} - {room.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Task Type</Label>
                      <Select
                        value={newTask.type}
                        onValueChange={(v) => setNewTask({ ...newTask, type: v as TaskType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(taskTypeConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To (Optional)</Label>
                      <Select
                        value={newTask.assignedTo}
                        onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStaff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.first_name} {staff.last_name} ({staff.shift})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={newTask.notes}
                        onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                        placeholder="Special instructions..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                      {createTask.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Create Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Task List */}
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">No tasks found</h3>
                <p className="text-sm text-muted-foreground">Create a new task to get started</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const room = task.rooms;
                  const staff = task.housekeeping_staff;
                  const StatusIcon = statusConfig[task.status as TaskStatus]?.icon || Clock;
                  const TaskIcon = taskTypeConfig[task.type as TaskType]?.icon || ClipboardCheck;

                  return (
                    <Card key={task.id} className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Task Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                            <TaskIcon className="h-6 w-6 text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">Room {room?.number || 'N/A'}</h4>
                              <Badge variant="outline" className="text-xs">
                                {room?.type || 'Unknown'}
                              </Badge>
                              <Badge className={cn('text-xs', priorityConfig[task.priority as TaskPriority]?.color)}>
                                {priorityConfig[task.priority as TaskPriority]?.label || task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {taskTypeConfig[task.type as TaskType]?.label || task.type}
                            </p>
                            {task.notes && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Staff Assignment */}
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {staff ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-secondary text-xs">
                                  {staff.first_name[0]}
                                  {staff.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {staff.first_name} {staff.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {staff.shift} shift
                                </p>
                              </div>
                            </div>
                          ) : (
                            <Select
                              onValueChange={(v) => handleAssignStaff(task.id, v)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <UserPlus className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Assign Staff" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStaff.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.first_name} {s.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center gap-3">
                          <Badge className={cn('gap-1', statusConfig[task.status as TaskStatus]?.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[task.status as TaskStatus]?.label || task.status}
                          </Badge>

                          <div className="flex gap-1">
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(task.id, 'completed')}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            {task.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUpdateStatus(task.id, 'verified')}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            {housekeepingStaff.length === 0 ? (
              <Card className="p-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">No housekeeping staff</h3>
                <p className="text-sm text-muted-foreground">Add housekeeping staff to see performance metrics</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {housekeepingStaff.map((staff) => (
                  <Card key={staff.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {staff.first_name[0]}
                          {staff.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {staff.first_name} {staff.last_name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              staff.status === 'available' && 'bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]',
                              staff.status === 'busy' && 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]',
                              staff.status === 'off-duty' && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {staff.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {staff.shift} shift
                        </p>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <ClipboardCheck className="h-4 w-4" />
                              Tasks
                            </span>
                            <span className="font-medium">{staff.tasks_completed}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Timer className="h-4 w-4" />
                              Avg Time
                            </span>
                            <span className="font-medium">{staff.average_time} min</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                Rating
                              </span>
                              <span className="font-medium">{staff.rating.toFixed(1)}</span>
                            </div>
                            <Progress
                              value={(staff.rating / 5) * 100}
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
