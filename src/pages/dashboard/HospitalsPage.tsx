import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createHospital, updateHospital, deleteHospital, DbHospital } from '@/services/supabaseService';
import { useI18n } from '@/context/I18nContext';

const HospitalsPage = () => {
  const { hospitals, isLoading, refreshData } = useAppContext();
  const { toast } = useToast(); 
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<DbHospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    capacity: 0,
    current_occupancy: 0,
    contact_phone: '',
    contact_email: ''
  });

  useEffect(()=>{
    refreshData()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      capacity: 0,
      current_occupancy: 0,
      contact_phone: '',
      contact_email: ''
    });
  };

  const handleEdit = (hospital: any) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      capacity: hospital.capacity,
      current_occupancy: hospital.current_occupancy,
      contact_phone: hospital.phone || '',
      contact_email: hospital.contact_email || ''
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDialogOpen(false);
    
    try {
      await deleteHospital(id);
      await refreshData();
      toast({
        title: t('hospitalsPage.toast.deleteSuccess.title'),
        description: t('hospitalsPage.toast.deleteSuccess.description'),
      });
    } catch (error) {
      console.error("Failed to delete hospital:", error);
      toast({
        title: t('hospitalsPage.toast.error.title'),
        description: t('hospitalsPage.toast.error.description'),
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedHospital) {
        await updateHospital(selectedHospital.id, formData);
        toast({
          title: t('hospitalsPage.toasts.updateSuccess.title'),
          description: t('hospitalsPage.toasts.updateSuccess.description'),
        });
      } else {
        await createHospital(formData);
        toast({
          title: t('hospitalsPage.toasts.createSuccess.title'),
          description: t('hospitalsPage.toasts.createSuccess.description'),
        });
      }
      setIsSheetOpen(false);
      resetForm();
      await refreshData();
    } catch (error) {
      console.error("Failed to save hospital:", error);
      toast({
        title: t('hospitalsPage.toasts.error.title'),
        description: t('hospitalsPage.toasts.error.description'),
        variant: "destructive"
      });
    }
  };

  const atCapacityCount = hospitals.filter(h => h.status === 'full').length;
  const availableBedCount = hospitals.reduce((sum, h) => {
    // Estimate based on our data model
    const capacity = 50; // Default capacity if not provided
    const occupied = h.patients?.length || 0;
    return sum + Math.max(0, capacity - occupied);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t('hospitalsPage.title')}</h1>
          <Button onClick={() => {
            setSelectedHospital(null);
            resetForm();
            setIsSheetOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> {t('hospitalsPage.addHospitalButton')}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {t('hospitalsPage.description')}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('hospitalsPage.stats.total')}</CardTitle>
              <CardDescription>{t('hospitalsPage.stats.totalDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{hospitals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('hospitalsPage.stats.atCapacity')}</CardTitle>
              <CardDescription>{t('hospitalsPage.stats.atCapacityDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{atCapacityCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('hospitalsPage.stats.availableBeds')}</CardTitle>
              <CardDescription>{t('hospitalsPage.stats.availableBedsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{availableBedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('hospitalsPage.network.title')}</CardTitle>
            <CardDescription>{t('hospitalsPage.network.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <p>{t('hospitalsPage.network.loading')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hospitalsPage.network.headers.name')}</TableHead>
                    <TableHead>{t('hospitalsPage.network.headers.location')}</TableHead>
                    <TableHead className="text-center">{t('hospitalsPage.network.headers.status')}</TableHead>
                    <TableHead className="text-center">{t('hospitalsPage.network.headers.patientsCount')}</TableHead>
                    <TableHead className="text-right">{t('hospitalsPage.network.headers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">{hospital.name}</TableCell>
                      <TableCell>{hospital.address}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <span 
                            className={`inline-block w-2 h-2 mr-2 rounded-full ${
                              hospital.status === 'full' ? 'bg-red-500' : 
                              hospital.status === 'receiving' ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>
                            {t(`hospitalsPage.network.status.${hospital.status}`)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{hospital.patients && hospital.patients.length > 0 ? hospital.patients.length : 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(hospital)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedHospital(hospital);
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

      {/* Edit/Add Hospital Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedHospital ? t('hospitalsPage.sheet.editTitle') : t('hospitalsPage.sheet.addTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('hospitalsPage.sheet.fields.name')}</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">{t('hospitalsPage.sheet.fields.address')}</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">{t('hospitalsPage.sheet.fields.latitude')}</Label>
                <Input 
                  id="latitude" 
                  type="number" 
                  step="0.000001"
                  value={formData.latitude} 
                  onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">{t('hospitalsPage.sheet.fields.longitude')}</Label>
                <Input 
                  id="longitude" 
                  type="number" 
                  step="0.000001"
                  value={formData.longitude} 
                  onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">{t('hospitalsPage.sheet.fields.capacity')}</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  value={formData.capacity} 
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_occupancy">{t('hospitalsPage.sheet.fields.currentOccupancy')}</Label>
                <Input 
                  id="current_occupancy" 
                  type="number" 
                  value={formData.current_occupancy} 
                  onChange={(e) => setFormData({...formData, current_occupancy: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">{t('hospitalsPage.sheet.fields.phone')}</Label>
              <Input 
                id="contact_phone" 
                value={formData.contact_phone || ''} 
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">{t('hospitalsPage.sheet.fields.email')}</Label>
              <Input 
                id="contact_email" 
                type="email" 
                value={formData.contact_email || ''} 
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                {t('hospitalsPage.sheet.cancelButton')}
              </Button>
              <Button type="submit">
                {selectedHospital ? t('hospitalsPage.sheet.updateButton') : t('hospitalsPage.sheet.createButton')}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('hospitalsPage.dialog.title')}</DialogTitle>
          </DialogHeader>
          <p>{t('hospitalsPage.dialog.description', { name: selectedHospital?.name })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('hospitalsPage.dialog.cancelButton')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedHospital && handleDelete(selectedHospital.id)}
            >
              {t('hospitalsPage.dialog.deleteButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HospitalsPage;
