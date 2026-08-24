'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCart } from './CartContext';
import CartSidebar from './CartSidebar';

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

const CATS = ['Todos', 'Anillos', 'Cadenas', 'Pulseras', 'Aros'];

// ─── PROMO BAR ────────────────────────────────────────────────────────────
function PromoBar() {
  return (
    <div className="promo-bar" style={{ padding:'10px 0', textAlign:'center', color:S.ivory, fontFamily:'Cinzel,serif', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.18em' }}>
      ✦ DESPACHO GRATIS EN TODAS LAS COMPRAS &nbsp;·&nbsp; CUPÓN <strong>AMORA10</strong> – 10% EN TU PRIMERA COMPRA ✦
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [userName, setUserName]     = useState<string | null>(null);
  const [showMenu, setShowMenu]     = useState(false);
  const { cartCount, openCart } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  // Detectar scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Detectar sesión activa
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name as string | undefined;
        setUserName(name ? name.split(' ')[0] : session.user.email?.split('@')[0] || 'Mi Cuenta');
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name as string | undefined;
        setUserName(name ? name.split(' ')[0] : session.user.email?.split('@')[0] || 'Mi Cuenta');
      } else {
        setUserName(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Cerrar menú al clicar fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    window.location.href = '/';
  };

  const navBg  = scrolled ? 'rgba(253,252,248,0.97)' : 'rgba(253,252,248,0.95)';
  const linkColor = S.charcoal;

  // Estilo del cuadro de botón (igual para Mi Cuenta y Colaborador)
  const btnBox: React.CSSProperties = {
    fontFamily:'Cinzel,serif', fontSize:'0.68rem', letterSpacing:'0.12em',
    textTransform:'uppercase', textDecoration:'none',
    color:S.obsidian, border:`1px solid ${S.nude}`,
    padding:'9px 20px', cursor:'pointer', background:'transparent',
    transition:'all 0.25s', whiteSpace:'nowrap' as const,
  };

  return (
    <nav style={{ position:'sticky', top:0, zIndex:100, background:navBg, borderBottom:`1px solid ${S.nude}`, backdropFilter:'blur(20px)', transition:'all 0.3s' }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'0 2rem', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={200} height={48} style={{ objectFit:'contain' }} priority />
        </Link>

        <div style={{ display:'flex', gap:36, alignItems:'center' }}>
          {[
            { l:'Novedades', h:'#novedades' },
            { l:'Catálogo',  h:'#joyeria' },
            { l:'Regalos',   h:'/regalos' },
          ].map(({ l, h }) => (
            <a key={l} href={h} style={{ color:linkColor, textDecoration:'none', fontFamily:'Cinzel,serif', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', transition:'color 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.color=S.gold)}
              onMouseLeave={e=>(e.currentTarget.style.color=linkColor)}
            >{l}</a>
          ))}
          <a href="#sale" style={{ color:S.gold, textDecoration:'none', fontFamily:'Cinzel,serif', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase' }}>Sale</a>
        </div>

        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          {/* Íconos */}
          {[
            { img:'/amora_buscar.png',   title:'Buscar' },
            { img:'/amora_favoritos.png',title:'Favoritos' },
          ].map(a => (
            <button key={a.title} title={a.title} style={{ width:30, height:30, background:'none', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:1, transition:'opacity 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='0.6')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
            >
              <div style={{ position:'relative', width:'100%', height:'100%' }}>
                <Image src={a.img} alt={a.title} fill style={{ objectFit:'contain' }} />
              </div>
            </button>
          ))}

          {/* Carrito con badge */}
          <button title="Carrito" onClick={openCart} style={{ width:30, height:30, background:'none', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', transition:'opacity 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.opacity='0.6')}
            onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
          >
            <div style={{ position:'relative', width:'100%', height:'100%' }}>
              <Image src="/amora_carrito.png" alt="Carrito" fill style={{ objectFit:'contain' }} />
            </div>
            {cartCount > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, background:S.obsidian, color:S.offWhite, borderRadius:'50%', width:16, height:16, fontSize:'0.55rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', fontWeight:700 }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Separador */}
          <span style={{ width:1, height:24, background:S.nude, display:'block' }} />

          {/* Botón Mi Cuenta / Nombre del cliente */}
          <div ref={menuRef} style={{ position:'relative' }}>
            {userName ? (
              <>
                <button
                  onClick={() => setShowMenu(v => !v)}
                  style={{ ...btnBox, background: showMenu ? S.obsidian : 'transparent', color: showMenu ? S.offWhite : S.obsidian }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=S.obsidian; e.currentTarget.style.color=S.offWhite; }}
                  onMouseLeave={e=>{ if(!showMenu){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=S.obsidian; } }}
                >
                  {userName} ▾
                </button>
                {showMenu && (
                  <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:S.offWhite, border:`1px solid ${S.nude}`, borderRadius:8, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.08)', zIndex:200, overflow:'hidden' }}>
                    <div style={{ padding:'10px 16px', fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.1em', color:S.nudeDark, borderBottom:`1px solid ${S.nude}`, textTransform:'uppercase' }}>
                      Mi cuenta
                    </div>
                    <button onClick={handleLogout} style={{ width:'100%', padding:'12px 16px', background:'none', border:'none', textAlign:'left', fontFamily:'Cinzel,serif', fontSize:'0.68rem', color:S.obsidian, cursor:'pointer', letterSpacing:'0.08em', transition:'background 0.2s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background=S.ivory)}
                      onMouseLeave={e=>(e.currentTarget.style.background='none')}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/auth/cliente" style={btnBox}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=S.obsidian; (e.currentTarget as HTMLElement).style.color=S.offWhite; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color=S.obsidian; }}
              >
                Mi Cuenta
              </Link>
            )}
          </div>

          {/* Botón Colaborador — mismo estilo de cuadro */}
          <Link href="/auth/colaborador" style={{ ...btnBox, color:S.muted, border:`1px solid ${S.nude}` }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=S.obsidian; (e.currentTarget as HTMLElement).style.color=S.offWhite; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color=S.muted; }}
          >
            Colaborador
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────
const FONDOS_DESKTOP = ['/Fondo 1.png', '/Fondo 2.png', '/Fondo 3.png', '/Fondo 4.png', '/fondo 5.png'];
const FONDOS_MOBILE = ['/fondo 1 Movil.png', '/Fondo 2 Movil.png', '/Fondo 3 Movil.png', '/Fondo 4 Movil.png', '/Fondo 5 Movil.png'];

function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number|null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setFading(true);
      setCurrent(c => (c + 1) % FONDOS_DESKTOP.length);
      setTimeout(() => { setPrev(null); setFading(false); }, 900);
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <section style={{ position:'relative', minHeight:'94vh', overflow:'hidden', display:'flex', alignItems:'center' }}>
      <style>{`
        .hero-img-mobile { display: none !important; }
        .hero-btn-container { justify-content: flex-end; padding: 0 5vw; }
        @media (max-width: 768px) {
          .hero-img-desktop { display: none !important; }
          .hero-img-mobile { display: block !important; }
          .hero-btn-container { justify-content: center !important; padding: 0 !important; }
        }
      `}</style>

      {/* Prev Image (Crossfade) */}
      {prev !== null && (
        <>
          <Image className="hero-img-desktop" key={`prev-d-${prev}`} src={FONDOS_DESKTOP[prev]} alt="" fill style={{ objectFit:'cover', objectPosition:'center 20%', opacity: fading ? 0 : 1, transition:'opacity 0.9s ease', zIndex:0 }} />
          <Image className="hero-img-mobile" key={`prev-m-${prev}`} src={FONDOS_MOBILE[prev]} alt="" fill style={{ objectFit:'cover', objectPosition:'center 20%', opacity: fading ? 0 : 1, transition:'opacity 0.9s ease', zIndex:0 }} />
        </>
      )}

      {/* Current Image */}
      <Image className="hero-img-desktop" key={`curr-d-${current}`} src={FONDOS_DESKTOP[current]} alt="Amora Jewelry" fill priority style={{ objectFit:'cover', objectPosition:'center 20%', opacity:1, transition:'opacity 0.9s ease', zIndex:0 }} />
      <Image className="hero-img-mobile" key={`curr-m-${current}`} src={FONDOS_MOBILE[current]} alt="Amora Jewelry" fill priority style={{ objectFit:'cover', objectPosition:'center 20%', opacity:1, transition:'opacity 0.9s ease', zIndex:0 }} />

      <div style={{ position:'absolute', bottom:72, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:4 }}>
        {FONDOS_DESKTOP.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Ir a la imagen ${i + 1}`} style={{ width: i===current ? 24 : 8, height:8, borderRadius:4, border:'none', cursor:'pointer', transition:'all 0.35s', background: i===current ? S.obsidian : S.nudeDark, padding:0 }} />
        ))}
      </div>

      <div className="hero-btn-container" style={{ position:'relative', zIndex:3, width:'100%', display:'flex' }}>
        <div className="fade-in">
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
            <a href="#joyeria" className="btn-primary">Ver Catálogo</a>
          </div>
        </div>
      </div>


    </section>
  );
}

function FeaturesBar() {
  const items = [
    { img:'/amora_garantia.png', t:'Inversión Protegida',    d:'Transacciones 100% encriptadas' },
    { img:'/amora_envios.png', t:'Despacho Premium',  d:'Discreción y rapidez a todo Chile' },
    { img:'/amora_garantia.png', t:'Sello de Autenticidad',    d:'Materiales nobles y genuinos' },
    { img:'/amora_sobre_nosotros.png', t:'Experiencia Amora',         d:'30 días para enamorarte o cambiarlo' },
  ];
  return (
    <div style={{ background:S.nude, borderBottom:`1px solid ${S.nudeDark}`, padding:'22px 2rem' }}>
      <style>{`
        .features-grid { display: grid; gap: 24px; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 10px 0; }
        }
      `}</style>
      <div className="features-grid" style={{ maxWidth:1000, margin:'0 auto' }}>
        {items.map(f => (
          <div key={f.t} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative', width:28, height:28, flexShrink:0 }}>
              <Image src={f.img} alt={f.t} fill style={{ objectFit:'contain' }} />
            </div>
            <div>
              <div style={{ fontFamily:'Cinzel,serif', color:S.obsidian, fontSize:'0.66rem', letterSpacing:'0.12em', textTransform:'uppercase' }}>{f.t}</div>
              <div style={{ color:S.muted, fontSize:'0.75rem', marginTop:2 }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRODUCT CARD COMPONENT ──────────────────────────────────────────────────
function ProductCard({ p }: { p: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  // Decide which image to show based on hover state and availability
  const hasRefImage = Boolean(p.reference_image_url);
  const currentImage = (isHovered && hasRefImage) ? p.reference_image_url : p.image_url;

  return (
    <article 
      className="product-card" 
      style={{ borderRight:`1px solid ${S.nude}`, borderBottom: `1px solid ${S.nude}`, display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${p.id}`} style={{ display: 'block', height:260, position:'relative', overflow:'hidden', background:S.offWhite, padding: '10px' }}>
        <div style={{ width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {currentImage ? (
           <div style={{ position: 'relative', width: '100%', height: '100%' }}>
             <Image 
               key={currentImage} 
               src={currentImage} 
               alt={p.title} 
               fill 
               style={{ 
                 objectFit:'contain', 
                 transition:'transform 0.5s ease',
                 transform: isHovered ? 'scale(1.05)' : 'scale(1)'
               }} 
             />
           </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, opacity:0.35 }}>
            <div style={{ position:'relative', width:64, height:64 }}>
              <Image src={`/amora_${(p.category || 'collares').toLowerCase().replace('é','e').replace('a','a')}.png`} alt={p.category} fill style={{ objectFit:'contain' }} onError={() => {}} />
            </div>
            <span style={{ color:S.nudeDark, fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>Imagen próximamente</span>
          </div>
        )}
        {/* Category badge */}
        <span style={{ position:'absolute', bottom:14, right:14, background:'rgba(253,252,248,0.9)', border:`1px solid ${S.nude}`, color:S.muted, fontFamily:'Cinzel,serif', fontSize:'0.6rem', padding:'3px 10px', letterSpacing:'0.1em' }}>
          {p.category}
        </span>
        </div>
      </Link>
      <div style={{ padding:'20px 20px 26px', background:S.ivory, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="font-display" style={{ fontSize:'1.05rem', fontWeight:400, color:S.obsidian, lineHeight:1.3, marginBottom:16, cursor: 'pointer' }}>
            {p.title}
          </h3>
        </Link>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 'auto' }}>
          <span className="font-display" style={{ fontSize:'1.2rem', color:S.obsidian, fontWeight:300 }} suppressHydrationWarning>
            ${p.sale_price.toLocaleString('es-CL')}
          </span>
          <button onClick={() => addToCart(p)} style={{
            fontFamily:'Cinzel,serif', fontSize:'0.58rem', letterSpacing:'0.1em', textTransform:'uppercase',
            background:'transparent', border:`1px solid ${S.nude}`, color:S.charcoal,
            padding:'8px 14px', cursor:'pointer', transition:'all 0.25s',
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background=S.obsidian; e.currentTarget.style.color=S.offWhite; e.currentTarget.style.borderColor=S.obsidian; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=S.charcoal; e.currentTarget.style.borderColor=S.nude; }}
          >Agregar</button>
        </div>
      </div>
    </article>
  );
}

// ─── DYNAMIC CATALOG (Connected to DB) ────────────────────────────────────
function Products({ products }: { products: any[] }) {
  const [filter, setFilter] = useState('Todos');
  const [visibleCount, setVisibleCount] = useState(15);

  const filtered = filter === 'Todos' ? products : products.filter(p => p.category === filter);
  const shown = filtered.slice(0, visibleCount);

  // Cuando cambian de filtro, volvemos a mostrar 15 por defecto
  useEffect(() => {
    setVisibleCount(15);
  }, [filter]);

  return (
    <section id="joyeria" style={{ padding:'96px 2rem', background:S.ivory }}>
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:48, flexWrap:'wrap', gap:20 }}>
          <div>
            <h2 className="font-display" style={{ fontSize:'clamp(2.5rem,5vw,3.8rem)', fontWeight:300, color:S.obsidian }}>Catálogo</h2>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                fontFamily:'Cinzel,serif', fontSize:'0.66rem', letterSpacing:'0.12em', textTransform:'uppercase',
                padding:'8px 20px',
                background: filter===c ? S.obsidian : 'transparent',
                color: filter===c ? S.offWhite : S.muted,
                border: filter===c ? `1px solid ${S.obsidian}` : `1px solid ${S.nude}`,
                cursor:'pointer', transition:'all 0.25s',
              }}>{c}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: S.muted, fontSize: '1.2rem', fontFamily: 'Cinzel,serif' }}>
            Aún no hay productos disponibles en esta categoría.
          </div>
        ) : (
          <>
            <div style={{ 
              display:'grid', 
              gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: 1, 
              border:`1px solid ${S.nude}` 
            }}>
              <style>{`
                @media (min-width: 1300px) {
                  #joyeria .product-grid {
                    grid-template-columns: repeat(5, 1fr) !important;
                  }
                }
              `}</style>
              <div className="product-grid" style={{ display: 'contents' }}>
                {shown.map(p => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>

            {/* Load More Button */}
            {visibleCount < filtered.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                <button 
                  onClick={() => setVisibleCount(v => v + 15)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${S.obsidian}`,
                    color: S.obsidian,
                    fontFamily: 'Cinzel,serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '12px 32px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.obsidian; e.currentTarget.style.color = S.offWhite; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.obsidian; }}
                >
                  Cargar Más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── SECOND BANNER ────────────────────────────────────────────────────────
function SecondBanner() {
  return (
    <section id="novedades" style={{ position:'relative', height:520, overflow:'hidden', display:'flex', alignItems:'center' }}>
      <Image src="/seccion-banner.png" alt="Colección Amora" fill style={{ objectFit:'cover', objectPosition:'center 20%' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(16,16,16,0.75) 40%, rgba(16,16,16,0.25) 100%)' }} />
      <div style={{ position:'relative', zIndex:1, maxWidth:1320, margin:'0 auto', padding:'0 2rem' }}>
        <div style={{ maxWidth:500 }}>
          <div className="amora-divider" style={{ marginBottom:20, maxWidth:290 }}>
            <span className="line" style={{ background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5))' }} />
            <span style={{ color:'#D4B878', fontSize:'0.82rem' }}>✦ JOYERÍA EXCLUSIVA</span>
            <span className="line rev" style={{ background:'linear-gradient(90deg,rgba(212,175,55,0.5),transparent)' }} />
          </div>
          <h2 className="font-display" style={{ fontSize:'clamp(2.5rem,5vw,4.2rem)', fontWeight:300, lineHeight:1.1, color:S.offWhite, marginBottom:20 }}>
            La elegancia en<br /><em style={{ fontStyle:'italic' }}>cada detalle</em>
          </h2>
          <p style={{ color:'rgba(253,252,248,0.65)', marginBottom:32, lineHeight:1.75, fontSize:'0.95rem' }}>
            Cada pieza Amora nace de la pasión por la joyería artesanal. Diseños únicos que resaltan tu belleza natural.
          </p>
          <a href="#joyeria" style={{ display:'inline-flex', alignItems:'center', gap:8, background:S.offWhite, color:S.obsidian, fontFamily:'Cinzel,serif', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', padding:'15px 38px', textDecoration:'none', transition:'all 0.3s' }}
            onMouseEnter={e=>e.currentTarget.style.background=S.ivory}
            onMouseLeave={e=>e.currentTarget.style.background=S.offWhite}
          >Explorar ahora</a>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { t:'Joyería',     ls:['Anillos','Cadenas','Pulseras','Aros'] },
    { t:'Ayuda',       ls:['Cómo comprar','Envíos','Cambios','Contacto'] },
  ];
  return (
    <footer style={{ background:S.offWhite, borderTop:`1px solid ${S.nude}`, paddingTop:72 }}>
      <div style={{ maxWidth:1320, margin:'0 auto', padding:'0 2rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'280px repeat(2,1fr)', gap:48, paddingBottom:56, borderBottom:`1px solid ${S.nude}` }}>
          <div>
            <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={33} style={{ objectFit:'contain', marginBottom:20 }} />
            <p style={{ color:S.muted, fontSize:'0.82rem', lineHeight:1.75, marginBottom:24 }}>
              Joyería premium diseñada para mujeres que aprecian el lujo en cada detalle.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              {[
                { img: '/amora_instagram.png', href: '#', title: 'Instagram' },
                { img: '/amora_whatsapp.png', href: '#', title: 'WhatsApp' },
                { img: '/amora_email.png', href: '#', title: 'Email' },
              ].map(s => (
                <a key={s.title} href={s.href} title={s.title} style={{ width:36, height:36, border:`1px solid ${S.nude}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.25s', padding: 8 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=S.nude; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
                >
                  <div style={{ position:'relative', width:'100%', height:'100%' }}>
                    <Image src={s.img} alt={s.title} fill style={{ objectFit:'contain' }} />
                  </div>
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.t}>
              <div style={{ fontFamily:'Cinzel,serif', color:S.obsidian, fontSize:'0.66rem', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:20 }}>{col.t}</div>
              {col.ls.map(l => (
                <a key={l} href="#" style={{ display:'block', color:S.muted, fontSize:'0.85rem', textDecoration:'none', marginBottom:12, transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color=S.obsidian)}
                  onMouseLeave={e=>(e.currentTarget.style.color=S.muted)}
                >{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding:'24px 0', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <span style={{ color:S.nudeDark, fontSize:'0.7rem', fontFamily:'Cinzel,serif', letterSpacing:'0.08em' }}>© 2024 AMORA JEWELRY. TODOS LOS DERECHOS RESERVADOS.</span>
          <div style={{ display:'flex', gap:20 }}>
            {['Privacidad','Términos','Cookies'].map(t => (
              <a key={t} href="#" style={{ color:S.nudeDark, fontSize:'0.7rem', textDecoration:'none', fontFamily:'Cinzel,serif' }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── FEATURED PRODUCTS ──────────────────────────────────────────────────────
function FeaturedProducts({ products }: { products: any[] }) {
  // Tomamos los 4 primeros productos reales de la base de datos
  const featured = products.slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section style={{ padding: '80px 2rem', background: S.offWhite }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="amora-divider" style={{ marginBottom: 32 }}>
          <span className="line" />
          <span>Selección Exclusiva</span>
          <span className="line rev" />
        </div>
        <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 300, textAlign: 'center', color: S.obsidian, marginBottom: 56 }}>
          Productos Destacados
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {featured.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function StorefrontClient({ products }: { products: any[] }) {
  return (
    <>
      <PromoBar />
      <Navbar />
      <main>
        {/* Usamos h1 invisible para SEO general si es necesario, o que el Hero contenga el título principal. */}
        <h1 className="sr-only" style={{ display: 'none' }}>Amora Jewelry - Joyería Premium en Chile</h1>
        
        <Hero />
        <FeaturesBar />
        <FeaturedProducts products={products} />
        <Products products={products} />
        <SecondBanner />
      </main>
      <Footer />
      <CartSidebar />

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/569XXXXXXXX" target="_blank" rel="noopener noreferrer" aria-label="Contáctanos por WhatsApp" style={{
        position:'fixed', bottom:30, right:30, zIndex:1000,
        width:56, height:56, borderRadius:'50%',
        background:'#FFFFFF', border:'1px solid #E3DBCC',
        boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'transform 0.3s ease, box-shadow 0.3s ease',
        padding:12
      }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(184,151,90,0.3)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; }}
      >
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
          <Image src="/amora_whatsapp.png" alt="WhatsApp" fill style={{ objectFit:'contain' }} />
        </div>
      </a>
    </>
  );
}
