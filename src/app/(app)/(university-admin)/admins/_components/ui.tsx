"use client";

import React from "react";
import { AdminsTable, adminMock } from "./admins-table";

export default function AdminsClient() {
  return (
    <div className="flex flex-col gap-6">
      <AdminsTable items={adminMock} />
    </div>
  );
}
