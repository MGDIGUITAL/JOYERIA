'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
  goldLight:'#D4B878',
};

export default function ProductDetailClient({ product }: { product: any }) {
  const { addToCart, openCart } = useCart();
  const [activeImage, setActiveImage] = useState(product.image_url);

  // Imágenes disponibles para la galería
  const galleryImages = [product.image_url];
  if (product.reference_image_url) {
    galleryImages.push(product.reference_image_url);
  }

  const handleAddToCart = () => {
    // Si en el futuro agregas selector de tallas, puedes pasarlo aquí.
    addToCart({
      id: product.id,
      title: product.title,
      price: product.sale_price,
      imageUrl: product.image_url,
      quantity: 1,
    });
    openCart();
  };

  return (
    <div style={{ background: S.ivory, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* NAVBAR SUPER SIMPLE PARA VOLVER */}
      <nav style={{ padding: '24px 5%', background: S.offWhite, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${S.nude}` }}>
        <Link href="/" style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', fontWeight: 600, color: S.obsidian, textDecoration: 'none', letterSpacing: '0.1em' }}>
          AMORA <span style={{ fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.2em' }}>JEWELRY</span>
        </Link>
        <Link href="/" style={{ color: S.charcoal, textDecoration: 'none', fontSize: '0.9rem', borderBottom: `1px solid ${S.charcoal}` }}>
          Volver a la tienda
        </Link>
      </nav>

      {/* DETALLE DEL PRODUCTO */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
        
        {/* Lado Izquierdo: Galería */}
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* Thumbnails (solo si hay más de 1 imagen) */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{ 
                    position: 'relative', width: '80px', height: '100px', cursor: 'pointer',
                    border: activeImage === img ? `2px solid ${S.gold}` : '2px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Image src={img} alt={`Vista ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Imagen Principal */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: S.offWhite }}>
            <Image src={activeImage} alt={product.title} fill style={{ objectFit: 'cover' }} priority />
          </div>
        </div>

        {/* Lado Derecho: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Cinzel, serif', color: S.gold, letterSpacing: '2px', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>
            {product.category}
          </p>
          
          <h1 style={{ fontSize: '2rem', color: S.obsidian, fontWeight: 400, marginBottom: '20px', lineHeight: 1.2 }}>
            {product.title}
          </h1>
          
          <div style={{ fontSize: '1.5rem', color: S.charcoal, marginBottom: '30px' }}>
            ${product.sale_price.toLocaleString('es-CL')}
          </div>

          <div style={{ width: '40px', height: '2px', backgroundColor: S.gold, marginBottom: '30px' }} />

          <p style={{ color: S.muted, fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '40px', whiteSpace: 'pre-wrap' }}>
            {product.description}
          </p>

          <button 
            onClick={handleAddToCart}
            style={{
              padding: '18px 0',
              backgroundColor: S.obsidian,
              color: S.offWhite,
              border: 'none',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '2px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              width: '100%',
              maxWidth: '350px'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = S.charcoal}
            onMouseOut={e => e.currentTarget.style.backgroundColor = S.obsidian}
          >
            AÑADIR A LA BOLSA
          </button>
          
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: S.muted }}>
            <p>✓ Envío asegurado a todo Chile</p>
            <p>✓ Joyería libre de níquel</p>
            <p>✓ Empaque premium incluido</p>
          </div>
        </div>

      </main>
    </div>
  );
}
