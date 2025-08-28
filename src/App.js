import { BrowserRouter, Routes, Route } from "react-router-dom";
import KnowledgeGraphPage from "./Pages/knowledgeGraphPage";
import { Navigate }from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Navigate to="/knowledge-graph" />} />
      <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
