"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/common/Heading";
import { useSession } from "next-auth/react";
import {
  User2,
  Mail,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Trash2,
  RefreshCw,
  Users,
} from "lucide-react";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  verificationStatus: string;
  phone?: string;
  qualifications?: string;
  gender?: string;
}

const HospitalDoctorsPage = () => {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    // First, fetch hospital info to get the _id
    const fetchHospitalInfo = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch("/api/hospital/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.hospital && data.hospital._id) {
          setHospitalId(data.hospital._id);
        } else {
          setError(data.error || "Failed to fetch hospital info");
        }
      } catch {
        setError("Failed to fetch hospital info");
      }
    };
    fetchHospitalInfo();
  }, [session]);

  useEffect(() => {
    if (!hospitalId) return;
    const fetchDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/hospital/doctor-list?hospitalId=${hospitalId}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setDoctors(data.doctors);
        } else {
          setError(data.error || "Failed to fetch doctors");
        }
      } catch {
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [hospitalId]);

  const handleVerify = async (doctorId: string) => {
    setActionLoading(doctorId + "verify");
    try {
      const res = await fetch(`/api/hospital/verify-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc._id === doctorId
              ? { ...doc, verificationStatus: "verified" }
              : doc
          )
        );
      } else {
        setError(data.error || "Failed to verify doctor");
      }
    } catch {
      setError("Failed to verify doctor");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (doctorId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this doctor from your hospital?"
      )
    )
      return;
    setActionLoading(doctorId + "delete");
    try {
      const res = await fetch(`/api/hospital/delete-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      } else {
        setError(data.error || "Failed to remove doctor");
      }
    } catch {
      setError("Failed to remove doctor");
    } finally {
      setActionLoading("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getSpecializationBadge = (specialization: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        <Stethoscope className="w-3 h-3 mr-1" />
        {specialization}
      </Badge>
    );
  };

  if (loading) {
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
        title="Hospital Doctors"
        subtitle="Manage doctors in your hospital"
      />

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Doctors
                </p>
                <p className="text-2xl font-bold">{doctors.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    doctors.filter((d) => d.verificationStatus === "verified")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    doctors.filter((d) => d.verificationStatus === "pending")
                      .length
                  }
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    doctors.filter((d) => d.verificationStatus === "rejected")
                      .length
                  }
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Doctors Management
            </span>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
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
          {doctors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No doctors found in your hospital.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow
                      key={doctor._id}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Dr. {doctor.name}</p>
                            {doctor.qualifications && (
                              <p className="text-sm text-gray-500">
                                {doctor.qualifications}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{doctor.email}</span>
                          </div>
                          {doctor.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {doctor.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSpecializationBadge(doctor.specialization)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(doctor.verificationStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {doctor.verificationStatus !== "verified" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === doctor._id + "verify"}
                              onClick={() => handleVerify(doctor._id)}
                            >
                              {actionLoading === doctor._id + "verify"
                                ? "Verifying..."
                                : "Verify"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            disabled={actionLoading === doctor._id + "delete"}
                            onClick={() => handleDelete(doctor._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {actionLoading === doctor._id + "delete"
                              ? "Removing..."
                              : "Remove"}
                          </Button>
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

export default HospitalDoctorsPage;
