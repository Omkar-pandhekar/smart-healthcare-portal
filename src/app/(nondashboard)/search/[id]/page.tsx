"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ImagesSlider } from "@/components/ui/images-slider";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  User2,
  Stethoscope,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/common/DatePicker";

const DynamicMap = dynamic(() => import("../Map"), { ssr: false });

interface Hospital {
  _id?: string;
  name?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    location?: { coordinates?: [number, number] };
  };
  phone?: string;
  email?: string;
  website?: string;
  images?: string[];
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience?: number;
  profileImage?: string;
}

const HospitalDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch("/api/hospital/get-hospital-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.hospital) {
          setHospital(data.hospital);
        } else {
          setError(data.error || "Failed to fetch hospital info");
        }
      })
      .catch(() => setError("Failed to fetch hospital info"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/hospital/doctor-list?hospitalId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        }
      });
  }, [id]);

  const address = [
    hospital?.address?.street,
    hospital?.address?.city,
    hospital?.address?.state,
    hospital?.address?.country,
    hospital?.address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const coordinates = hospital?.address?.location?.coordinates;
  const gmapsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`
    : undefined;

  const handleBookClick = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setDialogOpen(true);
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setSuccessMsg("");
    // Simple validation
    if (
      !selectedDoctor ||
      !appointmentDate ||
      !appointmentTime ||
      !patientName ||
      !patientEmail
    ) {
      setFormError("Please fill all fields.");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/appointment/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          date: appointmentDate,
          time: appointmentTime,
          patientName,
          patientEmail,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Appointment booked successfully!");
        setDialogOpen(false);
        setAppointmentDate("");
        setAppointmentTime("");
        setPatientName("");
        setPatientEmail("");
      } else {
        setFormError(data.error || "Failed to book appointment");
      }
    } catch {
      setFormError("Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <>Loading...</>;
  if (error) return <div>{error}</div>;
  if (!hospital) return <div>No hospital found.</div>;

  return (
    <div className="w-full min-h-screen pt-20 pb-20">
      {/* Images Carousel */}
      {hospital.images && hospital.images.length > 0 ? (
        <div className="w-full relative h-[600px]">
          <ImagesSlider images={hospital.images}>
            <div className="absolute left-0 right-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent z-50">
              <h2 className="text-3xl font-bold text-white mb-1 drop-shadow">
                {hospital.name}
              </h2>
              <div className="flex items-center gap-2 text-gray-200 text-base">
                <MapPin className="w-5 h-5" />
                <span>{address}</span>
              </div>
            </div>
          </ImagesSlider>
        </div>
      ) : (
        <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
          <span className="text-gray-400">No images available</span>
        </div>
      )}

      {/* Address & Contact Cards Side by Side */}
      <div className="max-w-6xl mx-auto mt-24 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Address Card (2.5/4) */}
          <div className="col-span-1 md:col-span-2 md:col-start-1 md:col-end-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Address
            </h2>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>{address}</span>
            </div>
            {coordinates && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span>Coordinates:</span>
                <span>[{coordinates.join(", ")}]</span>
              </div>
            )}
          </div>
          {/* Contact Card (1.5/4) */}
          <div className="col-span-1 md:col-span-1 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Contact
            </h2>
            {hospital.phone && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span>{hospital.phone}</span>
              </div>
            )}
            {hospital.email && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{hospital.email}</span>
              </div>
            )}
            {hospital.website && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Globe className="w-4 h-4" />
                <a
                  href={hospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {hospital.website}
                </a>
              </div>
            )}
            {coordinates && (
              <Button
                className="mt-2"
                onClick={() => window.open(gmapsUrl, "_blank")}
              >
                Get Directions
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-6xl mx-auto mt-10">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Doctors at this Hospital
        </h3>
        {doctors.length === 0 ? (
          <div className="text-gray-500">
            No doctors found for this hospital.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User2 className="w-10 h-10 text-blue-500" />
                  )}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    Dr. {doctor.name}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>{doctor.specialization}</span>
                  </div>
                  {doctor.experience !== undefined && (
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{doctor.experience} yrs experience</span>
                    </div>
                  )}
                </div>
                <Dialog
                  open={dialogOpen && selectedDoctor === doctor._id}
                  onOpenChange={setDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
                      onClick={() => handleBookClick(doctor._id)}
                    >
                      Book Appointment <ArrowRight className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Book Appointment with Dr. {doctor.name}
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleAppointmentSubmit}
                      className="space-y-4 mt-2"
                    >
                      <Input
                        type="text"
                        placeholder="Your Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        required
                      />
                      <DatePicker
                        value={appointmentDate}
                        onChange={setAppointmentDate}
                        label="Date"
                        required
                      />
                      <Input
                        type="time"
                        placeholder="Time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        required
                      />
                      {formError && (
                        <div className="text-red-600 text-sm">{formError}</div>
                      )}
                      <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Booking..." : "Book"}
                        </Button>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Small Map at the Bottom */}
      {/* {coordinates && (
        <div className="max-w-6xl mx-auto mt-12 mb-8">
          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Location
          </h4>
          <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-64">
            <DynamicMap center={[coordinates[0], coordinates[1]]} />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default HospitalDetailPage;
