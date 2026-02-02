import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ChartPie, BarChart3, LineChartIcon, ChevronDown } from 'lucide-react';

export type ChartType = 'pie' | 'bar' | 'line';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface ReportChartProps {
  title: string;
  data: ChartData[];
  defaultType?: ChartType;
  height?: number;
  className?: string;
}

// BJJ color palette - always use at least 2+ colors (never mono)
const BJJ_COLORS = [
  'hsl(217, 91%, 55%)',   // Azul
  'hsl(271, 76%, 60%)',   // Roxo
  'hsl(30, 59%, 45%)',    // Marrom
  'hsl(0, 0%, 95%)',      // Branco (with dark text fallback)
  'hsl(142, 76%, 42%)',   // Success green
  'hsl(38, 92%, 55%)',    // Warning yellow
];

const chartTypeIcons = {
  pie: ChartPie,
  bar: BarChart3,
  line: LineChartIcon,
};

const chartTypeLabels = {
  pie: 'Pizza',
  bar: 'Barras',
  line: 'Linhas',
};

const ReportChart = ({ title, data, defaultType = 'bar', height = 300, className = '' }: ReportChartProps) => {
  const [chartType, setChartType] = useState<ChartType>(defaultType);

  // Ensure we use at least 2 colors (never mono)
  const getColor = (index: number, entry?: ChartData) => {
    if (entry?.color) return entry.color;
    return BJJ_COLORS[index % BJJ_COLORS.length];
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index, entry)} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
              />
              <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index, entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Valor"
                stroke="hsl(217, 91%, 55%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(271, 76%, 60%)', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: 'hsl(30, 59%, 45%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const Icon = chartTypeIcons[chartType];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Icon className="h-4 w-4" />
              {chartTypeLabels[chartType]}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(chartTypeLabels) as ChartType[]).map((type) => {
              const TypeIcon = chartTypeIcons[type];
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setChartType(type)}
                  className="gap-2"
                >
                  <TypeIcon className="h-4 w-4" />
                  {chartTypeLabels[type]}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ReportChart;
