import * as React from "react";
import { render } from "react-dom";
import "./styles/index.css";
import Header from "./components/Header";
import Main from "./components/Main";

const App = () => {
  return (
    <div className="page">
      <Header />
      <Main />       
    </div>
  );
};
export default App;



