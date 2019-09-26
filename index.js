export default function icomesh(frequency = 20) {

    if (frequency > 1000000) throw new Error(`Max frequency is 1000000, but given ${frequency}.`);


  let t, v, v3, vertices, triangles, faces, faceCount;

  if (true) {

    // set up an icosahedron (12 vertices / 20 triangles)
    faceCount = 20;
    const f = (1 + Math.sqrt(5)) / 2;
    //const T = Math.pow(4, order);

    //const vertices = new Float32Array((10 * T + 2) * 3);
    vertices = new Float32Array(faceCount * frequency * frequency * 6);
    vertices.set(Float32Array.of(
        -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, 0,
        0, -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f,
        f, 0, -1, f, 0, 1, -f, 0, -1, -f, 0, 1
    ));

    triangles = new Uint16Array(faceCount * frequency * frequency * 3);

    // Faces of the original polyhedron
    faces = Uint16Array.of(
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7
    );

    v = 20; // Number of vertices
    v3 = v * 3; // Number of vertex coords
    t = 0; // Number of triangle vertices (triangle count is t/3)

  } else {

    // set up a tetrahedron
    faceCount = 4;
    const f = 1 / Math.SQRT2;
    vertices = new Float32Array(faceCount * frequency * frequency * 6);
    vertices.set(Float32Array.of(
      0, -1, f,    0, 1, f,   1, 0, -f,   -1, 0, -f
    //  0, 0, 0.2,    0, 1, 0.2,     1, 0, 0.2
    ));
    //let v = 4 * 3;
    v = 4; // Number of vertices
    v3 = v * 3; // Number of vertex coordinates

    triangles = new Uint16Array(faceCount * frequency * frequency * 3);
    t = 0; // Number of triangle vertices (triangle count is t/3)

    // Faces of the original polyhedron
    faces = Uint16Array.of(
      0, 1, 2,  0, 1, 3,   0, 3, 2,   1, 2, 3
    );
  }



    // TODO: Create a Map of triangle ID to edge IDs (edge ID being cantor pair of vertex ID)
    // TODO: Split edges

    function cantorPair(a, b) {
      return Math.floor(((a + b) * (a + b + 1) / 2) + a);
    }

    for (let face=0; face < faceCount; face++) {
      // Inner vertices
      const trigOffset = face * 3;
      const ax = vertices[faces[trigOffset + 0]*3 + 0];
      const ay = vertices[faces[trigOffset + 0]*3 + 1];
      const az = vertices[faces[trigOffset + 0]*3 + 2];
      const bx = vertices[faces[trigOffset + 1]*3 + 0];
      const by = vertices[faces[trigOffset + 1]*3 + 1];
      const bz = vertices[faces[trigOffset + 1]*3 + 2];
      const cx = vertices[faces[trigOffset + 2]*3 + 0];
      const cy = vertices[faces[trigOffset + 2]*3 + 1];
      const cz = vertices[faces[trigOffset + 2]*3 + 2];
      let ve = v;
      let tempx, tempy, tempz;


      //if (!(face)) // DEBUG
      for (let x=1; x < frequency - 1; x++) {
        const yt = x + 1;
        for (let y=1; y < yt; y++) {
          // See https://codeplea.com/triangular-interpolation

          // Using distance to point, as we're dealing with equilaterals
          const weightB = (frequency - x - 1) / (frequency);
          const weightC = (y) / (frequency);
          const weightA = 1 - weightC - weightB;

          //const vertexIndex = v3 + cantorPair(x-1, y-1) * 3;
          //const vertexIndex = v3;

          //console.log(`New vertex, x ${x} y ${y} idx ${ve} coord idx ${v3},${v3+1},${v3+2}`);
          vertices[v3++] = tempx = ((ax * weightA + bx * weightB + cx * weightC));
          vertices[v3++] = tempy = ((ay * weightA + by * weightB + cy * weightC));
          vertices[v3++] = tempz = ((az * weightA + bz * weightB + cz * weightC));
          //console.log({/*vertexIndex,*/ x, y, ve, tempx, tempy, tempz, weightA, weightB, weightC/*ax, ay, az, bx, by, bz, cx, cy, cz*/});
          ve++;
        }
      }


      // Debug triangle, original face
      /*
      triangles[t++] = faces[trigOffset + 0];
      triangles[t++] = faces[trigOffset + 1];
      triangles[t++] = faces[trigOffset + 2];
      */

      // Triangles
      //if (!(face)) // DEBUG
      for (let x=0; x < frequency; x++) {
        const yt = frequency - x;
        for (let y=0; y < yt; y++) {

          // "downward" triangles, in the reverse orientation than the original
          if (x === 0 || y === 0 || (x + y + 1) >= frequency) {
             /// TODO: lookup vertex (or calculate with edge ID and offsets)
             /// TODO: Make a conditional for each vertex, lookup each vertex individually
           } else {
             // console.log("new triangle: ", v + cantorPair(x-1, y-1), v + cantorPair(x, y-1), v + cantorPair(x-1, y));
             // TODO: Can this be done without invoking cantor's pairing function, but
             // by keeping track of the indices in accumulators instead? i.e.
             // count the number of non-edge vertices this loop has iterated through
             // like "if (x!==0) accx++"
             triangles[t++] = v + cantorPair(x-1, y-1);
             triangles[t++] = v + cantorPair(x, y-1);
             triangles[t++] = v + cantorPair(x-1, y);
           }

          // "downward" triangles, in the reverse orientation than the original
          if (x === 0 || y === 0 || (x + y + 2) >= frequency) {
            /// TODO: lookup vertex (or calculate with edge ID and offsets)
            /// TODO: Make a conditional for each vertex, lookup each vertex individually
            /// TODO: do not lookup anything if x + y + 1 >= freq, that'd be out-of-bounds
          } else {
             //console.log("new triangle: ", v + cantorPair(x-1, y-1), v + cantorPair(x, y-1), v + cantorPair(x-1, y));

             triangles[t++] = v + cantorPair(x, y);
             triangles[t++] = v + cantorPair(x-1, y);
             triangles[t++] = v + cantorPair(x, y-1);
          }
        }
      }

      // Reset vertex offset for next face
      v = ve;
      v3 = v * 3; // Shouldn't be needed
      //console.log(`Face ended ${v} vertices & ${t/3} trigs`);
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

  //console.log({ vertices: vertices.slice(0, v3), triangles: triangles.slice(0, t)}, v3, t, vertices.length, triangles.length);
  console.log({ verticesCount: v, triangleCount: t/3, verticesLength: vertices.length / 3, trianglesLength: triangles.length / 3 });
  /// FIXME: calculate the number of final vertices and triangles beforehand, and init the arrays with the right size.
  // Right now I suck at math.
  //return {vertices, triangles};
  return { vertices: vertices.subarray(0, v3), triangles: triangles.subarray(0, t)};
}
