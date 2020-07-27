import React from 'react';
import { EditableTable } from './EditableTable';
import { EditableCell } from './EditableCell';
import { dataSource, columns1, columns2 } from '../dataSource';

export const Table = () => {
  return (
    <EditableTable EditableCell={EditableCell} columns={columns2}/>
  )
}