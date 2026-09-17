-- ============================================================
-- Digital Crime Scene Reconstruction System
-- Database Schema — PostgreSQL
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- optional: for geo queries

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'INVESTIGATOR', 'ANALYST')),
    full_name     VARCHAR(100),
    badge_number  VARCHAR(30),
    department    VARCHAR(100),
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CASES TABLE
-- ============================================================
CREATE TABLE cases (
    id              BIGSERIAL PRIMARY KEY,
    case_number     VARCHAR(30)  NOT NULL UNIQUE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    location        VARCHAR(255),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    crime_type      VARCHAR(50),
    status          VARCHAR(30)  NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN','ACTIVE','CLOSED','COLD','SOLVED')),
    priority        VARCHAR(20)  DEFAULT 'MEDIUM'
                        CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    incident_date   TIMESTAMP    NOT NULL,
    reported_date   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    created_by      BIGINT       REFERENCES users(id),
    lead_investigator BIGINT     REFERENCES users(id),
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INVESTIGATORS (case assignment junction)
-- ============================================================
CREATE TABLE case_investigators (
    id            BIGSERIAL PRIMARY KEY,
    case_id       BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    user_id       BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_in_case  VARCHAR(50) DEFAULT 'INVESTIGATOR',
    assigned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (case_id, user_id)
);

-- ============================================================
-- EVIDENCE TABLE
-- ============================================================
CREATE TABLE evidence (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    evidence_number VARCHAR(30) NOT NULL UNIQUE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    type            VARCHAR(30) NOT NULL
                        CHECK (type IN ('IMAGE','VIDEO','DOCUMENT','AUDIO','PHYSICAL','DIGITAL','OTHER')),
    file_path       VARCHAR(500),
    file_name       VARCHAR(200),
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    collected_at    TIMESTAMP,
    location        VARCHAR(255),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    chain_of_custody TEXT,
    tags            TEXT[],          -- PostgreSQL array of tags
    forensic_notes  TEXT,
    is_key_evidence BOOLEAN DEFAULT FALSE,
    uploaded_by     BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evidence relationships (relationship graph)
CREATE TABLE evidence_relationships (
    id              BIGSERIAL PRIMARY KEY,
    from_evidence_id BIGINT REFERENCES evidence(id) ON DELETE CASCADE,
    to_evidence_id   BIGINT REFERENCES evidence(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50),  -- e.g. 'CORROBORATES','CONTRADICTS','LEADS_TO'
    strength         DECIMAL(3,2) CHECK (strength BETWEEN 0 AND 1),
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- WITNESSES TABLE
-- ============================================================
CREATE TABLE witnesses (
    id                  BIGSERIAL PRIMARY KEY,
    case_id             BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    name                VARCHAR(100),
    age                 INTEGER,
    contact             VARCHAR(100),
    address             TEXT,
    witness_type        VARCHAR(30) DEFAULT 'EYE_WITNESS'
                            CHECK (witness_type IN ('EYE_WITNESS','BYSTANDER','EXPERT','CHARACTER','ALIBI')),
    statement           TEXT NOT NULL,
    statement_date      TIMESTAMP,
    keywords            JSONB,        -- extracted keywords from NLP
    entities            JSONB,        -- named entities (persons, places, times)
    contradictions      JSONB,        -- detected contradictions
    credibility_score   DECIMAL(5,2), -- 0-100
    sentiment_score     DECIMAL(5,2), -- -1 to 1
    suspicious_flags    TEXT[],
    nlp_analyzed        BOOLEAN DEFAULT FALSE,
    recorded_by         BIGINT REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SUSPECTS TABLE
-- ============================================================
CREATE TABLE suspects (
    id                  BIGSERIAL PRIMARY KEY,
    case_id             BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    alias               VARCHAR(100),
    age                 INTEGER,
    description         TEXT,
    photo_path          VARCHAR(500),
    last_known_location VARCHAR(255),
    last_seen_latitude  DECIMAL(10,8),
    last_seen_longitude DECIMAL(11,8),
    status              VARCHAR(30) DEFAULT 'PERSON_OF_INTEREST'
                            CHECK (status IN ('PERSON_OF_INTEREST','SUSPECT','ARRESTED','CLEARED','WANTED')),
    probability_score   DECIMAL(5,2) DEFAULT 0,  -- 0-100%
    evidence_match_score DECIMAL(5,2) DEFAULT 0,
    proximity_score     DECIMAL(5,2) DEFAULT 0,
    timeline_score      DECIMAL(5,2) DEFAULT 0,
    behavior_score      DECIMAL(5,2) DEFAULT 0,
    movement_path       JSONB,        -- JSON array of lat/lng with timestamps
    predicted_path      JSONB,        -- Dijkstra/A* predicted path
    criminal_record     TEXT,
    notes               TEXT,
    added_by            BIGINT REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- LOCATIONS GRAPH (for path algorithms)
-- ============================================================
CREATE TABLE locations (
    id          BIGSERIAL PRIMARY KEY,
    case_id     BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(50),  -- CRIME_SCENE, ESCAPE_ROUTE, CHECKPOINT, CAMERA, INTERSECTION
    latitude    DECIMAL(10,8) NOT NULL,
    longitude   DECIMAL(11,8) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Location graph edges (bidirectional weighted graph for Dijkstra/A*)
CREATE TABLE location_edges (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    from_location_id BIGINT REFERENCES locations(id) ON DELETE CASCADE,
    to_location_id   BIGINT REFERENCES locations(id) ON DELETE CASCADE,
    distance_meters  DECIMAL(10,2),
    travel_time_sec  INTEGER,
    edge_type        VARCHAR(30) DEFAULT 'ROAD',  -- ROAD, ALLEY, BUILDING, TRANSIT
    is_blocked       BOOLEAN DEFAULT FALSE,
    weight           DECIMAL(10,4) DEFAULT 1.0
);

-- ============================================================
-- TIMELINE EVENTS TABLE
-- ============================================================
CREATE TABLE timeline_events (
    id                  BIGSERIAL PRIMARY KEY,
    case_id             BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    event_time          TIMESTAMP NOT NULL,
    phase               VARCHAR(20) NOT NULL
                            CHECK (phase IN ('BEFORE','DURING','AFTER')),
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    event_type          VARCHAR(50),   -- MOVEMENT, EVIDENCE_FOUND, WITNESS_ACCOUNT, CCTV, CALL, etc.
    related_evidence_id BIGINT REFERENCES evidence(id),
    related_suspect_id  BIGINT REFERENCES suspects(id),
    related_witness_id  BIGINT REFERENCES witnesses(id),
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    confidence_level    DECIMAL(5,2) DEFAULT 50,  -- 0-100%
    source              VARCHAR(100),
    is_verified         BOOLEAN DEFAULT FALSE,
    created_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AI INSIGHTS TABLE
-- ============================================================
CREATE TABLE ai_insights (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    insight_type    VARCHAR(50) NOT NULL,
                    -- SUSPICIOUS_MOVEMENT, CONTRADICTION, SUSPECT_RANKING, SUGGESTION
    title           VARCHAR(200),
    content         TEXT NOT NULL,
    severity        VARCHAR(20) DEFAULT 'INFO'
                        CHECK (severity IN ('INFO','WARNING','ALERT','CRITICAL')),
    related_entity_type VARCHAR(50),  -- SUSPECT, WITNESS, EVIDENCE
    related_entity_id   BIGINT,
    confidence      DECIMAL(5,2),
    is_dismissed    BOOLEAN DEFAULT FALSE,
    generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CCTV / CAMERA TABLE
-- ============================================================
CREATE TABLE cctv_records (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    camera_id       VARCHAR(50),
    location_name   VARCHAR(200),
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    recorded_at     TIMESTAMP NOT NULL,
    duration_sec    INTEGER,
    file_path       VARCHAR(500),
    suspects_spotted BIGINT[],   -- array of suspect IDs
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE investigation_reports (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    summary         TEXT,
    generated_by    BIGINT REFERENCES users(id),
    file_path       VARCHAR(500),
    report_type     VARCHAR(30) DEFAULT 'FULL',  -- FULL, SUMMARY, TIMELINE, SUSPECT
    generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_cases_status       ON cases(status);
CREATE INDEX idx_cases_created_by   ON cases(created_by);
CREATE INDEX idx_evidence_case_id   ON evidence(case_id);
CREATE INDEX idx_evidence_type      ON evidence(type);
CREATE INDEX idx_witnesses_case_id  ON witnesses(case_id);
CREATE INDEX idx_suspects_case_id   ON suspects(case_id);
CREATE INDEX idx_timeline_case_id   ON timeline_events(case_id);
CREATE INDEX idx_timeline_phase     ON timeline_events(phase);
CREATE INDEX idx_timeline_time      ON timeline_events(event_time);
CREATE INDEX idx_ai_insights_case   ON ai_insights(case_id);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
