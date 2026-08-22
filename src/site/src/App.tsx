import Layout from "./components/Layout";
import Home from "./pages/Home";

// 黄页：单页目录。域名根路径部署（crowd.quanttide.com，无子路径前缀）。
export default function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
