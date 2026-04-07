<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Check, X, Eye, Download, ChevronLeft, ChevronRight, Printer } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge.vue";
import EmployeeAvatar from "./EmployeeAvatar.vue";
import type { Demande } from "@/lib/attestation-logic";
import { getEmployee, generatePDFBlob, downloadBlob } from "@/lib/attestation-logic";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/partials/Modal.vue";

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

const showModal = ref(false)
const selectedRequest = ref<Demande | null>(null)
const comment = ref('')

const currentPage = ref(1);
const itemsPerPage = 6;

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

const handleValider = (demande: Demande) => {
  selectedRequest.value = demande
  showModal.value = true
}



const handleVoirDetails = (demande: Demande) => {
  emit('voirDetails', demande)
}

const handleRejeter = (demande: Demande) => {
  emit('rejeter', demande.id)
}


const validateRequest = () => {
  if (selectedRequest.value) {
    emit('valider', selectedRequest.value.id);
    showModal.value = false;
  }
}

const rejectRequest = () => {
  if (selectedRequest.value) {
    emit('rejeter', selectedRequest.value.id);
    showModal.value = false;
  }
}
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
                <Button
  size="icon"
  variant="ghost"
  class="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
  @click="handleValider(d)"
  title="Valider"
>
  <Check class="h-4 w-4" />
</Button>
                <Button size="icon" variant="ghost" class="h-8 w-8 text-destructive hover:bg-destructive/10" @click="handleRejeter(d)" title="Rejeter">
                  <X class="h-4 w-4" />
                </Button>
              </template>
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="handleVoirDetails(d)" title="Voir détails">
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

  <!-- Attestation Details Modal -->
  <!-- Attestation Details Modal -->
<Modal v-model="showModal" title="Attestation de travail" size="full" :show-footer="false">
  <div class="flex h-full -mx-6 -my-6">
    <!-- Far Left Sidebar - Page Navigation -->
    <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <!-- Search Box with Print & Download icons -->
      <div class="p-4 border-b border-gray-200 flex items-center gap-2">
        <div class="relative flex-1">
          <input type="text" placeholder="Recherche"
            class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <button title="Imprimer" class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <Printer class="w-5 h-5"/>
        </button>
        <button v-if="selectedRequest" @click="handleDownload(selectedRequest)"
          title="Télécharger"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <Download class="w-5 h-5"/>
        </button>
      </div>

      <!-- Page List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-for="page in 3" :key="page"
          class="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
          <div class="aspect-[8.5/11] bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
            <div class="text-center p-2 text-[8px] leading-tight text-gray-600">
              <div class="font-bold mb-1">Attestation {{ page }}</div>
              <div class="text-[6px]">Lorem ipsum dolor...</div>
            </div>
          </div>
          <p class="text-xs font-medium text-gray-700">Attestation de travail {{ page }}</p>
        </div>
      </div>
    </div>

    <!-- Middle - PDF Preview -->
    <div class="flex-1 flex flex-col bg-gray-100">
      <!-- PDF Viewer Controls -->
      <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <input type="number" min="1" :max="3" value="1"
            class="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 rounded-lg">
          <span class="text-sm text-gray-600">sur 3</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Zoom / Search Controls -->
          <div class="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <button class="p-2 hover:bg-white rounded-md transition-colors">
              <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
              </svg>
            </button>
            <select class="px-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none cursor-pointer">
              <option>70%</option>
              <option>100%</option>
              <option>150%</option>
              <option>200%</option>
            </select>
            <button class="p-2 hover:bg-white rounded-md transition-colors">
              <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- PDF Content -->
      <!-- PDF Content -->
                    <div class="flex-1 overflow-y-auto p-8 flex justify-center">
                        <div class="w-full max-w-3xl bg-white shadow-2xl p-12 my-auto">
                            <h1 class="text-3xl font-bold text-center mb-8">Attestation de travail</h1>
                            <div class="space-y-4 text-sm text-gray-700 leading-relaxed">
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure
                                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                    pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.</p>

                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure
                                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                    pariatur.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                    tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure
                                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                    pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.</p>

                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure
                                    dolor in reprehenderit in voluptate velit esse cillum dolore.</p>

                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure
                                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                    pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                                    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                                    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                                    sunt
                                    in culpa qui officia deserunt mollit anim id est laborum.</p>

                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                    irure
                                    dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
                            </div>
                        </div>
                    </div>
    </div>

    <!-- Right Side - Details Form -->
    <div class="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Details Section -->
        <h3 class="text-lg font-bold text-gray-900 mb-6">Détails de la demande</h3>

        <div class="space-y-5">
          <!-- Employee Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom employé</label>
            <input type="text" :value="selectedRequest && getEmployee(selectedRequest.employeeId) ? `${getEmployee(selectedRequest.employeeId)?.prenom} ${getEmployee(selectedRequest.employeeId)?.nom}` : ''" disabled
              class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-900">
          </div>

          <!-- Job Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Département</label>
            <input type="text" :value="selectedRequest && getEmployee(selectedRequest.employeeId) ? getEmployee(selectedRequest.employeeId)?.departement : ''" disabled
              class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
          </div>

          <!-- Attestation Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type d'attestation</label>
            <input type="text" :value="selectedRequest?.type" disabled
              class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
          </div>

          <!-- Submission Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date de soumission</label>
            <input type="text" :value="selectedRequest ? format_date(selectedRequest.dateDemande) : ''" disabled
              class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
          </div>

          <!-- Comment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Commentaire <span class="text-red-500">(facultatif)</span>
            </label>
            <textarea v-model="comment" rows="4" placeholder="Commentaire"
              class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="pt-4 flex gap-3">
            <button @click="rejectRequest"
              class="flex-1 px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors">
              Rejeter
            </button>
            <button @click="validateRequest"
              class="flex-1 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</Modal>
</template>
