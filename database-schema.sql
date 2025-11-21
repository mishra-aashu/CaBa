-- =============================================
-- CABa APP DATABASE SCHEMA
-- WebRTC Calling Tables
-- =============================================

-- Calls table for call history and management
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('voice', 'video', 'screen')),
    status VARCHAR(20) NOT NULL DEFAULT 'calling' CHECK (status IN ('calling', 'ringing', 'answered', 'completed', 'missed', 'declined', 'failed', 'busy')),
    room_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0 -- in seconds
);

-- WebRTC signaling table for peer-to-peer communication
CREATE TABLE IF NOT EXISTS webrtc_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice', 'hangup', 'ringing', 'busy')),
    purpose VARCHAR(50) DEFAULT 'call',
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_id ON calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_room_id ON calls(room_id);

CREATE INDEX IF NOT EXISTS idx_webrtc_signals_room_id ON webrtc_signals(room_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_sender_id ON webrtc_signals(sender_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_created_at ON webrtc_signals(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_signals ENABLE ROW LEVEL SECURITY;

-- Users can see their own calls
CREATE POLICY "Users can view their own calls" ON calls
    FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Users can insert calls they initiate
CREATE POLICY "Users can create calls" ON calls
    FOR INSERT WITH CHECK (auth.uid() = caller_id);

-- Users can update calls they are involved in
CREATE POLICY "Users can update their calls" ON calls
    FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Users can insert signals for rooms they are in
CREATE POLICY "Users can send signals" ON webrtc_signals
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can read signals for rooms they have access to (through calls)
CREATE POLICY "Users can read signals for their rooms" ON webrtc_signals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM calls
            WHERE calls.room_id = webrtc_signals.room_id
            AND (calls.caller_id = auth.uid() OR calls.receiver_id = auth.uid())
        )
    );

-- Realtime subscriptions
-- Enable realtime for calls table
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE webrtc_signals;

-- Grant necessary permissions
GRANT ALL ON calls TO authenticated;
GRANT ALL ON webrtc_signals TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;