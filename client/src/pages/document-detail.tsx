import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, FileText, GitBranch, Network, BookOpen } from "lucide-react";
import type { Document, Visualization } from "@shared/schema";
import FlowchartViewer from "@/components/flowchart-viewer";
import MindmapViewer from "@/components/mindmap-viewer";
import CornellViewer from "@/components/cornell-viewer";

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: document, isLoading: isLoadingDoc } = useQuery<Document>({
    queryKey: [`/api/documents/${id}`],
    refetchInterval: (query) => 
      query.state.data && query.state.data.status === "processing" ? 2000 : false,
  });

  const { data: visualizations, isLoading: isLoadingViz, refetch: refetchVisualizations } = useQuery<Visualization[]>({
    queryKey: [`/api/visualizations/${id}`],
    enabled: !!document && document.status !== "failed",
    refetchInterval: (query) => {
      // Only poll if document is processing and we don't have visualization data yet
      const shouldPoll = document?.status === "processing" && 
                        (!query.state.data || query.state.data.length === 0) && 
                        query.state.status === 'success';
      return shouldPoll ? 2000 : false;
    },
  });

  // Trigger a manual refetch when document transitions to completed
  const prevDocumentStatus = useRef(document?.status);
  useEffect(() => {
    if (prevDocumentStatus.current === "processing" && document?.status === "completed") {
      refetchVisualizations();
    }
    prevDocumentStatus.current = document?.status;
  }, [document?.status, refetchVisualizations]);

  if (isLoadingDoc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Document not found</h2>
          <p className="text-muted-foreground mb-6">
            The document you're looking for doesn't exist
          </p>
          <Link href="/documents">
            <Button data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const flowchart = visualizations?.find((v) => v.type === "flowchart");
  const mindmap = visualizations?.find((v) => v.type === "mindmap");
  const cornell = visualizations?.find((v) => v.type === "cornell");

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <Link href="/documents">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                <Badge variant={document.status === "completed" ? "default" : "secondary"}>
                  {document.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {document.status === "failed" ? (
          <Card data-testid="error-card">
            <CardContent className="py-24 text-center">
              <FileText className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Processing Failed</h3>
              <p className="text-muted-foreground mb-4">
                {document.errorMessage || "There was an error processing your document. Please try uploading it again."}
              </p>
              {document.errorMessage && document.errorMessage.includes("scanned") && (
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  <strong>Tip:</strong> If your PDF is a scanned document or contains images, try using a text-based PDF or convert it to text first.
                </p>
              )}
              {!document.errorMessage?.includes("scanned") && (
                <p className="text-sm text-muted-foreground mb-6">
                  Please try uploading your document again.
                </p>
              )}
              <Link href="/">
                <Button data-testid="button-try-again">
                  Upload New Document
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : isLoadingViz ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
        ) : visualizations && visualizations.length > 0 ? (
          <Tabs defaultValue={visualizations[0].type} className="w-full" data-testid="visualizations-tabs">
            <TabsList data-testid="tabs-list">
              {flowchart && (
                <TabsTrigger value="flowchart" data-testid="tab-flowchart">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Flowchart
                </TabsTrigger>
              )}
              {mindmap && (
                <TabsTrigger value="mindmap" data-testid="tab-mindmap">
                  <Network className="w-4 h-4 mr-2" />
                  Mindmap
                </TabsTrigger>
              )}
              {cornell && (
                <TabsTrigger value="cornell" data-testid="tab-cornell">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Cornell Notes
                </TabsTrigger>
              )}
            </TabsList>

            {flowchart && (
              <TabsContent value="flowchart" className="mt-6">
                <FlowchartViewer data={JSON.parse(flowchart.data)} />
              </TabsContent>
            )}

            {mindmap && (
              <TabsContent value="mindmap" className="mt-6">
                <MindmapViewer data={JSON.parse(mindmap.data)} />
              </TabsContent>
            )}

            {cornell && (
              <TabsContent value="cornell" className="mt-6">
                <CornellViewer data={JSON.parse(cornell.data)} />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-24 text-center">
              <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">Processing Document</h3>
              <p className="text-muted-foreground">
                Your document is being analyzed. This may take a few moments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
