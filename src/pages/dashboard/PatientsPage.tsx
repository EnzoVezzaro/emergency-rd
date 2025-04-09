
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const PatientsPage = () => {
  const { patients, hospitals, events, isLoading, refreshData } = useAppContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;
  
  const [formData, setFormData] = useState({
    full_name: '',
    status: 'stable',
    hospital_id: '',
    event_id: '',
    additional_info: {}
  });

  const resetForm = () => {
    setFormData({
      full_name: '',
      status: 'stable',
      hospital_id: '',
      event_id: '',
      additional_info: {}
    });
  };

  const handleEdit = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      full_name: patient.name,
      status: patient.condition || 'unknown',
      hospital_id: patient.hospitalId || '',
      event_id: patient.eventId || '',
      additional_info: {}
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDialogOpen(false);
    
    try {
      const { error } = await supabase.from('victims').delete().eq('id', id);
      
      if (error) throw error;
      
      await refreshData();
      toast({
        title: "Patient deleted",
        description: "The patient record has been successfully removed.",
      });
    } catch (error) {
      console.error("Failed to delete patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete the patient record. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedPatient) {
        const { error } = await supabase
          .from('victims')
          .update({
            full_name: formData.full_name,
            status: formData.status,
            hospital_id: formData.hospital_id || null,
            event_id: formData.event_id || null,
          })
          .eq('id', selectedPatient.id);
        
        if (error) throw error;
        
        toast({
          title: "Patient updated",
          description: "The patient information has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('victims')
          .insert({
            full_name: formData.full_name,
            status: formData.status,
            hospital_id: formData.hospital_id || null,
            event_id: formData.event_id || null,
          });
        
        if (error) throw error;
        
        toast({
          title: "Patient added",
          description: "The new patient has been added successfully.",
        });
      }
      setIsSheetOpen(false);
      resetForm();
      await refreshData();
    } catch (error) {
      console.error("Failed to save patient:", error);
      toast({
        title: "Error",
        description: "Failed to save the patient. Please check your inputs and try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate metrics
  const totalPatients = patients.length;
  const hospitalizedPatients = patients.filter(p => p.hospitalId).length;
  const criticalPatients = patients.filter(p => p.condition === 'critical').length;
  
  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <Button onClick={() => {
            setSelectedPatient(null);
            resetForm();
            setIsSheetOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage patient information and track status.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Patients</CardTitle>
              <CardDescription>Registered in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalPatients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hospitalized</CardTitle>
              <CardDescription>Currently in hospital care</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{hospitalizedPatients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Critical</CardTitle>
              <CardDescription>In critical condition</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{criticalPatients}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Manage patient information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <p>Loading patient data...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Admitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPatients.map((patient) => {
                      const hospital = hospitals.find(h => h.id === patient.hospitalId);
                      return (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell>{hospital?.name || 'Not assigned'}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              patient.condition === 'critical' ? 'bg-red-100 text-red-800' : 
                              patient.condition === 'stable' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {patient.condition || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(patient.dateAdmitted), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(patient)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              isActive={currentPage === pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <>
                          <PaginationItem>
                            <span className="p-2">...</span>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink 
                              isActive={currentPage === totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit/Add Patient Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedPatient ? "Edit Patient" : "Add New Patient"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Condition</Label>
              <select 
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="stable">Stable</option>
                <option value="critical">Critical</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hospital_id">Hospital</Label>
              <select 
                id="hospital_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.hospital_id}
                onChange={(e) => setFormData({...formData, hospital_id: e.target.value})}
              >
                <option value="">Not assigned</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event_id">Event</Label>
              <select 
                id="event_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.event_id}
                onChange={(e) => setFormData({...formData, event_id: e.target.value})}
              >
                <option value="">Not associated</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedPatient ? "Update" : "Create"}
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
          <p>Are you sure you want to delete {selectedPatient?.name}'s record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPatient && handleDelete(selectedPatient.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientsPage;
