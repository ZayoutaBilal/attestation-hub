// ===== PURE LOGIC LAYER — No UI, easy to port to Vue.js =====

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
  avatar: string;
}

export interface Demande {
  id: string;
  reference: string;
  employeeId: string;
  type: string;
  motif: string;
  dateDemande: string;
  statut: "en_attente" | "validee" | "rejetee";
  dateValidation?: string;
  dateRetrait?: string;
  motifRejet?: string;
  recuperee?: boolean;
}

export const TYPES_ATTESTATION = [
  "Attestation de travail",
  "Attestation de salaire",
  "Attestation de stage",
  "Attestation de domiciliation",
  "Attestation de congé",
  "Certificat de travail",
];

const STORAGE_KEY_DEMANDES = "attestation_demandes";
const STORAGE_KEY_COUNTER = "attestation_counter";

// ---- Mock employees ----
export const EMPLOYEES: Employee[] = [
  { id: "e1", nom: "Benali", prenom: "Amina", poste: "Développeuse Full-Stack", departement: "IT", avatar: "AB" },
  { id: "e2", nom: "Haddad", prenom: "Youssef", poste: "Chef de Projet", departement: "Management", avatar: "YH" },
  { id: "e3", nom: "Khelifi", prenom: "Sara", poste: "Analyste Financier", departement: "Finance", avatar: "SK" },
  { id: "e4", nom: "Mebarki", prenom: "Karim", poste: "Responsable RH", departement: "Ressources Humaines", avatar: "KM" },
  { id: "e5", nom: "Bouzid", prenom: "Fatima", poste: "Comptable Senior", departement: "Finance", avatar: "FB" },
  { id: "e6", nom: "Taleb", prenom: "Omar", poste: "Designer UX/UI", departement: "IT", avatar: "OT" },
  { id: "e7", nom: "Rahmani", prenom: "Nadia", poste: "Ingénieure QA", departement: "IT", avatar: "NR" },
  { id: "e8", nom: "Ferhat", prenom: "Mourad", poste: "Directeur Commercial", departement: "Ventes", avatar: "MF" },
];

export const CURRENT_USER_ID = "e1";

// ---- Persistence ----
function getCounter(): number {
  const val = localStorage.getItem(STORAGE_KEY_COUNTER);
  return val ? parseInt(val, 10) : 0;
}

function setCounter(n: number) {
  localStorage.setItem(STORAGE_KEY_COUNTER, String(n));
}

function generateReference(): string {
  const next = getCounter() + 1;
  setCounter(next);
  return `DEM-${String(next).padStart(3, "0")}`;
}

export function loadDemandes(): Demande[] {
  const raw = localStorage.getItem(STORAGE_KEY_DEMANDES);
  if (raw) return JSON.parse(raw);
  const seed = generateSeedData();
  saveDemandes(seed);
  return seed;
}

export function saveDemandes(demandes: Demande[]) {
  localStorage.setItem(STORAGE_KEY_DEMANDES, JSON.stringify(demandes));
}

function generateSeedData(): Demande[] {
  const seeds: Omit<Demande, "id" | "reference">[] = [
    { employeeId: "e1", type: "Attestation de travail", motif: "Demande bancaire", dateDemande: "2025-04-01", statut: "en_attente" },
    { employeeId: "e2", type: "Attestation de salaire", motif: "Dossier location", dateDemande: "2025-03-28", statut: "validee", dateValidation: "2025-03-30", recuperee: true, dateRetrait: "2025-03-31" },
    { employeeId: "e3", type: "Certificat de travail", motif: "", dateDemande: "2025-03-25", statut: "rejetee", motifRejet: "Informations incomplètes" },
    { employeeId: "e1", type: "Attestation de congé", motif: "Voyage", dateDemande: "2025-03-20", statut: "validee", dateValidation: "2025-03-22" },
    { employeeId: "e5", type: "Attestation de domiciliation", motif: "", dateDemande: "2025-04-03", statut: "en_attente" },
    { employeeId: "e6", type: "Attestation de travail", motif: "Visa", dateDemande: "2025-04-02", statut: "en_attente" },
    { employeeId: "e7", type: "Attestation de salaire", motif: "Crédit immobilier", dateDemande: "2025-03-15", statut: "validee", dateValidation: "2025-03-17", recuperee: true, dateRetrait: "2025-03-20" },
    { employeeId: "e8", type: "Attestation de stage", motif: "", dateDemande: "2025-03-10", statut: "validee", dateValidation: "2025-03-12" },
  ];
  return seeds.map((s) => ({
    ...s,
    id: crypto.randomUUID(),
    reference: generateReference(),
  }));
}

// ---- CRUD ----
export function creerDemande(employeeId: string, type: string, motif: string): Demande {
  const demande: Demande = {
    id: crypto.randomUUID(),
    reference: generateReference(),
    employeeId,
    type,
    motif,
    dateDemande: new Date().toISOString().slice(0, 10),
    statut: "en_attente",
  };
  const all = loadDemandes();
  all.unshift(demande);
  saveDemandes(all);
  return demande;
}

export function updateStatut(demandeId: string, statut: "validee" | "rejetee", motifRejet?: string): Demande[] {
  const all = loadDemandes();
  const idx = all.findIndex((d) => d.id === demandeId);
  if (idx !== -1) {
    all[idx].statut = statut;
    if (statut === "validee") {
      all[idx].dateValidation = new Date().toISOString().slice(0, 10);
    }
    if (statut === "rejetee" && motifRejet) {
      all[idx].motifRejet = motifRejet;
    }
  }
  saveDemandes(all);
  return all;
}

export function confirmerRetrait(demandeId: string): Demande[] {
  const all = loadDemandes();
  const idx = all.findIndex((d) => d.id === demandeId);
  if (idx !== -1) {
    all[idx].recuperee = true;
    all[idx].dateRetrait = new Date().toISOString().slice(0, 10);
  }
  saveDemandes(all);
  return all;
}

// ---- Helpers ----
export function getEmployee(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id);
}

export function getEmployeeFullName(id: string): string {
  const emp = getEmployee(id);
  return emp ? `${emp.prenom} ${emp.nom}` : "Inconnu";
}

export function searchEmployees(query: string): Employee[] {
  const q = query.toLowerCase();
  return EMPLOYEES.filter(
    (e) =>
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.poste.toLowerCase().includes(q)
  );
}

export interface FilterOptions {
  search: string;
  statusFilter: string;
  typeFilter: string;
  dateFilter: string;
  recupereeFilter: string;
}

export function filterDemandes(demandes: Demande[], filters: FilterOptions): Demande[] {
  let filtered = demandes;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((d) => {
      const name = getEmployeeFullName(d.employeeId).toLowerCase();
      return name.includes(q) || d.reference.toLowerCase().includes(q);
    });
  }
  if (filters.statusFilter && filters.statusFilter !== "all") {
    filtered = filtered.filter((d) => d.statut === filters.statusFilter);
  }
  if (filters.typeFilter && filters.typeFilter !== "all") {
    filtered = filtered.filter((d) => d.type === filters.typeFilter);
  }
  if (filters.dateFilter) {
    filtered = filtered.filter((d) => d.dateDemande === filters.dateFilter);
  }
  if (filters.recupereeFilter && filters.recupereeFilter !== "all") {
    if (filters.recupereeFilter === "oui") {
      filtered = filtered.filter((d) => d.recuperee === true);
    } else {
      filtered = filtered.filter((d) => !d.recuperee);
    }
  }
  return filtered;
}

export function getStats(demandes: Demande[]) {
  return {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.statut === "en_attente").length,
    validees: demandes.filter((d) => d.statut === "validee").length,
    rejetees: demandes.filter((d) => d.statut === "rejetee").length,
  };
}

export function getTypeDistribution(demandes: Demande[]) {
  const map: Record<string, number> = {};
  demandes.forEach((d) => {
    map[d.type] = (map[d.type] || 0) + 1;
  });
  return Object.entries(map).map(([type, count]) => ({ type, count }));
}

export function exportToCSV(demandes: Demande[]): string {
  const header = "Référence,Employé,Type,Date,Statut,Motif,Récupérée\n";
  const rows = demandes.map((d) => {
    const name = getEmployeeFullName(d.employeeId);
    const statut = d.statut === "en_attente" ? "En attente" : d.statut === "validee" ? "Validée" : "Rejetée";
    return `${d.reference},"${name}","${d.type}",${d.dateDemande},${statut},"${d.motif}",${d.recuperee ? "Oui" : "Non"}`;
  });
  return header + rows.join("\n");
}

export function exportToXLSXData(demandes: Demande[]) {
  return demandes.map((d) => ({
    "Référence": d.reference,
    "Employé": getEmployeeFullName(d.employeeId),
    "Type": d.type,
    "Date demande": d.dateDemande,
    "Statut": d.statut === "en_attente" ? "En attente" : d.statut === "validee" ? "Validée" : "Rejetée",
    "Motif": d.motif,
    "Date validation": d.dateValidation || "",
    "Récupérée": d.recuperee ? "Oui" : "Non",
    "Date retrait": d.dateRetrait || "",
    "Motif rejet": d.motifRejet || "",
  }));
}

export function generatePDFBlob(demande: Demande): Blob {
  const emp = getEmployee(demande.employeeId);
  const statut = demande.statut === "en_attente" ? "En attente" : demande.statut === "validee" ? "Validée" : "Rejetée";
  
  // Build a proper PDF manually
  const employeeName = emp ? `${emp.prenom} ${emp.nom}` : "N/A";
  const poste = emp?.poste || "N/A";
  const departement = emp?.departement || "N/A";
  const dateStr = new Date().toLocaleDateString("fr-FR");
  
  const lines = [
    "ENTREPRISE SARL",
    "123 Rue du Commerce, Alger",
    "Tel: +213 21 00 00 00",
    "",
    demande.type.toUpperCase(),
    "",
    `Reference: ${demande.reference}`,
    `Date: ${demande.dateDemande}`,
    `Statut: ${statut}`,
    "",
    "Nous soussignes, certifions que :",
    "",
    `Nom complet : ${employeeName}`,
    `Poste : ${poste}`,
    `Departement : ${departement}`,
  ];
  if (demande.motif) lines.push(`Motif : ${demande.motif}`);
  lines.push(
    "",
    "est bien employe(e) au sein de notre entreprise.",
    "",
    "Cette attestation est delivree a l'interesse(e) pour",
    "servir et valoir ce que de droit.",
    "",
    `Fait a Alger, le ${dateStr}`,
    "",
    "Signature et Cachet",
    "Direction des Ressources Humaines"
  );

  // Minimal valid PDF
  const fontSize = 12;
  const leading = 16;
  const marginLeft = 50;
  const pageHeight = 842;
  const pageWidth = 595;
  let yPos = pageHeight - 50;

  const streamLines: string[] = [];
  streamLines.push("BT");
  streamLines.push(`/F1 ${fontSize} Tf`);
  
  for (const line of lines) {
    if (yPos < 50) break;
    streamLines.push(`${marginLeft} ${yPos} Td`);
    // Escape special chars for PDF
    const safe = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    streamLines.push(`(${safe}) Tj`);
    streamLines.push(`${-marginLeft} ${-leading} Td`);
    yPos -= leading;
  }
  streamLines.push("ET");
  
  const stream = streamLines.join("\n");
  
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length ${stream.length} >>
stream
${stream}
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000282 00000 n 
${String(300 + stream.length).padStart(10, "0")} 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>
startxref
${350 + stream.length}
%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}
