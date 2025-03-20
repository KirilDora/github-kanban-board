import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Input, Button } from "antd";
import { setRepo, setIssues } from "../store/issuesSlice";
import { fetchIssues } from "../utils";

const SearchBar: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const dispatch = useDispatch();

  const handleLoadIssues = async () => {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      alert("Enter correct repository");
      return;
    }
    const [, newOwner, newRepo] = match;
    dispatch(setRepo({ owner: newOwner, repo: newRepo }));

    const savedIssues = sessionStorage.getItem(repoUrl);
    console.log("savedIssues", savedIssues);
    if (savedIssues) {
      dispatch(setIssues(JSON.parse(savedIssues)));
    } else {
      const issues = await fetchIssues(newOwner, newRepo);
      dispatch(setIssues(issues));
    }
    //localStorage.setItem(`${newOwner}/${newRepo}`, JSON.stringify(issues));
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
      <Input
        placeholder="Введите URL репозитория"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />
      <Button type="primary" onClick={handleLoadIssues}>
        Load
      </Button>
    </div>
  );
};

export default SearchBar;
