import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileRepository } from "@/features/users/server/profile.repository";
import type {
  Profile,
  ProfileId,
  ProfileRole,
} from "@/features/users/server/profile.types";
import type { Database } from "@/infrastructure/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function mapProfileRole(role: ProfileRow["role"]): ProfileRole {
  if (role === "customer" || role === "admin") {
    return role;
  }

  throw new Error("The persisted Profile role is outside REVA's domain contract.");
}

function mapProfile(row: ProfileRow): Profile {
  return {
    createdAt: new Date(row.created_at),
    id: row.id,
    role: mapProfileRole(row.role),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Maps the session-bound Supabase Profile row into REVA's provider-independent
 * domain contract. The verified identity is fixed when this adapter is built.
 */
export class SupabaseProfileRepository implements ProfileRepository {
  public constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly currentProfileId: ProfileId,
  ) {}

  public async findCurrent(): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, role, created_at, updated_at")
      .eq("id", this.currentProfileId)
      .maybeSingle();

    if (error) {
      throw new Error("The current Profile could not be read.");
    }

    return data ? mapProfile(data) : null;
  }
}
