import { Column } from "./Table/EditableTable";

export const dataSource = [
  {
    key: 1,
    en: 'milk',
    ar: "لبن",
  },
];
export const columns1: Column[] = [
  // { title: "created at", dataIndex: "createdAt"},
  {
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
    editable: true,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: '20%',
    editable: true,
  },
  {
    title: 'address',
    dataIndex: 'address',
    // width: '40%',
    editable: true,
  },
];