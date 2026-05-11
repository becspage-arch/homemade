import type { ReactNode } from 'react'

interface ProductCardProps {
  imageUrl: string
  title: string
  description: string
  label: string
  price: string
  currency: string
  retailerName: string
  productUrl: string
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function ProductCard({
  imageUrl,
  title,
  description,
  label,
  price,
  currency,
  retailerName,
  productUrl,
}: ProductCardProps): ReactNode {
  if (!title && !description && !productUrl) return null
  const linkable = isHttpUrl(productUrl)

  return (
    <aside className="product-card">
      {imageUrl && (
        <span
          className="product-card-image"
          role="img"
          aria-label={title}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div className="product-card-body">
        {label && <span className="product-card-label">{label}</span>}
        {title && <h3 className="product-card-title">{title}</h3>}
        {description && (
          <p className="product-card-description">{description}</p>
        )}
        {retailerName && (
          <p className="product-card-retailer">{retailerName}</p>
        )}
      </div>

      <div className="product-card-action">
        {price && (
          <span className="product-card-price">
            {currency || ''}
            {price}
          </span>
        )}
        {linkable ? (
          <a
            className="product-card-cta"
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
          >
            shop →
          </a>
        ) : null}
      </div>
    </aside>
  )
}
