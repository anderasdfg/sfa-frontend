export interface TestResult {
  id: number
  test_order_id: number
  file_url: string
  result_summary: string
  uploaded_by_id: number
  uploaded_at: string
  uploaded_by_name: string
  test_name: string
  patient_id: number
  patient_name: string
}

export interface TestResultResponse {
  success: boolean
  data: TestResult[]
  message?: string
  error?: string
}

export interface TestResultViewData {
  testResult: TestResult
  downloadUrl: string
  canDownload: boolean
}