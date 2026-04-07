<script setup lang="ts">
import type { Demande } from "@/lib/attestation-logic";
import { getStats } from "@/lib/attestation-logic";
import { VisXYContainer, VisAxis, VisSingleContainer, VisDonut, VisLine, VisTooltip } from '@unovis/vue';
import { Donut } from '@unovis/ts';

interface AnalyseDashboardProps {
  demandes: Demande[];
}

const props = defineProps<AnalyseDashboardProps>();

const stats = getStats(props.demandes);

// For Donut: Status
const statusData = [
  { name: "En attente", value: stats.enAttente, fill: "hsl(33, 100%, 50%)" },
  { name: "Validées", value: stats.validees, fill: "hsl(142, 71%, 45%)" },
  { name: "Rejetées", value: stats.rejetees, fill: "hsl(0, 72%, 51%)" },
];
const donutValue = (d: any) => d.value;
const donutColor = (d: any) => d.fill;

const totalStats = stats.enAttente + stats.validees + stats.rejetees;

const donutTriggers = {
  [Donut.selectors.segment]: (d: any) => {
    const item = d.data;
    const percent = totalStats > 0 ? ((item.value / totalStats) * 100).toFixed(1) : 0;
    return `<div class="bg-card text-card-foreground border rounded-lg px-3 py-2 text-sm shadow-md">
              <div class="font-semibold">${item.name}</div>
              <div>${item.value} demande(s) <span class="text-muted-foreground ml-1">(${percent}%)</span></div>
            </div>`;
  }
};

// For Line: Timeline
const dateMap: Record<string, number> = {};
props.demandes.forEach(d => {
  dateMap[d.dateDemande] = (dateMap[d.dateDemande] || 0) + 1;
});
const timelineData = Object.entries(dateMap)
  .map(([date, count]) => ({ date, count }))
  .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const timelineX = (d: any, i: number) => i;
const timelineY = (d: any) => d.count;
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-lg border bg-card p-6">
        <h3 class="font-semibold mb-4 text-muted-foreground">Répartition par statut</h3>
        <div class="h-[280px] flex flex-row items-center justify-center gap-8">
            <div class="w-[280px] h-[280px]">
              <VisSingleContainer :data="statusData" :height="280">
                  <VisDonut :value="donutValue" :color="donutColor" />
                  <VisTooltip :triggers="donutTriggers" />
              </VisSingleContainer>
            </div>
            
            <div class="flex flex-col gap-4">
               <div v-for="s in statusData" :key="s.name" class="flex items-center gap-3">
                  <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: s.fill }"></div>
                  <div>
                    <p class="font-medium text-sm">{{ s.name }}</p>
                    <p class="text-xs text-muted-foreground">
                       {{ s.value }} demande(s) 
                       <span class="font-semibold ml-1 text-foreground">
                          ({{ totalStats > 0 ? ((s.value / totalStats) * 100).toFixed(1) : 0 }}%)
                       </span>
                    </p>
                  </div>
               </div>
            </div>
        </div>
      </div>

      <div class="rounded-lg border bg-card p-6">
         <h3 class="font-semibold mb-4 text-muted-foreground">Évolution des demandes (par jour)</h3>
         <div class="h-[280px] w-full">
             <VisXYContainer :data="timelineData" :height="280">
                 <VisLine :x="timelineX" :y="timelineY" color="hsl(217, 91%, 60%)" />
                 <VisAxis type="x" :tickFormat="(i) => timelineData[i]?.date" />
                 <VisAxis type="y" />
             </VisXYContainer>
         </div>
      </div>
    </div>
  </div>
</template>
