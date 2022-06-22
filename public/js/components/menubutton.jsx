import React from 'react';

function MenuButton(props) {
  let cssStr = 'button';
  if (props.curr == props.num) {
    cssStr = 'button active';
  }

  return <a className={cssStr} onClick={() => props.func(+props.num)}>{props.title}</a>;
}

export default MenuButton;