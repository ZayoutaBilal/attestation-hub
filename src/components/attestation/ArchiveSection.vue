<script setup lang="ts">
import { Download, Calendar, FolderArchive } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StatusBadge from "./StatusBadge.vue";
import type { Demande } from "@/lib/attestation-logic";
import { generatePDFBlob, downloadBlob } from "@/lib/attestation-logic";

interface ArchiveSectionProps {
  groupedArchives: Record<string, Demande[]>;
}

const props = defineProps<ArchiveSectionProps>();

const handleDownload = (demande: Demande) => {
  const blob = generatePDFBlob(demande);
  downloadBlob(blob, `${demande.reference}.pdf`);
};

const format_date = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' });
};
</script>

<template>
  <div v-if="Object.keys(groupedArchives).length === 0" class="text-center py-16 text-muted-foreground border rounded-lg bg-card mt-2">
    <FolderArchive class="h-10 w-10 mx-auto mb-3 opacity-20" />
    <p class="text-lg font-medium">Aucune archive disponible</p>
    <p class="text-sm mt-1">Vos attestations apparaîtront ici une fois créées.</p>
  </div>
  
  <div v-else class="space-y-4">
    <Accordion type="multiple" class="w-full bg-card border rounded-lg overflow-hidden">
      <AccordionItem v-for="(demandes, type) in groupedArchives" :key="type" :value="type" class="px-4">
        <AccordionTrigger class="hover:no-underline py-4">
          <div class="flex items-center gap-3 text-left">
            <span class="font-semibold">{{ type }}</span>
            <span class="bg-muted text-muted-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
              {{ demandes.length }} attestation(s)
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent class="pb-4">
          <div class="space-y-3 mt-2 pr-2">
            <div 
              v-for="d in demandes" 
              :key="d.id"
              class="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-sm font-bold font-mono">{{ d.reference }}</p>
                  <p class="text-xs text-muted-foreground">{{ format_date(d.dateDemande) }}</p>
                </div>
                <div class="ml-4 hidden sm:block">
                  <StatusBadge :statut="d.statut" />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="sm:hidden block">
                   <StatusBadge :statut="d.statut" />
                </div>
                <Button size="sm" variant="outline" class="gap-2" @click="handleDownload(d)">
                  <Download class="h-4 w-4" />
                  <span class="hidden sm:inline">Télécharger</span>
                </Button>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
