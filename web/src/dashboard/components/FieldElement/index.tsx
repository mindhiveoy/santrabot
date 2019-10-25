import styled from 'styled-components';

const FieldElement = styled.div`
  position: relative;
  padding-top: ${props => props.theme.formFieldPadding}px;
  padding-bottom: ${props => props.theme.formFieldPadding}px;
`;

export default FieldElement;
