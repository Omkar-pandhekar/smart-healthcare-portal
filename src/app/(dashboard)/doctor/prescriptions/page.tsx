"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Filter,
  RefreshCw,
  User,
  Pill,
  Calendar,
  Eye,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrescriptionEditor from "@/components/prescriptions/PrescriptionEditor";
import PrescriptionViewer from "@/components/prescriptions/PrescriptionViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Prescription {
  _id: string;
  patientId: {
    fullname: string;
    email: string;
  };
  doctorId: {
    name: string;
    email: string;
    specialization: string;
  };
  appointmentId: string;
  status: "Active" | "Completed" | "Cancelled";
  notes?: string;
  followUpDate?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const DoctorPrescriptionsPage = () => {
  const { data: session, status } = useSession();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<
    Prescription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [editingPrescription, setEditingPrescription] =
    useState<Prescription | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [appointmentIdFilter, setAppointmentIdFilter] = useState<string>("");

  const fetchPrescriptions = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    setLoading(true);
    setError("");

    try {
      // Check if we have an appointmentId in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const appointmentId = urlParams.get("appointmentId");
      if (appointmentId) {
        setAppointmentIdFilter(appointmentId);
      }

      const response = await fetch("/api/prescriptions");
      const data = await response.json();

      if (data.success) {
        setPrescriptions(data.prescriptions);
        setFilteredPrescriptions(data.prescriptions);
      } else {
        setError(data.error || "Failed to fetch prescriptions");
      }
    } catch (error) {
      setError("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [session, status]);

  // Apply filters
  useEffect(() => {
    let filtered = prescriptions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (prescription) =>
          prescription.patientId.fullname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          prescription.patientId.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (prescription) => prescription.status === statusFilter
      );
    }

    // Appointment ID filter
    if (appointmentIdFilter) {
      filtered = filtered.filter(
        (prescription) => prescription.appointmentId === appointmentIdFilter
      );
    }

    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, statusFilter, appointmentIdFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { color: "bg-green-100 text-green-700" },
      Completed: { color: "bg-blue-100 text-blue-700" },
      Cancelled: { color: "bg-red-100 text-red-700" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;

    return <Badge className={config.color}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowEditor(true);
  };

  const handleView = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowViewer(true);
  };

  const handleSave = (prescription: Prescription) => {
    setShowEditor(false);
    setEditingPrescription(null);
    fetchPrescriptions(); // Refresh the list
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
      <Heading title="Prescriptions" subtitle="Manage patient prescriptions" />

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                onClick={fetchPrescriptions}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          {filteredPrescriptions.length} Prescription
          {filteredPrescriptions.length !== 1 ? "s" : ""} Found
        </h3>
      </div>

      {/* Prescriptions Table */}
      {filteredPrescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No prescriptions found
              </h3>
              <p className="text-gray-500">
                No prescriptions match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Follow-up Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {prescription.patientId.fullname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prescription.patientId.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Pill className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        {prescription.medications.length} medication
                        {prescription.medications.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                  <TableCell>
                    {prescription.followUpDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span className="text-sm">
                          {formatDate(prescription.followUpDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(prescription.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(prescription)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(prescription)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Prescription Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrescription
                ? "Edit Prescription"
                : "Create New Prescription"}
            </DialogTitle>
          </DialogHeader>
          <PrescriptionEditor
            initialData={editingPrescription || undefined}
            onSave={handleSave}
            onCancel={() => {
              setShowEditor(false);
              setEditingPrescription(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Prescription Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
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
};

export default DoctorPrescriptionsPage;
