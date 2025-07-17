"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Home, Building, 
  MessageCircle, Eye, DollarSign, Clock, CheckCircle,
  AlertCircle, Filter, Calendar, Download, RotateCcw
} from 'lucide-react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

// Type for StatCard props
interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
  trend: number;
}

const StatCard = ({ title, value, change, icon: Icon, color, trend }: StatCardProps) => (
  <div className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 md:gap-4 flex-row-reverse">
        <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-r ${color}`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(change)}%</span>
      </div>
    </div>
  </div>
);

// Type for ActivityIcon props
interface ActivityIconProps {
  type: 'user' | 'property' | 'agency' | 'testimonial' | string;
}

const ActivityIcon = ({ type }: ActivityIconProps) => {
  const icons: Record<string, JSX.Element> = {
    user: <Users className="h-4 w-4" />,
    property: <Home className="h-4 w-4" />,
    agency: <Building className="h-4 w-4" />,
    testimonial: <MessageCircle className="h-4 w-4" />
  };
  return icons[type] || <Clock className="h-4 w-4" />;
};

// Type for StatusBadge props
interface StatusBadgeProps {
  status: 'success' | 'pending' | 'approved' | string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors: Record<string, string> = {
    success: 'bg-green-100 text-green-600',
    pending: 'bg-yellow-100 text-yellow-600',
    approved: 'bg-blue-100 text-blue-600'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || ''}`}>
      {status === 'success' ? 'نجح' : status === 'pending' ? 'معلق' : 'مقبول'}
    </span>
  );
};

// Pie label typing
const pieLabel = ({ name, percent }: { name: string; percent?: number }) =>
  `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const Bearer = process.env.TOKEN_PREFIX;
const ANALYTICS_URL = `${API_URL}/admin/analytics`;

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Authentication required');
      const res = await fetch(ANALYTICS_URL, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer${token}`,
        },
      });
      if (!res.ok) throw new Error('فشل تحميل بيانات التحليلات');
      const data = await res.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل بيانات التحليلات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Fallbacks for charts if no data
  const userGrowthData: any[] = [];
  const propertyTypesData = [
    { name: 'بيع', value: 0, color: '#3B82F6' },
    { name: 'إيجار', value: 0, color: '#10B981' },
    { name: 'سكن طلبة', value: 0, color: '#F59E0B' }
  ];
  const dailyStatsData = [];

  // Prepare stats and recent activity from real data
  const stats = dashboardData ? {
    totalUsers: dashboardData.userCount,
    totalProperties: dashboardData.propertyCount,
    totalAgencies: dashboardData.agencyCount,
    totalTestimonials: dashboardData.testimonialCount,
  } : {
    totalUsers: 0,
    totalProperties: 0,
    totalAgencies: 0,
    totalTestimonials: 0,
  };

  // Prepare recent activities with ISO timestamp for sorting and displayTime for UI
  const recentActivities = dashboardData ? [
    ...(dashboardData.recentUsers || []).map((u: any) => ({
      id: u._id,
      type: 'user',
      action: 'تسجيل مستخدم جديد',
      name: u.userName || u.email,
      displayTime: new Date(u.createdAt).toLocaleString('ar-EG'),
      timestamp: new Date(u.createdAt).getTime(),
      status: 'success',
    })),
    ...(dashboardData.recentProperties || []).map((p: any) => ({
      id: p._id,
      type: 'property',
      action: 'إضافة عقار جديد',
      name: p.title,
      displayTime: new Date(p.createdAt).toLocaleString('ar-EG'),
      timestamp: new Date(p.createdAt).getTime(),
      status: p.isApproved ? 'approved' : 'pending',
    })),
    ...(dashboardData.recentAgencies || []).map((a: any) => ({
      id: a._id,
      type: 'agency',
      action: 'تسجيل وكالة جديدة',
      name: a.name,
      displayTime: new Date(a.createdAt).toLocaleString('ar-EG'),
      timestamp: new Date(a.createdAt).getTime(),
      status: 'success',
    })),
    ...(dashboardData.recentTestimonials || []).map((t: any) => ({
      id: t._id,
      type: 'testimonial',
      action: 'شهادة جديدة',
      name: t.name,
      displayTime: new Date(t.createdAt).toLocaleString('ar-EG'),
      timestamp: new Date(t.createdAt).getTime(),
      status: 'success',
    })),
  ].slice(0, 5) : [];

  let sortedActivities = [...recentActivities];
  sortedActivities.sort((a, b) => {
    return sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-base md:text-lg font-medium text-gray-700">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-base md:text-lg font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between justify-center mb-4 md:mb-6 gap-3 md:gap-6">
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-row-reverse">
              <button
                className="flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={fetchAnalytics}
                disabled={isLoading}
                aria-label="تحديث البيانات"
              >
                {isLoading ? (
                  <CircularProgress size={20} className="text-white" />
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    <span>تحديث</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">لوحة تحكم المشرف</h1>
              <p className="text-sm md:text-base text-gray-600">نظرة شاملة على أداء الموقع والتحليلات</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            change={0}
            icon={Users}
            color="from-blue-500 to-blue-600"
            trend={1}
          />
          <StatCard
            title="إجمالي العقارات"
            value={stats.totalProperties}
            change={0}
            icon={Home}
            color="from-green-500 to-green-600"
            trend={1}
          />
          <StatCard
            title="الوكالات النشطة"
            value={stats.totalAgencies}
            change={0}
            icon={Building}
            color="from-purple-500 to-purple-600"
            trend={1}
          />
          <StatCard
            title="إجمالي الشهادات"
            value={stats.totalTestimonials}
            change={0}
            icon={MessageCircle}
            color="from-orange-500 to-orange-600"
            trend={1}
          />
        </div>

        {/* Charts Section (keep as placeholder for now) */}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl md:rounded-3xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">النشاط الأخير</h3>
            <div className="flex gap-2 items-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">المستخدم </h3>
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            {sortedActivities.map((activity) => {
              // تقسيم الوقت والتاريخ
              let date = '', time = '';
              if (activity.displayTime) {
                const parts = activity.displayTime.split(/\s+/);
                date = parts[0] || '';
                time = parts[1] || '';
              }
              return (
                <div key={activity.id} className="flex items-center gap-3 md:gap-4 flex-row-reverse p-3 md:p-4 hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{activity.name}</p>
                      </div>
                      <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                        <div className="flex flex-row sm:flex-col gap-1 sm:gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                            <CalendarTodayIcon style={{ fontSize: 12 }} />
                            <span className="hidden sm:inline">{date}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                            <AccessTimeIcon style={{ fontSize: 12 }} />
                            <span className="hidden sm:inline">{time}</span>
                          </span>
                        </div>
                        <StatusBadge status={activity.status} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;