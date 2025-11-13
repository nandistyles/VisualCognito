import OpenAI from "openai";
import type { FlowchartData, MindmapNode, CornellNote } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateFlowchart(text: string): Promise<FlowchartData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing text and creating flowcharts. Create a flowchart from the given text that visualizes processes, decision points, and workflows. 

Return JSON in this exact format:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "default",
      "position": { "x": number, "y": number },
      "data": { "label": "text", "description": "optional details" }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "optional label"
    }
  ]
}

Create meaningful node positions (x: 0-800, y: 0-600) that create a clean flow from top to bottom or left to right.`,
        },
        {
          role: "user",
          content: `Analyze this text and create a flowchart:\n\n${text.slice(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const data = JSON.parse(content);
    
    // Validate the structure
    if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
      throw new Error("Invalid flowchart structure returned");
    }

    return data;
  } catch (error) {
    console.error("Error generating flowchart:", error);
    throw new Error(`Failed to generate flowchart: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateMindmap(text: string): Promise<MindmapNode> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing text and creating mindmaps. Create a hierarchical mindmap from the given text that shows key concepts and their relationships.

Return JSON in this exact format:
{
  "id": "root",
  "label": "Main Topic",
  "children": [
    {
      "id": "child-1",
      "label": "Subtopic",
      "children": [...]
    }
  ]
}

Create a balanced tree structure with 2-4 levels of depth.`,
        },
        {
          role: "user",
          content: `Analyze this text and create a mindmap:\n\n${text.slice(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const data = JSON.parse(content);
    
    // Validate the structure
    if (!data.id || !data.label) {
      throw new Error("Invalid mindmap structure returned");
    }

    return data;
  } catch (error) {
    console.error("Error generating mindmap:", error);
    throw new Error(`Failed to generate mindmap: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateCornellNotes(text: string): Promise<CornellNote> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating Cornell Notes from text. Analyze the text and create structured notes using the Cornell method.

Return JSON in this exact format:
{
  "cues": "Key questions and prompts (one per line)",
  "notes": "Detailed notes and main ideas",
  "summary": "Concise summary of the entire content"
}

Make the cues column contain questions that help recall the notes. The notes section should be comprehensive but organized. The summary should synthesize the key takeaways.`,
        },
        {
          role: "user",
          content: `Create Cornell notes from this text:\n\n${text.slice(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const data = JSON.parse(content);
    
    // Validate the structure
    if (!data.cues || !data.notes || !data.summary) {
      throw new Error("Invalid Cornell notes structure returned");
    }

    return data;
  } catch (error) {
    console.error("Error generating Cornell notes:", error);
    throw new Error(`Failed to generate Cornell notes: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
