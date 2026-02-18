import { useState, ReactNode } from 'react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Printer, Download, Send } from 'lucide-react';
import DateRangeFilter, { DateRange } from './DateRangeFilter';

interface ReportSection {
  id: string;
  label: string;
  component: ReactNode;
}

interface ReportLayoutProps {
  title: string;
  description?: string;
  sections: ReportSection[];
  children?: ReactNode;
}

const ReportLayout = ({ title, description, sections, children }: ReportLayoutProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  });
  const [selectedSections, setSelectedSections] = useState<string[]>(sections.map(s => s.id));
  const [isFullReportOpen, setIsFullReportOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('Funcionalidade de download PDF será implementada com integração backend');
  };

  const handleSendPDF = () => {
    // In a real app, this would send the PDF via email/WhatsApp
    alert('Funcionalidade de envio PDF será implementada com integração backend');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <Dialog open={isFullReportOpen} onOpenChange={setIsFullReportOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Ver Relatório Completo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Relatório Completo - {title}</DialogTitle>
              <DialogDescription>
                Selecione as seções que deseja incluir no relatório
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Section Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Seções do Relatório</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                      <label
                        htmlFor={section.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {section.label}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                  <Download className="h-4 w-4" />
                  Salvar PDF
                </Button>
                <Button variant="outline" onClick={handleSendPDF} className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar PDF
                </Button>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 space-y-4 print:border-0">
                {sections
                  .filter(section => selectedSections.includes(section.id))
                  .map(section => (
                    <div key={section.id} className="break-inside-avoid">
                      {section.component}
                    </div>
                  ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>

      {/* Report Sections */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default ReportLayout;
