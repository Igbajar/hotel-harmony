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
import {
  mockHousekeepingStaff,
  mockHousekeepingTasks,
  mockRooms,
} from '@/data/mockData';
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
} from 'lucide-react';
import type { HousekeepingTask, HousekeepingTaskStatus, HousekeepingTaskPriority, HousekeepingTaskType } from '@/types/hotel';

const statusConfig: Record<HousekeepingTaskStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]', icon: Play },
  completed: { label: 'Completed', color: 'bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]', icon: Check },
  verified: { label: 'Verified', color: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]', icon: CheckCircle2 },
};

const priorityConfig: Record<HousekeepingTaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  normal: { label: 'Normal', color: 'bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]' },
  high: { label: 'High', color: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]' },
  urgent: { label: 'Urgent', color: 'bg-destructive/10 text-destructive' },
};

const taskTypeConfig: Record<HousekeepingTaskType, { label: string; icon: React.ElementType }> = {
  'daily-cleaning': { label: 'Daily Cleaning', icon: Sparkles },
  'checkout-cleaning': { label: 'Checkout Cleaning', icon: Bed },
  'deep-cleaning': { label: 'Deep Cleaning', icon: ClipboardCheck },
  turndown: { label: 'Turndown Service', icon: Moon },
  'maintenance-request': { label: 'Maintenance', icon: Wrench },
  laundry: { label: 'Laundry', icon: Shirt },
};

export default function Housekeeping() {
  const [tasks, setTasks] = useState(mockHousekeepingTasks);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    roomId: '',
    type: '' as HousekeepingTaskType,
    priority: 'normal' as HousekeepingTaskPriority,
    assignedTo: '',
    notes: '',
  });

  const getRoom = (roomId: string) => mockRooms.find((r) => r.id === roomId);
  const getStaff = (staffId: string) => mockHousekeepingStaff.find((s) => s.id === staffId);

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

    const task: HousekeepingTask = {
      id: `ht${Date.now()}`,
      roomId: newTask.roomId,
      assignedTo: newTask.assignedTo || undefined,
      type: newTask.type,
      status: 'pending',
      priority: newTask.priority,
      notes: newTask.notes || undefined,
      estimatedDuration: 30,
      scheduledFor: new Date(),
      createdAt: new Date(),
    };

    setTasks([task, ...tasks]);
    setIsNewTaskOpen(false);
    setNewTask({ roomId: '', type: '' as HousekeepingTaskType, priority: 'normal', assignedTo: '', notes: '' });
    toast.success('Task created successfully');
  };

  const handleAssignStaff = (taskId: string, staffId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: staffId } : t)));
    toast.success('Staff assigned successfully');
  };

  const handleUpdateStatus = (taskId: string, status: HousekeepingTaskStatus) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              startedAt: status === 'in-progress' ? new Date() : t.startedAt,
              completedAt: status === 'completed' || status === 'verified' ? new Date() : t.completedAt,
            }
          : t
      )
    );
    toast.success(`Task ${status === 'completed' ? 'completed' : status === 'verified' ? 'verified' : 'updated'}`);
  };

  const availableStaff = mockHousekeepingStaff.filter((s) => s.status !== 'off-duty');

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
                <p className="text-sm text-muted-foreground">Completed Today</p>
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
                          {mockRooms.map((room) => (
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
                        onValueChange={(v) => setNewTask({ ...newTask, type: v as HousekeepingTaskType })}
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
                        onValueChange={(v) => setNewTask({ ...newTask, priority: v as HousekeepingTaskPriority })}
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
                              {staff.firstName} {staff.lastName} ({staff.shift})
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
                    <Button onClick={handleCreateTask}>Create Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const room = getRoom(task.roomId);
                const staff = task.assignedTo ? getStaff(task.assignedTo) : null;
                const StatusIcon = statusConfig[task.status].icon;
                const TaskIcon = taskTypeConfig[task.type].icon;

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
                            <h4 className="font-semibold">Room {room?.number}</h4>
                            <Badge variant="outline" className="text-xs">
                              {room?.type}
                            </Badge>
                            <Badge className={cn('text-xs', priorityConfig[task.priority].color)}>
                              {priorityConfig[task.priority].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {taskTypeConfig[task.type].label}
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
                                {staff.firstName[0]}
                                {staff.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {staff.firstName} {staff.lastName}
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
                              <SelectValue placeholder="Assign staff" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStaff.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.firstName} {s.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Time Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[100px]">
                        <Timer className="h-4 w-4" />
                        <span>{task.estimatedDuration} min</span>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-3">
                        <Badge className={cn('gap-1', statusConfig[task.status].color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[task.status].label}
                        </Badge>

                        {task.status === 'pending' && task.assignedTo && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, 'verified')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {filteredTasks.length === 0 && (
                <Card className="p-12 text-center">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {filterStatus !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create a new task to get started'}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            {/* Staff Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockHousekeepingStaff.map((staff) => {
                const assignedTasks = tasks.filter((t) => t.assignedTo === staff.id);
                const completedTasks = assignedTasks.filter(
                  (t) => t.status === 'completed' || t.status === 'verified'
                ).length;
                const efficiency = assignedTasks.length > 0 ? (completedTasks / assignedTasks.length) * 100 : 0;

                return (
                  <Card key={staff.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {staff.firstName[0]}
                          {staff.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {staff.firstName} {staff.lastName}
                          </h4>
                          <Badge
                            className={cn(
                              'text-xs',
                              staff.status === 'available'
                                ? 'bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]'
                                : staff.status === 'busy'
                                ? 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {staff.status === 'off-duty' ? 'Off Duty' : staff.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {staff.shift} Shift
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < Math.floor(staff.rating)
                                  ? 'fill-[hsl(var(--chart-2))] text-[hsl(var(--chart-2))]'
                                  : 'text-muted'
                              )}
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">{staff.rating}</span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-lg font-bold">{staff.tasksCompleted}</p>
                            <p className="text-xs text-muted-foreground">Total Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{staff.averageTime}m</p>
                            <p className="text-xs text-muted-foreground">Avg. Time</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{assignedTasks.length}</p>
                            <p className="text-xs text-muted-foreground">Today</p>
                          </div>
                        </div>

                        {/* Efficiency Progress */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Today's Efficiency</span>
                            <span className="font-medium">{efficiency.toFixed(0)}%</span>
                          </div>
                          <Progress value={efficiency} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Performance Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--chart-1))]/10">
                    <User className="h-6 w-6 text-[hsl(var(--chart-1))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockHousekeepingStaff.length}</p>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--chart-3))]/10">
                    <TrendingUp className="h-6 w-6 text-[hsl(var(--chart-3))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(mockHousekeepingStaff.reduce((sum, s) => sum + s.rating, 0) / mockHousekeepingStaff.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--chart-2))]/10">
                    <Timer className="h-6 w-6 text-[hsl(var(--chart-2))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(mockHousekeepingStaff.reduce((sum, s) => sum + s.averageTime, 0) / mockHousekeepingStaff.length)}m
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Task Time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--chart-4))]/10">
                    <Award className="h-6 w-6 text-[hsl(var(--chart-4))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {mockHousekeepingStaff.reduce((sum, s) => sum + s.tasksCompleted, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Completed</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
