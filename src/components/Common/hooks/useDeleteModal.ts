import { useState } from 'react';

export const useDeleteModal = () => {
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const requestDelete = (
    title: string,
    message: string,
    action: () => Promise<void> | void
  ) => {
    setDeleteConfig({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await action();
        closeDeleteModal();
      },
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return { deleteConfig, requestDelete, closeDeleteModal };
};
