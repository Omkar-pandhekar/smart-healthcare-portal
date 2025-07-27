"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select as ShadcnSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  SPECIALIZATIONS,
  QUALIFICATIONS,
  GENDERS,
} from "@/components/constants/data";

const DoctorSettings = () => {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    qualifications: "",
    experience: 0,
    languages: "",
    gender: "",
    profileImage: "",
    consultationFees: 0,
    hospital: "",
    verificationStatus: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hospitals, setHospitals] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/doctor/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.doctor) {
          setForm({
            name: data.doctor.name || "",
            email: data.doctor.email || "",
            specialization: data.doctor.specialization || "",
            qualifications: data.doctor.qualifications || "",
            experience: data.doctor.experience || 0,
            languages: (data.doctor.languages || []).join(", "),
            gender: data.doctor.gender || "",
            profileImage: data.doctor.profileImage || "",
            consultationFees: data.doctor.consultationFees || 0,
            hospital: data.doctor.hospital || "",
            verificationStatus: data.doctor.verificationStatus || "",
          });
        } else {
          setError(data.error || "Failed to fetch doctor info");
        }
      } catch {
        setError("Failed to fetch doctor info");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorInfo();
  }, [session, status]);

  useEffect(() => {
    // Fetch hospitals for dropdown
    const fetchHospitals = async () => {
      try {
        const res = await fetch("/api/hospital/get-list");
        const data = await res.json();
        if (res.ok && data.success) {
          setHospitals(data.hospitals);
        }
      } catch {}
    };
    fetchHospitals();
  }, []);
  console.log(hospitals);
  if (status === "loading" || loading) return <>Loading...</>;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "experience" || name === "consultationFees"
          ? Number(value)
          : value,
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const res = await fetch("/api/doctor/upload-profile-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setForm((prev) => ({ ...prev, profileImage: data.url }));
        setMessage("Profile image uploaded successfully");
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/doctor/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          languages: form.languages.split(",").map((l) => l.trim()),
          verificationStatus: form.verificationStatus || "pending",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Profile updated successfully");
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6  rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Doctor Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/2">
            <Label className="block mb-1 font-medium">Name</Label>
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="w-1/2">
            <Label className="block mb-1 font-medium">Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full border px-3 py-2 rounded cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <Label className="block mb-1 font-medium">Specialization</Label>
          <ShadcnSelect
            value={form.specialization}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, specialization: value }))
            }
          >
            <SelectTrigger className="w-full border px-3 py-2 rounded">
              <SelectValue placeholder="Select Specialization" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>
        <div>
          <Label className="block mb-1 font-medium">Qualifications</Label>
          <ShadcnSelect
            value={form.qualifications}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, qualifications: value }))
            }
          >
            <SelectTrigger className="w-full border px-3 py-2 rounded">
              <SelectValue placeholder="Select Qualification" />
            </SelectTrigger>
            <SelectContent>
              {QUALIFICATIONS.map((qual) => (
                <SelectItem key={qual} value={qual}>
                  {qual}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>
        <div className="flex gap-4">
          <div className="w-1/4">
            <Label className="block mb-1 font-medium">Experience (years)</Label>
            <Input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              min={0}
            />
          </div>
          <div className="w-full">
            <Label className="block mb-1 font-medium">
              Languages (comma separated)
            </Label>
            <Input
              type="text"
              name="languages"
              value={form.languages}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div>
          <Label className="block mb-1 font-medium">Gender</Label>
          <ShadcnSelect
            value={form.gender}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, gender: value }))
            }
          >
            <SelectTrigger className="w-full border px-3 py-2 rounded">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>
        <div>
          <Label className="block mb-1 font-medium">Profile Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border px-3 py-2 rounded"
            disabled={uploading}
          />
          {form.profileImage && (
            <img
              src={form.profileImage}
              alt="Profile Preview"
              className="mt-2 rounded h-24 w-24 object-cover border"
            />
          )}
        </div>
        <div>
          <Label className="block mb-1 font-medium">Consultation Fees</Label>
          <Input
            type="number"
            name="consultationFees"
            value={form.consultationFees}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min={0}
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Hospital</Label>
          <ShadcnSelect
            value={form.hospital}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, hospital: value }))
            }
          >
            <SelectTrigger className="w-full border px-3 py-2 rounded">
              <SelectValue placeholder="Select Hospital" />
            </SelectTrigger>
            <SelectContent>
              {hospitals.map((h) => (
                <SelectItem key={h._id} value={h._id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>
        <div>
          <Label className="block mb-1 font-medium">Verification Status</Label>
          <Input
            type="text"
            value={form.verificationStatus || "Not Applied"}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : form.verificationStatus === "verified"
            ? "Update"
            : "Save & Apply for Verification"}
        </button>
        {message && <div className="text-green-600 mt-2">{message}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default DoctorSettings;
