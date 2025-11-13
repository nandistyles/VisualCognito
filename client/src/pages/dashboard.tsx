import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Brain, Download, Loader2, GitBranch, Network, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Document, VisualizationType } from "@shared/schema";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<VisualizationType>("flowchart");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: documents, isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; type: VisualizationType }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("type", data.type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedFile(null);
      toast({
        title: "Upload successful",
        description: "Your document is being processed.",
      });

      // Poll for updates every 2 seconds
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/documents/${data.id}`);
          if (!response.ok) throw new Error("Failed to fetch document");
          const doc: Document = await response.json();
          
          if (doc && (doc.status === "completed" || doc.status === "failed")) {
            clearInterval(pollInterval);
            
            // Invalidate all related queries and wait
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["/api/documents"] }),
              queryClient.invalidateQueries({ queryKey: [`/api/documents/${data.id}`] }),
              queryClient.invalidateQueries({ queryKey: [`/api/visualizations/${data.id}`] }),
            ]);
            
            if (doc.status === "completed") {
              toast({
                title: "Processing complete",
                description: "Your visualization is ready!",
              });
              // Navigate to document detail page after invalidation
              setTimeout(() => setLocation(`/document/${data.id}`), 100);
            } else {
              toast({
                title: "Processing failed",
                description: "There was an error processing your document. Please try again.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error polling document:", error);
        }
      }, 2000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    uploadMutation.mutate({ file: selectedFile, type: selectedType });
  };

  const recentDocuments = documents?.slice(0, 3) || [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI PDF Visualizer</h1>
          <p className="text-muted-foreground">
            Transform your PDFs into flowcharts, mindmaps, and Cornell notes using AI
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a PDF to generate AI-powered visualizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={`min-h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                data-testid="upload-zone"
              >
                <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {selectedFile ? selectedFile.name : "Drop your PDF here"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                  data-testid="input-file"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  data-testid="button-browse"
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported format: PDF
                </p>
              </div>

              {selectedFile && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Visualization Type
                    </label>
                    <Tabs
                      value={selectedType}
                      onValueChange={(v) => setSelectedType(v as VisualizationType)}
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="flowchart" data-testid="tab-flowchart">
                          <GitBranch className="w-4 h-4 mr-2" />
                          Flowchart
                        </TabsTrigger>
                        <TabsTrigger value="mindmap" data-testid="tab-mindmap">
                          <Network className="w-4 h-4 mr-2" />
                          Mindmap
                        </TabsTrigger>
                        <TabsTrigger value="cornell" data-testid="tab-cornell">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Cornell
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={uploadMutation.isPending}
                    className="w-full h-14"
                    data-testid="button-generate"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Generate Visualization
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Your recently uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : recentDocuments.length > 0 ? (
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <Link key={doc.id} href={`/document/${doc.id}`}>
                      <div className="flex items-start gap-4 p-4 rounded-lg border hover-elevate active-elevate-2 transition-transform" data-testid={`card-document-${doc.id}`}>
                        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base line-clamp-1 mb-1">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {(doc.fileSize / 1024).toFixed(1)} KB •{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                          <Badge
                            variant={doc.status === "completed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/documents">
                    <Button variant="outline" className="w-full" data-testid="button-view-all">
                      View All Documents
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-1">No documents yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your first PDF to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <GitBranch className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-xl">Flowcharts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize processes, decision trees, and workflows from your documents
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Network className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-xl">Mindmaps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create hierarchical concept maps and idea networks from text
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-xl">Cornell Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate structured study notes with cues, notes, and summaries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
