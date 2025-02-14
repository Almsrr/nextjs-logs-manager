"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { Table, Pagination, Button, Select, Datepicker } from "flowbite-react";
import type { Log } from "@prisma/client";

import { useAuth } from "../hooks/useAuth";

type Props = {
  logs?: Log[];
  refresh: () => void;

  pagination: {
    page: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
  onPageChange: (page: number) => void;
};

export default function LogsTable({
  logs,
  refresh,
  pagination,
  onPageChange,
}: Props) {
  const { isAdmin } = useAuth();
  const [severity, setSeverity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const removeLog = async (id: number) => {
    if (confirm("Are you sure do you want to delete this log?")) {
      try {
        await axios.delete("/api/manage-logs", { data: id });
        alert("Log deleted successfully");
        refresh();
      } catch (error) {
        alert("Something went wrong");
      }
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="grid h-[300px] place-content-center">
        <p>No data</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-4 pt-2">
        <div>
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="">ALL</option>
            <option value="INFO">INFO</option>
            <option value="ERROR">ERROR</option>
            <option value="WARNING">WARNING</option>
          </Select>
        </div>
        <div>
          <Datepicker
            id="date"
            onSelectedDateChanged={(e) => {
              const dateStr = e.toJSON();
              const i = dateStr.indexOf("T");
              const selectedDateStr = dateStr.slice(0, i);
              setStartDate(selectedDateStr);
            }}
          />
        </div>
        <div>
          <Datepicker
            id="date"
            onSelectedDateChanged={(e) => {
              const dateStr = e.toJSON();
              const i = dateStr.indexOf("T");
              const selectedDateStr = dateStr.slice(0, i);
              setEndDate(selectedDateStr);
            }}
          />
        </div>
        <Button pill>Apply</Button>
      </div>
      <Table striped>
        <Table.Head>
          <Table.HeadCell>Id</Table.HeadCell>
          <Table.HeadCell>Timestamp</Table.HeadCell>
          <Table.HeadCell>Severity</Table.HeadCell>
          <Table.HeadCell>Service</Table.HeadCell>
          <Table.HeadCell>Message</Table.HeadCell>
          {isAdmin && <Table.HeadCell>Actions</Table.HeadCell>}
        </Table.Head>
        <Table.Body className="divide-y">
          {logs?.map((log) => (
            <Table.Row key={log.id} className="bg-white">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                {log.id}
              </Table.Cell>
              <Table.Cell>{`${log.date} ${log.time}`}</Table.Cell>
              <Table.Cell>{log.level}</Table.Cell>
              <Table.Cell>{log.serviceName}</Table.Cell>
              <Table.Cell>{log.message}</Table.Cell>
              {isAdmin && (
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button as={Link} href={`/view/${log.id}`} pill>
                      View
                    </Button>
                    <Button
                      onClick={removeLog.bind(null, log.id!)}
                      color="red"
                      pill
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          showIcons
        />
      </div>
    </div>
  );
}
