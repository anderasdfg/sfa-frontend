/**
 * Categorías de exámenes de diagnóstico
 * Organizados por tipo: laboratorio, imágenes, otros
 */

export interface TestTemplate {
  id: number
  test_type: string
  cpt_code?: string // Código CPT (Current Procedural Terminology)
  description: string
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
        test_type: 'Hemograma completo',
        cpt_code: '85025',
        description: 'Análisis completo de sangre para evaluar células sanguíneas y otros componentes.',
        category: 'laboratory'
      },
      {
        id: 2,
        test_type: 'Perfil lipídico',
        cpt_code: '80061',
        description: 'Medición de colesterol total, HDL, LDL y triglicéridos en sangre.',
        category: 'laboratory'
      },
      {
        id: 3,
        test_type: 'Glucosa en ayunas',
        cpt_code: '82947',
        description: 'Medición de niveles de glucosa en sangre después de ayuno nocturno.',
        category: 'laboratory'
      },
      {
        id: 4,
        test_type: 'Perfil hepático',
        cpt_code: '80076',
        description: 'Evaluación de la función del hígado mediante medición de enzimas y proteínas.',
        category: 'laboratory'
      },
      {
        id: 5,
        test_type: 'Perfil renal',
        cpt_code: '80069',
        description: 'Evaluación de la función renal midiendo creatinina, urea y electrolitos.',
        category: 'laboratory'
      },
      {
        id: 6,
        test_type: 'Hemoglobina glicosilada A1c',
        cpt_code: '83036',
        description: 'Medición del control glucémico promedio durante los últimos 2-3 meses.',
        category: 'laboratory'
      },
      {
        id: 7,
        test_type: 'TSH (Hormona estimulante de tiroides)',
        cpt_code: '84443',
        description: 'Evaluación primaria de la función tiroidea.',
        category: 'laboratory'
      },
      {
        id: 8,
        test_type: 'Examen completo de orina',
        cpt_code: '81001',
        description: 'Análisis físico, químico y microscópico de la orina.',
        category: 'laboratory'
      },
      {
        id: 9,
        test_type: 'Proteína C reactiva',
        cpt_code: '86140',
        description: 'Medición de la inflamación sistémica.',
        category: 'laboratory'
      }
    ]
  },
  {
    id: 'imaging',
    name: 'Imágenes',
    tests: [
      {
        id: 10,
        test_type: 'Radiografía de tórax',
        cpt_code: '71045',
        description: 'Imagen de los pulmones, corazón y estructuras torácicas.',
        category: 'imaging'
      },
      {
        id: 11,
        test_type: 'Ecografía abdominal',
        cpt_code: '76700',
        description: 'Evaluación por ultrasonido de órganos abdominales.',
        category: 'imaging'
      },
      {
        id: 12,
        test_type: 'Tomografía computarizada',
        cpt_code: '70450',
        description: 'Imágenes detalladas en cortes transversales del área solicitada.',
        category: 'imaging'
      },
      {
        id: 13,
        test_type: 'Resonancia magnética',
        cpt_code: '70551',
        description: 'Imágenes detalladas usando campos magnéticos, útil para tejidos blandos.',
        category: 'imaging'
      },
      {
        id: 14,
        test_type: 'Mamografía',
        cpt_code: '77067',
        description: 'Radiografía de las mamas para detectar anormalidades.',
        category: 'imaging'
      },
      {
        id: 15,
        test_type: 'Densitometría ósea',
        cpt_code: '77080',
        description: 'Medición de la densidad mineral ósea para evaluar osteoporosis.',
        category: 'imaging'
      },
      {
        id: 16,
        test_type: 'Ecografía transvaginal',
        cpt_code: '76830',
        description: 'Evaluación del útero, ovarios y estructuras pélvicas femeninas.',
        category: 'imaging'
      },
      {
        id: 17,
        test_type: 'Ecocardiograma',
        cpt_code: '93306',
        description: 'Evaluación ultrasónica de la estructura y función cardíaca.',
        category: 'imaging'
      }
    ]
  },
  {
    id: 'other',
    name: 'Otros',
    tests: [
      {
        id: 18,
        test_type: 'Electrocardiograma',
        cpt_code: '93000',
        description: 'Registro de la actividad eléctrica del corazón.',
        category: 'other'
      },
      {
        id: 19,
        test_type: 'Espirometría',
        cpt_code: '94010',
        description: 'Medición de la función pulmonar y capacidad respiratoria.',
        category: 'other'
      },
      {
        id: 20,
        test_type: 'Prueba de esfuerzo',
        cpt_code: '93015',
        description: 'Evaluación de la respuesta cardíaca durante el ejercicio.',
        category: 'other'
      },
      {
        id: 21,
        test_type: 'Colonoscopia',
        cpt_code: '45378',
        description: 'Examen visual del interior del colon mediante endoscopio.',
        category: 'other'
      },
      {
        id: 22,
        test_type: 'Gastroscopia',
        cpt_code: '43235',
        description: 'Examen visual del esófago, estómago y duodeno mediante endoscopio.',
        category: 'other'
      },
      {
        id: 23,
        test_type: 'Audiometría',
        cpt_code: '92557',
        description: 'Evaluación de la capacidad auditiva.',
        category: 'other'
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