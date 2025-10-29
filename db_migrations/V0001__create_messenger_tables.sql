CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'developer')),
    is_friend BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

INSERT INTO users (username, password_hash, first_name, last_name, avatar_url, role, is_online) 
VALUES ('skzry', '22', 'Разработчик', 'Главный', 'https://api.dicebear.com/7.x/avataaars/svg?seed=skzry', 'developer', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, first_name, last_name, avatar_url, is_friend, last_seen) 
VALUES 
('anna_ivanova', 'demo123', 'Анна', 'Иванова', 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna', true, NOW() - INTERVAL '5 minutes'),
('mikhail_v', 'demo123', 'Михаил', 'Волков', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mikhail', false, NOW() - INTERVAL '1 hour')
ON CONFLICT (username) DO NOTHING;