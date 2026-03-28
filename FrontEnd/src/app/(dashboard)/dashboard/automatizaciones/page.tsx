'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AutoStatus = 'active' | 'paused'

type Automation = {
  id: string
  name: string
  description: string
  trigger: string
  actions: string[]
  status: AutoStatus
  executions: number
  lastRun: string
  icon: string
  color: string
}

type FlowNode = {
  id: string
  label: string
  sublabel: string
  icon: React.ReactNode
  color: string
  x: number
  y: number
  isTrigger?: boolean
}

// ─── Datos demo ──────────────────────────────────────────────────────────────

const AUTOMATIONS: Automation[] = [
  {
    id: 'a1', name: 'Nuevo Pedido → WhatsApp + Sheets',
    description: 'Notifica por WhatsApp y guarda en Google Sheets cuando llega un pedido.',
    trigger: 'Nuevo Pedido', actions: ['WhatsApp Business', 'Google Sheets'],
    status: 'active', executions: 847, lastRun: 'Hace 3 min',
    icon: '🛒', color: 'emerald',
  },
  {
    id: 'a2', name: 'Pago Recibido → Email Confirmación',
    description: 'Envía email de confirmación al comprador automáticamente.',
    trigger: 'Pago Completado', actions: ['Gmail'],
    status: 'active', executions: 312, lastRun: 'Hace 1 hora',
    icon: '💳', color: 'indigo',
  },
  {
    id: 'a3', name: 'Formulario Contacto → CRM',
    description: 'Crea un contacto en HubSpot cuando alguien llena el formulario.',
    trigger: 'Formulario Enviado', actions: ['HubSpot'],
    status: 'paused', executions: 86, lastRun: 'Hace 2 días',
    icon: '📋', color: 'amber',
  },
  {
    id: 'a4', name: 'Stock Bajo → Alerta Email',
    description: 'Te avisa por email cuando un producto tiene menos de 5 unidades.',
    trigger: 'Stock Bajo', actions: ['Email'],
    status: 'paused', executions: 14, lastRun: 'Hace 1 semana',
    icon: '📦', color: 'rose',
  },
]

const TEMPLATES = [
  { icon: '💬', label: 'Telegram', desc: 'Notificar ventas' },
  { icon: '📊', label: 'Google Sheets', desc: 'Registrar pedidos' },
  { icon: '📧', label: 'Mailchimp', desc: 'Agregar suscriptores' },
  { icon: '🔔', label: 'Slack', desc: 'Alertas de equipo' },
  { icon: '📱', label: 'WhatsApp', desc: 'Confirmaciones' },
  { icon: '🗂️', label: 'Notion', desc: 'Base de clientes' },
]

// ─── Íconos SVG ───────────────────────────────────────────────────────────────

const IconCart = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/>
  </svg>
)
const IconChat = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)
const IconDB = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
  </svg>
)
const IconShield = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconCopy = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
)
const IconExternal = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconPlay = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconPause = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
)
const IconDots = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
)
const IconLightning = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconCheck = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ─── Componente Flow Editor ───────────────────────────────────────────────────

const NODE_W = 112  // w-28
const NODE_H = 100  // approx card height

type DragState =
  | { type: 'canvas'; startX: number; startY: number; startPanX: number; startPanY: number }
  | { type: 'node';   nodeId: string; startX: number; startY: number; startNodeX: number; startNodeY: number }

function FlowEditor({ automation }: { automation: Automation }) {
  const [nodes, setNodes] = useState<FlowNode[]>(() => [
    { id: 'trigger', label: automation.trigger, sublabel: 'TuNegocio API',
      icon: <IconCart />, color: '#6366f1', x: 60, y: 80, isTrigger: true },
    { id: 'action1', label: automation.actions[0] ?? '', sublabel: 'Enviar mensaje',
      icon: <IconChat />, color: '#10b981', x: 300, y: 30 },
    ...(automation.actions[1] ? [{
      id: 'action2', label: automation.actions[1], sublabel: 'Registrar fila',
      icon: <IconDB />, color: '#3b82f6', x: 300, y: 160,
    }] : []),
  ])
  const [pan, setPan]   = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const drag = useRef<DragState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clampZoom = (z: number) => Math.min(2.5, Math.max(0.25, z))

  // Center of a node (in canvas space)
  const cx = (n: FlowNode) => n.x + NODE_W / 2
  const cy = (n: FlowNode) => n.y + NODE_H / 2

  // ── Wheel → zoom ───────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const delta  = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => {
      const next = clampZoom(prev * delta)
      // Zoom toward mouse pointer
      setPan(p => ({
        x: mouseX - (mouseX - p.x) * (next / prev),
        y: mouseY - (mouseY - p.y) * (next / prev),
      }))
      return next
    })
  }, [])

  // ── Mouse down ────────────────────────────────────────────────────────────

  function onCanvasMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    drag.current = { type: 'canvas', startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y }
  }

  function onNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation()
    if (e.button !== 0) return
    const node = nodes.find(n => n.id === nodeId)!
    drag.current = { type: 'node', nodeId, startX: e.clientX, startY: e.clientY, startNodeX: node.x, startNodeY: node.y }
  }

  // ── Global mouse move / up ────────────────────────────────────────────────

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      if (d.type === 'canvas') {
        setPan({ x: d.startPanX + dx, y: d.startPanY + dy })
      } else {
        setNodes(prev => prev.map(n =>
          n.id === d.nodeId
            ? { ...n, x: d.startNodeX + dx / zoom, y: d.startNodeY + dy / zoom }
            : n
        ))
      }
    }
    function onUp() { drag.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [zoom])

  // ── Zoom controls ─────────────────────────────────────────────────────────

  function zoomIn()    { setZoom(z => clampZoom(z * 1.2)) }
  function zoomOut()   { setZoom(z => clampZoom(z / 1.2)) }
  function resetView() { setPan({ x: 0, y: 0 }); setZoom(1) }

  // ── Connection paths ──────────────────────────────────────────────────────

  const trigger  = nodes.find(n => n.id === 'trigger')!
  const action1  = nodes.find(n => n.id === 'action1')
  const action2  = nodes.find(n => n.id === 'action2')

  function bezier(x1: number, y1: number, x2: number, y2: number) {
    const mx = (x1 + x2) / 2
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
  }

  // ── Cursor ────────────────────────────────────────────────────────────────

  const [isDragging, setIsDragging] = useState(false)
  const cursor = isDragging ? 'cursor-grabbing' : 'cursor-grab'

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl border border-gray-200 overflow-hidden bg-[#f8f9fb] select-none ${cursor}`}
      style={{ height: 380 }}
      onMouseDown={e => { onCanvasMouseDown(e); setIsDragging(true) }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={handleWheel}
    >
      {/* Dotted grid — moves with pan */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #c8cdd8 1px, transparent 1px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
        }}
      />

      {/* Topbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-30">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Editor de flujo</span>
          <span className="text-[10px] text-gray-400 ml-2">scroll para zoom · arrastrar para mover</span>
        </div>
        <a href="https://n8n.io" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          Abrir en n8n Full <IconExternal />
        </a>
      </div>

      {/* Canvas — pan + zoom transform */}
      <div
        className="absolute inset-0 pt-10 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
        >
          {/* SVG connections */}
          <svg className="absolute" style={{ overflow: 'visible', left: 0, top: 0, width: 0, height: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>
            {action1 && (
              <path
                d={bezier(cx(trigger) + NODE_W / 2 - 1, cy(trigger), cx(action1) - NODE_W / 2, cy(action1))}
                fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="6,4"
                markerEnd="url(#arrowhead)"
              />
            )}
            {action2 && (
              <path
                d={bezier(cx(trigger) + NODE_W / 2 - 1, cy(trigger), cx(action2) - NODE_W / 2, cy(action2))}
                fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="6,4"
                markerEnd="url(#arrowhead)"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute flex flex-col items-center gap-1 pointer-events-auto"
              style={{ left: node.x, top: node.y, width: NODE_W }}
              onMouseDown={e => onNodeMouseDown(e, node.id)}
            >
              {node.isTrigger && (
                <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full tracking-wide">
                  TRIGGER
                </span>
              )}
              <div
                className="w-full rounded-2xl border-2 bg-white shadow-lg p-3 flex flex-col items-center gap-1.5 cursor-grab active:cursor-grabbing hover:shadow-xl transition-shadow"
                style={{ borderColor: node.color }}
              >
                <span style={{ color: node.color }}>{node.icon}</span>
                <span className="text-xs font-bold text-gray-800 text-center leading-tight">{node.label}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{node.sublabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls — bottom right */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button onClick={zoomOut}  className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold leading-none">−</button>
        <button onClick={resetView} className="px-2 py-1.5 text-[11px] text-gray-500 hover:bg-gray-100 transition-colors font-semibold min-w-[44px] text-center border-x border-gray-100">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn}   className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold leading-none">+</button>
      </div>

      {/* Mini-map hint */}
      <div className="absolute bottom-3 left-3 z-30 text-[10px] text-gray-400">
        Zoom: scroll · Pan: arrastrar fondo · Mover nodo: arrastrar nodo
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AutomatizacionesPage() {
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS)
  const [selectedId, setSelectedId] = useState<string>(AUTOMATIONS[0]!.id)
  const [copied, setCopied] = useState(false)
  const [signatureEnabled, setSignatureEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<'flows' | 'guide' | 'templates'>('flows')

  const selected = automations.find(a => a.id === selectedId) ?? automations[0]!

  function toggleStatus(id: string) {
    setAutomations(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ))
  }

  function copyKey() {
    navigator.clipboard.writeText('tn_secret_8231...921')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalExecs = automations.reduce((s, a) => s + a.executions, 0)
  const activeCount = automations.filter(a => a.status === 'active').length
  const quota = Math.round((totalExecs / 1600) * 100)

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo:  'bg-indigo-50  text-indigo-700  border-indigo-200',
    amber:   'bg-amber-50   text-amber-700   border-amber-200',
    rose:    'bg-rose-50    text-rose-700    border-rose-200',
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatizaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Conecta tu negocio con WhatsApp, email, hojas de cálculo y más.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium">
            Beta — Fase 2
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <span className="text-base leading-none">+</span>
            Nueva automatización
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { key: 'flows',     label: 'Mis flujos' },
          { key: 'templates', label: 'Plantillas' },
          { key: 'guide',     label: 'Cómo funciona' },
        ] as { key: typeof activeTab; label: string }[]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════ TAB: MIS FLUJOS ══════════════════════ */}
      {activeTab === 'flows' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Col izquierda: editor + lista ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Flow Editor */}
            <FlowEditor automation={selected} />

            {/* Automation cards */}
            <div className="space-y-2">
              {automations.map(auto => (
                <div
                  key={auto.id}
                  onClick={() => setSelectedId(auto.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedId === auto.id
                      ? 'border-indigo-300 bg-indigo-50/60 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${colorMap[auto.color] ?? ''}`}>
                    {auto.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">{auto.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        auto.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {auto.status === 'active' ? 'ACTIVO' : 'PAUSADO'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{auto.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-gray-400">{auto.executions.toLocaleString()} ejecuciones</span>
                      <span className="text-[11px] text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{auto.lastRun}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleStatus(auto.id)}
                      title={auto.status === 'active' ? 'Pausar' : 'Activar'}
                      className={`p-2 rounded-xl transition-colors ${
                        auto.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {auto.status === 'active' ? <IconPause /> : <IconPlay />}
                    </button>
                    <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                      <IconDots />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Col derecha: métricas + seguridad ── */}
          <div className="space-y-4">

            {/* Métricas — dark card */}
            <div className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)' }}>
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Métricas del mes</p>
              <div className="flex items-end justify-between mb-1">
                <p className="text-4xl font-black tracking-tight">{totalExecs.toLocaleString()}</p>
                <span className="text-sm font-bold text-emerald-400">+12%</span>
              </div>
              <p className="text-xs text-indigo-300 mb-4">TAREAS EJECUTADAS</p>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all"
                    style={{ width: `${quota}%` }} />
                </div>
                <p className="text-[11px] text-indigo-300">{quota}% de tu cuota de n8n utilizada.</p>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xl font-bold">{activeCount}</p>
                  <p className="text-[11px] text-indigo-300">flujos activos</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{automations.length}</p>
                  <p className="text-[11px] text-indigo-300">total flujos</p>
                </div>
              </div>
            </div>

            {/* Seguridad Webhook */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <IconShield />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">Seguridad Webhook</p>
                  <p className="text-[11px] text-gray-400">Protege tus integraciones</p>
                </div>
              </div>

              {/* Secret key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Secret Key (TuNegocio)
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <code className="flex-1 text-xs text-gray-700 font-mono">tn_secret_8231...921</code>
                  <button onClick={copyKey}
                    className={`p-1.5 rounded-lg transition-all ${
                      copied ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`} title="Copiar">
                    {copied ? <IconCheck /> : <IconCopy />}
                  </button>
                </div>
              </div>

              {/* Toggle firma */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Validación de Firma</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Solo peticiones de n8n pueden activar cambios
                  </p>
                </div>
                <button
                  onClick={() => setSignatureEnabled(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    signatureEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    signatureEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Webhook URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Webhook URL
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <code className="text-[11px] text-indigo-600 font-mono break-all">
                    https://tunegocio.app/api/webhooks/n8n
                  </code>
                </div>
              </div>
            </div>

            {/* Eventos disponibles */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
              <p className="text-sm font-bold text-gray-800">Eventos disponibles</p>
              {[
                { event: 'order.created',    label: 'Nuevo pedido',        color: 'bg-emerald-400' },
                { event: 'payment.completed',label: 'Pago confirmado',     color: 'bg-indigo-400'  },
                { event: 'contact.submitted',label: 'Formulario enviado',  color: 'bg-amber-400'   },
                { event: 'product.low_stock',label: 'Stock bajo',          color: 'bg-rose-400'    },
                { event: 'landing.published',label: 'Landing publicada',   color: 'bg-violet-400'  },
              ].map(ev => (
                <div key={ev.event} className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{ev.label}</p>
                    <code className="text-[10px] text-gray-400 font-mono">{ev.event}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ TAB: PLANTILLAS ══════════════════════ */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Activa una plantilla con un click. Puedes editarla después en n8n.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🛒', title: 'Pedido → WhatsApp', desc: 'Notifica cada venta por WhatsApp Business automáticamente.', tags: ['WhatsApp', 'Pedidos'], popular: true },
              { icon: '📊', title: 'Pedido → Google Sheets', desc: 'Registra cada pedido como fila en tu hoja de cálculo.', tags: ['Google Sheets', 'Pedidos'], popular: true },
              { icon: '💳', title: 'Pago → Email', desc: 'Envía confirmación de pago al comprador por Gmail.', tags: ['Gmail', 'Pagos'], popular: false },
              { icon: '📋', title: 'Contacto → HubSpot', desc: 'Crea un lead en HubSpot cuando alguien llena el formulario.', tags: ['HubSpot', 'CRM'], popular: false },
              { icon: '📱', title: 'Venta → Telegram', desc: 'Recibe una alerta en Telegram por cada nueva venta.', tags: ['Telegram', 'Alertas'], popular: false },
              { icon: '📧', title: 'Comprador → Mailchimp', desc: 'Agrega cada comprador a tu lista de email marketing.', tags: ['Mailchimp', 'Email'], popular: false },
              { icon: '🔔', title: 'Venta → Slack', desc: 'Notifica a tu equipo en Slack cuando hay una nueva compra.', tags: ['Slack', 'Equipo'], popular: false },
              { icon: '🗂️', title: 'Contacto → Notion', desc: 'Guarda cada contacto como registro en tu base de Notion.', tags: ['Notion', 'CRM'], popular: false },
              { icon: '📦', title: 'Stock Bajo → Email', desc: 'Alerta por email cuando un producto tiene menos de 5 unidades.', tags: ['Email', 'Inventario'], popular: false },
            ].map((tpl, i) => (
              <div key={i} className="relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
                {tpl.popular && (
                  <span className="absolute -top-2.5 left-4 text-[10px] font-black bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                    POPULAR
                  </span>
                )}
                <div className="text-3xl mb-3">{tpl.icon}</div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">{tpl.title}</h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tpl.desc}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {tpl.tags.map(t => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <button className="w-full py-2 text-xs font-bold text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all group-hover:border-indigo-400">
                  Activar plantilla
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════ TAB: CÓMO FUNCIONA ══════════════════════ */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pasos */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-800">Cómo conectar TuNegocio con n8n</h2>
            {[
              {
                step: 1, color: 'bg-indigo-600',
                title: 'Copia tu Webhook URL y Secret Key',
                desc: 'Ve a la pestaña "Mis flujos", copia la URL y la llave secreta del panel de seguridad. Las necesitarás en n8n.',
                code: 'https://tunegocio.app/api/webhooks/n8n',
              },
              {
                step: 2, color: 'bg-violet-600',
                title: 'Crea un flujo en n8n',
                desc: 'Abre n8n y crea un nuevo workflow. Agrega un nodo "Webhook" como trigger y pega tu URL. Activa la validación de firma con tu Secret Key.',
                code: null,
              },
              {
                step: 3, color: 'bg-emerald-600',
                title: 'Elige el evento a escuchar',
                desc: 'En el body del webhook recibirás un campo "event" que indica qué pasó. Usa un nodo "Switch" para separar: order.created, payment.completed, etc.',
                code: '{ "event": "order.created", "data": { ... } }',
              },
              {
                step: 4, color: 'bg-amber-500',
                title: 'Conecta tu herramienta',
                desc: 'Agrega los nodos de WhatsApp, Gmail, Google Sheets, HubSpot o lo que necesites. Mapea los campos del pedido a los campos de cada herramienta.',
                code: null,
              },
              {
                step: 5, color: 'bg-rose-500',
                title: 'Activa y prueba',
                desc: 'Activa el workflow en n8n y haz un pedido de prueba en tu landing. Verifica que el flujo se dispara correctamente en el historial de n8n.',
                code: null,
              },
            ].map(s => (
              <div key={s.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 ${s.color}`}>
                    {s.step}
                  </span>
                  {s.step < 5 && <div className="w-px flex-1 bg-gray-200 mt-2" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{s.desc}</p>
                  {s.code && (
                    <code className="block text-[11px] bg-gray-900 text-emerald-400 rounded-xl px-3 py-2 font-mono overflow-x-auto">
                      {s.code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ + Payload de referencia */}
          <div className="space-y-4">
            {/* Payload de referencia */}
            <div className="rounded-2xl border border-gray-200 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Payload de ejemplo — order.created</p>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <pre className="text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">{`{
  "event": "order.created",
  "timestamp": "2026-03-23T18:30:00Z",
  "data": {
    "orderId": "clxyz123...",
    "landingId": "clabc456...",
    "buyerEmail": "cliente@email.com",
    "buyerName": "María García",
    "totalAmount": 2500,
    "currency": "usd",
    "items": [
      {
        "name": "Producto A",
        "quantity": 2,
        "unitPrice": 1250
      }
    ]
  }
}`}</pre>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <p className="text-sm font-bold text-gray-800">Preguntas frecuentes</p>
              {[
                {
                  q: '¿Necesito saber programar?',
                  a: 'No. n8n tiene interfaz visual. Solo arrastras y conectas nodos. Las plantillas ya están pre-configuradas.',
                },
                {
                  q: '¿Tiene costo adicional?',
                  a: 'En Plan Pro incluyes 1,000 ejecuciones/mes. Plan Business: ilimitado. n8n Cloud es gestionado por TuNegocio.',
                },
                {
                  q: '¿Puedo conectar mis propias herramientas?',
                  a: 'Sí. n8n tiene más de 400 integraciones: CRMs, hojas de cálculo, emails, chats, APIs personalizadas y más.',
                },
                {
                  q: '¿Qué pasa si falla una automatización?',
                  a: 'n8n guarda el historial de errores. Puedes ver qué falló, por qué, y re-ejecutar el flujo manualmente.',
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-indigo-500 mt-0.5"><IconLightning /></span>
                    <p className="text-sm font-semibold text-gray-700">{faq.q}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* CTA n8n */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white">
              <p className="font-bold mb-1">¿Tienes n8n propio?</p>
              <p className="text-sm text-indigo-200 mb-4">
                Conecta tu instancia self-hosted y mantén el control total de tus flujos y datos.
              </p>
              <button className="w-full py-2.5 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors">
                Configurar instancia propia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
