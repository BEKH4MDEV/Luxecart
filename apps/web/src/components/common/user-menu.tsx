"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { User as UserIcon, LogOut, Package, Heart, LayoutDashboard, ShieldCheck, } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage, } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { logoutUser } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
/**
 * User Menu (Avatar + Dropdown).
 *
 * Two states:
 *   - LOGGED OUT: Shows "Sign In" button
 *   - LOGGED IN:  Shows avatar with dropdown menu
 *
 * Dropdown items vary by role:
 *   - Customer: Dashboard, Orders, Wishlist, Logout
 *   - Admin: + Admin Panel link
 */
export function UserMenu() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const isAdmin = useAuthStore((state) => state.isAdmin());
    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            logout();
            toast.success("Sesi\u00F3n cerrada correctamente");
            router.push('/');
        },
        onError: (error) => {
            // Even if backend logout fails, clear local state
            logout();
            toast.error(getErrorMessage(error));
            router.push('/');
        },
    });
    // Not logged in — show sign-in button
    if (!isAuthenticated || !user) {
        return (<Button asChild variant="default" size="sm">
        <Link href="/login">Iniciar sesión</Link>
      </Button>);
    }
    // Build initials from first + last name
    const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menú de usuario">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.firstName}/>
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <p className="text-sm font-semibold leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1.5 truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4"/>Panel
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4"/>Mis pedidos
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4"/>Lista de deseos
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4"/>Perfil
          </Link>
        </DropdownMenuItem>

        {isAdmin && (<>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer text-primary">
                <ShieldCheck className="mr-2 h-4 w-4"/>Panel de administración
              </Link>
            </DropdownMenuItem>
          </>)}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4"/>
          {logoutMutation.isPending ? "Cerrando sesi\u00F3n\u2026" : "Cerrar sesi\u00F3n"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
