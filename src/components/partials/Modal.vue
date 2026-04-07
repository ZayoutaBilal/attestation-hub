<template>
  <!-- Modal Overlay - Teleported to body to escape parent stacking contexts -->
  <Teleport to="body">
    <Transition :name="transitionName">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] flex bg-black/50"
        :class="overlayClass"
        @click.self="closeModal"
      >
        <!-- Modal Container -->
        <div
          class="bg-white shadow-xl flex flex-col"
          :class="[modalClass, sizeClass, placementClass]"
        >
        <!-- Fixed Header -->
        <div class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900">{{ title }}</h2>
            <button
              v-if="showCloseButton"
              @click="handleCancel"
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content Slot - Scrollable -->
        <div class="flex-1 overflow-y-auto thin-scrollbar">
          <div class="px-4 py-4 sm:px-5 sm:py-5 md:px-6">
            <slot></slot>
          </div>
        </div>

        <!-- Footer Slot -->
        <div
          v-if="showFooter && $slots.footer"
          class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 border-t border-gray-200 flex-shrink-0"
        >
          <slot name="footer" :close="handleCancel" :validate="handleValidate"></slot>
        </div>

        <!-- Default Footer (only shown if showFooter is true and no footer slot provided) -->
        <div
          v-else-if="showFooter"
          class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 flex-shrink-0"
        >
          <button
            @click="handleCancel"
            type="button"
            class="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-600 font-medium py-2.5 px-5 sm:px-6 rounded-lg border-2 border-blue-600 transition-colors text-sm"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleValidate"
            type="button"
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 sm:px-6 rounded-lg transition-colors text-sm"
          >
            {{ validateText }}
          </button>
        </div>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  cancelText: {
    type: String,
    default: 'Annuler',
  },
  validateText: {
    type: String,
    default: 'Valider',
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) =>
      ['small', 'medium', 'large', 'xl', '2xl', '3xl', '4xl', 'full'].includes(value),
  },
  placement: {
    type: String,
    default: 'center',
    validator: (value) => ['center', 'right', 'left'].includes(value),
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'cancel', 'validate'])

// Computed Classes
const overlayClass = computed(() => {
  switch (props.placement) {
    case 'right':
      return 'justify-end'
    case 'left':
      return 'justify-start'
    case 'center':
    default:
      return 'items-center justify-center'
  }
})

const modalClass = computed(() => {
  if (props.placement === 'center') {
    return 'rounded-xl sm:rounded-2xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh]'
  }
  // For right and left sidebars
  return 'h-full'
})

const sizeClass = computed(() => {
  // Center modal sizes
  if (props.placement === 'center') {
    switch (props.size) {
      case 'small':
        return 'max-w-[95vw] sm:max-w-md w-full'
      case 'medium':
        return 'max-w-[95vw] sm:max-w-lg w-full'
      case 'large':
        return 'max-w-[95vw] sm:max-w-2xl w-full'
      case 'xl':
        return 'max-w-[95vw] sm:max-w-4xl w-full'
      case '2xl':
        return 'max-w-[95vw] sm:max-w-5xl w-full'
      case '3xl':
        return 'max-w-[95vw] sm:max-w-6xl w-full'
      case '4xl':
        return 'max-w-[95vw] sm:max-w-7xl w-full'
      case 'full':
        return 'max-w-[95vw] sm:max-w-[1400px] w-full'
      default:
        return 'max-w-[95vw] sm:max-w-lg w-full'
    }
  }

  // Sidebar (right/left) sizes - responsive
  switch (props.size) {
    case 'small':
      return 'w-full sm:w-80'
    case 'medium':
      return 'w-full sm:w-96'
    case 'large':
      return 'w-full sm:w-[500px] md:w-[600px]'
    case 'xl':
      return 'w-full sm:w-[600px] md:w-[800px]'
    case '2xl':
      return 'w-full sm:w-[700px] md:w-[900px]'
    case '3xl':
      return 'w-full sm:w-[800px] md:w-[1000px]'
    case '4xl':
      return 'w-full sm:w-[900px] md:w-[1100px]'
    case 'full':
      return 'w-full'
    default:
      return 'w-full sm:w-96'
  }
})

const placementClass = computed(() => {
  return props.placement
})

const transitionName = computed(() => {
  switch (props.placement) {
    case 'right':
      return 'slide-right'
    case 'left':
      return 'slide-left'
    case 'center':
    default:
      return 'modal-fade'
  }
})

// Methods
const closeModal = () => {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
  emit('close')
}

const handleValidate = () => {
  emit('validate')
}
</script>

<style scoped>
/* Thin scrollbar - applied to .thin-scrollbar class */
.thin-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.thin-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.thin-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.12);
  border-radius: 9999px;
}

.thin-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.22);
}

.thin-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
}

/* Also apply thin scrollbar to ALL nested scrollable elements inside the modal */
:deep(*) {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
}

:deep(*)::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

:deep(*)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(*)::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.12);
  border-radius: 9999px;
}

:deep(*)::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.22);
}

/* Center Modal Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .bg-white {
  transform: scale(0.95);
}

.modal-fade-leave-to .bg-white {
  transform: scale(0.95);
}

/* Right Slide Transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-leave-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from .bg-white {
  transform: translateX(100%);
}

.slide-right-leave-to .bg-white {
  transform: translateX(100%);
}

/* Left Slide Transition */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: opacity 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
}

.slide-left-enter-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-leave-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from .bg-white {
  transform: translateX(-100%);
}

.slide-left-leave-to .bg-white {
  transform: translateX(-100%);
}
</style>
