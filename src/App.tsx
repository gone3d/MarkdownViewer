// src/App.tsx

import "./App.css";
import Header from "./components/Header";
import Content from "./components/Content";
import Footer from "./components/Footer";

function App() {
  console.log("App rendering...");
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

export default App;
