// Reduce una foto del móvil antes de guardarla.
// Con Supabase: 1800 px y calidad 0,82 (≈300-500 KB), para que se lea la letra pequeña de un rotafolio.
// Solo en el navegador (pruebas en local): 1280 px, porque el almacenamiento del navegador es pequeño.
import { isRemote } from '../data/store'

export async function compressImage(file: File, maxSide = isRemote ? 1800 : 1280, quality = isRemote ? 0.82 : 0.7): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}
