'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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

const GIFT_PRODUCTS = [
  { id: 101, name: 'Set Regalo Amora Imperial', col: 'Edición Especial', price: 189990, material: 'Oro 18k + Diamante', cat: 'Collares', icon: '/amora_collares.png', badge: 'Best Seller' },
  { id: 102, name: 'Cofre Joyero Cuero Premium', col: 'Accesorios', price: 79990, material: 'Cuero & Terciopelo', cat: 'Regalos', icon: '/amora_regalos.png', badge: 'Exclusivo' },
  { id: 103, name: 'Dúo Anillos de Promesa', col: 'Classica', price: 149990, material: 'Oro Blanco 18k', cat: 'Anillos', icon: '/amora_anillos.png', badge: 'Romántico' },
  { id: 104, name: 'Pulsera Tennis + Charms', col: 'Vienna', price: 119990, material: 'Oro 14k', cat: 'Pulseras', icon: '/amora_pulseras.png', badge: 'Elegido del Mes' }
];

// ─── NAVBAR ───────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navBg = scrolled ? 'rgba(253,252,248,0.97)' : 'rgba(253,252,248,0.95)';
  const linkColor = S.charcoal;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: navBg,
      borderBottom: `1px solid ${S.nude}`,
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={200} height={48} style={{ objectFit: 'contain' }} priority />
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[
            { l: 'Inicio',     h: '/' },
            { l: 'Novedades',  h: '/#novedades' },
            { l: 'Joyería',    h: '/#joyeria' },
            { l: 'Colecciones',h: '/#colecciones' },
            { l: 'Regalos',    h: '/regalos' },
          ].map(({ l, h }) => (
            <Link key={l} href={h} style={{ color: linkColor, textDecoration: 'none', fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = S.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
            >
              {l}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[
            { img: '/amora_buscar.png', title: 'Buscar' },
            { img: '/amora_favoritos.png', title: 'Favoritos' },
            { img: '/amora_carrito.png', title: 'Carrito' },
          ].map(a => (
            <a key={a.title} href="#" title={a.title} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image src={a.img} alt={a.title} fill style={{ objectFit: 'contain' }} />
              </div>
            </a>
          ))}
          <Link href="/admin" style={{
            fontFamily: 'Cinzel,serif', fontSize: '0.68rem', letterSpacing: '0.12em',
            color: S.obsidian, border: `1px solid ${S.nude}`,
            padding: '8px 20px', textDecoration: 'none', transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = S.obsidian; e.currentTarget.style.color = S.offWhite; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.obsidian; }}
          >ADMIN</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '80vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          zIndex: 0
        }}
      >
        <source src="https://res.cloudinary.com/ddqx435i5/video/upload/Woman_showcasing_jewelry_202608232038_f7utno.mp4" type="video/mp4" />
      </video>
      {/* Dark Luxury Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(16,16,16,0.85) 0%, rgba(16,16,16,0.3) 100%)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 1320, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
          <div className="amora-divider" style={{ marginBottom: 20, justifyContent: 'flex-end', width: '100%' }}>
            <span className="line" style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.5))' }} />
            <span style={{ color: '#D4B878', fontSize: '0.82rem' }}>✦ LOS MÁS VENDIDOS</span>
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300, color: S.offWhite, lineHeight: 1.1, marginBottom: 24 }}>
            Nuestros Favoritos
          </h1>
          <p style={{ color: 'rgba(253,252,248,0.75)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 36, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            Las piezas que más eligen nuestras clientas. Descubre los productos estrella de Amora Jewelry con precios exclusivos solo por tiempo limitado. No te quedes sin el tuyo.
          </p>
          <a href="#destacados" className="btn-primary" style={{ border: `1px solid ${S.gold}`, background: S.gold, color: S.obsidian }}
            onMouseEnter={e => { e.currentTarget.style.background = S.goldLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = S.gold; }}
          >
            Ver Productos Destacados
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED GIFTS ───────────────────────────────────────────────────────
function FeaturedGifts() {
  return (
    <section id="destacados" style={{ padding: '96px 2rem', background: S.ivory }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="amora-divider" style={{ justifyContent: 'center', marginBottom: 20 }}>
            <span className="line" />
            <span>Selección Exclusiva</span>
            <span className="line rev" />
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 300, color: S.obsidian }}>
            Productos Destacados
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {GIFT_PRODUCTS.map(p => (
            <div key={p.id} className="product-card" style={{ background: S.offWhite }}>
              {/* Image Area */}
              <div style={{ height: 260, position: 'relative', overflow: 'hidden', background: S.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 110, height: 110, transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Image src={p.icon} alt={p.name} fill style={{ objectFit: 'contain' }} />
                </div>
                {p.badge && (
                  <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'Cinzel,serif', fontSize: '0.58rem', letterSpacing: '0.14em', border: `1px solid rgba(184,151,90,0.6)`, color: S.gold, padding: '3px 12px', background: S.offWhite }}>
                    {p.badge.toUpperCase()}
                  </span>
                )}
                <span style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(253,252,248,0.9)', border: `1px solid ${S.nude}`, color: S.muted, fontFamily: 'Cinzel,serif', fontSize: '0.6rem', padding: '3px 10px', letterSpacing: '0.1em' }}>
                  {p.material}
                </span>
              </div>
              {/* Product Info */}
              <div style={{ padding: '24px', background: S.offWhite }}>
                <div style={{ fontFamily: 'Cinzel,serif', color: S.nudeDark, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {p.col}
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 400, color: S.obsidian, lineHeight: 1.3, marginBottom: 16, minHeight: 60 }}>
                  {p.name}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-display" style={{ fontSize: '1.3rem', color: S.obsidian, fontWeight: 300 }}>
                    ${p.price.toLocaleString('es-CL')}
                  </span>
                  <button style={{
                    fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    background: S.obsidian, border: `1px solid ${S.obsidian}`, color: S.offWhite,
                    padding: '10px 22px', cursor: 'pointer', transition: 'all 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = S.gold; e.currentTarget.style.borderColor = S.gold; e.currentTarget.style.color = S.obsidian; }}
                    onMouseLeave={e => { e.currentTarget.style.background = S.obsidian; e.currentTarget.style.borderColor = S.obsidian; e.currentTarget.style.color = S.offWhite; }}
                  >
                    Comprar Set
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
          <div className="amora-divider" style={{ marginBottom: 20 }}>
            <span className="line" />
            <span>EMPAQUE FIRMA</span>
            <span className="line rev" />
          </div>
          <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 300, color: S.obsidian, marginBottom: 20 }}>
            Presentación de Lujo
          </h2>
          <p style={{ color: S.muted, fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 24 }}>
            Cada compra es un regalo para ti o para alguien especial. Recibe tus joyas Amora en nuestra icónica caja texturizada en tono Ivory, atada con cinta de raso negra y acompañada de su Certificado de Autenticidad, lista para sorprender.
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
  const cols = [
    { t: 'Joyería',     ls: ['Anillos', 'Collares', 'Pulseras', 'Aros'] },
    { t: 'Colecciones', ls: ['Classica', 'Vienna', 'Gema', 'Amora'] },
    { t: 'Ayuda',       ls: ['Cómo comprar', 'Envíos', 'Cambios', 'Contacto'] },
  ];
  return (
    <footer style={{ background: S.offWhite, borderTop: `1px solid ${S.nude}`, paddingTop: 72 }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(3, 1fr)', gap: 48, paddingBottom: 56, borderBottom: `1px solid ${S.nude}` }}>
          <div>
            <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={33} style={{ objectFit: 'contain', marginBottom: 20 }} />
            <p style={{ color: S.muted, fontSize: '0.82rem', lineHeight: 1.75, marginBottom: 24 }}>
              Joyería premium diseñada para mujeres que aprecian el lujo en cada detalle.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { img: '/amora_instagram.png', href: '#', title: 'Instagram' },
                { img: '/amora_whatsapp.png', href: '#', title: 'WhatsApp' },
                { img: '/amora_email.png', href: '#', title: 'Email' },
              ].map(s => (
                <a key={s.title} href={s.href} title={s.title} style={{ width: 36, height: 36, border: `1px solid ${S.nude}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', padding: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.nude; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image src={s.img} alt={s.title} fill style={{ objectFit: 'contain' }} />
                  </div>
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.t}>
              <div style={{ fontFamily: 'Cinzel,serif', color: S.obsidian, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20 }}>{col.t}</div>
              {col.ls.map(l => (
                <a key={l} href="#" style={{ display: 'block', color: S.muted, fontSize: '0.85rem', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = S.obsidian)}
                  onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
                >{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: S.nudeDark, fontSize: '0.7rem', fontFamily: 'Cinzel,serif', letterSpacing: '0.08em' }}>© 2024 AMORA JEWELRY. TODOS LOS DERECHOS RESERVADOS.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacidad', 'Términos', 'Cookies'].map(t => (
              <a key={t} href="#" style={{ color: S.nudeDark, fontSize: '0.7rem', textDecoration: 'none', fontFamily: 'Cinzel,serif' }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────
export default function RegalosPage() {
  return (
    <div style={{ background: S.offWhite, minHeight: '100vh', color: S.obsidian }}>
      <Navbar />
      <Hero />
      <FeaturedGifts />
      <LuxuryPackaging />
      <Footer />

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/569XXXXXXXX" target="_blank" rel="noopener noreferrer" style={{
        position: 'fixed', bottom: 30, right: 30, zIndex: 1000,
        width: 56, height: 56, borderRadius: '50%',
        background: '#FFFFFF', border: '1px solid #E3DBCC',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        padding: 12
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(184,151,90,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image src="/amora_whatsapp.png" alt="WhatsApp" fill style={{ objectFit: 'contain' }} />
        </div>
      </a>
    </div>
  );
}
