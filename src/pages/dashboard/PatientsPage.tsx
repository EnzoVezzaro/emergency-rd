import { useEffect, useState } from 'react';
import { useI18n } from '@/context/I18nContext';
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
  const { t } = useI18n();
  const { patients, hospitals, events, isLoading, refreshData } = useAppContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  useEffect(()=>{
    refreshData()
  }, [])
  
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
        title: t('patientsPage.toast.deleteSuccess.title'),
        description: t('patientsPage.toast.deleteSuccess.description'),
      });
    } catch (error) {
      console.error("Failed to delete patient:", error);
      toast({
        title: t('patientsPage.toast.deleteError.title'),
        description: t('patientsPage.toast.deleteError.description'),
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
          title: t('patientsPage.toast.updateSuccess.title'),
          description: t('patientsPage.toast.updateSuccess.description'),
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
          title: t('patientsPage.toast.addSuccess.title'),
          description: t('patientsPage.toast.addSuccess.description'),
        });
      }
      setIsSheetOpen(false);
      resetForm();
      await refreshData();
    } catch (error) {
      console.error("Failed to save patient:", error);
      toast({
        title: t('patientsPage.toast.saveError.title'),
        description: t('patientsPage.toast.saveError.description'),
        variant: "destructive"
      });
    }
  };

  // Calculate metrics
  const totalPatients = patients.length;
  const hospitalizedPatients = patients.filter(p => p.hospitalId).length;
  const criticalPatients = patients.filter(p => p.condition === 'critical' || p.condition === 'deceased').length;
  
  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patients.length / patientsPerPage);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t('patientsPage.title')}</h1>
          <Button onClick={() => {
            setSelectedPatient(null);
            resetForm();
            setIsSheetOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> {t('patientsPage.addPatientButton')}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {t('patientsPage.description')}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('patientsPage.stats.total')}</CardTitle>
              <CardDescription>{t('patientsPage.stats.totalDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalPatients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('patientsPage.stats.hospitalized')}</CardTitle>
              <CardDescription>{t('patientsPage.stats.hospitalizedDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{hospitalizedPatients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('patientsPage.stats.critical')}</CardTitle>
              <CardDescription>{t('patientsPage.stats.criticalDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{criticalPatients}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('patientsPage.list.title')}</CardTitle>
            <CardDescription>{t('patientsPage.list.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <p>{t('patientsPage.list.loading')}</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('patientsPage.list.headers.name')}</TableHead>
                      <TableHead>{t('patientsPage.list.headers.hospital')}</TableHead>
                      <TableHead>{t('patientsPage.list.headers.condition')}</TableHead>
                      <TableHead>{t('patientsPage.list.headers.admitted')}</TableHead>
                      <TableHead className="text-right">{t('patientsPage.list.headers.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPatients.map((patient) => {
                      const hospital = hospitals.find(h => h.id === patient.hospitalId);
                      return (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell>{hospital?.name || t('patientsPage.list.headers.notAssigned')}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              patient.condition === 'critical' ? 'bg-red-100 text-red-800' : 
                              patient.condition === 'stable' ? 'bg-green-100 text-green-800' : 
                              patient.condition === 'deceased' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {t(`patientsPage.list.status.${patient.condition || 'unknown'}`)}
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
            <SheetTitle>{selectedPatient ? t('patientsPage.sheet.editTitle') : t('patientsPage.sheet.addTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('patientsPage.sheet.fields.fullName')}</Label>
              <Input 
                id="full_name" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">{t('patientsPage.sheet.fields.condition')}</Label>
              <select 
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="stable">{t('patientsPage.sheet.fields.conditionOptions.stable')}</option>
                <option value="critical">{t('patientsPage.sheet.fields.conditionOptions.critical')}</option>
                <option value="unknown">{t('patientsPage.sheet.fields.conditionOptions.unknown')}</option>
                <option value="deceased">{t('patientsPage.sheet.fields.conditionOptions.deceased')}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hospital_id">{t('patientsPage.sheet.fields.hospital')}</Label>
              <select 
                id="hospital_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.hospital_id}
                onChange={(e) => setFormData({...formData, hospital_id: e.target.value})}
              >
                <option value="">{t('patientsPage.sheet.fields.hospitalOptions.notAssigned')}</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event_id">{t('patientsPage.sheet.fields.event')}</Label>
              <select 
                id="event_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.event_id}
                onChange={(e) => setFormData({...formData, event_id: e.target.value})}
              >
                <option value="">{t('patientsPage.sheet.fields.eventOptions.notAssociated')}</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                {t('patientsPage.sheet.cancelButton')}
              </Button>
              <Button type="submit">
                {selectedPatient ? t('patientsPage.sheet.updateButton') : t('patientsPage.sheet.createButton')}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('patientsPage.dialog.title')}</DialogTitle>
          </DialogHeader>
          <p>{t('patientsPage.dialog.description', { name: selectedPatient?.name })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('patientsPage.dialog.cancelButton')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPatient && handleDelete(selectedPatient.id)}
            >
              {t('patientsPage.dialog.deleteButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientsPage;
