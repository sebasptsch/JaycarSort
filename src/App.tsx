import { IndexedDB } from '@slnsw/react-indexed-db';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DBConfig } from './lib/DBConfig';
import Home from './pages/Home';
import './styles.scss';
// Initialise the database across all the different components of the app.
// The contents of the search box stored in state.

const queryClient = new QueryClient();

import { initDB } from '@slnsw/react-indexed-db';

initDB(DBConfig);

function App() {
  return (
    <IndexedDB {...DBConfig}>
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </IndexedDB>
  );
}

export default App;
