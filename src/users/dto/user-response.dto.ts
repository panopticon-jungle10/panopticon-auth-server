export class UserResponseDto {
  id?: number;
  github_id?: string | null;
  google_id?: string | null;
  login?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
