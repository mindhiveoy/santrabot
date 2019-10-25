import { Button, Popover } from '@material-ui/core';
import * as React from 'react';
import { SketchPicker } from 'react-color';
import styled from 'styled-components';

const Field = styled.div`
  display: flex;
  flex-direction: row;
`;

const ColorBox = styled.div`
  border-width: 1px;
  width: 32px;
  height: 24px;
  background-color: ${props => props.color};
  margin-right: 8px;
  margin-bottom: 8px;
  border-color: black;
  border-style: solid;
`;

const ButtonPanel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
export interface ColorPickerProps {
  color: string;
  title: string;
  onPickColor(color: string): void;
}

interface State {
  open: boolean;
  newColor?: string;
  anchorEl?: any;
}

export default class ColorPicker extends React.Component<ColorPickerProps, State> {
  public state: State = {
    open: false,
  };

  public render() {
    const { color, title } = this.props;
    const { open, newColor } = this.state;
    return (
      <>
        <Field onClick={this.openPicker} aria-owns={open ? 'mouse-over-popover' : undefined} aria-haspopup="true">
          <ColorBox color={open ? newColor : color} />
          {title}
        </Field>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <SketchPicker color={newColor} onChange={this.handleColorChange} />
          <ButtonPanel>
            <Button color="primary" onClick={this.handleSelect}>
              Valitse
            </Button>
            <Button color="secondary" onClick={this.handleCancel}>
              Peruuta
            </Button>
          </ButtonPanel>
        </Popover>
      </>
    );
  }

  private openPicker = (event: React.MouseEvent<any>) => {
    this.setState({
      anchorEl: event.currentTarget,
      open: true,
    });
  }

  private handleCancel = () => {
    this.setState({
      anchorEl: null,
      open: false,
    });
  }

  private handleSelect = () => {
    this.handleCancel();
    this.props.onPickColor(this.state.newColor || '');
  }

  private handleColorChange = (color: any) => {
    this.setState({
      newColor: color.hex,
    });
  }
}
