import React from "react";
import styled, { css } from "styled-components";

const Scene = styled.div`
  width: 100px;
  height: 100px;
  perspective: 600px;
`;
const Cube = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 1s;
  transform: ${(props) =>
    `translateZ(50px) rotateX(${props.x}deg) rotateY(${props.y}deg)`};
`;
const CubeFace = styled.div`
  border: 1px solid #8dd5d1;
  position: absolute;
  width: 100px;
  height: 100px;
  transform: ${(props) =>
    `rotate${props.axis.toUpperCase()}(${
      props.rotation
    }deg) translateZ(50px)`};
`;

export default (props) => {
  return (
    <Scene>
      <Cube {...props}>
        <CubeFace axis="y" rotation={0} />
        <CubeFace axis="y" rotation={90} />
        <CubeFace axis="y" rotation={180} />
        <CubeFace axis="y" rotation={-90} />
        <CubeFace axis="x" rotation={90} />
        <CubeFace axis="x" rotation={-90} />
      </Cube>
    </Scene>
  );
};
