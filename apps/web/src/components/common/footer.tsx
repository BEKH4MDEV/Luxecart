import Link from 'next/link';
import { Logo } from './logo';
/**
 * Footer.
 *
 * Site-wide footer with brand, navigation, and legal links.
 * Appears on every page (added to root layout).
 */
const FOOTER_SECTIONS = [
    {
        title: "Tienda",
        links: [
            { href: '/products', label: "Todos los productos" },
            { href: '/categories/electronics', label: "Electr\u00F3nica" },
            { href: '/categories/fashion', label: "Moda" },
            { href: '/categories/home-living', label: "Hogar y estilo de vida" },
        ],
    },
    {
        title: "Cuenta",
        links: [
            { href: '/dashboard', label: "Panel" },
            { href: '/orders', label: "Mis pedidos" },
            { href: '/wishlist', label: "Lista de deseos" },
            { href: '/profile', label: "Perfil" },
        ],
    },
    {
        title: "Empresa",
        links: [
            { href: '/about', label: "Sobre nosotros" },
            { href: '/contact', label: "Contacto" },
            { href: '/careers', label: "Trabaja con nosotros" },
            { href: '/blog', label: "Blog" },
        ],
    },
    {
        title: "Legal",
        links: [
            { href: '/privacy', label: "Pol\u00EDtica de privacidad" },
            { href: '/terms', label: "T\u00E9rminos de servicio" },
            { href: '/shipping', label: "Informaci\u00F3n de env\u00EDo" },
            { href: '/returns', label: "Devoluciones" },
        ],
    },
];
export function Footer() {
    return (<footer className="border-t border-border bg-background mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">Compras premium, reinventadas. Descubre productos seleccionados con una calidad y un servicio excepcionales.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (<div key={section.title} className="space-y-3">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (<li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>))}
              </ul>
            </div>))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LuxeCart. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Creado con Next.js, Express, PostgreSQL y TypeScript
          </p>
        </div>
      </div>
    </footer>);
}
