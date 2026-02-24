-- Enable UUID generation
create extension if not exists "pgcrypto";

---------------------------------------------------
-- USERS TABLE
---------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) > 3),
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('patient','doctor')),
  created_at timestamptz default now()
);

create index idx_users_role on users(role);

---------------------------------------------------
-- PATIENT PROFILE (ONBOARDING DATA)
---------------------------------------------------
create table patient_profiles (
  user_id uuid primary key references users(id) on delete cascade,

  -- Step 1
  date_of_birth date not null,
  gender text check (gender in ('Male','Female','Other','Prefer not to say')),
  phone text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,

  -- Step 2
  blood_type text check (
    blood_type in ('A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown')
  ),
  current_medications text check (char_length(current_medications) <= 500),
  previous_surgeries text,
  family_medical_history text check (char_length(family_medical_history) <= 300),

  -- Step 3
  insurance_provider text not null,
  insurance_id text not null,
  policy_holder_name text not null,
  preferred_time_slot text check (
    preferred_time_slot in ('Morning','Afternoon','Evening')
  ),
  referral_source text check (
    referral_source in ('Google','Friend','Doctor Referral','Ad','Other')
  ),
  additional_notes text check (char_length(additional_notes) <= 200),

  onboarding_completed boolean default false,
  updated_at timestamptz default now()
);

---------------------------------------------------
-- ALLERGIES
---------------------------------------------------
create table allergies (
  id serial primary key,
  name text unique not null
);

create table patient_allergies (
  patient_id uuid references users(id) on delete cascade,
  allergy_id int references allergies(id) on delete cascade,
  primary key (patient_id, allergy_id)
);

---------------------------------------------------
-- CHRONIC CONDITIONS
---------------------------------------------------
create table chronic_conditions (
  id serial primary key,
  name text unique not null
);

create table patient_conditions (
  patient_id uuid references users(id) on delete cascade,
  condition_id int references chronic_conditions(id) on delete cascade,
  primary key (patient_id, condition_id)
);

---------------------------------------------------
-- DOCTOR ASSIGNMENTS
---------------------------------------------------
create table doctor_assignments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid unique references users(id) on delete cascade,
  doctor_id uuid references users(id) on delete cascade,
  assigned_at timestamptz default now()
);

create index idx_doctor_assignments_doctor on doctor_assignments(doctor_id);

---------------------------------------------------
-- MESSAGES
---------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references doctor_assignments(id) on delete cascade,
  sender_id uuid references users(id),
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_messages_assignment on messages(assignment_id);
create index idx_messages_created_at on messages(created_at);