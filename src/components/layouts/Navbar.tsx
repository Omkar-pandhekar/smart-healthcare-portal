"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Bell, MessageCircle, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `50px` }}
    >
      <div className="flex justify-between items-center w-full py-4 px-8 bg-zinc-800 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          {/* {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )} */}
          <Link
            href="/"
            className="cursor-pointer hover:!text-zinc-300"
            scroll={false}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rentiful Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="text-xl font-bold">
                RENT
                <span className="text-orange-500 font-light hover:!text-zinc-300">
                  IFUL
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-5">
            {session ? (
              <>
                {/* <div className="relative hidden md:block">
                <MessageCircle className="w-6 h-6 cursor-pointer text-zinc-200 hover:text-zinc-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-700 rounded-full"></span>
              </div>
              <div className="relative hidden md:block">
                <Bell className="w-6 h-6 cursor-pointer text-zinc-200 hover:text-zinc-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-700 rounded-full"></span>
              </div> */}

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                    <Avatar>
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback className="bg-zinc-600">
                        {session?.user?.role?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-zinc-200 hidden md:block cursor-pointer">
                      {session?.user?.name}
                    </p>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-zinc-700">
                    <DropdownMenuItem
                      className="cursor-pointer hover:!bg-zinc-700 hover:!text-zinc-100 font-bold"
                      onClick={() =>
                        router.push(
                          session?.user?.role?.toLowerCase() === "doctor"
                            ? "/doctor"
                            : session?.user?.role?.toLowerCase() === "hospital"
                            ? "/hospital"
                            : "/user",
                          { scroll: false }
                        )
                      }
                    >
                      Go to Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-200" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:!bg-zinc-700 hover:!text-zinc-100"
                      onClick={() =>
                        router.push(
                          `/${session?.user?.role?.toLowerCase()}s/settings`,
                          { scroll: false }
                        )
                      }
                    >
                      Settings
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
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="text-white border-white bg-transparent hover:bg-white hover:text-zinc-700 rounded-lg"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="secondary"
                    className="text-white bg-orange-600 hover:bg-white hover:text-zinc-700 rounded-lg"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
