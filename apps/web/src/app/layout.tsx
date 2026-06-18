import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthBootstrap } from '@/providers/auth-bootstrap';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/common/navbar';
import { CartDrawer } from '@/components/cart/cart-drawer';
import './globals.css';
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});
export const metadata: Metadata = {
    title: {
        default: "LuxeCart \u2014 Compras premium, reinventadas",
        template: '%s | LuxeCart',
    },
    description: "Una plataforma de comercio electr\u00F3nico profesional con productos premium seleccionados y una experiencia de compra de primer nivel.",
    keywords: ['ecommerce', 'shopping', 'premium products', 'luxury', 'fashion', 'electronics'],
    authors: [{ name: 'LuxeCart' }],
    openGraph: {
        title: "LuxeCart \u2014 Compras premium, reinventadas",
        description: "Descubre productos premium seleccionados con una experiencia de compra fluida.",
        type: 'website',
        locale: 'es_PE',
    },
    robots: {
        index: true,
        follow: true,
    },
};
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthBootstrap />
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
            <Toaster richColors position="top-right"/>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>);
}
