"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const COLORS = ["#002868", "#BF0A30", "#f0b429", "#1D9E75", "#7F77DD"]

type Event = {
  title: string
  category: string
  capacity: string
  total_tickets: string
  revenue: string
}

export default function AnalyticsCharts({ events }: { events: Event[] }) {
  const barData = events.map((e) => ({
    name: e.title.length > 20 ? e.title.substring(0, 20) + "..." : e.title,
    tickets: parseInt(e.total_tickets),
    capacity: parseInt(e.capacity),
  }))

  const pieRaw = events.map((e) => ({
    name: e.category,
    value: parseInt(e.capacity),
  }))

  const combinedPie = pieRaw.reduce((acc: { name: string; value: number }[], item) => {
    const existing = acc.find((a) => a.name === item.name)
    if (existing) {
      existing.value += item.value
    } else {
      acc.push({ ...item })
    }
    return acc
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Tickets Sold vs Capacity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="tickets" fill="#BF0A30" name="Tickets Sold" radius={[4, 4, 0, 0]} />
            <Bar dataKey="capacity" fill="#002868" name="Capacity" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Events by Category
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={combinedPie}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {combinedPie.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}