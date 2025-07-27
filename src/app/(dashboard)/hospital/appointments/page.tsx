"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, RefreshCw } from "lucide-react";

interface Appointment {
  _id: string;
  user: {
    fullname: string;
    email: string;
  };
  doctor: {
    name: string;
    email: string;
    specialization: string;
  };
  date: string;
  time: string;
  status: "booked" | "confirmed" | "cancelled" | "completed";
  type: "in-person" | "telemedicine";
  paymentStatus: "unpaid" | "paid" | "failed";
  notes?: string;
  createdAt: string;
}

const HospitalAppointmentsPage = () => {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchHospitalAppointments = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    setLoading(true);
    setError("");

    try {
      // First, get hospital info
      const resHospital = await fetch("/api/hospital/get-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      const dataHospital = await resHospital.json();
      if (
        !resHospital.ok ||
        !dataHospital.success ||
        !dataHospital.hospital?._id
      ) {
        setError("Failed to fetch hospital info");
        setLoading(false);
        return;
      }

      // Get all doctors in this hospital
      const resDoctors = await fetch(
        `/api/hospital/doctor-list?hospitalId=${dataHospital.hospital._id}`
      );
      const dataDoctors = await resDoctors.json();

      if (!resDoctors.ok || !dataDoctors.success) {
        setError("Failed to fetch doctors");
        setLoading(false);
        return;
      }

      const doctorIds = dataDoctors.doctors.map(
        (doctor: { _id: string }) => doctor._id
      );

      // Get appointments for all doctors in this hospital
      const allAppointments: Appointment[] = [];

      for (const doctorId of doctorIds) {
        const resAppointments = await fetch("/api/appointment/doctor-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId }),
        });

        const dataAppointments = await resAppointments.json();
        if (resAppointments.ok && dataAppointments.success) {
          allAppointments.push(...dataAppointments.appointments);
        }
      }

      // Sort by date (newest first)
      const sortedAppointments = allAppointments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);
    } catch {
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalAppointments();
  }, [session, status]);

  // Apply filters
  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          (apt.user?.fullname?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (apt.user?.email?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (apt.doctor?.name?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (apt.doctor?.email?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((apt) => apt.paymentStatus === paymentFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((apt) => apt.date === dateFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, paymentFilter, dateFilter]);

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
        await fetchHospitalAppointments();
      } else {
        setError(data.error || "Failed to update appointment");
      }
    } catch {
      setError("Failed to update appointment");
    } finally {
      setActionLoading("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Hospital Appointments"
        subtitle="Manage all appointments across your hospital"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search patients or doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Status</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                  setDateFilter("");
                }}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Appointments ({filteredAppointments.length})</span>
            <Button
              variant="outline"
              onClick={fetchHospitalAppointments}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {appointment.user.fullname}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Dr. {appointment.doctor?.name || "Unknown Doctor"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.doctor?.specialization ||
                              "General Medicine"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(appointment.date)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.type === "telemedicine"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {appointment.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            appointment.paymentStatus
                          )}`}
                        >
                          {appointment.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {appointment.status === "booked" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={
                                  actionLoading ===
                                  appointment._id + "confirmed"
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    appointment._id,
                                    "confirmed"
                                  )
                                }
                              >
                                {actionLoading === appointment._id + "confirmed"
                                  ? "Accepting..."
                                  : "Accept"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                disabled={
                                  actionLoading ===
                                  appointment._id + "cancelled"
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    appointment._id,
                                    "cancelled"
                                  )
                                }
                              >
                                {actionLoading === appointment._id + "cancelled"
                                  ? "Rejecting..."
                                  : "Reject"}
                              </Button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={
                                actionLoading === appointment._id + "completed"
                              }
                              onClick={() =>
                                handleStatusChange(appointment._id, "completed")
                              }
                            >
                              {actionLoading === appointment._id + "completed"
                                ? "Completing..."
                                : "Complete"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalAppointmentsPage;
