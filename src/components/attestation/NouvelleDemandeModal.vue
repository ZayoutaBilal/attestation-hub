<script setup lang="ts">
import { ref, computed } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import EmployeeAvatar from "./EmployeeAvatar.vue";
import { TYPES_ATTESTATION, EMPLOYEES, CURRENT_USER_ID, searchEmployees, getEmployee } from "@/lib/attestation-logic";
import type { Employee } from "@/lib/attestation-logic";
import { User, Users, Search, Check, ChevronsUpDown } from "lucide-vue-next";

interface NouvelleDemandeModalProps {
  open: boolean;
}

const props = defineProps<NouvelleDemandeModalProps>();
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'submit', employeeId: string, type: string, motif: string): void;
}>();

const mode = ref<"choice" | "form">("choice");
const forSelf = ref(true);
const selectedEmployee = ref<Employee | null>(null);
const empSearch = ref("");
const type = ref("");
const motif = ref("");
const typeDropdownOpen = ref(false);

const filteredEmployees = computed(() => {
  if (!empSearch.value) return EMPLOYEES.filter((e) => e.id !== CURRENT_USER_ID);
  return searchEmployees(empSearch.value).filter((e) => e.id !== CURRENT_USER_ID);
});

const reset = () => {
  mode.value = "choice";
  forSelf.value = true;
  selectedEmployee.value = null;
  empSearch.value = "";
  type.value = "";
  motif.value = "";
  typeDropdownOpen.value = false;
};

const handleClose = () => {
  reset();
  emit('update:open', false);
};

const handleSubmit = () => {
  const empId = forSelf.value ? CURRENT_USER_ID : selectedEmployee.value?.id;
  if (!empId || !type.value) return;
  emit('submit', empId, type.value, motif.value);
  handleClose();
};

const chooseMode = (self: boolean) => {
  forSelf.value = self;
  if (self) {
    selectedEmployee.value = getEmployee(CURRENT_USER_ID) || null;
  }
  mode.value = "form";
};

const getAvatar = () => {
  const e = forSelf.value ? getEmployee(CURRENT_USER_ID) : selectedEmployee.value;
  return e?.avatar || "?";
};

const getEmpName = () => {
  const e = forSelf.value ? getEmployee(CURRENT_USER_ID) : selectedEmployee.value;
  return e ? `${e.prenom} ${e.nom}` : "";
};

const getEmpPoste = () => {
  const e = forSelf.value ? getEmployee(CURRENT_USER_ID) : selectedEmployee.value;
  return e?.poste;
};

const getEmpDept = () => {
  const e = forSelf.value ? getEmployee(CURRENT_USER_ID) : selectedEmployee.value;
  return e?.departement;
};
</script>

<template>
  <Dialog :open="open" @update:open="(val) => { if (!val) handleClose(); else emit('update:open', true); }">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nouvelle Demande</DialogTitle>
      </DialogHeader>

      <div v-if="mode === 'choice'" class="grid grid-cols-2 gap-4 py-4">
        <button
          @click="chooseMode(true)"
          class="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-muted/50 transition-all"
        >
          <User class="h-8 w-8 text-primary" />
          <span class="font-medium">Pour moi</span>
        </button>
        <button
          @click="chooseMode(false)"
          class="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-muted/50 transition-all"
        >
          <Users class="h-8 w-8 text-primary" />
          <span class="font-medium">Pour un employé</span>
        </button>
      </div>

      <div v-else-if="mode === 'form'" class="space-y-4 py-2">
        <template v-if="!forSelf && !selectedEmployee">
          <div class="space-y-3">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                v-model="empSearch"
                class="pl-9"
                autofocus
              />
            </div>
            <div class="max-h-48 overflow-y-auto rounded-lg border divide-y">
              <button
                v-for="emp in filteredEmployees"
                :key="emp.id"
                @click="selectedEmployee = emp"
                class="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <EmployeeAvatar :initials="emp.avatar" size="sm" />
                <div>
                  <p class="text-sm font-medium">{{ emp.prenom }} {{ emp.nom }}</p>
                  <p class="text-xs text-muted-foreground">{{ emp.poste }}</p>
                </div>
              </button>
            </div>
          </div>
        </template>

        <template v-if="forSelf || selectedEmployee">
          <!-- Profile card -->
          <div class="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
            <EmployeeAvatar :initials="getAvatar()" size="lg" />
            <div>
              <p class="font-semibold">{{ getEmpName() }}</p>
              <p class="text-sm text-muted-foreground">{{ getEmpPoste() }}</p>
              <p class="text-xs text-muted-foreground">{{ getEmpDept() }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Type d'attestation *</label>
            <Popover v-model:open="typeDropdownOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" role="combobox" :aria-expanded="typeDropdownOpen" class="w-full justify-between font-normal" :class="!type && 'text-muted-foreground text-left'">
                  <span class="truncate">{{ type ? type : 'Sélectionner un type...' }}</span>
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher un type d'attestation..." />
                  <CommandEmpty>Aucun type trouvé.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="t in TYPES_ATTESTATION"
                        :key="t"
                        :value="t"
                        @select="() => { type = t; typeDropdownOpen = false; }"
                      >
                        <Check :class="['mr-2 h-4 w-4 shrink-0', type === t ? 'opacity-100' : 'opacity-0']" />
                        <span class="truncate">{{ t }}</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Motif <span class="text-muted-foreground">(facultatif)</span></label>
            <Textarea
              placeholder="Précisez le motif de votre demande..."
              v-model="motif"
              :rows="3"
            />
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button variant="outline" @click="handleClose">Annuler</Button>
            <Button @click="handleSubmit" :disabled="!type">Soumettre</Button>
          </div>
        </template>

        <div v-if="!forSelf && !selectedEmployee" class="flex justify-start">
          <Button variant="ghost" @click="mode = 'choice'">← Retour</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
