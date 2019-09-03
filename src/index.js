/* eslint-disable no-console */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Worker from './rotation.worker.js';


/** props: value, maximum, minimum, width, height **/

const propTypes = {
  initialRotation: PropTypes.number,
  display: PropTypes.bool,
  radius: PropTypes.number.isRequired
};

const defaultProps = {
  display: true,
};

export default class Dial extends Component {

  constructor(props) {
    super(props);

    this.worker = new Worker();
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleLeave = this.handleLeave.bind(this);
    this.state = {
      rotation: 0,
      active: false
    };
  }

  componentDidMount() {
    this._values = {
      previous: {},
      offset: getOffset(this.dialEl)
    };

    this.worker.addEventListener('message', event => {
      if (this.state.active) {
        const { degrees, hit } = JSON.parse(event.data);
        this.setState({
          rotation: this.state.rotation + degrees,
        });
        this._values.previous.X = hit[0];
        this._values.previous.Y = hit[1];
      }
    });
  }

  render() {
    const { radius } = this.props;
    const diameter = radius * 2;
    const wrapperStyle = {
      width: diameter,
      height: diameter,
      position: 'relative',
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

    if (keyCode === 16) {
      this.setState({
        active: true
      });
    }

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

  handleKeyUp(e) {
    const { keyCode } = e.nativeEvent;

    if (keyCode === 16) {
      this.setState({
        active: false
      });
      this._values.previous = {};
    }
  }

  arrowInc(shiftKey) {
    return shiftKey ? 10 : 1;
  }

  handleLeave() {
    this._values.previous = {};
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
      previous,
      offset
    } = this._values;

    this.worker.postMessage(JSON.stringify({
      radius,
      offset,
      page: [pageX, pageY], // cursor, pointer or touch
      previous
    }));
  }
}

Dial.propTypes = propTypes;
Dial.defaultProps = defaultProps;

ReactDOM.render(
  <div>
    <Dial radius={80} />
    <Dial radius={80} />
    <Dial radius={80} />
    <Dial radius={80} />
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


