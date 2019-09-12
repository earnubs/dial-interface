/* eslint-env worker */
onmessage = event => {
  const { data } = event;
  const { radius, resistance, offset, page, previous } = JSON.parse(data);
  const rotation = getRotation(radius, resistance, offset, page, previous);
  if (rotation) {
    postMessage(JSON.stringify(rotation));
  }
};

/**
 * TODO some of these are double precision floating point numbers
 * @param {Number} radius the radius of the dial itself
 * @param {Array.number} page x and y coordinates of pointer on page
 * @param {Array.number} client x and y coordinates of bounding client rectangle (window.getBoundingClientRect())
 * @param {Array.number} scroll x and y coordinates of scroll position
 */
export const getRotation = (radius, resistance, offset, page, previous) => {
  let degrees = null;

  const x = page[0] - offset[0];
  const y = page[1] - offset[1];

  let hit = [ x - radius, -(y - radius) ];

  if (isInsideCirc(x, y, radius)) {
    if (previous.X) {
      const pf = [previous.X, previous.Y];
      const force = [hit[0] - previous.X, hit[1] - previous.Y];
      const a1 = projection(force, pf);
      const a2 = [force[0] - a1[0], force[1] - a1[1]];
      const dir = direction(pf, force);
      const sign = dir && dir / Math.abs(dir);
      degrees = (-sign * (magnitude(a2) * magnitude(pf) / resistance));
    }

    return {
      degrees,
      hit
    };
  }

  return null;
};

export const isInsideCirc = (x, y, radius) => {
  const d = Math.pow(x - radius, 2) + Math.pow(y - radius, 2);
  const r = Math.pow(radius, 2);

  return (d <= r);
};

export const dotproduct = (a, b) => {
  let n = 0;
  const lim = Math.min(a.length, b.length);

  for (let i = 0; i < lim; i++) n += a[i] * b[i];

  return n;
};

export const magnitude = vector => {
  return Math.sqrt(vector.reduce((ac, r) => ac + (r * r), 0));
};

export const projection = (u, v) => {
  // u on v
  const f = dotproduct(u, v) / dotproduct(v, v);

  return [(v[0] * f), (v[1] * f)];
};

export const direction = (u, v) => {
  return (u[0] * v[1]) - (u[1] * v[0]);
};
