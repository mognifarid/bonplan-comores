import { Link } from 'react-router-dom';
import { Category } from '@/types/listing';

interface CategoryCardProps {
  category: Category;
  count?: number;
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <Link
      to={`/annonces?category=${category.slug}`}
      className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted/50 border border-border hover:border-primary/30 transition-all duration-200 shadow-card hover:shadow-card-hover"
    >
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
        {category.icon}
      </div>
      <span className="text-sm font-medium text-foreground text-center">{category.name}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">{count} annonces</span>
      )}
    </Link>
  );
}
