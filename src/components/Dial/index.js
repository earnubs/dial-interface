/* eslint-disable no-console */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Dial.css';

const ROTATION_MAX = 360;
const ROTATION_MIN = 0;
const INCREMENT_SMALL = 1;
const INCREMENT_LARGE = 10;
const FILL_RED = '#ea613d';
const FILL_WHITE = '#8dd5d1';

/** props: value, maximum, minimum, width, height **/

const propTypes = {
  initialRotation: PropTypes.number,
  display: PropTypes.bool,
  radius: PropTypes.number.isRequired,
  resistance: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  display: true,
  resistance: 25
};

function draw(ctx, rotation) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(width/2 + 0.5, height/2 + 0.5);

  let d = ~~(rotation / 5);
  for (let i = 0; i <= d; i++) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(width/2 + 0.5, height/2 + 0.5);
    ctx.rotate(Math.PI / 180 * i * 5);
    drawMarker(ctx);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(width/2 + 0.5, height/2 + 0.5);
  ctx.rotate(Math.PI / 180 * rotation);
  drawMarker(ctx, true);
  /**
  ctx.moveTo(0,-50);
  ctx.lineTo(0,-70);
  ctx.translate(-width/2 + 0.5, -height/2 + 0.5);
  ctx.stroke();
   **/
  ctx.translate(-width/2, -height/2);
}

function drawMarker(ctx, highlight) {
  ctx.beginPath();
  if (highlight) {
    ctx.fillStyle = FILL_RED;
    ctx.rect(-2, -70, 4, 12);
  } else {
    ctx.fillStyle = FILL_WHITE;
    ctx.rect(-1, -70, 2, 10);
  }
  ctx.fill();
}

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

export default class Dial extends Component {

  constructor(props) {
    super(props);

    this.worker = new Worker('../../rotation.worker.js', { type: 'module'});
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleEnter = this.handleEnter.bind(this);
    this.boundHandleLeave = this.handleLeave.bind(this);
    this.state = {
      rotation: props.initialRotation,
      isActive: isTouchDevice,
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
          rotation: Math.ceil(Math.min(
            Math.max(this.state.rotation + degrees, ROTATION_MIN),
            ROTATION_MAX
          ))
        });
        this._values.previous.X = hit[0];
        this._values.previous.Y = hit[1];
      }
    });

    const ctx = this.ctx = this.canvasEl.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
    drawMarker(ctx);

    draw(ctx, this.state.rotation);
  }

  shouldComponentUpdate(nextProps, { rotation, isActive }) {
    if (this.state.rotation !== rotation) {
      this.props.onChange(rotation);
      draw(this.ctx, rotation);
    }

    if (this.state.isActive !== isActive ) {
      return true;
    }
    
    return false;
  }

  render() {
    const { radius } = this.props;
    const { isActive } = this.state;
    const diameter = radius * 2;
    const wrapperStyle = {
      width: diameter,
      height: diameter,
      position: 'relative',
      display: 'block',
      margin: 10,
    };
    const dialStyle = {
      //WebkitTransform: 'rotate(' + this.state.rotation + 'deg)',
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
        tabIndex={0}
      >
        <div
          className={ `Dial${ isActive ? ' Dial--isActive' : ''}`}
          onMouseEnter={ this.boundHandleEnter }
          onMouseLeave={ this.boundHandleLeave }
          onMouseMove={ this.boundHandleMouseMove }
          onTouchMove={ this.boundHandleTouchMove }
          onTouchEnd={ this.boundHandleLeave }
          ref={ el => { this.dialEl = el; }}
          style={ dialStyle }
          tabIndex={1}
        />
        <canvas
          width={diameter * 2}
          height={diameter * 2}
          style={{
            width: diameter,
            height: diameter,
            position: 'absolute',
          }}
          ref={ el => { this.canvasEl = el; }}
        />
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
      this.setState(state => {
        return {
          rotation: Math.min(
            state.rotation + this.arrowInc(shiftKey),
            ROTATION_MAX
          )
        };
      });
    }

    if (keyCode === 40) {
      this.setState(state => {
        return {
          rotation: Math.max(
            state.rotation - this.arrowInc(shiftKey),
            ROTATION_MIN
          )
        };
      });
    }
  }

  handleKeyUp(e) {
    const { keyCode } = e.nativeEvent;

    if (keyCode === 16) {
      this.setState({
        isActive: false
      });
      this._values.previous = {};
    }
  }

  arrowInc(shiftKey) {
    return shiftKey ? INCREMENT_LARGE : INCREMENT_SMALL;
  }

  handleEnter() {
    this.dialEl.focus();
  }

  handleLeave() {
    this.dialEl.blur();
    isTouchDevice || this.setState({
      isActive: false
    });
    this._values.previous = {};
  }

  handleMouseMove(e) {
    //if (!this.state.isActive) return;
    this.handleMovement(e.pageX, e.pageY);
  }

  handleTouchMove(e) {
    this.handleMovement(e.touches[0].clientX, e.touches[0].clientY);
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

  isWithinLimits(rotation) {
    return !((rotation > 360) || (rotation < 0));
  }
}

Dial.propTypes = propTypes;
Dial.defaultProps = defaultProps;

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
