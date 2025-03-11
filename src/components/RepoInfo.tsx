import React from "react";
import { useSelector } from "react-redux";
import { Card } from "antd";
import { RootState } from "../store/store";

const RepoInfo: React.FC = () => {
  const { owner, repo } = useSelector((state: RootState) => state.issues);

  if (!owner || !repo) {
    return null;
  }

  return (
    <Card title="Repository Info" style={{ marginBottom: "16px" }}>
      <p>
        <strong>Owner:</strong>
        <a
          href={`https://github.com/${owner}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          {owner}
        </a>
      </p>
      <p>
        <strong>Repository:</strong>
        <a
          href={`https://github.com/${owner}/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          {repo}
        </a>
      </p>
    </Card>
  );
};

export default RepoInfo;
