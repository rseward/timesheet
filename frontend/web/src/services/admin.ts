import apiService from './api'

/**
 * Download a gzipped backup of the SQLite database.
 * Triggers a browser download via blob URL.
 */
export async function downloadBackup(): Promise<void> {
  const response = await apiService.getRaw('/admin/backup', {
    responseType: 'blob',
  })

  // Extract filename from Content-Disposition header, or use default
  const contentDisposition = response.headers['content-disposition']
  let filename = 'timesheet_backup.db.gz'
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/)
    if (match) {
      filename = match[1]
    }
  }

  // Create a download link and trigger it
  const blob = new Blob([response.data], { type: 'application/gzip' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Restore the database from an uploaded gzipped backup file.
 * @param file - The .db.gz file selected by the user
 * @returns The server response with status and backup file info
 */
export async function restoreDatabase(file: File): Promise<{ status: string; message: string; backup_file: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiService.post('/admin/restore', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response as { status: string; message: string; backup_file: string }
}