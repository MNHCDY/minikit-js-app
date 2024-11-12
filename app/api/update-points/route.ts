import supabase from "@/components/Supabase/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId } = req.body; // Ensure you receive a unique identifier for the user.

    try {
      // Retrieve the current points
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("points")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      const currentPoints = userData.points || 0;
      const updatedPoints = currentPoints + 40;

      // Update the points with the new value
      const { data, error: updateError } = await supabase
        .from("users")
        .update({ points: updatedPoints })
        .eq("id", userId);

      if (updateError) throw updateError;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error updating points:", (error as Error).message);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
