import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/categories';
import { CATEGORY_ICONS } from '../../utils/categoryIcons';

const CategoryGrid = () => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
    {CATEGORIES.map((cat) => {
      const Icon = CATEGORY_ICONS[cat.value];
      return (
        <Link
          key={cat.value}
          to={`/shop?category=${cat.value}`}
          className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-cream)">
            <Icon size={22} className="text-(--color-accent-dark)" />
          </span>
          <span className="text-sm font-medium text-(--color-ink)">{cat.label}</span>
        </Link>
      );
    })}
  </div>
);

export default CategoryGrid;
