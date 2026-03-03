import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <div style={{ padding: "20px", overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}