import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import type { Demande } from "@/lib/attestation-logic";
import { getStats, getTypeDistribution } from "@/lib/attestation-logic";

interface AnalyseDashboardProps {
  demandes: Demande[];
}

export function AnalyseDashboard({ demandes }: AnalyseDashboardProps) {
  const stats = getStats(demandes);
  const distribution = getTypeDistribution(demandes);
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total des demandes" value={stats.total} icon={FileText} variant="default" />
        <StatCard title="En attente" value={stats.enAttente} icon={Clock} variant="pending" />
        <StatCard title="Validées" value={stats.validees} icon={CheckCircle} variant="approved" />
        <StatCard title="Rejetées" value={stats.rejetees} icon={XCircle} variant="rejected" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Répartition par type d'attestation</h3>
        <div className="space-y-3">
          {distribution.map((item) => (
            <div key={item.type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.type}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
