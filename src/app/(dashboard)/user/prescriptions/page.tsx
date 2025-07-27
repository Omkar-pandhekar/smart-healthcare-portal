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
  Calendar,
  User,
  Stethoscope,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const UserPrescriptionsPage = () => {
  const { data: session, status } = useSession();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<
    Prescription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showViewer, setShowViewer] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchPrescriptions = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    setLoading(true);
    setError("");

    try {
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
          prescription.doctorId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          prescription.doctorId.specialization
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

    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleView = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowViewer(true);
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
        title="My Prescriptions"
        subtitle="View and manage your prescriptions"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search doctors or specializations..."
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

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No prescriptions found
              </h3>
              <p className="text-gray-500">
                You don't have any prescriptions yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prescribed On</TableHead>
              <TableHead>Medications</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrescriptions.map((prescription) => (
              <TableRow
                key={prescription._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium">
                  Dr. {prescription.doctorId.name}
                </TableCell>
                <TableCell>{prescription.doctorId.specialization}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(prescription.status)}
                  >
                    {prescription.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {formatDate(prescription.createdAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {prescription.medications.length} medication
                      {prescription.medications.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {prescription.followUpDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600 font-medium">
                        {formatDate(prescription.followUpDate)}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(prescription)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Prescription Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionViewer
              prescription={selectedPrescription}
              showActions={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPrescriptionsPage;
