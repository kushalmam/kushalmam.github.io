const WatercolorBackground = () => (
  <svg
    className="watercolor-background"
    aria-hidden="true"
    focusable="false"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1600 1000"
  >
    <defs>
      <filter id="watercolor-rose-edge" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.035" numOctaves="3" seed="17" result="roseNoise" />
        <feDisplacementMap in="SourceGraphic" in2="roseNoise" scale="46" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="watercolor-blue-edge" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.024" numOctaves="4" seed="28" result="blueNoise" />
        <feDisplacementMap in="SourceGraphic" in2="blueNoise" scale="38" xChannelSelector="B" yChannelSelector="R" />
      </filter>
      <filter id="watercolor-sage-edge" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.028" numOctaves="3" seed="41" result="sageNoise" />
        <feDisplacementMap in="SourceGraphic" in2="sageNoise" scale="42" xChannelSelector="G" yChannelSelector="B" />
      </filter>
      <filter id="watercolor-granulation" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.12" numOctaves="3" seed="8" result="grain" />
        <feColorMatrix in="grain" type="saturate" values="0" result="greyGrain" />
        <feComposite in="SourceGraphic" in2="greyGrain" operator="in" />
      </filter>
      <linearGradient id="watercolor-rose-pool" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#bf7f84" stopOpacity="0.58" />
        <stop offset="0.46" stopColor="#d59b9c" stopOpacity="0.35" />
        <stop offset="1" stopColor="#d7a38c" stopOpacity="0.02" />
      </linearGradient>
      <linearGradient id="watercolor-blue-pool" x1="0" x2="1" y1="1" y2="0">
        <stop offset="0" stopColor="#779fb0" stopOpacity="0.46" />
        <stop offset="0.55" stopColor="#adc6cf" stopOpacity="0.23" />
        <stop offset="1" stopColor="#d4deda" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="watercolor-sage-pool" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#829f87" stopOpacity="0.44" />
        <stop offset="0.52" stopColor="#b7c6a6" stopOpacity="0.22" />
        <stop offset="1" stopColor="#dbe0c7" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="watercolor-lilac-pool" cx="50%" cy="50%" r="58%">
        <stop offset="0" stopColor="#a896b2" stopOpacity="0.17" />
        <stop offset="1" stopColor="#cbb9c9" stopOpacity="0" />
      </radialGradient>
    </defs>

    <g style={{ mixBlendMode: "multiply" }}>
      <path d="M-260 -120 H806 C746 21 830 119 757 202 C684 284 557 360 412 402 C233 453 55 408 -260 312Z" fill="url(#watercolor-blue-pool)" filter="url(#watercolor-blue-edge)" />
      <path d="M-260 -72 H674 C629 34 712 121 645 184 C570 256 451 311 296 337 C113 367 -71 334 -260 254Z" fill="#72a4ba" fillOpacity="0.12" filter="url(#watercolor-blue-edge)" />
      <path d="M835 -150 H1810 V439 C1647 447 1506 401 1376 333 C1261 273 1148 224 1017 213 C914 203 875 139 835 -150Z" fill="url(#watercolor-rose-pool)" filter="url(#watercolor-rose-edge)" />
      <path d="M1015 -105 H1810 V353 C1654 368 1540 329 1402 266 C1277 210 1184 170 1079 167 C1035 134 1017 57 1015 -105Z" fill="#b96771" fillOpacity="0.13" filter="url(#watercolor-rose-edge)" />
      <path d="M537 1150 H1810 V533 C1651 548 1514 612 1370 697 C1246 770 1104 864 937 900 C774 936 633 881 537 796Z" fill="url(#watercolor-sage-pool)" filter="url(#watercolor-sage-edge)" />
      <path d="M695 1150 H1810 V629 C1648 642 1528 705 1389 780 C1267 845 1155 902 1013 920 C867 938 755 896 695 842Z" fill="#6d9278" fillOpacity="0.12" filter="url(#watercolor-sage-edge)" />
      <path d="M-220 1150 V714 C3 636 168 663 295 762 C411 851 474 957 620 1150Z" fill="url(#watercolor-lilac-pool)" filter="url(#watercolor-rose-edge)" />
    </g>

    <g fill="none" strokeLinecap="round" style={{ mixBlendMode: "multiply" }}>
      <path d="M-18 270 C122 334 272 359 408 331 C505 311 589 261 668 184" stroke="#507e92" strokeDasharray="120 44 66 72" strokeOpacity="0.13" strokeWidth="7" filter="url(#watercolor-blue-edge)" />
      <path d="M1035 196 C1172 200 1289 265 1412 326 C1528 384 1645 404 1750 379" stroke="#9d5964" strokeDasharray="150 56 74 55" strokeOpacity="0.13" strokeWidth="7" filter="url(#watercolor-rose-edge)" />
      <path d="M680 839 C833 907 980 917 1111 870 C1279 808 1414 663 1641 585" stroke="#5e836a" strokeDasharray="132 55 68 71" strokeOpacity="0.12" strokeWidth="8" filter="url(#watercolor-sage-edge)" />
    </g>

    <g opacity="0.12" filter="url(#watercolor-granulation)" style={{ mixBlendMode: "multiply" }}>
      <path d="M-260 -120 H806 C746 21 830 119 757 202 C684 284 557 360 412 402 C233 453 55 408 -260 312Z" fill="#587b88" />
      <path d="M835 -150 H1810 V439 C1647 447 1506 401 1376 333 C1261 273 1148 224 1017 213 C914 203 875 139 835 -150Z" fill="#9b5960" />
      <path d="M537 1150 H1810 V533 C1651 548 1514 612 1370 697 C1246 770 1104 864 937 900 C774 936 633 881 537 796Z" fill="#56745d" />
    </g>
  </svg>
);

export default WatercolorBackground;
