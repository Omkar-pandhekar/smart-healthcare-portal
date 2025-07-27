"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface PrescriptionData {
  patientId: string;
  appointmentId: string;
  notes?: string;
  followUpDate?: string;
  medications: Medication[];
  status?: "Active" | "Completed" | "Cancelled";
}

interface PrescriptionEditorProps {
  initialData?: PrescriptionData & { _id: string };
  patientId?: string;
  appointmentId?: string;
  onSave?: (prescription: any) => void;
  onCancel?: () => void;
}

const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({
  initialData,
  patientId,
  appointmentId,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PrescriptionData>({
    patientId: patientId || "",
    appointmentId: appointmentId || "",
    notes: "",
    followUpDate: "",
    medications: [],
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        patientId: initialData.patientId,
        appointmentId: initialData.appointmentId,
        notes: initialData.notes || "",
        followUpDate: initialData.followUpDate
          ? new Date(initialData.followUpDate).toISOString().split("T")[0]
          : "",
        medications: initialData.medications || [],
        status: initialData.status || "Active",
      });
    } else if (patientId || appointmentId) {
      setFormData((prev) => ({
        ...prev,
        patientId: patientId || prev.patientId,
        appointmentId: appointmentId || prev.appointmentId,
      }));
    }
    fetchPatients();
  }, [initialData, patientId, appointmentId]);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/user/list");
      const data = await response.json();
      if (data.success) {
        setPatients(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          notes: "",
        },
      ],
    }));
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      toast.error("Please select a patient");
      return;
    }

    if (!formData.appointmentId) {
      toast.error("Appointment ID is required");
      return;
    }

    if (formData.medications.length === 0) {
      toast.error("Please add at least one medication");
      return;
    }

    // Validate medications
    for (const med of formData.medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        toast.error("Please fill all required medication fields");
        return;
      }
    }

    setLoading(true);

    try {
      const url = isEditMode
        ? `/api/prescriptions/${initialData._id}`
        : "/api/prescriptions";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          isEditMode
            ? "Prescription updated successfully!"
            : "Prescription created successfully!"
        );
        onSave?.(data.prescription);
      } else {
        toast.error(data.error || "Failed to save prescription");
      }
    } catch (error) {
      console.error("Save prescription error:", error);
      toast.error("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {isEditMode ? "Edit Prescription" : "Create New Prescription"}
          </span>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection - Only show if not provided from appointment */}
          {!patientId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, patientId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.fullname} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "Active" | "Completed" | "Cancelled"
                  ) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Show patient info if provided from appointment */}
          {patientId && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Patient:</span>{" "}
                {patients.find((p) => p._id === patientId)?.fullname ||
                  "Loading..."}
              </p>
            </div>
          )}

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label htmlFor="followUpDate">Follow-up Date</Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  followUpDate: e.target.value,
                }))
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Medications</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedication}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            {formData.medications.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                No medications added yet. Click "Add Medication" to get started.
              </div>
            )}

            {formData.medications.map((medication, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Medication {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMedication(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medication Name *</Label>
                    <Input
                      value={medication.name}
                      onChange={(e) =>
                        updateMedication(index, "name", e.target.value)
                      }
                      placeholder="e.g., Paracetamol"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <Input
                      value={medication.dosage}
                      onChange={(e) =>
                        updateMedication(index, "dosage", e.target.value)
                      }
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Frequency *</Label>
                    <Input
                      value={medication.frequency}
                      onChange={(e) =>
                        updateMedication(index, "frequency", e.target.value)
                      }
                      placeholder="e.g., Twice a day"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input
                      value={medication.duration}
                      onChange={(e) =>
                        updateMedication(index, "duration", e.target.value)
                      }
                      placeholder="e.g., For 7 days"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Input
                      value={medication.notes || ""}
                      onChange={(e) =>
                        updateMedication(index, "notes", e.target.value)
                      }
                      placeholder="e.g., Take after food"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Prescription"
                : "Save Prescription"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionEditor;
