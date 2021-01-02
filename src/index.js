/* eslint-disable no-console */
import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import Dial from "./components/Dial";
import Panel from "./components/Panel";
//import Cube from './components/Cube';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

const random = () => Math.floor(Math.random() * Math.random() * 360);

const DialAndDisplay = styled.div`
  position: relative;
`;

const Display = styled.div`
  position: absolute;
  width: 40px;
  height: 16px;
  margin: -8px 0 0 -20px;
  top: 50%;
  left: 50%;
  z-index: 0;
  line-height: 16px;
  text-align: center;
  font-size: 16px;
  color: #f6ffcb;
  font-family: "Blender Pro", sans-serif;
  font-weight: 400;
  pointer-events: none;
`;

const DialWithOutput = props => {
  const [value, setValue] = useState(props.initialRotation);

  const changeHandler = value => {
    setValue(value)
  }

  return (
    <DialAndDisplay>
    <Dial {...props} onChange={changeHandler} />
    <Display>{value}</Display>
    </DialAndDisplay>
  )
}

ReactDOM.render(
  <Wrapper>
    {Array(9)
      .fill(0)
      .map((_, i) => (
        <Panel key={i}>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <DialWithOutput
                key={i}
                radius={40}
                initialRotation={random()}
              />
            ))}
        </Panel>
      ))}
  </Wrapper>,
  document.getElementById("root")
);
