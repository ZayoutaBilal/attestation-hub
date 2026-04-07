<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge.vue";
import EmployeeAvatar from "./EmployeeAvatar.vue";
import type { Demande } from "@/lib/attestation-logic";
import { getEmployee } from "@/lib/attestation-logic";
import { CalendarPlus, CheckCircle, PackageCheck, AlertTriangle } from "lucide-vue-next";

interface DetailModalProps {
  demande: Demande | null;
  open: boolean;
}

const props = defineProps<DetailModalProps>();
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'confirmerRetrait', id: string): void;
}>();

const format_date = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};
</script>

<template>
  <Dialog :open="open" @update:open="(val) => { if (!val) emit('update:open', false); else emit('update:open', true); }">
    <DialogContent class="sm:max-w-md" v-if="demande">
      <DialogHeader>
        <DialogTitle>Détails — {{ demande.reference }}</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
          <EmployeeAvatar :initials="getEmployee(demande.employeeId)?.avatar || '?'" size="lg" />
          <div>
            <p class="font-semibold">{{ getEmployee(demande.employeeId) ? `${getEmployee(demande.employeeId)?.prenom} ${getEmployee(demande.employeeId)?.nom}` : "Inconnu" }}</p>
            <p class="text-sm text-muted-foreground">{{ getEmployee(demande.employeeId)?.poste }}</p>
            <p class="text-xs text-muted-foreground">{{ getEmployee(demande.employeeId)?.departement }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Type</p>
            <p class="font-medium">{{ demande.type }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Statut</p>
            <StatusBadge :statut="demande.statut" />
          </div>
        </div>

        <div v-if="demande.motif" class="text-sm">
          <p class="text-muted-foreground">Motif</p>
          <p class="mt-1 p-3 rounded-lg bg-muted/50 border">{{ demande.motif }}</p>
        </div>

        <div v-if="demande.motifRejet" class="text-sm">
          <p class="text-muted-foreground text-destructive font-medium">Motif du rejet</p>
          <p class="mt-1 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive">{{ demande.motifRejet }}</p>
        </div>

        <!-- Timeline -->
        <div class="space-y-1">
          <p class="text-sm font-semibold mb-3">Suivi de la demande</p>
          <div class="space-y-3 relative before:absolute before:left-4 before:top-8 before:bottom-4 before:w-px before:bg-border">
            
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                <CalendarPlus class="h-4 w-4" />
              </div>
              <div class="pt-1">
                <p class="text-sm font-medium text-foreground">Demande créée</p>
                <p v-if="demande.dateDemande" class="text-xs text-muted-foreground">{{ format_date(demande.dateDemande) }}</p>
              </div>
            </div>

            <template v-if="demande.statut === 'rejetee'">
               <div class="flex items-start gap-3">
                <div class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground">
                  <AlertTriangle class="h-4 w-4" />
                </div>
                <div class="pt-1">
                  <p class="text-sm font-medium text-foreground">Demande rejetée</p>
                  <p v-if="demande.dateDemande" class="text-xs text-muted-foreground">{{ format_date(demande.dateDemande) }}</p>
                </div>
              </div>
            </template>
            <template v-else>
               <div class="flex items-start gap-3">
                <div :class="`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${demande.dateValidation ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`">
                  <CheckCircle class="h-4 w-4" />
                </div>
                <div class="pt-1">
                  <p :class="`text-sm font-medium ${demande.dateValidation ? 'text-foreground' : 'text-muted-foreground'}`">Validée</p>
                  <p v-if="demande.dateValidation" class="text-xs text-muted-foreground">{{ format_date(demande.dateValidation) }}</p>
                  <p v-else class="text-xs text-muted-foreground italic">En attente</p>
                </div>
              </div>

               <div class="flex items-start gap-3">
                <div :class="`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${demande.recuperee ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`">
                  <PackageCheck class="h-4 w-4" />
                </div>
                <div class="pt-1">
                  <p :class="`text-sm font-medium ${demande.recuperee ? 'text-foreground' : 'text-muted-foreground'}`">Récupérée</p>
                  <p v-if="demande.dateRetrait" class="text-xs text-muted-foreground">{{ format_date(demande.dateRetrait) }}</p>
                  <p v-else-if="!demande.recuperee" class="text-xs text-muted-foreground italic">En attente</p>
                </div>
              </div>
            </template>

          </div>
        </div>

        <!-- Confirm retrieval button -->
        <Button v-if="demande.statut === 'validee' && !demande.recuperee" class="w-full gap-2" @click="emit('confirmerRetrait', demande.id)">
          <PackageCheck class="h-4 w-4" />
          Confirmer le retrait
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
