/* eslint-disable no-console */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

/** props: mass, value, maximum, minimum, width, height **/

const propTypes = {
  initialRotation: PropTypes.number,
  mass: PropTypes.number,
  display: PropTypes.bool,
  radius: PropTypes.number.isRequired
};

const defaultProps = {
  display: false,
  mass: 200 // mass ~ 1/10 of radius ?
};

// TODO the outer circumference should never rotate faster than the user contact

export default class Dial extends Component {

  constructor(props) {
    super(props);

    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleLeave = this.handleLeave.bind(this);
    this.state = {
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

  render() {
    const { radius } = this.props;
    const diameter = radius * 2;
    const wrapperStyle = {
      width: diameter,
      height: diameter,
      position: 'relative',
      margin: radius / 3 | 0
    };
    const dialStyle = {
      WebkitTransform: 'rotate(' + this.state.rotation + 'deg)',
      width: diameter,
      height:diameter,
      position: 'absolute'
    };

    return (
      <div
        className="wrapper" style={ wrapperStyle }
        onKeyDown={ this.boundHandleKeyDown }
        onKeyUp={ this.boundHandleKeyUp }
      >
        <div
          className="dial"
          onMouseLeave={ this.boundHandleLeave }
          onMouseMove={ this.boundHandleMouseMove }
          onTouchMove={ this.boundHandleTouchMove }
          onTouchEnd={ this.boundHandleLeave }
          ref={ (dial) => { this.dialEl = dial; }}
          style={ dialStyle }
          tabIndex={1}
        />
        <div className="value">{ this.props.display && this.state.rotation | 0 }</div>
      </div>
    );
  }

  handleKeyDown(e) {
    const { keyCode, shiftKey } = e.nativeEvent;

    if (keyCode === 38) {
      this.setState({
        rotation: this.state.rotation + this.arrowInc(shiftKey)
      });
    }

    if (keyCode === 40) {
      this.setState({
        rotation: this.state.rotation - this.arrowInc(shiftKey)
      });
    }
  }

  arrowInc(shiftKey) {
    return shiftKey ? 10 : 1;
  }

  handleLeave() {
    this._values.last = {};
  }

  handleMouseMove(e) {
    e.preventDefault();

    //if (!this.state.active) return;
    this.handleMovement(e.pageX, e.pageY);
  }

  handleTouchMove(e) {
    e.preventDefault();

    //if (!this.state.active) return;
    this.handleMovement(e.touches[0].pageX, e.touches[0].pageY);
  }

  handleMovement(pageX, pageY) {
    const { radius } = this.props;
    const {
      last,
      mass,
      originX,
      originY,
      xy
    } = this._values;
    const eX = pageX - xy[0];
    const eY = pageY - xy[1];

    if (isinsidecircle(eX, eY, radius)) {

      // translate origin, invert y axis
      const hitX = (eX - originX);
      const hitY = -(eY - originY);

      if (last.X) {
        const pf = [last.X, last.Y]; // point of application of force
        const force = [hitX - last.X, hitY - last.Y];
        const a1 = projection(force, pf);
        const a2 = [force[0] - a1[0], force[1] - a1[1]];
        const dir = direction(pf, force);
        const sign = dir && dir / Math.abs(dir);

        this.setState({
          rotation: this.state.rotation + (-sign * ((magnitude(a2) * magnitude(pf)) / mass))
        });
      }

      last.X = hitX;
      last.Y = hitY;
    }
  }
}

Dial.propTypes = propTypes;
Dial.defaultProps = defaultProps;

ReactDOM.render(
  <div>
    <Dial radius={100} />
  </div>,
  document.getElementById('content')
);

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


