/*
  # SelfOS Initial Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text)
      - `created_at` (timestamptz)
      - `current_streak` (integer, default 0)
      - `last_active_date` (date)
      - `total_tasks_completed` (integer, default 0)
    
    - `onboarding_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `main_problem` (text)
      - `daily_routine` (text)
      - `available_time` (text)
      - `personal_goals` (text array)
      - `motivation_level` (integer)
      - `created_at` (timestamptz)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `completed` (boolean, default false)
      - `task_date` (date)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `action_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `plan_data` (jsonb)
      - `motivational_message` (text)
      - `created_at` (timestamptz)
      - `is_active` (boolean, default true)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  created_at timestamptz DEFAULT now(),
  current_streak integer DEFAULT 0,
  last_active_date date,
  total_tasks_completed integer DEFAULT 0
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  main_problem text NOT NULL,
  daily_routine text NOT NULL,
  available_time text NOT NULL,
  personal_goals text[] NOT NULL,
  motivation_level integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding"
  ON onboarding_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON onboarding_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON onboarding_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  completed boolean DEFAULT false,
  task_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create action_plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  plan_data jsonb NOT NULL,
  motivational_message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action plans"
  ON action_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action plans"
  ON action_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action plans"
  ON action_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_active ON action_plans(user_id, is_active);