-- 1. 사용자 세션
CREATE TABLE IF NOT EXISTS user_session (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 이미지
CREATE TABLE IF NOT EXISTS image_check (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    image_url VARCHAR(255),
    check_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES user_session(session_id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
);

-- 3. 분석 결과 (사용자용)
CREATE TABLE IF NOT EXISTS body_analysis_result (
    analysis_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_id BIGINT NOT NULL,
    body_type VARCHAR(50),
    height FLOAT,
    weight FLOAT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES image_check(image_id) ON DELETE CASCADE,
    INDEX idx_image_id (image_id)
);

-- 4. 추천 (템플릿 데이터)
CREATE TABLE IF NOT EXISTS recommendation (
    recommendation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    style_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 의상
CREATE TABLE IF NOT EXISTS outfit (
    outfit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recommendation_id BIGINT NOT NULL,
    name VARCHAR(100),
    image_url VARCHAR(255),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendation(recommendation_id) ON DELETE CASCADE,
    INDEX idx_recommendation_id (recommendation_id)
);

-- 6. 태그
CREATE TABLE IF NOT EXISTS outfit_tag_map (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    outfit_id BIGINT NOT NULL,
    tag VARCHAR(50),
    FOREIGN KEY (outfit_id) REFERENCES outfit(outfit_id) ON DELETE CASCADE,
    INDEX idx_outfit_id (outfit_id)
);

-- 7. 사용자-추천 연결 (핵심)
CREATE TABLE IF NOT EXISTS user_recommendation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    recommendation_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES user_session(session_id) ON DELETE CASCADE,
    FOREIGN KEY (recommendation_id) REFERENCES recommendation(recommendation_id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_recommendation_id (recommendation_id)
);

-- 8. 피팅 결과
CREATE TABLE IF NOT EXISTS fitting_result (
    fitting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    outfit_id BIGINT NOT NULL,
    result_image VARCHAR(255),
    score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES user_session(session_id) ON DELETE CASCADE,
    FOREIGN KEY (outfit_id) REFERENCES outfit(outfit_id) ON DELETE CASCADE
);