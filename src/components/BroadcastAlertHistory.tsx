import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Clock, Users, MessageSquare, MapPin, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertLog {
  id: string;
  incident_id: string;
  message: string;
  sent_to: string[];
  radius_km: number;
  sent_at: string;
  created_by: string | null;
}

interface BroadcastAlertHistoryProps {
  alertLogs: AlertLog[];
  onRefresh: () => void;
}

export function BroadcastAlertHistory({ alertLogs, onRefresh }: BroadcastAlertHistoryProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertLog | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusColor = (sentCount: number): "default" | "destructive" | "outline" | "secondary" => {
    if (sentCount === 0) return 'destructive';
    if (sentCount < 5) return 'secondary';
    return 'default';
  };

  const getMockResponses = (recipientCount: number) => {
    // Simulate response tracking
    const responseRate = Math.random() * 0.7 + 0.2; // 20-90% response rate
    const responses = Math.floor(recipientCount * responseRate);
    const safe = Math.floor(responses * 0.6);
    const needHelp = Math.floor(responses * 0.2);
    const evacuating = responses - safe - needHelp;
    
    return {
      total: responses,
      safe,
      needHelp,
      evacuating,
      noResponse: recipientCount - responses,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Broadcast Alert History
            </CardTitle>
            <CardDescription>Complete log of all sent alerts and community responses</CardDescription>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alertLogs.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No broadcast alerts sent yet</p>
            <p className="text-sm text-muted-foreground mt-2">Alerts will appear here once sent</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertLogs.map((log) => {
                  const datetime = formatDateTime(log.sent_at);
                  const responses = getMockResponses(log.sent_to?.length || 0);
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{datetime.date}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {datetime.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{log.sent_to?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{log.radius_km} km</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(log.sent_to?.length || 0)}>
                          {log.sent_to?.length || 0} Sent
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate text-muted-foreground">
                          {log.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAlert(log)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Alert Details
                              </DialogTitle>
                              <DialogDescription>
                                Sent on {datetime.date} at {datetime.time}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                              {/* Alert Message */}
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Message Content
                                </h4>
                                <Card className="bg-muted/50">
                                  <CardContent className="p-4">
                                    <p className="text-sm">{log.message}</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Distribution Stats */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                      Total Recipients
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-3xl font-bold">{log.sent_to?.length || 0}</div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                      Broadcast Radius
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-3xl font-bold">{log.radius_km} km</div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                      Response Rate
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-3xl font-bold">
                                      {Math.round((responses.total / (log.sent_to?.length || 1)) * 100)}%
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Community Responses */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Community Responses
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <Card className="bg-success/10 border-success/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-success" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">Safe</p>
                                            <p className="text-2xl font-bold text-success">{responses.safe}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-warning/10 border-warning/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                                            <AlertTriangle className="h-5 w-5 text-warning" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">Need Help</p>
                                            <p className="text-2xl font-bold text-warning">{responses.needHelp}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-primary/10 border-primary/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-primary" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">Evacuating</p>
                                            <p className="text-2xl font-bold text-primary">{responses.evacuating}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-muted/50">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <XCircle className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">No Response</p>
                                            <p className="text-2xl font-bold">{responses.noResponse}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>

                              {/* Recipient List */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Recipients ({log.sent_to?.length || 0})
                                </h4>
                                <Card className="bg-muted/50">
                                  <CardContent className="p-4">
                                    <ScrollArea className="h-32">
                                      <div className="space-y-2">
                                        {log.sent_to?.map((phone, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-background rounded-md"
                                          >
                                            <span className="text-sm font-mono">{phone}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {index % 3 === 0 ? 'Safe' : index % 3 === 1 ? 'Need Help' : 'No Response'}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
