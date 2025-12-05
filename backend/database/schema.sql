-- CoopQuest Database Schema
-- PostgreSQL 15+

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finished')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checkpoints table
CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    question TEXT NOT NULL,
    answer VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL DEFAULT 100,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    personal_qr_code VARCHAR(100) UNIQUE,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, name)
);

-- Team checkpoints table
CREATE TABLE IF NOT EXISTS team_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, checkpoint_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_checkpoints_event ON checkpoints(event_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_qr ON checkpoints(qr_code);
CREATE INDEX IF NOT EXISTS idx_teams_event ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_token ON teams(token);
CREATE INDEX IF NOT EXISTS idx_team_checkpoints_team ON team_checkpoints(team_id);
CREATE INDEX IF NOT EXISTS idx_team_checkpoints_checkpoint ON team_checkpoints(checkpoint_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_checkpoints_updated_at BEFORE UPDATE ON team_checkpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Collaborative challenges table
CREATE TABLE IF NOT EXISTS collaborative_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('trivia', 'math', 'creative', 'networking')),
    question TEXT NOT NULL,
    answer_hint TEXT,
    requires_exact_match BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 50,
    time_limit_seconds INTEGER DEFAULT 120,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team encounters table
CREATE TABLE IF NOT EXISTS team_encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    scanner_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scanned_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES collaborative_challenges(id) ON DELETE SET NULL,
    scanner_answer VARCHAR(255),
    scanned_answer VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
    points_awarded INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, scanner_team_id, scanned_team_id)
);

-- Additional indexes for encounters
CREATE INDEX IF NOT EXISTS idx_teams_personal_qr ON teams(personal_qr_code);
CREATE INDEX IF NOT EXISTS idx_collaborative_challenges_event ON collaborative_challenges(event_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_challenges_active ON collaborative_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_team_encounters_event ON team_encounters(event_id);
CREATE INDEX IF NOT EXISTS idx_team_encounters_scanner ON team_encounters(scanner_team_id);
CREATE INDEX IF NOT EXISTS idx_team_encounters_scanned ON team_encounters(scanned_team_id);
CREATE INDEX IF NOT EXISTS idx_team_encounters_status ON team_encounters(status);

-- Triggers for new tables
CREATE TRIGGER update_collaborative_challenges_updated_at BEFORE UPDATE ON collaborative_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_encounters_updated_at BEFORE UPDATE ON team_encounters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
