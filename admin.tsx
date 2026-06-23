import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabase'
import { useAuth } from '../auth'
import * as XLSX from 'xlsx'

interface Viaje {
  id: number
  created_at: string
  vendedor: string
  descripcion: string
  tipo_combustible: string
  distancia_km: number
  precio_litro: number
  rendimiento: number
  litros: number
  costo_gasolina: number
  costo_caseta: number
  costo_total: number
  notas: string
}

function getLunesDeSemana(fecha: Date) {
  const d = new Date(fecha)
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDomingoDeSemana(lunes: Date) {
  const d = new Date(lunes)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

function toDateInput(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const hoy = new Date()
  const lunesActual = getLunesDeSemana(hoy)
  const domingoActual = getDomingoDeSemana(lunesActual)

  const [viajes, setViajes] = useState<Viaje[]>([])
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)

  // Filtros generales de la tabla
  const [filtroVendedor, setFiltroVendedor] = useState('Todos')
  const [filtroCombustible, setFiltroCombustible] = useState('Todos')
  const [filtroMes, setFiltroMes] = useState('Todos')

  // Exportar Excel
  const [exportModo, setExportModo] = useState<'semana' | 'rango'>('semana')
  const [exportDesde, setExportDesde] = useState(toDateInput(lunesActual))
  const [exportHasta, setExportHasta] = useState(toDateInput(domingoActual))

  // Confirmación borrar todo
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  const fetchViajes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('viajes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setViajes(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) fetchViajes()
  }, [user, fetchViajes])

  // ── Vendedores únicos ──────────────────────────────────────────────────
  const vendedores = ['Todos', ...Array.from(new Set(viajes.map(v => v.vendedor))).sort()]
  const meses = ['Todos', ...Array.from(new Set(viajes.map(v => {
    const d = new Date(v.created_at)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }))).sort().reverse()]

  // ── Filtrado tabla ─────────────────────────────────────────────────────
  const viajesFiltrados = viajes.filter(v => {
    const d = new Date(v.created_at)
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return (
      (filtroVendedor === 'Todos' || v.vendedor === filtroVendedor) &&
      (filtroCombustible === 'Todos' || v.tipo_combustible === filtroCombustible) &&
      (filtroMes === 'Todos' || mes === filtroMes)
    )
  })

  // ── Totales ────────────────────────────────────────────────────────────
  const totalKm = viajesFiltrados.reduce((s, v) => s + (v.distancia_km || 0), 0)
  const totalGas = viajesFiltrados.reduce((s, v) => s + (v.costo_gasolina || 0), 0)
  const totalCaseta = viajesFiltrados.reduce((s, v) => s + (v.costo_caseta || 0), 0)
  const totalGeneral = viajesFiltrados.reduce((s, v) => s + (v.costo_total || 0), 0)

  // ── Exportar Excel ─────────────────────────────────────────────────────
  const exportarExcel = async () => {
    setExportando(true)
    try {
      let desde: Date
      let hasta: Date

      if (exportModo === 'semana') {
        desde = lunesActual
        hasta = domingoActual
      } else {
        desde = new Date(exportDesde + 'T00:00:00')
        hasta = new Date(exportHasta + 'T23:59:59')
      }

      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .gte('created_at', desde.toISOString())
        .lte('created_at', hasta.toISOString())
        .order('vendedor', { ascending: true })
        .order('created_at', { ascending: true })

      if (error || !data) {
        alert('Error al obtener datos: ' + (error?.message || 'desconocido'))
        return
      }

      if (data.length === 0) {
        alert('No hay viajes en el período seleccionado.')
        return
      }

      // ── Hoja 1: Detalle por viaje ────────────────────────────────────
      const filas = data.map(v => ({
        'Fecha': new Date(v.created_at).toLocaleDateString('es-MX', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        'Vendedor': v.vendedor,
        'Descripción': v.descripcion || '',
        'Combustible': v.tipo_combustible,
        'Distancia (km)': v.distancia_km,
        'Precio/Litro ($)': v.precio_litro,
        'Rendimiento (km/L)': v.rendimiento,
        'Litros': Number((v.litros || 0).toFixed(2)),
        'Costo Gasolina ($)': Number((v.costo_gasolina || 0).toFixed(2)),
        'Costo Caseta ($)': Number((v.costo_caseta || 0).toFixed(2)),
        'Costo Total ($)': Number((v.costo_total || 0).toFixed(2)),
        'Notas': v.notas || '',
      }))

      // ── Hoja 2: Resumen por vendedor ─────────────────────────────────
      const porVendedor: Record<string, {
        viajes: number
        km: number
        litros: number
        gasolina: number
        caseta: number
        total: number
      }> = {}

      data.forEach(v => {
        if (!porVendedor[v.vendedor]) {
          porVendedor[v.vendedor] = { viajes: 0, km: 0, litros: 0, gasolina: 0, caseta: 0, total: 0 }
        }
        porVendedor[v.vendedor].viajes += 1
        porVendedor[v.vendedor].km += v.distancia_km || 0
        porVendedor[v.vendedor].litros += v.litros || 0
        porVendedor[v.vendedor].gasolina += v.costo_gasolina || 0
        porVendedor[v.vendedor].caseta += v.costo_caseta || 0
        porVendedor[v.vendedor].total += v.costo_total || 0
      })

      const filasResumen = Object.entries(porVendedor)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([vendedor, d]) => ({
          'Vendedor': vendedor,
          'Viajes': d.viajes,
          'Km Totales': Number(d.km.toFixed(1)),
          'Litros Totales': Number(d.litros.toFixed(2)),
          'Costo Gasolina ($)': Number(d.gasolina.toFixed(2)),
          'Costo Casetas ($)': Number(d.caseta.toFixed(2)),
          'Costo Total ($)': Number(d.total.toFixed(2)),
        }))

      // Fila de totales
      filasResumen.push({
        'Vendedor': 'TOTAL',
        'Viajes': Object.values(porVendedor).reduce((s, d) => s + d.viajes, 0),
        'Km Totales': Number(Object.values(porVendedor).reduce((s, d) => s + d.km, 0).toFixed(1)),
        'Litros Totales': Number(Object.values(porVendedor).reduce((s, d) => s + d.litros, 0).toFixed(2)),
        'Costo Gasolina ($)': Number(Object.values(porVendedor).reduce((s, d) => s + d.gasolina, 0).toFixed(2)),
        'Costo Casetas ($)': Number(Object.values(porVendedor).reduce((s, d) => s + d.caseta, 0).toFixed(2)),
        'Costo Total ($)': Number(Object.values(porVendedor).reduce((s, d) => s + d.total, 0).toFixed(2)),
      })

      // ── Crear workbook ───────────────────────────────────────────────
      const wb = XLSX.utils.book_new()

      // Hoja detalle
      const ws1 = XLSX.utils.json_to_sheet(filas)
      ws1['!cols'] = [
        { wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 12 },
        { wch: 14 }, { wch: 14 }, { wch: 17 }, { wch: 10 },
        { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 25 },
      ]
      XLSX.utils.book_append_sheet(wb, ws1, 'Detalle Viajes')

      // Hoja resumen
      const ws2 = XLSX.utils.json_to_sheet(filasResumen)
      ws2['!cols'] = [
        { wch: 20 }, { wch: 8 }, { wch: 14 }, { wch: 16 },
        { wch: 18 }, { wch: 17 }, { wch: 15 },
      ]
      XLSX.utils.book_append_sheet(wb, ws2, 'Resumen por Vendedor')

      // ── Nombre del archivo ───────────────────────────────────────────
      const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`

      const nombreArchivo = exportModo === 'semana'
        ? `Gasolina_Semana_${fmt(desde)}-${fmt(hasta)}.xlsx`
        : `Gasolina_${fmt(desde)}-${fmt(hasta)}.xlsx`

      XLSX.writeFile(wb, nombreArchivo)
    } finally {
      setExportando(false)
    }
  }

  // ── Borrar todo ────────────────────────────────────────────────────────
  const borrarTodo = async () => {
    const { error } = await supabase.from('viajes').delete().neq('id', 0)
    if (!error) {
      setViajes([])
      setConfirmDelete(false)
    } else {
      alert('Error al borrar: ' + error.message)
    }
  }

  if (authLoading || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f0f0f0', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        background: '#1a1a1a', borderBottom: '1px solid #2a2a2a',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>⛽</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#ff6a00' }}>Mexbelt Gas</span>
          <span style={{
            background: '#2a2a2a', color: '#aaa', fontSize: 12,
            padding: '2px 10px', borderRadius: 20, marginLeft: 4
          }}>Admin</span>
        </div>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: '1px solid #333', color: '#aaa', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
        >
          ← Calculadora
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Panel exportar Excel ──────────────────────────────────────── */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: 12, padding: '20px 24px', marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Exportar Excel</span>
          </div>

          {/* Toggle modo */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setExportModo('semana')}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: exportModo === 'semana' ? '#ff6a00' : '#2a2a2a',
                color: exportModo === 'semana' ? '#fff' : '#aaa',
                border: 'none'
              }}
            >
              📅 Semana actual
            </button>
            <button
              onClick={() => setExportModo('rango')}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: exportModo === 'rango' ? '#ff6a00' : '#2a2a2a',
                color: exportModo === 'rango' ? '#fff' : '#aaa',
                border: 'none'
              }}
            >
              📆 Rango de fechas
            </button>
          </div>

          {/* Info semana actual */}
          {exportModo === 'semana' && (
            <div style={{
              background: '#111', border: '1px solid #2a2a2a', borderRadius: 8,
              padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#aaa'
            }}>
              Semana del <strong style={{ color: '#f0f0f0' }}>
                {lunesActual.toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}
              </strong> al <strong style={{ color: '#f0f0f0' }}>
                {domingoActual.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </strong>
            </div>
          )}

          {/* Selectores rango */}
          {exportModo === 'rango' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Desde</label>
                <input
                  type="date"
                  value={exportDesde}
                  onChange={e => setExportDesde(e.target.value)}
                  style={{
                    background: '#111', border: '1px solid #333', borderRadius: 8,
                    color: '#f0f0f0', padding: '8px 12px', fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Hasta</label>
                <input
                  type="date"
                  value={exportHasta}
                  onChange={e => setExportHasta(e.target.value)}
                  style={{
                    background: '#111', border: '1px solid #333', borderRadius: 8,
                    color: '#f0f0f0', padding: '8px 12px', fontSize: 14
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={exportarExcel}
            disabled={exportando}
            style={{
              background: exportando ? '#555' : '#22c55e',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px 28px', fontSize: 14, fontWeight: 700,
              cursor: exportando ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            {exportando ? '⏳ Generando...' : '⬇️ Descargar Excel'}
          </button>
          <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
            El archivo incluye 2 hojas: detalle de cada viaje y resumen por vendedor.
          </p>
        </div>

        {/* ── Filtros tabla ─────────────────────────────────────────────── */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: 12, padding: '20px 24px', marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Mes</label>
              <select
                value={filtroMes}
                onChange={e => setFiltroMes(e.target.value)}
                style={{
                  background: '#111', border: '1px solid #ff6a00', borderRadius: 8,
                  color: '#f0f0f0', padding: '8px 12px', fontSize: 14, minWidth: 150
                }}
              >
                {meses.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Vendedor</label>
              <select
                value={filtroVendedor}
                onChange={e => setFiltroVendedor(e.target.value)}
                style={{
                  background: '#111', border: '1px solid #ff6a00', borderRadius: 8,
                  color: '#f0f0f0', padding: '8px 12px', fontSize: 14, minWidth: 180
                }}
              >
                {vendedores.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Combustible</label>
              <select
                value={filtroCombustible}
                onChange={e => setFiltroCombustible(e.target.value)}
                style={{
                  background: '#111', border: '1px solid #ff6a00', borderRadius: 8,
                  color: '#f0f0f0', padding: '8px 12px', fontSize: 14, minWidth: 150
                }}
              >
                {['Todos', 'Magna', 'Premium', 'Diésel'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={() => { setFiltroMes('Todos'); setFiltroVendedor('Todos'); setFiltroCombustible('Todos') }}
              style={{
                background: '#2a2a2a', border: 'none', color: '#aaa',
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13
              }}
            >
              Limpiar filtros
            </button>

            <div style={{ marginLeft: 'auto' }}>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    background: '#7f1d1d', border: 'none', color: '#fca5a5',
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
                  }}
                >
                  🗑 Borrar Todo
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#fca5a5' }}>¿Confirmar?</span>
                  <button onClick={borrarTodo} style={{ background: '#dc2626', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Sí, borrar</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ background: '#2a2a2a', border: 'none', color: '#aaa', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tarjetas de totales ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Viajes', value: viajesFiltrados.length, icon: '🚗', color: '#3b82f6' },
            { label: 'Km Totales', value: totalKm.toLocaleString('es-MX', { maximumFractionDigits: 0 }), icon: '📍', color: '#8b5cf6' },
            { label: 'Gasolina', value: `$${totalGas.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '⛽', color: '#ff6a00' },
            { label: 'Casetas', value: `$${totalCaseta.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '🛣️', color: '#f59e0b' },
            { label: 'Total', value: `$${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰', color: '#22c55e' },
          ].map(t => (
            <div key={t.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{t.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: t.color }}>{t.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabla ─────────────────────────────────────────────────────── */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Todos los viajes</span>
            <span style={{ fontSize: 13, color: '#888' }}>{viajesFiltrados.length} registros</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Cargando...</div>
          ) : viajesFiltrados.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>No hay viajes para este filtro.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    {['Fecha', 'Vendedor', 'Descripción', 'Combustible', 'Km', 'Precio/L', 'Litros', 'Gasolina', 'Caseta', 'Total', 'Notas'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', borderBottom: '1px solid #2a2a2a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viajesFiltrados.map((v, i) => (
                    <tr key={v.id} style={{ background: i % 2 === 0 ? '#1a1a1a' : '#161616', borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#aaa' }}>
                        {new Date(v.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <br />
                        <span style={{ fontSize: 11, color: '#555' }}>
                          {new Date(v.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#f0f0f0' }}>{v.vendedor}</td>
                      <td style={{ padding: '10px 14px', color: '#ccc', maxWidth: 200 }}>{v.descripcion}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: v.tipo_combustible === 'Premium' ? '#1e3a5f' : v.tipo_combustible === 'Diésel' ? '#2d1a00' : '#1a2e1a',
                          color: v.tipo_combustible === 'Premium' ? '#60a5fa' : v.tipo_combustible === 'Diésel' ? '#fb923c' : '#4ade80',
                          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                        }}>
                          {v.tipo_combustible}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e0e0e0' }}>{v.distancia_km?.toLocaleString('es-MX')}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e0e0e0' }}>${v.precio_litro?.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e0e0e0' }}>{v.litros?.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#ff6a00', fontWeight: 600 }}>${v.costo_gasolina?.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f59e0b' }}>${v.costo_caseta?.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#22c55e', fontWeight: 700 }}>${v.costo_total?.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>{v.notas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
