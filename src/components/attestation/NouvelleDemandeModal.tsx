import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { TYPES_ATTESTATION, EMPLOYEES, CURRENT_USER_ID, searchEmployees, getEmployee } from "@/lib/attestation-logic";
import type { Employee } from "@/lib/attestation-logic";
import { User, Users, Search } from "lucide-react";

interface NouvelleDemandeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employeeId: string, type: string, motif: string) => void;
}

export function NouvelleDemandeModal({ open, onClose, onSubmit }: NouvelleDemandeModalProps) {
  const [mode, setMode] = useState<"choice" | "form">("choice");
  const [forSelf, setForSelf] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [empSearch, setEmpSearch] = useState("");
  const [type, setType] = useState("");
  const [motif, setMotif] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!empSearch) return EMPLOYEES.filter((e) => e.id !== CURRENT_USER_ID);
    return searchEmployees(empSearch).filter((e) => e.id !== CURRENT_USER_ID);
  }, [empSearch]);

  const reset = () => {
    setMode("choice");
    setForSelf(true);
    setSelectedEmployee(null);
    setEmpSearch("");
    setType("");
    setMotif("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const empId = forSelf ? CURRENT_USER_ID : selectedEmployee?.id;
    if (!empId || !type) return;
    onSubmit(empId, type, motif);
    handleClose();
  };

  const chooseMode = (self: boolean) => {
    setForSelf(self);
    if (self) {
      setSelectedEmployee(getEmployee(CURRENT_USER_ID) || null);
    }
    setMode("form");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle Demande</DialogTitle>
        </DialogHeader>

        {mode === "choice" && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => chooseMode(true)}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-muted/50 transition-all"
            >
              <User className="h-8 w-8 text-primary" />
              <span className="font-medium">Pour moi</span>
            </button>
            <button
              onClick={() => chooseMode(false)}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-muted/50 transition-all"
            >
              <Users className="h-8 w-8 text-primary" />
              <span className="font-medium">Pour un employé</span>
            </button>
          </div>
        )}

        {mode === "form" && (
          <div className="space-y-4 py-2">
            {!forSelf && !selectedEmployee && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <EmployeeAvatar initials={emp.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{emp.prenom} {emp.nom}</p>
                        <p className="text-xs text-muted-foreground">{emp.poste}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(forSelf || selectedEmployee) && (
              <>
                {/* Profile card */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                  <EmployeeAvatar initials={(forSelf ? getEmployee(CURRENT_USER_ID) : selectedEmployee)?.avatar || "?"} size="lg" />
                  <div>
                    <p className="font-semibold">
                      {(() => {
                        const e = forSelf ? getEmployee(CURRENT_USER_ID) : selectedEmployee;
                        return e ? `${e.prenom} ${e.nom}` : "";
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(forSelf ? getEmployee(CURRENT_USER_ID) : selectedEmployee)?.poste}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(forSelf ? getEmployee(CURRENT_USER_ID) : selectedEmployee)?.departement}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type d'attestation *</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_ATTESTATION.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Motif <span className="text-muted-foreground">(facultatif)</span></label>
                  <Textarea
                    placeholder="Précisez le motif de votre demande..."
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={handleClose}>Annuler</Button>
                  <Button onClick={handleSubmit} disabled={!type}>Soumettre</Button>
                </div>
              </>
            )}

            {!forSelf && !selectedEmployee && (
              <div className="flex justify-start">
                <Button variant="ghost" onClick={() => setMode("choice")}>← Retour</Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
