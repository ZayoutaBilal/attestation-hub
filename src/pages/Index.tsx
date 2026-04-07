import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Download, BarChart3, ClipboardList, Shield } from "lucide-react";
import { DemandeTable } from "@/components/attestation/DemandeTable";
import { FilterBar } from "@/components/attestation/FilterBar";
import { NouvelleDemandeModal } from "@/components/attestation/NouvelleDemandeModal";
import { DetailModal } from "@/components/attestation/DetailModal";
import { RejetModal } from "@/components/attestation/RejetModal";
import { AnalyseDashboard } from "@/components/attestation/AnalyseDashboard";
import { StatCard } from "@/components/attestation/StatCard";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  loadDemandes,
  creerDemande,
  updateStatut,
  confirmerRetrait,
  filterDemandes,
  exportToXLSXData,
  getStats,
  CURRENT_USER_ID,
  type Demande,
  type FilterOptions,
} from "@/lib/attestation-logic";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Index() {
  const [demandes, setDemandes] = useState<Demande[]>(loadDemandes);
  const [activeTab, setActiveTab] = useState("mes-demandes");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [recupereeFilter, setRecupereeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailDemande, setDetailDemande] = useState<Demande | null>(null);
  const [rejetDemandeId, setRejetDemandeId] = useState<string | null>(null);

  const filters: FilterOptions = useMemo(() => ({
    search, statusFilter, typeFilter, dateFilter, recupereeFilter,
  }), [search, statusFilter, typeFilter, dateFilter, recupereeFilter]);

  const isRH = activeTab === "gestion-rh" || activeTab === "analyse";
  const baseDemandes = useMemo(() => isRH ? demandes : demandes.filter((d) => d.employeeId === CURRENT_USER_ID), [demandes, isRH]);
  const stats = useMemo(() => getStats(baseDemandes), [baseDemandes]);
  const filtered = useMemo(() => filterDemandes(baseDemandes, filters), [baseDemandes, filters]);

  const rejetDemande = useMemo(() => demandes.find((d) => d.id === rejetDemandeId), [demandes, rejetDemandeId]);

  const handleSubmit = useCallback((employeeId: string, type: string, motif: string) => {
    creerDemande(employeeId, type, motif);
    setDemandes(loadDemandes());
    toast.success("Demande créée avec succès");
  }, []);

  const handleValider = useCallback((id: string) => {
    const updated = updateStatut(id, "validee");
    setDemandes(updated);
    toast.success("Demande validée");
  }, []);

  const handleRejeter = useCallback((id: string) => {
    setRejetDemandeId(id);
  }, []);

  const handleConfirmRejet = useCallback((motif: string) => {
    if (!rejetDemandeId) return;
    const updated = updateStatut(rejetDemandeId, "rejetee", motif);
    setDemandes(updated);
    setRejetDemandeId(null);
    toast("Demande rejetée", { description: "Le motif a été enregistré." });
  }, [rejetDemandeId]);

  const handleConfirmerRetrait = useCallback((id: string) => {
    const updated = confirmerRetrait(id);
    setDemandes(updated);
    const updatedDemande = updated.find((d) => d.id === id);
    if (updatedDemande) setDetailDemande(updatedDemande);
    toast.success("Retrait confirmé");
  }, []);

  const handleExport = (data: Demande[]) => {
    const xlsxData = exportToXLSXData(data);
    const ws = XLSX.utils.json_to_sheet(xlsxData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attestations");
    XLSX.writeFile(wb, `attestations_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Export Excel téléchargé");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestion des Attestations</h1>
            <p className="text-sm text-muted-foreground">Portail RH — Entreprise SARL</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total des demandes" value={stats.total} icon={FileText} variant="default" />
          <StatCard title="En attente" value={stats.enAttente} icon={Clock} variant="pending" />
          <StatCard title="Validées" value={stats.validees} icon={CheckCircle} variant="approved" />
          <StatCard title="Rejetées" value={stats.rejetees} icon={XCircle} variant="rejected" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted p-1 h-auto">
            <TabsTrigger value="mes-demandes" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ClipboardList className="h-4 w-4" />
              Mes Demandes
            </TabsTrigger>
            <TabsTrigger value="gestion-rh" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" />
              Gestion RH
            </TabsTrigger>
            <TabsTrigger value="analyse" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              Analyse
            </TabsTrigger>
          </TabsList>

          {/* Mes Demandes */}
          <TabsContent value="mes-demandes" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filtered.length} demande(s)</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(filtered)}>
                <Download className="h-4 w-4" />
                Exporter .xlsx
              </Button>
            </div>
            <FilterBar
              search={search} onSearchChange={setSearch}
              statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
              dateFilter={dateFilter} onDateFilterChange={setDateFilter}
              recupereeFilter={recupereeFilter} onRecupereeFilterChange={setRecupereeFilter}
            />
            <div className="rounded-lg border bg-card overflow-hidden">
              <DemandeTable demandes={filtered} showActions={false} onVoirDetails={setDetailDemande} />
            </div>
          </TabsContent>

          {/* Gestion RH */}
          <TabsContent value="gestion-rh" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filtered.length} demande(s)</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(filtered)}>
                <Download className="h-4 w-4" />
                Exporter .xlsx
              </Button>
            </div>
            <FilterBar
              search={search} onSearchChange={setSearch}
              statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
              dateFilter={dateFilter} onDateFilterChange={setDateFilter}
              recupereeFilter={recupereeFilter} onRecupereeFilterChange={setRecupereeFilter}
            />
            <div className="rounded-lg border bg-card overflow-hidden">
              <DemandeTable
                demandes={filtered}
                showActions
                onValider={handleValider}
                onRejeter={handleRejeter}
                onVoirDetails={setDetailDemande}
              />
            </div>
          </TabsContent>

          {/* Analyse */}
          <TabsContent value="analyse">
            <AnalyseDashboard demandes={demandes} />
          </TabsContent>
        </Tabs>
      </main>

      <NouvelleDemandeModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      <DetailModal demande={detailDemande} open={!!detailDemande} onClose={() => setDetailDemande(null)} onConfirmerRetrait={handleConfirmerRetrait} />
      <RejetModal
        open={!!rejetDemandeId}
        onClose={() => setRejetDemandeId(null)}
        onConfirm={handleConfirmRejet}
        reference={rejetDemande?.reference || ""}
      />
    </div>
  );
}
