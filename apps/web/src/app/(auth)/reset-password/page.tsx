"use client";
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { resetPassword } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
/**
 * Reset Password Page.
 * Wrapped in Suspense for Next.js 16 compatibility.
 */
const resetPasswordSchema = z
    .object({
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
type FormValues = z.infer<typeof resetPasswordSchema>;
// ─── PAGE EXPORT ─────────────────────────────────────────────
export default function ResetPasswordPage() {
    return (<React.Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </React.Suspense>);
}
function ResetPasswordFallback() {
    return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
    </div>);
}
// ─── ACTUAL CONTENT ──────────────────────────────────────────
function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [showPassword, setShowPassword] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });
    const mutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            setIsSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
    // State 1: No token in URL
    if (!token) {
        return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive"/>
            </div>
            <CardTitle className="text-2xl font-bold">Enlace de restablecimiento no válido</CardTitle>
            <CardDescription>Este enlace falta o no es válido. Solicita un nuevo enlace para restablecer la contraseña.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/forgot-password">Solicitar nuevo enlace</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Volver a iniciar sesión</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>);
    }
    // State 2: Success
    if (isSuccess) {
        return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500"/>
            </div>
            <CardTitle className="text-2xl font-bold">¡Contraseña restablecida!</CardTitle>
            <CardDescription>Tu contraseña se ha actualizado correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">Redirigiendo al inicio de sesión…
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Iniciar sesión ahora</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>);
    }
    // State 3: Form
    return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <KeyRound className="h-6 w-6 text-primary"/>
          </div>
          <CardTitle className="text-2xl font-bold">Establece una nueva contraseña</CardTitle>
          <CardDescription>Elige una contraseña segura para tu cuenta de LuxeCart.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate({
            token,
            newPassword: values.newPassword,
        }))} className="space-y-4">
              <FormField control={form.control} name="newPassword" render={({ field }) => (<FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Introduce la nueva contraseña" autoComplete="new-password" autoFocus disabled={mutation.isPending} {...field}/>
                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                          {showPassword ? (<EyeOff className="h-4 w-4"/>) : (<Eye className="h-4 w-4"/>)}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Al menos 8 caracteres con mayúsculas, minúsculas y un número
                    </p>
                  </FormItem>)}/>

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type={showPassword ? 'text' : 'password'} placeholder="Vuelve a introducir la nueva contraseña" autoComplete="new-password" disabled={mutation.isPending} {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Actualizando…
                  </>) : ("Restablecer contrase\u00F1a")}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">¿La recuerdas?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>);
}
