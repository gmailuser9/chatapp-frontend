import React from "react";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

// Assuming you're using a local file for markdown or an API to fetch the README file content
const Use = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    // Read the README.md file (make sure to use the correct path)
    const fetchContent = async () => {
      try {
        const response = await fetch("./Use.md"); // Use the correct file path or fetch from API
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error reading markdown file", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="use-container">
      <div className="blog">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Use;
