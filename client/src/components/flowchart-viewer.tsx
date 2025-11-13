import { useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import type { FlowchartData } from "@shared/schema";

interface FlowchartViewerProps {
  data: FlowchartData;
}

export default function FlowchartViewer({ data }: FlowchartViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges as Edge[]);

  const handleExport = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = 'flowchart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  return (
    <Card className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleExport}
          size="sm"
          variant="secondary"
          data-testid="button-export"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
      <div style={{ height: "600px" }} data-testid="flowchart-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </Card>
  );
}
