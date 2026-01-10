
inserted in table user 
ALTER TABLE users
ADD COLUMN is_verified BOOLEAN DEFAULT false,
ADD COLUMN otp_code VARCHAR(10),
ADD COLUMN otp_expires_at TIMESTAMP;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,

  name VARCHAR(100),

  email VARCHAR(100) UNIQUE,

  password TEXT,  -- nullable for OAuth users

  provider VARCHAR(20)
    CHECK (provider IN ('local', 'google', 'github')) DEFAULT 'local',

  provider_id VARCHAR(255),  -- Google/GitHub unique ID

  avatar_url TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


POSTS TABLE (Blog / Public Post)
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_posts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

 COMMENTS TABLE (Public Comments)
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_comments_post
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

LIKES TABLE (Public Likes)
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_post_like UNIQUE (post_id, user_id),

  CONSTRAINT fk_likes_post
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_likes_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);


🧩 1️⃣ topics — DSA Categories
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL
);

🧩 2️⃣ problems — Actual Questions
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20)
    CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

🧩 3️⃣ problem_topics — Mapping (Many-to-Many)
CREATE TABLE problem_topics (
  problem_id INT NOT NULL,
  topic_id INT NOT NULL,

  PRIMARY KEY (problem_id, topic_id),

  FOREIGN KEY (problem_id)
    REFERENCES problems(id)
    ON DELETE CASCADE,

  FOREIGN KEY (topic_id)
    REFERENCES topics(id)
    ON DELETE CASCADE
);

insert query for adding topic
INSERT INTO topics (name, slug) VALUES
('Array', 'array'),
('String', 'string'),
('Hash Table', 'hash-table'),
('Math', 'math'),
('Dynamic Programming', 'dynamic-programming'),
('Sorting', 'sorting'),
('Greedy', 'greedy'),
('Depth-First Search', 'depth-first-search'),
('Binary Search', 'binary-search'),
('Database', 'database'),
('Matrix', 'matrix'),
('Bit Manipulation', 'bit-manipulation'),
('Tree', 'tree'),
('Breadth-First Search', 'breadth-first-search'),
('Two Pointers', 'two-pointers'),
('Prefix Sum', 'prefix-sum'),
('Heap (Priority Queue)', 'heap-priority-queue'),
('Simulation', 'simulation'),
('Counting', 'counting'),
('Graph', 'graph'),
('Binary Tree', 'binary-tree'),
('Stack', 'stack'),
('Sliding Window', 'sliding-window'),
('Enumeration', 'enumeration'),
('Design', 'design'),
('Backtracking', 'backtracking'),
('Union Find', 'union-find'),
('Number Theory', 'number-theory'),
('Linked List', 'linked-list'),
('Ordered Set', 'ordered-set'),
('Segment Tree', 'segment-tree'),
('Monotonic Stack', 'monotonic-stack'),
('Trie', 'trie'),
('Divide and Conquer', 'divide-and-conquer'),
('Combinatorics', 'combinatorics'),
('Bitmask', 'bitmask'),
('Recursion', 'recursion'),
('Queue', 'queue'),
('Geometry', 'geometry'),
('Binary Indexed Tree', 'binary-indexed-tree'),
('Memoization', 'memoization'),
('Hash Function', 'hash-function'),
('Binary Search Tree', 'binary-search-tree'),
('Shortest Path', 'shortest-path'),
('String Matching', 'string-matching'),
('Topological Sort', 'topological-sort'),
('Rolling Hash', 'rolling-hash'),
('Game Theory', 'game-theory'),
('Interactive', 'interactive'),
('Data Stream', 'data-stream'),
('Monotonic Queue', 'monotonic-queue'),
('Brainteaser', 'brainteaser'),
('Doubly-Linked List', 'doubly-linked-list'),
('Merge Sort', 'merge-sort'),
('Randomized', 'randomized'),
('Counting Sort', 'counting-sort'),
('Iterator', 'iterator'),
('Concurrency', 'concurrency'),
('Quickselect', 'quickselect'),
('Suffix Array', 'suffix-array'),
('Line Sweep', 'line-sweep'),
('Probability and Statistics', 'probability-and-statistics'),
('Minimum Spanning Tree', 'minimum-spanning-tree'),
('Bucket Sort', 'bucket-sort'),
('Shell', 'shell'),
('Reservoir Sampling', 'reservoir-sampling'),
('Strongly Connected Component', 'strongly-connected-component'),
('Eulerian Circuit', 'eulerian-circuit'),
('Radix Sort', 'radix-sort'),
('Rejection Sampling', 'rejection-sampling'),
('Biconnected Component', 'biconnected-component')
ON CONFLICT (slug) DO NOTHING;



✅ NEXT STEP (Bilkul sahi): Companies tables
🧩 4️⃣ companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

Example data:
INSERT INTO companies (name) VALUES
('Google'),
('Amazon'),
('Microsoft'),
('Meta'),
('Apple'),
('Netflix'),
('Uber'),
('Adobe')
ON CONFLICT (name) DO NOTHING;

🧩 5️⃣ problem_companies table (Mapping)
CREATE TABLE problem_companies (
  problem_id INT NOT NULL,
  company_id INT NOT NULL,

  PRIMARY KEY (problem_id, company_id),

  FOREIGN KEY (problem_id)
    REFERENCES problems(id)
    ON DELETE CASCADE,

  FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE
);

CREATE TABLE test_cases (
  id SERIAL PRIMARY KEY,
  problem_id INT NOT NULL,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT false,

  FOREIGN KEY (problem_id)
    REFERENCES problems(id)
    ON DELETE CASCADE
);


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


problems (1)
   ├── problem_topics → topics (1, 3)
   ├── problem_companies → companies (2, 5)
   └── test_cases → examples + hidden


CREATE TABLE problem_templates (
  id SERIAL PRIMARY KEY,
  problem_id INT NOT NULL,
  language VARCHAR(20) NOT NULL,
  starter_code TEXT NOT NULL,
  wrapper_code TEXT NOT NULL,

  FOREIGN KEY (problem_id)
    REFERENCES problems(id)
    ON DELETE CASCADE
);
