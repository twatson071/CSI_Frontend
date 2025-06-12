import React, { useState, useEffect } from "react";
import { RuxContainer, RuxButton } from "@astrouxds/react";

export interface ManagementFormProps<T> {
  item: T | null;
  onSubmit: (data: Partial<T>) => void;
  onCancel: () => void;
}

interface ManagementMainProps<T> {
  entityName: string;
  fetchItems: () => Promise<T[]>;
  createItem: (data: Partial<T>) => Promise<T>;
  updateItem: (id: number, data: Partial<T>) => Promise<T>;
  deleteItem: (id: number) => Promise<void>;
  FormComponent: React.ComponentType<ManagementFormProps<T>>;
  renderList: (
    items: T[],
    onEdit: (item: T) => void,
    onDelete: (item: T) => void
  ) => React.ReactNode;
  getId: (item: T) => number;
}

const ManagementMain = <T,>({
  entityName,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  FormComponent,
  renderList,
  getId,
}: ManagementMainProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadItems = async () => {
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      console.error(`Failed to fetch ${entityName}`, err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSave = async (data: Partial<T>) => {
    try {
      if (currentItem) {
        const updated = await updateItem(getId(currentItem), data);
        setItems((prev) =>
          prev.map((it) => (getId(it) === getId(currentItem) ? updated : it))
        );
      } else {
        const created = await createItem(data);
        setItems((prev) => [...prev, created]);
      }
      setShowForm(false);
      setCurrentItem(null);
    } catch (err) {
      console.error(`Failed to save ${entityName}`, err);
    }
  };

  const handleDelete = async (item: T) => {
    if (!confirm(`Delete this ${entityName}?`)) return;
    try {
      await deleteItem(getId(item));
      setItems((prev) => prev.filter((it) => getId(it) !== getId(item)));
    } catch (err) {
      console.error(`Failed to delete ${entityName}`, err);
    }
  };

  return (
    <RuxContainer className="management-main">
      <div slot="header">{entityName} Management</div>
      {showForm ? (
        <FormComponent
          item={currentItem}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setCurrentItem(null);
          }}
        />
      ) : (
        <>{renderList(items, (it) => {setCurrentItem(it);setShowForm(true);}, handleDelete)}</>
      )}
      <div slot="footer">
        {!showForm && (
          <RuxButton onClick={() => setShowForm(true)}>Add {entityName}</RuxButton>
        )}
      </div>
    </RuxContainer>
  );
};

export default ManagementMain;
