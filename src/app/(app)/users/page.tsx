import { requireRole } from "@/lib/dal";
import { listAllUsers } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { RoleBadge } from "@/components/badges";
import { UserRoleControl } from "@/components/user-role-control";
import { formatDate } from "@/lib/format";

export default async function UsersPage() {
  // Admin-only — enforced server-side.
  const me = await requireRole("admin");
  const users = await listAllUsers();

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage team members and their access roles."
      />

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Current role</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium">Change role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => {
              const isMe = u.id === me.id;
              return (
                <tr key={u.id} className="hover:bg-zinc-50/70">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-zinc-900">
                      {u.name}
                      {isMe && <span className="text-zinc-400"> (you)</span>}
                    </span>
                    <span className="block font-mono text-xs text-zinc-400">
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    {isMe ? (
                      <span className="text-xs text-zinc-400">
                        You can&apos;t change your own role
                      </span>
                    ) : (
                      <UserRoleControl userId={u.id} role={u.role} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
