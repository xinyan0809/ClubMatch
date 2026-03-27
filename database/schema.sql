-- ============================================================
--  ClubMatch  —  PostgreSQL / Supabase Schema
--  Run this file once against a fresh Supabase project.
--  All tables live in the default "public" schema.
-- ============================================================


-- ============================================================
--  EXTENSIONS
-- ============================================================

-- uuid_generate_v4() for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm enables fast ILIKE / full-text search on text columns
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================
--  ENUM TYPES
-- ============================================================

CREATE TYPE application_status AS ENUM (
    'pending',      -- submitted, not yet reviewed
    'interview',    -- shortlisted for an interview
    'accepted',     -- officially accepted into the club
    'rejected'      -- not accepted this cycle
);

CREATE TYPE mbti_type AS ENUM (
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
);


-- ============================================================
--  TABLE: universities
--  Lookup table so university names stay consistent.
-- ============================================================

CREATE TABLE universities (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT        NOT NULL UNIQUE,
    country    TEXT        NOT NULL DEFAULT 'Unknown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  universities            IS 'Reference table of universities. Keeps university names normalised.';
COMMENT ON COLUMN universities.name      IS 'Full official university name, e.g. "University of Glasgow".';
COMMENT ON COLUMN universities.country   IS 'ISO country name of the university.';


-- ============================================================
--  TABLE: users
--  Represents students who sign up to ClubMatch.
--  Linked to Supabase Auth via the id column (auth.users.id).
-- ============================================================

CREATE TABLE users (
    -- Primary key matches Supabase Auth UID so RLS policies work seamlessly
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT        NOT NULL UNIQUE,
    full_name       TEXT        NOT NULL,
    avatar_url      TEXT,

    -- Academic profile
    university_id   UUID        REFERENCES universities(id) ON DELETE SET NULL,
    major           TEXT,                        -- e.g. "Computer Science"
    study_year      SMALLINT    CHECK (study_year BETWEEN 1 AND 6),

    -- Personality & interests
    mbti_type       mbti_type,                   -- nullable until quiz completed
    skills_tags     TEXT[]      NOT NULL DEFAULT '{}',
    -- skills_tags stores normalised lowercase skill slugs:
    --   e.g. ARRAY['python','machine-learning','public-speaking']

    -- Availability: stored as JSONB for flexibility.
    -- Shape: { "monday": ["09:00","10:00"], "friday": ["14:00","18:00"] }
    free_time_slots JSONB       NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users                  IS 'Student accounts. id must equal the corresponding Supabase Auth UID.';
COMMENT ON COLUMN users.id              IS 'UUID from Supabase Auth (auth.users.id). Used for Row Level Security.';
COMMENT ON COLUMN users.email           IS 'Unique email address; mirrors auth.users.email.';
COMMENT ON COLUMN users.skills_tags     IS 'Array of lowercase skill slugs declared by the student, e.g. {python, ui-design}.';
COMMENT ON COLUMN users.mbti_type       IS 'MBTI personality type collected via onboarding quiz; nullable until completed.';
COMMENT ON COLUMN users.free_time_slots IS 'JSON map of weekday → time-slot array. Used for interview scheduling.';
COMMENT ON COLUMN users.study_year      IS 'Current year of study (1–6 to accommodate medicine / integrated masters).';


-- ============================================================
--  TABLE: clubs
--  A club is owned by one admin (a user who is club president).
-- ============================================================

CREATE TABLE clubs (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT        NOT NULL,
    category        TEXT        NOT NULL,        -- e.g. 'Tech', 'Sports', 'Arts'
    description     TEXT,
    logo_url        TEXT,

    -- Skills the club is actively seeking from new members
    required_skills TEXT[]      NOT NULL DEFAULT '{}',
    -- e.g. ARRAY['python','teamwork','public-speaking']

    -- The club president / admin
    admin_user_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Soft-delete: set to FALSE instead of deleting rows
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT clubs_name_university_unique UNIQUE (name, admin_user_id)
);

COMMENT ON TABLE  clubs                   IS 'University clubs managed inside ClubMatch.';
COMMENT ON COLUMN clubs.category         IS 'High-level category string matching the Discover filter chips, e.g. Tech, Sports, Arts.';
COMMENT ON COLUMN clubs.required_skills  IS 'Skills the club is looking for — matched against users.skills_tags to produce a Match Score.';
COMMENT ON COLUMN clubs.admin_user_id    IS 'FK to the user who is the club president / primary admin.';
COMMENT ON COLUMN clubs.is_active        IS 'Soft-delete flag. FALSE = club no longer recruiting; hidden from Discover feed.';


-- ============================================================
--  TABLE: applications
--  Join entity between a student (user) and a club.
--  One student can apply to many clubs; one club receives many applications.
-- ============================================================

CREATE TABLE applications (
    id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID               NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    club_id         UUID               NOT NULL REFERENCES clubs(id)  ON DELETE CASCADE,

    status          application_status NOT NULL DEFAULT 'pending',

    -- Snapshot of match score at the moment of application.
    -- Storing it avoids expensive recomputation and preserves history
    -- if either the student's skills or the club's requirements change later.
    match_score     SMALLINT           CHECK (match_score BETWEEN 0 AND 100),

    -- Optional cover note written by the student
    cover_note      TEXT,

    -- Optional admin note written by the club president
    admin_note      TEXT,

    -- Timestamps
    applied_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    -- A student may only have one active application per club
    CONSTRAINT applications_student_club_unique UNIQUE (student_id, club_id)
);

COMMENT ON TABLE  applications              IS 'Tracks every student application to a club, including review status and match score.';
COMMENT ON COLUMN applications.student_id  IS 'FK to the applying student (users.id).';
COMMENT ON COLUMN applications.club_id     IS 'FK to the target club (clubs.id).';
COMMENT ON COLUMN applications.status      IS 'Enum: pending → interview → accepted | rejected.';
COMMENT ON COLUMN applications.match_score IS 'Percentage overlap of student skills vs club required_skills, snapshotted at apply time (0–100).';
COMMENT ON COLUMN applications.cover_note  IS 'Free-text motivation letter from the student.';
COMMENT ON COLUMN applications.admin_note  IS 'Internal-only note written by the club admin during review.';
COMMENT ON COLUMN applications.applied_at  IS 'Immutable timestamp of initial submission.';


-- ============================================================
--  INDEXES
--  Created after tables to keep the schema block readable.
-- ============================================================

-- Quickly look up all applications for a club (admin dashboard default view)
CREATE INDEX idx_applications_club_id
    ON applications (club_id);

-- Quickly look up all applications made by a student (profile / history view)
CREATE INDEX idx_applications_student_id
    ON applications (student_id);

-- Filter / sort applications by status within a club (most common admin query)
CREATE INDEX idx_applications_club_status
    ON applications (club_id, status);

-- Sort applications by match_score descending within a club
CREATE INDEX idx_applications_club_score
    ON applications (club_id, match_score DESC);

-- GIN indexes on array columns — required for the && (overlap) operator
CREATE INDEX idx_users_skills_gin
    ON users USING GIN (skills_tags);

CREATE INDEX idx_clubs_skills_gin
    ON clubs USING GIN (required_skills);

-- Trigram index for fast club name search in the Discover page
CREATE INDEX idx_clubs_name_trgm
    ON clubs USING GIN (name gin_trgm_ops);


-- ============================================================
--  AUTO-UPDATE updated_at TRIGGER
--  Attach to every table that has an updated_at column.
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clubs_updated_at
    BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
--  ROW LEVEL SECURITY (RLS)  —  Supabase-specific
--  Enable RLS on all tables; add policies for common access patterns.
-- ============================================================

ALTER TABLE universities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications  ENABLE ROW LEVEL SECURITY;

-- universities: public read, no writes from client
CREATE POLICY "Universities are publicly readable"
    ON universities FOR SELECT USING (true);

-- users: each user can only read and update their own row
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE USING (auth.uid() = id);

-- clubs: anyone can read active clubs (Discover feed)
CREATE POLICY "Active clubs are publicly readable"
    ON clubs FOR SELECT USING (is_active = true);

-- clubs: only the admin can update their own club
CREATE POLICY "Club admin can update own club"
    ON clubs FOR UPDATE USING (auth.uid() = admin_user_id);

-- applications: students see only their own applications
CREATE POLICY "Students can read own applications"
    ON applications FOR SELECT
    USING (auth.uid() = student_id);

-- applications: club admins can read all applications for their club
CREATE POLICY "Club admins can read club applications"
    ON applications FOR SELECT
    USING (
        auth.uid() = (
            SELECT admin_user_id FROM clubs WHERE id = applications.club_id
        )
    );

-- applications: club admins can update status / admin_note
CREATE POLICY "Club admins can update application status"
    ON applications FOR UPDATE
    USING (
        auth.uid() = (
            SELECT admin_user_id FROM clubs WHERE id = applications.club_id
        )
    );

-- applications: students can insert (apply) and soft-withdraw
CREATE POLICY "Students can apply to clubs"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = student_id);
