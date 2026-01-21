import { useOutletContext } from 'react-router-dom';
import FlashcardList from './FlashcardList';

const FlashcardPage = () => {
  const { searchQuery } = useOutletContext();
  return <FlashcardList searchQuery={searchQuery} />;
};

export default FlashcardPage;
