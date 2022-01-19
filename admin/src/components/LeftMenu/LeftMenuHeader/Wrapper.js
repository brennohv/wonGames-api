import styled, { css } from 'styled-components';

import Logo from '../../../assets/images/logo.png';

const Wrapper = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.main.colors.won.blue};
    height: ${props => props.theme.main.sizes.leftMenu.height};

    .projectName {
      display: block;
      height: ${theme.main.sizes.leftMenu.height};
      background-image: url(${Logo});
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 15rem;
    }
  `}
`;

export default Wrapper;