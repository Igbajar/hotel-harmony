import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, Activity, User, Clock, Search, Filter, Eye, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import type { ActivityLog } from '@/hooks/useActivityLogs';

const actionColors: Record<string, string> = {
  create: 'bg-green-500/10 text-green-600 border-green-500/20',
  update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  delete: 'bg-red-500/10 text-red-600 border-red-500/20',
  login: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  logout: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  view: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

const entityIcons: Record<string, React.ReactNode> = {
  room: <div className="p-2 rounded-lg bg-primary/10"><Activity className="h-4 w-4 text-primary" /></div>,
  guest: <div className="p-2 rounded-lg bg-blue-500/10"><User className="h-4 w-4 text-blue-600" /></div>,
  reservation: <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-4 w-4 text-green-600" /></div>,
  invoice: <div className="p-2 rounded-lg bg-yellow-500/10"><Info className="h-4 w-4 text-yellow-600" /></div>,
  staff: <div className="p-2 rounded-lg bg-purple-500/10"><User className="h-4 w-4 text-purple-600" /></div>,
  system: <div className="p-2 rounded-lg bg-gray-500/10"><Shield className="h-4 w-4 text-gray-600" /></div>,
};

export default function Security() {
  const { data: logs = [], isLoading } = useActivityLogs(500);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesEntity && matchesAction;
  });

  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))];
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const recentActivity = logs.slice(0, 10);
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.created_at);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID', 'IP Address', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.action,
        log.entity_type,
        log.entity_id || '',
        log.user_id || '',
        log.ip_address || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Security & Access
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitor user activity and manage security settings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
                <p className="text-2xl font-bold">{todayLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">{new Set(logs.filter(l => l.user_id).map(l => l.user_id)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delete Actions</p>
                <p className="text-2xl font-bold">{logs.filter(l => l.action === 'delete').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>Complete audit trail of all system activities</CardDescription>
                </div>
                <Button variant="outline" onClick={exportLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                        {uniqueEntities.map((entity, idx) => (
                          <SelectItem key={idx} value={String(entity)} className="capitalize">{String(entity)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {uniqueActions.map((action, idx) => (
                          <SelectItem key={idx} value={String(action)} className="capitalize">{String(action)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logs Table */}
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading activity logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No activity logs found</h3>
                  <p className="text-muted-foreground">No logs match your current filters</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead className="hidden md:table-cell">User</TableHead>
                        <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                        <TableHead className="w-[80px]">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={actionColors[log.action] || 'bg-muted'}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {entityIcons[log.entity_type] || entityIcons.system}
                              <div>
                                <span className="capitalize font-medium">{log.entity_type}</span>
                                {log.entity_id && (
                                  <span className="text-xs text-muted-foreground block font-mono">
                                    {log.entity_id.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground font-mono">
                              {log.user_id ? `${log.user_id.slice(0, 8)}...` : 'System'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground font-mono">
                              {log.ip_address || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredLogs.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing 50 of {filteredLogs.length} logs. Export to view all.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest 10 activities in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">Activity will appear here once users interact with the system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((log, index) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {entityIcons[log.entity_type] || entityIcons.system}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={actionColors[log.action] || 'bg-muted'}>
                            {log.action}
                          </Badge>
                          <span className="text-sm capitalize font-medium">{log.entity_type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.user_id ? `User ${log.user_id.slice(0, 8)}...` : 'System'} performed {log.action} on {log.entity_type}
                          {log.entity_id && ` (${log.entity_id.slice(0, 8)}...)`}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this activity
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Timestamp</label>
                  <p className="font-mono">{format(new Date(selectedLog.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Action</label>
                  <p>
                    <Badge variant="outline" className={actionColors[selectedLog.action] || 'bg-muted'}>
                      {selectedLog.action}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Entity Type</label>
                  <p className="capitalize font-medium">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Entity ID</label>
                  <p className="font-mono text-sm">{selectedLog.entity_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">User ID</label>
                  <p className="font-mono text-sm">{selectedLog.user_id || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">IP Address</label>
                  <p className="font-mono text-sm">{selectedLog.ip_address || 'N/A'}</p>
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <label className="text-sm text-muted-foreground">Additional Details</label>
                  <ScrollArea className="h-[200px] mt-2">
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
