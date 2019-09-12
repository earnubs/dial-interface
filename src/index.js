/* eslint-disable no-console */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Worker from './rotation.worker.js';
import PropTypes from 'prop-types';


/** props: value, maximum, minimum, width, height **/

const propTypes = {
  initialRotation: PropTypes.number, // TODO
  display: PropTypes.bool,
  radius: PropTypes.number.isRequired,
  resistance: PropTypes.number.isRequired,
};

const defaultProps = {
  display: true,
};

export default class Dial extends Component {

  constructor(props) {
    super(props);

    this.worker = new Worker();
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleEnter = this.handleEnter.bind(this);
    this.boundHandleLeave = this.handleLeave.bind(this);
    this.state = {
      rotation: 0,
      isActive: false
    };
  }

  componentDidMount() {
    this._values = {
      previous: {},
      offset: getOffset(this.dialEl)
    };

    this.worker.addEventListener('message', event => {
      if (this.state.isActive) {
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
    const { isActive } = this.state;
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
        onClick={ this.boundHandleClick }
        onKeyDown={ this.boundHandleKeyDown }
        onKeyUp={ this.boundHandleKeyUp }
      >
        <div
          className={ `dial${ isActive ? ' isActive' : ''}`}
          onMouseEnter={ this.boundHandleEnter }
          onMouseLeave={ this.boundHandleLeave }
          onMouseMove={ this.boundHandleMouseMove }
          onTouchMove={ this.boundHandleTouchMove }
          onTouchEnd={ this.boundHandleLeave }
          ref={ (dial) => { this.dialEl = dial; }}
          style={ dialStyle }
          tabIndex={1}
        />
        <span className="value">{ this.props.display && this.state.rotation | 0 }</span>
      </div>
    );
  }

  handleClick() {
    //
  }

  handleKeyDown(e) {
    const { keyCode, shiftKey } = e.nativeEvent;

    if (keyCode === 16) {
      this.setState({
        isActive: true
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
        isActive: false
      });
    }
  }

  arrowInc(shiftKey) {
    return shiftKey ? 10 : 1;
  }

  handleEnter() {
    this.dialEl.focus();
  }

  handleLeave() {
    this.dialEl.blur();
    this.setState({
      isActive: false
    });
    this._values.previous = {};
  }

  handleMouseMove(e) {
    e.preventDefault();

    //if (!this.state.isActive) return;
    this.handleMovement(e.pageX, e.pageY);
  }

  handleTouchMove(e) {
    e.preventDefault();

    //if (!this.state.isActive) return;
    this.handleMovement(e.touches[0].pageX, e.touches[0].pageY);
  }

  handleMovement(pageX, pageY) {
    const { radius, resistance } = this.props;
    const {
      previous,
      offset
    } = this._values;

    this.worker.postMessage(JSON.stringify({
      radius,
      resistance,
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
    <Dial radius={40} resistance={75} />
    <Dial radius={40} resistance={150} />
    <Dial radius={40} resistance={10} />
    <Dial radius={40} resistance={300} />
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


