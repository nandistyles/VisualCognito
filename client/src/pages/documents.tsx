import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { Document } from "@shared/schema";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const filteredDocuments = documents?.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Documents</h1>
          <p className="text-muted-foreground">
            Browse and manage your uploaded documents
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => (
              <Link key={doc.id} href={`/document/${doc.id}`}>
                <Card className="hover-elevate active-elevate-2 transition-transform hover:scale-[1.02]" data-testid={`card-document-${doc.id}`}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-t-lg">
                      <FileText className="w-16 h-16 text-primary" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <Badge
                        variant={doc.status === "completed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <FileText className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search query"
                : "Upload your first PDF from the dashboard to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
