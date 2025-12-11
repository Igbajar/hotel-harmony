import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  Search, 
  Star, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Filter,
  MoreVertical,
  Sun,
  Sunset,
  Moon,
  Pencil,
  Trash2,
  UserX
} from 'lucide-react';
import { mockStaff as initialMockStaff, mockStaffSchedules, mockAttendanceRecords } from '@/data/mockData';
import { Staff, StaffRole, ShiftType, AttendanceStatus } from '@/types/hotel';
import { StaffFormDialog } from '@/components/staff/StaffFormDialog';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const roleColors: Record<StaffRole, string> = {
  'manager': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'front-desk': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'housekeeping': 'bg-green-500/10 text-green-500 border-green-500/20',
  'maintenance': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'restaurant': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'security': 'bg-red-500/10 text-red-500 border-red-500/20',
  'concierge': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'admin': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

const statusColors: Record<string, string> = {
  'active': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'on-leave': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'terminated': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const attendanceColors: Record<AttendanceStatus, string> = {
  'present': 'bg-emerald-500/10 text-emerald-500',
  'absent': 'bg-red-500/10 text-red-500',
  'late': 'bg-amber-500/10 text-amber-500',
  'half-day': 'bg-orange-500/10 text-orange-500',
  'on-leave': 'bg-blue-500/10 text-blue-500',
};

const shiftIcons: Record<ShiftType, React.ElementType> = {
  'morning': Sun,
  'afternoon': Sunset,
  'night': Moon,
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>(initialMockStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesSearch = 
        staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
      const matchesShift = shiftFilter === 'all' || staff.shift === shiftFilter;
      const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
      return matchesSearch && matchesRole && matchesShift && matchesStatus;
    });
  }, [staffList, searchQuery, roleFilter, shiftFilter, statusFilter]);

  const stats = useMemo(() => {
    const activeStaff = staffList.filter(s => s.status === 'active').length;
    const onLeave = staffList.filter(s => s.status === 'on-leave').length;
    const avgPerformance = staffList.reduce((acc, s) => acc + s.performanceScore, 0) / staffList.length;
    const totalHours = staffList.reduce((acc, s) => acc + s.hoursWorked, 0);
    return { activeStaff, onLeave, avgPerformance, totalHours };
  }, [staffList]);

  const attendanceWithStaff = mockAttendanceRecords.map(record => ({
    ...record,
    staff: staffList.find(s => s.id === record.staffId),
  }));

  const schedulesWithStaff = mockStaffSchedules.map(schedule => ({
    ...schedule,
    staff: staffList.find(s => s.id === schedule.staffId),
  }));

  const handleAddEmployee = () => {
    setEditingStaff(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (staff: Staff) => {
    setEditingStaff(staff);
    setDialogOpen(true);
  };

  const handleSaveEmployee = (staff: Staff) => {
    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === staff.id ? staff : s));
    } else {
      setStaffList(prev => [...prev, staff]);
    }
  };

  const handleDeleteClick = (staff: Staff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      setStaffList(prev => prev.filter(s => s.id !== staffToDelete.id));
      toast({
        title: 'Employee Removed',
        description: `${staffToDelete.firstName} ${staffToDelete.lastName} has been removed.`,
      });
      setStaffToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleTerminateEmployee = (staff: Staff) => {
    setStaffList(prev => prev.map(s => 
      s.id === staff.id ? { ...s, status: 'terminated' as const } : s
    ));
    toast({
      title: 'Employee Terminated',
      description: `${staff.firstName} ${staff.lastName} has been marked as terminated.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage employees, schedules, and performance</p>
        </div>
        <Button className="gap-2" onClick={handleAddEmployee}>
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeStaff}</p>
                <p className="text-sm text-muted-foreground">Active Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Star className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgPerformance.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalHours / 1000).toFixed(1)}k</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Directory Tab */}
        <TabsContent value="directory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="front-desk">Front Desk</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="concierge">Concierge</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={shiftFilter} onValueChange={setShiftFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shifts</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((staff) => {
              const ShiftIcon = shiftIcons[staff.shift];
              return (
                <Card key={staff.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{staff.firstName} {staff.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{staff.department}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={roleColors[staff.role]}>
                              {staff.role.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className={statusColors[staff.status]}>
                              {staff.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEditEmployee(staff)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          {staff.status !== 'terminated' && (
                            <DropdownMenuItem onClick={() => handleTerminateEmployee(staff)}>
                              <UserX className="mr-2 h-4 w-4" />
                              Terminate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(staff)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{staff.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShiftIcon className="h-4 w-4" />
                        <span className="capitalize">{staff.shift} Shift</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Performance</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">{staff.performanceScore}</span>
                        </div>
                      </div>
                      <Progress value={staff.performanceScore * 20} className="mt-2 h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredStaff.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No staff found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Break</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedulesWithStaff.map((schedule) => {
                    const ShiftIcon = schedule.staff ? shiftIcons[schedule.staff.shift] : Sun;
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {schedule.staff?.firstName[0]}{schedule.staff?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {schedule.staff?.firstName} {schedule.staff?.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{schedule.staff?.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShiftIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{schedule.staff?.shift}</span>
                          </div>
                        </TableCell>
                        <TableCell>{schedule.shiftStart}</TableCell>
                        <TableCell>{schedule.shiftEnd}</TableCell>
                        <TableCell>{schedule.break || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceWithStaff.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {record.staff?.firstName[0]}{record.staff?.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {record.staff?.firstName} {record.staff?.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{record.staff?.department}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={attendanceColors[record.status]}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.checkIn ? format(record.checkIn, 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.checkOut ? format(record.checkOut, 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.hoursWorked ? `${record.hoursWorked}h` : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {record.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...staffList]
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .slice(0, 5)
                    .map((staff, index) => (
                      <div key={staff.id} className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{staff.firstName} {staff.lastName}</p>
                          <p className="text-sm text-muted-foreground">{staff.department}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="font-semibold">{staff.performanceScore}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{staff.tasksCompleted} tasks</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Most Hours Worked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...staffList]
                    .sort((a, b) => b.hoursWorked - a.hoursWorked)
                    .slice(0, 5)
                    .map((staff, index) => (
                      <div key={staff.id} className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-blue-500 text-white' :
                          index === 1 ? 'bg-blue-400 text-white' :
                          index === 2 ? 'bg-blue-300 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{staff.firstName} {staff.lastName}</p>
                          <p className="text-sm text-muted-foreground">{staff.department}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{staff.hoursWorked.toLocaleString()}h</span>
                          <p className="text-xs text-muted-foreground">since {format(staff.hireDate, 'MMM yyyy')}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {['Operations', 'Front Office', 'Housekeeping', 'Food & Beverage'].map((dept) => {
                  const deptStaff = staffList.filter(s => s.department === dept);
                  const avgScore = deptStaff.length ? deptStaff.reduce((acc, s) => acc + s.performanceScore, 0) / deptStaff.length : 0;
                  const totalTasks = deptStaff.reduce((acc, s) => acc + s.tasksCompleted, 0);
                  return (
                    <div key={dept} className="rounded-lg border p-4">
                      <h4 className="font-semibold">{dept}</h4>
                      <p className="text-sm text-muted-foreground">{deptStaff.length} employees</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Score</span>
                          <span className="font-medium">{avgScore.toFixed(1)}</span>
                        </div>
                        <Progress value={avgScore * 20} className="h-1.5" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasks</span>
                          <span className="font-medium">{totalTasks.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Form Dialog */}
      <StaffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={editingStaff}
        onSave={handleSaveEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {staffToDelete?.firstName} {staffToDelete?.lastName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
