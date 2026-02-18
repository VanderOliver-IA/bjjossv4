import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type DateRange = {
  from: Date;
  to: Date;
};

export type PeriodOption = 'today' | 'yesterday' | '7days' | '15days' | '30days' | 'custom';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const periodOptions: { value: PeriodOption; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '15days', label: 'Últimos 15 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
];

const getDateRangeForPeriod = (period: PeriodOption): DateRange => {
  const today = new Date();
  
  switch (period) {
    case 'today':
      return { from: startOfDay(today), to: endOfDay(today) };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case '7days':
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case '15days':
      return { from: startOfDay(subDays(today, 14)), to: endOfDay(today) };
    case '30days':
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) };
    default:
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) };
  }
};

const DateRangeFilter = ({ value, onChange, className }: DateRangeFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('30days');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePeriodChange = (period: PeriodOption) => {
    setSelectedPeriod(period);
    
    if (period !== 'custom') {
      const range = getDateRangeForPeriod(period);
      onChange(range);
    } else {
      setIsCalendarOpen(true);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!value.from || (value.from && value.to)) {
      onChange({ from: startOfDay(date), to: endOfDay(date) });
    } else {
      const newRange = date < value.from
        ? { from: startOfDay(date), to: endOfDay(value.from) }
        : { from: value.from, to: endOfDay(date) };
      onChange(newRange);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2 items-center', className)}>
      <Select value={selectedPeriod} onValueChange={(v) => handlePeriodChange(v as PeriodOption)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPeriod === 'custom' && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                    {format(value.to, 'dd/MM/yyyy', { locale: ptBR })}
                  </>
                ) : (
                  format(value.from, 'dd/MM/yyyy', { locale: ptBR })
                )
              ) : (
                <span>Selecione as datas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value?.to || value?.from}
              onSelect={handleDateSelect}
              initialFocus
              locale={ptBR}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}

      <div className="text-sm text-muted-foreground">
        {format(value.from, "dd 'de' MMMM", { locale: ptBR })} - {format(value.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </div>
    </div>
  );
};

export default DateRangeFilter;
export { getDateRangeForPeriod };
