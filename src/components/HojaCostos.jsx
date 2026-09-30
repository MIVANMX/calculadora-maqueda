import { Fragment } from 'react'
import { SECCIONES } from '../lib/hojaCostos'

const parseNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0
const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const HOJA_STYLES = `
.hoja-wrap { overflow-x: auto; background: #ffffff; border: 1px solid #cbd5e1; }
table.hoja { width: 100%; min-width: 900px; border-collapse: collapse; font-size: 13px; font-family: Inter, system-ui, sans-serif; }
.hoja th {
  background: #0D1B2A; color: #ffffff; text-transform: uppercase;
  font-size: 10.5px; letter-spacing: 0.6px; font-weight: 700;
  padding: 8px 10px; border: 1px solid #1B3A6B; text-align: left; white-space: nowrap;
}
.hoja td { border: 1px solid #e2e8f0; padding: 0; height: 34px; vertical-align: middle; }
.hoja .col-desc { width: 31%; }
.hoja .col-est { width: 16%; }
.hoja .col-real { width: 16%; }
.hoja .col-status { width: 19%; }
.hoja .col-obs { width: 18%; }
.hoja tr.seccion td { background: #EEF4FF; color: #0D1B2A; font-weight: 700; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.4px; padding: 7px 10px; border-color: #dbeafe; }
.hoja td.desc { padding: 0 10px; color: #1e293b; font-size: 13px; }
.hoja td.num { text-align: right; }
.hoja td.status-td { text-align: center; }
.hoja td.obs-td { padding: 0 10px; text-align: left; }
.hoja input[type="text"], .hoja select {
  width: 100%; height: 100%; border: none; background: transparent; outline: none;
  font-family: inherit; font-size: 13px; color: #0f172a; padding: 4px 8px; box-sizing: border-box;
}
.hoja td.num input[type="text"] { text-align: right; font-variant-numeric: tabular-nums; }
.hoja td.status-td select { text-align: center; text-align-last: center; cursor: pointer; }
.hoja input[type="text"]:focus, .hoja select:focus { background: #f0f4ff; }
.hoja tr.summary td { background: #f8fafc; }
.hoja tr.summary td.label { padding: 6px 10px; font-weight: 600; color: #334155; font-size: 12.5px; }
.hoja tr.summary td.num { padding: 6px 10px; font-size: 13px; font-weight: 600; color: #0f172a; }
.hoja tr.summary.oferta td { background: #ffffff; }
.hoja tr.summary td.label.gm { color: #1B3A6B; font-size: 11.5px; }
.hoja tr.resumen td.titulo { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.5px; color: #334155; padding: 8px 10px; }
.hoja tr.total td { background: #0D1B2A; color: #ffffff; font-weight: 700; border-color: #1B3A6B; padding: 10px; }
.hoja tr.total td.num { color: #ffffff; }
.hoja tr.total td.label { color: #ffffff; }
.hoja .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 3px 12px; border-radius: 20px; }
.hoja .badge.ok { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.hoja .badge.no { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
`

const HojaCostos = ({ form, cotizacion, detalle = {}, onCambio, resumen, readOnly = false }) => {
  const valorEstimado = (item) => {
    if (item.campo) return readOnly ? (cotizacion?.[item.campo] ?? '') : (form?.[item.campo] ?? '')
    return detalle[item.id]?.estimado ?? ''
  }

  const totalEstimado = SECCIONES.flatMap(s => s.items).reduce((a, it) => a + parseNum(valorEstimado(it)), 0)
  const totalReal = SECCIONES.flatMap(s => s.items).reduce((a, it) => a + parseNum(detalle[it.id]?.real ?? ''), 0)

  const renderItemCells = (item) => {
    if (readOnly) {
      return (
        <>
          <td className="desc">{item.concepto}</td>
          <td className="num">{fmt(parseNum(valorEstimado(item)))}</td>
          <td className="num">{fmt(parseNum(detalle[item.id]?.real ?? ''))}</td>
          <td className="status-td">
            <span style={{ fontSize: '12px', color: detalle[item.id]?.status === 'PAGADO' ? '#16a34a' : '#475569' }}>
              {detalle[item.id]?.status || '—'}
            </span>
          </td>
          <td className="obs-td" style={{ fontSize: '12px', color: '#64748b' }}>{detalle[item.id]?.obs || ''}</td>
        </>
      )
    }
    return (
      <>
        <td className="desc">{item.concepto}</td>
        <td className="num">
          <input type="text" value={valorEstimado(item)} placeholder="0"
            onChange={e => onCambio(item, 'estimado', e.target.value)} />
        </td>
        <td className="num">
          <input type="text" value={detalle[item.id]?.real ?? ''} placeholder="0"
            onChange={e => onCambio(item, 'real', e.target.value)} />
        </td>
        <td className="status-td">
          <select value={detalle[item.id]?.status ?? 'PENDIENTE'}
            onChange={e => onCambio(item, 'status', e.target.value)}>
            {['PENDIENTE', 'EN PROCESO', 'PAGADO', 'NO APLICA'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td className="obs-td">
          <input type="text" value={detalle[item.id]?.obs ?? ''} placeholder="Comentarios"
            onChange={e => onCambio(item, 'obs', e.target.value)} />
        </td>
      </>
    )
  }

  return (
    <div className="hoja-wrap">
      <table className="hoja">
        <thead>
          <tr>
            <th className="col-desc">Descripción</th>
            <th className="col-est">Monto estimado</th>
            <th className="col-real">Monto real</th>
            <th className="col-status">Status</th>
            <th className="col-obs">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {SECCIONES.map(sec => (
            <Fragment key={sec.id}>
              <tr className="seccion">
                <td colSpan={5}>{sec.titulo}</td>
              </tr>
              {sec.items.map(item => (
                <tr key={item.id}>{renderItemCells(item)}</tr>
              ))}
            </Fragment>
          ))}

          <tr className="resumen">
            <td className="titulo" colSpan={5}>Resumen financiero</td>
          </tr>
          <tr className="summary">
            <td colSpan={3} className="label">Total adeudos</td>
            <td className="num" colSpan={2}>{fmt(resumen.totalAdeudos)}</td>
          </tr>
          <tr className="summary">
            <td colSpan={3} className="label">Costos operativos / acumulados</td>
            <td className="num" colSpan={2}>{fmt(resumen.costosOperativos)}</td>
          </tr>
          <tr className="summary">
            <td colSpan={3} className="label">Costo total</td>
            <td className="num" colSpan={2}>{fmt(resumen.costoTotal)}</td>
          </tr>
          <tr className="summary">
            <td colSpan={3} className="label">Utilidad bruta</td>
            <td className="num" colSpan={2} style={{ color: resumen.utilidad >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{fmt(resumen.utilidad)}</td>
          </tr>
          <tr className="summary">
            <td colSpan={3} className="label">Viabilidad</td>
            <td className="num" colSpan={2}>
              <span className={resumen.viable ? 'badge ok' : 'badge no'}>
                {resumen.viable ? 'VIABLE' : 'NO VIABLE'}
              </span>
            </td>
          </tr>
          {resumen.ofertas.map(o => (
            <tr key={o.label} className="summary oferta">
              <td className="label">{o.label}</td>
              <td className="num" colSpan={2}>{fmt(o.monto)}</td>
              <td className="label gm">Ganancia Maqueda</td>
              <td className="num">{fmt(o.ganancia)}</td>
            </tr>
          ))}

          <tr className="total">
            <td className="label">TOTAL</td>
            <td className="num">{fmt(totalEstimado)}</td>
            <td className="num">{fmt(totalReal)}</td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
      <style>{HOJA_STYLES}</style>
    </div>
  )
}

export default HojaCostos