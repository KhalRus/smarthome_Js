import React from 'react';

function BurgerButton(props) {
  let cssStr = 'burgButton';
  if (props.curr == props.num) {
    cssStr = 'burgButton burgActive';
  }

  return <a className={cssStr} onClick={() => props.func(+props.num)}>{props.title}</a>;
}

export default BurgerButton;