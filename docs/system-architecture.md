
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  problem_id INT NOT NULL,
  language VARCHAR(20) NOT NULL,
  code TEXT NOT NULL,
  verdict VARCHAR(20)
    CHECK (verdict IN ('AC', 'WA', 'TLE', 'RE', 'CE')),
  runtime_ms INT,
  memory_kb INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (problem_id)
    REFERENCES problems(id)
    ON DELETE CASCADE
);