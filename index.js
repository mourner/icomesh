export default function icomesh(order = 4, uvMap = false) {
    if (order > 10) throw new Error(`Max order is 10, but given ${order}.`);

    // set up an icosahedron (12 vertices / 20 triangles)
    const f = (1 + Math.sqrt(5)) / 2;
    const T = Math.pow(4, order);

    const numVertices = 10 * T + 2;
    const numDuplicates = !uvMap ? 0 : order === 0 ? 3 : Math.pow(2, order) * 3 + 9;

    const vertices = new Float32Array((numVertices + numDuplicates) * 3);
    vertices.set(Float32Array.of(
        -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, 0,
        0, -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f,
        f, 0, -1, f, 0, 1, -f, 0, -1, -f, 0, 1
    ));

    let triangles = Uint16Array.of(
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7
    );

    let v = 12;
    const midCache = order ? new Map() : null; // midpoint vertices cache to avoid duplicating shared vertices

    function addMidPoint(a, b) {
        const key = Math.floor(((a + b) * (a + b + 1) / 2) + Math.min(a, b)); // Cantor's pairing function
        const i = midCache.get(key);
        if (i !== undefined) {
            midCache.delete(key); // midpoint is only reused once, so we delete it for performance
            return i;
        }
        midCache.set(key, v);
        vertices[3 * v + 0] = (vertices[3 * a + 0] + vertices[3 * b + 0]) * 0.5;
        vertices[3 * v + 1] = (vertices[3 * a + 1] + vertices[3 * b + 1]) * 0.5;
        vertices[3 * v + 2] = (vertices[3 * a + 2] + vertices[3 * b + 2]) * 0.5;
        return v++;
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
    for (let i = 0; i < numVertices * 3; i += 3) {
        const v1 = vertices[i + 0];
        const v2 = vertices[i + 1];
        const v3 = vertices[i + 2];
        const m  = 1 / Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3);
        vertices[i + 0] *= m;
        vertices[i + 1] *= m;
        vertices[i + 2] *= m;
    }

    if (!uvMap) return {vertices, triangles};

    // uv mapping
    const uv = new Float32Array((numVertices + numDuplicates) * 2);
    for (let i = 0; i < numVertices; i++) {
        uv[2 * i + 0] = Math.atan2(vertices[3 * i + 2], vertices[3 * i]) / (2 * Math.PI) + 0.5;
        uv[2 * i + 1] = Math.asin(vertices[3 * i + 1]) / Math.PI + 0.5;
    }

    const duplicates = new Map();

    function addDuplicate(i, uvx, uvy, cached) {
        if (cached) {
            const dupe = duplicates.get(i);
            if (dupe !== undefined) return dupe;
        }
        vertices[3 * v + 0] = vertices[3 * i + 0];
        vertices[3 * v + 1] = vertices[3 * i + 1];
        vertices[3 * v + 2] = vertices[3 * i + 2];
        uv[2 * v + 0] = uvx;
        uv[2 * v + 1] = uvy;
        if (cached) duplicates.set(i, v);
        return v++;
    }

    for (let i = 0; i < triangles.length; i += 3) {
        const a = triangles[i + 0];
        const b = triangles[i + 1];
        const c = triangles[i + 2];
        let ax = uv[2 * a];
        let bx = uv[2 * b];
        let cx = uv[2 * c];
        const ay = uv[2 * a + 1];
        const by = uv[2 * b + 1];
        const cy = uv[2 * c + 1];

        // uv fixing code; don't ask me how I got here
        if (bx - ax >= 0.5 && ay !== 1) bx -= 1;
        if (cx - bx > 0.5) cx -= 1;
        if (ax > 0.5 && ax - cx > 0.5 || ax === 1 && cy === 0) ax -= 1;
        if (bx > 0.5 && bx - ax > 0.5) bx -= 1;

        if (ay === 0 || ay === 1) {
            ax = (bx + cx) / 2;
            if (ay === bx) uv[2 * a] = ax;
            else triangles[i + 0] = addDuplicate(a, ax, ay, false);

        } else if (by === 0 || by === 1) {
            bx = (ax + cx) / 2;
            if (by === ax) uv[2 * b] = bx;
            else triangles[i + 1] = addDuplicate(b, bx, by, false);

        } else if (cy === 0 || cy === 1) {
            cx = (ax + bx) / 2;
            if (cy === ax) uv[2 * c] = cx;
            else triangles[i + 2] = addDuplicate(c, cx, cy, false);
        }
        if (ax !== uv[2 * a] && ay !== 0 && ay !== 1) triangles[i + 0] = addDuplicate(a, ax, ay, true);
        if (bx !== uv[2 * b] && by !== 0 && by !== 1) triangles[i + 1] = addDuplicate(b, bx, by, true);
        if (cx !== uv[2 * c] && cy !== 0 && cy !== 1) triangles[i + 2] = addDuplicate(c, cx, cy, true);
    }

    return {vertices, triangles, uv};
}
