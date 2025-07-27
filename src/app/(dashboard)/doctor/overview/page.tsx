"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
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
  date: string;
  time: string;
  status: string;
  type: string;
  paymentStatus: string;
}

const OverviewPage = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DoctorStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    totalEarnings: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<
    RecentAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctorStats = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    setLoading(true);
    setError("");

    try {
      // Get doctor info first
      const resDoctor = await fetch("/api/doctor/get-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      const dataDoctor = await resDoctor.json();
      if (!resDoctor.ok || !dataDoctor.success || !dataDoctor.doctor?._id) {
        setError("Failed to fetch doctor info");
        setLoading(false);
        return;
      }

      const doctorId = dataDoctor.doctor._id;

      // Get doctor appointments
      const resAppointments = await fetch("/api/appointment/doctor-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });

      const dataAppointments = await resAppointments.json();

      if (resAppointments.ok && dataAppointments.success) {
        const appointments = dataAppointments.appointments || [];

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const todayAppts = appointments.filter(
          (apt: any) => apt.date === today
        );
        const pendingAppts = appointments.filter(
          (apt: any) => apt.status === "booked"
        );
        const completedAppts = appointments.filter(
          (apt: any) => apt.status === "completed"
        );

        // Get unique patients
        const uniquePatients = new Set(
          appointments.map((apt: any) => apt.user?._id || apt.user)
        );

        // Calculate earnings (assuming $50 per completed appointment)
        const earnings = completedAppts.length * 50;

        setStats({
          totalAppointments: appointments.length,
          todayAppointments: todayAppts.length,
          pendingAppointments: pendingAppts.length,
          completedAppointments: completedAppts.length,
          totalPatients: uniquePatients.size,
          totalEarnings: earnings,
        });

        // Get recent appointments (last 5)
        const recent = appointments
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        setRecentAppointments(recent);
      } else {
        setError("Failed to fetch appointments");
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorStats();
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
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Completed Appointments",
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Total Earnings",
      value: `$${stats.totalEarnings}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

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

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title={`Hello Dr. ${session?.user?.name}`}
        subtitle="Overview of your practice and appointments"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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

      {/* Recent Appointments */}
      <div className="mt-8">
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          appointment.paymentStatus
                        )}`}
                      >
                        {appointment.paymentStatus || "unpaid"}
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
      </div>
    </div>
  );
};

export default OverviewPage;
