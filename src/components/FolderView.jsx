import { useApp } from '../AppContext';

const FolderView = () => {
  const { currentFolder } = useApp();
  
  return (
    <div>
      <h3>Folder View: {currentFolder?.name || 'All'}</h3>
    </div>
  );
};

export default FolderView;
