"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select as ShadcnSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GENDERS } from "@/components/constants/data";

const UserSettings = () => {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    username: "",
    gender: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/user/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setForm({
            fullname: data.user.fullname || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            username: data.user.username || "",
            gender: data.user.gender || "",
            profileImage: data.user.profileImage || "",
          });
        } else {
          setError(data.error || "Failed to fetch user info");
        }
      } catch {
        setError("Failed to fetch user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
    // Only run when session is ready
  }, [session, status]);

  if (status === "loading" || loading) return <>Loading...</>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/user/upload-profile-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.imageUrl) {
        setForm((prev) => ({ ...prev, profileImage: data.imageUrl }));
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
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullname: form.fullname,
          phone: form.phone,
          username: form.username,
          gender: form.gender,
          profileImage: form.profileImage,
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
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Edit Profile"
        subtitle="Update your profile information"
      />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <Label className="block mb-1 font-medium">Full Name</Label>
          <Input
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Phone</Label>
          <Input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Username</Label>
          <Input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
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
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        {message && <div className="text-green-600 mt-2">{message}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default UserSettings;
