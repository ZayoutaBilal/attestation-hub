<script setup lang="ts">
import { FileText, Clock, CheckCircle, XCircle } from "lucide-vue-next";
import StatCard from "./StatCard.vue";
import type { Demande } from "@/lib/attestation-logic";
import { getStats, getTypeDistribution } from "@/lib/attestation-logic";
import { VisXYContainer, VisStackedBar, VisAxis, VisSingleContainer, VisDonut } from '@unovis/vue';

interface AnalyseDashboardProps {
  demandes: Demande[];
}

const props = defineProps<AnalyseDashboardProps>();

const stats = getStats(props.demandes);
const distribution = getTypeDistribution(props.demandes);

// For Donut
const statusData = [
  { name: "En attente", value: stats.enAttente, fill: "hsl(33, 100%, 50%)" },
  { name: "Validées", value: stats.validees, fill: "hsl(142, 71%, 45%)" },
  { name: "Rejetées", value: stats.rejetees, fill: "hsl(0, 72%, 51%)" },
];
const donutValue = (d: any) => d.value;
const donutColor = (d: any, i: number) => statusData[i].fill;

// For Bar
const PIE_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(33, 100%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(262, 83%, 58%)",
  "hsl(190, 95%, 39%)",
];
const barX = (d: any) => d.count;
const barColor = (d: any, i: number) => PIE_COLORS[i % PIE_COLORS.length];
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total des demandes" :value="stats.total" :icon="FileText" variant="default" />
      <StatCard title="En attente" :value="stats.enAttente" :icon="Clock" variant="pending" />
      <StatCard title="Validées" :value="stats.validees" :icon="CheckCircle" variant="approved" />
      <StatCard title="Rejetées" :value="stats.rejetees" :icon="XCircle" variant="rejected" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-lg border bg-card p-6">
        <h3 class="font-semibold mb-4">Répartition par type</h3>
        <div class="h-[280px]">
           <VisXYContainer :data="distribution">
              <VisStackedBar :x="barX" :y="barX" :color="barColor" orientation="horizontal" />
              <VisAxis type="x" />
              <VisAxis type="y" :tickFormat="(i) => distribution[i]?.type" />
           </VisXYContainer>
        </div>
      </div>

      <div class="rounded-lg border bg-card p-6">
        <h3 class="font-semibold mb-4">Répartition par statut</h3>
        <div class="h-[280px] flex items-center justify-center">
            <VisSingleContainer :data="statusData">
                <VisDonut :value="donutValue" :color="donutColor" />
            </VisSingleContainer>
        </div>
      </div>
    </div>
  </div>
</template>
