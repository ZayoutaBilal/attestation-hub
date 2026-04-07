<script setup lang="ts">
import { ref } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejetModalProps {
  open: boolean;
  reference: string;
}

const props = defineProps<RejetModalProps>();
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'confirm', motif: string): void;
}>();

const motif = ref("");

const handleConfirm = () => {
  if (!motif.value.trim()) return;
  emit('confirm', motif.value.trim());
  motif.value = "";
};

const handleClose = () => {
  motif.value = "";
  emit('update:open', false);
};
</script>

<template>
  <Dialog :open="open" @update:open="(val) => { if (!val) handleClose(); else emit('update:open', true); }">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rejeter la demande {{ reference }}</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Motif du rejet <span class="text-destructive">*</span></label>
          <Textarea
            placeholder="Veuillez saisir le motif du rejet..."
            v-model="motif"
            :rows="4"
            autofocus
          />
        </div>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="handleClose">Annuler</Button>
          <Button variant="destructive" @click="handleConfirm" :disabled="!motif.trim()">
            Confirmer le rejet
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
