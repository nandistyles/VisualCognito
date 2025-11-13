import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import type { MindmapNode } from "@shared/schema";

interface MindmapViewerProps {
  data: MindmapNode;
}

export default function MindmapViewer({ data }: MindmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<MindmapNode>().size([height - 100, width - 200]);
    treeLayout(root);

    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<any, any>()
        .x((d) => d.y + 100)
        .y((d) => d.x + 50))
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    const node = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y! + 100},${d.x! + 50})`);

    node
      .append("circle")
      .attr("r", 8)
      .attr("fill", "hsl(var(--primary))")
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 2);

    node
      .append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .text((d) => d.data.label)
      .attr("fill", "hsl(var(--foreground))")
      .attr("font-size", "14px")
      .attr("font-weight", 500);

    svg.call(zoom.transform as any, d3.zoomIdentity.translate(50, 50));
  }, [data]);

  const handleExport = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "mindmap.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="relative" data-testid="mindmap-viewer">
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
      <div ref={containerRef} className="overflow-hidden" data-testid="mindmap-canvas">
        <svg ref={svgRef}></svg>
      </div>
    </Card>
  );
}