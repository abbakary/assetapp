"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Calendar,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockStatusCounts,
  conditionTrendData,
  remainingLifeData,
  mockInterventions,
} from "@/lib/mock-data";

const statusColors = {
  planned: "#3b82f6",
  active: "#10b981",
  underMaintenance: "#f59e0b",
  decommissioned: "#ea580c",
  disposed: "#dc2626",
};

const conditionColors = {
  excellent: "#10b981",
  good: "#3b82f6",
  fair: "#f59e0b",
  poor: "#dc2626",
};

const interventionStatusColors = {
  completed: "bg-emerald-500",
  "in-progress": "bg-blue-500",
  scheduled: "bg-amber-500",
  overdue: "bg-red-500",
};

const interventionStatusLabels = {
  completed: "Completed",
  "in-progress": "In Progress",
  scheduled: "Scheduled",
  overdue: "Overdue",
};

export function LifecycleTrackingDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const statusData = [
    { name: "Planned", value: mockStatusCounts.planned, color: statusColors.planned },
    { name: "Active", value: mockStatusCounts.active, color: statusColors.active },
    { name: "Under Maintenance", value: mockStatusCounts.underMaintenance, color: statusColors.underMaintenance },
    { name: "Decommissioned", value: mockStatusCounts.decommissioned, color: statusColors.decommissioned },
    { name: "Disposed", value: mockStatusCounts.disposed, color: statusColors.disposed },
  ];

  const totalAssets = Object.values(mockStatusCounts).reduce((a, b) => a + b, 0);
  const avgRemainingLife = 7.5;
  const conditionIndex = 78;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Lifecycle Tracking Dashboard</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
            <Calendar className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {statusData.map((status) => (
          <button
            key={status.name}
            onClick={() => setSelectedStatus(selectedStatus === status.name ? null : status.name)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedStatus === status.name
                ? "ring-2 ring-offset-2 ring-offset-background"
                : "hover:opacity-80"
            )}
            style={{
              backgroundColor: status.color,
              color: "white",
              ...(selectedStatus === status.name && { boxShadow: `0 0 0 2px ${status.color}` }),
            }}
          >
            <span>{status.name}:</span>
            <span className="font-bold">{status.value}</span>
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Condition Index</p>
              <p className="text-3xl font-bold text-primary">{conditionIndex}</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-secondary"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${(conditionIndex / 100) * 176} 176`}
                  className="text-emerald-500"
                />
              </svg>
              <Activity className="absolute inset-0 m-auto h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Useful Life</p>
              <p className="text-3xl font-bold">
                <span className="text-foreground">{avgRemainingLife}</span>
                <span className="text-lg text-muted-foreground ml-1">Years Avg</span>
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500 text-white mt-1">
                Active
              </span>
            </div>
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Condition Trend */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-semibold">Condition Trend</h3>
          </div>
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conditionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="excellent"
                  stroke={conditionColors.excellent}
                  strokeWidth={2}
                  dot={{ fill: conditionColors.excellent, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="good"
                  stroke={conditionColors.good}
                  strokeWidth={2}
                  dot={{ fill: conditionColors.good, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fair"
                  stroke={conditionColors.fair}
                  strokeWidth={2}
                  dot={{ fill: conditionColors.fair, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="poor"
                  stroke={conditionColors.poor}
                  strokeWidth={2}
                  dot={{ fill: conditionColors.poor, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Remaining Useful Life */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-semibold">Remaining Useful Life Distribution</h3>
          </div>
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={remainingLifeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {remainingLifeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#dc2626"
                          : index === 1
                          ? "#f59e0b"
                          : index === 2
                          ? "#3b82f6"
                          : index === 3
                          ? "#10b981"
                          : "#8b5cf6"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Overview and Intervention Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Asset Status Overview */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-semibold">Asset Status Overview</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {statusData.map((status) => (
                  <div key={status.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.name}</span>
                    </div>
                    <span className="font-medium">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Intervention Log */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
            <h3 className="font-semibold">Intervention Log</h3>
            <div className="flex items-center gap-2">
              <select className="bg-secondary px-2 py-1 rounded text-sm">
                <option>All Types</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {mockInterventions.map((intervention) => (
              <div key={intervention.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{intervention.action}</p>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium text-white",
                      interventionStatusColors[intervention.status]
                    )}
                  >
                    {interventionStatusLabels[intervention.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{intervention.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {intervention.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-red-900/40 to-red-800/20 rounded-lg border border-red-500/30 p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-400">ALERT - Intervention Required</h4>
            <p className="text-sm text-muted-foreground mt-1">
              HVAC Unit #101 requires immediate attention. Scheduled maintenance overdue by 15 days.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Asset ID: EQ-5678 | Location: Building A, Floor 1, Room 101
            </p>
            <button className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors">
              Contact HVAC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
