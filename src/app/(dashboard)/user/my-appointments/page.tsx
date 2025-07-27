"use client";

import Heading from "@/components/common/Heading";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  User2,
  Info,
  Video,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyAppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;
      setLoading(true);
      setError("");
      try {
        const resAppts = await fetch("/api/appointment/user-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const dataAppts = await resAppts.json();
        if (resAppts.ok && dataAppts.success) {
          setAppointments(dataAppts.appointments || []);
        } else {
          setError(dataAppts.error || "Failed to fetch appointments");
        }
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  const handlePayment = async (appointmentId: string) => {
    try {
      const res = await fetch("/api/appointment/update-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, paymentStatus: "paid" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, paymentStatus: "paid" }
              : appt
          )
        );
        alert("Payment successful!");
      } else {
        alert(data.error || "Failed to update payment status");
      }
    } catch {
      alert("Failed to update payment status");
    }
  };

  if (status === "loading" || loading) return <>Loading...</>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading title="My Appointments" subtitle="View your past appointments" />
      {appointments.length === 0 ? (
        <div className="text-gray-600">No appointments found.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {appointments.map((appt: any) => (
            <li
              key={appt._id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition p-5 flex flex-col gap-2 h-full"
            >
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User2 className="w-5 h-5 text-blue-500" />
                Dr. {appt.doctor?.name || appt.doctor}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <CalendarDays className="w-4 h-4" />
                {appt.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Clock className="w-4 h-4" />
                {appt.time}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-yellow-500" />
                <span
                  className={
                    "px-2 py-0.5 rounded-full text-xs font-bold " +
                    (appt.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : appt.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700")
                  }
                >
                  {appt.status}
                </span>
              </div>
              {/* Payment Status */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Payment:</span>
                <span
                  className={
                    "px-2 py-0.5 rounded-full text-xs font-bold " +
                    (appt.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : appt.paymentStatus === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700")
                  }
                >
                  {appt.paymentStatus || "unpaid"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {appt.type === "telemedicine" ? (
                  <Video className="w-4 h-4 text-purple-500" />
                ) : (
                  <Stethoscope className="w-4 h-4 text-blue-500" />
                )}
                <span
                  className={
                    "px-2 py-0.5 rounded-full text-xs font-bold " +
                    (appt.type === "telemedicine"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700")
                  }
                >
                  {appt.type}
                </span>
              </div>
              {appt.notes && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 mt-2">
                  <Info className="w-4 h-4" />
                  <span>{appt.notes}</span>
                </div>
              )}
              {/* Action Buttons at the bottom */}
              <div className="flex-1" />
              <div className="flex gap-2 mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-700 justify-end">
                {(appt.paymentStatus === "unpaid" ||
                  !appt.paymentStatus ||
                  appt.paymentStatus === "failed") && (
                  <Button
                    className="px-4 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    onClick={() => handlePayment(appt._id)}
                  >
                    Pay Now
                  </Button>
                )}
                <Button
                  className="px-4 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
                  onClick={() => alert("Prescription download coming soon!")}
                >
                  View Prescription
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
