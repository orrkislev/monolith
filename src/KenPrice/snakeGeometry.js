import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from 'three';

export class SnakeGeometry extends BufferGeometry {

    constructor(path = new Curves['QuadraticBezierCurve3'](new Vector3(- 1, - 1, 0), new Vector3(- 1, 1, 0), new Vector3(1, 1, 0)), tubularSegments = 64, radiuses = [], radialSegments = 8, closed = false) {

        super();
        this.type = 'TubeGeometry';

        this.parameters = {
            path: path,
            tubularSegments: tubularSegments,
            radiuses: radiuses,
            radialSegments: radialSegments,
            closed: closed
        };

        const frames = path.computeFrenetFrames(tubularSegments, closed);

        // expose internals

        this.tangents = frames.tangents;
        this.normals = frames.normals;
        this.binormals = frames.binormals;

        // helper variables
        Vector3
        const vertex = new Vector3();
        const normal = new Vector3();
        const uv = new Vector2();
        let P = new Vector3();

        // buffer

        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // create buffer data

        generateBufferData();

        // build geometry

        this.setIndex(indices);
        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

        // functions

        function generateBufferData() {

            for (let i = 0; i < tubularSegments; i++) {

                generateSegment(i);

            }

            // if the geometry is not closed, generate the last row of vertices and normals
            // at the regular position on the given path
            //
            // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

            generateSegment((closed === false) ? tubularSegments : 0);

            // uvs are generated in a separate function.
            // this makes it easy compute correct values for closed geometries

            generateUVs();

            // finally create faces

            generateIndices();

        }

        function generateSegment(i) {

            // we use getPointAt to sample evenly distributed points from the given path

            P = path.getPointAt(i / tubularSegments, P);

            const perc = i / tubularSegments;
            const lastRadiusIndex = Math.floor(perc * radiuses.length);
            const nextRadiusIndex = Math.ceil(perc * radiuses.length);
            const lastRadiusPerc = lastRadiusIndex / radiuses.length
            const nextRadiusPerc = nextRadiusIndex / radiuses.length

            const percBetween = (lastRadiusIndex === nextRadiusIndex) ? 0 : (perc - lastRadiusPerc) / (nextRadiusPerc - lastRadiusPerc)
            const lastRadius = radiuses[Math.floor(perc * radiuses.length)];
            const nextRadius = radiuses[Math.ceil(perc * radiuses.length)];
            const radius = lastRadius + (nextRadius - lastRadius) * percBetween;


            // retrieve corresponding normal and binormal

            const N = frames.normals[i];
            const B = frames.binormals[i];

            // generate normals and vertices for the current segment

            for (let j = 0; j <= radialSegments; j++) {

                const v = j / radialSegments * Math.PI * 2;

                const sin = Math.sin(v);
                const cos = - Math.cos(v);

                // normal

                normal.x = (cos * N.x + sin * B.x);
                normal.y = (cos * N.y + sin * B.y);
                normal.z = (cos * N.z + sin * B.z);
                normal.normalize();

                normals.push(normal.x, normal.y, normal.z);

                // vertex

                vertex.x = P.x + radius * normal.x;
                vertex.y = P.y + radius * normal.y;
                vertex.z = P.z + radius * normal.z;

                vertices.push(vertex.x, vertex.y, vertex.z);

            }

        }

        function generateIndices() {

            for (let j = 1; j <= tubularSegments; j++) {

                for (let i = 1; i <= radialSegments; i++) {

                    const a = (radialSegments + 1) * (j - 1) + (i - 1);
                    const b = (radialSegments + 1) * j + (i - 1);
                    const c = (radialSegments + 1) * j + i;
                    const d = (radialSegments + 1) * (j - 1) + i;

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);

                }

            }

        }

        function generateUVs() {

            for (let i = 0; i <= tubularSegments; i++) {

                for (let j = 0; j <= radialSegments; j++) {

                    uv.x = i / tubularSegments;
                    uv.y = j / radialSegments;

                    uvs.push(uv.x, uv.y);

                }

            }

        }

    }

}