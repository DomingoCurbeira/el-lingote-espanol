import React from 'react'
import { Product } from '../types'
import { formatCRC } from '../data/products'

type ProductCardProps = {
  product: Product
  quantity?: number
  onAdd?: (id: string) => void
  onRemove?: (id: string) => void
  onSelectPhoto?: (image: string, name: string) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  onSelectPhoto,
}) => {
  const isInCart = quantity > 0

  return (
    <article 
      className={`group flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-paper card-shadow transition duration-300 hover:-translate-y-1 hover:shadow-soft ${
        isInCart ? 'border-redlingote/40 ring-2 ring-redlingote/20' : 'border-black/10'
      }`}
    >
      {/* Contenedor de la Imagen */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[#ead9bb] via-[#f8ecd4] to-[#d6a62c]/35">
        {product.image ? (
          <>
            <img
              src={product.image}
              alt={product.imageAlt ?? product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105 cursor-pointer"
              onClick={() => onSelectPhoto && product.image && onSelectPhoto(product.image, product.name)}
              title="Toca para ver en grande"
            />
            {onSelectPhoto && (
              <button
                type="button"
                onClick={() => onSelectPhoto(product.image!, product.name)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-black"
                title="Ampliar foto"
              >
                🔍
              </button>
            )}
          </>
        ) : (
          <>
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-redlingote/10 blur-2xl" />
            <div className="text-8xl transition duration-300 group-hover:scale-110">{product.emoji}</div>
          </>
        )}

        {/* Badge superior si existe */}
        {product.badge && (
          <div className="absolute top-3 left-3 rounded-full bg-redlingote/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur">
            {product.badge}
          </div>
        )}

        {/* Indicador de Personas / Raciones */}
        {product.people && (
          <div className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-white backdrop-blur">
            {product.people}
          </div>
        )}

        {/* Indicador si ya está en el pedido */}
        {isInCart && (
          <div className="absolute bottom-3 right-3 rounded-full bg-saffron px-2.5 py-1 text-[11px] font-black text-ink shadow-md flex items-center gap-1">
            <span>✓ {quantity} en pedido</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="display text-2xl font-bold leading-tight">{product.name}</h3>
          <div className="shrink-0 text-right">
            <div className="text-lg font-black text-redlingote">{formatCRC(product.price)}</div>
            {product.priceDetail && (
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-black/45">
                {product.priceDetail}
              </div>
            )}
          </div>
        </div>

        {/* Tags culinarios */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.tags.map(tag => (
              <span 
                key={tag} 
                className="rounded-md bg-saffron/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black/75"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 flex-1 text-sm leading-6 text-black/60">{product.description}</p>

        {/* Botones de acción */}
        {onAdd ? (
          isInCart ? (
            <div className="mt-6 flex items-center justify-between gap-2 rounded-xl border border-redlingote/30 bg-redlingote/5 p-2">
              <span className="text-xs font-bold text-redlingote pl-2">
                En tu pedido: <strong>{quantity}</strong> ({formatCRC(product.price * quantity)})
              </span>
              <div className="flex items-center gap-1.5">
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Quitar una unidad de ${product.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/20 bg-white font-bold text-ink transition hover:bg-black/10 active:scale-95"
                  >
                    −
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAdd(product.id)}
                  aria-label={`Añadir una unidad más de ${product.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-redlingote font-bold text-white transition hover:bg-red-700 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onAdd(product.id)}
              className="mt-6 rounded-xl border border-ink bg-transparent px-4 py-3 text-sm font-black transition hover:bg-ink hover:text-white active:scale-[0.98] cursor-pointer"
            >
              Añadir al pedido
            </button>
          )
        ) : (
          <div className="mt-6 rounded-xl bg-saffron/15 px-4 py-3 text-center text-sm font-bold text-ink">
            Disponible con paellas y tortilla
          </div>
        )}
      </div>
    </article>
  )
}
