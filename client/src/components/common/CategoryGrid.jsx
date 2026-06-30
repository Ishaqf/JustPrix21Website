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
          className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-cream) transition-colors duration-200 group-hover:bg-(--color-accent)/10">
            <Icon size={22} className="text-(--color-accent-dark)" />
          </span>
          <span className="text-sm font-medium text-(--color-ink)">{cat.label}</span>
        </Link>
      );
    })}
  </div>
);

export default CategoryGrid;
