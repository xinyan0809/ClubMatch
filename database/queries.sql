-- ============================================================
--  ClubMatch — Reference Queries
--  These are the most important read patterns for the app.
-- ============================================================


-- ============================================================
--  QUERY 1 — Applications for a specific club,
--            sorted by matching skills (descending match score)
--
--  This is the primary query for the Admin Dashboard table.
--  Strategy:
--    a) Use the snapshotted match_score column for instant sorting
--       (no runtime computation needed after insert).
--    b) Also show the live computed overlap for transparency /
--       re-scoring use cases.
-- ============================================================

SELECT
    a.id                                              AS application_id,
    a.status,
    a.match_score                                     AS stored_match_score,

    -- Live recompute: count how many of the student's skills appear
    -- in the club's required_skills list.
    -- array_length returns NULL on empty array, so COALESCE → 0.
    COALESCE(
        array_length(
            ARRAY(
                SELECT unnest(u.skills_tags)
                INTERSECT
                SELECT unnest(c.required_skills)
            ),
            1   -- array dimension
        ),
        0
    )                                                 AS live_overlap_count,

    -- Express overlap as a percentage of the club's required skills
    CASE
        WHEN array_length(c.required_skills, 1) > 0
        THEN ROUND(
            COALESCE(
                array_length(
                    ARRAY(
                        SELECT unnest(u.skills_tags)
                        INTERSECT
                        SELECT unnest(c.required_skills)
                    ), 1
                ), 0
            )::NUMERIC
            / array_length(c.required_skills, 1) * 100
        )
        ELSE 0
    END                                               AS live_match_pct,

    -- Student details
    u.id                                              AS student_id,
    u.full_name,
    u.email,
    u.major,
    u.study_year,
    u.mbti_type,
    u.skills_tags                                     AS student_skills,

    -- Which of the student's skills actually match (for badge display)
    ARRAY(
        SELECT unnest(u.skills_tags)
        INTERSECT
        SELECT unnest(c.required_skills)
    )                                                 AS matched_skills,

    a.applied_at,
    a.cover_note

FROM applications  a
JOIN users         u  ON u.id = a.student_id
JOIN clubs         c  ON c.id = a.club_id

WHERE
    a.club_id = :club_id          -- bind parameter: target club's UUID
    -- optional: filter by status
    -- AND a.status = 'pending'

ORDER BY
    a.match_score DESC,           -- highest match first (uses idx_applications_club_score)
    a.applied_at  ASC;            -- tie-break: first-come first-served


-- ============================================================
--  QUERY 2 — Compute and store match_score at INSERT time
--
--  Call this when a student clicks "Apply Now".
--  Calculating once on insert avoids repeated array computation
--  and preserves a historical record if skills change later.
-- ============================================================

INSERT INTO applications (student_id, club_id, match_score, cover_note)
SELECT
    :student_id,
    :club_id,
    -- Score = matched skills ÷ total required skills × 100
    CASE
        WHEN array_length(c.required_skills, 1) > 0
        THEN ROUND(
            COALESCE(
                array_length(
                    ARRAY(
                        SELECT unnest(u.skills_tags)
                        INTERSECT
                        SELECT unnest(c.required_skills)
                    ), 1
                ), 0
            )::NUMERIC
            / array_length(c.required_skills, 1) * 100
        )
        ELSE 0
    END,
    :cover_note
FROM users  u,
     clubs  c
WHERE u.id = :student_id
  AND c.id = :club_id
ON CONFLICT (student_id, club_id) DO NOTHING;   -- prevent double-apply


-- ============================================================
--  QUERY 3 — Discover feed: clubs ranked by match for a student
--
--  Powers the "AI Match" filter chip on the Discover page.
--  Returns active clubs sorted by how many of the student's
--  skills overlap with each club's requirements.
-- ============================================================

SELECT
    c.id,
    c.name,
    c.category,
    c.description,
    c.logo_url,
    c.required_skills,

    COALESCE(
        array_length(
            ARRAY(
                SELECT unnest(u.skills_tags)
                INTERSECT
                SELECT unnest(c.required_skills)
            ), 1
        ), 0
    )                         AS overlap_count,

    CASE
        WHEN array_length(c.required_skills, 1) > 0
        THEN ROUND(
            COALESCE(
                array_length(
                    ARRAY(
                        SELECT unnest(u.skills_tags)
                        INTERSECT
                        SELECT unnest(c.required_skills)
                    ), 1
                ), 0
            )::NUMERIC
            / array_length(c.required_skills, 1) * 100
        )
        ELSE 0
    END                       AS match_pct,

    -- Flag if student already applied
    EXISTS (
        SELECT 1 FROM applications a
        WHERE a.student_id = :student_id
          AND a.club_id    = c.id
    )                         AS already_applied

FROM clubs  c
JOIN users  u ON u.id = :student_id
WHERE c.is_active = true
ORDER BY match_pct DESC, c.name ASC;


-- ============================================================
--  QUERY 4 — Admin dashboard: summary metrics for one club
-- ============================================================

SELECT
    COUNT(*)                                          FILTER (WHERE status = 'pending')     AS pending_count,
    COUNT(*)                                          FILTER (WHERE status = 'interview')   AS interview_count,
    COUNT(*)                                          FILTER (WHERE status = 'accepted')    AS accepted_count,
    COUNT(*)                                          FILTER (WHERE status = 'rejected')    AS rejected_count,
    COUNT(*)                                                                                AS total_count,
    COUNT(*)  FILTER (WHERE applied_at::date = CURRENT_DATE)                               AS applied_today,
    ROUND(AVG(match_score))                                                                 AS avg_match_score
FROM applications
WHERE club_id = :club_id;
