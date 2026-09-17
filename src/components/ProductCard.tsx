import React from 'react'
import { Product } from '../types'
import { formatCRC } from '../data/products'

type ProductCardProps = {
  product: Product
  onAdd?: (id: string) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-black/10 bg-paper card-shadow transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[#ead9bb] via-[#f8ecd4] to-[#d6a62c]/35">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt ?? product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-redlingote/10 blur-2xl" />
            <div className="text-8xl transition duration-300 group-hover:scale-110">{product.emoji}</div>
          </>
        )}
        <div className="absolute bottom-4 left-4 rounded-full bg-ink px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-white">
          {product.people}
        </div>
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

        <p className="mt-3 flex-1 text-sm leading-6 text-black/55">{product.description}</p>

        {onAdd ? (
          <button
            onClick={() => onAdd(product.id)}
            className="mt-6 rounded-xl border border-ink px-4 py-3 text-sm font-black transition hover:bg-ink hover:text-white"
          >
            Añadir al pedido
          </button>
        ) : (
          <div className="mt-6 rounded-xl bg-saffron/15 px-4 py-3 text-center text-sm font-bold text-ink">
            Disponible con paellas y tortilla
          </div>
        )}
      </div>
    </article>
  )
}
