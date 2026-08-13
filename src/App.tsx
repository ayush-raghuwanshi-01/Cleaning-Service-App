import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Confirmation from "./pages/Confirmation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/checkout" element={<Checkout />} /> */}
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </BrowserRouter>
  );
}