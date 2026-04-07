<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TYPES_ATTESTATION } from "@/lib/attestation-logic";

interface FilterBarProps {
  search: string;
  statusFilter: string;
  typeFilter: string;
  dateFilter: string;
  recupereeFilter: string;
}

const props = defineProps<FilterBarProps>();
const emit = defineEmits<{
  (e: 'update:search', value: string): void;
  (e: 'update:statusFilter', value: string): void;
  (e: 'update:typeFilter', value: string): void;
  (e: 'update:dateFilter', value: string): void;
  (e: 'update:recupereeFilter', value: string): void;
}>();

const STATUSES = [
  { value: "all", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "validee", label: "Validée" },
  { value: "rejetee", label: "Rejetée" },
];
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou référence..."
          :model-value="search"
          @update:model-value="(val) => emit('update:search', String(val))"
          class="pl-9"
        />
      </div>
      <Select :model-value="statusFilter" @update:model-value="(val) => emit('update:statusFilter', String(val))">
        <SelectTrigger class="w-full sm:w-[180px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</SelectItem>
        </SelectContent>
      </Select>
      <Select :model-value="typeFilter" @update:model-value="(val) => emit('update:typeFilter', String(val))">
        <SelectTrigger class="w-full sm:w-[220px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          <SelectItem v-for="t in TYPES_ATTESTATION" :key="t" :value="t">{{ t }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <Input
        type="date"
        :model-value="dateFilter"
        @update:model-value="(val) => emit('update:dateFilter', String(val))"
        class="w-full sm:w-[180px]"
        placeholder="Date"
      />
      <Select :model-value="recupereeFilter" @update:model-value="(val) => emit('update:recupereeFilter', String(val))">
        <SelectTrigger class="w-full sm:w-[180px]">
          <SelectValue placeholder="Récupération" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          <SelectItem value="oui">Récupérée</SelectItem>
          <SelectItem value="non">Non récupérée</SelectItem>
        </SelectContent>
      </Select>
      <button
        v-if="statusFilter !== 'all' || typeFilter !== 'all' || dateFilter || recupereeFilter !== 'all'"
        @click="() => {
          emit('update:statusFilter', 'all');
          emit('update:typeFilter', 'all');
          emit('update:dateFilter', '');
          emit('update:recupereeFilter', 'all');
        }"
        class="text-sm text-primary hover:underline whitespace-nowrap self-center"
      >
        Réinitialiser les filtres
      </button>
    </div>
  </div>
</template>
