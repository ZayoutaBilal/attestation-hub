<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Check, X, Eye, Download, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge.vue";
import EmployeeAvatar from "./EmployeeAvatar.vue";
import type { Demande } from "@/lib/attestation-logic";
import { getEmployee, generatePDFBlob, downloadBlob } from "@/lib/attestation-logic";
import { Badge } from "@/components/ui/badge";

interface DemandeTableProps {
  demandes: Demande[];
  showActions: boolean;
}

const props = defineProps<DemandeTableProps>();
const emit = defineEmits<{
  (e: 'valider', id: string): void;
  (e: 'rejeter', id: string): void;
  (e: 'voirDetails', demande: Demande): void;
}>();

const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(props.demandes.length / itemsPerPage));

const paginatedDemandes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.demandes.slice(start, start + itemsPerPage);
});

watch(() => props.demandes, () => {
  currentPage.value = 1;
});

const handleDownload = (demande: Demande) => {
  const blob = generatePDFBlob(demande);
  downloadBlob(blob, `${demande.reference}.pdf`);
};

const format_date = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR");
};
</script>

<template>
  <div v-if="demandes.length === 0" class="text-center py-16 text-muted-foreground">
    <p class="text-lg font-medium">Aucune demande trouvée</p>
    <p class="text-sm mt-1">Modifiez vos filtres ou créez une nouvelle demande.</p>
  </div>
  
  <div v-else class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b bg-muted/50">
          <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Réf.</th>
          <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employé</th>
          <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
          <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
          <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
          <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Récupérée</th>
          <th v-if="showActions" class="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in paginatedDemandes" :key="d.id" class="border-b last:border-0 hover:bg-muted/30 transition-colors">
          <td class="py-3 px-4 text-sm font-mono font-medium text-muted-foreground">{{ d.reference }}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <EmployeeAvatar :initials="getEmployee(d.employeeId)?.avatar || '?'" size="sm" />
              <div>
                <p class="text-sm font-medium">{{ getEmployee(d.employeeId) ? `${getEmployee(d.employeeId)?.prenom} ${getEmployee(d.employeeId)?.nom}` : "Inconnu" }}</p>
                <p class="text-xs text-muted-foreground">{{ getEmployee(d.employeeId)?.departement }}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-sm">{{ d.type }}</td>
          <td class="py-3 px-4 text-sm text-muted-foreground">
            {{ format_date(d.dateDemande) }}
          </td>
          <td class="py-3 px-4"><StatusBadge :statut="d.statut" /></td>
          <td class="py-3 px-4">
            <template v-if="d.statut === 'validee'">
              <Badge :variant="d.recuperee ? 'default' : 'secondary'" :class="d.recuperee ? 'bg-primary/10 text-primary border-primary/20' : ''">
                {{ d.recuperee ? "Oui" : "Non" }}
              </Badge>
            </template>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </td>
          <td v-if="showActions" class="py-3 px-4">
            <div class="flex items-center justify-end gap-1">
              <template v-if="d.statut === 'en_attente'">
                <Button size="icon" variant="ghost" class="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" @click="emit('valider', d.id)" title="Valider">
                  <Check class="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" class="h-8 w-8 text-destructive hover:bg-destructive/10" @click="emit('rejeter', d.id)" title="Rejeter">
                  <X class="h-4 w-4" />
                </Button>
              </template>
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="emit('voirDetails', d)" title="Voir détails">
                <Eye class="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="handleDownload(d)" title="Télécharger PDF">
                <Download class="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t">
      <p class="text-sm text-muted-foreground">
        Page {{ currentPage }} sur {{ totalPages }}
      </p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage--">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="currentPage++">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
