import { createGlobalStyle } from 'styled-components';

const MobileStyles = createGlobalStyle`
  body {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  input, textarea, button {
    font-size: 16px; /* Prevents zoom on focus in iOS */
  }
`;

export default MobileStyles;
