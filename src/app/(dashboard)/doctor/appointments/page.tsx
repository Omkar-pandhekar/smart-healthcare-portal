"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  User2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Stethoscope,
  FileText,
  CreditCard,
} from "lucide-react";

const DoctorAppointmentsPage = () => {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchDoctorIdAndAppointments = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;
    setLoading(true);
    setError("");
    try {
      // First, get the doctorId using the doctor's email
      const resDoctor = await fetch("/api/doctor/get-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      const dataDoctor = await resDoctor.json();
      if (!resDoctor.ok || !dataDoctor.success || !dataDoctor.doctor?._id) {
        setError(dataDoctor.error || "Failed to fetch doctor info");
        setLoading(false);
        return;
      }
      setDoctorId(dataDoctor.doctor._id);
      // Now fetch appointments for this doctorId
      const res = await fetch("/api/appointment/doctor-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: dataDoctor.doctor._id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.appointments || []);
      } else {
        setError(data.error || "Failed to fetch appointments");
      }
    } catch {
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorIdAndAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    setActionLoading(appointmentId + newStatus);
    setError("");
    try {
      const res = await fetch("/api/appointment/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchDoctorIdAndAppointments();
      } else {
        setError(data.error || "Failed to update appointment");
      }
    } catch {
      setError("Failed to update appointment");
    } finally {
      setActionLoading("");
    }
  };

  if (status === "loading" || loading) return <>Loading...</>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading title="My Appointments" subtitle="Manage patient appointments" />
      {appointments.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          No appointments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {appointments.map((appt: any) => (
            <div
              key={appt._id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition p-6 flex flex-col gap-3"
            >
              {/* Patient Info */}
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User2 className="w-5 h-5 text-blue-500" />
                {appt.user?.fullname || appt.user?.email || appt.user}
              </div>

              {/* Date and Time */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <CalendarDays className="w-4 h-4" />
                {appt.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Clock className="w-4 h-4" />
                {appt.time}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 text-sm">
                {appt.status === "confirmed" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : appt.status === "cancelled" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : appt.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span
                  className={
                    "px-2 py-0.5 rounded-full text-xs font-bold " +
                    (appt.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : appt.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : appt.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700")
                  }
                >
                  {appt.status}
                </span>
              </div>

              {/* Appointment Type */}
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

              {/* Payment Status */}
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-orange-500" />
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

              {/* Notes */}
              {appt.notes && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 mt-2">
                  <FileText className="w-4 h-4" />
                  <span className="italic">{appt.notes}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                {appt.status === "booked" && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading === appt._id + "confirmed"}
                      onClick={() => handleStatusChange(appt._id, "confirmed")}
                    >
                      {actionLoading === appt._id + "confirmed"
                        ? "Accepting..."
                        : "Accept"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                      disabled={actionLoading === appt._id + "cancelled"}
                      onClick={() => handleStatusChange(appt._id, "cancelled")}
                    >
                      {actionLoading === appt._id + "cancelled"
                        ? "Rejecting..."
                        : "Reject"}
                    </Button>
                  </>
                )}
                {appt.status === "confirmed" && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={actionLoading === appt._id + "completed"}
                    onClick={() => handleStatusChange(appt._id, "completed")}
                  >
                    {actionLoading === appt._id + "completed"
                      ? "Completing..."
                      : "Complete"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
