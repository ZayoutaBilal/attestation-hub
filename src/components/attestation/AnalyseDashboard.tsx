import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import type { Demande } from "@/lib/attestation-logic";
import { getStats, getTypeDistribution } from "@/lib/attestation-logic";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface AnalyseDashboardProps {
  demandes: Demande[];
}

const PIE_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(33, 100%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(262, 83%, 58%)",
  "hsl(190, 95%, 39%)",
];

export function AnalyseDashboard({ demandes }: AnalyseDashboardProps) {
  const stats = getStats(demandes);
  const distribution = getTypeDistribution(demandes);

  const statusData = [
    { name: "En attente", value: stats.enAttente, fill: "hsl(33, 100%, 50%)" },
    { name: "Validées", value: stats.validees, fill: "hsl(142, 71%, 45%)" },
    { name: "Rejetées", value: stats.rejetees, fill: "hsl(0, 72%, 51%)" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total des demandes" value={stats.total} icon={FileText} variant="default" />
        <StatCard title="En attente" value={stats.enAttente} icon={Clock} variant="pending" />
        <StatCard title="Validées" value={stats.validees} icon={CheckCircle} variant="approved" />
        <StatCard title="Rejetées" value={stats.rejetees} icon={XCircle} variant="rejected" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Répartition par type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distribution} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="type" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Demandes" radius={[0, 4, 4, 0]}>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
