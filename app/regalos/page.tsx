import Image from 'next/image';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

// ─── DATA & STYLES ────────────────────────────────────────────────────────
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

// ─── NAVBAR ───────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(253,252,248,0.97)',
      borderBottom: `1px solid ${S.nude}`,
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={200} height={48} style={{ objectFit: 'contain' }} priority />
        </Link>
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[
            { l: 'Inicio',      h: '/' },
            { l: 'Novedades',   h: '/#novedades' },
            { l: 'Joyería',     h: '/#joyeria' },
            { l: 'Colecciones', h: '/#colecciones' },
            { l: 'Regalos',     h: '/regalos' },
          ].map(({ l, h }) => (
            <Link key={l} href={h} style={{ color: S.charcoal, textDecoration: 'none', fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {l}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[
            { img: '/amora_buscar.png', title: 'Buscar' },
            { img: '/amora_favoritos.png', title: 'Favoritos' },
            { img: '/amora_carrito.png', title: 'Carrito' },
          ].map(a => (
            <a key={a.title} href="#" title={a.title} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image src={a.img} alt={a.title} fill style={{ objectFit: 'contain' }} />
              </div>
            </a>
          ))}
          <Link href="/admin" style={{
            fontFamily: 'Cinzel,serif', fontSize: '0.68rem', letterSpacing: '0.12em',
            color: S.obsidian, border: `1px solid ${S.nude}`,
            padding: '8px 20px', textDecoration: 'none',
          }}>ADMIN</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '60vh', overflow: 'hidden', display: 'flex', alignItems: 'center', background: S.obsidian }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(16,16,16,0.95) 0%, rgba(16,16,16,0.6) 100%)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 1320, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300, color: S.offWhite, lineHeight: 1.1, marginBottom: 24 }}>
            Nuestros Favoritos
          </h1>
          <p style={{ color: 'rgba(253,252,248,0.75)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 36, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            Las piezas que más eligen nuestras clientas. Descubre los productos estrella de Amora Jewelry.
          </p>
          <a href="#destacados" style={{ fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', border: `1px solid ${S.gold}`, background: S.gold, color: S.obsidian, padding: '14px 32px', textDecoration: 'none' }}>
            Ver Productos
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED GIFTS ───────────────────────────────────────────────────────
function FeaturedGifts({ products }: { products: any[] }) {
  if (products.length === 0) {
    return (
      <section id="destacados" style={{ padding: '96px 2rem', background: S.ivory, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cinzel,serif', color: S.muted, fontSize: '0.9rem', letterSpacing: '0.1em' }}>
          Próximamente habrá productos disponibles.
        </p>
      </section>
    );
  }

  return (
    <section id="destacados" style={{ padding: '96px 2rem', background: S.ivory }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ display: 'block', height: 1, width: 60, background: `linear-gradient(90deg,transparent,${S.nudeDark})` }} />
            <span style={{ fontFamily: 'Cinzel,serif', color: S.nudeDark, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Selección Exclusiva</span>
            <span style={{ display: 'block', height: 1, width: 60, background: `linear-gradient(90deg,${S.nudeDark},transparent)` }} />
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: S.obsidian }}>
            Productos Destacados
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {products.map(p => (
            <div key={p.id} className="product-card" style={{ background: S.offWhite }}>
              {/* Image Area */}
              <div style={{ height: 260, position: 'relative', overflow: 'hidden', background: S.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                {p.image_url ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image src={p.image_url} alt={p.title} fill style={{ objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.35 }}>
                    <div style={{ position: 'relative', width: 64, height: 64 }}>
                      <Image src={`/amora_${(p.category || 'collares').toLowerCase()}.png`} alt={p.category} fill style={{ objectFit: 'contain' }} />
                    </div>
                    <span style={{ color: S.nudeDark, fontFamily: 'Cinzel,serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Imagen próximamente</span>
                  </div>
                )}
                <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'Cinzel,serif', fontSize: '0.58rem', letterSpacing: '0.14em', border: `1px solid rgba(184,151,90,0.6)`, color: S.gold, padding: '3px 12px', background: S.offWhite }}>
                  {p.category?.toUpperCase()}
                </span>
                <span style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(253,252,248,0.9)', border: `1px solid ${S.nude}`, color: S.muted, fontFamily: 'Cinzel,serif', fontSize: '0.6rem', padding: '3px 10px', letterSpacing: '0.1em' }}>
                  {p.sku || 'Amora'}
                </span>
              </div>
              {/* Product Info */}
              <div style={{ padding: '24px', background: S.offWhite }}>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 400, color: S.obsidian, lineHeight: 1.3, marginBottom: 16 }}>
                  {p.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-display" style={{ fontSize: '1.3rem', color: S.obsidian, fontWeight: 300 }}>
                    ${p.sale_price?.toLocaleString('es-CL')}
                  </span>
                  <button style={{
                    fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    background: S.obsidian, border: `1px solid ${S.obsidian}`, color: S.offWhite,
                    padding: '10px 22px', cursor: 'pointer',
                  }}>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LUXURY PACKAGING ─────────────────────────────────────────────────────
function LuxuryPackaging() {
  return (
    <section style={{ background: S.offWhite, padding: '96px 2rem', borderTop: `1px solid ${S.nude}` }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div style={{ position: 'relative', height: 400, border: `1px solid ${S.nude}`, background: S.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' }}>
          <Image src="/empaque-logo.png" alt="Empaque de lujo" fill style={{ objectFit: 'contain', transform: 'scale(1.4)' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ display: 'block', height: 1, flex: 1, background: `linear-gradient(90deg,transparent,${S.nudeDark})` }} />
            <span style={{ fontFamily: 'Cinzel,serif', color: S.nudeDark, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Empaque Firma</span>
            <span style={{ display: 'block', height: 1, flex: 1, background: `linear-gradient(90deg,${S.nudeDark},transparent)` }} />
          </div>
          <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 300, color: S.obsidian, marginBottom: 20 }}>
            Presentación de Lujo
          </h2>
          <p style={{ color: S.muted, fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 24 }}>
            Cada compra es un regalo para ti o para alguien especial. Recibe tus joyas Amora en nuestra icónica caja texturizada en tono Ivory, atada con cinta de raso negra y acompañada de su Certificado de Autenticidad.
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['Caja de Regalo de alta densidad', 'Bolsa de gamuza protectora', 'Certificado de Autenticidad', 'Mensaje de saludo personalizado gratis'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: S.charcoal, fontSize: '0.9rem', marginBottom: 12 }}>
                <span style={{ color: S.gold }}>✦</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: S.offWhite, borderTop: `1px solid ${S.nude}`, padding: '48px 2rem' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={33} style={{ objectFit: 'contain' }} />
        <span style={{ color: S.nudeDark, fontSize: '0.7rem', fontFamily: 'Cinzel,serif', letterSpacing: '0.08em' }}>© 2024 AMORA JEWELRY. TODOS LOS DERECHOS RESERVADOS.</span>
      </div>
    </footer>
  );
}

// ─── PAGE (SERVER COMPONENT) ───────────────────────────────────────────────
export const dynamic = 'force-dynamic';

export default async function RegalosPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div style={{ background: S.offWhite, minHeight: '100vh', color: S.obsidian }}>
      <Navbar />
      <Hero />
      <FeaturedGifts products={products || []} />
      <LuxuryPackaging />
      <Footer />

      <a href="https://wa.me/569XXXXXXXX" target="_blank" rel="noopener noreferrer" style={{
        position: 'fixed', bottom: 30, right: 30, zIndex: 1000,
        width: 56, height: 56, borderRadius: '50%',
        background: '#FFFFFF', border: '1px solid #E3DBCC',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12
      }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image src="/amora_whatsapp.png" alt="WhatsApp" fill style={{ objectFit: 'contain' }} />
        </div>
      </a>
    </div>
  );
}
