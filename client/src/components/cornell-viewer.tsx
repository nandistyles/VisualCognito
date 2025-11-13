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
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginTop = 20;
    const marginBottom = 25;
    const marginLeft = 20;
    const marginRight = 20;
    const lineHeight = 7;
    const sectionSpacing = 10;
    let yPos = marginTop;
    let pageNumber = 1;
    
    const addPageNumber = () => {
      doc.setFontSize(9);
      doc.setTextColor(128);
      doc.text(`Page ${pageNumber}`, pageWidth - marginRight - 10, pageHeight - 10);
      doc.setTextColor(0);
      pageNumber++;
    };
    
    const checkPageBreak = (additionalSpace = 0) => {
      if (yPos + additionalSpace > pageHeight - marginBottom) {
        addPageNumber();
        doc.addPage();
        yPos = marginTop;
        return true;
      }
      return false;
    };
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Cornell Notes", marginLeft, yPos);
    yPos += 15;
    
    // Add a horizontal line
    doc.setLineWidth(0.5);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 10;
    
    // Cues section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    checkPageBreak(lineHeight * 2);
    doc.text("Cues & Questions", marginLeft, yPos);
    yPos += lineHeight + 2;
    
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    const cuesWidth = 60;
    const cuesLines = doc.splitTextToSize(data.cues, cuesWidth);
    
    for (let i = 0; i < cuesLines.length; i++) {
      checkPageBreak(lineHeight);
      doc.text(cuesLines[i], marginLeft, yPos);
      yPos += lineHeight;
    }
    
    yPos += sectionSpacing;
    
    // Notes section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    checkPageBreak(lineHeight * 2);
    doc.text("Main Notes", marginLeft, yPos);
    yPos += lineHeight + 2;
    
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    const notesWidth = pageWidth - marginLeft - marginRight;
    const notesLines = doc.splitTextToSize(data.notes, notesWidth);
    
    for (let i = 0; i < notesLines.length; i++) {
      checkPageBreak(lineHeight);
      doc.text(notesLines[i], marginLeft, yPos);
      yPos += lineHeight;
    }
    
    yPos += sectionSpacing;
    
    // Summary section with visual separation
    checkPageBreak(lineHeight * 3);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 8;
    
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Summary", marginLeft, yPos);
    yPos += lineHeight + 2;
    
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    const summaryWidth = pageWidth - marginLeft - marginRight;
    const summaryLines = doc.splitTextToSize(data.summary, summaryWidth);
    
    for (let i = 0; i < summaryLines.length; i++) {
      checkPageBreak(lineHeight);
      doc.text(summaryLines[i], marginLeft, yPos);
      yPos += lineHeight;
    }
    
    // Add page number to last page
    addPageNumber();
    
    doc.save("cornell-notes.pdf");
  };

  return (
    <Card data-testid="cornell-viewer">
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
