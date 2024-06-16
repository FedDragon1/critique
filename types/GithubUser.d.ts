export type App_metadata = {
  provider: string;
  providers: string[];
}

export type User_metadata = {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  phone_verified: boolean;
  preferred_username: string;
  provider_id: string;
  sub: string;
  user_name: string;
}

export type Identity_data = {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  phone_verified: boolean;
  preferred_username: string;
  provider_id: string;
  sub: string;
  user_name: string;
}

export type Identities = {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: Identity_data;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export type GithubUser = {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: App_metadata;
  user_metadata: User_metadata;
  identities: Identities[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}