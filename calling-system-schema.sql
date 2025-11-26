-- =============================================
-- PERFECT CALLING SYSTEM SCHEMA FOR REACT APP
-- WebRTC Calling with Immediate Functionality
-- =============================================

-- Drop all existing calling-related objects
DROP TABLE IF EXISTS call_history CASCADE;
DROP TABLE IF EXISTS call_signaling CASCADE;
DROP TABLE IF EXISTS user_call_settings CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS webrtc_signals CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_expired_signaling() CASCADE;
DROP FUNCTION IF EXISTS update_call_duration(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_call_history(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_default_call_settings() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_signals() CASCADE;
DROP FUNCTION IF EXISTS get_missed_calls_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_inactive_users_offline() CASCADE;

-- =============================================
-- CALL HISTORY TABLE
-- Stores complete call records
-- =============================================
CREATE TABLE call_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_id TEXT NOT NULL UNIQUE,
    call_type TEXT DEFAULT 'video' CHECK (call_type IN ('voice', 'video', 'screen')),
    call_status TEXT DEFAULT 'initiated' CHECK (call_status IN ('initiated', 'ringing', 'answered', 'ended', 'missed', 'rejected', 'failed', 'busy')),
    call_duration INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    answered_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT different_users CHECK (caller_id != receiver_id)
);

-- =============================================
-- CALL SIGNALING TABLE
-- WebRTC signaling data with auto-cleanup
-- =============================================
CREATE TABLE call_signaling (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id TEXT NOT NULL,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice_candidate', 'ringing', 'call_end', 'busy')),
    signal_data JSONB NOT NULL,
    is_processed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER CALL SETTINGS TABLE
-- User preferences for calling
-- =============================================
CREATE TABLE user_call_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    auto_answer BOOLEAN DEFAULT FALSE,
    ringtone_enabled BOOLEAN DEFAULT TRUE,
    microphone_enabled BOOLEAN DEFAULT TRUE,
    speaker_enabled BOOLEAN DEFAULT TRUE,
    call_notifications BOOLEAN DEFAULT TRUE,
    video_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_call_history_caller ON call_history(caller_id);
CREATE INDEX idx_call_history_receiver ON call_history(receiver_id);
CREATE INDEX idx_call_history_status ON call_history(call_status);
CREATE INDEX idx_call_history_call_id ON call_history(call_id);
CREATE INDEX idx_call_history_created ON call_history(created_at DESC);

CREATE INDEX idx_call_signaling_call_id ON call_signaling(call_id);
CREATE INDEX idx_call_signaling_to_user ON call_signaling(to_user_id);
CREATE INDEX idx_call_signaling_expires ON call_signaling(expires_at);
CREATE INDEX idx_call_signaling_created ON call_signaling(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Call History Policies
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call history" ON call_history
    FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create call records" ON call_history
    FOR INSERT WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their call records" ON call_history
    FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Call Signaling Policies
ALTER TABLE call_signaling ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view signals sent to them" ON call_signaling
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can send signals" ON call_signaling
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their signals" ON call_signaling
    FOR UPDATE USING (auth.uid() = from_user_id);

-- User Call Settings Policies
ALTER TABLE user_call_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their call settings" ON user_call_settings
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to clean up expired signaling data
CREATE OR REPLACE FUNCTION cleanup_expired_signaling()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM call_signaling WHERE expires_at < NOW();
END;
$$;

-- Function to update call duration
CREATE OR REPLACE FUNCTION update_call_duration(call_id_param TEXT, duration INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE call_history
    SET call_duration = duration,
        ended_at = NOW(),
        call_status = 'ended',
        updated_at = NOW()
    WHERE call_id = call_id_param;
END;
$$;

-- Function to get user's call history
CREATE OR REPLACE FUNCTION get_user_call_history(user_id_param UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    caller_id UUID,
    receiver_id UUID,
    call_type TEXT,
    call_status TEXT,
    call_duration INTEGER,
    started_at TIMESTAMPTZ,
    answered_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    other_user_name TEXT,
    other_user_phone TEXT,
    other_user_avatar TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ch.id,
        ch.caller_id,
        ch.receiver_id,
        ch.call_type,
        ch.call_status,
        ch.call_duration,
        ch.started_at,
        ch.answered_at,
        ch.ended_at,
        CASE
            WHEN ch.caller_id = user_id_param THEN u2.name
            ELSE u1.name
        END as other_user_name,
        CASE
            WHEN ch.caller_id = user_id_param THEN u2.phone
            ELSE u1.phone
        END as other_user_phone,
        CASE
            WHEN ch.caller_id = user_id_param THEN u2.avatar
            ELSE u1.avatar
        END as other_user_avatar
    FROM call_history ch
    LEFT JOIN users u1 ON ch.caller_id = u1.id
    LEFT JOIN users u2 ON ch.receiver_id = u2.id
    WHERE ch.caller_id = user_id_param OR ch.receiver_id = user_id_param
    ORDER BY ch.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Function to get missed calls count
CREATE OR REPLACE FUNCTION get_missed_calls_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count
    FROM call_history
    WHERE receiver_id = user_uuid
    AND call_status = 'missed';

    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark user as offline (for cleanup)
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
    -- This function can be used for cleanup if needed
    -- Currently just a placeholder
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create default call settings for new users
CREATE OR REPLACE FUNCTION create_default_call_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_call_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_call_history_updated_at
    BEFORE UPDATE ON call_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_call_settings_updated_at
    BEFORE UPDATE ON user_call_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER create_call_settings_on_user_insert
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_call_settings();

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================

-- Enable realtime for call tables
ALTER PUBLICATION supabase_realtime ADD TABLE call_history;
ALTER PUBLICATION supabase_realtime ADD TABLE call_signaling;

-- =============================================
-- PERMISSIONS
-- =============================================

GRANT ALL ON call_history TO authenticated;
GRANT ALL ON call_signaling TO authenticated;
GRANT ALL ON user_call_settings TO authenticated;

GRANT EXECUTE ON FUNCTION cleanup_expired_signaling TO authenticated;
GRANT EXECUTE ON FUNCTION update_call_duration(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_call_history(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_missed_calls_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_inactive_users_offline TO authenticated;

-- =============================================
-- SCHEDULED CLEANUP (Optional - run periodically)
-- =============================================

-- Note: You can set up a cron job or scheduled function to run:
-- SELECT cleanup_expired_signaling();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE call_history IS 'Complete call history with WebRTC support';
COMMENT ON TABLE call_signaling IS 'WebRTC signaling data with 2-hour expiration';
COMMENT ON TABLE user_call_settings IS 'User call preferences and settings';

COMMENT ON COLUMN call_history.call_id IS 'Unique call session identifier used for WebRTC signaling';
COMMENT ON COLUMN call_history.call_duration IS 'Call duration in seconds';
COMMENT ON COLUMN call_signaling.expires_at IS 'Signals auto-expire after 2 hours to prevent database bloat';
COMMENT ON COLUMN call_signaling.signal_type IS 'WebRTC signal types: offer, answer, ice_candidate, ringing, call_end, busy';

-- =============================================
-- INITIAL DATA (Optional)
-- =============================================

-- Insert default settings for existing users who don't have them
INSERT INTO user_call_settings (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_call_settings)
ON CONFLICT (user_id) DO NOTHING;