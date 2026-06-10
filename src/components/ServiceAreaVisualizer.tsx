import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Worker } from "../types";
import { Compass, Sparkles, MapPin, Zap } from "lucide-react";
import { translations } from "../lib/translations";

interface ServiceAreaVisualizerProps {
  worker: Worker;
  language?: "eng" | "swa" | "sheng";
}

interface RegionalHub {
  name: string;
  lat: number;
  lng: number;
  isBase?: boolean;
}

export const ServiceAreaVisualizer: React.FC<ServiceAreaVisualizerProps> = ({ worker, language = "eng" }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);
  const [dispatchTime, setDispatchTime] = useState<string>("15-25 min");

  // Well-distributed prominent Nairobi regional mesh hubs
  const allHubs: RegionalHub[] = [
    { name: "Kibera Sector", lat: -1.3130, lng: 36.7880 },
    { name: "Kangemi Central", lat: -1.2662, lng: 36.7450 },
    { name: "Githurai Node", lat: -1.2083, lng: 36.9128 },
    { name: "Kayole Grid", lat: -1.2818, lng: 36.9042 },
    { name: "Nairobi CBD", lat: -1.2825, lng: 36.8222 },
    { name: "Westlands Hub", lat: -1.2618, lng: 36.8042 },
    { name: "Kasarani Link", lat: -1.2201, lng: 36.8961 },
    { name: "Rongai Sector", lat: -1.3967, lng: 36.7423 }
  ];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Remove any previous elements for clean rendering
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get responsive container metrics
    const width = containerRef.current.clientWidth || 240;
    const height = 180;
    const padding = 20;

    // Establish scale range - dynamically centered on worker coordinates
    const workerLat = worker.coordinates.lat;
    const workerLng = worker.coordinates.lng;

    // Filter hubs to determine those within operating reach
    // We assume the worker's operational area contains their base + nearest hubs
    const nearbyHubs = allHubs.map(h => {
      // rough distance calculation in degrees
      const dist = Math.sqrt(Math.pow(h.lat - workerLat, 2) + Math.pow(h.lng - workerLng, 2));
      return { ...h, dist };
    }).sort((a, b) => a.dist - b.dist);

    // The closest 4-5 hubs define their coverage area polygon
    const coverageHubs = nearbyHubs.slice(0, 5);

    // Dynamic dispatch time estimate based on overall coverage radius
    const maxDist = Math.max(...coverageHubs.map(h => h.dist));
    const coverageRadiusKm = Math.round(maxDist * 111); // rough degree to km conversion
    const estimatedMinTime = Math.max(10, Math.round(coverageRadiusKm * 1.5 + 5));
    const estimatedMaxTime = Math.round(estimatedMinTime * 1.6);
    setDispatchTime(`${estimatedMinTime}-${estimatedMaxTime} mins (${coverageRadiusKm}km operational outreach)`);

    // Latitudes decrease upwards, so invert the Y scale
    const lats = allHubs.map(h => h.lat).concat([workerLat]);
    const lngs = allHubs.map(h => h.lng).concat([workerLng]);

    const minLat = d3.min(lats) || -1.4;
    const maxLat = d3.max(lats) || -1.2;
    const minLng = d3.min(lngs) || 36.7;
    const maxLng = d3.max(lngs) || 36.95;

    const xScale = d3.scaleLinear()
      .domain([minLng - 0.02, maxLng + 0.02])
      .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
      .domain([minLat - 0.02, maxLat + 0.02])
      .range([height - padding, padding]); // Invert latitude representation

    // Draw background radar scanner pattern
    const centerX = xScale(workerLng);
    const centerY = yScale(workerLat);

    // Add glowing background styling patterns
    const defs = svg.append("defs");
    
    // Cyberpunk gold glow
    const glowFilter = defs.append("filter")
      .attr("id", "radar-glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", 4)
      .attr("result", "blur");

    glowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Grid pattern
    const pattern = defs.append("pattern")
      .attr("id", "map-grid")
      .attr("width", 15)
      .attr("height", 15)
      .attr("patternUnits", "userSpaceOnUse");

    pattern.append("path")
      .attr("d", "M 15 0 L 0 0 0 15")
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 180, 0, 0.04)")
      .attr("stroke-width", 0.5);

    // Base background grid
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#map-grid)")
      .attr("rx", 10);

    // Compass circle concentric rings representing telemetry distance markers
    const radarGroup = svg.append("g").attr("class", "radar-grid").style("opacity", 0.4);
    [30, 60, 90, 120].forEach(r => {
      radarGroup.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 180, 0, 0.15)")
        .attr("stroke-width", r === 120 ? 1 : 0.5)
        .attr("stroke-dasharray", r === 120 ? "3,3" : "none");
    });

    // Radar diagonal helper axis ticks
    radarGroup.append("line")
      .attr("x1", centerX - 120)
      .attr("y1", centerY)
      .attr("x2", centerX + 120)
      .attr("y2", centerY)
      .attr("stroke", "rgba(255, 180, 0, 0.1)")
      .attr("stroke-width", 0.5);

    radarGroup.append("line")
      .attr("x1", centerX)
      .attr("y1", centerY - 120)
      .attr("x2", centerX)
      .attr("y2", centerY + 120)
      .attr("stroke", "rgba(255, 180, 0, 0.1)")
      .attr("stroke-width", 0.5);

    // Calculate Hull / Coverage Polygon using d3.polygonHull or cardonalClosed path builder
    // Let's create an ordered polygon to avoid messy intersecting lines
    // We can sort them by the angle relative to the center of the worker
    const sortedCoveragePoints = coverageHubs
      .map(h => ({
        ...h,
        angle: Math.atan2(yScale(h.lat) - centerY, xScale(h.lng) - centerX),
        x: xScale(h.lng),
        y: yScale(h.lat)
      }))
      .sort((a, b) => a.angle - b.angle);

    // Add worker base node point itself in coverage boundary definition to assure inclusion
    const workerPoint = {
      name: worker.locationName,
      lat: workerLat,
      lng: workerLng,
      angle: 0,
      x: centerX,
      y: centerY
    };

    // Draw the translucent glowing service range area
    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCardinalClosed.tension(0.4));

    svg.append("path")
      .datum(sortedCoveragePoints)
      .attr("d", lineGenerator)
      .attr("fill", "rgba(255, 180, 0, 0.08)")
      .attr("stroke", "rgba(255, 180, 0, 0.35)")
      .attr("stroke-width", 1.5)
      .style("filter", "url(#radar-glow)")
      .style("stroke-dasharray", "none");

    // Dynamic sweeping radar visual sweep to give that high-tech radar scan aesthetic
    const sweep = svg.append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", centerX + 120)
      .attr("y2", centerY)
      .attr("stroke", "rgba(255, 180, 0, 0.15)")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round");

    let angle = 0;
    const interval = setInterval(() => {
      angle += 1.5;
      const radians = (angle * Math.PI) / 180;
      sweep
        .attr("x2", centerX + Math.cos(radians) * 120)
        .attr("y2", centerY + Math.sin(radians) * 120);
    }, 30);

    // Draw background landmark nodes
    allHubs.forEach(hub => {
      const hX = xScale(hub.lng);
      const hY = yScale(hub.lat);
      const isServiced = coverageHubs.some(ch => ch.name === hub.name);

      const nodeGroup = svg.append("g")
        .attr("class", `hub-node-${hub.name.replace(/\s+/g, "")}`)
        .style("cursor", "pointer")
        .on("mouseover", () => setHoveredHub(hub.name))
        .on("mouseout", () => setHoveredHub(null));

      // Visual indicator for non-serviced vs serviced background nodes
      nodeGroup.append("circle")
        .attr("cx", hX)
        .attr("cy", hY)
        .attr("r", isServiced ? 3.5 : 2.5)
        .attr("fill", isServiced ? "rgba(255, 180, 0, 0.8)" : "rgba(113, 113, 122, 0.4)")
        .attr("stroke", isServiced ? "rgba(255, 180, 0, 0.4)" : "none")
        .attr("stroke-width", 2);

      // Node labels for serviced landmarks
      if (isServiced) {
        nodeGroup.append("text")
          .attr("x", hX + 6)
          .attr("y", hY + 3)
          .text(hub.name.split(" ")[0]) // first word only for micro clarity
          .attr("font-family", "JetBrains Mono, monospace")
          .attr("font-size", "7.5px")
          .attr("font-weight", "500")
          .attr("fill", "rgba(255, 180, 0, 0.7)")
          .style("pointer-events", "none");
      }
    });

    // PULSING WORKER BASE CENTRE INDICATOR
    const workerG = svg.append("g")
      .on("mouseover", () => setHoveredHub(`Base Hub (Self): ${worker.locationName}`))
      .on("mouseout", () => setHoveredHub(null));

    // Outer ping pulse
    const basePulse = workerG.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 5)
      .attr("fill", "none")
      .attr("stroke", "#FFB400")
      .attr("stroke-width", 1.5)
      .style("filter", "url(#radar-glow)");

    function animatePulse() {
      basePulse
        .attr("r", 5)
        .style("opacity", 1)
        .transition()
        .duration(1500)
        .attr("r", 15)
        .style("opacity", 0)
        .on("end", animatePulse);
    }
    animatePulse();

    // Solid inner core
    workerG.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 4)
      .attr("fill", "#FFB400")
      .attr("stroke", "#0f1122")
      .attr("stroke-width", 1);

    // Little home antenna flag pointer
    workerG.append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", centerX)
      .attr("y2", centerY - 8)
      .attr("stroke", "#FFB400")
      .attr("stroke-width", 1);

    workerG.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY - 8)
      .attr("r", 1.5)
      .attr("fill", "#FFB400");

    return () => {
      clearInterval(interval);
    };
  }, [worker]);

  return (
    <div className="bg-zinc-950/85 border border-white/[0.05] rounded-xl p-3 space-y-2 select-none">
      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-cyber-gold animate-spin-slow" />
          <span>{translations[language].radar_title}</span>
        </div>
        <div className="flex items-center gap-1 bg-cyber-gold/5 px-2 py-0.5 rounded border border-cyber-gold/20 text-cyber-gold font-bold">
          <Zap className="w-2.5 h-2.5 animate-pulse" />
          <span>{translations[language].radar_subtitle}</span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[180px] bg-zinc-950 rounded-lg overflow-hidden border border-cyber-gold/10">
        <svg ref={svgRef} className="w-full h-full block" />
        
        {/* Dynamic Telemetry HUD overlay */}
        <div className="absolute top-2 left-2 pointer-events-none flex flex-col font-mono text-[8px] space-y-0.5">
          <div className="flex items-center gap-1 text-cyber-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-gold animate-ping" />
            <span>ORIGIN: {worker.locationName.split(",")[0].toUpperCase()}</span>
          </div>
          <span className="text-zinc-500 text-[7px]">RANGE LIMIT: 10 KM CLUSTER</span>
        </div>

        {hoveredHub ? (
          <div className="absolute bottom-2 left-2 right-2 bg-zinc-900/90 border border-cyber-gold/30 p-1.5 rounded text-[8.5px] font-mono text-white flex justify-between items-center transition-all animate-fadeIn">
            <span className="text-cyber-gold">● {hoveredHub}</span>
            <span className="text-zinc-400 capitalize">Active Area</span>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/70 border border-white/[0.04] p-1 rounded text-[8px] font-mono text-zinc-500 flex justify-between items-center">
            <span>{translations[language].radar_hover_hint}</span>
            <span>CELL FREQ: P2P</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-1 text-[9.5px]/snug font-sans bg-[#0c102a]/60 p-2 rounded-lg border border-cyber-gold/10">
        <div className="flex items-start gap-1">
          <MapPin className="w-3.5 h-3.5 text-cyber-red shrink-0 mt-0.5" />
          <div className="font-mono text-[9px] text-[#fafafa]">
            <span className="text-zinc-400 block pb-0.5 uppercase">{translations[language].dispatch_label}</span>
            <span className="text-cyber-mint font-bold">{dispatchTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
