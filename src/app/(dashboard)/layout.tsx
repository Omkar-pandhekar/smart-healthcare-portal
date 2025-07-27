"use client";

import Header from "@/components/layouts/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layouts/AppSIdebar";
import { NAVBAR_HEIGHT } from "@/components/constants/data";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/user/get-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          const data = await res.json();
          if (res.ok && data.role) {
            setRole(data.role);
            setError(null);
          } else {
            setRole(null);
            setError(data.error || "Failed to fetch role");
          }
        } catch {
          setRole(null);
          setError("Failed to fetch role");
        } finally {
          setIsLoading(false);
        }
      } else if (status !== "loading") {
        setIsLoading(false);
      }
    };
    fetchRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  useEffect(() => {
    if (role) {
      const userRole = role.toLowerCase();
      if (
        (userRole === "hospital" && pathname?.startsWith("/doctor")) ||
        (userRole === "doctor" && pathname?.startsWith("/hospital"))
      ) {
        router.push(userRole === "doctor" ? "/doctor" : "/hospital", {
          scroll: false,
        });
      }
    }
  }, [role, router, pathname]);

  if (status === "loading" || isLoading) return <>Loading...</>;
  if (error) return <>{error}</>;
  if (!role) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-primary-100">
        <Header />
        <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
          <main className="flex">
            <Sidebar
              userType={role.toLowerCase() as "doctor" | "hospital" | "user"}
            />
            <div className="flex-grow transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
