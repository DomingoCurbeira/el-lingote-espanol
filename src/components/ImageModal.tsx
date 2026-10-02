import React, { useEffect } from 'react'

type ImageModalProps = {
  imageUrl: string
  title: string
  onClose: () => void
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, title, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-ink p-2 text-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar imagen"
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white text-xl backdrop-blur transition hover:bg-black"
        >
          ✕
        </button>
        <img
          src={imageUrl}
          alt={title}
          className="max-h-[75vh] w-full rounded-2xl object-cover"
        />
        <div className="p-4 text-center">
          <h3 className="display text-2xl font-bold">{title}</h3>
          <p className="mt-1 text-xs text-white/60">Recién hecho por encargo · El Lingote Español</p>
        </div>
      </div>
    </div>
  )
}
