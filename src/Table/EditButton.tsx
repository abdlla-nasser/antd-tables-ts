import React from 'react';
import { Button } from 'antd';
import { Item } from './EditableTable';

export const EditButton = (selectedRow: Item | null, key: React.Key | undefined, isEditing: boolean, edit: (record: Item) => void, save: (key: React.Key | undefined) => Promise<void>, cancel: () => void) => {
  if (selectedRow && !isEditing) {
    return (
      <Button type="link" onClick={() => edit(selectedRow)} style={{ marginBottom: 16 }}>
        Edit a row
      </Button>
    )
  } else if (selectedRow && isEditing) {
    return (
      <span>
        <Button type="link" onClick={() => save(key)} style={{ marginRight: 8 }}>
          Save
        </Button>
        <Button onClick={cancel} type="link">Cancel</Button>
      </span>
    )
  }
  return null;
}