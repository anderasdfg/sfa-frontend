/**
 * Datos de medicamentos y plantillas de prescripción
 * Incluye medicamentos comunes en Perú con sus nombres comerciales y genéricos
 */

export interface Medication {
  name: string
  generic: string
  dosageForm?: string
  concentration?: string
  atcCode?: string // Código ATC (Anatomical Therapeutic Chemical)
}

export interface PrescriptionTemplate {
  id: number
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  category: 'common' | 'antibiotics' | 'analgesics' | 'respiratory' | 'cardiovascular' | 'other'
}

export interface MedicationCategory {
  id: string
  name: string
  medications: Medication[]
}

/**
 * Lista de medicamentos comunes en Perú
 * Incluye nombres comerciales, genéricos y presentaciones
 */
export const MEDICATION_CATEGORIES: MedicationCategory[] = [
  {
    id: 'analgesics',
    name: 'Analgésicos y Antipiréticos',
    medications: [
      { name: "Panadol", generic: "Paracetamol", dosageForm: "Tableta", concentration: "500 mg", atcCode: "N02BE01" },
      { name: "Panadol Forte", generic: "Paracetamol", dosageForm: "Tableta", concentration: "1000 mg", atcCode: "N02BE01" },
      { name: "Panadol Antigripal", generic: "Paracetamol + Fenilefrina + Clorfeniramina", dosageForm: "Tableta", concentration: "500 mg + 5 mg + 2 mg", atcCode: "R05X" },
      { name: "Apronax", generic: "Naproxeno Sódico", dosageForm: "Tableta", concentration: "550 mg", atcCode: "M01AE02" },
      { name: "Dolocordralan Extra Forte", generic: "Paracetamol + Diclofenaco", dosageForm: "Tableta", concentration: "500 mg + 50 mg", atcCode: "N02BE51" },
      { name: "Migra Dorixina", generic: "Clonixinato de Lisina", dosageForm: "Tableta", concentration: "125 mg", atcCode: "N02BG" },
      { name: "Aspirina", generic: "Ácido Acetilsalicílico", dosageForm: "Tableta", concentration: "100 mg", atcCode: "N02BA01" },
      { name: "Dolodran", generic: "Ketoprofeno", dosageForm: "Tableta", concentration: "100 mg", atcCode: "M01AE03" },
      { name: "Redex", generic: "Ibuprofeno", dosageForm: "Tableta", concentration: "400 mg", atcCode: "M01AE01" },
      { name: "Doloral", generic: "Ibuprofeno", dosageForm: "Jarabe", concentration: "100 mg/5 ml", atcCode: "M01AE01" }
    ]
  },
  {
    id: 'antibiotics',
    name: 'Antibióticos',
    medications: [
      { name: "Amoxil", generic: "Amoxicilina", dosageForm: "Cápsula", concentration: "500 mg", atcCode: "J01CA04" },
      { name: "Ciprofloxacino", generic: "Ciprofloxacino", dosageForm: "Tableta", concentration: "500 mg", atcCode: "J01MA02" },
      { name: "Azitromicina", generic: "Azitromicina", dosageForm: "Tableta", concentration: "500 mg", atcCode: "J01FA10" },
      { name: "Bactrim", generic: "Sulfametoxazol + Trimetoprima", dosageForm: "Tableta", concentration: "800 mg + 160 mg", atcCode: "J01EE01" },
      { name: "Ampicilina", generic: "Ampicilina", dosageForm: "Cápsula", concentration: "500 mg", atcCode: "J01CA01" },
      { name: "Cefaclor", generic: "Cefaclor", dosageForm: "Cápsula", concentration: "500 mg", atcCode: "J01DC04" },
      { name: "Claritromicina", generic: "Claritromicina", dosageForm: "Tableta", concentration: "500 mg", atcCode: "J01FA09" },
      { name: "Ceftriaxona", generic: "Ceftriaxona", dosageForm: "Inyectable", concentration: "1 g", atcCode: "J01DD04" },
      { name: "Clindamicina", generic: "Clindamicina", dosageForm: "Cápsula", concentration: "300 mg", atcCode: "J01FF01" }
    ]
  },
  {
    id: 'respiratory',
    name: 'Sistema Respiratorio',
    medications: [
      { name: "Ventolin", generic: "Salbutamol", dosageForm: "Inhalador", concentration: "100 mcg/dosis", atcCode: "R03AC02" },
      { name: "Claritin", generic: "Loratadina", dosageForm: "Tableta", concentration: "10 mg", atcCode: "R06AX13" },
      { name: "Allegra", generic: "Fexofenadina", dosageForm: "Tableta", concentration: "120 mg", atcCode: "R06AX26" },
      { name: "Flutox", generic: "Oxolamina", dosageForm: "Jarabe", concentration: "27 mg/5 ml", atcCode: "R05DB09" },
      { name: "Nastizol Compositum", generic: "Paracetamol + Fenilefrina + Clorfeniramina", dosageForm: "Tableta", concentration: "500 mg + 10 mg + 4 mg", atcCode: "R05X" },
      { name: "Mucosolvan", generic: "Ambroxol", dosageForm: "Jarabe", concentration: "15 mg/5 ml", atcCode: "R05CB06" },
      { name: "Aerius", generic: "Desloratadina", dosageForm: "Tableta", concentration: "5 mg", atcCode: "R06AX27" },
      { name: "Dextrometorfano", generic: "Dextrometorfano", dosageForm: "Jarabe", concentration: "15 mg/5 ml", atcCode: "R05DA09" }
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Sistema Cardiovascular',
    medications: [
      { name: "Losartan", generic: "Losartan", dosageForm: "Tableta", concentration: "50 mg", atcCode: "C09CA01" },
      { name: "Atorvastatina", generic: "Atorvastatina", dosageForm: "Tableta", concentration: "20 mg", atcCode: "C10AA05" },
      { name: "Captopril", generic: "Captopril", dosageForm: "Tableta", concentration: "25 mg", atcCode: "C09AA01" },
      { name: "Enalapril", generic: "Enalapril", dosageForm: "Tableta", concentration: "10 mg", atcCode: "C09AA02" },
      { name: "Propranolol", generic: "Propranolol", dosageForm: "Tableta", concentration: "40 mg", atcCode: "C07AA05" },
      { name: "Amlodipino", generic: "Amlodipino", dosageForm: "Tableta", concentration: "5 mg", atcCode: "C08CA01" },
      { name: "Warfarina", generic: "Warfarina", dosageForm: "Tableta", concentration: "5 mg", atcCode: "B01AA03" },
      { name: "Simvastatina", generic: "Simvastatina", dosageForm: "Tableta", concentration: "20 mg", atcCode: "C10AA01" }
    ]
  },
  {
    id: 'gastro',
    name: 'Sistema Digestivo',
    medications: [
      { name: "Omeprazol", generic: "Omeprazol", dosageForm: "Cápsula", concentration: "20 mg", atcCode: "A02BC01" },
      { name: "Ranitidina", generic: "Ranitidina", dosageForm: "Tableta", concentration: "300 mg", atcCode: "A02BA02" },
      { name: "Bismutol", generic: "Subsalicilato de Bismuto", dosageForm: "Tableta", concentration: "262 mg", atcCode: "A07BB" },
      { name: "Simeticona", generic: "Simeticona", dosageForm: "Tableta", concentration: "80 mg", atcCode: "A03AX13" },
      { name: "Lansoprazol", generic: "Lansoprazol", dosageForm: "Cápsula", concentration: "30 mg", atcCode: "A02BC03" },
      { name: "Enterogermina", generic: "Bacillus Clausii", dosageForm: "Ampolla bebible", concentration: "2000 millones/5 ml", atcCode: "A07FA" },
      { name: "Domperidona", generic: "Domperidona", dosageForm: "Tableta", concentration: "10 mg", atcCode: "A03FA03" },
      { name: "Esomeprazol", generic: "Esomeprazol", dosageForm: "Tableta", concentration: "40 mg", atcCode: "A02BC05" }
    ]
  },
  {
    id: 'other',
    name: 'Otros Medicamentos',
    medications: [
      { name: "Dexacort", generic: "Dexametasona", dosageForm: "Tableta", concentration: "0.5 mg", atcCode: "H02AB02" },
      { name: "Eutirox", generic: "Levotiroxina", dosageForm: "Tableta", concentration: "50 mcg", atcCode: "H03AA01" },
      { name: "Metformina", generic: "Metformina", dosageForm: "Tableta", concentration: "850 mg", atcCode: "A10BA02" },
      { name: "Fluoxetina", generic: "Fluoxetina", dosageForm: "Cápsula", concentration: "20 mg", atcCode: "N06AB03" },
      { name: "Alprazolam", generic: "Alprazolam", dosageForm: "Tableta", concentration: "0.5 mg", atcCode: "N05BA12" },
      { name: "Diazepam", generic: "Diazepam", dosageForm: "Tableta", concentration: "10 mg", atcCode: "N05BA01" },
      { name: "Bicarbonato de Sodio", generic: "Bicarbonato de Sodio", dosageForm: "Polvo", concentration: "1 g", atcCode: "A02AH" },
      { name: "Prednisona", generic: "Prednisona", dosageForm: "Tableta", concentration: "20 mg", atcCode: "H02AB07" }
    ]
  }
]

/**
 * Plantillas de prescripciones comunes organizadas por categoría
 */
export const PRESCRIPTION_TEMPLATES: Record<string, PrescriptionTemplate[]> = {
  common: [
    {
      id: 1,
      medication: 'Omnicortil (10mg)',
      dosage: '1 tableta de 10 mg',
      frequency: '2 veces al día',
      duration: '5 días',
      instructions: 'Tomar después de las comidas',
      category: 'common'
    },
    {
      id: 2,
      medication: 'Panadol (500mg)',
      dosage: '1 tableta de 500 mg',
      frequency: '3 veces al día',
      duration: '5 días',
      instructions: 'Tomar si hay dolor o fiebre',
      category: 'common'
    },
    {
      id: 3,
      medication: 'Omeprazol (20mg)',
      dosage: '1 cápsula de 20 mg',
      frequency: '1 vez al día',
      duration: '7 días',
      instructions: 'Tomar por la mañana en ayunas',
      category: 'common'
    }
  ],
  respiratory: [
    {
      id: 4,
      medication: 'Amoxicilina (500mg)',
      dosage: '1 cápsula de 500 mg',
      frequency: '3 veces al día',
      duration: '7 días',
      instructions: 'Tomar cada 8 horas con alimentos',
      category: 'respiratory'
    },
    {
      id: 5,
      medication: 'Claritin (10mg)',
      dosage: '1 tableta de 10 mg',
      frequency: '1 vez al día',
      duration: '5 días',
      instructions: 'Tomar preferentemente por la noche',
      category: 'respiratory'
    }
  ],
  cardiovascular: [
    {
      id: 6,
      medication: 'Amlodipino (5mg)',
      dosage: '1 tableta de 5 mg',
      frequency: '1 vez al día',
      duration: '30 días',
      instructions: 'Tomar por la mañana con alimentos',
      category: 'cardiovascular'
    },
    {
      id: 7,
      medication: 'Losartan (50mg)',
      dosage: '1 tableta de 50 mg',
      frequency: '1 vez al día',
      duration: '30 días',
      instructions: 'Tomar con un vaso de agua',
      category: 'cardiovascular'
    }
  ]
}

/**
 * Obtiene todos los medicamentos de todas las categorías
 * @returns Lista plana de todos los medicamentos
 */
export const getAllMedications = (): Medication[] => {
  return MEDICATION_CATEGORIES.flatMap(category => category.medications)
}

/**
 * Busca medicamentos por término
 * @param searchTerm - Término de búsqueda
 * @returns Lista de medicamentos que coinciden con el término
 */
export const searchMedications = (searchTerm: string): Medication[] => {
  if (!searchTerm.trim()) return []

  const term = searchTerm.toLowerCase()
  return getAllMedications().filter(med => 
    med.name.toLowerCase().includes(term) || 
    med.generic.toLowerCase().includes(term) ||
    (med.atcCode && med.atcCode.toLowerCase().includes(term))
  )
}

/**
 * Obtiene medicamentos por categoría
 * @param categoryId - ID de la categoría
 * @returns Lista de medicamentos de la categoría
 */
export const getMedicationsByCategory = (categoryId: string): Medication[] => {
  const category = MEDICATION_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.medications || []
}

/**
 * Obtiene plantillas de prescripciones por categoría
 * @param category - Categoría de plantillas
 * @returns Lista de plantillas de la categoría
 */
export const getPrescriptionTemplatesByCategory = (
  category: 'common' | 'antibiotics' | 'analgesics' | 'respiratory' | 'cardiovascular' | 'other'
): PrescriptionTemplate[] => {
  return PRESCRIPTION_TEMPLATES[category] || []
}

/**
 * Obtiene todas las plantillas de prescripciones
 * @returns Lista plana de todas las plantillas
 */
export const getAllPrescriptionTemplates = (): PrescriptionTemplate[] => {
  return Object.values(PRESCRIPTION_TEMPLATES).flat()
}