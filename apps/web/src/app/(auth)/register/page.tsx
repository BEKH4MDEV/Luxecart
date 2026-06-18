"use client";
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { registerUser } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api-client';
/**
 * Register Page.
 *
 * Features:
 *   - Full name + email + password validation
 *   - Show/hide password toggle
 *   - Password strength rules matching backend
 *   - Loading state during submission
 *   - Auto-login after successful registration
 *   - Redirect to dashboard
 */
const registerSchema = z.object({
    firstName: z
        .string()
        .min(1, "El nombre es obligatorio")
        .max(100, "El nombre es demasiado largo"),
    lastName: z
        .string()
        .min(1, "El apellido es obligatorio")
        .max(100, "El apellido es demasiado largo"),
    email: z
        .string()
        .min(1, "El correo electr\u00F3nico es obligatorio")
        .email("Introduce una direcci\u00F3n de correo v\u00E1lida"),
    password: z
        .string()
        .min(8, "La contrase\u00F1a debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "La contrase\u00F1a debe contener al menos una letra may\u00FAscula")
        .regex(/[a-z]/, "La contrase\u00F1a debe contener al menos una letra min\u00FAscula")
        .regex(/[0-9]/, "La contrase\u00F1a debe contener al menos un n\u00FAmero"),
});
type RegisterFormValues = z.infer<typeof registerSchema>;
export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [showPassword, setShowPassword] = React.useState(false);
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
    });
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken);
            toast.success(`¡Bienvenido a LuxeCart, ${data.user.firstName}!`);
            router.push('/dashboard');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
    const onSubmit = (values: RegisterFormValues) => {
        registerMutation.mutate(values);
    };
    return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Crea tu cuenta</CardTitle>
          <CardDescription>
            Join LuxeCart and discover premium products
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" autoComplete="given-name" autoFocus disabled={registerMutation.isPending} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>

                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" autoComplete="family-name" disabled={registerMutation.isPending} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>)}/>
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@ejemplo.com" autoComplete="email" disabled={registerMutation.isPending} {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="password" render={({ field }) => (<FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Crea una contraseña segura" autoComplete="new-password" disabled={registerMutation.isPending} {...field}/>
                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Ocultar contrase\u00F1a" : "Mostrar contrase\u00F1a"} tabIndex={-1}>
                          {showPassword ? (<EyeOff className="h-4 w-4"/>) : (<Eye className="h-4 w-4"/>)}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Debe tener 8+ caracteres con mayúsculas, minúsculas y un número
                    </p>
                  </FormItem>)}/>

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creando cuenta…
                  </>) : ("Crear cuenta")}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-center text-sm">
          <p className="text-muted-foreground">¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>);
}
