import { type Document, type InsertDocument, type Visualization, type InsertVisualization } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Visualization operations
  getVisualization(id: string): Promise<Visualization | undefined>;
  getVisualizationsByDocument(documentId: string): Promise<Visualization[]>;
  createVisualization(viz: InsertVisualization): Promise<Visualization>;
  deleteVisualizationsByDocument(documentId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private visualizations: Map<string, Visualization>;

  constructor() {
    this.documents = new Map();
    this.visualizations = new Map();
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const doc: Document = {
      ...insertDoc,
      id,
      uploadedAt: new Date(),
      textContent: null,
    };
    this.documents.set(id, doc);
    return doc;
  }

  async updateDocument(
    id: string,
    updates: Partial<Omit<Document, "id" | "uploadedAt">>
  ): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updated = {
      ...document,
      ...updates,
      // Ensure errorMessage is cleared when status is not failed
      ...(updates.status === "completed" ? { errorMessage: undefined } : {})
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    await this.deleteVisualizationsByDocument(id);
    return this.documents.delete(id);
  }

  async getVisualization(id: string): Promise<Visualization | undefined> {
    return this.visualizations.get(id);
  }

  async getVisualizationsByDocument(documentId: string): Promise<Visualization[]> {
    return Array.from(this.visualizations.values()).filter(
      (viz) => viz.documentId === documentId
    );
  }

  async createVisualization(insertViz: InsertVisualization): Promise<Visualization> {
    const id = randomUUID();
    const viz: Visualization = {
      ...insertViz,
      id,
      createdAt: new Date(),
    };
    this.visualizations.set(id, viz);
    return viz;
  }

  async deleteVisualizationsByDocument(documentId: string): Promise<boolean> {
    const vizs = await this.getVisualizationsByDocument(documentId);
    vizs.forEach((viz) => this.visualizations.delete(viz.id));
    return true;
  }
}

export const storage = new MemStorage();