import React, { useEffect, useRef } from 'react';

const Canvas =  (props) => {
  const canvas = useRef(null)
  useEffect(() => {
    if (props.peaks) {
      draw(JSON.parse(props.peaks));
    }
  },[])
 

  const draw = (peaks) => {
    let ctx = canvas.current.getContext('2d');
    if(!props.classV){
      ctx.fillStyle = '#333333';
    }else{
      ctx.fillStyle = '#fff';
    }
    peaks.forEach((peak) => {
      ctx.fillRect(...peak)
    });
  }

    return (
      <canvas  height="100" ref={ canvas }
        className={props.classV}></canvas>
    )
}

export default Canvas