import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2, GripVertical } from 'lucide-react';
import { useAuth } from '@/contexts/DevAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardItem {
  id: string;
  label: string;
  type: 'card' | 'chart';
  component: ReactNode;
  defaultVisible?: boolean;
}

interface ConfigurableDashboardProps {
  items: DashboardItem[];
  title: string;
  description?: string;
}

interface DashboardConfig {
  visibleItems: string[];
  order: string[];
}

const ConfigurableDashboard = ({ items, title, description }: ConfigurableDashboardProps) => {
  const { profile } = useAuth();
  const [config, setConfig] = useState<DashboardConfig>({
    visibleItems: items.filter(i => i.defaultVisible !== false).map(i => i.id),
    order: items.map(i => i.id),
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Load saved config
  useEffect(() => {
    const loadConfig = async () => {
      if (!profile?.id) return;

      const { data } = await supabase
        .from('dashboard_configs')
        .select('cards, charts, layout')
        .eq('profile_id', profile.id)
        .single();

      if (data?.layout) {
        const savedConfig = data.layout as unknown as DashboardConfig;
        if (savedConfig.visibleItems && savedConfig.order) {
          setConfig(savedConfig);
        }
      }
    };

    loadConfig();
  }, [profile?.id]);

  // Save config
  const saveConfig = async (newConfig: DashboardConfig) => {
    if (!profile?.id) return;

    // Check if config exists
    const { data: existing } = await supabase
      .from('dashboard_configs')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    const layoutJson = JSON.parse(JSON.stringify(newConfig));

    if (existing) {
      await supabase
        .from('dashboard_configs')
        .update({
          layout: layoutJson,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', profile.id);
    } else {
      await supabase
        .from('dashboard_configs')
        .insert([{
          profile_id: profile.id,
          layout: layoutJson,
        }]);
    }
  };

  const toggleItem = (itemId: string) => {
    const newConfig = {
      ...config,
      visibleItems: config.visibleItems.includes(itemId)
        ? config.visibleItems.filter(id => id !== itemId)
        : [...config.visibleItems, itemId],
    };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const newOrder = [...config.order];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    const newConfig = { ...config, order: newOrder };
    setConfig(newConfig);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    saveConfig(config);
  };

  const orderedItems = config.order
    .map(id => items.find(item => item.id === id))
    .filter((item): item is DashboardItem => item !== undefined);

  const visibleCards = orderedItems.filter(
    item => item.type === 'card' && config.visibleItems.includes(item.id)
  );

  const visibleCharts = orderedItems.filter(
    item => item.type === 'chart' && config.visibleItems.includes(item.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Dashboard</DialogTitle>
              <DialogDescription>
                Escolha quais cards e gráficos deseja visualizar. Arraste para reordenar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {orderedItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all ${
                    draggedItem === item.id ? 'opacity-50 border-primary' : ''
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Checkbox
                    id={item.id}
                    checked={config.visibleItems.includes(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <label
                    htmlFor={item.id}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {item.label}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({item.type === 'card' ? 'Card' : 'Gráfico'})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      {visibleCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleCards.map(item => (
            <div key={item.id}>{item.component}</div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      {visibleCharts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleCharts.map(item => (
            <div key={item.id}>{item.component}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfigurableDashboard;
