# UX review del perfil admin (4 personas)

Evaluación heurística del panel admin usando 4 perfiles de uso.

## Persona 1: SUDO técnico

- Objetivo: crear usuarios, asignar roles, auditar acciones.
- Resultado: flujo cumple; necesita feedback claro de errores por permisos.
- Mejora aplicada: mensajes de error en formularios y reglas de rol explícitas (`sudo` solo por `sudo`).

## Persona 2: Admin operativo

- Objetivo: asignar licencias rápido.
- Resultado: flujo lineal en `/admin/licenses`; faltaba endpoint explícito de asignación.
- Mejora aplicada: alias `POST /api/admin/licenses/assign` además de `POST /api/admin/licenses`.

## Persona 3: Editor de contenidos

- Objetivo: mantener documentos de licenciatarios.
- Resultado: puede crear y cambiar estado de documentos sin tocar usuarios/licencias.
- Mejora aplicada: guardas separadas (`requireEditorApi`) y tabla dedicada `licenciatario_documents`.

## Persona 4: Responsable financiero

- Objetivo: ver compras/pagos y editar datos fiscales de clientes.
- Resultado: sección `/admin/customers` concentra perfil fiscal + orders + payments.
- Mejora aplicada: endpoint unificado de billing y formulario de datos fiscales editable.

## Hallazgos generales

- La navegación principal del admin es clara.
- Los formularios críticos tienen validaciones mínimas.
- Falta deseable a futuro:
  - paginación server-side en tablas largas,
  - filtros avanzados por fecha/estado,
  - panel visual de métricas (KPI) con gráficos.
