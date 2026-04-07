import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { EmployeeAvatar } from "./EmployeeAvatar";
import type { Demande } from "@/lib/attestation-logic";
import { getEmployee } from "@/lib/attestation-logic";

interface DetailModalProps {
  demande: Demande | null;
  open: boolean;
  onClose: () => void;
}

export function DetailModal({ demande, open, onClose }: DetailModalProps) {
  if (!demande) return null;
  const emp = getEmployee(demande.employeeId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails — {demande.reference}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
            <EmployeeAvatar initials={emp?.avatar || "?"} size="lg" />
            <div>
              <p className="font-semibold">{emp ? `${emp.prenom} ${emp.nom}` : "Inconnu"}</p>
              <p className="text-sm text-muted-foreground">{emp?.poste}</p>
              <p className="text-xs text-muted-foreground">{emp?.departement}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{demande.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(demande.dateDemande).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Statut</p>
              <StatusBadge statut={demande.statut} />
            </div>
            <div>
              <p className="text-muted-foreground">Référence</p>
              <p className="font-mono font-medium">{demande.reference}</p>
            </div>
          </div>

          {demande.motif && (
            <div className="text-sm">
              <p className="text-muted-foreground">Motif</p>
              <p className="mt-1 p-3 rounded-lg bg-muted/50 border">{demande.motif}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
