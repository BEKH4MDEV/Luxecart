"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Phone, Shield, Eye, EyeOff, Loader2, Check, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage, } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Footer } from '@/components/common/footer';
import { useAuthStore } from '@/stores/auth-store';
import { updateMyProfile, changeMyPassword } from '@/lib/api/users';
import { getErrorMessage } from '@/lib/api-client';
/**
 * Profile Page (/profile).
 *
 * Sections:
 *   1. Account info card (read-only fields like email)
 *   2. Profile update form (firstName, lastName, phone)
 *   3. Change password form
 */
const profileSchema = z.object({
    firstName: z.string().min(1, "El nombre es obligatorio").max(100),
    lastName: z.string().min(1, "El apellido es obligatorio").max(100),
    phone: z.string().max(20).optional().or(z.literal('')),
});
const passwordSchema = z
    .object({
    currentPassword: z.string().min(1, "La contrase\u00F1a actual es obligatoria"),
    newPassword: z
        .string()
        .min(8, "La contrase\u00F1a debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, "Confirma tu contrase\u00F1a"),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrase\u00F1as no coinciden",
    path: ['confirmPassword'],
});
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const USER_ROLE_LABELS: Record<string, string> = {
    customer: 'Cliente',
    admin: 'Administrador',
    user: 'Usuario',
};

export default function ProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const [showCurrentPwd, setShowCurrentPwd] = React.useState(false);
    const [showNewPwd, setShowNewPwd] = React.useState(false);
    React.useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login?redirect=/profile');
        }
    }, [isHydrated, isAuthenticated, router]);
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            phone: user?.phone ?? '',
        },
    });
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });
    // Sync form when user data loads
    React.useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone ?? '',
            });
        }
    }, [user, profileForm]);
    const updateProfileMutation = useMutation({
        mutationFn: updateMyProfile,
        onSuccess: (updatedUser) => {
            toast.success("Perfil actualizado correctamente");
            setUser(updatedUser);
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const changePasswordMutation = useMutation({
        mutationFn: changeMyPassword,
        onSuccess: () => {
            toast.success("La contrase\u00F1a se cambi\u00F3 correctamente. Vuelve a iniciar sesi\u00F3n en los dem\u00E1s dispositivos.");
            passwordForm.reset();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    if (!isHydrated || !isAuthenticated || !user) {
        return (<div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
      </div>);
    }
    const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
    return (<>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground mt-1">Gestiona los datos de tu cuenta y tu seguridad
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info Card */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.firstName}/>
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5"/>
                  {user.email}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {user.isVerified ? (<Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3"/>Verificado
                  </Badge>) : (<Badge variant="secondary">No verificado</Badge>)}
                <Badge variant="outline" className="capitalize text-xs">
                  {USER_ROLE_LABELS[user.role.toLowerCase() as keyof typeof USER_ROLE_LABELS] ?? user.role}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Update Profile Form */}
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5"/>
                Personal Information
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Actualiza tu nombre y datos de contacto
              </p>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit((values) => updateProfileMutation.mutate(values))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={profileForm.control} name="firstName" render={({ field }) => (<FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>)}/>
                  <FormField control={profileForm.control} name="lastName" render={({ field }) => (<FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>)}/>
                </div>

                <FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5"/>Teléfono (opcional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555 123 4567" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>

                <div className="flex justify-end">
                  <Button type="submit" disabled={!profileForm.formState.isDirty ||
            updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (<>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Saving…
                      </>) : ("Guardar cambios")}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>

          {/* Change Password Form */}
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5"/>Cambiar contraseña
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Actualiza tu contraseña. Se cerrará tu sesión en los demás dispositivos.
              </p>
            </div>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit((values) => {
            changePasswordMutation.mutate({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
        })} className="space-y-4">
                <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<FormItem>
                      <FormLabel>Contraseña actual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showCurrentPwd ? 'text' : 'password'} autoComplete="current-password" {...field}/>
                          <button type="button" onClick={() => setShowCurrentPwd((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                            {showCurrentPwd ? (<EyeOff className="h-4 w-4"/>) : (<Eye className="h-4 w-4"/>)}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>

                <Separator />

                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showNewPwd ? 'text' : 'password'} autoComplete="new-password" {...field}/>
                          <button type="button" onClick={() => setShowNewPwd((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                            {showNewPwd ? (<EyeOff className="h-4 w-4"/>) : (<Eye className="h-4 w-4"/>)}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Al menos 8 caracteres con mayúsculas, minúsculas y un número
                      </p>
                    </FormItem>)}/>

                <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem>
                      <FormLabel>Confirmar nueva contraseña</FormLabel>
                      <FormControl>
                        <Input type={showNewPwd ? 'text' : 'password'} autoComplete="new-password" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>

                <div className="flex justify-end">
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? (<>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Actualizando…
                      </>) : ("Cambiar contrase\u00F1a")}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>

      <Footer />
    </>);
}
