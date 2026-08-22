import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TaskDetail from "./pages/TaskDetail";

// 域名根路径部署（crowd.quanttide.com，无子路径前缀）；SPA 回退由 CDN 处理。
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/task/:name" element={<TaskDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
