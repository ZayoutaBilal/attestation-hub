<script setup lang="ts">
import { ref, computed } from "vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, BarChart3, ClipboardList, Shield, FileText, Clock, CheckCircle, XCircle, Archive, Search } from "lucide-vue-next";
import DemandeTable from "@/components/attestation/DemandeTable.vue";
import ArchiveSection from "@/components/attestation/ArchiveSection.vue";
import FilterBar from "@/components/attestation/FilterBar.vue";
import NouvelleDemandeModal from "@/components/attestation/NouvelleDemandeModal.vue";
import DetailModal from "@/components/attestation/DetailModal.vue";
import RejetModal from "@/components/attestation/RejetModal.vue";
import AnalyseDashboard from "@/components/attestation/AnalyseDashboard.vue";
import StatCard from "@/components/attestation/StatCard.vue";
import {
  loadDemandes,
  creerDemande,
  updateStatut,
  confirmerRetrait,
  filterDemandes,
  exportToXLSXData,
  getStats,
  CURRENT_USER_ID,
  searchEmployees,
  getEmployeeFullName,
  type Demande,
} from "@/lib/attestation-logic";
import { toast } from "vue-sonner";
import * as XLSX from "xlsx";

const demandes = ref<Demande[]>(loadDemandes());
const activeTab = ref("mes-demandes");
const search = ref("");
const statusFilter = ref("all");
const typeFilter = ref("all");
const dateFilter = ref("");
const recupereeFilter = ref("all");
const modalOpen = ref(false);
const detailDemande = ref<Demande | null>(null);
const rejetDemandeId = ref<string | null>(null);
const rhSearchQuery = ref("");
const rhSelectedEmployeeId = ref<string | null>(null);

const filters = computed(() => ({
  search: search.value, 
  statusFilter: statusFilter.value, 
  typeFilter: typeFilter.value, 
  dateFilter: dateFilter.value, 
  recupereeFilter: recupereeFilter.value,
}));

const isRH = computed(() => activeTab.value === "gestion-rh" || activeTab.value === "analyse");
const baseDemandes = computed(() => isRH.value ? demandes.value : demandes.value.filter((d) => d.employeeId === CURRENT_USER_ID));
const stats = computed(() => getStats(baseDemandes.value));
const filtered = computed(() => filterDemandes(baseDemandes.value, filters.value));

const archiveGroupedByType = computed(() => {
  const grouped: Record<string, Demande[]> = {};
  const userDemandes = demandes.value.filter((d) => d.employeeId === CURRENT_USER_ID && d.statut === "validee");
  
  for (const d of userDemandes) {
    if (!grouped[d.type]) grouped[d.type] = [];
    grouped[d.type].push(d);
  }
  
  for (const type in grouped) {
    grouped[type].sort((a,b) => new Date(a.dateDemande).getTime() - new Date(b.dateDemande).getTime());
  }
  
  return grouped;
});

const rhArchiveGroupedByType = computed(() => {
  if (!rhSelectedEmployeeId.value || rhSelectedEmployeeId.value === "not-found") return {};
  
  const grouped: Record<string, Demande[]> = {};
  const empDemandes = demandes.value.filter(
    (d) => d.employeeId === rhSelectedEmployeeId.value && d.statut === "validee"
  );
  
  for (const d of empDemandes) {
    if (!grouped[d.type]) grouped[d.type] = [];
    grouped[d.type].push(d);
  }
  
  for (const type in grouped) {
    grouped[type].sort((a,b) => new Date(a.dateDemande).getTime() - new Date(b.dateDemande).getTime());
  }
  
  return grouped;
});

const handleRhSearch = () => {
  const q = rhSearchQuery.value.trim();
  if (!q) {
     rhSelectedEmployeeId.value = null;
     return;
  }
  const results = searchEmployees(q);
  if (results.length > 0) {
     rhSelectedEmployeeId.value = results[0].id;
     toast.success(`Archives trouvées pour ${getEmployeeFullName(results[0].id)}`);
  } else {
     rhSelectedEmployeeId.value = "not-found";
     toast.error(`Aucun employé trouvé pour "${q}"`);
  }
};

const rejetDemande = computed(() => demandes.value.find((d) => d.id === rejetDemandeId.value));

const handleSubmit = (employeeId: string, type: string, motif: string) => {
  creerDemande(employeeId, type, motif);
  demandes.value = loadDemandes();
  toast.success("Demande créée avec succès");
};

const handleValider = (id: string) => {
  const updated = updateStatut(id, "validee");
  demandes.value = updated;
  toast.success("Demande validée");
};

const handleRejeter = (id: string) => {
  rejetDemandeId.value = id;
};

const handleConfirmRejet = (motif: string) => {
  if (!rejetDemandeId.value) return;
  const updated = updateStatut(rejetDemandeId.value, "rejetee", motif);
  demandes.value = updated;
  rejetDemandeId.value = null;
  toast("Demande rejetée", { description: "Le motif a été enregistré." });
};

const handleConfirmerRetrait = (id: string) => {
  const updated = confirmerRetrait(id);
  demandes.value = updated;
  const updatedDem = updated.find((d) => d.id === id);
  if (updatedDem) detailDemande.value = updatedDem;
  toast.success("Retrait confirmé");
};

const handleExport = (data: Demande[]) => {
  const xlsxData = exportToXLSXData(data);
  const ws = XLSX.utils.json_to_sheet(xlsxData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attestations");
  XLSX.writeFile(wb, `attestations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success("Export Excel téléchargé");
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <main class="container max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <!-- Title bar -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Gestion des Attestations</h1>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
            @click="() => handleExport(filtered)"
          >
            <Download class="h-4 w-4" />
            Exporter
          </Button>

          <Button
            @click="modalOpen = true"
            class="flex items-center gap-2"
          >
            <Plus class="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total des demandes" :value="stats.total" :icon="FileText" variant="default" />
        <StatCard title="En attente" :value="stats.enAttente" :icon="Clock" variant="pending" />
        <StatCard title="Validées" :value="stats.validees" :icon="CheckCircle" variant="approved" />
        <StatCard title="Rejetées" :value="stats.rejetees" :icon="XCircle" variant="rejected" />
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="bg-muted p-2 flex flex-wrap gap-3 rounded-lg w-full mb-6">

        <TabsTrigger
          value="mes-demandes"
          class="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent transition"
        >
          <ClipboardList class="h-4 w-4 shrink-0" />
          <span>Mes Demandes</span>
        </TabsTrigger>

        <TabsTrigger
          value="archives"
          class="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent transition"
        >
          <Archive class="h-4 w-4 shrink-0" />
          <span>Mon archive</span>
        </TabsTrigger>

        <TabsTrigger
          value="gestion-rh"
          class="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent transition"
        >
          <Shield class="h-4 w-4 shrink-0" />
          <span>Gestion RH</span>
        </TabsTrigger>

        <TabsTrigger
          value="archives-rh"
          class="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent transition"
        >
          <Search class="h-4 w-4 shrink-0" />
          <span>Archives RH</span>
        </TabsTrigger>

        <TabsTrigger
          value="analyse"
          class="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent transition"
        >
          <BarChart3 class="h-4 w-4 shrink-0" />
          <span>Analyse</span>
        </TabsTrigger>

      </TabsList>

        <!-- Mes Demandes -->
        <TabsContent value="mes-demandes" class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">{{ filtered.length }} demande(s)</p>
          </div>
          <FilterBar
            v-model:search="search"
            v-model:statusFilter="statusFilter"
            v-model:typeFilter="typeFilter"
            v-model:dateFilter="dateFilter"
            v-model:recupereeFilter="recupereeFilter"
          />
          <div class="rounded-lg border bg-card overflow-hidden">
            <DemandeTable :demandes="filtered" :showActions="false" @voirDetails="(d) => detailDemande = d" />
          </div>
        </TabsContent>

        <!-- Gestion RH -->
        <TabsContent value="gestion-rh" class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">{{ filtered.length }} demande(s)</p>
            <Button variant="outline" size="sm" class="gap-2" @click="() => handleExport(filtered)">
              <Download class="h-4 w-4" />
              Exporter .xlsx
            </Button>
          </div>
          <FilterBar
            v-model:search="search"
            v-model:statusFilter="statusFilter"
            v-model:typeFilter="typeFilter"
            v-model:dateFilter="dateFilter"
            v-model:recupereeFilter="recupereeFilter"
          />
          <div class="rounded-lg border bg-card overflow-hidden">
            <DemandeTable
              :demandes="filtered"
              :showActions="true"
              @valider="handleValider"
              @rejeter="handleRejeter"
              @voirDetails="(d) => detailDemande = d"
            />
          </div>
        </TabsContent>

        <!-- Analyse -->
        <TabsContent value="analyse">
          <AnalyseDashboard :demandes="demandes" />
        </TabsContent>

        <!-- Archives -->
        <TabsContent value="archives">
          <ArchiveSection :groupedArchives="archiveGroupedByType" />
        </TabsContent>

        <!-- Archives RH -->
        <TabsContent value="archives-rh" class="space-y-4">
          <div class="flex gap-4">
            <div class="relative flex-1 max-w-md">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher le nom d'un employé..."
                v-model="rhSearchQuery"
                @keyup.enter="handleRhSearch"
                class="pl-9"
              />
            </div>
            <Button @click="handleRhSearch">Chercher</Button>
          </div>
          
          <div v-if="rhSelectedEmployeeId && rhSelectedEmployeeId !== 'not-found'" class="mt-4">
             <h3 class="font-medium text-sm text-muted-foreground mb-3">
               Archives de : {{ getEmployeeFullName(rhSelectedEmployeeId) }}
             </h3>
             <ArchiveSection :groupedArchives="rhArchiveGroupedByType" />
          </div>
          <div v-else-if="rhSelectedEmployeeId === 'not-found'" class="text-center py-16 text-muted-foreground border rounded-lg bg-card mt-4">
             <p class="text-lg font-medium">Employé introuvable</p>
             <p class="text-sm mt-1">Veuillez vérifier le nom et réessayer.</p>
          </div>
        </TabsContent>
      </Tabs>
    </main>

    <NouvelleDemandeModal v-model:open="modalOpen" @submit="handleSubmit" />
    <DetailModal :demande="detailDemande" :open="!!detailDemande" @update:open="(v) => !v && (detailDemande = null)" @confirmerRetrait="handleConfirmerRetrait" />
    <RejetModal
      :open="!!rejetDemandeId"
      @update:open="(v) => !v && (rejetDemandeId = null)"
      @confirm="handleConfirmRejet"
      :reference="rejetDemande?.reference || ''"
    />
  </div>
</template>
