"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Stethoscope, Pill } from "lucide-react";

interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Prescription {
  _id: string;
  patientId:
    | {
        fullname: string;
        email: string;
      }
    | string;
  doctorId:
    | {
        name: string;
        email: string;
        specialization: string;
      }
    | string;
  appointmentId: string;
  status: "Active" | "Completed" | "Cancelled";
  notes?: string;
  followUpDate?: string;
  medications: IMedication[];
  createdAt: string;
  updatedAt: string;
}

interface PrescriptionViewerProps {
  prescription: Prescription;
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({
  prescription,
}) => {
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
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescription</h2>
          <p className="text-gray-600">
            Prescribed on {formatDate(prescription.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(prescription.status)}>
            {prescription.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span>
              <span className="ml-2">
                {typeof prescription.patientId === "object"
                  ? prescription.patientId.fullname
                  : "Patient ID: " + prescription.patientId}
              </span>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <span className="ml-2">
                {typeof prescription.patientId === "object"
                  ? prescription.patientId.email
                  : "Not available"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5" />
              Prescribed By
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Doctor:</span>
              <span className="ml-2">
                {typeof prescription.doctorId === "object"
                  ? `Dr. ${prescription.doctorId.name}`
                  : "Doctor ID: " + prescription.doctorId}
              </span>
            </div>
            <div>
              <span className="font-medium">Specialization:</span>
              <span className="ml-2">
                {typeof prescription.doctorId === "object"
                  ? prescription.doctorId.specialization
                  : "Not available"}
              </span>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <span className="ml-2">
                {typeof prescription.doctorId === "object"
                  ? prescription.doctorId.email
                  : "Not available"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2">{formatDate(prescription.createdAt)}</span>
            </div>
            {prescription.followUpDate && (
              <div>
                <span className="font-medium">Follow-up Date:</span>
                <span className="ml-2">
                  {formatDate(prescription.followUpDate)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="w-5 h-5" />
            Medications ({prescription.medications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescription.medications.map((medication, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">
                    {index + 1}. {medication.name}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Dosage:</span>{" "}
                    {medication.dosage}
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span>{" "}
                    {medication.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    {medication.duration}
                  </div>
                </div>
                {medication.notes && (
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Notes:</span>{" "}
                    {medication.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor's Notes */}
      {prescription.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5" />
              Doctor's Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {prescription.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionViewer;
