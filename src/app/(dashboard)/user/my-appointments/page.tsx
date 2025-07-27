"use client";

import Heading from "@/components/common/Heading";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  User2,
  Video,
  Stethoscope,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrescriptionViewer from "@/components/prescriptions/PrescriptionViewer";

export default function MyAppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prescriptionStatus, setPrescriptionStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [showPrescriptionViewer, setShowPrescriptionViewer] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

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

        // Check prescription status for completed appointments
        const completedAppointments = dataAppts.appointments.filter(
          (apt: any) => apt.status === "completed"
        );
        const prescriptionChecks = await Promise.all(
          completedAppointments.map(async (apt: any) => {
            try {
              const checkRes = await fetch(
                `/api/prescriptions/check?appointmentId=${apt._id}`
              );
              const checkData = await checkRes.json();
              return {
                appointmentId: apt._id,
                hasPrescription: checkData.exists,
              };
            } catch {
              return { appointmentId: apt._id, hasPrescription: false };
            }
          })
        );

        const statusMap: { [key: string]: boolean } = {};
        prescriptionChecks.forEach((check) => {
          statusMap[check.appointmentId] = check.hasPrescription;
        });
        setPrescriptionStatus(statusMap);
      } else {
        setError(dataAppts.error || "Failed to fetch appointments");
      }
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleViewPrescription = async (appointmentId: string) => {
    try {
      // First check if prescription exists
      const checkRes = await fetch(
        `/api/prescriptions/check?appointmentId=${appointmentId}`
      );
      const checkData = await checkRes.json();

      if (checkData.exists && checkData.prescription) {
        setSelectedPrescription(checkData.prescription);
        setShowPrescriptionViewer(true);
      } else {
        alert("No prescription found for this appointment.");
      }
    } catch (error) {
      alert("Failed to fetch prescription details.");
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
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appt: any) => (
              <TableRow key={appt._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-zinc-500" />
                    {appt.date}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    {appt.time}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User2 className="w-4 h-4 text-blue-500" />
                    Dr. {appt.doctor?.name || appt.doctor}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {appt.type === "telemedicine" ? (
                      <Video className="w-4 h-4 text-purple-500" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-blue-500" />
                    )}
                    <Badge variant="secondary">{appt.type}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        appt.status === "confirmed"
                          ? "default"
                          : appt.status === "cancelled"
                          ? "destructive"
                          : appt.status === "completed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {appt.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        appt.paymentStatus === "paid"
                          ? "default"
                          : appt.paymentStatus === "failed"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {appt.paymentStatus || "unpaid"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {(appt.paymentStatus === "unpaid" ||
                      !appt.paymentStatus ||
                      appt.paymentStatus === "failed") && (
                      <Button
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                        onClick={() => handlePayment(appt._id)}
                      >
                        Pay Now
                      </Button>
                    )}
                    {appt.status === "completed" &&
                      prescriptionStatus[appt._id] && (
                        <Button
                          className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition flex items-center gap-1"
                          onClick={() => handleViewPrescription(appt._id)}
                        >
                          <Pill className="w-3 h-3" />
                          View Prescription
                        </Button>
                      )}
                    {appt.status === "completed" &&
                      !prescriptionStatus[appt._id] && (
                        <Button
                          className="px-3 py-1 rounded bg-gray-400 text-white text-xs font-semibold cursor-not-allowed"
                          disabled
                        >
                          <Pill className="w-3 h-3" />
                          No Prescription
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Prescription Viewer Dialog */}
      <Dialog
        open={showPrescriptionViewer}
        onOpenChange={setShowPrescriptionViewer}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionViewer prescription={selectedPrescription} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
