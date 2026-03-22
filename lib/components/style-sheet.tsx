import React from 'react';

import type {StyleSheetProps} from '../../typings/hyper';

const StyleSheet = ({ref, ...props}: StyleSheetProps & {ref?: React.Ref<HTMLStyleElement>}) => {
  const {borderColor} = props;

  return (
    <style jsx global ref={ref}>{`
      ::-webkit-scrollbar {
        width: 5px;
      }
      ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        background: ${borderColor};
      }
      ::-webkit-scrollbar-thumb:window-inactive {
        background: ${borderColor};
      }
    `}</style>
  );
};

StyleSheet.displayName = 'StyleSheet';

export default StyleSheet;
