import React from "react";
import { Layout, Typography } from "antd";
import SearchBar from "./components/SearchBar";
import RepoInfo from "./components/RepoInfo";
import IssuesBoard from "./components/IssuesBoard";
import Board from "./components/Board";

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Header
        style={{ background: "#1890ff", padding: "10px", textAlign: "center" }}
      >
        <Title level={2} style={{ color: "white", margin: 0 }}>
          GitHub Issues Kanban Board
        </Title>
      </Header>

      <Content
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}
      >
        <SearchBar />
        <RepoInfo />
        <Board />
      </Content>
    </Layout>
  );
};

export default App;
