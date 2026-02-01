import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import "./styles.scss";
// Initialise the database across all the different components of the app.
// The contents of the search box stored in state.

const queryClient = new QueryClient();

function App() {
	return (
			<QueryClientProvider client={queryClient}>
				<Home />
			</QueryClientProvider>
	);
}

export default App;
