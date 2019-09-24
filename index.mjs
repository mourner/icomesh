const midCache = new Map(); // midpoint vertices cache to avoid duplicating shared vertices

export default function icomesh(order = 4) {
    if (order > 10) throw new Error(`Max order is 10, but given ${order}.`);

    // set up an icosahedron (12 vertices / 20 triangles)
    const f = (1 + Math.sqrt(5)) / 2;
    const T = 1 << (order << 1); // Math.pow(4, order);

    const vertices = new Float32Array((10 * T + 2) * 3);
    vertices.set([
        -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, 0,
        0, -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f,
        f, 0, -1, f, 0, 1, -f, 0, -1, -f, 0, 1
    ]);

    let triangles = Uint16Array.of(
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7
    );

    function addMidPoint(a, b, v) {
        const key = ((a + b) * (a + b + 1) / 2) + Math.min(a, b) | 0; // Cantor's pairing function
        let i = midCache.get(key);
        if (i !== undefined) return i;
        midCache.set(key, v);
        vertices[3 * v + 0] = (vertices[3 * a + 0] + vertices[3 * b + 0]) * 0.5;
        vertices[3 * v + 1] = (vertices[3 * a + 1] + vertices[3 * b + 1]) * 0.5;
        vertices[3 * v + 2] = (vertices[3 * a + 2] + vertices[3 * b + 2]) * 0.5;
        return v;
    }

    let trianglesPrev = triangles;

    for (let i = 0, v = 12; i < order; i++) { // repeatedly subdivide each triangle into 4 triangles
        const prevLen = trianglesPrev.length;
        const IndexArray = prevLen * 4 > 65535 ? Uint32Array : Uint16Array;
        triangles = new IndexArray(prevLen * 4);

        for (let k = 0; k < prevLen; k += 3) {
            const v1 = trianglesPrev[k + 0];
            const v2 = trianglesPrev[k + 1];
            const v3 = trianglesPrev[k + 2];
            const a = addMidPoint(v1, v2, v++);
            const b = addMidPoint(v2, v3, v++);
            const c = addMidPoint(v3, v1, v++);
            let t = k * 4;
            triangles[t++] = v1; triangles[t++] = a; triangles[t++] = c;
            triangles[t++] = v2; triangles[t++] = b; triangles[t++] = a;
            triangles[t++] = v3; triangles[t++] = c; triangles[t++] = b;
            triangles[t++] = a;  triangles[t++] = b; triangles[t++] = c;
        }
        trianglesPrev = triangles;
    }

    // normalize vertices
    for (let i = 0, len = vertices.length; i < len; i += 3) {
        // const m = 1 / Math.hypot(vertices[i + 0], vertices[i + 1], vertices[i + 2]);
        const v0 = vertices[i + 0];
        const v1 = vertices[i + 1];
        const v2 = vertices[i + 2];
        const d = v0 * v0 + v1 * v1 + v2 * v2;
        if (d < 1e-6) continue;
        const m  = 1 / Math.sqrt(d);
        vertices[i + 0] *= m;
        vertices[i + 1] *= m;
        vertices[i + 2] *= m;
    }

    return {vertices, triangles};
}
