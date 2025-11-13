import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import pdfParse from "pdf-parse";
import { storage } from "./storage";
import { generateFlowchart, generateMindmap, generateCornellNotes } from "./openai";
import type { VisualizationType } from "@shared/schema";

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

      // Process PDF asynchronously
      setImmediate(async () => {
        try {
          // Extract text from PDF
          const pdfData = await pdfParse(req.file!.buffer);
          const text = pdfData.text;

          if (!text || text.trim().length === 0) {
            throw new Error("PDF contains no extractable text");
          }

          // Update document with text content
          await storage.updateDocument(document.id, {
            textContent: text,
          });

          // Generate visualization based on type
          let visualizationData;
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
        } catch (error) {
          console.error("Error processing document:", error);
          // Ensure status is updated to failed on any error
          try {
            await storage.updateDocument(document.id, {
              status: "failed",
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
