"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoaderOne } from "@/components/ui/loader";
import Heading from "@/components/common/Heading";
import { Label } from "@/components/ui/label";
import {
  Select as ShadcnSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DatePicker from "@/components/common/DatePicker";
import { Input } from "@/components/ui/input";
// import FileUpload from "@/components/layouts/FileUpload";

const UserAppointmentsPage = () => {
  const { data: session, status } = useSession();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "in-person",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;
      setLoading(true);
      setError("");
      try {
        const resDoctors = await fetch("/api/doctor/doctor-list");
        const dataDoctors = await resDoctors.json();
        if (resDoctors.ok && dataDoctors.success) {
          setDoctors(dataDoctors.doctors || []);
        } else {
          setError(dataDoctors.error || "Failed to fetch doctors");
        }
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  if (status === "loading" || loading)
    return (
      <div className="dashboard-container flex items-center justify-center ">
        <LoaderOne />
      </div>
    );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/appointment/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session?.user?.email,
          doctorId: form.doctorId,
          date: form.date,
          time: form.time,
          type: form.type,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Appointment booked successfully");
        setForm({ ...form, date: "", time: "", notes: "" });
      } else {
        setError(data.error || "Failed to book appointment");
      }
    } catch {
      setError("Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Book Appointments"
        subtitle="Seamlessly Book appointments with doctor"
      />
      <div className="rounded-xl border border-zinc-400 dark:border-zinc-700 max-w-2xl p-10 mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block mb-1 font-medium">Doctor</Label>
            <ShadcnSelect
              value={form.doctorId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, doctorId: value }))
              }
            >
              <SelectTrigger className="w-full border px-3 py-2 rounded">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc: any) => (
                  <SelectItem key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization || "Doctor"})
                  </SelectItem>
                ))}
              </SelectContent>
            </ShadcnSelect>
          </div>
          <div>
            <DatePicker
              value={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
              label="Appointment Date"
              name="date"
              required
            />
          </div>
          <div>
            <Label className="block mb-1 font-medium">Time</Label>
            <Input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <Label className="block mb-1 font-medium">Appointment Type</Label>
            <ShadcnSelect
              value={form.type}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-full border px-3 py-2 rounded">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">In-person</SelectItem>
                <SelectItem value="telemedicine">Telemedicine</SelectItem>
              </SelectContent>
            </ShadcnSelect>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={saving}
          >
            {saving ? "Booking..." : "Book Appointment"}
          </button>
          {message && <div className="text-green-600 mt-2">{message}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default UserAppointmentsPage;
