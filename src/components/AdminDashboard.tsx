import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EventModal from './EventModal';

// Skeleton loader
function SummarySkeleton() {
  return (
    <Card>
      <CardContent className="p-6 animate-pulse">
        <div className="h-6 w-6 rounded-full bg-gray-700 mb-3"></div>
        <div className="h-3 w-24 bg-gray-700 mb-2 rounded"></div>
        <div className="h-5 w-12 bg-gray-700 rounded"></div>
      </CardContent>
    </Card>
  );
}

interface Event {
  id: string;
  name: string;
  application_start_date: string;
  application_end_date: string;
  is_manually_closed: boolean;
}

interface Application {
  id: string;
  event_id: string;
  project_name: string;
  group_leader_email: string;
  group_leader_phone: string;
  university: string;
  group_size: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  // Summary state
  const [totalApplications, setTotalApplications] = useState(0);
  const [openEvents, setOpenEvents] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [avgGroupSize, setAvgGroupSize] = useState(0);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('application_start_date', { ascending: true });
    if (error) {
      toast({ title: "Error fetching events", description: error.message, variant: "destructive" });
    } else if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error fetching applications", description: error.message, variant: "destructive" });
    } else if (data) {
      setApplications(data);
    }
    setLoading(false);
  };

  // Compute summary stats
  useEffect(() => {
    const total = applications.length;
    const avg = total > 0 ? applications.reduce((sum, a) => sum + a.group_size, 0) / total : 0;
    const today = new Date();

    const open = events.filter(
      e =>
        !e.is_manually_closed &&
        new Date(e.application_start_date) <= today &&
        new Date(e.application_end_date) >= today
    ).length;

    const upcoming = events.filter(
      e => new Date(e.application_start_date) > today
    ).length;

    setTotalApplications(total);
    setAvgGroupSize(avg);
    setOpenEvents(open);
    setUpcomingEvents(upcoming);
  }, [applications, events]);

  useEffect(() => {
    fetchEvents();
    fetchApplications();
  }, []);

  const filteredApplications = selectedEvent === 'all'
    ? applications
    : applications.filter(app => app.event_id === selectedEvent);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event deleted successfully" });
      fetchEvents();
      fetchApplications();
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      fetchApplications();
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-primary">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">
          Manage events and applications
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <SummarySkeleton />
              <SummarySkeleton />
              <SummarySkeleton />
              <SummarySkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{totalApplications}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Open Events</p>
                    <p className="text-2xl font-bold">{openEvents}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    <p className="text-2xl font-bold">{upcomingEvents}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Group Size</p>
                    <p className="text-2xl font-bold">{avgGroupSize.toFixed(1)}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Event Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Events</h2>
              <Button
                className="gradient-primary shadow-glow"
                onClick={() => {
                  setEditingEvent(undefined);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </div>

            <EventModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSuccess={() => fetchEvents()}
              event={editingEvent}
            />

<div className="space-y-4">
  {events.map((event) => {
    const now = new Date();
    const startDate = new Date(event.application_start_date);
    const endDate = new Date(event.application_end_date);

    // Determine event status
    let status: "upcoming" | "open" | "closed";
    if (event.is_manually_closed || now > endDate) {
      status = "closed";
    } else if (now < startDate) {
      status = "upcoming";
    } else {
      status = "open";
    }

    // Filter applications for this event
    const eventApps = applications.filter((a) => a.event_id === event.id);
    const appCount = eventApps.length;
    const avgGroupSize =
      appCount > 0
        ? (eventApps.reduce((sum, a) => sum + a.group_size, 0) / appCount).toFixed(1)
        : "0";

    return (
      <div
        key={event.id}
        className="bg-[#1f1f1f] rounded-lg shadow-md p-4 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {event.name}
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  status === "closed"
                    ? "bg-gray-600 text-gray-200"
                    : status === "upcoming"
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {status}
              </span>
            </h3>
            <p className="text-sm text-gray-400">
              {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingEvent(event);
                setModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteEvent(event.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-between mt-4 text-sm text-gray-300">
          <span>Applications: {appCount}</span>
          <span>Avg Group Size: {avgGroupSize}</span>
        </div>
      </div>
    );
  })}
</div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Applications</h2>
              <div className="flex gap-2">
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="all">All Events</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="gradient-card shadow-card border-border/50">
                  <CardContent className="pt-6 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{app.project_name}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{app.university}</p>
                        <p>Leader Email: {app.group_leader_email} • Phone: {app.group_leader_phone}</p>
                        <p>Group Size: {app.group_size}</p>
                        <p>Submitted: {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-success border-success hover:bg-success/10"
                            onClick={() => handleUpdateApplicationStatus(app.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
