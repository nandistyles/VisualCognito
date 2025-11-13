import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateFlowchart, generateMindmap, generateCornellNotes } from "./openai";
import type { VisualizationType } from "@shared/schema";

// Import pdf-parse as CommonJS module
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get a specific document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Get visualizations for a document
  app.get("/api/visualizations/:documentId", async (req, res) => {
    try {
      const visualizations = await storage.getVisualizationsByDocument(req.params.documentId);
      res.json(visualizations);
    } catch (error) {
      console.error("Error fetching visualizations:", error);
      res.status(500).json({ error: "Failed to fetch visualizations" });
    }
  });

  // Upload and process PDF
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const type = req.body.type as VisualizationType;
      if (!type || !["flowchart", "mindmap", "cornell"].includes(type)) {
        return res.status(400).json({ error: "Invalid visualization type" });
      }

      // Create document record with case-insensitive extension removal
      const title = req.file.originalname.replace(/\.pdf$/i, "");
      const document = await storage.createDocument({
        title,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        status: "processing",
      });

      // Process PDF asynchronously with timeout
      setImmediate(async () => {
        const processingTimeout = setTimeout(async () => {
          console.error("Processing timeout exceeded for document:", document.id);
          try {
            await storage.updateDocument(document.id, {
              status: "failed",
              errorMessage: "Processing timeout - the document took too long to process",
            });
          } catch (err) {
            console.error("Error updating timeout status:", err);
          }
        }, 120000); // 2 minute timeout

        try {
          // Extract text from PDF
          const pdfData = await pdfParse(req.file!.buffer);
          const text = pdfData.text;

          // Validate text extraction
          if (!text || text.trim().length === 0) {
            throw new Error("PDF contains no extractable text. This might be a scanned document or image-based PDF.");
          }

          // Check if text is meaningful (not just gibberish or very short)
          const trimmedText = text.trim();
          const wordCount = trimmedText.split(/\s+/).length;
          
          if (wordCount < 10) {
            throw new Error("PDF text is too short or not meaningful. Please ensure the PDF contains readable text content.");
          }

          // Check for common indicators of scanned/image PDFs
          const nonPrintableRatio = (trimmedText.match(/[^\x20-\x7E\n\r\t]/g) || []).length / trimmedText.length;
          if (nonPrintableRatio > 0.3) {
            throw new Error("PDF appears to contain mostly non-text content. Please use a text-based PDF.");
          }

          // Update document with text content
          await storage.updateDocument(document.id, {
            textContent: text,
          });

          // Generate visualization based on type
          let visualizationData;
          try {
            switch (type) {
              case "flowchart":
                visualizationData = await generateFlowchart(text);
                break;
              case "mindmap":
                visualizationData = await generateMindmap(text);
                break;
              case "cornell":
                visualizationData = await generateCornellNotes(text);
                break;
            }
          } catch (aiError) {
            const errorMessage = aiError instanceof Error ? aiError.message : "Unknown AI error";
            throw new Error(`AI generation failed: ${errorMessage}`);
          }

          // Store visualization
          await storage.createVisualization({
            documentId: document.id,
            type,
            data: JSON.stringify(visualizationData),
          });

          // Update document status to completed
          await storage.updateDocument(document.id, {
            status: "completed",
          });

          clearTimeout(processingTimeout);
        } catch (error) {
          clearTimeout(processingTimeout);
          
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          console.error("Error processing document:", errorMessage, error);
          
          // Provide detailed error feedback
          try {
            await storage.updateDocument(document.id, {
              status: "failed",
              errorMessage,
            });
          } catch (updateError) {
            console.error("Error updating document status to failed:", updateError);
          }
        }
      });

      res.json(document);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocument(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
