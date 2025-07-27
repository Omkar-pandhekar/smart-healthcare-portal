"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Pill,
} from "lucide-react";
import PrescriptionEditor from "@/components/prescriptions/PrescriptionEditor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const DoctorAppointmentsPage = () => {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [showPrescriptionEditor, setShowPrescriptionEditor] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [prescriptionStatus, setPrescriptionStatus] = useState<{
    [key: string]: boolean;
  }>({});

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

        // Check prescription status for completed appointments
        const completedAppointments = data.appointments.filter(
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

  const handlePrescribe = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionEditor(true);
  };

  const handlePrescriptionSave = async (prescription: any) => {
    setShowPrescriptionEditor(false);
    setSelectedAppointment(null);

    // Refresh appointments to show updated status
    await fetchDoctorIdAndAppointments();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      booked: { color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
      confirmed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      completed: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.booked;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const paymentConfig = {
      paid: { color: "bg-green-100 text-green-700" },
      unpaid: { color: "bg-yellow-100 text-yellow-700" },
      failed: { color: "bg-red-100 text-red-700" },
    };

    const config =
      paymentConfig[paymentStatus as keyof typeof paymentConfig] ||
      paymentConfig.unpaid;

    return (
      <Badge className={config.color}>
        <CreditCard className="w-3 h-3 mr-1" />
        {paymentStatus || "unpaid"}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      telemedicine: { color: "bg-purple-100 text-purple-700", icon: Video },
      "in-person": { color: "bg-blue-100 text-blue-700", icon: Stethoscope },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] || typeConfig["in-person"];
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {type}
      </Badge>
    );
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
        <div className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt: any) => (
                  <TableRow key={appt._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            {appt.user?.fullname ||
                              appt.user?.email ||
                              appt.user}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarDays className="w-3 h-3" />
                          {appt.date}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {appt.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(appt.type)}</TableCell>
                    <TableCell>{getStatusBadge(appt.status)}</TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(appt.paymentStatus)}
                    </TableCell>
                    <TableCell>
                      {appt.notes ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FileText className="w-3 h-3" />
                          <span
                            className="truncate max-w-[150px]"
                            title={appt.notes}
                          >
                            {appt.notes}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {appt.status === "booked" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={
                                actionLoading === appt._id + "confirmed"
                              }
                              onClick={() =>
                                handleStatusChange(appt._id, "confirmed")
                              }
                            >
                              {actionLoading === appt._id + "confirmed"
                                ? "Accepting..."
                                : "Accept"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              disabled={
                                actionLoading === appt._id + "cancelled"
                              }
                              onClick={() =>
                                handleStatusChange(appt._id, "cancelled")
                              }
                            >
                              {actionLoading === appt._id + "cancelled"
                                ? "Rejecting..."
                                : "Reject"}
                            </Button>
                          </>
                        )}
                        {appt.status === "confirmed" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={actionLoading === appt._id + "completed"}
                            onClick={() =>
                              handleStatusChange(appt._id, "completed")
                            }
                          >
                            {actionLoading === appt._id + "completed"
                              ? "Completing..."
                              : "Complete"}
                          </Button>
                        )}
                        {appt.status === "completed" && (
                          <>
                            {prescriptionStatus[appt._id] ? (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  window.open(
                                    `/doctor/prescriptions?appointmentId=${appt._id}`,
                                    "_blank"
                                  );
                                }}
                              >
                                <Pill className="w-3 h-3 mr-1" />
                                View Prescription
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => handlePrescribe(appt)}
                              >
                                <Pill className="w-3 h-3 mr-1" />
                                Prescribe
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Prescription Editor Dialog */}
      <Dialog
        open={showPrescriptionEditor}
        onOpenChange={setShowPrescriptionEditor}
      >
        <DialogContent className="max-w-6xl min-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedAppointment && (
            <PrescriptionEditor
              patientId={
                selectedAppointment.user?._id || selectedAppointment.user
              }
              appointmentId={selectedAppointment._id}
              onSave={handlePrescriptionSave}
              onCancel={() => {
                setShowPrescriptionEditor(false);
                setSelectedAppointment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointmentsPage;
