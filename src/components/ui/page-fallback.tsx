import { AlertCircle, Construction, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PageFallbackProps {
  type: 'loading' | 'empty' | 'error' | 'construction';
  title?: string;
  description?: string;
  showBack?: boolean;
  onRetry?: () => void;
}

const PageFallback = ({ 
  type, 
  title, 
  description, 
  showBack = true,
  onRetry 
}: PageFallbackProps) => {
  const navigate = useNavigate();

  const configs = {
    loading: {
      icon: Loader2,
      iconClass: 'animate-spin text-primary',
      defaultTitle: 'Carregando...',
      defaultDescription: 'Aguarde enquanto preparamos os dados.',
      bgClass: 'bg-primary/5 border-primary/20',
    },
    empty: {
      icon: AlertCircle,
      iconClass: 'text-muted-foreground',
      defaultTitle: 'Nenhum dado encontrado',
      defaultDescription: 'Não há informações disponíveis para exibir no momento.',
      bgClass: 'bg-muted/50 border-muted',
    },
    error: {
      icon: AlertCircle,
      iconClass: 'text-destructive',
      defaultTitle: 'Erro ao carregar',
      defaultDescription: 'Ocorreu um erro ao buscar os dados. Tente novamente.',
      bgClass: 'bg-destructive/5 border-destructive/20',
    },
    construction: {
      icon: Construction,
      iconClass: 'text-warning',
      defaultTitle: 'Em construção',
      defaultDescription: 'Esta funcionalidade estará disponível em breve.',
      bgClass: 'bg-warning/5 border-warning/20',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgClass} border`}>
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
          <Icon className={`h-8 w-8 ${config.iconClass}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {description || config.defaultDescription}
        </p>
        <div className="flex items-center justify-center gap-3">
          {showBack && (
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageFallback;
