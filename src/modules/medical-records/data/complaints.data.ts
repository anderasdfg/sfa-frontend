/**
 * Categorías de quejas principales del paciente (Chief Complaints)
 * Organizadas por sistema/categoría
 */

export interface ComplaintCategory {
  id: string
  name: string
  complaints: string[]
}

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  {
    id: 'general',
    name: 'General',
    complaints: [
      'Fiebre',
      'Fatiga',
      'Pérdida de peso',
      'Ganancia de peso',
      'Debilidad',
      'Malestar general',
      'Escalofríos',
      'Sudoración nocturna'
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratorio',
    complaints: [
      'Tos',
      'Dolor de garganta',
      'Dificultad para respirar',
      'Congestión nasal',
      'Secreción nasal',
      'Dolor de pecho',
      'Sibilancias',
      'Expectoración'
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    complaints: [
      'Dolor de pecho',
      'Palpitaciones',
      'Mareos',
      'Desmayo',
      'Hinchazón de piernas',
      'Presión arterial alta',
      'Dolor en las piernas al caminar'
    ]
  },
  {
    id: 'gastrointestinal',
    name: 'Gastrointestinal',
    complaints: [
      'Dolor abdominal',
      'Náuseas',
      'Vómitos',
      'Diarrea',
      'Estreñimiento',
      'Acidez',
      'Pérdida de apetito',
      'Sangre en heces'
    ]
  },
  {
    id: 'neurological',
    name: 'Neurológico',
    complaints: [
      'Dolor de cabeza',
      'Mareos',
      'Visión borrosa',
      'Entumecimiento',
      'Hormigueo',
      'Convulsiones',
      'Debilidad muscular',
      'Pérdida de memoria'
    ]
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoesquelético',
    complaints: [
      'Dolor de espalda',
      'Dolor de cuello',
      'Dolor de articulaciones',
      'Rigidez articular',
      'Hinchazón articular',
      'Dolor muscular',
      'Limitación de movimiento'
    ]
  },
  {
    id: 'dermatological',
    name: 'Dermatológico',
    complaints: [
      'Erupción cutánea',
      'Picazón',
      'Lesiones en la piel',
      'Cambios en lunares',
      'Piel seca',
      'Enrojecimiento',
      'Ampollas'
    ]
  },
  {
    id: 'genitourinary',
    name: 'Genitourinario',
    complaints: [
      'Dolor al orinar',
      'Frecuencia urinaria',
      'Urgencia urinaria',
      'Sangre en orina',
      'Dolor pélvico',
      'Flujo vaginal anormal',
      'Disfunción eréctil'
    ]
  },
  {
    id: 'ent',
    name: 'Oído, Nariz y Garganta',
    complaints: [
      'Dolor de oído',
      'Pérdida de audición',
      'Dolor de garganta',
      'Ronquera',
      'Congestión nasal',
      'Sangrado nasal',
      'Dificultad para tragar'
    ]
  },
  {
    id: 'ophthalmological',
    name: 'Oftalmológico',
    complaints: [
      'Dolor ocular',
      'Visión borrosa',
      'Enrojecimiento ocular',
      'Secreción ocular',
      'Sensibilidad a la luz',
      'Visión doble',
      'Pérdida de visión'
    ]
  },
  {
    id: 'psychiatric',
    name: 'Psiquiátrico',
    complaints: [
      'Ansiedad',
      'Depresión',
      'Insomnio',
      'Cambios de humor',
      'Estrés',
      'Irritabilidad',
      'Pérdida de interés'
    ]
  },
  {
    id: 'endocrine',
    name: 'Endocrino',
    complaints: [
      'Sed excesiva',
      'Micción frecuente',
      'Cambios de peso',
      'Intolerancia al calor/frío',
      'Cambios en el apetito',
      'Fatiga',
      'Palpitaciones'
    ]
  }
]

/**
 * Obtiene todas las quejas de todas las categorías
 * @returns Lista plana de todas las quejas
 */
export const getAllComplaints = (): string[] => {
  return COMPLAINT_CATEGORIES.flatMap(category => category.complaints).sort()
}

/**
 * Busca quejas por término
 * @param searchTerm - Término de búsqueda
 * @returns Lista de quejas que coinciden con el término
 */
export const searchComplaints = (searchTerm: string): string[] => {
  if (!searchTerm.trim()) return []

  const term = searchTerm.toLowerCase()
  return getAllComplaints().filter(complaint => complaint.toLowerCase().includes(term))
}

/**
 * Obtiene quejas por categoría
 * @param categoryId - ID de la categoría
 * @returns Lista de quejas de la categoría
 */
export const getComplaintsByCategory = (categoryId: string): string[] => {
  const category = COMPLAINT_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.complaints || []
}

/**
 * Convierte un array de quejas a string separado por comas
 * @param complaints - Array de quejas
 * @returns String separado por comas
 */
export const complaintsToString = (complaints: string[]): string => {
  return complaints.filter(c => c.trim()).join(', ')
}

/**
 * Convierte un string de quejas separado por comas a array
 * @param complaintsString - String de quejas separado por comas
 * @returns Array de quejas
 */
export const stringToComplaints = (complaintsString: string): string[] => {
  if (!complaintsString) return []
  return complaintsString
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0)
}
