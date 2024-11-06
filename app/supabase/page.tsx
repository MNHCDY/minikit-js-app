"use client";
import { useEffect, useState } from "react";
import supabase from "../../components/Supabase/supabaseClient";

const ExampleComponent = () => {
  // Explicitly specify the type for tables as an array of strings
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await supabase
          .from("metadata") // Replace "metadata" with your custom table name
          .select("table_name");

        if (error) throw error;

        // Map data to extract `table_name` as strings
        setTables(data.map((row: { table_name: string }) => row.table_name));
      } catch (error) {
        // Cast error to `Error` to access `message` property
        console.error("Error fetching tables:", (error as Error).message);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Table Names</h1>
      <ul>
        {tables.map((table, index) => (
          <li key={index}>{table}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;
