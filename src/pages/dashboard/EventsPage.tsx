
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createEvent, updateEvent, deleteEvent, DbEvent } from '@/services/supabaseService';
import { format } from 'date-fns';

const EventsPage = () => {
  const { events, patients, isLoading, refreshData } = useAppContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DbEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString(),
    end_date: null as string | null,
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: new Date().toISOString(),
      end_date: null,
      status: 'active'
    });
  };

  const handleEdit = (event: any) => {
    setSelectedEvent({
      id: event.id,
      title: event.name,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate || null,
      status: event.status,
      is_public: true,
      created_at: null,
      updated_at: null
    });

    setFormData({
      title: event.name,
      description: event.description || '',
      start_date: event.startDate,
      end_date: event.endDate || null,
      status: event.status
    });
    
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDialogOpen(false);
    
    try {
      await deleteEvent(id);
      await refreshData();
      toast({
        title: "Event deleted",
        description: "The event has been successfully removed.",
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, formData);
        toast({
          title: "Event updated",
          description: "The event information has been updated successfully.",
        });
      } else {
        await createEvent({
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
          is_public: true
        });
        toast({
          title: "Event created",
          description: "The new event has been added successfully.",
        });
      }
      setIsSheetOpen(false);
      resetForm();
      await refreshData();
    } catch (error) {
      console.error("Failed to save event:", error);
      toast({
        title: "Error",
        description: "Failed to save the event. Please check your inputs and try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate metrics
  const activeEvents = events.filter(e => e.status === 'active').length;
  const recentEvents = events.filter(e => {
    const eventDate = new Date(e.startDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return eventDate >= thirtyDaysAgo;
  }).length;
  
  // Count affected people based on patients with event IDs
  const totalAffected = patients.filter(p => events.some(e => e.status === 'active' && e.id === p.eventId)).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <Button onClick={() => {
            setSelectedEvent(null);
            resetForm();
            setIsSheetOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage disaster events and related information.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Events</CardTitle>
              <CardDescription>Currently active disaster events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeEvents}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Events from the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{recentEvents}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Affected</CardTitle>
              <CardDescription>People affected by current events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalAffected.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
            <CardDescription>Recent event activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <p>Loading event data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{format(new Date(event.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'active' ? 'Active' : 'Resolved'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedEvent({
                                id: event.id,
                                title: event.name,
                                description: event.description,
                                start_date: event.startDate,
                                end_date: event.endDate || null,
                                status: event.status,
                                is_public: true,
                                created_at: null,
                                updated_at: null
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit/Add Event Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedEvent ? "Edit Event" : "Add New Event"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input 
                id="start_date" 
                type="datetime-local" 
                value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData({...formData, start_date: new Date(e.target.value).toISOString()});
                  }
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input 
                id="end_date" 
                type="datetime-local"
                value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData({...formData, end_date: new Date(e.target.value).toISOString()});
                  } else {
                    setFormData({...formData, end_date: null});
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedEvent ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedEvent?.title}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedEvent && handleDelete(selectedEvent.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EventsPage;
