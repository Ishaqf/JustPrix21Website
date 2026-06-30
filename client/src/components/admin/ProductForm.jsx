import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, ImagePlus, Plus, GripVertical } from 'lucide-react';
import { createProduct, updateProduct } from '../../api/products';
import useToastStore from '../../store/toastStore';
import { CATEGORIES } from '../../utils/categories';
import { BRANDS_BY_CATEGORY } from '../../utils/brands';

const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'used', label: 'Occasion' },
  { value: 'refurbished', label: 'Reconditionné' },
];

// Inline brand selector: shows known brands for the category in a dropdown,
// plus an "Autre" fallback that reveals a text input for custom brands.
const BrandSelector = ({ category, value, onChange }) => {
  const known = BRANDS_BY_CATEGORY[category] || [];
  const isCustom = value && !known.includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleSelectChange = (e) => {
    if (e.target.value === '__autre__') {
      setShowCustom(true);
      onChange('');
    } else {
      setShowCustom(false);
      onChange(e.target.value);
    }
  };

  const inputClass = 'w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)';

  return (
    <div className="flex flex-col gap-2">
      <select
        value={showCustom ? '__autre__' : (value || '')}
        onChange={handleSelectChange}
        className={inputClass}
      >
        <option value="" disabled>Choisir une marque</option>
        {known.map((b) => <option key={b} value={b}>{b}</option>)}
        <option value="__autre__">Autre…</option>
      </select>
      {showCustom && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nom de la marque"
          className={inputClass}
        />
      )}
    </div>
  );
};

// Slide-over panel wrapping the create/edit form. `product` is null for
// create, or a full product document for edit.
const ProductForm = ({ product, onClose, onSaved }) => {
  const isEdit = Boolean(product);
  const showToast = useToastStore((s) => s.showToast);

  // Images state: existing (for edit), staged (new files), and list of
  // existing image URLs to remove on submit.
  const [stagedFiles, setStagedFiles] = useState([]);
  const [stagedPreviews, setStagedPreviews] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Tags live outside RHF: comma-separated chips, set imperatively.
  const [tags, setTags] = useState(product?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  const defaultSpecs = product?.specs
    ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) }))
    : [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      category: product?.category ?? '',
      brand: product?.brand ?? '',
      price: product?.price ?? '',
      salePrice: product?.salePrice ?? '',
      sku: product?.sku ?? '',
      stock: product?.stock ?? 0,
      condition: product?.condition ?? 'new',
      warrantyMonths: product?.warrantyMonths ?? 0,
      isFeatured: product?.isFeatured ?? false,
      isActive: product?.isActive ?? true,
      specs: defaultSpecs,
      variants: product?.variants?.map((v) => ({
        size: v.size ?? '',
        color: v.color ?? '',
        stock: v.stock ?? 0,
        sku: v.sku ?? '',
      })) ?? [],
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'specs' });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const category = watch('category');
  const brand = watch('brand');

  // Reset brand when category changes if current brand isn't in new category's list.
  useEffect(() => {
    const known = BRANDS_BY_CATEGORY[category] || [];
    if (brand && !known.includes(brand)) setValue('brand', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Build live object-URL previews for staged files, revoke on cleanup.
  useEffect(() => {
    const urls = stagedFiles.map((f) => URL.createObjectURL(f));
    setStagedPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [stagedFiles]);

  const addFiles = useCallback((files) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setStagedFiles((prev) => [...prev, ...images]);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
      setTagInput('');
    }
  };

  const existingImages = (product?.images ?? []).filter((url) => !removeImages.includes(url));

  const onSubmit = async (formData) => {
    const data = new FormData();

    // Scalar fields
    const scalars = ['name', 'description', 'category', 'brand', 'price', 'sku', 'stock', 'condition', 'warrantyMonths'];
    scalars.forEach((k) => { if (formData[k] !== '' && formData[k] !== undefined) data.append(k, formData[k]); });
    if (formData.salePrice !== '' && formData.salePrice !== null) data.append('salePrice', formData.salePrice);
    data.append('isFeatured', String(formData.isFeatured));
    data.append('isActive', String(formData.isActive));

    // JSON fields (multer hands these to the controller as strings)
    const specsObj = {};
    formData.specs.forEach(({ key, value }) => { if (key) specsObj[key.trim()] = value; });
    data.append('specs', JSON.stringify(specsObj));

    const variantsArr = formData.variants.map((v) => ({
      size: v.size || undefined,
      color: v.color || undefined,
      stock: Number(v.stock) || 0,
      sku: v.sku || undefined,
    }));
    data.append('variants', JSON.stringify(variantsArr));
    data.append('tags', JSON.stringify(tags));

    // Images
    stagedFiles.forEach((f) => data.append('images', f));
    if (isEdit && removeImages.length > 0) data.append('removeImages', JSON.stringify(removeImages));

    try {
      if (isEdit) {
        await updateProduct(product._id, data);
        showToast('success', 'Produit mis à jour');
      } else {
        await createProduct(data);
        showToast('success', 'Produit créé');
      }
      onSaved();
    } catch (err) {
      showToast('error', err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const fieldClass = 'w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)';
  const labelClass = 'mb-1 block text-xs font-semibold text-(--color-muted)';

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop — absolute so it covers full screen without affecting panel layout */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel: CSS grid with 3 explicit rows — header (auto), scrollable
          content (1fr = all remaining space), footer (auto). Grid tracks
          have no min-height ambiguity, so the footer is always fully
          visible and clickable regardless of content height. */}
      <div className="absolute inset-y-0 right-0 grid w-full max-w-xl grid-rows-[auto_1fr_auto] bg-white shadow-2xl">

        {/* Row 1 — header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-lg font-bold text-(--color-ink)">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button type="button" onClick={onClose} className="cursor-pointer text-(--color-muted) hover:text-(--color-ink)">
            <X size={20} />
          </button>
        </div>

        {/* Row 2 — scrollable form body */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
          <div className="flex flex-col gap-5 px-5 py-5">
          {/* Images */}
          <div>
            <p className={labelClass}>Images</p>
            <div className="flex flex-wrap gap-2">
              {/* Existing images */}
              {existingImages.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemoveImages((r) => [...r, url])}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {/* Staged previews */}
              {stagedPreviews.map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover opacity-80" />
                  <button
                    type="button"
                    onClick={() => setStagedFiles((f) => f.filter((_, fi) => fi !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {/* Drop zone */}
              <div
                ref={dropZoneRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black/20 text-(--color-muted) hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                <ImagePlus size={20} />
                <span className="mt-1 text-xs">Ajouter</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
          </div>

          {/* Basic info */}
          <div>
            <label className={labelClass}>Nom *</label>
            <input {...register('name', { required: true })} className={fieldClass} />
            {errors.name && <p className="mt-1 text-xs text-red-600">Obligatoire</p>}
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <textarea {...register('description', { required: true })} rows={3} className={fieldClass} />
            {errors.description && <p className="mt-1 text-xs text-red-600">Obligatoire</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Catégorie *</label>
              <select {...register('category', { required: true })} className={fieldClass}>
                <option value="" disabled>Choisir</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">Obligatoire</p>}
            </div>
            <div>
              <label className={labelClass}>Marque *</label>
              <BrandSelector
                category={category}
                value={brand}
                onChange={(v) => setValue('brand', v)}
              />
              {errors.brand && <p className="mt-1 text-xs text-red-600">Obligatoire</p>}
              <input type="hidden" {...register('brand', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Prix (DA) *</label>
              <input type="number" min="0" {...register('price', { required: true })} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Prix soldé</label>
              <input type="number" min="0" {...register('salePrice')} placeholder="Optionnel" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Stock *</label>
              <input type="number" min="0" {...register('stock', { required: true })} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>SKU</label>
              <input {...register('sku')} placeholder="Optionnel" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>État</label>
              <select {...register('condition')} className={fieldClass}>
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Garantie (mois)</label>
              <input type="number" min="0" {...register('warrantyMonths')} className={fieldClass} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
              <input type="checkbox" {...register('isFeatured')} className="rounded" />
              Mis en avant
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              Actif (visible)
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex flex-wrap gap-1.5 rounded-md border border-black/10 p-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-(--color-cream) px-2 py-0.5 text-xs font-medium text-(--color-ink)">
                  {tag}
                  <button type="button" onClick={() => setTags((t) => t.filter((x) => x !== tag))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Tag + Entrée"
                className="min-w-24 border-none bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          {/* Specs */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Caractéristiques</label>
              <button type="button" onClick={() => appendSpec({ key: '', value: '' })} className="flex items-center gap-1 text-xs font-medium text-(--color-accent-dark)">
                <Plus size={12} />Ajouter
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {specFields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <GripVertical size={14} className="shrink-0 text-(--color-muted)" />
                  <input {...register(`specs.${i}.key`)} placeholder="Clé (ex: RAM)" className={`${fieldClass} flex-1`} />
                  <input {...register(`specs.${i}.value`)} placeholder="Valeur (ex: 8 Go)" className={`${fieldClass} flex-1`} />
                  <button type="button" onClick={() => removeSpec(i)} className="text-(--color-muted) hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Variantes (taille / couleur)</label>
              <button type="button" onClick={() => appendVariant({ size: '', color: '', stock: 0, sku: '' })} className="flex items-center gap-1 text-xs font-medium text-(--color-accent-dark)">
                <Plus size={12} />Ajouter
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {variantFields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-4 gap-2">
                  <input {...register(`variants.${i}.size`)} placeholder="Taille" className={fieldClass} />
                  <input {...register(`variants.${i}.color`)} placeholder="Couleur" className={fieldClass} />
                  <input type="number" min="0" {...register(`variants.${i}.stock`)} placeholder="Stock" className={fieldClass} />
                  <div className="flex gap-1">
                    <input {...register(`variants.${i}.sku`)} placeholder="SKU" className={`${fieldClass} flex-1`} />
                    <button type="button" onClick={() => removeVariant(i)} className="text-(--color-muted) hover:text-red-600">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </form>

        {/* Row 3 — footer (outside the form so it never scrolls) */}
        <div className="flex gap-3 border-t border-black/5 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-full border border-black/10 py-2.5 text-sm font-medium text-(--color-ink) hover:bg-(--color-cream)"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="flex-1 cursor-pointer rounded-full bg-(--color-accent) py-2.5 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
          >
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
