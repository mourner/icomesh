
import test from 'tape';
import icomesh from './index.js';

test('icomesh 0', (t) => {
    const {vertices, triangles} = icomesh(0);
    const x = 0.525731086730957;
    const y = 0.8506507873535156;

    t.same(vertices, [
        -x, y, 0, x, y, 0, -x, -y, 0, x, -y, 0, 0, -x, y, 0, x, y,
        0, -x, -y, 0, x, -y, y, 0, -x, y, 0, x, -y, 0, -x, -y, 0, x
    ]);
    t.ok(triangles instanceof Uint16Array);

    t.same(triangles, [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 11, 10, 2,
        5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6, 3, 9, 4, 3, 4, 2,
        3, 2, 6, 3, 6, 8, 3, 8, 9, 9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7
    ]);
    t.ok(vertices instanceof Float32Array);

    t.end();
});

const unitSphereArea = Math.PI * 4;

for (let k = 1; k <= 8; k++) {
    test(`icomesh ${k}`, (t) => {
        const {vertices, triangles} = icomesh(k);

        const T = Math.pow(4, k);
        t.equal(vertices.length / 3, 10 * T + 2);
        t.equal(triangles.length / 3, 20 * T);

        let totalArea = 0;
        for (let i = 0; i < triangles.length; i += 3) {
            const a = 3 * triangles[i + 0];
            const b = 3 * triangles[i + 1];
            const c = 3 * triangles[i + 2];
            const abx = vertices[b + 0] - vertices[a + 0];
            const aby = vertices[b + 1] - vertices[a + 1];
            const abz = vertices[b + 2] - vertices[a + 2];
            const acx = vertices[c + 0] - vertices[a + 0];
            const acy = vertices[c + 1] - vertices[a + 1];
            const acz = vertices[c + 2] - vertices[a + 2];
            totalArea += Math.hypot(aby * acz - abz * acy, abz * acx - abx * acz, abx * acy - aby * acx) / 2;
        }
        t.ok(totalArea < unitSphereArea);
        t.ok(totalArea / unitSphereArea > k === 1 ? 0.92 : k === 2 ? 0.98 : 0.99);

        t.end();
    });
}
