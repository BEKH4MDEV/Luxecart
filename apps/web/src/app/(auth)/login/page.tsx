"use client";
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { loginUser } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api-client';
/**
 * Login Page.
 *
 * Uses Suspense wrapper because `useSearchParams()` requires it for
 * proper client/server boundary handling in Next.js 15+.
 */
const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo electr\u00F3nico es obligatorio")
        .email("Introduce una direcci\u00F3n de correo v\u00E1lida"),
    password: z.string().min(1, "La contrase\u00F1a es obligatoria"),
});
type LoginFormValues = z.infer<typeof loginSchema>;
// ─── PAGE EXPORT (with Suspense wrapper) ─────────────────────
export default function LoginPage() {
    return (<React.Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </React.Suspense>);
}
function LoginFallback() {
    return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
    </div>);
}
// ─── ACTUAL FORM (uses useSearchParams inside Suspense) ───────
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [showPassword, setShowPassword] = React.useState(false);
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken);
            toast.success(`¡Bienvenido de nuevo, ${data.user.firstName}!`);
            const redirectTo = searchParams.get('redirect') ?? '/dashboard';
            router.push(redirectTo);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
    const onSubmit = (values: LoginFormValues) => {
        loginMutation.mutate(values);
    };
    return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido de nuevo</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta de LuxeCart para seguir comprando
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@ejemplo.com" autoComplete="email" autoFocus disabled={loginMutation.isPending} {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="password" render={({ field }) => (<FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline" tabIndex={-1}>¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Introduce tu contraseña" autoComplete="current-password" disabled={loginMutation.isPending} {...field}/>
                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Ocultar contrase\u00F1a" : "Mostrar contrase\u00F1a"} tabIndex={-1}>
                          {showPassword ? (<EyeOff className="h-4 w-4"/>) : (<Eye className="h-4 w-4"/>)}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Signing in…
                  </>) : ("Iniciar sesi\u00F3n")}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">Crea una
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>);
}
