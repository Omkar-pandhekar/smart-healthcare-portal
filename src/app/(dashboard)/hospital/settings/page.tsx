"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Image as ImageIcon,
  X,
  Save,
  Upload,
} from "lucide-react";

const HospitalSettings = () => {
  const { data: session, status } = useSession();

  interface HospitalForm {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      location: { coordinates: [number, number] };
    };
    images: string[];
  }

  const [form, setForm] = useState<HospitalForm>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      location: { coordinates: [0, 0] },
    },
    images: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchHospitalInfo = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/hospital/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.hospital) {
          setForm((prev) => ({
            ...prev,
            ...data.hospital,
            address: {
              ...prev.address,
              ...(data.hospital.address || {}),
            },
          }));
        } else {
          setError(data.error || "Failed to fetch hospital info");
        }
      } catch {
        setError("Failed to fetch hospital info");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalInfo();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name === "lat" || name === "lng") {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          location: {
            coordinates: [
              name === "lng"
                ? Number(value)
                : prev.address.location.coordinates[0],
              name === "lat"
                ? Number(value)
                : prev.address.location.coordinates[1],
            ],
          },
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (form.images && form.images.length >= 4) {
      setError("Maximum 4 images allowed");
      return;
    }
    const file = e.target.files[0];

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("hospitalImage", file);
    try {
      const res = await fetch("/api/hospital/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), data.url],
        }));
        setMessage("Image uploaded successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/hospital/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Hospital information updated successfully!");
        setTimeout(() => setMessage(""), 5000);
      } else {
        setError(data.error || "Failed to update hospital info");
      }
    } catch {
      setError("Failed to update hospital info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Hospital Settings"
        subtitle="Update your hospital information and images"
      />

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8 pt-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hospital Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter hospital name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                    placeholder="hospital@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://www.hospital.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  type="text"
                  name="address.street"
                  value={form.address.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    name="address.city"
                    value={form.address.city}
                    onChange={handleChange}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    name="address.state"
                    value={form.address.state}
                    onChange={handleChange}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    name="address.postalCode"
                    value={form.address.postalCode}
                    onChange={handleChange}
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  name="address.country"
                  value={form.address.country}
                  onChange={handleChange}
                  placeholder="United States"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hospital Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Hospital Images
                <span className="text-sm font-normal text-gray-500">
                  (Maximum 4 images)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={
                      uploading || (form.images && form.images.length >= 4)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      uploading || (form.images && form.images.length >= 4)
                    }
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
                </p>
              </div>

              {/* Image Preview */}
              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((img, idx) => (
                    <div key={img} className="relative group">
                      <img
                        src={img}
                        alt={`Hospital ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalSettings;
