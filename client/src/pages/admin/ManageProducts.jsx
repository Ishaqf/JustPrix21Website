import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, deleteProduct } from '../../api/products';
import useToastStore from '../../store/toastStore';
import { formatPrice } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/categories';
import Skeleton from '../../components/common/Skeleton';
import ProductForm from '../../components/admin/ProductForm';

const LIMIT = 15;

const ManageProducts = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const [formProduct, setFormProduct] = useState(undefined); // undefined=closed, null=create, product=edit
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const queryParams = { search: search || undefined, category: category || undefined, isActive: isActive || undefined, page, limit: LIMIT, sort: 'newest' };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', queryParams],
    queryFn: async () => {
      const res = await getProducts(queryParams);
      return res.data.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => { invalidate(); showToast('success', 'Produit supprimé'); },
    onError: (err) => showToast('error', err.response?.data?.message || 'Erreur lors de la suppression'),
  });

  const handleDelete = (product) => {
    if (!window.confirm(`Supprimer "${product.name}" ? Cette action supprime aussi ses images Cloudinary.`)) return;
    deleteMutation.mutate(product._id);
  };

  const products = data?.products ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-(--color-ink)">Produits</h1>
        <button
          type="button"
          onClick={() => setFormProduct(null)}
          className="flex items-center gap-2 rounded-full bg-(--color-accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-accent-dark)"
        >
          <PlusCircle size={16} />
          Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs text-(--color-muted)">
              <th className="px-4 py-3 text-left font-semibold">Produit</th>
              <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
              <th className="px-4 py-3 text-right font-semibold">Prix</th>
              <th className="px-4 py-3 text-right font-semibold">Stock</th>
              <th className="px-4 py-3 text-center font-semibold">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="px-4 py-3" colSpan={6}><Skeleton className="h-8" /></td>
                  </tr>
                ))
              : products.map((product) => (
                  <tr key={product._id} className="border-b border-black/5 last:border-0 hover:bg-(--color-cream)/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-md bg-(--color-cream)" />
                        )}
                        <div>
                          <p className="font-medium text-(--color-ink) max-w-48 truncate">{product.name}</p>
                          <p className="text-xs text-(--color-muted)">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-(--color-muted)">
                      {CATEGORIES.find((c) => c.value === product.category)?.label ?? product.category}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-(--color-ink)">{formatPrice(product.price)}</span>
                      {product.salePrice && (
                        <p className="text-xs text-(--color-accent-dark)">{formatPrice(product.salePrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock <= 5 ? 'font-bold text-amber-600' : 'text-(--color-ink)'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-black/10 text-(--color-muted)'}`}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setFormProduct(product)}
                          className="rounded-md p-1.5 text-(--color-muted) hover:bg-(--color-cream) hover:text-(--color-ink)"
                          aria-label="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                          className="rounded-md p-1.5 text-(--color-muted) hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-(--color-muted)">
          <span>Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Product form slide-over */}
      {formProduct !== undefined && (
        <ProductForm
          product={formProduct}
          onClose={() => setFormProduct(undefined)}
          onSaved={() => { setFormProduct(undefined); invalidate(); queryClient.invalidateQueries({ queryKey: ['products'] }); }}
        />
      )}
    </div>
  );
};

export default ManageProducts;
