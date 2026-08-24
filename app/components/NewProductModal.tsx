'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  productSchema,
  SHIPPING_PROFILES,
  PRODUCT_CATEGORIES,
  type ProductFormData,
} from '@/lib/schemas/product';
import { createProduct } from '@/app/admin/actions/create-product';
import { updateProduct } from '@/app/admin/actions/update-product';
import { toast } from '@/app/components/Toast';

// ─── Design Tokens ──────────────────────────────────────────────────────
const C = {
  bg:        '#111111',
  surface:   '#1A1A1A',
  border:    'rgba(212,175,55,0.15)',
  borderHi:  'rgba(212,175,55,0.35)',
  gold:      '#D4AF37',
  goldDim:   'rgba(212,175,55,0.6)',
  text:      '#E5E5E5',
  textDim:   '#777',
  error:     '#EF4444',
  white:     '#fff',
  black:     '#000',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '0.85rem',
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
  color: C.text, outline: 'none', transition: 'border-color 0.2s',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', color: C.textDim,
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500,
};
const errorStyle: React.CSSProperties = {
  color: C.error, fontSize: '0.72rem', marginTop: 4,
};

// ─── Props ──────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productToEdit?: any;
}

// ─── Component ──────────────────────────────────────────────────────────
export default function NewProductModal({ isOpen, onClose, onSuccess, productToEdit }: Props) {
  // Main Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference Image State
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [refImageFile, setRefImageFile] = useState<File | null>(null);
  const [isRefDragging, setIsRefDragging] = useState(false);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Anillos',
      salePrice: undefined,
      costPrice: undefined,
      sku: '',
      isUnlimitedStock: true,
      stockQuantity: undefined,
      shippingProfileId: 'shipping_standard',
      weight: undefined,
      dimensions: '',
      status: 'active',
    },
  });

  // Populate data when editing
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        reset({
          title: productToEdit.title,
          description: productToEdit.description || '',
          category: productToEdit.category,
          salePrice: productToEdit.sale_price,
          costPrice: productToEdit.cost_price || undefined,
          sku: productToEdit.sku || '',
          isUnlimitedStock: productToEdit.stock === null,
          stockQuantity: productToEdit.stock !== null ? productToEdit.stock : undefined,
          shippingProfileId: productToEdit.shipping_profile_id || 'shipping_standard',
          weight: productToEdit.weight || undefined,
          dimensions: productToEdit.dimensions || '',
          status: productToEdit.status,
        });
        setImagePreview(productToEdit.image_url || null);
        setRefImagePreview(productToEdit.reference_image_url || null);
      } else {
        reset({
          title: '',
          description: '',
          category: 'Anillos',
          salePrice: undefined,
          costPrice: undefined,
          sku: '',
          isUnlimitedStock: true,
          stockQuantity: undefined,
          shippingProfileId: 'shipping_standard',
          weight: undefined,
          dimensions: '',
          status: 'active',
        });
        setImagePreview(null);
        setRefImagePreview(null);
      }
      setImageFile(null);
      setRefImageFile(null);
    }
  }, [isOpen, productToEdit, reset]);

  const isUnlimited = watch('isUnlimitedStock');

  // ── Image handling helpers ──────────────────────────────────────────────────
  const validateImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', message: 'Solo se permiten archivos de imagen (PNG, JPG, WebP)' });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', message: 'La imagen no debe superar los 5 MB' });
      return false;
    }
    return true;
  };

  // Main Image handlers
  const handleImageFile = useCallback((file: File) => {
    if (!validateImage(file)) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const removeImage = useCallback(() => {
    if (imagePreview && !imagePreview.startsWith('http')) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }, [imagePreview]);

  // Ref Image handlers
  const handleRefImageFile = useCallback((file: File) => {
    if (!validateImage(file)) return;
    setRefImageFile(file);
    setRefImagePreview(URL.createObjectURL(file));
  }, []);

  const removeRefImage = useCallback(() => {
    if (refImagePreview && !refImagePreview.startsWith('http')) URL.revokeObjectURL(refImagePreview);
    setRefImageFile(null);
    setRefImagePreview(null);
  }, [refImagePreview]);


  // ── Submit handler ──────────────────────────────────────────────────
  const onSubmit = async (data: ProductFormData, status: 'active' | 'draft' = 'active') => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description || '');
      fd.append('category', data.category);
      fd.append('salePrice', String(data.salePrice));
      if (data.costPrice !== undefined) fd.append('costPrice', String(data.costPrice));
      fd.append('sku', data.sku || '');
      fd.append('isUnlimitedStock', String(data.isUnlimitedStock));
      if (!data.isUnlimitedStock && data.stockQuantity !== undefined) {
        fd.append('stockQuantity', String(data.stockQuantity));
      }
      fd.append('shippingProfileId', data.shippingProfileId);
      if (data.weight !== undefined) fd.append('weight', String(data.weight));
      fd.append('dimensions', data.dimensions || '');
      fd.append('status', status);
      
      if (imageFile) fd.append('image', imageFile);
      if (refImageFile) fd.append('referenceImage', refImageFile);

      let result;
      if (productToEdit) {
        result = await updateProduct(productToEdit.id, fd);
      } else {
        result = await createProduct(fd);
      }

      if (result.success) {
        toast({ type: 'success', message: result.message });
        handleClose();
        onSuccess?.();
      } else {
        toast({ type: 'error', message: result.message });
      }
    } catch {
      toast({ type: 'error', message: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset & close ───────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    reset();
    removeImage();
    removeRefImage();
    onClose();
  }, [reset, removeImage, removeRefImage, onClose]);

  if (!isOpen) return null;

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        zIndex: 200, transition: 'opacity 0.25s',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw', maxWidth: 840, maxHeight: '90vh',
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 20, zIndex: 201, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 28px', borderBottom: `1px solid ${C.border}`,
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: C.gold }}>
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto de Joyería'}
          </h2>
          <button onClick={handleClose} style={{
            background: 'none', border: 'none', color: C.textDim, fontSize: '1.4rem',
            cursor: 'pointer', lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit((data) => onSubmit(data, 'active'))}
          style={{ overflow: 'auto', padding: '24px 28px', flex: 1 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>
            {/* ═════ LEFT: Media ═════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Main Image */}
              <div>
                <label style={labelStyle}>Imagen Principal</label>
                <div
                  onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) handleImageFile(f); }}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%', height: 180,
                    border: `2px dashed ${isDragging ? C.gold : C.border}`, borderRadius: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', background: isDragging ? 'rgba(212,175,55,0.06)' : 'transparent', transition: 'all 0.25s',
                  }}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image src={imagePreview} alt="Preview" fill style={{ objectFit: 'contain', borderRadius: 10 }} />
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>☁</span>
                      <span style={{ color: C.textDim, fontSize: '0.75rem', textAlign: 'center', padding: '0 12px' }}>Fondo transparente recomendado</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const f = e.target.files?.[0]; if(f) handleImageFile(f); }} style={{ display: 'none' }} />
                </div>
                {imagePreview && (
                  <button type="button" onClick={removeImage} style={{ width: '100%', marginTop: 8, padding: '6px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: '0.75rem', cursor: 'pointer' }}>Quitar</button>
                )}
              </div>

              {/* Reference Image */}
              <div>
                <label style={labelStyle}>Imagen de Referencia</label>
                <div
                  onDrop={e => { e.preventDefault(); setIsRefDragging(false); const f = e.dataTransfer.files[0]; if(f) handleRefImageFile(f); }}
                  onDragOver={e => { e.preventDefault(); setIsRefDragging(true); }}
                  onDragLeave={() => setIsRefDragging(false)}
                  onClick={() => refFileInputRef.current?.click()}
                  style={{
                    width: '100%', height: 180,
                    border: `2px dashed ${isRefDragging ? C.gold : C.border}`, borderRadius: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', background: isRefDragging ? 'rgba(212,175,55,0.06)' : 'transparent', transition: 'all 0.25s',
                  }}
                >
                  {refImagePreview ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image src={refImagePreview} alt="Preview Ref" fill style={{ objectFit: 'contain', borderRadius: 10 }} />
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>📸</span>
                      <span style={{ color: C.textDim, fontSize: '0.75rem', textAlign: 'center', padding: '0 12px' }}>Ej: Producto en la mano</span>
                    </>
                  )}
                  <input ref={refFileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const f = e.target.files?.[0]; if(f) handleRefImageFile(f); }} style={{ display: 'none' }} />
                </div>
                {refImagePreview && (
                  <button type="button" onClick={removeRefImage} style={{ width: '100%', marginTop: 8, padding: '6px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: '0.75rem', cursor: 'pointer' }}>Quitar referencia</button>
                )}
              </div>

            </div>

            {/* ═════ RIGHT: Fields ═════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Título *</label>
                  <input {...register('title')} placeholder="Anillo Solitario de Diamante Amora" style={inputStyle} />
                  {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select {...register('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Descripción detallada del producto…"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
                />
              </div>

              {/* ── Precios ── */}
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', color: C.gold, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Precios
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Precio de Venta *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textDim, fontSize: '0.82rem' }}>$</span>
                      <input
                        {...register('salePrice', { valueAsNumber: true })}
                        type="number"
                        placeholder="1250000"
                        style={{ ...inputStyle, paddingLeft: 28 }}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.textDim, fontSize: '0.7rem' }}>CLP</span>
                    </div>
                    {errors.salePrice && <p style={errorStyle}>{errors.salePrice.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Precio de Costo</label>
                    <input
                      {...register('costPrice', { valueAsNumber: true })}
                      type="number"
                      placeholder="Precio de Costo"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ── Inventario ── */}
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', color: C.gold, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Inventario y Stock
                </div>

                {/* SKU */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>SKU</label>
                  <input {...register('sku')} placeholder="SKU Único" style={inputStyle} />
                </div>

                {/* Stock Toggle */}
                <div style={{
                  padding: 16, border: `1px solid ${C.border}`, borderRadius: 10,
                  background: C.bg,
                }}>
                  <div style={{ fontSize: '0.78rem', color: C.text, marginBottom: 12, fontWeight: 500 }}>
                    Establecer Control de Stock
                  </div>
                  <Controller
                    control={control}
                    name="isUnlimitedStock"
                    render={({ field }) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {/* Unlimited */}
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            checked={field.value === true}
                            onChange={() => field.onChange(true)}
                            style={{ accentColor: C.gold, marginTop: 3 }}
                          />
                          <div>
                            <div style={{ color: C.text, fontSize: '0.82rem', fontWeight: 500 }}>Stock Ilimitado</div>
                            <div style={{ color: C.textDim, fontSize: '0.7rem' }}>El producto siempre estará disponible para la venta.</div>
                          </div>
                        </label>
                        {/* Specific */}
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            checked={field.value === false}
                            onChange={() => field.onChange(false)}
                            style={{ accentColor: C.gold, marginTop: 3 }}
                          />
                          <div>
                            <div style={{ color: C.text, fontSize: '0.82rem', fontWeight: 500 }}>Stock Específico</div>
                            <div style={{ color: C.textDim, fontSize: '0.7rem' }}>Establecer una cantidad fija en inventario.</div>
                          </div>
                        </label>
                      </div>
                    )}
                  />

                  {/* Quantity field (conditional) */}
                  {!isUnlimited && (
                    <div style={{ marginTop: 14 }}>
                      <label style={labelStyle}>Cantidad en Stock *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          {...register('stockQuantity', { valueAsNumber: true })}
                          type="number"
                          min={0}
                          placeholder="0"
                          style={{ ...inputStyle, width: 120, textAlign: 'center' }}
                        />
                      </div>
                      {errors.stockQuantity && <p style={errorStyle}>{errors.stockQuantity.message}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer Actions ─────────────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}`,
          }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '11px 24px', fontSize: '0.78rem', fontWeight: 600,
                background: C.gold, color: C.black, border: 'none', borderRadius: 8,
                cursor: isSubmitting ? 'wait' : 'pointer', transition: 'opacity 0.2s',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Guardando…' : (productToEdit ? 'Guardar Cambios' : 'Crear Producto')}
            </button>
            
            {!productToEdit && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                style={{
                  padding: '11px 24px', fontSize: '0.78rem', fontWeight: 500,
                  background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                  border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 8,
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                Guardar Borrador
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '11px 24px', fontSize: '0.78rem',
                background: 'transparent', color: C.textDim,
                border: `1px solid ${C.border}`, borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
