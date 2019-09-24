
import icomesh from './index.js';
import {performance} from 'perf_hooks';

for (let i = 0; i <= 10; i++) {
    const now = performance.now();
    const {vertices, triangles} = icomesh(i);
    const ms = (performance.now() - now).toLocaleString();
    const v = vertices.length / 3;
    const t = triangles.length / 3;
    console.log(`Generated ${i}-order icosphere (${v} vertices / ${t} triangles) in ${ms}ms.`);
}
