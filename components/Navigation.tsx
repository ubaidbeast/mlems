'use client'
import { usePathname, useRouter } from "next/navigation"
import { useMedia } from 'react-use'
import { useState } from "react";

import { NavButton } from "./NavButton";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger
  } from "@/components/ui/sheet"
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { AppRole } from "@/lib/roles";

const routes = [
    {
        href: '/',
        label: 'Overview'
    },
    {
        href: '/transactions',
        label: 'Transactions'
    },
    {
        href: '/departments',
        label: 'Departments'
    },
    {
        href: '/categories',
        label: 'Categories'
    },
    {
        href: '/settings',
        label: 'Settings'
    },
]

type Props = {
    role: AppRole;
}

export function Navigation({ role }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const pathName = usePathname();
    const isMobile = useMedia("(max-width: 1024px)", false);

    const onClick = (href: string) => {
        router.push(href)
        setIsOpen(false)
    }

    const visibleRoutes = role === "admin"
        ? routes
        : routes.filter((route) => route.href !== "/departments" && route.href !== "/categories");

    if (isMobile)  {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant='outline'
                        size='sm'
                        className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
                    >
                        <Menu className="size-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-2 ">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <nav className="flex flex-col gap-y-2 pt-6">
                        {visibleRoutes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.href === pathName ? "secondary" : "ghost"}
                                onClick={() => onClick(route.href)}
                                className="w-full justify-start"
                            >
                                {route.label}
                            </Button>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        )
    }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto"> 
        {visibleRoutes.map((route) => (
            <NavButton 
                key={route.href}
                href={route.href}
                label={route.label}
                isActive={pathName === route.href}
            />
        ))}
    </nav>
  )
}
