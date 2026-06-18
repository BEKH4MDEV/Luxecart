"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, MapPin, Star, Pencil, Trash2, Loader2, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Footer } from '@/components/common/footer';
import { useAuthStore } from '@/stores/auth-store';
import { listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, } from '@/lib/api/addresses';
import { getErrorMessage } from '@/lib/api-client';
import type { Address } from '@/types';
/**
 * Addresses Page.
 *
 * Customer's address book.
 * - List all saved addresses
 * - Add new address
 * - Edit existing address
 * - Delete address
 * - Set default address
 */
const addressSchema = z.object({
    firstName: z.string().min(1, "El nombre es obligatorio").max(100),
    lastName: z.string().min(1, "El apellido es obligatorio").max(100),
    addressLine1: z.string().min(1, "La direcci\u00F3n es obligatoria").max(255),
    addressLine2: z.string().max(255).optional().or(z.literal('')),
    city: z.string().min(1, "La ciudad es obligatoria").max(100),
    state: z.string().min(1, "La provincia/estado es obligatoria").max(100),
    postalCode: z.string().min(1, "El c\u00F3digo postal es obligatorio").max(20),
    country: z.string().length(2, 'Use 2-letter code (e.g., US, GB, NG)'),
    phone: z.string().max(20).optional().or(z.literal('')),
    isDefault: z.boolean().optional(),
});
type AddressFormValues = z.infer<typeof addressSchema>;
export default function AddressesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    React.useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login?redirect=/addresses');
        }
    }, [isHydrated, isAuthenticated, router]);
    const { data: addresses, isLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: listAddresses,
        enabled: isAuthenticated,
    });
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
            phone: '',
            isDefault: false,
        },
    });
    const openCreateDialog = () => {
        form.reset({
            firstName: '',
            lastName: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
            phone: '',
            isDefault: addresses?.length === 0,
        });
        setEditingAddress(null);
        setIsDialogOpen(true);
    };
    const openEditDialog = (address: Address) => {
        form.reset({
            firstName: address.firstName,
            lastName: address.lastName,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 ?? '',
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone ?? '',
            isDefault: address.isDefault,
        });
        setEditingAddress(address);
        setIsDialogOpen(true);
    };
    const saveMutation = useMutation({
        mutationFn: async (values: AddressFormValues) => {
            if (editingAddress) {
                return updateAddress(editingAddress.id, values);
            }
            return createAddress(values);
        },
        onSuccess: () => {
            toast.success(editingAddress ? "Direcci\u00F3n actualizada" : "Direcci\u00F3n agregada");
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            setIsDialogOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteAddress,
        onSuccess: () => {
            toast.success("Direcci\u00F3n eliminada");
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const setDefaultMutation = useMutation({
        mutationFn: setDefaultAddress,
        onSuccess: () => {
            toast.success("Direcci\u00F3n predeterminada actualizada");
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    if (!isHydrated || !isAuthenticated) {
        return (<div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
      </div>);
    }
    return (<>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis direcciones</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus direcciones de envío
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4"/>
            Añadir dirección
          </Button>
        </div>

        {/* Address list */}
        {isLoading ? (<div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
          </div>) : addresses && addresses.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (<Card key={address.id} className="p-6 relative">
                {address.isDefault && (<Badge className="absolute top-4 right-4 gap-1">
                    <Star className="h-3 w-3 fill-current"/>Predeterminada
                  </Badge>)}

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.addressLine1}
                      {address.addressLine2 && <>, {address.addressLine2}</>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.country}
                    </p>
                    {address.phone && (<p className="text-sm text-muted-foreground mt-1">
                        {address.phone}
                      </p>)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {!address.isDefault && (<Button variant="ghost" size="sm" onClick={() => setDefaultMutation.mutate(address.id)} disabled={setDefaultMutation.isPending}>
                      <Star className="h-3.5 w-3.5 mr-1.5"/>Establecer como predeterminada
                    </Button>)}
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(address)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5"/>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive ml-auto" onClick={() => {
                    if (confirm("\u00BFEliminar esta direcci\u00F3n?")) {
                        deleteMutation.mutate(address.id);
                    }
                }} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5"/>Eliminar
                  </Button>
                </div>
              </Card>))}
          </div>) : (<Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold text-lg">Aún no hay direcciones</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Añade tu primera dirección para empezar a comprar.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4"/>
              Añadir dirección
            </Button>
          </Card>)}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Editar direcci\u00F3n" : "A\u00F1adir nueva direcci\u00F3n"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
            ? "Actualiza los datos de tu direcci\u00F3n." : "A\u00F1ade una nueva direcci\u00F3n de env\u00EDo a tu cuenta."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
              </div>

              <FormField control={form.control} name="addressLine1" render={({ field }) => (<FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="addressLine2" render={({ field }) => (<FormItem>
                    <FormLabel>Apartamento, suite (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="city" render={({ field }) => (<FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
                <FormField control={form.control} name="state" render={({ field }) => (<FormItem>
                      <FormLabel>Estado / Provincia</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem>
                      <FormLabel>Código postal</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
                <FormField control={form.control} name="country" render={({ field }) => (<FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input placeholder="US" maxLength={2} {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
              </div>

              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 123 4567" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (<>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Saving…
                    </>) : editingAddress ? ('Actualizar dirección') : ('Añadir dirección')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </>);
}
