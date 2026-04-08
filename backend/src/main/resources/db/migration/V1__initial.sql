CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    avatar TEXT,
    google_sub VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE resources (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(512) NOT NULL,
    availability_start VARCHAR(8) NOT NULL,
    availability_end VARCHAR(8) NOT NULL,
    status VARCHAR(32) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE bookings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    resource_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    booking_date DATE NOT NULL,
    start_time VARCHAR(8) NOT NULL,
    end_time VARCHAR(8) NOT NULL,
    purpose TEXT,
    attendees INT,
    status VARCHAR(32) NOT NULL,
    review_reason TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_booking_resource FOREIGN KEY (resource_id) REFERENCES resources (id),
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE tickets (
    id CHAR(36) NOT NULL PRIMARY KEY,
    resource_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    category VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    assigned_to_id CHAR(36),
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ticket_resource FOREIGN KEY (resource_id) REFERENCES resources (id),
    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_ticket_assignee FOREIGN KEY (assigned_to_id) REFERENCES users (id)
);

CREATE TABLE ticket_comments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    ticket_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_comment_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE ticket_attachments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    ticket_id CHAR(36) NOT NULL,
    uploaded_by_id CHAR(36) NOT NULL,
    file_name VARCHAR(512) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    content LONGBLOB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_att_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_att_user FOREIGN KEY (uploaded_by_id) REFERENCES users (id)
);

CREATE TABLE notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(512) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_id CHAR(36),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_resource ON bookings (resource_id);
CREATE INDEX idx_tickets_user ON tickets (user_id);
CREATE INDEX idx_tickets_assigned ON tickets (assigned_to_id);
CREATE INDEX idx_notifications_user ON notifications (user_id);
