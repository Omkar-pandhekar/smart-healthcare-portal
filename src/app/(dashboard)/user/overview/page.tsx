"use client";
import React, { useEffect, useState } from "react";
import Heading from "@/components/common/Heading";
import { useSession } from "next-auth/react";
import { CalendarDays, FileText, CreditCard } from "lucide-react";

const OverviewPage = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ appointments: 0, files: 0, paid: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        // Fetch appointments
        const apptRes = await fetch("/api/appointment/user-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const apptData = await apptRes.json();
        const appointments = apptData.appointments || [];
        // Fetch files
        const fileRes = await fetch(`/api/file/list?owner=${session.user.id}`);
        const fileData = await fileRes.json();
        const files = fileData.files || [];
        // Count paid appointments
        const paid = appointments.filter(
          (a: any) => a.paymentStatus === "paid"
        ).length;
        setStats({
          appointments: appointments.length,
          files: files.length,
          paid,
        });
      } catch {
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [session, status]);

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title={`Welcome, ${session?.user?.name || "User"}!`}
        subtitle="Here is your health overview."
      />
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col items-center">
            <CalendarDays className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <div className="text-zinc-500">Appointments</div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col items-center">
            <FileText className="w-8 h-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{stats.files}</div>
            <div className="text-zinc-500">Files Uploaded</div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col items-center">
            <CreditCard className="w-8 h-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{stats.paid}</div>
            <div className="text-zinc-500">Payments Done</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;
