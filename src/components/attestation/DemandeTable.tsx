import { Check, X, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { EmployeeAvatar } from "./EmployeeAvatar";
import type { Demande } from "@/lib/attestation-logic";
import { getEmployee, generatePDFBlob, downloadBlob } from "@/lib/attestation-logic";
import { Badge } from "@/components/ui/badge";

interface DemandeTableProps {
  demandes: Demande[];
  showActions: boolean;
  onValider?: (id: string) => void;
  onRejeter?: (id: string) => void;
  onVoirDetails?: (demande: Demande) => void;
}

export function DemandeTable({ demandes, showActions, onValider, onRejeter, onVoirDetails }: DemandeTableProps) {
  const handleDownload = (demande: Demande) => {
    const blob = generatePDFBlob(demande);
    downloadBlob(blob, `${demande.reference}.pdf`);
  };

  if (demandes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Aucune demande trouvée</p>
        <p className="text-sm mt-1">Modifiez vos filtres ou créez une nouvelle demande.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Réf.</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employé</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Récupérée</th>
            {showActions && <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {demandes.map((d) => {
            const emp = getEmployee(d.employeeId);
            return (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-sm font-mono font-medium text-muted-foreground">{d.reference}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar initials={emp?.avatar || "?"} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{emp ? `${emp.prenom} ${emp.nom}` : "Inconnu"}</p>
                      <p className="text-xs text-muted-foreground">{emp?.departement}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{d.type}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(d.dateDemande).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-3 px-4"><StatusBadge statut={d.statut} /></td>
                <td className="py-3 px-4">
                  {d.statut === "validee" ? (
                    <Badge variant={d.recuperee ? "default" : "secondary"} className={d.recuperee ? "bg-primary/10 text-primary border-primary/20" : ""}>
                      {d.recuperee ? "Oui" : "Non"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                {showActions && (
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      {d.statut === "en_attente" && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => onValider?.(d.id)} title="Valider">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onRejeter?.(d.id)} title="Rejeter">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onVoirDetails?.(d)} title="Voir détails">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(d)} title="Télécharger PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
