import React, { useState } from 'react';
import { Table, Popconfirm, Form, Button } from 'antd';
import { EditableCell } from './EditableCell';
import { EditButton } from './EditButton';
import { TablePaginationConfig } from 'antd/lib/table';

export interface Item {
  key: number;
  name: string;
  age: number;
  address: string;
}

export interface EditableTableProps {
  tableData?: Item[],
  columns: {
    dataIndex: string;
    title: string;
    editable?: boolean;
  }[]
  EditableCell: typeof EditableCell;
}

interface TableState {
  data: Item[],
  count: number,
  pagination: TablePaginationConfig,
  isEditing: boolean,
  selectedRow: Item | null
}

export const EditableTable: React.FC<EditableTableProps> = ({tableData = [], columns}) => {
  const [form] = Form.useForm();
  const [state, setState] = useState<TableState>({
    data: tableData,
    count: tableData.length,
    pagination: { current: 1, pageSize: 10 },
    isEditing: false,
    selectedRow: null
  })
  const handleShowSizeChanger = (current: number, size: number) => {
    setState({...state, pagination: { current: current, pageSize: size}})
  }
  const handleTableRowEdit = (record: Item) => {
    setState({ ...state, isEditing: true })
    form.setFieldsValue({ ...record });
  };
  const cancel = () => {
    setState({ ...state, selectedRow: null })
  };
  const handleTableRowAdd = () => {
    emptyForm()
    const newRow = {
      key: state.count + 1,
      name: "",
      age: 0,
      address: "",
    };
    setState({ ...state, data: [newRow, ...state.data], count: state.count + 1, isEditing: true, selectedRow: newRow });
    emptyForm();
  };
  const emptyForm = () => {
    let newFormFields = {};
    for (const property in state.selectedRow) {
      if(property !== "key") newFormFields[property] = ""
    }
    form.setFieldsValue({ ...newFormFields });
  }
  const handleTableRowDelete = (key: number) => {
    emptyForm();
    const dataSource = [...state.data];
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
  const mergedColumns = columns.map(col => {
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
  const deleteButton = (key: React.Key) => (<Popconfirm title="Sure to delete?" onConfirm={() => state.selectedRow ? handleTableRowDelete(state.selectedRow?.key) : null}>
    <Button type="link">Delete</Button>
  </Popconfirm>);

  return (
    <Form form={form} component={false}>
      <Button onClick={handleTableRowAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
      {editButton}
      {state.selectedRow && deleteButton(state.selectedRow.key)}
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={state.data}
        columns={mergedColumns}
        rowClassName={(record) => `editable-row ${state.selectedRow?.key === record.key ? "ant-table-row-selected": "" }`}
        onRow={(record) => ({onClick: () => setState({...state, selectedRow: record})})}
        pagination={{
          hideOnSinglePage: true,
          showSizeChanger: true,
          onShowSizeChange: handleShowSizeChanger,
          onChange: (current, pageSize) => {
            cancel();
            setState({...state, pagination: { current, pageSize: pageSize? pageSize: state.pagination.pageSize }})
          },
          ...state.pagination
        }}
      />
    </Form>
  );
};