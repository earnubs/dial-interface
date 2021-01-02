import React from 'react';
import PropTypes from 'prop-types';
import './Panel.css';

if (CSS && CSS.paintWorklet) {
  CSS.paintWorklet.addModule('./paint.worklet.js');
} else {
  console.log(`No CSS painter workers for you ${navigator.userAgent}`);
}

function Panel({ children }) {
  return (
    <div className="Panel">
      { children }
    </div>
  );
}

Panel.defaultProps = {};

Panel.propTypes = {
  children: PropTypes.node
};

export default Panel;
