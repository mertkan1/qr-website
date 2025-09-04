'use client'
import { useState } from 'react'
import { Download, QrCode } from 'lucide-react'

interface QRGeneratorProps {
  username?: string
  disabled?: boolean
}

export default function QRGenerator({ username, disabled = false }: QRGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  const generateQR = async () => {
    if (!username) return
    setLoading(true)
    try {
      const claimUrl = `${window.location.origin}/u/${username}`
      const response = await fetch(`/api/qrcode?text=${encodeURIComponent(claimUrl)}`)
      const data = await response.json()
      
      if (data.url) {
        setQrUrl(data.url)
      } else if (data.dataUrl) {
        setQrUrl(data.dataUrl)
      }
    } catch (error) {
      console.error('QR generation error:', error)
      alert('QR kod oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrUrl) return
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `${username}-qr.png`
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={generateQR}
          disabled={disabled || loading || !username}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          {loading ? 'Oluşturuluyor...' : 'QR Kod Oluştur'}
        </button>
        
        {qrUrl && (
          <button
            onClick={downloadQR}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            İndir
          </button>
        )}
      </div>
      
      {qrUrl && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
          <p className="text-sm text-gray-600 text-center mt-2">
            Sayfanız: /u/{username}
          </p>
        </div>
      )}
    </div>
  )
}