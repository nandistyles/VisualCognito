import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import type { CornellNote } from "@shared/schema";

interface CornellViewerProps {
  data: CornellNote;
}

export default function CornellViewer({ data }: CornellViewerProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const marginTop = 20;
    const marginBottom = 20;
    const lineHeight = 7;
    let yPos = marginTop;
    
    // Title
    doc.setFontSize(16);
    doc.text("Cornell Notes", 20, yPos);
    yPos += 15;
    
    // Cues section
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Cues:", 20, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, "normal");
    const cuesLines = doc.splitTextToSize(data.cues, 60);
    for (let i = 0; i < cuesLines.length; i++) {
      if (yPos > pageHeight - marginBottom) {
        doc.addPage();
        yPos = marginTop;
      }
      doc.text(cuesLines[i], 20, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Notes section
    doc.setFont(undefined, "bold");
    if (yPos > pageHeight - marginBottom) {
      doc.addPage();
      yPos = marginTop;
    }
    doc.text("Notes:", 20, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, "normal");
    const notesLines = doc.splitTextToSize(data.notes, 170);
    for (let i = 0; i < notesLines.length; i++) {
      if (yPos > pageHeight - marginBottom) {
        doc.addPage();
        yPos = marginTop;
      }
      doc.text(notesLines[i], 20, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Summary section
    doc.setFont(undefined, "bold");
    if (yPos > pageHeight - marginBottom) {
      doc.addPage();
      yPos = marginTop;
    }
    doc.text("Summary:", 20, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, "normal");
    const summaryLines = doc.splitTextToSize(data.summary, 170);
    for (let i = 0; i < summaryLines.length; i++) {
      if (yPos > pageHeight - marginBottom) {
        doc.addPage();
        yPos = marginTop;
      }
      doc.text(summaryLines[i], 20, yPos);
      yPos += lineHeight;
    }
    
    doc.save("cornell-notes.pdf");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cornell Notes</CardTitle>
        <Button
          onClick={handleExport}
          size="sm"
          variant="secondary"
          data-testid="button-export"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-6 min-h-96" data-testid="cornell-notes">
          <div className="col-span-12 md:col-span-3 space-y-2">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Cues
              </h3>
              <div className="text-sm whitespace-pre-wrap">{data.cues}</div>
            </div>
          </div>
          
          <Separator orientation="vertical" className="hidden md:block" />
          
          <div className="col-span-12 md:col-span-8 space-y-2">
            <div className="border-l-4 border-primary/60 pl-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Notes
              </h3>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{data.notes}</div>
            </div>
          </div>

          <div className="col-span-12 pt-6 border-t">
            <div className="border-l-4 border-primary/40 pl-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Summary
              </h3>
              <div className="text-sm whitespace-pre-wrap">{data.summary}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
