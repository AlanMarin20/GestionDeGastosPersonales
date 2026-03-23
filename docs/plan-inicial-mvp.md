# Plan inicial MVP

## Objetivo
Iniciar el desarrollo de la Plataforma Inteligente de Gestión de Gastos Personales con una base técnica sólida y entregable en iteraciones cortas.

## Primer paso recomendado (Sprint 0)
Definir y congelar el **MVP funcional** antes de programar features.

### Entregables del primer paso
1. Alcance MVP (qué entra y qué no entra)
   - Auth
   - Categorías
   - Ingresos
   - Gastos
   - Reportes básicos
2. Modelo de datos v1
   - Usuario, Categoría, Ingreso, Gasto
3. Contrato API v1
   - Endpoints, payloads, códigos de error
4. Criterios de aceptación por módulo

## Orden de implementación sugerido
1. Backend base (NestJS) y conexión a PostgreSQL
2. Auth JWT
3. CRUD de categorías
4. CRUD de ingresos y gastos
5. Reportes por rango de fechas y categoría
6. Integración de IA (fase 2)

## Definición de “listo para empezar a codear”
- Modelo de datos validado
- Endpoints definidos
- Variables de entorno cerradas
- Estructura de carpetas y convenciones acordadas
