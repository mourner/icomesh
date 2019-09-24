# icomesh

Fast JavaScript icosphere mesh generation library for WebGL visualizations.
Based on [an article by Andreas Kahler](http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html).

## Example

```js
import icomesh from 'icomesh';

// generate an icosphere with 4 subdivisions
const {vertices, triangles} = icomesh(4);
````

## API

### `icomesh(order = 4)`

Generates an icosphere mesh with `order` subdivisions (`4` by default, `10` max).
Returns an object with the following properties:

- `vertices`: A `Float32Array` array of `x, y, z` vertices.
- `triangles`: A `Uint16Array` or `Uint32Array` array of triangle indices.

You can reuse vertex data for normals because they are equal for a unit sphere.
