<template>
    <div class="p-6">
        <!-- Table Header -->
        <div class="mb-6">
            <TableHeader @search="handleSearch" @filter="handleFilter" @date-range-change="handleDateRangeChange" />
        </div>

        <!-- Data Table -->
        <Datatable title="Demandes d'attestations" :columns="columns" :items="filteredRequests" :show-pagination="false"
            @row-clicked="handleRowClick">
            <!-- Custom slot for employee name with avatar and email -->
            <template #cell-employee="{ item }">
                <div class="flex items-center gap-3">
                    <input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        @click.stop />
                    <img :src="item.avatar" :alt="item.name" class="w-10 h-10 rounded-full object-cover" />
                    <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
                        <span class="text-xs text-gray-500">{{ item.email }}</span>
                    </div>
                </div>
            </template>

            <!-- Custom slot for certificate type -->
            <template #cell-certificateType="{ item }">
                <span class="text-sm text-gray-700">{{ item.certificateType }}</span>
            </template>

            <!-- Custom slot for request date -->
            <template #cell-requestDate="{ item }">
                <span class="text-sm text-gray-700">{{ item.requestDate }}</span>
            </template>
        </Datatable>

        <!-- Attestation Details Modal -->
        <Modal v-model="showModal" title="Attestation de travail" size="full" :show-footer="false">
            <div class="flex h-full -mx-6 -my-6">
                <!-- Far Left Sidebar - Page Navigation -->
                <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <!-- Search Box -->
                    <div class="p-4 border-b border-gray-200">
                        <div class="relative">
                            <input type="text" placeholder="Recherche"
                                class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </div>
                    </div>

                    <!-- Page List -->
                    <div class="flex-1 overflow-y-auto p-4 space-y-3">
                        <div v-for="page in 3" :key="page"
                            class="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all">
                            <div
                                class="aspect-[8.5/11] bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
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
                            <span class="text-sm text-gray-600">sur 1</span>
                        </div>

                        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg class="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>

                        <div class="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                            <button class="p-2 hover:bg-white rounded-md transition-colors">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                                </svg>
                            </button>
                            <select
                                class="px-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none cursor-pointer">
                                <option>70%</option>
                                <option>100%</option>
                                <option>150%</option>
                                <option>200%</option>
                            </select>
                            <button class="p-2 hover:bg-white rounded-md transition-colors">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        </div>
                    </div>

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
                        <!-- Action Buttons -->
                        <div class="flex gap-3 mb-6">
                            <button
                                class="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                Imprimer
                            </button>
                            <button
                                class="flex-1 px-4 py-2.5 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors">
                                Télécharger
                            </button>
                        </div>

                        <!-- Details Section -->
                        <h3 class="text-lg font-bold text-gray-900 mb-6">Détails de la demande</h3>

                        <div class="space-y-5">
                            <!-- Employee Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom employé</label>
                                <input type="text" :value="props.selectedRequest?.name" disabled
                                    class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-900">
                            </div>

                            <!-- Job Title -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Intitulé de poste</label>
                                <input type="text" value="Product Designer" disabled
                                    class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                            </div>

                            <!-- Attestation Type -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Type d'attestation</label>
                                <input type="text" :value="props.selectedRequest?.certificateType" disabled
                                    class="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                            </div>

                            <!-- Submission Date -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Date de soumission</label>
                                <input type="text" value="23/05/2024" disabled
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
                        </div>
                    </div>

                    <!-- Footer Buttons -->
                    <div class="p-6 border-t border-gray-200 flex gap-3">
                        <button @click="rejectRequest"
                            class="flex-1 px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                            Rejeter
                        </button>
                        <button @click="validateRequest"
                            class="flex-1 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TableHeader from '@/components/datatable/TableHeader.vue'
import Datatable from '@/components/datatable/Datatable.vue'
import Modal from '@/components/partials/Modal.vue'

// Search and filter state
const searchQuery = ref('')
const dateRange = ref({ start: null, end: null })

// Modal state
const showModal = ref(false)
const comment = ref('')
const props = defineProps({
    props.selectedRequest: Object
})

// Table columns configuration
const columns = [
    {
        key: 'employee',
        label: 'Nom de l\'employé',
        type: 'custom',
        width: '400px'
    },
    {
        key: 'certificateType',
        label: 'Type d\'attestation demandé',
        type: 'custom',
        width: '1fr'
    },
    {
        key: 'requestDate',
        label: 'Date de la demande',
        type: 'custom',
        width: '200px'
    }
]

// Certificate requests data
const requests = ref([
    {
        id: 1,
        name: 'Carl Hunter',
        email: 'hunter@smalter.com',
        avatar: 'https://i.pravatar.cc/150?img=12',
        certificateType: 'Attestation de travail',
        requestDate: 'Jan 13, 2024'
    },
    {
        id: 2,
        name: 'Assan Diop',
        email: 'diop@@smalter.com',
        avatar: 'https://i.pravatar.cc/150?img=33',
        certificateType: 'Attestation de salaire',
        requestDate: 'Jan 13, 2024'
    },
    {
        id: 3,
        name: 'Sherlok Grace',
        email: 'Grace@smalter.com',
        avatar: 'https://i.pravatar.cc/150?img=14',
        certificateType: 'Bulletin de paie',
        requestDate: 'Jan 13, 2024'
    },
    {
        id: 4,
        name: 'Olivia Nobona',
        email: 'Nobona@smalter.com',
        avatar: 'https://i.pravatar.cc/150?img=45',
        certificateType: 'Attestation de salaire',
        requestDate: 'Jan 13, 2024'
    },
    {
        id: 5,
        name: 'Hope Phantom',
        email: 'phantom@@smalter.com',
        avatar: 'https://i.pravatar.cc/150?img=47',
        certificateType: 'Bulletin de paie',
        requestDate: 'Jan 13, 2024'
    }
])

// Computed property for filtered requests
const filteredRequests = computed(() => {
    let result = requests.value

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(request =>
            request.name.toLowerCase().includes(query) ||
            request.email.toLowerCase().includes(query) ||
            request.certificateType.toLowerCase().includes(query)
        )
    }

    return result
})

// Methods
const handleSearch = (query) => {
    searchQuery.value = query
}

const handleFilter = () => {
    // Open filter modal/drawer
    console.log('Open filters')
}

const handleDateRangeChange = (range) => {
    dateRange.value = range
    console.log('Date range changed:', range)
}

const handleRowClick = (data) => {
    openRequestModal(data.item)
}

const openRequestModal = (request) => {
    props.selectedRequest.value = request
    comment.value = ''
    showModal.value = true
}

const rejectRequest = () => {
    console.log('Request rejected:', props.selectedRequest.value)
    console.log('Comment:', comment.value)
    // Add your reject logic here
    showModal.value = false
}

const validateRequest = () => {
    console.log('Request validated:', props.selectedRequest.value)
    console.log('Comment:', comment.value)
    // Add your validation logic here
    showModal.value = false
}
</script>

<style scoped></style>