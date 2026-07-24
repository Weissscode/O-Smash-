import React from 'react';

const base = (size, strokeWidth) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
});

export const IconMoney = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 9 }),
  /*#__PURE__*/React.createElement('path', { d: 'M9.5 15.5c0 1 .9 1.5 2.5 1.5s2.5-.6 2.5-1.7c0-1-.8-1.4-2.5-1.8-1.7-.4-2.5-.9-2.5-1.8 0-1 .9-1.7 2.5-1.7s2.5.5 2.5 1.5' }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 7.5v1.2M12 15.3v1.2' })
);

export const IconReceipt = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9 8h6M9 12h6M9 16h4' })
);

export const IconBag = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6 8h12l-1 12H7L6 8z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9 8V6a3 3 0 0 1 6 0v2' })
);

export const IconCash = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 2.5, y: 6.5, width: 19, height: 11, rx: 2 }),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 2.6 })
);

export const IconCard = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 2.5, y: 5, width: 19, height: 14, rx: 2.2 }),
  /*#__PURE__*/React.createElement('path', { d: 'M2.5 10h19' }),
  /*#__PURE__*/React.createElement('path', { d: 'M6 15h4' })
);

export const IconClock = ({ size = 16, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 9 }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 7v5l3.2 2' })
);

export const IconPhone = ({ size = 16, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M5 4h3.2l1.3 4.2-2 1.6a13 13 0 0 0 6.7 6.7l1.6-2 4.2 1.3V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4z' })
);

export const IconClose = ({ size = 20, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6 6l12 12M18 6L6 18' })
);

export const IconChevronLeft = ({ size = 18, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M15 5l-7 7 7 7' })
);

export const IconChevronRight = ({ size = 18, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M9 5l7 7-7 7' })
);

export const IconTrash = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 7h16' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7' }),
  /*#__PURE__*/React.createElement('path', { d: 'M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7' }),
  /*#__PURE__*/React.createElement('path', { d: 'M10 11v6M14 11v6' })
);

export const IconEdit = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 20l.9-3.6L16.4 5a1.5 1.5 0 0 1 2.1 0l1.5 1.5a1.5 1.5 0 0 1 0 2.1L8.5 20 4 20z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M14.5 6.9l2.6 2.6' })
);

export const IconCalendar = ({ size = 16, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 3.5, y: 5, width: 17, height: 15.5, rx: 2 }),
  /*#__PURE__*/React.createElement('path', { d: 'M3.5 9.5h17' }),
  /*#__PURE__*/React.createElement('path', { d: 'M8 3v4M16 3v4' })
);
