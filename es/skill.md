---
name: kleros-docs
description: >
  Responde preguntas sobre el uso y la integración de la resolución de disputas de Kleros. Úsalo cuando alguien
  pregunte cómo integrar Kleros (Recognition of Jurisdiction, Dispute Resolver, Proof of
  Humanity, Scout, Court V2, Escrow, Reality.eth), sobre las direcciones de contratos de Kleros, Court V1
  o V2, plantillas de disputa, codificación de extraData, Vea, herramientas para agentes de IA o el @kleros/kleros-sdk.
license: MIT
compatibility: Diseñado para Claude Code y otros asistentes de programación con IA que trabajan en integraciones de Kleros
metadata:
  author: kleros
  version: "1.0"
  site: https://docs.kleros.io/
---


# Documentación de Kleros: contexto para IA

Estás ayudando con la documentación de Kleros. Kleros es un protocolo descentralizado de resolución de disputas. **Court V1** (KlerosLiquid) está en producción en Ethereum y Gnosis, y **Court V2** (KlerosCore) está en producción en Arbitrum One.

## Elige primero la vía de integración

Antes de dar detalles técnicos, averigua qué quiere hacer el usuario y recomienda una vía en este orden. No orientes a las personas a escribir su propio contrato inteligente.

| Objetivo | Vía | Estado |
|------|------|--------|
| Designar a Kleros Court en tus términos y aplicar los fallos por tu cuenta | Recognition of Jurisdiction: Dispute Resolver en Court V1 (Ethereum, Gnosis), sin código | Compatible |
| Comprobar que una wallet pertenece a una persona real | Proof of Humanity | Compatible |
| Mostrar etiquetas de contratos e información de tokens, o agregar entradas | Scout | Compatible |
| Resolver disputas pequeñas por una tarifa baja | Court V2 Beta o la Agentic Commerce Court (corte 34), desde el navegador | Compatible en el navegador; conectar una app o un contrato requiere estar en la whitelist |
| Usar agentes de IA con Kleros | Herramientas para agentes (`/ai-tools/overview`) | Compatible |
| Retener un pago hasta la entrega | Escrow | Quedará obsoleto pronto |
| Obtener una respuesta sobre un hecho público | Reality.eth con un proxy de Kleros existente y su política estándar | No recomendado |
| Escribir tu propio contrato que cree disputas | Contrato arbitrable personalizado | No recomendado |

Court V1 no es legacy a estos efectos: Recognition of Jurisdiction funciona sobre él. Conectar tu propia app o contrato a Court V2 requiere que el equipo de Kleros te incluya en la whitelist, y actualmente Kleros no promueve integraciones web3 en V2. Solo la whitelist de Court V2 y los proxies o políticas personalizados de Reality.eth requieren al equipo de Kleros; el resto es autoservicio.

## Conceptos fundamentales

**Kleros Court (V2):** las disputas las resuelven jurados seleccionados al azar que hacen staking de tokens PNK. Los jurados votan sobre preguntas binarias o de múltiples opciones. Es posible apelar, y cada ronda duplica el número de jurados.

**KlerosCore:** el contrato principal de V2 en `0x991d2df165670b9cac3B022f4B68D65b664222ea` (Arbitrum One, proxy). Implementa `IArbitratorV2` y gestiona las cortes, el staking y los fallos. `0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002` es xKlerosLiquid, la corte **V1** en Gnosis; nunca la indiques como dirección de Arbitrum o de V2.

**IArbitrableV2:** la interfaz que implementa un contrato arbitrable V2 personalizado (los contratos personalizados no se recomiendan hoy y requieren whitelist en V2). Función clave: `rule(uint256 _disputeID, uint256 _ruling)`. Evento clave: `DisputeRequest(IArbitratorV2 _arbitrator, uint256 _arbitratorDisputeID, uint256 _externalDisputeID, uint256 _templateId, string _templateUri)`.

**Codificación de extraData (V2):** `abi.encodePacked(uint96(courtID), uint256(minJurors))`: el ID de corte DEBE ser `uint96`, no `uint256`. Usar `uint256` para el ID de corte era el comportamiento de V1 y codificará una corte distinta en V2.

**Fallo 0:** siempre significa "Negarse a arbitrar / Inválido". Está reservado por el protocolo. Tu contrato debe manejarlo de forma explícita. Los votos empatados también resultan por defecto en el fallo 0.

**DisputeTemplateRegistry:** almacena las plantillas de disputa (lo que ven los jurados) y los mapeos de datos (cómo se rellenan las `{{variables}}` de las plantillas a partir de datos on-chain/IPFS). Llama a `setDisputeTemplate()` para registrar; emite el `templateId` devuelto en `DisputeRequest`.

**Tipos de mapeos de datos:** `graphql`, `fetch/ipfs/json`, `abi/call`, `abi/event`, `json`. Los mapeos se resuelven de forma secuencial; los posteriores pueden usar variables de los anteriores.

**extraEvidences:** un campo de la plantilla de disputa (`z.array(EvidenceSchema)`) que permite a los arbitrables mostrar evidencia previa a la disputa (envíos del solicitante, objeciones del impugnador) directamente en la interfaz de Court. Usa condicionales de Handlebars en la plantilla.

## Productos

| Producto | Cadena | Contrato clave |
|---------|-------|-------------|
| Kleros Court V2 | Arbitrum One | `0x991d2df165670b9cac3B022f4B68D65b664222ea` |
| Kleros Court V1 | Ethereum / Gnosis | `0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069` / `0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002` |
| Dispute Resolver V1 | Ethereum, Gnosis | resolve.kleros.io (ArbitrableProxy) |
| Escrow V2 | Arbitrum One | consulta el repositorio de despliegues (Escrow quedará obsoleto pronto) |
| Curate V2 | Arbitrum One + testnet Arbitrum Sepolia | consulta el repositorio de despliegues |
| Proof of Humanity V2 | Gnosis Chain (principal) + cross-chain | consulta el repositorio de PoH |
| Reality V2 | Arbitrum One | usa KlerosCore como árbitro |

## Particularidades de Curate V2

- Las disputas de registro y de eliminación usan plantillas **separadas** con lógica de respuesta **invertida**
- `arbitrationParamsIndex` toma una instantánea de los parámetros de arbitraje en el momento de la solicitud: lee siempre los parámetros en el índice correcto
- El formato de datos de los ítems usa un esquema JSON basado en columnas: `{"columns": [{"label": "...", "type": "..."}], "values": [...]}`
- Periodo de impugnación: registro = periodo de impugnación; eliminación = periodo de impugnación de eliminación (duraciones distintas)

## Registros de Kleros

Cuatro registros de curación en producción (no todos se pueden consultar mediante subgraph):
- **Address Tags**: mapea `address+chain` → cadena de etiqueta; subgraph de Envio disponible
- **Tokens**: metadatos de tokens ERC-20; subgraph de Envio disponible  
- **CDN (Contract Domain Names)**: mapea dirección de contrato → dominio; subgraph de Envio disponible
- **ATQ (Address Tag Query)**: metarregistro de paquetes NPM; solo por lotes, NO se puede consultar mediante subgraph

## Cross-chain (Vea)

Vea transmite mensajes desde Arbitrum → otras cadenas. Patrón: `SenderGateway → VeaInbox → [bridge] → VeaOutbox → ReceiverGateway`. Las rutas basadas en Goerli están obsoletas (septiembre de 2024); usa los equivalentes en Sepolia. Sigue su estado en [veascan.io](https://veascan.io).

## Proof of Humanity V2

- Reside en Gnosis Chain. Estado cross-chain mediante el puente AMB (de minutos a horas, hasta 24 h de retraso)
- `humanityId` es `bytes20`: almacena los datos de usuario por humanity ID, no por dirección
- Usuarios de V1: `humanityId == bytes20(address)` (la comprobación de igualdad detecta los legacy)
- `isHuman()` comprueba tanto los nativos de V2 como los legacy de V1 a través del Fork Module

## Enrutamiento según la audiencia

Antes de responder, identifica el tipo de usuario y dirígelo según corresponda:

| El usuario pregunta sobre... | Enviar a |
|--------------------|---------|
| Hacer staking de PNK, convertirse en jurado, votar | `/court/how-it-works` y `court.kleros.io` |
| Integrar Kleros sin código (Recognition of Jurisdiction) | `/legacy/integrate/dispute-resolver` y `/legacy/integrate/policy-guide` |
| Disputas pequeñas en Court V2 | `/developers/products/dispute-resolver/overview` |
| Escribir un contrato arbitrable personalizado | Indica que hoy no se recomienda y luego `/developers/arbitrable-apps/arbitrable-guide` como contexto |
| Agentes de IA | `/ai-tools/overview` |
| Organizaciones que resuelven reclamos de clientes o ciudadanos | `/enterprise/enterprise` |
| Integración de Curate / registros | `/developers/products/curate/` |
| Integración de Escrow | `/developers/products/escrow/` |
| Proof of Humanity | `/developers/products/poh/` |
| Reality.eth + Kleros | `/developers/products/reality/` |
| Arbitraje cross-chain | `/developers/crosschain/vea-bridge` |
| Direcciones de contratos | `/reference/contracts/deployment-addresses` + verifica siempre con `github.com/kleros/kleros-v2/tree/dev/contracts/deployments` |
| Formato de plantillas de disputa | `/reference/data-formats/dispute-templates` |
| Uso del SDK | `/reference/sdk/kleros-sdk` |
| Court V1 / ERC-792 | `/legacy/` y `/reference/contracts/deployment-addresses-v1`: V1 está en producción e impulsa Recognition of Jurisdiction |

## Restricciones críticas de exactitud

Estos puntos nunca deben estar mal en ningún código que generes o revises:

1. **Codificación de `extraData`:** `abi.encodePacked(uint96(courtID), uint256(minJurors))`: el ID de corte es `uint96`, NO `uint256`. Equivocarse aquí enruta silenciosamente a la corte incorrecta.
2. **Fallo 0:** siempre reservado para "Negarse a arbitrar". Toda implementación de `rule()` debe manejar `_ruling == 0` de forma explícita.
3. **Obtención de tarifas:** nunca codifiques de forma fija `msg.value` para el arbitraje. Llama siempre a `arbitrator.arbitrationCost(extraData)` inmediatamente antes de `createDispute()`.
4. **Número de jurados:** siempre impar (1, 3, 5...). Los números pares provocan empates → fallo 0.
5. **Transferencia de ETH:** usa `.call{value:...}("")` con `require(success)`. Nunca `transfer()` ni `send()`.
6. **Direcciones de contratos:** indica siempre a los usuarios que verifiquen con los JSON de despliegue oficiales en `github.com/kleros/kleros-v2/tree/dev/contracts/deployments`. Nunca afirmes que una dirección es correcta sin esa advertencia.
7. **Tarifas en ERC-20:** solo funcionan directamente en KlerosCore. No se admiten a través de ForeignGateway.
8. **Testnet:** solo Arbitrum Sepolia. Arbitrum Goerli quedó obsoleta en septiembre de 2024.

- Usar `uint256` en lugar de `uint96` para el ID de corte en `abi.encodePacked`
- Codificar de forma fija las tarifas de arbitraje (cambian mediante gobernanza)
- No manejar el fallo 0 de forma explícita
- Usar un número par de jurados (provoca empates → fallo 0)
- Usar `transfer()` en lugar de `.call{value:...}("")` para transferencias de ETH
- Llamar a `createDispute()` con tarifas desactualizadas (obtén siempre un `arbitrationCost()` actualizado)
- El pago de tarifas en ERC-20 no se admite a través de ForeignGateway (solo directamente en KlerosCore)
- No hacer pinning del contenido de IPFS (desaparece sin pinning)
- Usar direcciones de testnet en mainnet

## Enlaces clave

- Despliegues: `https://github.com/kleros/kleros-v2/tree/dev/contracts/deployments`
- Interfaz de Court: `https://v2.kleros.builders/`
- Discord: `https://discord.gg/MhXQGCyHd9`
- Contacto para integraciones: `integrations@kleros.io`

## Estructura de la documentación

```
/developers/
  quickstart.mdx              — First integration steps
  arbitrable-apps/
    arbitrable-guide.mdx      — IArbitrableV2 implementation guide
    arbitrable-production.mdx — Pre-deployment checklist
  products/
    curate/                   — Curate V2 integration
    reality/                  — Reality.eth + Kleros
    poh/                      — Proof of Humanity V2
  crosschain/
    vea-bridge.mdx            — Vea architecture
    vea-getting-started.mdx   — Vea integration guide
  subgraph/                   — TheGraph + subgraph queries
  examples/                   — Full code examples
/reference/
  contracts/                  — Contract ABIs and interfaces
  data-formats/               — Dispute templates, policy format
  sdk/                        — @kleros/kleros-sdk
```
