"use client";
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle2, AlertCircle, Mail, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { verifyEmail } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
/**
 * Verify Email Page.
 *
 * URL: /verify-email?token=xyz
 *
 * Wrapped in Suspense for Next.js 16 compatibility (useSearchParams).
 *
 * Three states:
 *   1. VERIFYING — Loading spinner
 *   2. SUCCESS — Confirmation + Continue button
 *   3. ERROR — Helpful message + Resend option
 */
// ─── PAGE EXPORT ─────────────────────────────────────────────
export default function VerifyEmailPage() {
    return (<React.Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </React.Suspense>);
}
function VerifyEmailFallback() {
    return (<PageShell>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Loader2 className="h-8 w-8 text-primary animate-spin"/>
          </div>
          <CardTitle className="text-2xl font-bold">Cargando…</CardTitle>
        </CardHeader>
      </Card>
    </PageShell>);
}
// ─── ACTUAL CONTENT ──────────────────────────────────────────
function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const mutation = useMutation({
        mutationFn: verifyEmail,
    });
    // Auto-trigger verification on mount
    React.useEffect(() => {
        if (token && mutation.isIdle) {
            mutation.mutate({ token });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
    // No token in URL
    if (!token) {
        return (<PageShell>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive"/>
            </div>
            <CardTitle className="text-2xl font-bold">Falta el token</CardTitle>
            <CardDescription>Este enlace de verificación está incompleto. Usa el enlace que recibiste por correo.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Ir a iniciar sesión</Link>
            </Button>
          </CardFooter>
        </Card>
      </PageShell>);
    }
    // Verifying (loading)
    if (mutation.isPending || mutation.isIdle) {
        return (<PageShell>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Loader2 className="h-8 w-8 text-primary animate-spin"/>
            </div>
            <CardTitle className="text-2xl font-bold">Verificando tu correo…</CardTitle>
            <CardDescription>Solo tomará un momento.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageShell>);
    }
    // Success
    if (mutation.isSuccess) {
        return (<PageShell>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500"/>
            </div>
            <CardTitle className="text-2xl font-bold">¡Correo verificado!</CardTitle>
            <CardDescription>Tu correo se ha confirmado. Ahora puedes disfrutar de acceso completo a LuxeCart.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => router.push('/dashboard')}>Ir al panel
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/products">Ver productos</Link>
            </Button>
          </CardFooter>
        </Card>
      </PageShell>);
    }
    // Error
    return (<PageShell>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive"/>
          </div>
          <CardTitle className="text-2xl font-bold">La verificación falló</CardTitle>
          <CardDescription>
            {getErrorMessage(mutation.error)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Motivos comunes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>El enlace ya se ha usado</li>
              <li>El enlace ha expirado (los enlaces duran 24 horas)</li>
              <li>El enlace se copió incorrectamente</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/resend-verification">
              <Mail className="mr-2 h-4 w-4"/>Solicitar nuevo enlace
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Volver a iniciar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageShell>);
}
/**
 * Shared layout wrapper for all states.
 */
function PageShell({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      {children}
    </div>);
}
