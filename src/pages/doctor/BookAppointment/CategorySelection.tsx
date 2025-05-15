import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useExaminationStore } from '../../../stores/examinationStore';
import { ExaminationCategory } from '../../../types';

interface CategorySelectionProps {
  onSelectCategory: (categoryId: string) => void;
  onBack?: () => void;
}

function CategorySelection({ onSelectCategory, onBack }: CategorySelectionProps) {
  const { categories, fetchCategories, isLoading, error } = useExaminationStore();
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return (
    <div className="animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zurück
        </button>
      )}
      
      <h2 className="text-xl font-semibold mb-6">
        Wählen Sie eine Kategorie für Ihren Termin
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4">
          {error}
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category: ExaminationCategory) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="card hover:bg-muted/50 transition-colors text-left"
            >
              <div className="font-medium">{category.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategorySelection;