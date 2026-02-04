import React, { useState } from "react";
import { ConfigProvider, theme, Input, Button } from "antd";
import SecretPage from "./pages/SecretPage";
import TestPage from "./pages/testPage";
import AdminPage from "./pages/adminPage";
import HomePage from "./pages/homePage";

const codes: Record<string, string> = {
  "secret": "secret",
  "admin": "admin",
  "test": "test",
  "home": "home"
}


export default function App() {
  const [value, setValue] = useState("");
  const [currentPage, setCurrentPage] = useState("home")

  const handleSubmit = () => {
    // TODO: check value against known codes and navigate accordingly
    console.log("Submitted:", value);
    const destination = codes[value];
    if (destination) {
      console.log("Correct code!", destination);
      setCurrentPage(destination)
    } else {
      setCurrentPage("home")
      console.log("Bad code.")
    }

    
  };

  const renderPage = () => {
    if (currentPage === "secret") return <SecretPage />;
    if (currentPage === "test") return <TestPage />;
    if (currentPage === "admin") return <AdminPage />;
    return <HomePage />;
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div style={{ marginTop: 200, textAlign: "center" }}>
        <Input
          placeholder="Enter code"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleSubmit}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 8 }}>
          Submit
        </Button>
        <div style={{marginTop:40}}>
          {renderPage()}
        </div>
      </div>
    </ConfigProvider>
  );
  }
