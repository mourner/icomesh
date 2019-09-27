# icomesh

Fast JavaScript icosphere mesh generation library for WebGL visualizations. [Interactive demo](https://observablehq.com/@mourner/fast-icosphere-mesh):

<a href="https://observablehq.com/@mourner/fast-icosphere-mesh"><img alt="Icosphere mesh" src="https://user-images.githubusercontent.com/25395/65533055-a6561280-df05-11e9-89d5-37477274b4af.png"></a>

Icosphere is a type of [geodesic polyhedron](https://en.wikipedia.org/wiki/Geodesic_polyhedron) that provides a good quality triangular mesh approximation of a sphere with relatively evenly distributed vertices.
This project is inspired by [an article by Andreas Kahler](http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html).

[![Build Status](https://travis-ci.com/mourner/icomesh.svg?branch=master)](https://travis-ci.com/mourner/icomesh)
[![minzipped size](https://badgen.net/bundlephobia/minzip/icomesh)](https://unpkg.com/icomesh)
[![Simply Awesome](https://img.shields.io/badge/simply-awesome-brightgreen.svg)](https://github.com/mourner/projects)

## Example

```js
import icomesh from 'icomesh';

// generate an icosphere with 4 subdivisions
const {vertices, triangles} = icomesh(4);
````

## API

### `icomesh(order = 4, uvMap = false)`

Generates an icosphere mesh with `order` subdivisions (`4` by default, `10` max).
Returns an object with:

- `vertices`: A `Float32Array` array of `x, y, z` vertices.
- `triangles`: A `Uint16Array` or `Uint32Array` array of triangle indices.
- `uv`: if `uvMap` is `true`, a `Float32Array` of `u, v` values for mapping vertices to a texture with an equirectangular projection.

You can reuse vertex data for normals because they are equal for a unit sphere.

## Install

Install with `npm install icomesh` or `yarn add icomesh` (module environments only),
or use a browser build from CDN:

- [ES module build on unpkg](https://unpkg.com/icomesh)
- [UMD build on bundle.run](https://bundle.run/icomesh)
