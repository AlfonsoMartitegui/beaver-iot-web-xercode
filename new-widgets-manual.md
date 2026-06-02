# Manual de uso de widgets de estado y datos

## Status Indicator / Indicador de estado

Sirve para mostrar el estado booleano de una entidad de forma visual y compacta.

Uso recomendado:

- Estados simples: online/offline, alarma/normal, activo/inactivo.
- Cuando solo interesa mostrar el estado actual, sin datos secundarios.

Entidades admitidas:

- Tipo: `PROPERTY`
- Valor: `BOOLEAN`
- Acceso: `R` o `RW`

Opciones principales:

- `Entity`: entidad booleana a leer.
- `Title`: texto principal.
- `False status label`: texto cuando el valor es `false`.
- `True status label`: texto cuando el valor es `true`.
- `False status appearance`: icono y color para `false`.
- `True status appearance`: icono y color para `true`.

Tamaño:

- Default: `2 x 1`
- Mínimo: `1 x 1`
- Máximo: `4 x 2`

## Status Card / Tarjeta de estado

Muestra una entidad booleana con título, valor, icono principal y led opcional.

Uso recomendado:

- Mostrar el estado de un dispositivo o propiedad importante.
- Cuando se necesita algo más descriptivo que un indicador simple.

Entidades admitidas:

- Tipo: `PROPERTY`
- Valor: `BOOLEAN`
- Acceso: `R` o `RW`

Opciones principales:

- `Entity`: entidad booleana a leer.
- `Title`: título de la tarjeta.
- `False status label`: texto para `false`.
- `True status label`: texto para `true`.
- `False status appearance`: icono y color para `false`.
- `True status appearance`: icono y color para `true`.
- `Show LED indicator`: muestra u oculta el led lateral.
- `False LED color`: color del led para `false`.
- `True LED color`: color del led para `true`.

Tamaño:

- Default: `2 x 1`
- Mínimo: `2 x 1`
- Máximo: `4 x 2`

## Toggle Button / Botón toggle

Botón de acción para alternar una entidad booleana entre `true` y `false`.

Uso recomendado:

- Encender o apagar una salida.
- Activar o desactivar una función.
- Control rápido de una propiedad booleana escribible.

Entidades admitidas:

- Tipo: `PROPERTY`
- Valor: `BOOLEAN`
- Acceso: `W` o `RW`

Opciones principales:

- `Entity`: entidad booleana que se va a modificar.
- `Title`: texto base del widget.
- `False status label`: texto mostrado cuando el valor es `false`.
- `True status label`: texto mostrado cuando el valor es `true`.
- `False status appearance`: icono y color para `false`.
- `True status appearance`: icono y color para `true`.
- Permite opción sin icono.

Comportamiento:

- Lee el estado actual de la entidad.
- Al hacer click, envía el valor contrario.
- Actualiza visualmente el estado de forma optimista.

Tamaño:

- Default: `2 x 1`
- Mínimo: `1 x 1`
- Máximo: `4 x 1`

## Multi Data Card / Tarjeta multi dato

Muestra una entidad principal y varios valores extra en la misma tarjeta.

Uso recomendado:

- Resumen de dispositivo.
- Mostrar temperatura, humedad, estado, consumo, timestamp, etc.
- Cuando se necesita una tarjeta informativa con varios datos.

Entidades admitidas:

- Principal: `PROPERTY`
- Valores principales: `STRING`, `LONG`, `DOUBLE`, `BOOLEAN`
- Acceso principal: `R` o `RW`
- Extras: `PROPERTY`
- Valores extra: `STRING`, `LONG`, `DOUBLE`, `BOOLEAN`
- Acceso extra: `R` o `RW`

Opciones principales:

- `Entity`: entidad principal.
- `Title`: título de la tarjeta.
- Para entidad booleana:
  - `False status label`
  - `True status label`
  - `False status appearance`
  - `True status appearance`
- Para entidad enum o no booleana:
  - configuración de iconos por valor.
- `Extra values`: lista de valores secundarios.
- En extras booleanos o enum:
  - puede mostrar opciones de estado.
- Permite opción sin icono.
- Máximo de extras: `10`.

Comportamiento de extras:

- Si no caben todos, muestra `+N`.
- Al pulsar `+N`, abre un modal con todos los extras.

Tamaño:

- Default: `3 x 2`
- Mínimo: `2 x 1`
- Máximo: `6 x 4`

## Status Toggle Card / Tarjeta toggle de estado

Combina una tarjeta de estado, valores extra y un botón toggle de acción.

Uso recomendado:

- Controlar un dispositivo y mostrar sus datos asociados.
- Ejemplo: enchufe con estado, consumo, temperatura y botón de encendido/apagado.
- Cuando se necesita ver información y actuar sobre una entidad booleana escribible.

Entidades admitidas:

- Principal: `PROPERTY`
- Valor principal: `BOOLEAN`
- Acceso principal: `W` o `RW`
- Extras: `PROPERTY`
- Valores extra: `STRING`, `LONG`, `DOUBLE`, `BOOLEAN`
- Acceso extra: `R` o `RW`

Opciones principales:

- `Entity`: entidad booleana principal que se puede modificar.
- `Title`: título de la tarjeta.
- `False status label`: texto del estado `false`.
- `True status label`: texto del estado `true`.
- `False status appearance`: apariencia de cabecera para `false`.
- `True status appearance`: apariencia de cabecera para `true`.
- `Show LED indicator`: muestra u oculta el led.
- `False LED color`: color del led para `false`.
- `True LED color`: color del led para `true`.
- `False toggle button label`: texto del botón cuando el estado es `false`.
- `True toggle button label`: texto del botón cuando el estado es `true`.
- `False toggle button appearance`: color e icono del botón para `false`.
- `True toggle button appearance`: color e icono del botón para `true`.
- `Extra values`: hasta `4` valores secundarios.
- Permite opción sin icono.

Comportamiento:

- Muestra el estado actual de la entidad principal.
- El led representa el estado de la entidad principal.
- El botón alterna el valor booleano actual.
- Los extras muestran datos secundarios.
- Si hay más extras de los visibles, aparece `+N` y abre un modal con todos.

Comportamiento por altura:

- Altura `2`: muestra hasta los 2 primeros extras y `+N` si hay más.
- Altura `3+`: muestra todos los extras disponibles.
- Extras limitados a `4`.

Tamaño:

- Default: `4 x 2`
- Mínimo: `2 x 2`
- Máximo: `6 x 4`

## Resumen rápido

- Solo mostrar estado compacto: **Status Indicator**
- Mostrar estado con icono y led: **Status Card**
- Solo accionar una entidad booleana: **Toggle Button**
- Mostrar varios datos sin acción: **Multi Data Card**
- Mostrar datos y accionar una entidad booleana: **Status Toggle Card**
