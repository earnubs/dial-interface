/* eslint-disable no-console */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

/** props: mass, value, maximum, minimum, width, height **/

export default class Dial extends Component {

  constructor(props) {
    super(props);

    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleDrag = this.handleDrag.bind(this);
    this.boundHandleLeave = this.handleLeave.bind(this);
    this.state = {
      active: false,
      rotation: 0
    };

  }

  componentDidMount() {
    const { mass, radius } = this.props;

    this._values = {
      last: {},
      mass,
      originX: radius,
      originY: radius,
      xy: getOffset(this.dialEl)
    };
  }

  /**
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.active;
  }
   **/

  render() {
    const { radius } = this.props;
    const dialStyle = {
      WebkitTransform: 'rotate(' + this.state.rotation + 'deg)',
      width: radius * 2,
      height: radius * 2
    };

    return <div className="wrapper" onKeyDown={ this.boundHandleKeyDown } onKeyUp={ this.boundHandleKeyUp } >
      <div
        tabIndex={1}
        className="dial"
        onMouseLeave={ this.boundHandleLeave }
        onMouseMove={ this.boundHandleDrag }
        ref={ (dial) => { this.dialEl = dial; }}
        style={ dialStyle }
      />
      <div className="value">{ this.state.rotation | 0 }</div>
    </div>;
  }

  handleKeyDown(e) {
    this.setState({
      active: e.nativeEvent.shiftKey
    });
  }

  handleKeyUp(e) {
    this.setState({
      active: e.nativeEvent.shiftKey
    });
  }

  handleLeave() {
    this._values.last = {};
  }

  handleDrag(e) {
    e.preventDefault();

    if (!this.state.active) return;

    const { radius } = this.props;
    const {
      last,
      mass,
      originX,
      originY,
      xy
    } = this._values;
    const eX = e.pageX - xy[0];
    const eY = e.pageY - xy[1];

    if (isinsidecircle(eX, eY, radius)) {

      // translate origin, invert y axis
      const hitX = (eX - originX);
      const hitY = -(eY - originY);

      if (last.X) {
        const radius = [last.X, last.Y];
        const force = [hitX - last.X, hitY - last.Y];
        const a1 = projection(force, radius);
        const a2 = [force[0] - a1[0], force[1] - a1[1]];
        const dir = direction(radius, force);
        const sign = dir && dir / Math.abs(dir);

        this.setState({
          rotation: this.state.rotation + ((sign * -1) * ((magnitude(a2) * magnitude(radius)) / mass))
        });
      }

      last.X = hitX;
      last.Y = hitY;
    }
  }
}

Dial.defaultProps = {
  mass: 200
};

Dial.propTypes = {
  mass: PropTypes.number,
  radius: PropTypes.number,
  initialRotation: PropTypes.number
};

ReactDOM.render(
  <div>
    <Dial radius={100} />
    <Dial radius={100} />
    <Dial radius={100} />
    <Dial radius={100} />
    <Dial radius={100} />
  </div>,
  document.getElementById('content'));

export function getOffset(el) {
  el = el.getBoundingClientRect();

  return [
    el.left + window.scrollX,
    el.top + window.scrollY
  ];
}

export function isinsidecircle(x, y, c) {
  const d = Math.pow(x - c, 2) + Math.pow(y - c, 2);
  const r = Math.pow(c, 2);

  return (d <= r);
}

export function dotproduct(a, b) {
  let n = 0;
  const lim = Math.min(a.length, b.length);

  for (let i = 0; i < lim; i++) n += a[i] * b[i];

  return n;
}

export function magnitude(a) {
  //return Math.sqrt(radius[0]*radius[0]+radius[1]*radius[1]);
  let n = 0;
  const lim = a.length;

  for (let i = 0; i < lim; i++) n += a[i] * a[i];

  return Math.sqrt(n);
}

export function projection(u, v) {
  // u on v
  const f = dotproduct(u, v) / dotproduct(v, v);

  return [(v[0] * f), (v[1] * f)];
}

export function direction(u, v) {
  return (u[0] * v[1]) - (u[1] * v[0]);
}

/**
function anglebetweenvectors(a, b) {
  return Math.acos(
    dotproduct(a, b) / (magnitude(a) * magnitude(b))) * (180 / Math.PI);
}

function degminsec(deg) {
  const degInt = deg | 0;
  const min = 60 * (deg - degInt);
  const minInt = min | 0;
  const sec = 60 * (min - minInt);

  return [degInt, minInt, sec];
}
**/


