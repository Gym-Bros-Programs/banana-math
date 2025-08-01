import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function AttemptHistory() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  //console.log("User:", user?.id);

  if (!user) {
    return redirect("/login")
  }

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  //console.log("Entries:",entries, error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-5">Attempts</h1>
      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-slate-800 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-slate-800 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-slate-800 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-slate-800 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {entries?.map((entry, index) => {
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b text-stone-900 border-gray-200">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b text-stone-900 border-gray-200">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b text-stone-900 border-gray-200">
                      {entry.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b text-stone-900 border-gray-200">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
