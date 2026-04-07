import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { EmployeeAvatar } from "./EmployeeAvatar";
import type { Demande } from "@/lib/attestation-logic";
import { getEmployee } from "@/lib/attestation-logic";
import { CalendarPlus, CheckCircle, PackageCheck, AlertTriangle } from "lucide-react";

interface DetailModalProps {
  demande: Demande | null;
  open: boolean;
  onClose: () => void;
  onConfirmerRetrait?: (id: string) => void;
}

function TimelineStep({ icon: Icon, label, date, active, color }: { icon: React.ElementType; label: string; date?: string; active: boolean; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${active ? color : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="pt-1">
        <p className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
        {date && <p className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>}
        {!date && !active && <p className="text-xs text-muted-foreground italic">En attente</p>}
      </div>
    </div>
  );
}

export function DetailModal({ demande, open, onClose, onConfirmerRetrait }: DetailModalProps) {
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
              <p className="text-muted-foreground">Statut</p>
              <StatusBadge statut={demande.statut} />
            </div>
          </div>

          {demande.motif && (
            <div className="text-sm">
              <p className="text-muted-foreground">Motif</p>
              <p className="mt-1 p-3 rounded-lg bg-muted/50 border">{demande.motif}</p>
            </div>
          )}

          {demande.motifRejet && (
            <div className="text-sm">
              <p className="text-muted-foreground text-destructive font-medium">Motif du rejet</p>
              <p className="mt-1 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive">{demande.motifRejet}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-1">
            <p className="text-sm font-semibold mb-3">Suivi de la demande</p>
            <div className="space-y-3 relative before:absolute before:left-4 before:top-8 before:bottom-4 before:w-px before:bg-border">
              <TimelineStep icon={CalendarPlus} label="Demande créée" date={demande.dateDemande} active color="bg-primary text-primary-foreground" />
              {demande.statut === "rejetee" ? (
                <TimelineStep icon={AlertTriangle} label="Demande rejetée" date={demande.dateDemande} active color="bg-destructive text-destructive-foreground" />
              ) : (
                <>
                  <TimelineStep icon={CheckCircle} label="Validée" date={demande.dateValidation} active={!!demande.dateValidation} color="bg-emerald-500 text-white" />
                  <TimelineStep icon={PackageCheck} label="Récupérée" date={demande.dateRetrait} active={!!demande.recuperee} color="bg-primary text-primary-foreground" />
                </>
              )}
            </div>
          </div>

          {/* Confirm retrieval button */}
          {demande.statut === "validee" && !demande.recuperee && onConfirmerRetrait && (
            <Button className="w-full gap-2" onClick={() => onConfirmerRetrait(demande.id)}>
              <PackageCheck className="h-4 w-4" />
              Confirmer le retrait
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
