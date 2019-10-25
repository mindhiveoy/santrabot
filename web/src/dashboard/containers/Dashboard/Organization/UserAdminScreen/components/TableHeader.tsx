import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel, Tooltip } from '@material-ui/core';
import * as React from 'react';

export interface ColumnDesc {
  id: string;
  label: string;
}

export interface TableHeaderProps {
  order: 'asc' | 'desc';
  orderBy: string;
  columns: ColumnDesc[];
  numSelected: number;
  rowCount: number;
  onSelectAllClick(event: any): void;
  onRequestSort(event: any, property: string): void;
}

export class TableHeader extends React.PureComponent<TableHeaderProps> {
  public createSortHandler = (property: string) => (event: React.MouseEvent<any>) => {
    this.props.onRequestSort(event, property);
  };

  public render() {
    const { columns, onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {columns.map(
            row => (
              <TableCell key={row.id} sortDirection={orderBy === row.id ? order : false}>
                <Tooltip title="Sort" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    );
  }
}
