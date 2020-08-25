import React, { useState, useEffect, useRef } from 'react';
import { Table, Popconfirm, Form, Button, Input, Space } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { EditableCell } from './EditableCell';
import { EditButton } from './EditButton';
import { TablePaginationConfig } from 'antd/lib/table';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import "./index.css";

export interface Item {
  key: number;
  name: string;
  age: number;
  address: string;
}
export interface NewInput extends React.RefObject<Input> {
  current: any;
}
export interface Column {
  dataIndex: string;
  title?: string;
  width?: string;
  editable?: boolean;
  filterDropdown?: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }: FilterDropdownProps) => JSX.Element;
  onFilter?: (value: string, record: Item) => any
  onFilterDropdownVisibleChange?: (visible: boolean) => void;
  render?: (text: string) => string | JSX.Element;
  filterIcon?: (filtered: boolean) => JSX.Element;
}

export interface EditableTableProps {
  tableData?: Item[],
  propColumns: Column[]
  EditableCell: typeof EditableCell;
}

interface TableState {
  data: Item[],
  count: number,
  pagination: TablePaginationConfig,
  isEditing: boolean,
  selectedRow: Item | null,
  searchText: string[],
  searchedColumn: string[]
}

export const EditableTable: React.FC<EditableTableProps> = ({ tableData = [], propColumns }) => {
  const searchInput = useRef<Input>(null)
  const [form] = Form.useForm();
  const [state, setState] = useState<TableState>({
    data: [],
    count: 0,
    pagination: { current: 1, pageSize: 10 },
    isEditing: false,
    selectedRow: null,
    searchText: [],
    searchedColumn: [],
  });
  const getStateData = () => {
    let string = localStorage.getItem("data");
    let arr = string ? JSON.parse(string) : [];
    setState({ ...state, data: [...arr], count: arr.length })
  }
  useEffect(() => {
    if (state.data.length > 0)
      localStorage.setItem("data", JSON.stringify(state.data));
  }, [state.data])
  useEffect(() => {
    if (tableData.length === 0) getStateData()
  }, [])
  const getColumnProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            handleSearch(selectedKeys, confirm, dataIndex)
          }}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
        </Button>
          <Button
            onClick={() => handleReset(clearFilters, dataIndex, selectedKeys)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
        </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
    onFilter: (value: string, record: Item) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()): "",
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput?.current?.select());
    },
    render: (text: string) => {
      return state.searchedColumn.find(item => item === dataIndex) ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[...state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      )
    }
  });
  const [columns, setColumns] = useState<Column[]>([...propColumns])
  useEffect(() => {
    setColumns([...propColumns?.map((column) => ({ ...column, ...getColumnProps(column.dataIndex), }))])
  }, [state])
  const handleSearch = (selectedKeys: React.Key[], confirm: () => void, dataIndex: string) => {
    let searchText = selectedKeys[0].toString()
    confirm();
    setState({ ...state, searchText: [...state.searchText, searchText ], searchedColumn: [...state.searchedColumn,dataIndex] });
  }
  const handleReset = (clearFilters: (() => void) | undefined, dataIndex: string, selectedKeys: React.Key[]) => {
    let searchText = selectedKeys[0].toString()
    if (clearFilters) clearFilters();
    setState({ ...state, searchText: [...state.searchText.filter(item => item !== searchText)], searchedColumn: [...state.searchedColumn.filter(item => item !== dataIndex)] });
  };
  const handleShowSizeChanger = (current: number, size: number) => {
    setState({ ...state, pagination: { current: current, pageSize: size } })
  }
  const handleTableRowEdit = (record: Item) => {
    setState({ ...state, isEditing: true })
    form.setFieldsValue({ ...record });
  };
  const cancel = () => {
    setState({ ...state, selectedRow: null })
  };
  const handleTableRowAdd = () => {
    const newRow = {
      key: state.count + 1,
      name: "",
      age: 0,
      address: "",
    };
    form.setFieldsValue({ ...newRow });
    setState({ ...state, data: [newRow, ...state.data], count: state.count + 1, isEditing: true, selectedRow: newRow });
  };
  const handleTableRowDelete = (key: number) => {
    const dataSource = [...state.data];
    form.setFieldsValue({})
    // deleteRe
    setState({ ...state, data: [...dataSource.filter(item => item.key !== key)], count: state.count - 1, selectedRow: null, isEditing: false });
  };
  const handleTableRowSave = async (key: React.Key | undefined) => {
    try {
      const row = (await form.validateFields()) as Item;
      const newData = [...state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setState({ ...state, data: newData, selectedRow: null, isEditing: false });
      } else {
        newData.push(row);
        setState({ ...state, data: newData, selectedRow: null, isEditing: false });
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  const mergedColumns = columns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: state.isEditing && state.selectedRow?.key === record.key,
      }),
    };
  });
  const editButton = EditButton(state.selectedRow, state.selectedRow?.key, state.isEditing, handleTableRowEdit, handleTableRowSave, cancel)
  const deleteButton = (key: React.Key, disabled: boolean) => (<Popconfirm title="Sure to delete?" onConfirm={() => state.selectedRow ? handleTableRowDelete(state.selectedRow?.key) : null}>
    <Button disabled={disabled} type="link">Delete</Button>
  </Popconfirm>);

  return (
    <Form form={form} component={false}>
      <Button onClick={handleTableRowAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
      {editButton}
      {state.selectedRow ? deleteButton(state.selectedRow.key, false): null }
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={state.data}
        columns={mergedColumns}
        rowClassName={(record) => `editable-row ${state.selectedRow?.key === record.key ? "ant-table-row-selected" : ""}`}
        onRow={(record) => ({ onClick: () => setState({ ...state, selectedRow: record }) })}
        pagination={{
          hideOnSinglePage: true,
          showSizeChanger: true,
          onShowSizeChange: handleShowSizeChanger,
          onChange: (current, pageSize) => {
            cancel();
            setState({ ...state, pagination: { current, pageSize: pageSize ? pageSize : state.pagination.pageSize } })
          },
          ...state.pagination
        }}
      />
    </Form>
  );
};