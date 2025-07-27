"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { navigationLinks } from "../constants/data";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { ModeToggle } from "./modeToggle";
import { useRouter, usePathname } from "next/navigation";
import classNames from "classnames";

const Header = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div className="fixed top-0 left-0 w-full z-50 shadow-sm bg-white backdrop-blur-sm dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center w-full py-5 px-20">
        <div className="flex items-center gap-2 min-w-[120px]">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={36} height={36} />
            <span className="font-bold text-lg">Health</span>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="hidden sm:flex gap-8">
            {navigationLinks.map((item, idx) => {
              const active = pathName?.includes(item.link);
              return (
                <Link
                  key={idx}
                  href={item.link}
                  className={classNames(
                    "relative px-4 py-2 text-black dark:text-neutral-300 horizontal-underline text-base font-medium mx-2",
                    {
                      "horizontal-underline-active": active,
                    }
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 min-w-[120px] justify-end">
          {session ? (
            <>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <Avatar>
                      <AvatarImage
                        src={
                          (session.user as any)?.profileImage ||
                          session.user?.image ||
                          ""
                        }
                        alt="Profile"
                      />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-zinc-700 hover:!text-zinc-100 font-bold"
                    onClick={() =>
                      router.push(
                        session.user &&
                          typeof session.user === "object" &&
                          "role" in session.user &&
                          typeof session.user.role === "string"
                          ? session.user.role.toLowerCase() === "doctor"
                            ? "/doctor"
                            : session.user.role.toLowerCase() === "hospital"
                            ? "/hospital"
                            : "/user"
                          : "/user",
                        { scroll: false }
                      )
                    }
                  >
                    Go to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <ModeToggle />
            </>
          )}
        </div>
        {/* Mobile Nav */}
        <div className="sm:hidden">
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>
            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navigationLinks.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
            </MobileNavMenu>
          </MobileNav>
        </div>
      </div>
    </div>
  );
};

export default Header;
