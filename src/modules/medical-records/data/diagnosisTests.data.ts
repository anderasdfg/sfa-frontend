/**
 * Categorías de exámenes de diagnóstico
 * Organizados por tipo: laboratorio
 */

export interface TestTemplate {
  id: number
  test_type: string
  cpt_code?: string
  description: string
  patient_instructions?: string
  category: 'laboratory' | 'imaging' | 'other'
}

export interface TestCategory {
  id: string
  name: string
  tests: TestTemplate[]
}

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'laboratory',
    name: 'Laboratorio',
    tests: [
      {
        id: 1,
        test_type: 'Hemograma Completo',
        cpt_code: '85025',
        description: 'Análisis completo de células sanguíneas',
        patient_instructions: 'Ayuno de 8 horas',
        category: 'laboratory'
      },
      {
        id: 2,
        test_type: 'Glucosa en Sangre',
        cpt_code: '82947',
        description: 'Medición de niveles de glucosa',
        patient_instructions: 'Ayuno de 8-12 horas',
        category: 'laboratory'
      },
      {
        id: 3,
        test_type: 'Perfil Lipídico',
        cpt_code: '80061',
        description: 'Colesterol total y triglicéridos',
        patient_instructions: 'Ayuno de 12 horas',
        category: 'laboratory'
      },
      {
        id: 4,
        test_type: 'Examen de Orina Completo',
        cpt_code: '81001',
        description: 'Análisis físico-químico de orina',
        patient_instructions: 'Primera orina de la mañana',
        category: 'laboratory'
      },
      {
        id: 5,
        test_type: 'Creatinina',
        cpt_code: '82565',
        description: 'Función renal',
        patient_instructions: 'No requiere ayuno',
        category: 'laboratory'
      },
      {
        id: 6,
        test_type: 'Tiroides (TSH T3 T4)',
        cpt_code: '84443',
        description: 'Perfil tiroideo completo',
        patient_instructions: 'No requiere ayuno',
        category: 'laboratory'
      },
      {
        id: 7,
        test_type: 'Antígeno Prostático',
        cpt_code: '84153',
        description: 'Marcador tumoral PSA',
        patient_instructions: 'Abstinencia sexual 48h',
        category: 'laboratory'
      },
      {
        id: 8,
        test_type: 'Transaminasas (TGO TGP)',
        cpt_code: '84450',
        description: 'Función hepática',
        patient_instructions: 'Ayuno de 8 horas',
        category: 'laboratory'
      },
      {
        id: 9,
        test_type: 'Ácido Úrico',
        cpt_code: '84550',
        description: 'Detección de gota y problemas renales',
        patient_instructions: 'No requiere ayuno',
        category: 'laboratory'
      },
      {
        id: 10,
        test_type: 'Urea',
        cpt_code: '84520',
        description: 'Función renal',
        patient_instructions: 'No requiere ayuno',
        category: 'laboratory'
      }
    ]
  }
]

/**
 * Obtiene todos los exámenes diagnósticos de todas las categorías
 * @returns Lista plana de todos los exámenes
 */
export const getAllDiagnosisTests = (): TestTemplate[] => {
  return TEST_CATEGORIES.flatMap(category => category.tests)
}

/**
 * Busca exámenes diagnósticos por término
 * @param searchTerm - Término de búsqueda
 * @returns Lista de exámenes que coinciden con el término
 */
export const searchDiagnosisTests = (searchTerm: string): TestTemplate[] => {
  if (!searchTerm.trim()) return []

  const term = searchTerm.toLowerCase()
  return getAllDiagnosisTests().filter(test => 
    test.test_type.toLowerCase().includes(term) || 
    (test.description && test.description.toLowerCase().includes(term)) ||
    (test.cpt_code && test.cpt_code.toLowerCase().includes(term))
  )
}

/**
 * Obtiene exámenes diagnósticos por categoría
 * @param categoryId - ID de la categoría
 * @returns Lista de exámenes de la categoría
 */
export const getTestsByCategory = (categoryId: string): TestTemplate[] => {
  const category = TEST_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.tests || []
}

/**
 * Obtiene un examen diagnóstico por su código CPT
 * @param cptCode - Código CPT del examen
 * @returns El examen diagnóstico o undefined si no se encuentra
 */
export const getTestByCptCode = (cptCode: string): TestTemplate | undefined => {
  return getAllDiagnosisTests().find(test => test.cpt_code === cptCode)
}

/**
 * Obtiene un examen diagnóstico por su tipo
 * @param testType - Tipo de examen
 * @returns El examen diagnóstico o undefined si no se encuentra
 */
export const getTestByType = (testType: string): TestTemplate | undefined => {
  return getAllDiagnosisTests().find(
    test => test.test_type.toLowerCase() === testType.toLowerCase()
  )
}