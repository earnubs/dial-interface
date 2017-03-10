import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class Dial extends Component {

  constructor(props) {
    super(props);

    this.boundHandleDrag = this.handleDrag.bind(this);
    this.state = { rotation: 0 };

  }

  componentDidMount() {
    const width =  this.dialEl.offsetWidth;
    const height = this.dialEl.offsetHeight;

    //console.log(getOffset(this.dialEl)); // eslint-disable-line no-console

    this._values = {
      rotation: 0,
      last: {},
      mass: 500,
      originX: width / 2,
      originY: height / 2,
      xy: getOffset(this.dialEl) // getXY
    };

    //console.log(this._values); // eslint-disable-line no-console

    // https://yuilibrary.com/yui/docs/api/files/dom_js_dom-screen.js.html#l109
  }

  render() {

    //console.log(this.state); // eslint-disable-line no-console

    const dialStyle = {
      WebkitTransform: 'rotate(' + this.state.rotation + 'deg)'
    };

    return <div className="wrapper">
      <div
        className="dial"
        ref={ (dial) => { this.dialEl = dial; }}
        onMouseMove={ this.boundHandleDrag }
        style={ dialStyle }
      >
      </div>
    </div>;
  }

  handleDrag(e) {
    e.preventDefault();

    const {
      last,
      mass,
      originX,
      originY,
      xy
    } = this._values;

    e.pageX = e.pageX || e.touches[0].pageX;
    e.pageY = e.pageY || e.touches[0].pageY;

    const eX = e.pageX - xy[0];
    const eY = e.pageY - xy[1];

    if (isinsidecircle(eX, eY)) {

      // translate origin, invert y axis
      const hitX = (eX - originX);
      const hitY = -(eY - originY);

      // check if last is defined,
      //if not return function without this if?
      if (last.X) {


        // a and b are vectors
        const radius = [last.X, last.Y];
        const force = [hitX - last.X, hitY - last.Y];

        const r = magnitude(radius);

        const a1 = projection(force, radius);
        const a2 = [force[0] - a1[0], force[1] - a1[1]];

        const dir = direction(radius, force);
        const sign = dir && dir / Math.abs(dir);

        this._values.rotation += ((sign * -1) * ((magnitude(a2) * r) / mass));

        //console.log(this._values.rotation); // eslint-disable-line no-console

        this.setState({
          rotation: this._values.rotation
        });

        /**
        dial.setStyles({
          'webkitTransform': 'rotate(' + rotation + 'deg)',
          'transform': 'rotate(' + rotation + 'deg)'
        });

        viewer.setStyles({
          'webkitTransform': 'rotate(' + rotation + 'deg)',
          'transform': 'rotate(' + rotation + 'deg)'
        });
        **/

      }


      last.X = hitX;
      last.Y = hitY;
    }

  }

}

ReactDOM.render(<Dial />, document.getElementById('content'));

function getOffset(el) {
  el = el.getBoundingClientRect();

  return [
    el.left + window.scrollX,
    el.top + window.scrollY
  ];
}

function dotproduct(a, b) {
  let n = 0;
  const lim = Math.min(a.length, b.length);

  for (let i = 0; i < lim; i++) n += a[i] * b[i];

  return n;
}

function magnitude(a) {
  //return Math.sqrt(radius[0]*radius[0]+radius[1]*radius[1]);
  let n = 0;
  const lim = a.length;

  for (let i = 0; i < lim; i++) n += a[i] * a[i];

  return Math.sqrt(n);
}

function projection(u, v) {
  // u on v
  const f = dotproduct(u, v) / dotproduct(v, v);

  return [(v[0] * f), (v[1] * f)];
}

function direction(u, v) {
  return (u[0] * v[1]) - (u[1] * v[0]);
}

/**
function anglebetweenvectors(a, b) {
  return Math.acos(
    dotproduct(a, b) / (magnitude(a) * magnitude(b))) * (180 / Math.PI);
}
**/

function isinsidecircle(x, y) {
  const cx = 150;
  const cy = 150;
  const radius = 150;
  const a = ((x - cx) * (x - cx)) + ((y - cy) * (y - cy));
  const b = (radius * radius);

  return (a < b);
}

/**
function degminsec(deg) {
  const degInt = deg | 0;
  const min = 60 * (deg - degInt);
  const minInt = min | 0;
  const sec = 60 * (min - minInt);

  return [degInt, minInt, sec];
}
**/


