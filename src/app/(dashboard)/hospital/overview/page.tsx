"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Shield,
  User2,
} from "lucide-react";

interface HospitalStats {
  totalDoctors: number;
  verifiedDoctors: number;
  pendingDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  totalPatients: number;
  totalEarnings: number;
}

interface RecentAppointment {
  _id: string;
  user: {
    fullname: string;
    email: string;
  };
  doctor: {
    fullname: string;
    email: string;
    specialization: string;
  };
  date: string;
  time: string;
  status: string;
  type: string;
  paymentStatus: string;
}

interface DoctorInfo {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  verificationStatus: string;
}

const HospitalOverviewPage = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<HospitalStats>({
    totalDoctors: 0,
    verifiedDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    totalEarnings: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<
    RecentAppointment[]
  >([]);
  const [recentDoctors, setRecentDoctors] = useState<DoctorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitalData = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    setLoading(true);
    setError("");

    try {
      // Get hospital info first
      const resHospital = await fetch("/api/hospital/get-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      const dataHospital = await resHospital.json();
      if (
        !resHospital.ok ||
        !dataHospital.success ||
        !dataHospital.hospital?._id
      ) {
        setError("Failed to fetch hospital info");
        setLoading(false);
        return;
      }

      const hospitalId = dataHospital.hospital._id;

      // Get all doctors in this hospital
      const resDoctors = await fetch(
        `/api/hospital/doctor-list?hospitalId=${hospitalId}`
      );
      const dataDoctors = await resDoctors.json();

      if (!resDoctors.ok || !dataDoctors.success) {
        setError("Failed to fetch doctors");
        setLoading(false);
        return;
      }

      const doctors = dataDoctors.doctors || [];
      const doctorIds = doctors.map((doctor: any) => doctor._id);

      // Calculate doctor stats
      const verifiedDoctors = doctors.filter(
        (d: any) => d.verificationStatus === "verified"
      ).length;
      const pendingDoctors = doctors.filter(
        (d: any) => d.verificationStatus === "pending"
      ).length;

      // Get appointments for all doctors in this hospital
      const allAppointments: RecentAppointment[] = [];
      const uniquePatients = new Set();
      let totalEarnings = 0;

      for (const doctorId of doctorIds) {
        const resAppointments = await fetch("/api/appointment/doctor-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId }),
        });

        const dataAppointments = await resAppointments.json();
        if (resAppointments.ok && dataAppointments.success) {
          allAppointments.push(...dataAppointments.appointments);

          // Count unique patients and calculate earnings
          dataAppointments.appointments.forEach((apt: any) => {
            uniquePatients.add(apt.user?._id || apt.user);

            // Calculate earnings from completed appointments
            if (apt.status === "completed") {
              // Find the doctor's consultation fees
              const doctor = doctors.find((d: any) => d._id === doctorId);
              if (doctor && doctor.consultationFees) {
                totalEarnings += doctor.consultationFees;
              }
            }
          });
        }
      }

      // Calculate appointment stats
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = allAppointments.filter(
        (apt: any) => apt.date === today
      );
      const completedAppts = allAppointments.filter(
        (apt: any) => apt.status === "completed"
      );

      setStats({
        totalDoctors: doctors.length,
        verifiedDoctors,
        pendingDoctors,
        totalAppointments: allAppointments.length,
        todayAppointments: todayAppts.length,
        completedAppointments: completedAppts.length,
        totalPatients: uniquePatients.size,
        totalEarnings: totalEarnings,
      });

      // Get recent appointments (last 5)
      const recent = allAppointments
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, 5);

      setRecentAppointments(recent);

      // Get recent doctors (last 5)
      const recentDocs = doctors
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 5);

      setRecentDoctors(recentDocs);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, [session, status]);

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

  const statCards = [
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Verified Doctors",
      value: stats.verifiedDoctors,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Verification",
      value: stats.pendingDoctors,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Completed Appointments",
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: User2,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Total Earnings",
      value: `Rs.${stats.totalEarnings}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title={`Welcome to ${session?.user?.name}`}
        subtitle="Hospital overview and key metrics"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No recent appointments found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {appointment.user?.fullname ||
                            appointment.user?.email}
                        </span>
                        <span className="text-sm text-gray-500">
                          Dr. {appointment.doctor?.fullname} •{" "}
                          {appointment.date} at {appointment.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {appointment.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Recent Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDoctors.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No doctors found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Dr. {doctor.name}</span>
                        <span className="text-sm text-gray-500">
                          {doctor.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(
                          doctor.verificationStatus
                        )}`}
                      >
                        {doctor.verificationStatus}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalOverviewPage;
