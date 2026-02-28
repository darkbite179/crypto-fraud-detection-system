import { useEffect, useRef, useState, useCallback } from 'react';
import { GitBranch } from 'lucide-react';

export default function NetworkGraph({ graphData }) {
    const canvasRef = useRef(null);
    const nodesRef = useRef([]);
    const animFrameRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);

    const getNodeColor = (risk) => {
        if (risk > 0.85) return '#dc2626';
        if (risk > 0.6) return '#d97706';
        return '#059669';
    };

    const getNodeGlow = (risk) => {
        if (risk > 0.85) return 'rgba(220, 38, 38, 0.2)';
        if (risk > 0.6) return 'rgba(217, 119, 6, 0.2)';
        return 'rgba(5, 150, 105, 0.12)';
    };

    // Initialize node positions
    useEffect(() => {
        if (!graphData.nodes.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const W = canvas.width;
        const H = canvas.height;
        const centerX = W / 2;
        const centerY = H / 2;

        // Place nodes in a circular layout with some randomization
        const existingMap = new Map(nodesRef.current.map(n => [n.id, n]));
        nodesRef.current = graphData.nodes.map((node, i) => {
            const existing = existingMap.get(node.id);
            if (existing) {
                existing.risk = node.risk;
                existing.txCount = node.txCount;
                existing.label = node.label;
                return existing;
            }
            const angle = (2 * Math.PI * i) / graphData.nodes.length + Math.random() * 0.5;
            const radius = 80 + Math.random() * 80;
            return {
                ...node,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
            };
        });
    }, [graphData.nodes]);

    // Force simulation + render loop
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const nodes = nodesRef.current;
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        // Simple force-directed physics
        const centerX = W / 2;
        const centerY = H / 2;

        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = 400 / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                nodes[i].vx -= fx;
                nodes[i].vy -= fy;
                nodes[j].vx += fx;
                nodes[j].vy += fy;
            }
        }

        // Attraction along edges
        graphData.edges.forEach(edge => {
            const s = nodeMap.get(edge.source);
            const t = nodeMap.get(edge.target);
            if (!s || !t) return;
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 100) * 0.01;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            s.vx += fx;
            s.vy += fy;
            t.vx -= fx;
            t.vy -= fy;
        });

        // Center gravity
        nodes.forEach(n => {
            n.vx += (centerX - n.x) * 0.002;
            n.vy += (centerY - n.y) * 0.002;
            n.vx *= 0.85;
            n.vy *= 0.85;
            n.x += n.vx;
            n.y += n.vy;
            n.x = Math.max(20, Math.min(W - 20, n.x));
            n.y = Math.max(20, Math.min(H - 20, n.y));
        });

        // Clear
        ctx.clearRect(0, 0, W, H);

        // Draw edges
        graphData.edges.forEach(edge => {
            const s = nodeMap.get(edge.source);
            const t = nodeMap.get(edge.target);
            if (!s || !t) return;

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(t.x, t.y);
            ctx.strokeStyle = edge.risk > 0.6
                ? `rgba(220, 38, 38, ${0.2 + edge.risk * 0.25})`
                : 'rgba(100, 116, 139, 0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(n => {
            const radius = 5 + Math.min(n.txCount * 1.5, 8);
            const color = getNodeColor(n.risk);
            const glow = getNodeGlow(n.risk);

            // Glow
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius + 4, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Node
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Inner
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
        });

        animFrameRef.current = requestAnimationFrame(render);
    }, [graphData.edges]);

    useEffect(() => {
        animFrameRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [render]);

    // Mouse hover for tooltip
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);

        const nodes = nodesRef.current;
        let found = null;
        for (const n of nodes) {
            const dist = Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2);
            if (dist < 15) {
                found = n;
                break;
            }
        }

        if (found) {
            setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                node: found,
            });
        } else {
            setTooltip(null);
        }
    };

    return (
        <div
            className="card"
            style={{ height: '420px', display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
            <div className="card-header">
                <GitBranch />
                <span>Transaction Network</span>
                <span
                    style={{
                        marginLeft: 'auto',
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    {graphData.nodes.length} wallets · {graphData.edges.length} links
                </span>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={340}
                    style={{ width: '100%', height: '100%', borderRadius: '8px' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                />

                {tooltip && (
                    <div
                        style={{
                            position: 'absolute',
                            left: tooltip.x + 12,
                            top: tooltip.y - 10,
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '0.72rem',
                            pointerEvents: 'none',
                            zIndex: 10,
                            boxShadow: 'var(--shadow-elevated)',
                            minWidth: 140,
                        }}
                    >
                        <div
                            className="font-mono"
                            style={{ color: 'var(--cyan)', fontWeight: 600, marginBottom: 4 }}
                        >
                            {tooltip.node.label}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                            Risk: <span style={{ color: getNodeColor(tooltip.node.risk), fontWeight: 600 }}>
                                {Math.round(tooltip.node.risk * 100)}%
                            </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                            Transactions: {tooltip.node.txCount}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
