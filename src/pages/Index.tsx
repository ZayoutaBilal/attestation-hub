import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileSpreadsheet, BarChart3, ClipboardList, Shield } from "lucide-react";
import { DemandeTable } from "@/components/attestation/DemandeTable";
import { FilterBar } from "@/components/attestation/FilterBar";
import { NouvelleDemandeModal } from "@/components/attestation/NouvelleDemandeModal";
import { DetailModal } from "@/components/attestation/DetailModal";
import { AnalyseDashboard } from "@/components/attestation/AnalyseDashboard";
import {
  loadDemandes,
  creerDemande,
  updateStatut,
  filterDemandes,
  exportToCSV,
  downloadCSV,
  CURRENT_USER_ID,
  type Demande,
} from "@/lib/attestation-logic";
import { toast } from "sonner";

export default function Index() {
  const [demandes, setDemandes] = useState<Demande[]>(loadDemandes);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailDemande, setDetailDemande] = useState<Demande | null>(null);

  const mesDemandes = useMemo(() => demandes.filter((d) => d.employeeId === CURRENT_USER_ID), [demandes]);
  const filteredRH = useMemo(() => filterDemandes(demandes, search, statusFilter), [demandes, search, statusFilter]);
  const filteredMes = useMemo(() => filterDemandes(mesDemandes, search, statusFilter), [mesDemandes, search, statusFilter]);

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
    const updated = updateStatut(id, "rejetee");
    setDemandes(updated);
    toast("Demande rejetée", { description: "Le statut a été mis à jour." });
  }, []);

  const handleExport = (data: Demande[]) => {
    const csv = exportToCSV(data);
    downloadCSV(csv, `attestations_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Export CSV téléchargé");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Gestion des Attestations</h1>
              <p className="text-xs text-muted-foreground">Portail RH — Entreprise SARL</p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="mes-demandes" className="space-y-6">
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
              <div>
                <h2 className="text-xl font-semibold">Mes Demandes</h2>
                <p className="text-sm text-muted-foreground">{mesDemandes.length} demande(s) au total</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(filteredMes)}>
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
            <FilterBar search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
            <div className="rounded-lg border bg-card overflow-hidden">
              <DemandeTable demandes={filteredMes} showActions={false} onVoirDetails={setDetailDemande} />
            </div>
          </TabsContent>

          {/* Gestion RH */}
          <TabsContent value="gestion-rh" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Gestion RH</h2>
                <p className="text-sm text-muted-foreground">{demandes.length} demande(s) — Toutes les demandes</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(filteredRH)}>
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
            <FilterBar search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
            <div className="rounded-lg border bg-card overflow-hidden">
              <DemandeTable
                demandes={filteredRH}
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
      <DetailModal demande={detailDemande} open={!!detailDemande} onClose={() => setDetailDemande(null)} />
    </div>
  );
}
