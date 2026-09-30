export const PRESUPUESTO_MARKER = '__presupuesto__'
export const STATUSES = ['PENDIENTE', 'EN PROCESO', 'PAGADO', 'NO APLICA']
export const DETALLE_DEFAULT = { estimado: '', real: '', status: 'PENDIENTE', obs: '' }

const mapear = (conceptos, ref) => conceptos.map((concepto, i) => ({ id: `${ref}_${i}`, concepto }))

export const SECCIONES = [
  {
    id: 'datos_adeudos',
    titulo: 'DATOS / ADEUDOS',
    items: [
      { id: 'adeudo_luz', concepto: 'Adeudo LUZ', campo: 'adeudo_luz' },
      { id: 'adeudo_agua', concepto: 'Adeudo AGUA', campo: 'adeudo_agua' },
      { id: 'adeudo_predial', concepto: 'Adeudo PREDIAL', campo: 'adeudo_predial' },
      { id: 'adeudo_infonavit', concepto: 'Adeudo INFONAVIT', campo: 'adeudo_infonavit' },
    ],
  },
  {
    id: 'documentacion',
    titulo: 'DOCUMENTACIÓN',
    items: mapear(['Escrituración', 'Acta de nacimiento', 'Avalúo', 'Contratos', 'Papelería', 'Inscripción Infonavit', 'Cancelación hipoteca', 'Número oficial', 'Multas', 'Predial'], 'doc'),
  },
  {
    id: 'remodelaciones',
    titulo: 'REMODELACIONES',
    items: mapear(['Pintura', 'WC', 'Azulejo', 'Enjarre', 'Ventanería', 'Cableado', 'Boiler'], 'rem'),
  },
  { id: 'remodelacion_2', titulo: 'REMODELACIÓN ETAPA 2', items: [] },
  {
    id: 'comisiones',
    titulo: 'COMISIONES',
    items: mapear(['Gestión', 'Venta 2.5% del valor del inmueble', 'Cierre', 'Prospección', 'Comercial', 'Referidos'], 'com'),
  },
  { id: 'costos_financieros', titulo: 'COSTOS FINANCIEROS', items: [] },
  { id: 'adelanto_cuentas', titulo: 'ADELANTO CUENTAS', items: [] },
  {
    id: 'costos_operativos',
    titulo: 'COSTOS OPERATIVOS',
    items: [{ id: 'costos_operativos_total', concepto: 'Total costos operativos', campo: 'costos_operativos' }],
  },
  { id: 'otros_gastos', titulo: 'OTROS GASTOS', items: [] },
]