import React, { useEffect } from 'react';
import { EditableTable } from './EditableTable';
import { EditableCell } from './EditableCell';
// import { getRequest } from "../api";
// import { columns2 } from '../dataSource';
// import { dataSource } from '../dataSource';
import { columns1 } from '../dataSource';

interface DataRow {
  _id: string,
  type: string,
  name: {
    [key: string]: string
  },
  createdAt: string,
  updatedAt: string,
  __v: number,
}

export const Table = () => {
  return (
    <EditableTable EditableCell={EditableCell} propColumns={columns1}/>
  )
}