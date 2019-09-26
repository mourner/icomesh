export default function icomesh(order = 4) {
    if (order > 10) throw new Error(`Max order is 10, but given ${order}.`);

    // set up an icosahedron (12 vertices / 20 triangles)
    const r5 = Math.sqrt(5);
    const h = 1/r5;	// +/-height of ring vertices from plane ≃0.4472
    const w = 2/r5;	// factor for x,y of ring vertices
    const c36 = w * 0.25 * (r5 + 1); // cosine of 36° ≃ 0.8090
    const s36 = w * Math.sqrt( (5/8) - (r5 / 8) ); // sine of 36° ≃ 0.5877
    const c72 = w * 0.25 * (r5 - 1); // cosine of 72° ≃ 0.3090
    const s72 = w * Math.sqrt( (5/8) + (r5 / 8) ); // sine of 72° ≃ 0.9510

    const T = Math.pow(4, order);

    const vertices = new Float32Array((10 * T + 2) * 3);
    vertices.set(Float32Array.of(
        0,0,1, // North pole
        0,1,h,        s72,c72,h,  s36,-c36,h,  -s36,-c36,h,  -s72,c72,h, // Northern ring
        -s36,c36,-h,  s36,c36,-h, s72,-c72,-h, 0,-1,-h,    -s72,-c72,-h, // Southern ring
        0,0,-1 // South pole
    ));

    let triangles = Uint16Array.of(
        0,2,1,    0,3,2,    0,4,3,    0,5,4,  0,1,5,  // Adjacent to north

        1,2,7,    2,3,8,    3,4,9,   4,5,10,  5,1,6,  // Central ring, northern half
        7,2,8,    8,3,9,    9,4,10,  10,5,6,  6,1,7,  // Central ring, southern half

        6,7,11,  7,8,11,    8,9,11,  9,10,11, 10,6,11 // Adjacent to south
    );

    let v = 12;
    const midCache = order ? new Map() : null; // midpoint vertices cache to avoid duplicating shared vertices

    function addMidPoint(a, b) {
        const key = Math.floor(((a + b) * (a + b + 1) / 2) + Math.min(a, b)); // Cantor's pairing function
        let i = midCache.get(key);
        if (i !== undefined) {
            midCache.delete(key); // midpoint is only reused once, so we delete it for performance
            return i;
        }
        midCache.set(key, v);
        vertices[3 * v + 0] = (vertices[3 * a + 0] + vertices[3 * b + 0]) * 0.5;
        vertices[3 * v + 1] = (vertices[3 * a + 1] + vertices[3 * b + 1]) * 0.5;
        vertices[3 * v + 2] = (vertices[3 * a + 2] + vertices[3 * b + 2]) * 0.5;
        i = v++;
        return i;
    }

    let trianglesPrev = triangles;
    const IndexArray = order > 5 ? Uint32Array : Uint16Array;

    for (let i = 0; i < order; i++) { // repeatedly subdivide each triangle into 4 triangles
        const prevLen = trianglesPrev.length;
        triangles = new IndexArray(prevLen * 4);

        for (let k = 0; k < prevLen; k += 3) {
            const v1 = trianglesPrev[k + 0];
            const v2 = trianglesPrev[k + 1];
            const v3 = trianglesPrev[k + 2];
            const a = addMidPoint(v1, v2);
            const b = addMidPoint(v2, v3);
            const c = addMidPoint(v3, v1);
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
        const v1 = vertices[i + 0];
        const v2 = vertices[i + 1];
        const v3 = vertices[i + 2];
        const m  = 1 / Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3);
        vertices[i + 0] *= m;
        vertices[i + 1] *= m;
        vertices[i + 2] *= m;
    }

    return {vertices, triangles};
}
