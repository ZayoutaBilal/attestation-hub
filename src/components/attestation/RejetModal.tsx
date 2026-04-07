import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejetModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
  reference: string;
}

export function RejetModal({ open, onClose, onConfirm, reference }: RejetModalProps) {
  const [motif, setMotif] = useState("");

  const handleConfirm = () => {
    if (!motif.trim()) return;
    onConfirm(motif.trim());
    setMotif("");
  };

  const handleClose = () => {
    setMotif("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeter la demande {reference}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Motif du rejet <span className="text-destructive">*</span></label>
            <Textarea
              placeholder="Veuillez saisir le motif du rejet..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>Annuler</Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={!motif.trim()}>
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
