--
-- PostgreSQL database dump
--

\restrict JDwr4utgNmw2QSyexm8glb2AyAdCjNCxKG2gEqELy283WJ30Oq5fGrfnOPQgjD0

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: arena_session_problems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arena_session_problems (
    id integer NOT NULL,
    session_id integer NOT NULL,
    problem_id integer NOT NULL,
    order_index integer,
    is_solved boolean DEFAULT false
);


ALTER TABLE public.arena_session_problems OWNER TO postgres;

--
-- Name: arena_session_problems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arena_session_problems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.arena_session_problems_id_seq OWNER TO postgres;

--
-- Name: arena_session_problems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arena_session_problems_id_seq OWNED BY public.arena_session_problems.id;


--
-- Name: arena_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arena_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_problems integer DEFAULT 0,
    score integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ended_at timestamp without time zone,
    expires_at timestamp without time zone,
    CONSTRAINT arena_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'abandoned'::character varying])::text[])))
);


ALTER TABLE public.arena_sessions OWNER TO postgres;

--
-- Name: arena_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arena_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.arena_sessions_id_seq OWNER TO postgres;

--
-- Name: arena_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arena_sessions_id_seq OWNED BY public.arena_sessions.id;


--
-- Name: arena_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arena_submissions (
    id integer NOT NULL,
    problem_id integer NOT NULL,
    user_id integer NOT NULL,
    language character varying(20) NOT NULL,
    code text NOT NULL,
    verdict character varying(20),
    runtime_ms integer,
    memory_kb integer,
    time_complexity character varying(50),
    space_complexity character varying(50),
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds integer,
    session_id integer,
    CONSTRAINT arena_submissions_verdict_check CHECK (((verdict)::text = ANY ((ARRAY['AC'::character varying, 'WA'::character varying, 'TLE'::character varying, 'MLE'::character varying, 'RE'::character varying, 'CE'::character varying])::text[])))
);


ALTER TABLE public.arena_submissions OWNER TO postgres;

--
-- Name: arena_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arena_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.arena_submissions_id_seq OWNER TO postgres;

--
-- Name: arena_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arena_submissions_id_seq OWNED BY public.arena_submissions.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: contest_participation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contest_participation (
    id integer NOT NULL,
    user_id integer NOT NULL,
    contest_id integer NOT NULL,
    status character varying(20) DEFAULT 'started'::character varying,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp without time zone,
    CONSTRAINT contest_participation_status_check CHECK (((status)::text = ANY ((ARRAY['started'::character varying, 'finished'::character varying, 'disqualified'::character varying])::text[])))
);


ALTER TABLE public.contest_participation OWNER TO postgres;

--
-- Name: contest_participation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contest_participation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contest_participation_id_seq OWNER TO postgres;

--
-- Name: contest_participation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contest_participation_id_seq OWNED BY public.contest_participation.id;


--
-- Name: contest_problems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contest_problems (
    contest_id integer NOT NULL,
    problem_id integer NOT NULL,
    problem_order integer,
    points integer DEFAULT 100
);


ALTER TABLE public.contest_problems OWNER TO postgres;

--
-- Name: contest_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contest_submissions (
    id integer NOT NULL,
    contest_id integer NOT NULL,
    user_id integer NOT NULL,
    problem_id integer NOT NULL,
    language character varying(20) NOT NULL,
    code text NOT NULL,
    verdict character varying(20),
    runtime_ms integer,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contest_submissions OWNER TO postgres;

--
-- Name: contest_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contest_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contest_submissions_id_seq OWNER TO postgres;

--
-- Name: contest_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contest_submissions_id_seq OWNED BY public.contest_submissions.id;


--
-- Name: contests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contests (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    is_published boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contests OWNER TO postgres;

--
-- Name: contests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contests_id_seq OWNER TO postgres;

--
-- Name: contests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contests_id_seq OWNED BY public.contests.id;


--
-- Name: global_leaderboard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_leaderboard (
    user_id integer NOT NULL,
    universal_score integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.global_leaderboard OWNER TO postgres;

--
-- Name: leaderboard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaderboard (
    user_id integer NOT NULL,
    username character varying(100),
    avatar_url text,
    practice_score integer DEFAULT 0,
    arena_score integer DEFAULT 0,
    contest_score integer DEFAULT 0,
    total_score integer DEFAULT 0,
    global_rank integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leaderboard OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.likes_id_seq OWNER TO postgres;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: otp_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otp_verifications (
    id integer NOT NULL,
    user_id integer,
    email character varying(100) NOT NULL,
    otp_hash text NOT NULL,
    purpose character varying(30) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT otp_verifications_purpose_check CHECK (((purpose)::text = ANY ((ARRAY['register'::character varying, 'forgot_password'::character varying])::text[])))
);


ALTER TABLE public.otp_verifications OWNER TO postgres;

--
-- Name: otp_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otp_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.otp_verifications_id_seq OWNER TO postgres;

--
-- Name: otp_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otp_verifications_id_seq OWNED BY public.otp_verifications.id;


--
-- Name: platform_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_scores (
    id integer NOT NULL,
    user_id integer NOT NULL,
    platform_id integer NOT NULL,
    normalized_score numeric(6,2) NOT NULL,
    calculated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.platform_scores OWNER TO postgres;

--
-- Name: platform_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.platform_scores_id_seq OWNER TO postgres;

--
-- Name: platform_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_scores_id_seq OWNED BY public.platform_scores.id;


--
-- Name: platform_stats_raw; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_stats_raw (
    id integer NOT NULL,
    user_platform_id integer NOT NULL,
    problems_solved integer,
    rating integer,
    contests_participated integer,
    global_rank integer,
    fetched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    easy_solved integer DEFAULT 0,
    medium_solved integer DEFAULT 0,
    hard_solved integer DEFAULT 0
);


ALTER TABLE public.platform_stats_raw OWNER TO postgres;

--
-- Name: platform_stats_raw_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_stats_raw_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.platform_stats_raw_id_seq OWNER TO postgres;

--
-- Name: platform_stats_raw_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_stats_raw_id_seq OWNED BY public.platform_stats_raw.id;


--
-- Name: platforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platforms (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    base_url text NOT NULL
);


ALTER TABLE public.platforms OWNER TO postgres;

--
-- Name: platforms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platforms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.platforms_id_seq OWNER TO postgres;

--
-- Name: platforms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platforms_id_seq OWNED BY public.platforms.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255),
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: problem_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problem_companies (
    problem_id integer NOT NULL,
    company_id integer NOT NULL
);


ALTER TABLE public.problem_companies OWNER TO postgres;

--
-- Name: problem_solutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problem_solutions (
    id integer NOT NULL,
    problem_id integer NOT NULL,
    language character varying(20) NOT NULL,
    solution_type character varying(20) NOT NULL,
    explanation text NOT NULL,
    code text NOT NULL,
    time_complexity character varying(50),
    space_complexity character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT problem_solutions_solution_type_check CHECK (((solution_type)::text = ANY ((ARRAY['brute_force'::character varying, 'optimal'::character varying, 'most_optimal'::character varying])::text[])))
);


ALTER TABLE public.problem_solutions OWNER TO postgres;

--
-- Name: problem_solutions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.problem_solutions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.problem_solutions_id_seq OWNER TO postgres;

--
-- Name: problem_solutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.problem_solutions_id_seq OWNED BY public.problem_solutions.id;


--
-- Name: problem_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problem_templates (
    id integer NOT NULL,
    problem_id integer NOT NULL,
    language character varying(20) NOT NULL,
    starter_code text NOT NULL,
    wrapper_code text NOT NULL
);


ALTER TABLE public.problem_templates OWNER TO postgres;

--
-- Name: problem_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.problem_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.problem_templates_id_seq OWNER TO postgres;

--
-- Name: problem_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.problem_templates_id_seq OWNED BY public.problem_templates.id;


--
-- Name: problem_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problem_topics (
    problem_id integer NOT NULL,
    topic_id integer NOT NULL
);


ALTER TABLE public.problem_topics OWNER TO postgres;

--
-- Name: problems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problems (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    difficulty character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    slug character varying(200),
    constraints text,
    time_limit_ms integer DEFAULT 2000,
    memory_limit_mb integer DEFAULT 256,
    CONSTRAINT problems_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['Easy'::character varying, 'Medium'::character varying, 'Hard'::character varying])::text[])))
);


ALTER TABLE public.problems OWNER TO postgres;

--
-- Name: problems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.problems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.problems_id_seq OWNER TO postgres;

--
-- Name: problems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.problems_id_seq OWNED BY public.problems.id;


--
-- Name: profile_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_views (
    id integer NOT NULL,
    viewer_id integer,
    profile_id integer,
    viewed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.profile_views OWNER TO postgres;

--
-- Name: profile_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profile_views_id_seq OWNER TO postgres;

--
-- Name: profile_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_views_id_seq OWNED BY public.profile_views.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    problem_id integer NOT NULL,
    language character varying(20) NOT NULL,
    code text NOT NULL,
    verdict character varying(20) NOT NULL,
    runtime_ms integer,
    memory_kb integer,
    time_complexity_static character varying(50),
    space_complexity_static character varying(50),
    time_complexity_ml character varying(50),
    space_complexity_ml character varying(50),
    ml_confidence numeric(5,2),
    complexity_source character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT submissions_complexity_source_check CHECK (((complexity_source)::text = ANY ((ARRAY['static'::character varying, 'ml'::character varying, 'unknown'::character varying])::text[]))),
    CONSTRAINT submissions_verdict_check CHECK (((verdict)::text = ANY ((ARRAY['AC'::character varying, 'WA'::character varying, 'TLE'::character varying, 'RE'::character varying, 'CE'::character varying, 'MLE'::character varying])::text[])))
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.submissions_id_seq OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: test_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_cases (
    id integer NOT NULL,
    problem_id integer NOT NULL,
    input text NOT NULL,
    expected_output text NOT NULL,
    is_sample boolean DEFAULT false
);


ALTER TABLE public.test_cases OWNER TO postgres;

--
-- Name: test_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_cases_id_seq OWNER TO postgres;

--
-- Name: test_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_cases_id_seq OWNED BY public.test_cases.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.topics_id_seq OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: universal_leaderboard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.universal_leaderboard (
    user_id integer NOT NULL,
    universal_score numeric(6,2) NOT NULL,
    rank integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.universal_leaderboard OWNER TO postgres;

--
-- Name: user_platform_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_platform_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    platform_id integer NOT NULL,
    username character varying(100),
    profile_url text,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verification_token text,
    is_verified boolean DEFAULT false
);


ALTER TABLE public.user_platform_profiles OWNER TO postgres;

--
-- Name: user_platform_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_platform_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_platform_profiles_id_seq OWNER TO postgres;

--
-- Name: user_platform_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_platform_profiles_id_seq OWNED BY public.user_platform_profiles.id;


--
-- Name: user_platform_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_platform_stats (
    user_id integer NOT NULL,
    platform character varying(50) NOT NULL,
    total_solved integer DEFAULT 0,
    easy_solved integer DEFAULT 0,
    medium_solved integer DEFAULT 0,
    hard_solved integer DEFAULT 0,
    contest_rating integer DEFAULT 0,
    reputation integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_platform_stats OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    password text,
    provider character varying(20) DEFAULT 'local'::character varying,
    provider_id character varying(255),
    avatar_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified boolean DEFAULT false,
    role character varying(20) DEFAULT 'user'::character varying,
    username character varying(50),
    bio text,
    social_links jsonb DEFAULT '{}'::jsonb,
    is_public boolean DEFAULT true,
    views_count integer DEFAULT 0,
    CONSTRAINT users_provider_check CHECK (((provider)::text = ANY ((ARRAY['local'::character varying, 'google'::character varying, 'github'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: arena_session_problems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_session_problems ALTER COLUMN id SET DEFAULT nextval('public.arena_session_problems_id_seq'::regclass);


--
-- Name: arena_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_sessions ALTER COLUMN id SET DEFAULT nextval('public.arena_sessions_id_seq'::regclass);


--
-- Name: arena_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_submissions ALTER COLUMN id SET DEFAULT nextval('public.arena_submissions_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: contest_participation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_participation ALTER COLUMN id SET DEFAULT nextval('public.contest_participation_id_seq'::regclass);


--
-- Name: contest_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_submissions ALTER COLUMN id SET DEFAULT nextval('public.contest_submissions_id_seq'::regclass);


--
-- Name: contests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contests ALTER COLUMN id SET DEFAULT nextval('public.contests_id_seq'::regclass);


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: otp_verifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications ALTER COLUMN id SET DEFAULT nextval('public.otp_verifications_id_seq'::regclass);


--
-- Name: platform_scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_scores ALTER COLUMN id SET DEFAULT nextval('public.platform_scores_id_seq'::regclass);


--
-- Name: platform_stats_raw id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_stats_raw ALTER COLUMN id SET DEFAULT nextval('public.platform_stats_raw_id_seq'::regclass);


--
-- Name: platforms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms ALTER COLUMN id SET DEFAULT nextval('public.platforms_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: problem_solutions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_solutions ALTER COLUMN id SET DEFAULT nextval('public.problem_solutions_id_seq'::regclass);


--
-- Name: problem_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_templates ALTER COLUMN id SET DEFAULT nextval('public.problem_templates_id_seq'::regclass);


--
-- Name: problems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems ALTER COLUMN id SET DEFAULT nextval('public.problems_id_seq'::regclass);


--
-- Name: profile_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views ALTER COLUMN id SET DEFAULT nextval('public.profile_views_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: test_cases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_cases ALTER COLUMN id SET DEFAULT nextval('public.test_cases_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: user_platform_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_platform_profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: arena_session_problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arena_session_problems (id, session_id, problem_id, order_index, is_solved) FROM stdin;
377	97	2	1	f
378	97	8	2	f
379	97	4	3	f
376	97	1	0	t
380	98	20	0	f
381	98	8	1	f
382	98	18	2	f
383	98	4	3	f
384	99	7	0	f
385	99	21	1	f
386	99	8	2	f
387	99	4	3	f
388	100	7	0	f
389	100	22	1	f
390	100	6	2	f
391	100	4	3	f
393	101	22	1	f
394	101	21	2	f
395	101	4	3	f
392	101	1	0	t
\.


--
-- Data for Name: arena_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arena_sessions (id, user_id, total_problems, score, status, started_at, ended_at, expires_at) FROM stdin;
97	59	4	8	active	2026-01-24 21:44:18.342737	\N	2026-01-24 23:14:18.341
98	54	4	0	active	2026-01-24 22:36:34.997309	\N	2026-01-25 00:06:34.995
99	59	4	0	active	2026-01-25 15:07:12.54299	\N	2026-01-25 16:37:12.542
100	59	4	0	active	2026-01-25 15:07:27.05639	\N	2026-01-25 16:37:27.056
101	59	4	8	active	2026-01-25 15:07:41.548074	\N	2026-01-25 16:37:41.547
\.


--
-- Data for Name: arena_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arena_submissions (id, problem_id, user_id, language, code, verdict, runtime_ms, memory_kb, time_complexity, space_complexity, submitted_at, time_taken_seconds, session_id) FROM stdin;
50	1	59	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1313	0	O(1)	O(1)	2026-01-24 21:45:31.157723	2	97
51	1	59	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1337	0	O(1)	O(1)	2026-01-24 21:45:42.628254	2	97
52	1	59	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1272	0	O(1)	O(1)	2026-01-25 15:09:15.953517	2	101
53	1	59	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1235	0	O(1)	O(1)	2026-01-25 15:09:27.801257	2	101
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, post_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name) FROM stdin;
1	Meta
2	Google
3	Uber
4	Bloomberg
5	Amazon
6	Microsoft
7	Apple
8	Infosys
9	Citadel
10	LinkedIn
11	TikTok
12	Adobe
13	Oracle
14	Nvidia
15	Salesforce
16	Goldman Sachs
17	Snap
18	DoorDash
19	IBM
20	Databricks
21	Capital One
22	Atlassian
23	Snowflake
24	J.P. Morgan
25	Walmart Labs
26	TCS
27	Visa
28	eBay
29	Netflix
30	ByteDance
31	Airbnb
32	Roblox
33	Pinterest
34	PayPal
35	Accenture
36	Yandex
37	Intuit
38	Tesla
39	Zoho
40	OpenAI
41	ServiceNow
42	DE Shaw
43	X
44	Qualcomm
45	Palantir Technologies
46	Yahoo
47	Expedia
48	Coupang
49	Cisco
50	Two Sigma
51	Agoda
52	Lyft
53	Jane Street
54	Stripe
55	Cognizant
56	Waymo
57	Palo Alto Networks
58	Nutanix
59	Morgan Stanley
60	Rubrik
61	SAP
62	Rippling
63	Robinhood
64	Swiggy
65	Flipkart
66	Samsung
67	Hudson River Trading
68	Coinbase
69	Dropbox
70	Booking.com
71	MathWorks
72	DocuSign
73	Anduril
74	Datadog
75	PhonePe
76	Squarepoint Capital
77	Affirm
78	Intel
79	Capgemini
80	Optiver
81	VMware
82	Arista Networks
83	Spotify
84	Akuna Capital
85	Huawei
86	MongoDB
87	EPAM Systems
88	Paytm
89	Zillow
90	Arcesium
91	Block
92	American Express
93	Deloitte
94	Wayfair
95	BlackRock
96	Myntra
97	Media.net
98	Deutsche Bank
99	ZScaler
100	GoDaddy
101	Wipro
\.


--
-- Data for Name: contest_participation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contest_participation (id, user_id, contest_id, status, started_at, finished_at) FROM stdin;
2	40	18	finished	2026-01-22 21:22:11.166433	2026-01-22 21:22:16.956265
3	40	19	finished	2026-01-22 21:24:08.353302	2026-01-22 21:24:12.886689
5	40	27	finished	2026-01-22 22:03:43.284411	2026-01-22 22:03:48.375969
7	40	29	finished	2026-01-22 22:18:19.594199	2026-01-22 22:18:22.823036
8	40	28	finished	2026-01-22 22:25:19.296662	2026-01-22 22:25:23.968802
10	40	32	finished	2026-01-24 21:30:57.848226	2026-01-24 21:31:02.603798
11	40	33	finished	2026-01-24 21:32:35.641043	2026-01-24 21:32:38.928503
\.


--
-- Data for Name: contest_problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contest_problems (contest_id, problem_id, problem_order, points) FROM stdin;
35	18	1	100
35	2	2	100
35	3	3	100
35	4	4	100
\.


--
-- Data for Name: contest_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contest_submissions (id, contest_id, user_id, problem_id, language, code, verdict, runtime_ms, submitted_at) FROM stdin;
\.


--
-- Data for Name: contests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contests (id, title, description, start_time, end_time, is_published, created_by, created_at) FROM stdin;
35	test	test	2026-01-24 17:37:59.1	2026-01-24 17:50:02.851	t	40	2026-01-24 23:06:18.425992
\.


--
-- Data for Name: global_leaderboard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_leaderboard (user_id, universal_score, updated_at) FROM stdin;
54	1364	2026-01-24 22:29:49.511761
40	0	2026-01-24 23:55:29.455712
59	4901	2026-01-25 00:00:56.927045
37	6781	2026-01-25 00:04:08.782515
\.


--
-- Data for Name: leaderboard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaderboard (user_id, username, avatar_url, practice_score, arena_score, contest_score, total_score, global_rank, updated_at) FROM stdin;
54	\N	\N	0	0	0	0	\N	2026-01-24 18:53:14.804488
59	\N	\N	100	8	0	108	\N	2026-01-25 01:41:10.849001
37	\N	\N	10	0	0	10	\N	2026-01-25 13:02:33.670578
38	\N	\N	0	0	0	0	\N	2026-01-22 23:03:30.053739
40	\N	\N	70	0	0	70	\N	2026-01-22 23:03:30.056812
41	\N	\N	0	0	0	0	\N	2026-01-22 23:03:30.060158
42	\N	\N	0	0	0	0	\N	2026-01-22 23:03:30.063841
43	\N	\N	0	0	0	0	\N	2026-01-22 23:03:30.065629
45	\N	\N	10	0	0	10	\N	2026-01-23 23:10:00.704827
46	\N	\N	0	0	0	0	\N	2026-01-24 00:39:54.671887
48	\N	\N	0	0	0	0	\N	2026-01-24 00:44:39.276295
49	\N	\N	0	0	0	0	\N	2026-01-24 00:46:57.985322
50	\N	\N	0	0	0	0	\N	2026-01-24 00:52:41.338006
51	\N	\N	0	0	0	0	\N	2026-01-24 00:53:58.076118
52	\N	\N	0	0	0	0	\N	2026-01-24 00:59:25.044339
53	\N	\N	0	0	0	0	\N	2026-01-24 01:00:51.849461
56	\N	\N	0	0	0	0	\N	2026-01-24 01:07:06.950377
58	\N	\N	0	0	0	0	\N	2026-01-24 01:14:28.034732
39	\N	\N	0	0	0	0	\N	2026-01-24 03:52:11.956817
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, post_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: otp_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otp_verifications (id, user_id, email, otp_hash, purpose, expires_at, used, created_at) FROM stdin;
21	50	mannanayan647@gmail.com	$2b$10$h9ncGRjKXIX9dnKUcsMHQ.IytYlmLbGNgmLuzGoM2iS8WI9Ug74p6	register	2026-01-24 01:00:30.916	t	2026-01-24 00:50:30.919367
22	51	2303031050343@paruluniversity.ac.in	$2b$10$pakC74pZCXCBMRqONDfvaefaPX9C9HtOje/E6AmknHcTHeE.UsG7e	register	2026-01-24 01:03:19.327	t	2026-01-24 00:53:19.32826
23	52	rajkrishna3233.o@gmail.com	$2b$10$TXi9YYtvAZuyRvvx/Fs6i.eqVTOpYB5id3XKVWcuSc78axlQt5nAC	register	2026-01-24 01:08:38.626	t	2026-01-24 00:58:38.627277
24	53	pr2177024@gmail.com	$2b$10$F3dkrvFF5vib6VdKfTTW3.K70.aQaC7Qe6ETQ8M82CpU9N/Hl7loS	register	2026-01-24 01:10:26.739	t	2026-01-24 01:00:26.740852
25	54	nayanmanna322@gmail.com	$2b$10$CFmvz8CHY61RF9a00u.b2eVs0uLup8PS6OAQQwYJOpy1iwnC75Kp2	register	2026-01-24 01:11:35.354	t	2026-01-24 01:01:35.355468
26	55	2430331460748@paruluniversity.ac.in	$2b$10$Nuyu62cJ5viikwJ9CkjeH.qxpbwjl8diBd4lwdu3W9ixSPmzOgJQi	register	2026-01-24 01:15:23.645	f	2026-01-24 01:05:23.646673
27	56	2403031460748@paruluniversity.ac.in	$2b$10$iI1kaN1aMVpalXKpleTfXuiron8DtiGkl8ehP2cwDK0nvjp34OXx6	register	2026-01-24 01:16:46.276	t	2026-01-24 01:06:46.277787
28	57	mansit24@gmail.com	$2b$10$8D/m5vEfVMj1Fr9xU692ieo2XfOprjBlIlDesI.YP.cWhanzic3zK	register	2026-01-24 01:20:03.73	f	2026-01-24 01:10:03.731225
8	37	avnisharmavni@gmail.com	$2b$10$yS.YAcNr8T/EszeI5uRSmeTTk8bVLbNQL0oFEAQ42vlaO3/gM3mQO	register	2026-01-19 12:43:45.065	t	2026-01-19 12:33:45.068113
9	38	himanshuprusty816@gmail.com	$2b$10$fhvry449hC5K8VzZj.JOre7UTWtoGvLi4Iwfzl0M.CZk5pj.LZ46G	register	2026-01-20 16:44:20.579	t	2026-01-20 16:34:20.582652
11	39	roykishan532@gmail.com	$2b$10$Zso5HM4YICezO0hIO30/mO.piRBt/pz4gDAuC17OnGPzxZL3qKVFG	register	2026-01-20 22:15:33.351	f	2026-01-20 22:05:33.356642
12	42	vennela.tandra35379@paruluniversiy.ac.in	$2b$10$y.WQzQAWYEeKD0M7lb.XR.iDPCBg.yEVjtjHzQ5xxxmrtFnV9LWD2	register	2026-01-21 10:37:46.942	f	2026-01-21 10:27:46.950514
13	43	vennela.tandra35379@paruluniversity.ac.in	$2b$10$51W3dy6/4BBA14KdioxzG.D8fRu8IeYkP85fNTVKNPMoUXxkIZ0NO	register	2026-01-21 10:39:34.699	t	2026-01-21 10:29:34.704826
14	44	adarshtiwari1979@gmail.com	$2b$10$xiFjlOCNiVp4JPmAD5s1CuXbOL0Ys/kP2UzA8Txv.CBkb53FBvIYK	register	2026-01-23 21:44:16.693	t	2026-01-23 21:34:16.694451
15	45	yugtiv338@gmail.com	$2b$10$kTYbJf9YDWQFAE1gjS3WBe5LueIrVRSM2rKZMAnudOuAx/29948ua	register	2026-01-23 23:11:27.083	t	2026-01-23 23:01:27.085219
29	58	mansit2411@gmail.com	$2b$10$RLZb7ZuinZ2MJRvJb/HCo.jt1o/Jt.iszvGqZiUp8q.PF//EiICA6	register	2026-01-24 01:22:40.724	t	2026-01-24 01:12:40.726651
16	37	avnisharmavni@gmail.com	$2b$10$IzUDc7y/etC/5MmQr7uhOer1zKRptFspt8aPbDzrVM.l9ZegdaL9i	forgot_password	2026-01-24 00:36:34.238	t	2026-01-24 00:26:34.242689
17	46	2303031050068@paruluniversity.ac.in	$2b$10$HFSuH/MC1MVK14oAX/snYuXEL9pIv/cRu92LjCDP/wMZGqqJMV4ui	register	2026-01-24 00:48:40.281	t	2026-01-24 00:38:40.282999
18	47	2303031050540@paruluniversity.ac.in	$2b$10$2oTbA.L92Src48B9JiOZl.x69UH9YNgDEmLjZzYXWnb982n6zqVDe	register	2026-01-24 00:51:37.264	f	2026-01-24 00:41:37.265955
19	48	chikisharmachiki1@gmail.com	$2b$10$N7rQ15QJ.qv1FFITq2YRKeGiPXyAfoDVQeKxNpE8jFRnSMk.CMlDO	register	2026-01-24 00:53:49.804	t	2026-01-24 00:43:49.806355
20	49	sharmaavikw@gmail.com	$2b$10$L7aRtfCqms8rxnxDW2bPrOg.jfzbC3Sf/13fXEVomFKPZ0VkuiRse	register	2026-01-24 00:56:26.753	t	2026-01-24 00:46:26.754478
30	59	kishanroy1001@gmail.com	$2b$10$MmyN5hYKsVl8jW8nWDefL.uKjpRzszWg49oeFRII5rknkAQHXzLGq	register	2026-01-24 02:10:14.182	t	2026-01-24 02:00:14.185568
\.


--
-- Data for Name: platform_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_scores (id, user_id, platform_id, normalized_score, calculated_at) FROM stdin;
\.


--
-- Data for Name: platform_stats_raw; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_stats_raw (id, user_platform_id, problems_solved, rating, contests_participated, global_rank, fetched_at, easy_solved, medium_solved, hard_solved) FROM stdin;
195	208	155	0	\N	\N	2026-01-24 22:29:49.506273	77	69	9
170	161	27	864	\N	\N	2026-01-25 00:00:54.226323	25	1	1
173	166	0	1290	\N	\N	2026-01-25 00:00:54.728848	0	0	0
189	174	25	84	\N	\N	2026-01-25 00:00:55.657068	0	0	0
194	180	20	0	\N	\N	2026-01-25 00:00:56.921048	0	0	0
207	241	451	1359	\N	\N	2026-01-25 00:04:08.777346	184	246	21
\.


--
-- Data for Name: platforms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platforms (id, name, slug, base_url) FROM stdin;
1	LeetCode	leetcode	https://leetcode.com
2	Codeforces	codeforces	https://codeforces.com
3	CodeChef	codechef	https://www.codechef.com
4	GeeksforGeeks	geeksforgeeks	https://www.geeksforgeeks.org
5	HackerRank	hackerrank	https://www.hackerrank.com
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, user_id, title, content, created_at) FROM stdin;
38	39	What Practicing 1000 DSA Problems Taught Me	Practicing 1000+ DSA problems has been one of the most transformative parts of my learning journey. Initially, it felt overwhelming—different patterns, edge cases, and constant mistakes. But over time, something clicked.\n\nI learned that DSA is less about memorizing solutions and more about recognizing patterns. Problems that once took hours now feel familiar because the underlying logic repeats. This journey also taught me the importance of consistency over intensity—solving a few problems daily mattered more than cramming.\n\nAnother major lesson was learning to fail fast and reflect. Each wrong submission highlighted a gap in understanding, pushing me to revisit fundamentals like recursion, dynamic programming, and time-space trade-offs. Debugging improved my patience and clarity of thought.\n\nMost importantly, these 1000 questions built confidence. Not because I know everything, but because I now trust my ability to break down any problem logically.\n\nStill learning. Still improving 🚀	2026-01-25 14:32:48.292995
39	59	What Interviewing with Google Taught Me	I recently had the opportunity to interview with Google, and the experience was both challenging and incredibly insightful.\n\nThe interview process was well-structured and focused heavily on problem-solving, fundamentals, and clarity of thought rather than just memorized answers. The interviewers were professional, calm, and encouraging, which made it easier to think out loud and explain my approach. I was given real-world style problems where the emphasis was on how you break down a problem, optimize solutions, and handle edge cases.\n\nWhat stood out the most was the importance of communication—explaining trade-offs, asking clarifying questions, and improving solutions step by step mattered as much as reaching the final answer.\n\nRegardless of the outcome, this experience taught me a lot about my strengths, gaps, and how to prepare better. It reinforced the value of strong fundamentals in DSA, system thinking, and consistency.\n\nGrateful for the learning experience and motivated to keep improving 🚀	2026-01-25 14:33:34.819734
\.


--
-- Data for Name: problem_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problem_companies (problem_id, company_id) FROM stdin;
1	2
1	5
2	2
2	5
2	6
2	7
2	3
2	1
2	12
2	24
2	4
2	13
2	15
3	1
3	2
3	3
3	5
3	6
3	7
3	13
3	12
3	15
3	24
3	34
3	26
3	35
4	1
4	2
4	5
4	6
4	15
4	3
5	5
5	6
5	1
5	2
5	7
5	4
5	8
5	12
5	26
5	101
6	2
6	5
6	6
6	1
6	7
6	3
6	12
6	16
6	34
6	65
8	2
8	6
8	1
8	5
8	3
8	4
8	12
8	16
8	29
18	5
18	2
18	6
18	1
18	7
18	12
18	4
18	3
18	16
21	2
21	5
21	6
21	1
21	7
21	12
21	3
21	4
21	16
21	15
22	2
22	5
22	1
22	6
22	12
23	2
23	12
23	6
23	1
23	5
\.


--
-- Data for Name: problem_solutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problem_solutions (id, problem_id, language, solution_type, explanation, code, time_complexity, space_complexity, created_at) FROM stdin;
1	1	cpp	most_optimal	Uses an unordered_map to store visited elements and their indices, allowing the target pair to be found in a single pass.	class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int need = target - nums[i];\n            if (mp.find(need) != mp.end()) {\n                return {mp[need], i};\n            }\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};	O(n)	O(n)	2026-01-14 22:57:19.921163
2	1	cpp	brute_force	Checks every possible pair of elements using two nested loops to find the target sum.	class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        for(int i = 0; i < nums.size(); i++){\n            for(int j = i + 1; j < nums.size(); j++){\n                if(nums[i] + nums[j] == target)\n                    return {i, j};\n            }\n        }\n        return {};\n    }\n};	O(n^2)	O(1)	2026-01-14 22:57:56.746674
3	1	cpp	optimal	Stores elements with their original indices, sorts them, and then applies the two-pointer technique to find the target sum.	class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {      \n        vector<pair<int,int>> vp;\n        for(int i = 0; i < nums.size(); i++){\n            vp.push_back({nums[i], i});\n        }\n\n        sort(vp.begin(), vp.end());\n\n        int i = 0;\n        int j = nums.size() - 1;\n\n        while(i < j){\n            int sum = vp[i].first + vp[j].first;\n            if(sum < target){\n                i++;\n            }\n            else if(sum > target){\n                j--;\n            }\n            else{\n                return {vp[i].second, vp[j].second};\n            }\n        }\n        return {};\n    }\n};	O(n log n)	O(n)	2026-01-14 22:58:37.29106
4	1	python	most_optimal	Uses a dictionary to store visited elements and their indices, allowing the target pair to be found in a single pass.	class Solution:\n    def twoSum(self, nums, target):\n        mp = {}\n        for i in range(len(nums)):\n            need = target - nums[i]\n            if need in mp:\n                return [mp[need], i]\n            mp[nums[i]] = i\n        return []	O(n)	O(n)	2026-01-15 00:04:28.361833
5	1	python	brute_force	Checks every possible pair of elements using two nested loops to find the target sum.	class Solution:\n    def twoSum(self, nums, target):\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []	O(n^2)	O(1)	2026-01-15 00:05:08.347032
6	1	python	optimal	Stores elements with their original indices, sorts them, and then applies the two-pointer technique to find the target sum.	class Solution:\n    def twoSum(self, nums, target):\n        vp = []\n        for i in range(len(nums)):\n            vp.append((nums[i], i))\n\n        vp.sort()\n\n        i = 0\n        j = len(nums) - 1\n\n        while i < j:\n            s = vp[i][0] + vp[j][0]\n            if s < target:\n                i += 1\n            elif s > target:\n                j -= 1\n            else:\n                return [vp[i][1], vp[j][1]]\n        return []	O(n log n)	O(n)	2026-01-15 00:05:43.78549
7	1	c	brute_force	Checks every possible pair using two nested loops to find the target sum.	int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    for(int i = 0; i < numsSize; i++){\n        for(int j = i + 1; j < numsSize; j++){\n            if(nums[i] + nums[j] == target){\n                result[0] = i;\n                result[1] = j;\n                return result;\n            }\n        }\n    }\n    *returnSize = 0;\n    return NULL;\n}	O(n^2)	O(1)	2026-01-15 00:08:19.515141
8	1	c	optimal	Stores elements with indices, sorts them, and applies the two-pointer technique.	typedef struct {\n    int value;\n    int index;\n} Pair;\n\nint compare(const void* a, const void* b) {\n    return ((Pair*)a)->value - ((Pair*)b)->value;\n}\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    Pair* arr = (Pair*)malloc(numsSize * sizeof(Pair));\n    for(int i = 0; i < numsSize; i++){\n        arr[i].value = nums[i];\n        arr[i].index = i;\n    }\n\n    qsort(arr, numsSize, sizeof(Pair), compare);\n\n    int i = 0, j = numsSize - 1;\n    int* result = (int*)malloc(2 * sizeof(int));\n    *returnSize = 2;\n\n    while(i < j){\n        int sum = arr[i].value + arr[j].value;\n        if(sum < target) i++;\n        else if(sum > target) j--;\n        else{\n            result[0] = arr[i].index;\n            result[1] = arr[j].index;\n            free(arr);\n            return result;\n        }\n    }\n\n    free(arr);\n    *returnSize = 0;\n    return NULL;\n}	O(n log n)	O(n)	2026-01-15 00:08:31.68455
9	1	c	most_optimal	Uses a hash table to store visited elements and find the target pair in one pass.	#define SIZE 10007\n\ntypedef struct Node {\n    int key;\n    int value;\n    struct Node* next;\n} Node;\n\nNode* table[SIZE];\n\nint hash(int key) {\n    return (key % SIZE + SIZE) % SIZE;\n}\n\nvoid insert(int key, int value) {\n    int h = hash(key);\n    Node* node = (Node*)malloc(sizeof(Node));\n    node->key = key;\n    node->value = value;\n    node->next = table[h];\n    table[h] = node;\n}\n\nint find(int key) {\n    int h = hash(key);\n    Node* curr = table[h];\n    while(curr){\n        if(curr->key == key)\n            return curr->value;\n        curr = curr->next;\n    }\n    return -1;\n}\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    for(int i = 0; i < SIZE; i++)\n        table[i] = NULL;\n\n    int* result = (int*)malloc(2 * sizeof(int));\n    *returnSize = 2;\n\n    for(int i = 0; i < numsSize; i++){\n        int need = target - nums[i];\n        int idx = find(need);\n        if(idx != -1){\n            result[0] = idx;\n            result[1] = i;\n            return result;\n        }\n        insert(nums[i], i);\n    }\n\n    *returnSize = 0;\n    return NULL;\n}	O(n)	O(n)	2026-01-15 00:08:45.222126
11	1	java	brute_force	Checks every possible pair using two nested loops to find the target sum.	class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for(int i = 0; i < nums.length; i++){\n            for(int j = i + 1; j < nums.length; j++){\n                if(nums[i] + nums[j] == target){\n                    return new int[]{i, j};\n                }\n            }\n        }\n        return new int[]{};\n    }\n}	O(n^2)	O(1)	2026-01-15 00:09:50.301818
12	1	java	optimal	Stores elements with their original indices, sorts them, and applies the two-pointer technique.	import java.util.*;\n\nclass Solution {\n    static class Pair {\n        int value;\n        int index;\n        Pair(int v, int i) {\n            value = v;\n            index = i;\n        }\n    }\n\n    public int[] twoSum(int[] nums, int target) {\n        Pair[] arr = new Pair[nums.length];\n        for(int i = 0; i < nums.length; i++){\n            arr[i] = new Pair(nums[i], i);\n        }\n\n        Arrays.sort(arr, (a, b) -> a.value - b.value);\n\n        int i = 0, j = nums.length - 1;\n        while(i < j){\n            int sum = arr[i].value + arr[j].value;\n            if(sum < target) i++;\n            else if(sum > target) j--;\n            else return new int[]{arr[i].index, arr[j].index};\n        }\n        return new int[]{};\n    }\n}	O(n log n)	O(n)	2026-01-15 00:10:02.835409
13	1	java	most_optimal	Uses a HashMap to store visited elements and their indices, allowing the target pair to be found in a single pass.	import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for(int i = 0; i < nums.length; i++){\n            int need = target - nums[i];\n            if(map.containsKey(need)){\n                return new int[]{map.get(need), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}	O(n)	O(n)	2026-01-15 00:10:16.174064
14	1	javascript	brute_force	Checks every possible pair using two nested loops to find the target sum.	var twoSum = function(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) {\n                return [i, j];\n            }\n        }\n    }\n    return [];\n};	O(n^2)	O(1)	2026-01-15 00:10:57.525714
15	1	javascript	optimal	Stores elements with their original indices, sorts them, and applies the two-pointer technique.	var twoSum = function(nums, target) {\n    let vp = [];\n    for (let i = 0; i < nums.length; i++) {\n        vp.push([nums[i], i]);\n    }\n\n    vp.sort((a, b) => a[0] - b[0]);\n\n    let i = 0, j = nums.length - 1;\n    while (i < j) {\n        let sum = vp[i][0] + vp[j][0];\n        if (sum < target) i++;\n        else if (sum > target) j--;\n        else return [vp[i][1], vp[j][1]];\n    }\n    return [];\n};	O(n log n)	O(n)	2026-01-15 00:11:07.927509
16	1	javascript	most_optimal	Uses a Map to store visited elements and their indices, allowing the target pair to be found in a single pass.	var twoSum = function(nums, target) {\n    let map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        let need = target - nums[i];\n        if (map.has(need)) {\n            return [map.get(need), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};	O(n)	O(n)	2026-01-15 00:11:22.62202
17	2	cpp	brute_force	In the brute force approach, we check every possible substring of the given string and verify whether it contains all unique characters. \nWe use three nested loops: the first two loops generate all substrings, and the third loop checks if the current substring has duplicate characters using a frequency array. \nIf a substring has all unique characters, we update the maximum length. \nThis approach is easy to understand but inefficient for large inputs, making it suitable only for learning purposes.	class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        int n = s.size();\n        int maxLen = 0;\n\n        for (int i = 0; i < n; i++) {\n            for (int j = i; j < n; j++) {\n                vector<bool> visited(256, false);\n                bool isUnique = true;\n\n                for (int k = i; k <= j; k++) {\n                    if (visited[s[k]]) {\n                        isUnique = false;\n                        break;\n                    }\n                    visited[s[k]] = true;\n                }\n\n                if (isUnique) {\n                    maxLen = max(maxLen, j - i + 1);\n                }\n            }\n        }\n\n        return maxLen;\n    }\n};	O(n^3)	O(1)	2026-01-15 01:49:06.842261
18	2	cpp	optimal	In the optimal approach, we use the sliding window technique with two pointers and a hash set. \nThe right pointer expands the window by adding characters, while the left pointer shrinks the window when a duplicate character is found. \nThis ensures that the window always contains unique characters. \nEach character is added and removed at most once, resulting in linear time complexity.	class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_set<char> st;\n        int left = 0, maxLen = 0;\n\n        for (int right = 0; right < s.size(); right++) {\n            while (st.count(s[right])) {\n                st.erase(s[left]);\n                left++;\n            }\n            st.insert(s[right]);\n            maxLen = max(maxLen, right - left + 1);\n        }\n\n        return maxLen;\n    }\n};	O(n)	O(n)	2026-01-15 01:50:39.325689
19	2	cpp	most_optimal	The most optimal solution uses a sliding window with a fixed-size array to store the last seen index of each character. \nInstead of shrinking the window step by step, we directly move the left pointer to the next valid position when a duplicate is found. \nThis avoids unnecessary operations and achieves constant space usage, making it the fastest approach.	class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        vector<int> lastIndex(256, -1);\n        int left = 0, maxLen = 0;\n\n        for (int right = 0; right < s.size(); right++) {\n            if (lastIndex[s[right]] >= left) {\n                left = lastIndex[s[right]] + 1;\n            }\n            lastIndex[s[right]] = right;\n            maxLen = max(maxLen, right - left + 1);\n        }\n\n        return maxLen;\n    }\n};	O(n)	O(1)	2026-01-15 01:50:50.260384
20	2	python	brute_force	In the brute force approach, we generate all possible substrings and check each one to see if it contains unique characters.\nFor every starting index, we expand the substring and use a set to detect duplicates.\nIf a duplicate character is found, the substring is invalid.\nThe maximum length among all valid substrings is returned.\nThis method is simple but inefficient and suitable only for learning purposes.	class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        n = len(s)\n        max_len = 0\n\n        for i in range(n):\n            for j in range(i, n):\n                seen = set()\n                is_unique = True\n                for k in range(i, j + 1):\n                    if s[k] in seen:\n                        is_unique = False\n                        break\n                    seen.add(s[k])\n                if is_unique:\n                    max_len = max(max_len, j - i + 1)\n\n        return max_len	O(n^3)	O(1)	2026-01-15 01:51:41.858911
21	2	python	optimal	This solution uses the sliding window technique with two pointers and a set.\nThe right pointer expands the window, while the left pointer shrinks it when a duplicate character is encountered.\nThe window always contains unique characters, and each character is added and removed at most once, resulting in linear time complexity.	class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        seen = set()\n        left = 0\n        max_len = 0\n\n        for right in range(len(s)):\n            while s[right] in seen:\n                seen.remove(s[left])\n                left += 1\n            seen.add(s[right])\n            max_len = max(max_len, right - left + 1)\n\n        return max_len	O(n)	O(n)	2026-01-15 01:51:51.039051
22	2	python	most_optimal	The most optimal solution stores the last seen index of each character using a dictionary.\nWhen a repeated character is found, the left pointer jumps directly to the position after the previous occurrence.\nThis avoids unnecessary removals and achieves constant extra space with linear time complexity.	class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last_index = {}\n        left = 0\n        max_len = 0\n\n        for right, ch in enumerate(s):\n            if ch in last_index and last_index[ch] >= left:\n                left = last_index[ch] + 1\n            last_index[ch] = right\n            max_len = max(max_len, right - left + 1)\n\n        return max_len	O(n)	O(1)	2026-01-15 01:52:01.745657
23	2	java	brute_force	In the brute force approach, we generate all possible substrings of the string.\nFor each substring, we check whether it contains duplicate characters using a boolean array or set.\nIf all characters are unique, we update the maximum length.\nThis approach is easy to understand but inefficient for large inputs.	class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int n = s.length();\n        int maxLen = 0;\n\n        for (int i = 0; i < n; i++) {\n            for (int j = i; j < n; j++) {\n                boolean[] visited = new boolean[256];\n                boolean isUnique = true;\n\n                for (int k = i; k <= j; k++) {\n                    if (visited[s.charAt(k)]) {\n                        isUnique = false;\n                        break;\n                    }\n                    visited[s.charAt(k)] = true;\n                }\n\n                if (isUnique) {\n                    maxLen = Math.max(maxLen, j - i + 1);\n                }\n            }\n        }\n        return maxLen;\n    }\n}	O(n^3)	O(1)	2026-01-15 01:52:27.883768
24	2	java	optimal	This approach uses the sliding window technique with two pointers and a HashSet.\nThe right pointer expands the window, while the left pointer shrinks it when a duplicate character is found.\nEach character is added and removed at most once, resulting in linear time complexity.	import java.util.*;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Set<Character> set = new HashSet<>();\n        int left = 0, maxLen = 0;\n\n        for (int right = 0; right < s.length(); right++) {\n            while (set.contains(s.charAt(right))) {\n                set.remove(s.charAt(left));\n                left++;\n            }\n            set.add(s.charAt(right));\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}	O(n)	O(n)	2026-01-15 01:52:36.971959
25	2	java	most_optimal	The most optimal solution uses a fixed-size array to store the last index of each character.\nWhen a duplicate is encountered, the left pointer jumps directly to the next valid position.\nThis avoids unnecessary window shrinking and achieves constant space usage.	class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int[] lastIndex = new int[256];\n        Arrays.fill(lastIndex, -1);\n\n        int left = 0, maxLen = 0;\n\n        for (int right = 0; right < s.length(); right++) {\n            if (lastIndex[s.charAt(right)] >= left) {\n                left = lastIndex[s.charAt(right)] + 1;\n            }\n            lastIndex[s.charAt(right)] = right;\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}	O(n)	O(1)	2026-01-15 01:52:47.723337
26	2	c	brute_force	In the brute force approach, all possible substrings are generated using two loops.\nFor each substring, another loop checks whether all characters are unique using a fixed-size frequency array.\nIf a duplicate character is found, the substring is rejected.\nThe maximum length among all valid substrings is returned.\nThis method is simple but inefficient for large inputs.	#include <string.h>\n\nint lengthOfLongestSubstring(char* s) {\n    int n = strlen(s);\n    int maxLen = 0;\n\n    for (int i = 0; i < n; i++) {\n        for (int j = i; j < n; j++) {\n            int visited[256] = {0};\n            int isUnique = 1;\n\n            for (int k = i; k <= j; k++) {\n                if (visited[(unsigned char)s[k]]) {\n                    isUnique = 0;\n                    break;\n                }\n                visited[(unsigned char)s[k]] = 1;\n            }\n\n            if (isUnique) {\n                int len = j - i + 1;\n                if (len > maxLen) {\n                    maxLen = len;\n                }\n            }\n        }\n    }\n    return maxLen;\n}	O(n^3)	O(1)	2026-01-15 01:54:44.606594
27	2	c	optimal	This solution uses the sliding window technique with two pointers.\nA frequency array keeps track of characters currently in the window.\nWhen a duplicate character appears, the left pointer moves forward until the window becomes valid again.\nEach character is processed at most twice, resulting in linear time complexity.	#include <string.h>\n\nint lengthOfLongestSubstring(char* s) {\n    int freq[256] = {0};\n    int left = 0, right = 0;\n    int maxLen = 0;\n    int n = strlen(s);\n\n    while (right < n) {\n        freq[(unsigned char)s[right]]++;\n\n        while (freq[(unsigned char)s[right]] > 1) {\n            freq[(unsigned char)s[left]]--;\n            left++;\n        }\n\n        int len = right - left + 1;\n        if (len > maxLen) {\n            maxLen = len;\n        }\n        right++;\n    }\n    return maxLen;\n}	O(n)	O(1)	2026-01-15 01:54:54.626243
28	2	c	most_optimal	The most optimal approach stores the last seen index of each character in a fixed-size array.\nWhen a repeated character is found, the left pointer jumps directly to the position after its previous occurrence.\nThis avoids unnecessary window shrinking and achieves constant extra space with linear time complexity.	#include <string.h>\n\nint lengthOfLongestSubstring(char* s) {\n    int lastIndex[256];\n    for (int i = 0; i < 256; i++) {\n        lastIndex[i] = -1;\n    }\n\n    int left = 0;\n    int maxLen = 0;\n    int n = strlen(s);\n\n    for (int right = 0; right < n; right++) {\n        unsigned char c = s[right];\n\n        if (lastIndex[c] >= left) {\n            left = lastIndex[c] + 1;\n        }\n        lastIndex[c] = right;\n\n        int len = right - left + 1;\n        if (len > maxLen) {\n            maxLen = len;\n        }\n    }\n    return maxLen;\n}	O(n)	O(1)	2026-01-15 01:55:05.331195
29	2	javascript	brute_force	The brute force approach checks all possible substrings of the string.\nFor each substring, we verify whether all characters are unique using a Set.\nIf a duplicate character is found, the substring is discarded.\nThe maximum length among all valid substrings is returned.\nThis approach is simple but inefficient for large inputs.	var lengthOfLongestSubstring = function(s) {\n    let n = s.length;\n    let maxLen = 0;\n\n    for (let i = 0; i < n; i++) {\n        for (let j = i; j < n; j++) {\n            let seen = new Set();\n            let isUnique = true;\n\n            for (let k = i; k <= j; k++) {\n                if (seen.has(s[k])) {\n                    isUnique = false;\n                    break;\n                }\n                seen.add(s[k]);\n            }\n\n            if (isUnique) {\n                maxLen = Math.max(maxLen, j - i + 1);\n            }\n        }\n    }\n    return maxLen;\n};	O(n^3)	O(1)	2026-01-15 01:55:40.303743
42	3	python	optimal	Digits are extracted using modulo and division.\nThe reversed number is built step by step while checking\nfor overflow before each multiplication.	class Solution:\n    def reverse(self, x: int) -> int:\n        rev = 0\n        while x != 0:\n            digit = int(x % 10)\n            x = int(x / 10)\n\n            if rev > (2**31 - 1) // 10 or rev < -2**31 // 10:\n                return 0\n\n            rev = rev * 10 + digit\n\n        return rev	O(log10 n)	O(1)	2026-01-18 14:12:56.266612
30	2	javascript	optimal	This solution uses the sliding window technique with two pointers and a Set.\nThe right pointer expands the window, while the left pointer shrinks it when a duplicate character is encountered.\nEach character is added and removed at most once, resulting in linear time complexity.	var lengthOfLongestSubstring = function(s) {\n    let set = new Set();\n    let left = 0;\n    let maxLen = 0;\n\n    for (let right = 0; right < s.length; right++) {\n        while (set.has(s[right])) {\n            set.delete(s[left]);\n            left++;\n        }\n        set.add(s[right]);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n};	O(n)	O(n)	2026-01-15 01:55:51.846604
31	2	javascript	most_optimal	The most optimal solution stores the last seen index of each character using a Map.\nWhen a repeated character is found, the left pointer jumps directly to the position after the previous occurrence.\nThis avoids unnecessary window shrinking and achieves constant extra space with linear time complexity.	var lengthOfLongestSubstring = function(s) {\n    let lastIndex = new Map();\n    let left = 0;\n    let maxLen = 0;\n\n    for (let right = 0; right < s.length; right++) {\n        let ch = s[right];\n        if (lastIndex.has(ch) && lastIndex.get(ch) >= left) {\n            left = lastIndex.get(ch) + 1;\n        }\n        lastIndex.set(ch, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n};	O(n)	O(1)	2026-01-15 01:56:00.772363
32	3	cpp	brute_force	We convert the integer to a string, reverse the string, and then convert it back to an integer.\nBefore returning the result, we check whether it lies within the 32-bit signed integer range.\nThis approach is easy to understand but uses extra space and string operations.	class Solution {\npublic:\n    int reverse(int x) {\n        string s = to_string(abs(x));\n        std::reverse(s.begin(), s.end());\n\n        long long val = stoll(s);\n        if (x < 0) val = -val;\n\n        if (val < INT_MIN || val > INT_MAX) return 0;\n        return (int)val;\n    }\n};	O(n)	O(n)	2026-01-18 14:07:05.111134
33	3	cpp	optimal	We repeatedly extract the last digit using modulo operation and build the reversed number.\nBefore multiplying the result by 10, we check for overflow conditions using INT_MAX and INT_MIN.\nThis avoids using extra space and works efficiently within constraints.	class Solution {\npublic:\n    int reverse(int x) {\n        int rev = 0;\n        while (x != 0) {\n            int digit = x % 10;\n            x /= 10;\n\n            if (rev > INT_MAX / 10 || rev < INT_MIN / 10)\n                return 0;\n\n            rev = rev * 10 + digit;\n        }\n        return rev;\n    }\n};	O(log10 n)	O(1)	2026-01-18 14:07:17.921453
34	3	cpp	most_optimal	This solution carefully checks overflow by comparing against boundary values\nbefore adding the last digit. It ensures correctness even at extreme limits.\nThis is the most reliable and commonly accepted interview solution.	class Solution {\npublic:\n    int reverse(int x) {\n        int rev = 0;\n        while (x != 0) {\n            int digit = x % 10;\n            x /= 10;\n\n            if (rev > INT_MAX / 10 || (rev == INT_MAX / 10 && digit > 7))\n                return 0;\n            if (rev < INT_MIN / 10 || (rev == INT_MIN / 10 && digit < -8))\n                return 0;\n\n            rev = rev * 10 + digit;\n        }\n        return rev;\n    }\n};	O(log10 n)	O(1)	2026-01-18 14:07:31.456348
35	3	c	brute_force	The integer is converted to a string, reversed manually, and then converted back to an integer.\nAfter reversing, the result is checked to ensure it fits within the 32-bit signed integer range.\nThis method is simple but uses extra space.	#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <limits.h>\n\nint reverse(int x) {\n    char buf[20];\n    int sign = x < 0 ? -1 : 1;\n    x = abs(x);\n\n    sprintf(buf, "%d", x);\n\n    int n = strlen(buf);\n    for (int i = 0; i < n / 2; i++) {\n        char temp = buf[i];\n        buf[i] = buf[n - i - 1];\n        buf[n - i - 1] = temp;\n    }\n\n    long long val = atoll(buf) * sign;\n    if (val < INT_MIN || val > INT_MAX) return 0;\n\n    return (int)val;\n}	O(n)	O(n)	2026-01-18 14:08:57.604709
36	3	c	optimal	Digits are extracted one by one using modulo and division.\nBefore multiplying the result by 10, an overflow check is performed.\nThis avoids extra memory usage and works efficiently.	#include <limits.h>\n\nint reverse(int x) {\n    int rev = 0;\n\n    while (x != 0) {\n        int digit = x % 10;\n        x /= 10;\n\n        if (rev > INT_MAX / 10 || rev < INT_MIN / 10)\n            return 0;\n\n        rev = rev * 10 + digit;\n    }\n\n    return rev;\n}	O(log10 n)	O(1)	2026-01-18 14:09:08.980348
37	3	c	most_optimal	This solution performs strict overflow checks by comparing the current result\nwith INT_MAX/10 and INT_MIN/10, including last-digit boundary cases.\nIt guarantees correctness for all edge values.	#include <limits.h>\n\nint reverse(int x) {\n    int rev = 0;\n\n    while (x != 0) {\n        int digit = x % 10;\n        x /= 10;\n\n        if (rev > INT_MAX / 10 || (rev == INT_MAX / 10 && digit > 7))\n            return 0;\n        if (rev < INT_MIN / 10 || (rev == INT_MIN / 10 && digit < -8))\n            return 0;\n\n        rev = rev * 10 + digit;\n    }\n\n    return rev;\n}	O(log10 n)	O(1)	2026-01-18 14:09:20.406138
38	3	java	brute_force	The integer is converted to a string, reversed using StringBuilder,\nand then parsed back to an integer. Overflow is checked using long.\nThis approach is easy to understand but uses extra memory.	class Solution {\n    public int reverse(int x) {\n        boolean negative = x < 0;\n        String s = Integer.toString(Math.abs(x));\n\n        StringBuilder sb = new StringBuilder(s);\n        sb.reverse();\n\n        long val = Long.parseLong(sb.toString());\n        if (negative) val = -val;\n\n        if (val < Integer.MIN_VALUE || val > Integer.MAX_VALUE)\n            return 0;\n\n        return (int) val;\n    }\n}	O(n)	O(n)	2026-01-18 14:10:07.918199
39	3	java	optimal	Digits are extracted one by one using modulo and division.\nBefore multiplying the reversed number by 10, overflow is checked using\nInteger.MAX_VALUE and Integer.MIN_VALUE.\nThis avoids extra space usage.	class Solution {\n    public int reverse(int x) {\n        int rev = 0;\n\n        while (x != 0) {\n            int digit = x % 10;\n            x /= 10;\n\n            if (rev > Integer.MAX_VALUE / 10 || rev < Integer.MIN_VALUE / 10)\n                return 0;\n\n            rev = rev * 10 + digit;\n        }\n\n        return rev;\n    }\n}	O(log10 n)	O(1)	2026-01-18 14:10:19.223422
40	3	java	most_optimal	This solution performs strict overflow checks by comparing the current\nreversed value against Integer.MAX_VALUE/10 and Integer.MIN_VALUE/10,\nincluding last digit constraints. This guarantees correctness.	class Solution {\n    public int reverse(int x) {\n        int rev = 0;\n\n        while (x != 0) {\n            int digit = x % 10;\n            x /= 10;\n\n            if (rev > Integer.MAX_VALUE / 10 ||\n               (rev == Integer.MAX_VALUE / 10 && digit > 7))\n                return 0;\n\n            if (rev < Integer.MIN_VALUE / 10 ||\n               (rev == Integer.MIN_VALUE / 10 && digit < -8))\n                return 0;\n\n            rev = rev * 10 + digit;\n        }\n\n        return rev;\n    }\n}	O(log10 n)	O(1)	2026-01-18 14:10:30.839602
41	3	python	brute_force	The integer is converted to a string, reversed using slicing,\nand then converted back to an integer. After reversing, the value is\nchecked to ensure it fits within the 32-bit signed integer range.	class Solution:\n    def reverse(self, x: int) -> int:\n        sign = -1 if x < 0 else 1\n        s = str(abs(x))\n        rev = int(s[::-1]) * sign\n\n        if rev < -2**31 or rev > 2**31 - 1:\n            return 0\n        return rev	O(n)	O(n)	2026-01-18 14:12:47.471845
43	3	python	most_optimal	This solution carefully checks overflow conditions using exact\n32-bit signed integer boundaries before adding each digit.\nIt guarantees correctness for all edge cases.	class Solution:\n    def reverse(self, x: int) -> int:\n        INT_MAX = 2**31 - 1\n        INT_MIN = -2**31\n\n        rev = 0\n        while x != 0:\n            digit = int(x % 10)\n            x = int(x / 10)\n\n            if rev > INT_MAX // 10 or (rev == INT_MAX // 10 and digit > 7):\n                return 0\n            if rev < INT_MIN // 10 or (rev == INT_MIN // 10 and digit < -8):\n                return 0\n\n            rev = rev * 10 + digit\n\n        return rev	O(log10 n)	O(1)	2026-01-18 14:13:16.181353
44	3	javascript	brute_force	The integer is converted to a string, reversed using built-in methods,\nand converted back to a number. After reversing, the result is checked\nagainst the 32-bit signed integer range.	var reverse = function(x) {\n    const sign = x < 0 ? -1 : 1;\n    const s = Math.abs(x).toString();\n    const rev = parseInt(s.split('').reverse().join('')) * sign;\n\n    if (rev < -(2 ** 31) || rev > (2 ** 31 - 1)) return 0;\n    return rev;\n};	O(n)	O(n)	2026-01-18 14:14:12.555556
45	3	javascript	optimal	Digits are extracted using modulo and division.\nThe reversed number is built step by step with overflow checks\nto ensure it stays within 32-bit integer limits.	var reverse = function(x) {\n    let rev = 0;\n    const INT_MAX = 2 ** 31 - 1;\n    const INT_MIN = -(2 ** 31);\n\n    while (x !== 0) {\n        const digit = x % 10;\n        x = (x / 10) | 0;\n\n        if (rev > INT_MAX / 10 || rev < INT_MIN / 10)\n            return 0;\n\n        rev = rev * 10 + digit;\n    }\n\n    return rev;\n};	O(log10 n)	O(1)	2026-01-18 14:14:22.342564
46	3	javascript	most_optimal	This solution performs strict overflow checks by comparing the current\nreversed value with exact 32-bit boundaries before adding each digit.\nIt guarantees correctness for all edge cases.	var reverse = function(x) {\n    let rev = 0;\n    const INT_MAX = 2 ** 31 - 1;\n    const INT_MIN = -(2 ** 31);\n\n    while (x !== 0) {\n        const digit = x % 10;\n        x = (x / 10) | 0;\n\n        if (rev > Math.floor(INT_MAX / 10) ||\n            (rev === Math.floor(INT_MAX / 10) && digit > 7))\n            return 0;\n\n        if (rev < Math.ceil(INT_MIN / 10) ||\n            (rev === Math.ceil(INT_MIN / 10) && digit < -8))\n            return 0;\n\n        rev = rev * 10 + digit;\n    }\n\n    return rev;\n};	O(log10 n)	O(1)	2026-01-18 14:14:31.037416
47	4	cpp	brute_force	For each sliding window of size k, we iterate through all k elements to find the maximum.\nThis approach directly follows the problem statement but is inefficient for large inputs.\nIt will cause TLE for large arrays.	class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        vector<int> ans;\n        int n = nums.size();\n\n        for (int i = 0; i <= n - k; i++) {\n            int mx = nums[i];\n            for (int j = i; j < i + k; j++) {\n                mx = max(mx, nums[j]);\n            }\n            ans.push_back(mx);\n        }\n        return ans;\n    }\n};	O(n * k)	O(1)	2026-01-18 15:29:54.603043
48	4	cpp	optimal	We use a max heap (priority queue) to keep track of the maximum element\nin the current window. Elements that fall out of the window are removed.\nThis improves performance compared to brute force but is still slower\nthan the deque-based approach.	class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        priority_queue<pair<int,int>> pq;\n        vector<int> ans;\n\n        for (int i = 0; i < nums.size(); i++) {\n            pq.push({nums[i], i});\n\n            if (i >= k - 1) {\n                while (pq.top().second <= i - k) {\n                    pq.pop();\n                }\n                ans.push_back(pq.top().first);\n            }\n        }\n        return ans;\n    }\n};	O(n log n)	O(n)	2026-01-18 15:30:03.654297
49	4	cpp	most_optimal	We maintain a monotonic decreasing deque that stores indices of useful elements.\nThe front of the deque always contains the index of the maximum element in the window.\nElements outside the window or smaller than the current element are removed.\nThis achieves linear time complexity.	class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        deque<int> dq;\n        vector<int> ans;\n\n        for (int i = 0; i < nums.size(); i++) {\n            if (!dq.empty() && dq.front() <= i - k)\n                dq.pop_front();\n\n            while (!dq.empty() && nums[dq.back()] < nums[i])\n                dq.pop_back();\n\n            dq.push_back(i);\n\n            if (i >= k - 1)\n                ans.push_back(nums[dq.front()]);\n        }\n        return ans;\n    }\n};	O(n)	O(k)	2026-01-18 15:30:27.103904
50	4	c	brute_force	For each sliding window of size k, we iterate through all k elements\nto find the maximum. This directly follows the problem statement but is\ninefficient for large inputs and may cause TLE.	int* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {\n    *returnSize = numsSize - k + 1;\n    int* ans = (int*)malloc(sizeof(int) * (*returnSize));\n\n    for (int i = 0; i <= numsSize - k; i++) {\n        int mx = nums[i];\n        for (int j = i; j < i + k; j++) {\n            if (nums[j] > mx)\n                mx = nums[j];\n        }\n        ans[i] = mx;\n    }\n    return ans;\n}	O(n * k)	O(1)	2026-01-18 15:30:40.91941
51	4	c	optimal	We simulate a max heap using an array of pairs (value, index).\nAt each step, outdated elements are removed. This is faster than brute\nforce but still slower than the deque-based approach.	typedef struct {\n    int val;\n    int idx;\n} Node;\n\nint cmp(const void* a, const void* b) {\n    return ((Node*)b)->val - ((Node*)a)->val;\n}\n\nint* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {\n    *returnSize = numsSize - k + 1;\n    int* ans = (int*)malloc(sizeof(int) * (*returnSize));\n    Node* heap = (Node*)malloc(sizeof(Node) * numsSize);\n    int heapSize = 0;\n\n    for (int i = 0; i < numsSize; i++) {\n        heap[heapSize++] = (Node){nums[i], i};\n        qsort(heap, heapSize, sizeof(Node), cmp);\n\n        if (i >= k - 1) {\n            while (heap[0].idx <= i - k) {\n                heap[0] = heap[--heapSize];\n                qsort(heap, heapSize, sizeof(Node), cmp);\n            }\n            ans[i - k + 1] = heap[0].val;\n        }\n    }\n\n    free(heap);\n    return ans;\n}	O(n log n)	O(n)	2026-01-18 15:30:49.248164
52	4	c	most_optimal	We maintain a monotonic decreasing deque storing indices of elements.\nThe front of the deque always contains the index of the maximum element\nin the current window. Out-of-window and smaller elements are removed.\nThis achieves linear time complexity.	int* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {\n    int* ans = (int*)malloc(sizeof(int) * (numsSize - k + 1));\n    int* dq = (int*)malloc(sizeof(int) * numsSize);\n    int front = 0, back = -1;\n\n    *returnSize = 0;\n\n    for (int i = 0; i < numsSize; i++) {\n        if (front <= back && dq[front] <= i - k)\n            front++;\n\n        while (front <= back && nums[dq[back]] < nums[i])\n            back--;\n\n        dq[++back] = i;\n\n        if (i >= k - 1)\n            ans[(*returnSize)++] = nums[dq[front]];\n    }\n\n    free(dq);\n    return ans;\n}	O(n)	O(k)	2026-01-18 15:30:58.033859
53	4	java	brute_force	For every window of size k, we iterate through all k elements and find the maximum.\nThis approach is straightforward but inefficient for large inputs and will\nlikely cause TLE.	class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        int n = nums.length;\n        int[] ans = new int[n - k + 1];\n\n        for (int i = 0; i <= n - k; i++) {\n            int max = nums[i];\n            for (int j = i; j < i + k; j++) {\n                max = Math.max(max, nums[j]);\n            }\n            ans[i] = max;\n        }\n        return ans;\n    }\n}	O(n * k)	O(1)	2026-01-18 15:31:26.503505
54	4	java	optimal	A max heap (priority queue) is used to keep track of the maximum element\nin the current window. Elements that fall outside the window are removed.\nThis approach improves over brute force but is slower than the deque method.	import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        PriorityQueue<int[]> pq =\n            new PriorityQueue<>((a, b) -> b[0] - a[0]);\n\n        int n = nums.length;\n        int[] ans = new int[n - k + 1];\n\n        for (int i = 0; i < n; i++) {\n            pq.offer(new int[]{nums[i], i});\n\n            if (i >= k - 1) {\n                while (pq.peek()[1] <= i - k) {\n                    pq.poll();\n                }\n                ans[i - k + 1] = pq.peek()[0];\n            }\n        }\n        return ans;\n    }\n}	O(n log n)	O(n)	2026-01-18 15:31:38.288099
55	4	java	most_optimal	A monotonic decreasing deque is maintained to store indices of useful elements.\nThe front of the deque always holds the index of the maximum element in the window.\nOut-of-window and smaller elements are removed, achieving linear time.	import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        Deque<Integer> dq = new ArrayDeque<>();\n        int n = nums.length;\n        int[] ans = new int[n - k + 1];\n        int idx = 0;\n\n        for (int i = 0; i < n; i++) {\n            if (!dq.isEmpty() && dq.peekFirst() <= i - k)\n                dq.pollFirst();\n\n            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i])\n                dq.pollLast();\n\n            dq.offerLast(i);\n\n            if (i >= k - 1)\n                ans[idx++] = nums[dq.peekFirst()];\n        }\n        return ans;\n    }\n}	O(n)	O(k)	2026-01-18 15:31:47.875193
56	4	python	brute_force	For each sliding window of size k, we iterate through all k elements\nto find the maximum. This directly follows the problem statement but is\ninefficient for large inputs and will result in TLE.	class Solution:\n    def maxSlidingWindow(self, nums, k):\n        n = len(nums)\n        res = []\n\n        for i in range(n - k + 1):\n            mx = nums[i]\n            for j in range(i, i + k):\n                mx = max(mx, nums[j])\n            res.append(mx)\n\n        return res	O(n * k)	O(1)	2026-01-18 15:32:11.226051
57	4	python	optimal	A max heap is used to keep track of the maximum element in the current window.\nOutdated elements are removed based on their indices.\nThis approach is faster than brute force but slower than the deque method.	import heapq\n\nclass Solution:\n    def maxSlidingWindow(self, nums, k):\n        heap = []\n        res = []\n\n        for i, num in enumerate(nums):\n            heapq.heappush(heap, (-num, i))\n\n            if i >= k - 1:\n                while heap[0][1] <= i - k:\n                    heapq.heappop(heap)\n                res.append(-heap[0][0])\n\n        return res	O(n log n)	O(n)	2026-01-18 15:32:19.685536
58	4	python	most_optimal	A monotonic decreasing deque is maintained to store indices of useful elements.\nThe front always contains the index of the maximum element in the window.\nSmaller and out-of-window elements are removed, achieving linear time.	from collections import deque\n\nclass Solution:\n    def maxSlidingWindow(self, nums, k):\n        dq = deque()\n        res = []\n\n        for i in range(len(nums)):\n            if dq and dq[0] <= i - k:\n                dq.popleft()\n\n            while dq and nums[dq[-1]] < nums[i]:\n                dq.pop()\n\n            dq.append(i)\n\n            if i >= k - 1:\n                res.append(nums[dq[0]])\n\n        return res	O(n)	O(k)	2026-01-18 15:32:31.517282
59	4	javascript	brute_force	For each sliding window of size k, we scan all k elements and compute the maximum.\nThis approach directly follows the problem statement but is inefficient for large inputs\nand will cause TLE.	var maxSlidingWindow = function(nums, k) {\n    const res = [];\n    const n = nums.length;\n\n    for (let i = 0; i <= n - k; i++) {\n        let mx = nums[i];\n        for (let j = i; j < i + k; j++) {\n            mx = Math.max(mx, nums[j]);\n        }\n        res.push(mx);\n    }\n    return res;\n};	O(n * k)	O(1)	2026-01-18 15:33:07.825107
60	4	javascript	optimal	A max heap is simulated using a priority queue behavior.\nElements are stored along with their indices and outdated elements\nare removed as the window slides. Faster than brute force but slower\nthan the deque-based approach.	var maxSlidingWindow = function(nums, k) {\n    const heap = [];\n    const res = [];\n\n    const push = (val, idx) => {\n        heap.push([val, idx]);\n        heap.sort((a, b) => b[0] - a[0]);\n    };\n\n    for (let i = 0; i < nums.length; i++) {\n        push(nums[i], i);\n\n        if (i >= k - 1) {\n            while (heap[0][1] <= i - k) {\n                heap.shift();\n            }\n            res.push(heap[0][0]);\n        }\n    }\n    return res;\n};	O(n log n)	O(n)	2026-01-18 15:33:21.924324
61	4	javascript	most_optimal	A monotonic decreasing deque is maintained storing indices of useful elements.\nThe front always contains the index of the maximum element for the current window.\nOut-of-window and smaller elements are removed, achieving linear time complexity.	var maxSlidingWindow = function(nums, k) {\n    const dq = [];\n    const res = [];\n\n    for (let i = 0; i < nums.length; i++) {\n        if (dq.length && dq[0] <= i - k) {\n            dq.shift();\n        }\n\n        while (dq.length && nums[dq[dq.length - 1]] < nums[i]) {\n            dq.pop();\n        }\n\n        dq.push(i);\n\n        if (i >= k - 1) {\n            res.push(nums[dq[0]]);\n        }\n    }\n    return res;\n};	O(n)	O(k)	2026-01-18 15:33:31.859336
62	5	cpp	brute_force	Convert the integer into a string and check whether the string is the same when reversed.\nNegative numbers are not palindromes because of the minus sign.\nThis approach is straightforward but uses extra space, which is not optimal.	class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0) return false;\n        string s = to_string(x);\n        string rev = s;\n        reverse(rev.begin(), rev.end());\n        return s == rev;\n    }\n};	O(n)	O(n)	2026-01-19 12:15:08.089903
63	5	cpp	optimal	Reverse the entire number using mathematical operations and compare it with the original.\nNegative numbers are immediately rejected.\nCare must be taken to avoid integer overflow.	class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0) return false;\n\n        int original = x;\n        long long rev = 0;\n\n        while (x > 0) {\n            rev = rev * 10 + (x % 10);\n            x /= 10;\n        }\n\n        return rev == original;\n    }\n};	O(log n)	O(1)	2026-01-19 12:15:17.924431
64	5	cpp	most_optimal	Instead of reversing the whole number, reverse only the second half.\nIf the number has an odd number of digits, ignore the middle digit.\nThis avoids overflow and uses constant space, making it the most optimal solution.	class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n\n        int revHalf = 0;\n        while (x > revHalf) {\n            revHalf = revHalf * 10 + (x % 10);\n            x /= 10;\n        }\n\n        return (x == revHalf || x == revHalf / 10);\n    }\n};	O(log n)	O(1)	2026-01-19 12:15:27.41563
65	5	c	brute_force	Convert the integer into a string and check if the string is the same when reversed.\nNegative numbers are not palindromes because of the minus sign.\nThis approach is simple but uses extra memory.	#include <string.h>\n#include <stdio.h>\n#include <stdbool.h>\n\nbool isPalindrome(int x) {\n    if (x < 0) return false;\n\n    char s[20];\n    sprintf(s, "%d", x);\n\n    int l = 0, r = strlen(s) - 1;\n    while (l < r) {\n        if (s[l++] != s[r--]) return false;\n    }\n    return true;\n}	O(n)	O(n)	2026-01-19 12:15:53.514575
66	5	c	optimal	Reverse the entire number using mathematical operations and compare it with the original.\nNegative numbers are rejected immediately.\nUses constant space but reverses the full number.	#include <stdbool.h>\n\nbool isPalindrome(int x) {\n    if (x < 0) return false;\n\n    int original = x;\n    long long rev = 0;\n\n    while (x > 0) {\n        rev = rev * 10 + (x % 10);\n        x /= 10;\n    }\n\n    return rev == original;\n}	O(log n)	O(1)	2026-01-19 12:16:02.264537
67	5	c	most_optimal	Reverse only half of the number.\nIf the number has an odd number of digits, ignore the middle digit.\nThis avoids overflow and uses constant space, making it the most optimal approach.	#include <stdbool.h>\n\nbool isPalindrome(int x) {\n    if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n\n    int revHalf = 0;\n    while (x > revHalf) {\n        revHalf = revHalf * 10 + (x % 10);\n        x /= 10;\n    }\n\n    return (x == revHalf || x == revHalf / 10);\n}	O(log n)	O(1)	2026-01-19 12:16:11.954084
68	5	python	brute_force	Convert the integer to a string and compare it with its reverse.\nNegative numbers are not palindromes because of the minus sign.\nThis solution is simple but uses extra memory.	class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        if x < 0:\n            return False\n        s = str(x)\n        return s == s[::-1]	O(n)	O(n)	2026-01-19 12:16:44.95566
69	5	python	optimal	Reverse the entire number mathematically and compare it with the original.\nNegative numbers are immediately rejected.\nPython handles large integers safely, so overflow is not an issue.	class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        if x < 0:\n            return False\n\n        original = x\n        rev = 0\n\n        while x > 0:\n            rev = rev * 10 + (x % 10)\n            x //= 10\n\n        return rev == original	O(log n)	O(1)	2026-01-19 12:16:56.696266
70	5	python	most_optimal	Reverse only half of the number instead of the entire number.\nIf the number has an odd number of digits, the middle digit is ignored.\nThis avoids unnecessary work and uses constant space.	class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        if x < 0 or (x % 10 == 0 and x != 0):\n            return False\n\n        rev_half = 0\n        while x > rev_half:\n            rev_half = rev_half * 10 + (x % 10)\n            x //= 10\n\n        return x == rev_half or x == rev_half // 10	O(log n)	O(1)	2026-01-19 12:17:06.608654
71	5	java	optimal	Reverse the entire number using mathematical operations and compare it with the original.\nNegative numbers are rejected immediately.\nA long variable is used to prevent overflow.	class Solution {\n    public boolean isPalindrome(int x) {\n        if (x < 0) return false;\n\n        int original = x;\n        long rev = 0;\n\n        while (x > 0) {\n            rev = rev * 10 + (x % 10);\n            x /= 10;\n        }\n\n        return rev == original;\n    }\n}	O(log n)	O(1)	2026-01-19 12:17:41.102235
72	5	java	most_optimal	Instead of reversing the entire number, reverse only half of it.\nIf the number has an odd number of digits, the middle digit is ignored.\nThis avoids overflow and minimizes unnecessary operations.	class Solution {\n    public boolean isPalindrome(int x) {\n        if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n\n        int revHalf = 0;\n        while (x > revHalf) {\n            revHalf = revHalf * 10 + (x % 10);\n            x /= 10;\n        }\n\n        return x == revHalf || x == revHalf / 10;\n    }\n}	O(log n)	O(1)	2026-01-19 12:17:50.087208
73	5	javascript	brute_force	Convert the number into a string and check if it is the same when reversed.\nNegative numbers are not palindromes due to the minus sign.\nThis approach is simple but uses extra memory.	var isPalindrome = function(x) {\n    if (x < 0) return false;\n    const s = x.toString();\n    return s === s.split('').reverse().join('');\n};	O(n)	O(n)	2026-01-19 12:18:27.395243
74	5	javascript	optimal	Reverse the entire number using mathematical operations and compare it with the original.\nNegative numbers are rejected immediately.\nThis approach uses constant space but performs a full reversal.	var isPalindrome = function(x) {\n    if (x < 0) return false;\n\n    let original = x;\n    let rev = 0;\n\n    while (x > 0) {\n        rev = rev * 10 + (x % 10);\n        x = Math.floor(x / 10);\n    }\n\n    return rev === original;\n};	O(log n)	O(1)	2026-01-19 12:18:44.978097
75	5	javascript	most_optimal	Instead of reversing the entire number, reverse only half of it.\nIf the number has an odd number of digits, ignore the middle digit.\nThis avoids unnecessary work and uses constant space.	var isPalindrome = function(x) {\n    if (x < 0 || (x % 10 === 0 && x !== 0)) return false;\n\n    let revHalf = 0;\n    while (x > revHalf) {\n        revHalf = revHalf * 10 + (x % 10);\n        x = Math.floor(x / 10);\n    }\n\n    return x === revHalf || x === Math.floor(revHalf / 10);\n};	O(log n)	O(1)	2026-01-19 12:19:01.192161
76	6	cpp	brute_force	We check every possible triplet using three nested loops. If the sum of the three numbers is zero, the triplet is sorted and stored uniquely.	#include <vector>\n#include <set>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        int n = nums.size();\n        set<vector<int>> s;\n\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                for (int k = j + 1; k < n; k++) {\n                    if (nums[i] + nums[j] + nums[k] == 0) {\n                        vector<int> t = {nums[i], nums[j], nums[k]};\n                        sort(t.begin(), t.end());\n                        s.insert(t);\n                    }\n                }\n            }\n        }\n\n        return vector<vector<int>>(s.begin(), s.end());\n    }\n};	O(n^3)	O(1)	2026-01-19 13:45:44.267371
100	7	python	brute_force	In the brute force approach, we iterate through the list and whenever the target value is found, we remove it by shifting all subsequent elements to the left. Since Python lists do not support in-place removal without shifting, this results in repeated element movement, making the approach inefficient.\n\nAlthough simple to understand, repeated shifts increase the overall time complexity.	class Solution:\n    def removeElement(self, nums, val):\n        i = 0\n        n = len(nums)\n\n        while i < n:\n            if nums[i] == val:\n                for j in range(i, n - 1):\n                    nums[j] = nums[j + 1]\n                n -= 1\n            else:\n                i += 1\n\n        return n	O(n^2)	O(1)	2026-01-19 17:52:46.278504
77	6	cpp	optimal	The array is sorted and for each element, two pointers are used to find pairs whose sum equals the negative of the fixed element. Duplicate triplets are skipped.	#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        vector<vector<int>> res;\n        sort(nums.begin(), nums.end());\n        int n = nums.size();\n\n        for (int i = 0; i < n; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n            int l = i + 1, r = n - 1;\n            while (l < r) {\n                int sum = nums[i] + nums[l] + nums[r];\n                if (sum == 0) {\n                    res.push_back({nums[i], nums[l], nums[r]});\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (sum < 0) {\n                    l++;\n                } else {\n                    r--;\n                }\n            }\n        }\n        return res;\n    }\n};	O(n^2)	O(1)	2026-01-19 13:46:01.343582
78	6	cpp	most_optimal	This version adds an early break when the current number becomes positive. Since the array is sorted, no valid triplet can exist beyond this point.	#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        vector<vector<int>> res;\n        sort(nums.begin(), nums.end());\n        int n = nums.size();\n\n        for (int i = 0; i < n; i++) {\n            if (nums[i] > 0) break;\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n            int l = i + 1, r = n - 1;\n            while (l < r) {\n                int sum = nums[i] + nums[l] + nums[r];\n                if (sum == 0) {\n                    res.push_back({nums[i], nums[l], nums[r]});\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (sum < 0) {\n                    l++;\n                } else {\n                    r--;\n                }\n            }\n        }\n        return res;\n    }\n};	O(n^2)	O(1)	2026-01-19 13:46:14.251652
79	6	c	brute_force	We try all possible triplets using three nested loops. Whenever the sum of three numbers is zero, the triplet is sorted and stored. This approach is simple but inefficient.	#include <stdlib.h>\n\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    int capacity = 10000;\n    int** result = (int**)malloc(sizeof(int*) * capacity);\n    *returnColumnSizes = (int*)malloc(sizeof(int) * capacity);\n    *returnSize = 0;\n\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            for (int k = j + 1; k < numsSize; k++) {\n                if (nums[i] + nums[j] + nums[k] == 0) {\n                    int a = nums[i], b = nums[j], c = nums[k];\n                    if (a > b) { int t = a; a = b; b = t; }\n                    if (b > c) { int t = b; b = c; c = t; }\n                    if (a > b) { int t = a; a = b; b = t; }\n\n                    int duplicate = 0;\n                    for (int x = 0; x < *returnSize; x++) {\n                        if (result[x][0] == a &&\n                            result[x][1] == b &&\n                            result[x][2] == c) {\n                            duplicate = 1;\n                            break;\n                        }\n                    }\n\n                    if (!duplicate) {\n                        result[*returnSize] = (int*)malloc(sizeof(int) * 3);\n                        result[*returnSize][0] = a;\n                        result[*returnSize][1] = b;\n                        result[*returnSize][2] = c;\n                        (*returnColumnSizes)[*returnSize] = 3;\n                        (*returnSize)++;\n                    }\n                }\n            }\n        }\n    }\n    return result;\n}	O(n^3)	O(1)	2026-01-19 13:47:27.993581
80	6	c	optimal	The array is sorted first. For each element, two pointers are used to find pairs that sum to the negative of the fixed element. Duplicate triplets are skipped.	#include <stdlib.h>\n\nint cmp(const void* a, const void* b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    qsort(nums, numsSize, sizeof(int), cmp);\n\n    int capacity = 10000;\n    int** result = (int**)malloc(sizeof(int*) * capacity);\n    *returnColumnSizes = (int*)malloc(sizeof(int) * capacity);\n    *returnSize = 0;\n\n    for (int i = 0; i < numsSize; i++) {\n        if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n        int left = i + 1, right = numsSize - 1;\n        while (left < right) {\n            int sum = nums[i] + nums[left] + nums[right];\n            if (sum == 0) {\n                result[*returnSize] = (int*)malloc(sizeof(int) * 3);\n                result[*returnSize][0] = nums[i];\n                result[*returnSize][1] = nums[left];\n                result[*returnSize][2] = nums[right];\n                (*returnColumnSizes)[*returnSize] = 3;\n                (*returnSize)++;\n\n                while (left < right && nums[left] == nums[left + 1]) left++;\n                while (left < right && nums[right] == nums[right - 1]) right--;\n                left++;\n                right--;\n            } else if (sum < 0) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n    }\n    return result;\n}	O(n^2)	O(1)	2026-01-19 13:47:41.851537
81	6	c	most_optimal	This version adds an early break when the current number becomes positive. Since the array is sorted, no valid triplet can exist beyond this point.	#include <stdlib.h>\n\nint cmp(const void* a, const void* b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    qsort(nums, numsSize, sizeof(int), cmp);\n\n    int capacity = 10000;\n    int** result = (int**)malloc(sizeof(int*) * capacity);\n    *returnColumnSizes = (int*)malloc(sizeof(int) * capacity);\n    *returnSize = 0;\n\n    for (int i = 0; i < numsSize; i++) {\n        if (nums[i] > 0) break;\n        if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n        int left = i + 1, right = numsSize - 1;\n        while (left < right) {\n            int sum = nums[i] + nums[left] + nums[right];\n            if (sum == 0) {\n                result[*returnSize] = (int*)malloc(sizeof(int) * 3);\n                result[*returnSize][0] = nums[i];\n                result[*returnSize][1] = nums[left];\n                result[*returnSize][2] = nums[right];\n                (*returnColumnSizes)[*returnSize] = 3;\n                (*returnSize)++;\n\n                while (left < right && nums[left] == nums[left + 1]) left++;\n                while (left < right && nums[right] == nums[right - 1]) right--;\n                left++;\n                right--;\n            } else if (sum < 0) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n    }\n    return result;\n}	O(n^2)	O(1)	2026-01-19 13:47:54.599441
101	7	python	optimal	In the optimal solution, we use the two-pointer technique. One pointer iterates over the array, while the second pointer keeps track of the position to place the next element that is not equal to val. All valid elements are moved to the front in a single pass.\n\nThis approach efficiently removes elements using constant extra space.	class Solution:\n    def removeElement(self, nums, val):\n        k = 0\n        for i in range(len(nums)):\n            if nums[i] != val:\n                nums[k] = nums[i]\n                k += 1\n        return k	O(n)	O(1)	2026-01-19 17:52:46.278504
82	6	java	brute_force	We use three nested loops to check every possible triplet. If the sum is zero, the triplet is sorted and added to a set to avoid duplicates.	import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        int n = nums.length;\n        Set<List<Integer>> set = new HashSet<>();\n\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                for (int k = j + 1; k < n; k++) {\n                    if (nums[i] + nums[j] + nums[k] == 0) {\n                        List<Integer> triplet = Arrays.asList(nums[i], nums[j], nums[k]);\n                        Collections.sort(triplet);\n                        set.add(triplet);\n                    }\n                }\n            }\n        }\n        return new ArrayList<>(set);\n    }\n}	O(n^3)	O(n)	2026-01-19 13:48:36.345723
83	6	java	optimal	The array is sorted first. For each element, two pointers are used to find pairs that sum to the negative of the fixed element. Duplicate triplets are skipped.	import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        Arrays.sort(nums);\n        int n = nums.length;\n\n        for (int i = 0; i < n; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n            int left = i + 1, right = n - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++;\n                    right--;\n                } else if (sum < 0) {\n                    left++;\n                } else {\n                    right--;\n                }\n            }\n        }\n        return res;\n    }\n}	O(n^2)	O(1)	2026-01-19 13:48:51.374464
84	6	java	most_optimal	This solution adds an early break when the fixed number becomes positive. Since the array is sorted, no valid triplet can exist beyond this point.	import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        Arrays.sort(nums);\n        int n = nums.length;\n\n        for (int i = 0; i < n; i++) {\n            if (nums[i] > 0) break;\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n            int left = i + 1, right = n - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++;\n                    right--;\n                } else if (sum < 0) {\n                    left++;\n                } else {\n                    right--;\n                }\n            }\n        }\n        return res;\n    }\n}	O(n^2)	O(1)	2026-01-19 13:49:05.092858
85	6	python	brute_force	We check every possible triplet using three nested loops. If the sum of the three numbers is zero, the triplet is sorted and stored in a set to avoid duplicates. This approach is simple but inefficient.	class Solution:\n    def threeSum(self, nums):\n        n = len(nums)\n        res = set()\n\n        for i in range(n):\n            for j in range(i + 1, n):\n                for k in range(j + 1, n):\n                    if nums[i] + nums[j] + nums[k] == 0:\n                        triplet = tuple(sorted([nums[i], nums[j], nums[k]]))\n                        res.add(triplet)\n\n        return [list(t) for t in res]	O(n^3)	O(1)	2026-01-19 13:49:52.054513
86	6	python	optimal	The array is sorted first. For each element, two pointers are used to find pairs whose sum equals the negative of the fixed element. Duplicate triplets are skipped.	class Solution:\n    def threeSum(self, nums):\n        nums.sort()\n        n = len(nums)\n        res = []\n\n        for i in range(n):\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n\n            left, right = i + 1, n - 1\n            while left < right:\n                s = nums[i] + nums[left] + nums[right]\n                if s == 0:\n                    res.append([nums[i], nums[left], nums[right]])\n                    while left < right and nums[left] == nums[left + 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right - 1]:\n                        right -= 1\n                    left += 1\n                    right -= 1\n                elif s < 0:\n                    left += 1\n                else:\n                    right -= 1\n\n        return res	O(n^2)	O(1)	2026-01-19 13:50:04.980243
87	6	python	most_optimal	This solution further optimizes the two-pointer approach by breaking early when the current number becomes positive. Since the array is sorted, no valid triplet can exist beyond this point.	class Solution:\n    def threeSum(self, nums):\n        nums.sort()\n        n = len(nums)\n        res = []\n\n        for i in range(n):\n            if nums[i] > 0:\n                break\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n\n            left, right = i + 1, n - 1\n            while left < right:\n                s = nums[i] + nums[left] + nums[right]\n                if s == 0:\n                    res.append([nums[i], nums[left], nums[right]])\n                    while left < right and nums[left] == nums[left + 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right - 1]:\n                        right -= 1\n                    left += 1\n                    right -= 1\n                elif s < 0:\n                    left += 1\n                else:\n                    right -= 1\n\n        return res	O(n^2)	O(1)	2026-01-19 13:50:16.938595
88	6	javascript	brute_force	We check every possible triplet using three nested loops. Each valid triplet is sorted and stored in a set to avoid duplicates. This approach is simple but inefficient.	var threeSum = function(nums) {\n    const n = nums.length;\n    const set = new Set();\n\n    for (let i = 0; i < n; i++) {\n        for (let j = i + 1; j < n; j++) {\n            for (let k = j + 1; k < n; k++) {\n                if (nums[i] + nums[j] + nums[k] === 0) {\n                    const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);\n                    set.add(triplet.toString());\n                }\n            }\n        }\n    }\n\n    const result = [];\n    for (const t of set) {\n        result.push(t.split(',').map(Number));\n    }\n    return result;\n};	O(n^3)	O(1)	2026-01-19 13:50:53.955149
89	6	javascript	optimal	The array is sorted first. For each element, a two-pointer approach is used to find pairs that sum to the negative of the fixed element. Duplicate triplets are skipped.	var threeSum = function(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    const n = nums.length;\n\n    for (let i = 0; i < n; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n\n        let left = i + 1, right = n - 1;\n        while (left < right) {\n            const sum = nums[i] + nums[left] + nums[right];\n            if (sum === 0) {\n                res.push([nums[i], nums[left], nums[right]]);\n                while (left < right && nums[left] === nums[left + 1]) left++;\n                while (left < right && nums[right] === nums[right - 1]) right--;\n                left++;\n                right--;\n            } else if (sum < 0) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n    }\n    return res;\n};	O(n^2)	O(1)	2026-01-19 13:51:06.675362
90	6	javascript	most_optimal	This version adds an early break when the current element becomes positive. Since the array is sorted, no valid triplet can exist beyond this point.	var threeSum = function(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    const n = nums.length;\n\n    for (let i = 0; i < n; i++) {\n        if (nums[i] > 0) break;\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n\n        let left = i + 1, right = n - 1;\n        while (left < right) {\n            const sum = nums[i] + nums[left] + nums[right];\n            if (sum === 0) {\n                res.push([nums[i], nums[left], nums[right]]);\n                while (left < right && nums[left] === nums[left + 1]) left++;\n                while (left < right && nums[right] === nums[right - 1]) right--;\n                left++;\n                right--;\n            } else if (sum < 0) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n    }\n    return res;\n};	O(n^2)	O(1)	2026-01-19 13:51:18.642274
91	7	java	brute_force	In the brute force approach, we iterate through the array and whenever we find the target value, we shift all subsequent elements one position to the left. The array size is effectively reduced by one each time the value is removed. This process continues until all occurrences of the given value are removed.\n\nThis approach works but is inefficient because shifting elements takes O(n) time for each removal.	class Solution {\n    public int removeElement(int[] nums, int val) {\n        int n = nums.length;\n        int i = 0;\n\n        while (i < n) {\n            if (nums[i] == val) {\n                for (int j = i; j < n - 1; j++) {\n                    nums[j] = nums[j + 1];\n                }\n                n--;\n            } else {\n                i++;\n            }\n        }\n        return n;\n    }\n}	O(n^2)	O(1)	2026-01-19 17:50:44.850818
92	7	java	optimal	In the optimal solution, we use the two-pointer technique. One pointer iterates through the array, while another pointer keeps track of the position to place the next valid element (not equal to val). Every time we encounter a valid element, we place it at the current position of the second pointer and increment it.\n\nThis ensures all valid elements are moved to the front of the array in a single pass.	class Solution {\n    public int removeElement(int[] nums, int val) {\n        int k = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] != val) {\n                nums[k++] = nums[i];\n            }\n        }\n        return k;\n    }\n}	O(n)	O(1)	2026-01-19 17:50:44.850818
93	7	java	most_optimal	In the most optimal approach, we reduce unnecessary writes by swapping elements equal to val with the last element in the array. When a value equal to val is found, it is replaced with the last unprocessed element, and the array size is reduced. This avoids shifting elements and minimizes write operations.\n\nThe order of elements may change, which is allowed by the problem.	class Solution {\n    public int removeElement(int[] nums, int val) {\n        int n = nums.length;\n        int i = 0;\n\n        while (i < n) {\n            if (nums[i] == val) {\n                nums[i] = nums[n - 1];\n                n--;\n            } else {\n                i++;\n            }\n        }\n        return n;\n    }\n}	O(n)	O(1)	2026-01-19 17:50:44.850818
94	7	cpp	brute_force	In the brute force approach, we traverse the array and whenever the target value is found, we shift all elements to its right one position to the left. The effective size of the array is reduced after each removal. This continues until all occurrences of the given value are removed.\n\nAlthough simple to understand, repeated shifting makes this approach inefficient for larger arrays.	class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        int n = nums.size();\n        int i = 0;\n\n        while (i < n) {\n            if (nums[i] == val) {\n                for (int j = i; j < n - 1; j++) {\n                    nums[j] = nums[j + 1];\n                }\n                n--;\n            } else {\n                i++;\n            }\n        }\n        return n;\n    }\n};	O(n^2)	O(1)	2026-01-19 17:51:48.513005
95	7	cpp	optimal	In the optimal solution, we use the two-pointer technique. One pointer iterates through the array, while another pointer tracks the index where the next valid element (not equal to val) should be placed. Each valid element is copied forward, and the final value of the second pointer gives the new length of the array.\n\nThis approach removes all occurrences in a single pass.	class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        int k = 0;\n        for (int i = 0; i < nums.size(); i++) {\n            if (nums[i] != val) {\n                nums[k++] = nums[i];\n            }\n        }\n        return k;\n    }\n};	O(n)	O(1)	2026-01-19 17:51:48.513005
96	7	cpp	most_optimal	In the most optimal approach, we swap elements equal to val with the last element of the array. Each time such a swap is made, the effective size of the array is reduced. This avoids unnecessary shifting and minimizes write operations.\n\nThe order of elements may change, which is allowed by the problem constraints.	class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        int n = nums.size();\n        int i = 0;\n\n        while (i < n) {\n            if (nums[i] == val) {\n                nums[i] = nums[n - 1];\n                n--;\n            } else {\n                i++;\n            }\n        }\n        return n;\n    }\n};	O(n)	O(1)	2026-01-19 17:51:48.513005
97	7	c	brute_force	In the brute force approach, we scan the array and whenever the target value is found, we shift all the elements to the right of it one position to the left. The effective size of the array is reduced after each removal. This continues until all occurrences of the given value are removed.\n\nThis approach is simple but inefficient because repeated shifting increases the time complexity.	int removeElement(int* nums, int numsSize, int val) {\n    int n = numsSize;\n    int i = 0;\n\n    while (i < n) {\n        if (nums[i] == val) {\n            for (int j = i; j < n - 1; j++) {\n                nums[j] = nums[j + 1];\n            }\n            n--;\n        } else {\n            i++;\n        }\n    }\n    return n;\n}	O(n^2)	O(1)	2026-01-19 17:52:21.655539
98	7	c	optimal	In the optimal solution, we use the two-pointer technique. One pointer iterates through the array, while the second pointer keeps track of the index where the next valid element (not equal to val) should be placed. Each valid element is copied forward in a single pass.\n\nThis approach efficiently removes all occurrences using constant extra space.	int removeElement(int* nums, int numsSize, int val) {\n    int k = 0;\n    for (int i = 0; i < numsSize; i++) {\n        if (nums[i] != val) {\n            nums[k++] = nums[i];\n        }\n    }\n    return k;\n}	O(n)	O(1)	2026-01-19 17:52:21.655539
99	7	c	most_optimal	In the most optimal approach, whenever an element equal to val is encountered, it is replaced with the last unprocessed element in the array. The effective array size is reduced after each replacement. This avoids unnecessary shifts and minimizes write operations.\n\nThe order of elements may change, which is allowed by the problem.	int removeElement(int* nums, int numsSize, int val) {\n    int n = numsSize;\n    int i = 0;\n\n    while (i < n) {\n        if (nums[i] == val) {\n            nums[i] = nums[n - 1];\n            n--;\n        } else {\n            i++;\n        }\n    }\n    return n;\n}	O(n)	O(1)	2026-01-19 17:52:21.655539
102	7	python	most_optimal	In the most optimal approach, whenever an element equal to val is found, it is replaced with the last unprocessed element in the list. The effective size of the list is reduced, avoiding unnecessary shifts and minimizing write operations.\n\nThe order of elements may change, which is allowed by the problem constraints.	class Solution:\n    def removeElement(self, nums, val):\n        n = len(nums)\n        i = 0\n\n        while i < n:\n            if nums[i] == val:\n                nums[i] = nums[n - 1]\n                n -= 1\n            else:\n                i += 1\n        return n	O(n)	O(1)	2026-01-19 17:52:46.278504
103	7	javascript	brute_force	In the brute force approach, we iterate through the array and whenever the target value is found, we remove it by shifting all subsequent elements one position to the left. The effective length of the array is reduced after each removal.\n\nThis approach is easy to understand but inefficient due to repeated shifting of elements.	var removeElement = function(nums, val) {\n    let n = nums.length;\n    let i = 0;\n\n    while (i < n) {\n        if (nums[i] === val) {\n            for (let j = i; j < n - 1; j++) {\n                nums[j] = nums[j + 1];\n            }\n            n--;\n        } else {\n            i++;\n        }\n    }\n    return n;\n};	O(n^2)	O(1)	2026-01-19 17:53:21.235766
104	7	javascript	optimal	In the optimal solution, we use the two-pointer technique. One pointer scans the array, while the second pointer tracks the position where the next element not equal to val should be placed. All valid elements are moved forward in a single pass.\n\nThis method efficiently removes the target value using constant extra space.	var removeElement = function(nums, val) {\n    let k = 0;\n    for (let i = 0; i < nums.length; i++) {\n        if (nums[i] !== val) {\n            nums[k++] = nums[i];\n        }\n    }\n    return k;\n};	O(n)	O(1)	2026-01-19 17:53:21.235766
105	7	javascript	most_optimal	In the most optimal approach, whenever an element equal to val is encountered, it is replaced with the last unprocessed element in the array. The effective array length is reduced after each replacement. This avoids unnecessary shifts and minimizes write operations.\n\nThe order of elements may change, which is allowed by the problem.	var removeElement = function(nums, val) {\n    let n = nums.length;\n    let i = 0;\n\n    while (i < n) {\n        if (nums[i] === val) {\n            nums[i] = nums[n - 1];\n            n--;\n        } else {\n            i++;\n        }\n    }\n    return n;\n};	O(n)	O(1)	2026-01-19 17:53:21.235766
107	8	cpp	brute_force	Generate all permutations of the array using recursion or STL next_permutation, store them, sort them lexicographically, then find the given permutation and return the next one. If the given permutation is the last, return the first permutation. This approach is not efficient and is only used for conceptual understanding.	#include <bits/stdc++.h>\nusing namespace std;\n\nvoid nextPermutation(vector<int>& nums) {\n    vector<vector<int>> perms;\n    sort(nums.begin(), nums.end());\n    do {\n        perms.push_back(nums);\n    } while (next_permutation(nums.begin(), nums.end()));\n\n    for (int i = 0; i < perms.size(); i++) {\n        if (perms[i] == nums) {\n            nums = perms[(i + 1) % perms.size()];\n            break;\n        }\n    }\n}	O(n! * n)	O(n!)	2026-01-20 17:37:03.918434
108	8	cpp	optimal	Use the built-in C++ STL function next_permutation which rearranges the array into the next lexicographically greater permutation. If no such permutation exists, it rearranges the array into the lowest possible order. This method is concise and efficient.	#include <algorithm>\nusing namespace std;\n\nvoid nextPermutation(vector<int>& nums) {\n    next_permutation(nums.begin(), nums.end());\n}	O(n)	O(1)	2026-01-20 17:37:35.181454
109	8	cpp	most_optimal	Traverse from right to find the first index where nums[i] < nums[i+1]. If found, swap it with the smallest element greater than it on the right. Finally, reverse the suffix after index i to obtain the next lexicographically smallest permutation. If no such index exists, reverse the entire array.	#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void nextPermutation(vector<int>& nums) {\n        int n = nums.size();\n        int i = n - 2;\n\n        while (i >= 0 && nums[i] >= nums[i + 1]) {\n            i--;\n        }\n\n        if (i >= 0) {\n            int j = n - 1;\n            while (nums[j] <= nums[i]) {\n                j--;\n            }\n            swap(nums[i], nums[j]);\n        }\n\n        reverse(nums.begin() + i + 1, nums.end());\n    }\n};	O(n)	O(1)	2026-01-20 17:37:54.458163
110	8	python	brute_force	Generate all permutations using itertools.permutations, sort them lexicographically, locate the given permutation, and return the next one. If the current permutation is the last, return the first permutation. This approach is highly inefficient and used only for understanding.	from itertools import permutations\n\nclass Solution:\n    def nextPermutation(self, nums):\n        perms = sorted(set(permutations(nums)))\n        idx = perms.index(tuple(nums))\n        nums[:] = perms[(idx + 1) % len(perms)]	O(n! * n)	O(n!)	2026-01-20 17:38:33.740402
111	8	python	optimal	Find the first decreasing element from the right, swap it with the next larger element, and sort the suffix. This solution mimics the built-in behavior in other languages and runs efficiently.	class Solution:\n    def nextPermutation(self, nums):\n        n = len(nums)\n        i = n - 2\n\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n\n        if i >= 0:\n            j = n - 1\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n\n        nums[i + 1:] = sorted(nums[i + 1:])	O(n)	O(1)	2026-01-20 17:38:49.132322
112	8	python	most_optimal	Traverse from right to find the first index where nums[i] < nums[i+1]. Swap it with the smallest element greater than it on the right, then reverse the suffix to obtain the next lexicographically smallest permutation. If no such index exists, reverse the entire array.	class Solution:\n    def nextPermutation(self, nums):\n        n = len(nums)\n        i = n - 2\n\n        while i >= 0 and nums[i] >= nums[i + 1]:\n            i -= 1\n\n        if i >= 0:\n            j = n - 1\n            while nums[j] <= nums[i]:\n                j -= 1\n            nums[i], nums[j] = nums[j], nums[i]\n\n        nums[i + 1:] = reversed(nums[i + 1:])	O(n)	O(1)	2026-01-20 17:39:04.93915
113	8	java	brute_force	Generate all permutations using recursion, store them in a list, sort the list lexicographically, find the current permutation, and replace it with the next one. If the permutation is the last, return the first. This approach is highly inefficient and used only for conceptual understanding.	import java.util.*;\n\nclass Solution {\n    public void nextPermutation(int[] nums) {\n        List<List<Integer>> perms = new ArrayList<>();\n        permute(nums, 0, perms);\n\n        perms.sort((a, b) -> {\n            for (int i = 0; i < a.size(); i++) {\n                if (!a.get(i).equals(b.get(i))) {\n                    return a.get(i) - b.get(i);\n                }\n            }\n            return 0;\n        });\n\n        List<Integer> curr = new ArrayList<>();\n        for (int x : nums) curr.add(x);\n\n        int idx = 0;\n        for (int i = 0; i < perms.size(); i++) {\n            if (perms.get(i).equals(curr)) {\n                idx = i;\n                break;\n            }\n        }\n\n        List<Integer> next = perms.get((idx + 1) % perms.size());\n        for (int i = 0; i < nums.length; i++) {\n            nums[i] = next.get(i);\n        }\n    }\n\n    private void permute(int[] nums, int start, List<List<Integer>> res) {\n        if (start == nums.length) {\n            List<Integer> list = new ArrayList<>();\n            for (int x : nums) list.add(x);\n            res.add(list);\n            return;\n        }\n        for (int i = start; i < nums.length; i++) {\n            swap(nums, start, i);\n            permute(nums, start + 1, res);\n            swap(nums, start, i);\n        }\n    }\n\n    private void swap(int[] nums, int i, int j) {\n        int temp = nums[i];\n        nums[i] = nums[j];\n        nums[j] = temp;\n    }\n}	O(n! * n)	O(n!)	2026-01-20 17:39:47.429561
114	8	java	optimal	Find the first decreasing index from the right, swap it with the next larger element, and sort the suffix using built-in utilities. This approach is efficient but relies on sorting instead of reversal.	import java.util.*;\n\nclass Solution {\n    public void nextPermutation(int[] nums) {\n        int n = nums.length;\n        int i = n - 2;\n\n        while (i >= 0 && nums[i] >= nums[i + 1]) {\n            i--;\n        }\n\n        if (i >= 0) {\n            int j = n - 1;\n            while (nums[j] <= nums[i]) {\n                j--;\n            }\n            swap(nums, i, j);\n        }\n\n        Arrays.sort(nums, i + 1, n);\n    }\n\n    private void swap(int[] nums, int i, int j) {\n        int temp = nums[i];\n        nums[i] = nums[j];\n        nums[j] = temp;\n    }\n}	O(n)	O(1)	2026-01-20 17:40:40.709672
115	8	java	most_optimal	Traverse from right to find the first index where nums[i] < nums[i+1]. Swap it with the smallest element greater than it on the right. Finally, reverse the suffix after index i. If no such index exists, reverse the entire array.	class Solution {\n    public void nextPermutation(int[] nums) {\n        int n = nums.length;\n        int i = n - 2;\n\n        while (i >= 0 && nums[i] >= nums[i + 1]) {\n            i--;\n        }\n\n        if (i >= 0) {\n            int j = n - 1;\n            while (nums[j] <= nums[i]) {\n                j--;\n            }\n            swap(nums, i, j);\n        }\n\n        reverse(nums, i + 1, n - 1);\n    }\n\n    private void swap(int[] nums, int i, int j) {\n        int temp = nums[i];\n        nums[i] = nums[j];\n        nums[j] = temp;\n    }\n\n    private void reverse(int[] nums, int left, int right) {\n        while (left < right) {\n            swap(nums, left, right);\n            left++;\n            right--;\n        }\n    }\n}	O(n)	O(1)	2026-01-20 17:40:57.932719
117	8	javascript	brute_force	Generate all permutations using recursion, store them in an array, sort them lexicographically, locate the current permutation, and replace it with the next one. If the permutation is the last, return the first. This approach is inefficient and used only for conceptual understanding.	class Solution {\n    nextPermutation(nums) {\n        const perms = [];\n        this.permute(nums, 0, perms);\n\n        perms.sort((a, b) => {\n            for (let i = 0; i < a.length; i++) {\n                if (a[i] !== b[i]) return a[i] - b[i];\n            }\n            return 0;\n        });\n\n        const curr = nums.join(",");\n        let idx = 0;\n\n        for (let i = 0; i < perms.length; i++) {\n            if (perms[i].join(",") === curr) {\n                idx = i;\n                break;\n            }\n        }\n\n        const next = perms[(idx + 1) % perms.length];\n        for (let i = 0; i < nums.length; i++) {\n            nums[i] = next[i];\n        }\n    }\n\n    permute(nums, start, res) {\n        if (start === nums.length) {\n            res.push([...nums]);\n            return;\n        }\n        for (let i = start; i < nums.length; i++) {\n            [nums[start], nums[i]] = [nums[i], nums[start]];\n            this.permute(nums, start + 1, res);\n            [nums[start], nums[i]] = [nums[i], nums[start]];\n        }\n    }\n}	O(n! * n)	O(n!)	2026-01-20 17:43:37.553151
118	8	javascript	optimal	Find the first decreasing index from the right, swap it with the next larger element on the right, and sort the suffix to obtain the next permutation.	class Solution {\n    nextPermutation(nums) {\n        const n = nums.length;\n        let i = n - 2;\n\n        while (i >= 0 && nums[i] >= nums[i + 1]) {\n            i--;\n        }\n\n        if (i >= 0) {\n            let j = n - 1;\n            while (nums[j] <= nums[i]) {\n                j--;\n            }\n            [nums[i], nums[j]] = [nums[j], nums[i]];\n        }\n\n        const suffix = nums.splice(i + 1).sort((a, b) => a - b);\n        nums.push(...suffix);\n    }\n}	O(n)	O(1)	2026-01-20 17:43:51.367927
119	8	javascript	most_optimal	Traverse from right to find the first index where nums[i] < nums[i+1]. Swap it with the smallest element greater than it on the right. Reverse the suffix after index i to get the next lexicographically smallest permutation. If no such index exists, reverse the entire array.	class Solution {\n    nextPermutation(nums) {\n        const n = nums.length;\n        let i = n - 2;\n\n        while (i >= 0 && nums[i] >= nums[i + 1]) {\n            i--;\n        }\n\n        if (i >= 0) {\n            let j = n - 1;\n            while (nums[j] <= nums[i]) {\n                j--;\n            }\n            [nums[i], nums[j]] = [nums[j], nums[i]];\n        }\n\n        this.reverse(nums, i + 1, n - 1);\n    }\n\n    reverse(nums, left, right) {\n        while (left < right) {\n            [nums[left], nums[right]] = [nums[right], nums[left]];\n            left++;\n            right--;\n        }\n    }\n}	O(n)	O(1)	2026-01-20 17:44:08.794037
120	8	c	brute_force	Generate all permutations using recursion, store them in a 2D array, sort them lexicographically, find the given permutation, and replace it with the next one. If the current permutation is the last, return the first permutation. This approach is highly inefficient and used only for conceptual understanding.	#include <stdio.h>\n#include <string.h>\n\nvoid swap(int* a, int* b) {\n    int t = *a; *a = *b; *b = t;\n}\n\nvoid permute(int* nums, int l, int r, int perms[][100], int* idx) {\n    if (l == r) {\n        for (int i = 0; i <= r; i++)\n            perms[*idx][i] = nums[i];\n        (*idx)++;\n        return;\n    }\n    for (int i = l; i <= r; i++) {\n        swap(&nums[l], &nums[i]);\n        permute(nums, l + 1, r, perms, idx);\n        swap(&nums[l], &nums[i]);\n    }\n}\n\nvoid nextPermutation(int* nums, int numsSize) {\n    int perms[100000][100];\n    int count = 0;\n\n    permute(nums, 0, numsSize - 1, perms, &count);\n\n    for (int i = 0; i < count - 1; i++) {\n        if (memcmp(perms[i], nums, sizeof(int) * numsSize) == 0) {\n            memcpy(nums, perms[i + 1], sizeof(int) * numsSize);\n            return;\n        }\n    }\n    memcpy(nums, perms[0], sizeof(int) * numsSize);\n}	O(n! * n)	O(n!)	2026-01-20 17:45:37.565027
121	8	c	optimal	Find the first decreasing index from the right, swap it with the next larger element, and sort the suffix using qsort to obtain the next permutation.	#include <stdlib.h>\n\nint cmp(const void* a, const void* b) {\n    return (*(int*)a - *(int*)b);\n}\n\nvoid swap(int* a, int* b) {\n    int t = *a; *a = *b; *b = t;\n}\n\nvoid nextPermutation(int* nums, int numsSize) {\n    int i = numsSize - 2;\n\n    while (i >= 0 && nums[i] >= nums[i + 1])\n        i--;\n\n    if (i >= 0) {\n        int j = numsSize - 1;\n        while (nums[j] <= nums[i])\n            j--;\n        swap(&nums[i], &nums[j]);\n    }\n\n    qsort(nums + i + 1, numsSize - i - 1, sizeof(int), cmp);\n}	O(n)	O(1)	2026-01-20 17:45:50.763752
122	8	c	most_optimal	Traverse from right to find the first index where nums[i] < nums[i+1]. Swap it with the smallest element greater than it on the right. Reverse the suffix after index i. If no such index exists, reverse the entire array.	#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int t = *a; *a = *b; *b = t;\n}\n\nvoid reverse(int* nums, int l, int r) {\n    while (l < r) {\n        swap(&nums[l], &nums[r]);\n        l++;\n        r--;\n    }\n}\n\nvoid nextPermutation(int* nums, int numsSize) {\n    int i = numsSize - 2;\n\n    while (i >= 0 && nums[i] >= nums[i + 1])\n        i--;\n\n    if (i >= 0) {\n        int j = numsSize - 1;\n        while (nums[j] <= nums[i])\n            j--;\n        swap(&nums[i], &nums[j]);\n    }\n\n    reverse(nums, i + 1, numsSize - 1);\n}	O(n)	O(1)	2026-01-20 17:46:08.859886
123	18	cpp	brute_force	This approach checks every possible contiguous subarray and counts how many 0s and 1s it contains.\nIf, for any subarray, the number of 0s equals the number of 1s, that subarray is valid, and we update the maximum length.	class Solution {\npublic:\n    int findMaxLength(vector<int>& nums) {\n        int n = nums.size();\n        int maxLen = 0;\n\n        for (int i = 0; i < n; i++) {\n            int zeros = 0, ones = 0;\n            for (int j = i; j < n; j++) {\n                if (nums[j] == 0) zeros++;\n                else ones++;\n\n                if (zeros == ones) {\n                    maxLen = max(maxLen, j - i + 1);\n                }\n            }\n        }\n        return maxLen;\n    }\n};\n	O(n²)	O(1)	2026-01-21 04:25:24.793883
124	20	javascript	brute_force	We repeatedly check if the array is non-decreasing.\nIf not, we scan all adjacent pairs to find the minimum sum, rebuild a new array by merging that pair, and repeat until sorted.\n\nTime: O(n³)\n\nSpace: O(n)\n\nWhy brute force: Rebuilds the array every operation	var minimumPairRemoval = function(nums) {\n    let ops = 0;\n\n    while (true) {\n        // check if non-decreasing\n        let sorted = true;\n        for (let i = 1; i < nums.length; i++) {\n            if (nums[i] < nums[i - 1]) {\n                sorted = false;\n                break;\n            }\n        }\n        if (sorted || nums.length <= 1) break;\n\n        // find min adjacent sum\n        let minSum = Infinity;\n        let idx = 0;\n        for (let i = 0; i < nums.length - 1; i++) {\n            if (nums[i] + nums[i + 1] < minSum) {\n                minSum = nums[i] + nums[i + 1];\n                idx = i;\n            }\n        }\n\n        // rebuild array\n        let newArr = [];\n        for (let i = 0; i < nums.length; i++) {\n            if (i === idx) {\n                newArr.push(nums[i] + nums[i + 1]);\n                i++;\n            } else {\n                newArr.push(nums[i]);\n            }\n        }\n\n        nums = newArr;\n        ops++;\n    }\n\n    return ops;\n};\n	Time: O(n³)	 Space: O(n)	2026-01-22 12:17:41.116851
125	20	javascript	optimal	We simulate the process in place.\nAt each step, we find the adjacent pair with the smallest sum, merge it directly in the same array, and remove one element using splice.\n\nTime: O(n³)\n\nSpace: O(1)\n\nWhy optimal: No extra array, minimal memory usage	var minimumPairRemoval = function(nums) {\n\n    function isNonDecreasing(arr) {\n        for (let i = 1; i < arr.length; i++) {\n            if (arr[i] < arr[i - 1]) return false;\n        }\n        return true;\n    }\n\n    let operations = 0;\n\n    while (nums.length > 1 && !isNonDecreasing(nums)) {\n        let minSum = nums[0] + nums[1];\n        let index = 0;\n\n        for (let i = 1; i < nums.length - 1; i++) {\n            let sum = nums[i] + nums[i + 1];\n            if (sum < minSum) {\n                minSum = sum;\n                index = i;\n            }\n        }\n\n        nums[index] = minSum;\n        nums.splice(index + 1, 1);\n        operations++;\n    }\n\n    return operations;\n};\n	Time: O(n³)	Space: O(1)	2026-01-22 12:17:56.626355
126	20	javascript	most_optimal	We use a min-heap to track adjacent pair sums instead of scanning the array every time.\nAfter each merge, invalid heap entries are skipped using lazy deletion.\n\nTime: O(n³) (array changes invalidate heap)\n\nSpace: O(n)\n\nWhy not better: Array mutation prevents true optimization	var minimumPairRemoval = function(nums) {\n\n    // Helper: check non-decreasing\n    function isNonDecreasing(arr) {\n        for (let i = 1; i < arr.length; i++) {\n            if (arr[i] < arr[i - 1]) return false;\n        }\n        return true;\n    }\n\n    // Min Heap implementation\n    class MinHeap {\n        constructor() {\n            this.heap = [];\n        }\n\n        push(item) {\n            this.heap.push(item);\n            this._up(this.heap.length - 1);\n        }\n\n        pop() {\n            if (this.heap.length === 1) return this.heap.pop();\n            const top = this.heap[0];\n            this.heap[0] = this.heap.pop();\n            this._down(0);\n            return top;\n        }\n\n        _up(i) {\n            while (i > 0) {\n                let p = Math.floor((i - 1) / 2);\n                if (this.heap[p][0] <= this.heap[i][0]) break;\n                [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];\n                i = p;\n            }\n        }\n\n        _down(i) {\n            while (true) {\n                let l = 2 * i + 1, r = 2 * i + 2, smallest = i;\n                if (l < this.heap.length && this.heap[l][0] < this.heap[smallest][0])\n                    smallest = l;\n                if (r < this.heap.length && this.heap[r][0] < this.heap[smallest][0])\n                    smallest = r;\n                if (smallest === i) break;\n                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];\n                i = smallest;\n            }\n        }\n\n        isEmpty() {\n            return this.heap.length === 0;\n        }\n    }\n\n    let operations = 0;\n\n    while (nums.length > 1 && !isNonDecreasing(nums)) {\n\n        let heap = new MinHeap();\n\n        // Build heap of adjacent sums\n        for (let i = 0; i < nums.length - 1; i++) {\n            heap.push([nums[i] + nums[i + 1], i]);\n        }\n\n        // Extract valid minimum pair\n        let index;\n        while (true) {\n            let [sum, i] = heap.pop();\n            if (i < nums.length - 1 && nums[i] + nums[i + 1] === sum) {\n                index = i;\n                break;\n            }\n        }\n\n        // Merge\n        nums[index] = nums[index] + nums[index + 1];\n        nums.splice(index + 1, 1);\n\n        operations++;\n    }\n\n    return operations;\n};\n	Time: O(n³) 	Space: O(n)	2026-01-22 12:18:50.086995
127	20	python	brute_force	Repeatedly:\n\nCheck if the array is non-decreasing\n\nFind the adjacent pair with minimum sum\n\nBuild a new array after merging that pair	class Solution:\n    def minimumPairRemoval(self, nums):\n        operations = 0\n\n        while True:\n            # Check if non-decreasing\n            sorted_arr = True\n            for i in range(1, len(nums)):\n                if nums[i] < nums[i - 1]:\n                    sorted_arr = False\n                    break\n\n            if sorted_arr or len(nums) <= 1:\n                break\n\n            # Find minimum adjacent pair\n            min_sum = float('inf')\n            index = 0\n            for i in range(len(nums) - 1):\n                if nums[i] + nums[i + 1] < min_sum:\n                    min_sum = nums[i] + nums[i + 1]\n                    index = i\n\n            # Build new array\n            new_nums = []\n            i = 0\n            while i < len(nums):\n                if i == index:\n                    new_nums.append(nums[i] + nums[i + 1])\n                    i += 2\n                else:\n                    new_nums.append(nums[i])\n                    i += 1\n\n            nums = new_nums\n            operations += 1\n\n        return operations\n	Time: O(n³)	Space: O(n)	2026-01-22 12:25:36.589153
128	20	python	optimal	Same greedy logic, but:\n\nModify the array in place\n\nAvoid rebuilding arrays\n\nUse pop() to remove merged element	class Solution:\n    def minimumPairRemoval(self, nums):\n        def is_non_decreasing(arr):\n            for i in range(1, len(arr)):\n                if arr[i] < arr[i - 1]:\n                    return False\n            return True\n\n        operations = 0\n\n        while len(nums) > 1 and not is_non_decreasing(nums):\n            min_sum = nums[0] + nums[1]\n            index = 0\n\n            for i in range(1, len(nums) - 1):\n                s = nums[i] + nums[i + 1]\n                if s < min_sum:\n                    min_sum = s\n                    index = i\n\n            nums[index] = min_sum\n            nums.pop(index + 1)\n            operations += 1\n\n        return operations\n	Time: O(n³)	Space: O(1)	2026-01-22 12:26:32.110369
129	20	python	most_optimal	Use a min-heap to track adjacent pair sums\n\nApply lazy deletion to handle invalid heap entries\n\nAvoid full scans where possible	import heapq\n\nclass Solution:\n    def minimumPairRemoval(self, nums):\n        def is_non_decreasing(arr):\n            for i in range(1, len(arr)):\n                if arr[i] < arr[i - 1]:\n                    return False\n            return True\n\n        operations = 0\n\n        while len(nums) > 1 and not is_non_decreasing(nums):\n            heap = []\n\n            # Build heap of adjacent sums\n            for i in range(len(nums) - 1):\n                heapq.heappush(heap, (nums[i] + nums[i + 1], i))\n\n            # Extract valid minimum pair\n            while heap:\n                s, i = heapq.heappop(heap)\n                if i < len(nums) - 1 and nums[i] + nums[i + 1] == s:\n                    index = i\n                    break\n\n            nums[index] = nums[index] + nums[index + 1]\n            nums.pop(index + 1)\n            operations += 1\n\n        return operations\n	Time: O(n³)	Space: O(n)	2026-01-22 12:27:28.54275
130	20	java	brute_force	Check if array is non-decreasing\n\nFind minimum adjacent sum\n\nBuild a new array after merging that pair	class Solution {\n    public int minimumPairRemoval(int[] nums) {\n        int operations = 0;\n\n        while (true) {\n            // Check if non-decreasing\n            boolean sorted = true;\n            for (int i = 1; i < nums.length; i++) {\n                if (nums[i] < nums[i - 1]) {\n                    sorted = false;\n                    break;\n                }\n            }\n\n            if (sorted || nums.length <= 1) break;\n\n            // Find minimum adjacent sum\n            int minSum = Integer.MAX_VALUE;\n            int index = 0;\n            for (int i = 0; i < nums.length - 1; i++) {\n                if (nums[i] + nums[i + 1] < minSum) {\n                    minSum = nums[i] + nums[i + 1];\n                    index = i;\n                }\n            }\n\n            // Build new array\n            int[] newArr = new int[nums.length - 1];\n            int k = 0;\n            for (int i = 0; i < nums.length; i++) {\n                if (i == index) {\n                    newArr[k++] = nums[i] + nums[i + 1];\n                    i++;\n                } else {\n                    newArr[k++] = nums[i];\n                }\n            }\n\n            nums = newArr;\n            operations++;\n        }\n\n        return operations;\n    }\n}\n	Time: O(n³)	Space: O(n)	2026-01-22 12:29:26.330677
131	20	java	optimal	Same greedy logic, but:\n\nModify the array in place\n\nShift elements instead of rebuilding arrays	class Solution {\n    public int minimumPairRemoval(int[] nums) {\n        int operations = 0;\n\n        while (nums.length > 1 && !isNonDecreasing(nums)) {\n\n            int minSum = nums[0] + nums[1];\n            int index = 0;\n\n            for (int i = 1; i < nums.length - 1; i++) {\n                int sum = nums[i] + nums[i + 1];\n                if (sum < minSum) {\n                    minSum = sum;\n                    index = i;\n                }\n            }\n\n            nums[index] = minSum;\n\n            // shift left\n            for (int i = index + 1; i < nums.length - 1; i++) {\n                nums[i] = nums[i + 1];\n            }\n\n            nums = java.util.Arrays.copyOf(nums, nums.length - 1);\n            operations++;\n        }\n\n        return operations;\n    }\n\n    private boolean isNonDecreasing(int[] nums) {\n        for (int i = 1; i < nums.length; i++) {\n            if (nums[i] < nums[i - 1]) return false;\n        }\n        return true;\n    }\n}\n	Time: O(n³)	Space: O(1)	2026-01-22 12:30:51.270188
132	20	java	most_optimal	Description\n\nUse a min-heap to track adjacent sums\n\nUse lazy validation because merges invalidate neighbors\n⚠️ Still cubic due to array mutation	import java.util.*;\n\nclass Solution {\n    public int minimumPairRemoval(int[] nums) {\n        int operations = 0;\n\n        while (nums.length > 1 && !isNonDecreasing(nums)) {\n\n            PriorityQueue<int[]> pq =\n                new PriorityQueue<>((a, b) -> a[0] - b[0]);\n\n            for (int i = 0; i < nums.length - 1; i++) {\n                pq.add(new int[]{nums[i] + nums[i + 1], i});\n            }\n\n            int index = 0;\n            while (!pq.isEmpty()) {\n                int[] top = pq.poll();\n                int sum = top[0], i = top[1];\n\n                if (i < nums.length - 1 && nums[i] + nums[i + 1] == sum) {\n                    index = i;\n                    break;\n                }\n            }\n\n            nums[index] += nums[index + 1];\n\n            for (int i = index + 1; i < nums.length - 1; i++) {\n                nums[i] = nums[i + 1];\n            }\n\n            nums = Arrays.copyOf(nums, nums.length - 1);\n            operations++;\n        }\n\n        return operations;\n    }\n\n    private boolean isNonDecreasing(int[] nums) {\n        for (int i = 1; i < nums.length; i++) {\n            if (nums[i] < nums[i - 1]) return false;\n        }\n        return true;\n    }\n}\n	Time: O(n³)  	Space: O(n)	2026-01-22 12:32:03.390581
135	20	cpp	brute_force	Repeatedly:\n\nCheck if array is non-decreasing\n\nFind adjacent pair with minimum sum\n\nBuild a new array after merging that pair	class Solution {\npublic:\n    int minimumPairRemoval(vector<int>& nums) {\n        int operations = 0;\n\n        while (true) {\n            // Check if non-decreasing\n            bool sorted = true;\n            for (int i = 1; i < nums.size(); i++) {\n                if (nums[i] < nums[i - 1]) {\n                    sorted = false;\n                    break;\n                }\n            }\n            if (sorted || nums.size() <= 1) break;\n\n            // Find minimum adjacent sum\n            int minSum = INT_MAX, index = 0;\n            for (int i = 0; i < nums.size() - 1; i++) {\n                if (nums[i] + nums[i + 1] < minSum) {\n                    minSum = nums[i] + nums[i + 1];\n                    index = i;\n                }\n            }\n\n            // Build new array\n            vector<int> newArr;\n            for (int i = 0; i < nums.size(); i++) {\n                if (i == index) {\n                    newArr.push_back(nums[i] + nums[i + 1]);\n                    i++;\n                } else {\n                    newArr.push_back(nums[i]);\n                }\n            }\n\n            nums = newArr;\n            operations++;\n        }\n\n        return operations;\n    }\n};\n	Time: O(n³)  	Space: O(n)	2026-01-22 12:37:05.988959
133	20	cpp	most_optimal	Use a min-heap to track adjacent sums\n\nUse lazy validation because merges invalidate neighbors\nStill cubic due to array mutation	class Solution {\npublic:\n    bool isNonDecreasing(vector<int>& nums) {\n        for (int i = 1; i < nums.size(); i++) {\n            if (nums[i] < nums[i - 1]) return false;\n        }\n        return true;\n    }\n\n    int minimumPairRemoval(vector<int>& nums) {\n        int operations = 0;\n\n        while (nums.size() > 1 && !isNonDecreasing(nums)) {\n            priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;\n\n            for (int i = 0; i < nums.size() - 1; i++) {\n                pq.push({nums[i] + nums[i + 1], i});\n            }\n\n            int index = 0;\n            while (!pq.empty()) {\n                auto [sum, i] = pq.top();\n                pq.pop();\n                if (i < nums.size() - 1 && nums[i] + nums[i + 1] == sum) {\n                    index = i;\n                    break;\n                }\n            }\n\n            nums[index] += nums[index + 1];\n            nums.erase(nums.begin() + index + 1);\n            operations++;\n        }\n\n        return operations;\n    }\n};\n	Time: O(n³)	Space: O(n)	2026-01-22 12:33:37.452834
134	20	cpp	optimal	Same greedy logic, but:\n\nModify the array in place\n\nRemove elements using erase\n\nNo extra arrays	class Solution {\npublic:\n    bool isNonDecreasing(vector<int>& nums) {\n        for (int i = 1; i < nums.size(); i++) {\n            if (nums[i] < nums[i - 1]) return false;\n        }\n        return true;\n    }\n\n    int minimumPairRemoval(vector<int>& nums) {\n        int operations = 0;\n\n        while (nums.size() > 1 && !isNonDecreasing(nums)) {\n            int minSum = nums[0] + nums[1];\n            int index = 0;\n\n            for (int i = 1; i < nums.size() - 1; i++) {\n                int sum = nums[i] + nums[i + 1];\n                if (sum < minSum) {\n                    minSum = sum;\n                    index = i;\n                }\n            }\n\n            nums[index] = minSum;\n            nums.erase(nums.begin() + index + 1);\n            operations++;\n        }\n\n        return operations;\n    }\n};\n	Time: O(n³)  	Space: O(1) 	2026-01-22 12:35:36.405638
136	20	c	brute_force	Description\n\nRepeatedly check if array is non-decreasing\n\nFind minimum adjacent pair\n\nBuild a new array after merging	int minimumPairRemoval(int* nums, int numsSize) {\n    int operations = 0;\n\n    while (1) {\n        // check if non-decreasing\n        int sorted = 1;\n        for (int i = 1; i < numsSize; i++) {\n            if (nums[i] < nums[i - 1]) {\n                sorted = 0;\n                break;\n            }\n        }\n        if (sorted || numsSize <= 1) break;\n\n        // find minimum adjacent sum\n        int minSum = nums[0] + nums[1];\n        int index = 0;\n        for (int i = 1; i < numsSize - 1; i++) {\n            int sum = nums[i] + nums[i + 1];\n            if (sum < minSum) {\n                minSum = sum;\n                index = i;\n            }\n        }\n\n        // build new array\n        int newArr[55];\n        int k = 0;\n        for (int i = 0; i < numsSize; i++) {\n            if (i == index) {\n                newArr[k++] = nums[i] + nums[i + 1];\n                i++;\n            } else {\n                newArr[k++] = nums[i];\n            }\n        }\n\n        for (int i = 0; i < k; i++)\n            nums[i] = newArr[i];\n\n        numsSize--;\n        operations++;\n    }\n\n    return operations;\n}\n	Time: O(n³)  	Space: O(n)	2026-01-22 12:39:38.354492
137	20	c	optimal	Description\n\nSame greedy logic\n\nModify array in place\n\nShift elements instead of rebuilding	int isNonDecreasing(int* nums, int n) {\n    for (int i = 1; i < n; i++) {\n        if (nums[i] < nums[i - 1])\n            return 0;\n    }\n    return 1;\n}\n\nint minimumPairRemoval(int* nums, int numsSize) {\n    int operations = 0;\n\n    while (numsSize > 1 && !isNonDecreasing(nums, numsSize)) {\n        int minSum = nums[0] + nums[1];\n        int index = 0;\n\n        for (int i = 1; i < numsSize - 1; i++) {\n            int sum = nums[i] + nums[i + 1];\n            if (sum < minSum) {\n                minSum = sum;\n                index = i;\n            }\n        }\n\n        nums[index] = minSum;\n\n        // shift left\n        for (int i = index + 1; i < numsSize - 1; i++) {\n            nums[i] = nums[i + 1];\n        }\n\n        numsSize--;\n        operations++;\n    }\n\n    return operations;\n}\n	Time: O(n³)  	Space: O(1) 	2026-01-22 12:40:25.418638
138	20	c	most_optimal	Description\n\nTrack adjacent sums using a min-heap idea\n\nAfter merge, neighbors become invalid\n\nStill requires validation → no real asymptotic gain\n\nIn pure C, heap adds complexity without benefit for n ≤ 50.\n\n Complexity\n\nTime: O(n³)\n\nSpace: O(n)	int isNonDecreasing(int* nums, int n) {\n    for (int i = 1; i < n; i++) {\n        if (nums[i] < nums[i - 1])\n            return 0;\n    }\n    return 1;\n}\n\nint minimumPairRemoval(int* nums, int numsSize) {\n    int operations = 0;\n\n    while (numsSize > 1 && !isNonDecreasing(nums, numsSize)) {\n        int minSum = nums[0] + nums[1];\n        int index = 0;\n\n        // Find leftmost adjacent pair with minimum sum\n        for (int i = 1; i < numsSize - 1; i++) {\n            int sum = nums[i] + nums[i + 1];\n            if (sum < minSum) {\n                minSum = sum;\n                index = i;\n            }\n        }\n\n        // Merge the pair\n        nums[index] = minSum;\n\n        // Shift elements left\n        for (int i = index + 1; i < numsSize - 1; i++) {\n            nums[i] = nums[i + 1];\n        }\n\n        numsSize--;\n        operations++;\n    }\n\n    return operations;\n}\n	Time: O(n³)	Space: O(n)	2026-01-22 12:42:58.039419
139	21	c	brute_force	Description\n\nRepeatedly check if the array is non-decreasing\n\nFind the adjacent pair with minimum sum\n\nCreate a new array after merging that pair\n\nRepeat until sorted	int minimumPairRemoval(int* nums, int numsSize) {\n    int operations = 0;\n\n    while (1) {\n        // Check if non-decreasing\n        int sorted = 1;\n        for (int i = 1; i < numsSize; i++) {\n            if (nums[i] < nums[i - 1]) {\n                sorted = 0;\n                break;\n            }\n        }\n        if (sorted || numsSize <= 1) break;\n\n        // Find minimum adjacent sum\n        int minSum = nums[0] + nums[1];\n        int index = 0;\n        for (int i = 1; i < numsSize - 1; i++) {\n            int sum = nums[i] + nums[i + 1];\n            if (sum < m\n	O(n³)	O(n)	2026-01-22 13:26:05.275968
140	21	c	optimal	Description\n\nSame greedy logic\n\nModify array in place\n\nShift elements instead of creating new arrays	int isNonDecreasing(int* nums, int n) {\n    for (int i = 1; i < n; i++) {\n        if (nums[i] < nums[i - 1])\n            return 0;\n    }\n    return 1;\n}\n\nint minimumPairRemoval(int* nums, int numsSize) {\n    int operations = 0;\n\n    while (numsSize > 1 && !isNonDecreasing(nums, numsSize)) {\n        int minSum = nums[0] + nums[1];\n        int index = 0;\n\n        // Find leftmost minimum-sum adjacent pair\n        for (int i = 1; i < numsSize - 1; i++) {\n            int sum = nums[i] + nums[i + 1];\n            if (sum < minSum) {\n                minSum = sum;\n                index = i;\n            }\n        }\n\n        // Merge\n        nums[index] = minSum;\n\n        // Shift left\n        for (int i = index + 1; i < numsSize - 1; i++) {\n            nums[i] = nums[i + 1];\n        }\n\n        numsSize--;\n        operations++;\n    }\n\n    return operations;\n}\n	O(n³)	O(1)	2026-01-22 13:27:22.696806
141	21	c	most_optimal	The most optimal approach works in place:\n\nCheck if the array is already non-decreasing.\n\nIf not, scan the array to find the leftmost adjacent pair with the smallest sum.\n\nMerge that pair by replacing the first element with their sum.\n\nRemove the second element by shifting the remaining elements left.\n\nCount the operation and repeat.	nt isNonDecreasing(int* nums, int n) {\n    for (int i = 1; i < n; i++) {\n        if (nums[i] < nums[i - 1])\n            return 0;\n    }\n    return 1;\n}\n\nint minimumPairRemoval(int* nums, int numsSize) {\n    int operations = 0;\n\n    while (numsSize > 1 && !isNonDecreasing(nums, numsSize)) {\n        int minSum = nums[0] + nums[1];\n        int index = 0;\n\n        // Find leftmost adjacent pair with minimum sum\n        for (int i = 1; i < numsSize - 1; i++) {\n            int sum = nums[i] + nums[i + 1];\n            if (sum < minSum) {\n                minSum = sum;\n                index = i;\n            }\n        }\n\n        // Merge the pair\n        nums[index] = minSum;\n\n        // Shift elements left\n        for (int i = index + 1; i < numsSize - 1; i++) {\n            nums[i] = nums[i + 1];\n        }\n\n        numsSize--;\n        operations++;\n    }\n\n    return operations;\n}	O(n³)	O(1)	2026-01-22 13:29:42.558374
144	22	cpp	brute_force	Loop over all starting positions (i, j)\n\nFor each position, try all square sizes k\n\nFor each square:\n\nCompute row sums\n\nCompute column sums\n\nCompute both diagonals\n\nIf all equal → update answer	class Solution {\npublic:\n    int largestMagicSquare(vector<vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size();\n        int ans = 1;\n\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                for (int k = 2; i + k <= m && j + k <= n; k++) {\n                    int target = 0;\n                    for (int c = j; c < j + k; c++)\n                        target += grid[i][c];\n\n                    bool ok = true;\n\n                    // rows\n                    for (int r = i; r < i + k && ok; r++) {\n                        int sum = 0;\n                        for (int c = j; c < j + k; c++)\n                            sum += grid[r][c];\n                        if (sum != target) ok = false;\n                    }\n\n                    // columns\n                    for (int c = j; c < j + k && ok; c++) {\n                        int sum = 0;\n                        for (int r = i; r < i + k; r++)\n                            sum += grid[r][c];\n                        if (sum != target) ok = false;\n                    }\n\n                    // diagonals\n                    int d1 = 0, d2 = 0;\n                    for (int t = 0; t < k; t++) {\n                        d1 += grid[i + t][j + t];\n                        d2 += grid[i + t][j + k - t - 1];\n                    }\n\n                    if (d1 != target || d2 != target) ok = false;\n\n                    if (ok) ans = max(ans, k);\n                }\n            }\n        }\n        return ans;\n    }\n};\n	O(m⋅n⋅k^3)	O(1)	2026-01-22 14:40:42.173406
145	22	cpp	optimal	Instead of recomputing sums every time:\n\nUse prefix sums for rows & columns\n\nDiagonals still computed in O(k)	class Solution {\npublic:\n    int largestMagicSquare(vector<vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size();\n        vector<vector<int>> row(m, vector<int>(n + 1, 0));\n        vector<vector<int>> col(m + 1, vector<int>(n, 0));\n\n        for (int i = 0; i < m; i++)\n            for (int j = 0; j < n; j++) {\n                row[i][j + 1] = row[i][j] + grid[i][j];\n                col[i + 1][j] = col[i][j] + grid[i][j];\n            }\n\n        int ans = 1;\n\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                for (int k = 2; i + k <= m && j + k <= n; k++) {\n                    int target = row[i][j + k] - row[i][j];\n                    bool ok = true;\n\n                    for (int r = i; r < i + k && ok; r++)\n                        if (row[r][j + k] - row[r][j] != target)\n                            ok = false;\n\n                    for (int c = j; c < j + k && ok; c++)\n                        if (col[i + k][c] - col[i][c] != target)\n                            ok = false;\n\n                    int d1 = 0, d2 = 0;\n                    for (int t = 0; t < k; t++) {\n                        d1 += grid[i + t][j + t];\n                        d2 += grid[i + t][j + k - t - 1];\n                    }\n\n                    if (d1 != target || d2 != target) ok = false;\n\n                    if (ok) ans = max(ans, k);\n                }\n            }\n        }\n        return ans;\n    }\n};\n	O(m⋅n⋅k^2)	O(mn)	2026-01-22 14:41:24.070171
143	22	c	optimal	Instead of recomputing sums repeatedly:\n\nUse row prefix sums\n\nUse column prefix sums\n\nRow/column sum becomes O(1)	int largestMagicSquare(int** grid, int m, int* nPtr) {\n    int n = *nPtr;\n    int row[51][52] = {0};\n    int col[52][51] = {0};\n\n    // build prefix sums\n    for (int i = 0; i < m; i++)\n        for (int j = 0; j < n; j++) {\n            row[i][j + 1] = row[i][j] + grid[i][j];\n            col[i + 1][j] = col[i][j] + grid[i][j];\n        }\n\n    int ans = 1;\n\n    for (int i = 0; i < m; i++) {\n        for (int j = 0; j < n; j++) {\n            for (int k = 2; i + k <= m && j + k <= n; k++) {\n\n                int target = row[i][j + k] - row[i][j];\n                int ok = 1;\n\n                // rows\n                for (int r = i; r < i + k && ok; r++)\n                    if (row[r][j + k] - row[r][j] != target)\n                        ok = 0;\n\n                // columns\n                for (int c = j; c < j + k && ok; c++)\n                    if (col[i + k][c] - col[i][c] != target)\n                        ok = 0;\n\n                // diagonals\n                int d1 = 0, d2 = 0;\n                for (int t = 0; t < k; t++) {\n                    d1 += grid[i + t][j + t];\n                    d2 += grid[i + t][j + k - t - 1];\n                }\n\n                if (d1 != target || d2 != target)\n                    ok = 0;\n\n                if (ok && k > ans)\n                    ans = k;\n            }\n        }\n    }\n    return ans;\n}\n	O(m⋅n⋅k^2)	O(mn)	2026-01-22 14:39:45.153327
146	22	cpp	most_optimal	Start checking largest k first\n\nOnce found → return immediately\n\nThis drastically cuts runtime in practice	class Solution {\npublic:\n    int largestMagicSquare(vector<vector<int>>& grid) {\n        int m = grid.size(), n = grid[0].size();\n        vector<vector<int>> row(m, vector<int>(n + 1, 0));\n        vector<vector<int>> col(m + 1, vector<int>(n, 0));\n\n        for (int i = 0; i < m; i++)\n            for (int j = 0; j < n; j++) {\n                row[i][j + 1] = row[i][j] + grid[i][j];\n                col[i + 1][j] = col[i][j] + grid[i][j];\n            }\n\n        int maxK = min(m, n);\n\n        for (int k = maxK; k >= 2; k--) {\n            for (int i = 0; i + k <= m; i++) {\n                for (int j = 0; j + k <= n; j++) {\n                    int target = row[i][j + k] - row[i][j];\n                    bool ok = true;\n\n                    for (int r = i; r < i + k && ok; r++)\n                        if (row[r][j + k] - row[r][j] != target)\n                            ok = false;\n\n                    for (int c = j; c < j + k && ok; c++)\n                        if (col[i + k][c] - col[i][c] != target)\n                            ok = false;\n\n                    int d1 = 0, d2 = 0;\n                    for (int t = 0; t < k; t++) {\n                        d1 += grid[i + t][j + t];\n                        d2 += grid[i + t][j + k - t - 1];\n                    }\n\n                    if (ok && d1 == target && d2 == target)\n                        return k;\n                }\n            }\n        }\n        return 1;\n    }\n};\n	O(m⋅n⋅k^2)	O(mn)	2026-01-22 14:42:05.580286
142	22	c	brute_force	Loop over all starting positions (i, j)\n\nTry all square sizes k\n\nFor each square:\n\nCalculate first row sum as target\n\nCheck all rows\n\nCheck all columns\n\nCheck diagonals\n\nUpdate maximum k	int largestMagicSquare(int** grid, int m, int* nPtr) {\n    int n = *nPtr;\n    int ans = 1;\n\n    for (int i = 0; i < m; i++) {\n        for (int j = 0; j < n; j++) {\n\n            for (int k = 2; i + k <= m && j + k <= n; k++) {\n\n                int target = 0;\n                for (int c = j; c < j + k; c++)\n                    target += grid[i][c];\n\n                int ok = 1;\n\n                // check rows\n                for (int r = i; r < i + k && ok; r++) {\n                    int sum = 0;\n                    for (int c = j; c < j + k; c++)\n                        sum += grid[r][c];\n                    if (sum != target) ok = 0;\n                }\n\n                // check columns\n                for (int c = j; c < j + k && ok; c++) {\n                    int sum = 0;\n                    for (int r = i; r < i + k; r++)\n                        sum += grid[r][c];\n                    if (sum != target) ok = 0;\n                }\n\n                // diagonals\n                int d1 = 0, d2 = 0;\n                for (int t = 0; t < k; t++) {\n                    d1 += grid[i + t][j + t];\n                    d2 += grid[i + t][j + k - t - 1];\n                }\n\n                if (d1 != target || d2 != target) ok = 0;\n\n                if (ok && k > ans)\n                    ans = k;\n            }\n        }\n    }\n    return ans;\n}\n	O(m⋅n⋅k^3)	O(1)	2026-01-22 14:39:02.527067
147	22	c	most_optimal	Key Optimization\n\nStart checking from largest possible k\n\nThe moment a magic square is found → return immediately	int largestMagicSquare(int** grid, int m, int* nPtr) {\n    int n = *nPtr;\n    int row[51][52] = {0};\n    int col[52][51] = {0};\n\n    for (int i = 0; i < m; i++)\n        for (int j = 0; j < n; j++) {\n            row[i][j + 1] = row[i][j] + grid[i][j];\n            col[i + 1][j] = col[i][j] + grid[i][j];\n        }\n\n    int maxK = m < n ? m : n;\n\n    for (int k = maxK; k >= 2; k--) {\n        for (int i = 0; i + k <= m; i++) {\n            for (int j = 0; j + k <= n; j++) {\n\n                int target = row[i][j + k] - row[i][j];\n                int ok = 1;\n\n                for (int r = i; r < i + k && ok; r++)\n                    if (row[r][j + k] - row[r][j] != target)\n                        ok = 0;\n\n                for (int c = j; c < j + k && ok; c++)\n                    if (col[i + k][c] - col[i][c] != target)\n                        ok = 0;\n\n                int d1 = 0, d2 = 0;\n                for (int t = 0; t < k; t++) {\n                    d1 += grid[i + t][j + t];\n                    d2 += grid[i + t][j + k - t - 1];\n                }\n\n                if (ok && d1 == target && d2 == target)\n                    return k;\n            }\n        }\n    }\n    return 1;\n}\n	O(m · n · k²)	O(m⋅n)	2026-01-22 14:45:23.598008
148	22	java	most_optimal	Key Optimization\n\nStart checking from largest possible k\n\nOnce found → return immediately\n\nSaves a lot of unnecessary checks	class Solution {\n    public int largestMagicSquare(int[][] grid) {\n        int m = grid.length;\n        int n = grid[0].length;\n\n        int[][] row = new int[m][n + 1];\n        int[][] col = new int[m + 1][n];\n\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                row[i][j + 1] = row[i][j] + grid[i][j];\n                col[i + 1][j] = col[i][j] + grid[i][j];\n            }\n        }\n\n        int maxK = Math.min(m, n);\n\n        for (int k = maxK; k >= 2; k--) {\n            for (int i = 0; i + k <= m; i++) {\n                for (int j = 0; j + k <= n; j++) {\n\n                    int target = row[i][j + k] - row[i][j];\n                    boolean ok = true;\n\n                    for (int r = i; r < i + k && ok; r++)\n                        if (row[r][j + k] - row[r][j] != target)\n                            ok = false;\n\n                    for (int c = j; c < j + k && ok; c++)\n                        if (col[i + k][c] - col[i][c] != target)\n                            ok = false;\n\n                    int d1 = 0, d2 = 0;\n                    for (int t = 0; t < k; t++) {\n                        d1 += grid[i + t][j + t];\n                        d2 += grid[i + t][j + k - t - 1];\n                    }\n\n                    if (ok && d1 == target && d2 == target)\n                        return k;\n                }\n            }\n        }\n        return 1;\n    }\n}\n	O(m · n · k²)	O(m⋅n)	2026-01-22 14:47:27.977971
149	22	java	brute_force	Loop over all top-left corners (i, j)\n\nTry all possible sizes k\n\nFor each k × k square:\n\nTake first row sum as target\n\nCompare all row sums\n\nCompare all column sums\n\nCompare diagonal sums\n\nTrack maximum k	class Solution {\n    public int largestMagicSquare(int[][] grid) {\n        int m = grid.length;\n        int n = grid[0].length;\n        int ans = 1;\n\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                for (int k = 2; i + k <= m && j + k <= n; k++) {\n\n                    int target = 0;\n                    for (int c = j; c < j + k; c++)\n                        target += grid[i][c];\n\n                    boolean ok = true;\n\n                    // rows\n                    for (int r = i; r < i + k && ok; r++) {\n                        int sum = 0;\n                        for (int c = j; c < j + k; c++)\n                            sum += grid[r][c];\n                        if (sum != target) ok = false;\n                    }\n\n                    // columns\n                    for (int c = j; c < j + k && ok; c++) {\n                        int sum = 0;\n                        for (int r = i; r < i + k; r++)\n                            sum += grid[r][c];\n                        if (sum != target) ok = false;\n                    }\n\n                    // diagonals\n                    int d1 = 0, d2 = 0;\n                    for (int t = 0; t < k; t++) {\n                        d1 += grid[i + t][j + t];\n                        d2 += grid[i + t][j + k - t - 1];\n                    }\n\n                    if (d1 != target || d2 != target)\n                        ok = false;\n\n                    if (ok) ans = Math.max(ans, k);\n                }\n            }\n        }\n        return ans;\n    }\n}\n	O(m⋅n⋅k^3)	O(1)	2026-01-22 14:49:04.323747
150	22	java	optimal	Avoid recomputing sums repeatedly:\n\nUse row prefix sums\n\nUse column prefix sums\n\nRow & column sum checks become O(1)	class Solution {\n    public int largestMagicSquare(int[][] grid) {\n        int m = grid.length;\n        int n = grid[0].length;\n\n        int[][] row = new int[m][n + 1];\n        int[][] col = new int[m + 1][n];\n\n        // build prefix sums\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                row[i][j + 1] = row[i][j] + grid[i][j];\n                col[i + 1][j] = col[i][j] + grid[i][j];\n            }\n        }\n\n        int ans = 1;\n\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                for (int k = 2; i + k <= m && j + k <= n; k++) {\n\n                    int target = row[i][j + k] - row[i][j];\n                    boolean ok = true;\n\n                    // rows\n                    for (int r = i; r < i + k && ok; r++)\n                        if (row[r][j + k] - row[r][j] != target)\n                            ok = false;\n\n                    // columns\n                    for (int c = j; c < j + k && ok; c++)\n                        if (col[i + k][c] - col[i][c] != target)\n                            ok = false;\n\n                    // diagonals\n                    int d1 = 0, d2 = 0;\n                    for (int t = 0; t < k; t++) {\n                        d1 += grid[i + t][j + t];\n                        d2 += grid[i + t][j + k - t - 1];\n                    }\n\n                    if (d1 != target || d2 != target)\n                        ok = false;\n\n                    if (ok) ans = Math.max(ans, k);\n                }\n            }\n        }\n        return ans;\n    }\n}\n	O(m⋅n⋅k^2)	O(m⋅n)	2026-01-22 14:49:46.16707
151	22	python	brute_force	Iterate over all top-left positions (i, j)\n\nTry all possible square sizes k\n\nFor each square:\n\nCompute first row sum as target\n\nVerify all rows, columns, diagonals\n\nTrack maximum k	class Solution:\n    def largestMagicSquare(self, grid):\n        m, n = len(grid), len(grid[0])\n        ans = 1\n\n        for i in range(m):\n            for j in range(n):\n                for k in range(2, min(m - i, n - j) + 1):\n\n                    target = sum(grid[i][j:j+k])\n                    ok = True\n\n                    # rows\n                    for r in range(i, i + k):\n                        if sum(grid[r][j:j+k]) != target:\n                            ok = False\n                            break\n\n                    # columns\n                    for c in range(j, j + k):\n                        if sum(grid[r][c] for r in range(i, i + k)) != target:\n                            ok = False\n                            break\n\n                    # diagonals\n                    d1 = sum(grid[i + t][j + t] for t in range(k))\n                    d2 = sum(grid[i + t][j + k - t - 1] for t in range(k))\n\n                    if d1 != target or d2 != target:\n                        ok = False\n\n                    if ok:\n                        ans = max(ans, k)\n\n        return ans\n	O(m⋅n⋅k^3)	O(1)	2026-01-22 14:51:11.726962
152	22	python	optimal	Instead of recomputing row/column sums:\n\nUse prefix sums\n\nRow & column sums become O(1)	class Solution:\n    def largestMagicSquare(self, grid):\n        m, n = len(grid), len(grid[0])\n\n        row = [[0] * (n + 1) for _ in range(m)]\n        col = [[0] * n for _ in range(m + 1)]\n\n        # build prefix sums\n        for i in range(m):\n            for j in range(n):\n                row[i][j + 1] = row[i][j] + grid[i][j]\n                col[i + 1][j] = col[i][j] + grid[i][j]\n\n        ans = 1\n\n        for i in range(m):\n            for j in range(n):\n                for k in range(2, min(m - i, n - j) + 1):\n\n                    target = row[i][j + k] - row[i][j]\n                    ok = True\n\n                    # rows\n                    for r in range(i, i + k):\n                        if row[r][j + k] - row[r][j] != target:\n                            ok = False\n                            break\n\n                    # columns\n                    for c in range(j, j + k):\n                        if col[i + k][c] - col[i][c] != target:\n                            ok = False\n                            break\n\n                    # diagonals\n                    d1 = sum(grid[i + t][j + t] for t in range(k))\n                    d2 = sum(grid[i + t][j + k - t - 1] for t in range(k))\n\n                    if d1 != target or d2 != target:\n                        ok = False\n\n                    if ok:\n                        ans = max(ans, k)\n\n        return ans\n	O(m⋅n⋅k^2)	O(m.n)	2026-01-22 14:52:10.737218
153	22	python	most_optimal	Start checking from largest possible k\n\nOnce found → return immediately\n\nAvoids unnecessary checks	class Solution:\n    def largestMagicSquare(self, grid):\n        m, n = len(grid), len(grid[0])\n\n        row = [[0] * (n + 1) for _ in range(m)]\n        col = [[0] * n for _ in range(m + 1)]\n\n        for i in range(m):\n            for j in range(n):\n                row[i][j + 1] = row[i][j] + grid[i][j]\n                col[i + 1][j] = col[i][j] + grid[i][j]\n\n        max_k = min(m, n)\n\n        for k in range(max_k, 1, -1):\n            for i in range(m - k + 1):\n                for j in range(n - k + 1):\n\n                    target = row[i][j + k] - row[i][j]\n                    ok = True\n\n                    for r in range(i, i + k):\n                        if row[r][j + k] - row[r][j] != target:\n                            ok = False\n                            break\n\n                    for c in range(j, j + k):\n                        if col[i + k][c] - col[i][c] != target:\n                            ok = False\n                            break\n\n                    d1 = sum(grid[i + t][j + t] for t in range(k))\n                    d2 = sum(grid[i + t][j + k - t - 1] for t in range(k))\n\n                    if ok and d1 == target and d2 == target:\n                        return k\n\n        return 1\n	O(m · n · k²)	O(m⋅n)	2026-01-22 14:52:48.444911
154	22	javascript	brute_force	Try every possible k × k subgrid\n\nFor each subgrid:\n\nCheck all row sums\n\nCheck all column sums\n\nCheck both diagonals\n\nIf all sums match → magic square	var largestMagicSquare = function(grid) {\n    const m = grid.length;\n    const n = grid[0].length;\n    let ans = 1;\n\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            for (let k = 2; i + k <= m && j + k <= n; k++) {\n\n                let target = 0;\n                for (let c = j; c < j + k; c++)\n                    target += grid[i][c];\n\n                let ok = true;\n\n                // rows\n                for (let r = i; r < i + k && ok; r++) {\n                    let sum = 0;\n                    for (let c = j; c < j + k; c++)\n                        sum += grid[r][c];\n                    if (sum !== target) ok = false;\n                }\n\n                // columns\n                for (let c = j; c < j + k && ok; c++) {\n                    let sum = 0;\n                    for (let r = i; r < i + k; r++)\n                        sum += grid[r][c];\n                    if (sum !== target) ok = false;\n                }\n\n                // diagonals\n                let d1 = 0, d2 = 0;\n                for (let t = 0; t < k; t++) {\n                    d1 += grid[i + t][j + t];\n                    d2 += grid[i + t][j + k - t - 1];\n                }\n\n                if (d1 !== target || d2 !== target) ok = false;\n\n                if (ok) ans = Math.max(ans, k);\n            }\n        }\n    }\n    return ans;\n};\n	O(m⋅n⋅k^3)	O(1)	2026-01-22 14:54:14.950492
155	22	javascript	optimal	Avoid recomputing row/column sums\n\nUse prefix sums\n\nRow & column sum checks become O(1)	var largestMagicSquare = function(grid) {\n    const m = grid.length;\n    const n = grid[0].length;\n\n    const row = Array.from({ length: m }, () => Array(n + 1).fill(0));\n    const col = Array.from({ length: m + 1 }, () => Array(n).fill(0));\n\n    // build prefix sums\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            row[i][j + 1] = row[i][j] + grid[i][j];\n            col[i + 1][j] = col[i][j] + grid[i][j];\n        }\n    }\n\n    let ans = 1;\n\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            for (let k = 2; i + k <= m && j + k <= n; k++) {\n\n                const target = row[i][j + k] - row[i][j];\n                let ok = true;\n\n                // rows\n                for (let r = i; r < i + k && ok; r++)\n                    if (row[r][j + k] - row[r][j] !== target)\n                        ok = false;\n\n                // columns\n                for (let c = j; c < j + k && ok; c++)\n                    if (col[i + k][c] - col[i][c] !== target)\n                        ok = false;\n\n                // diagonals\n                let d1 = 0, d2 = 0;\n                for (let t = 0; t < k; t++) {\n                    d1 += grid[i + t][j + t];\n                    d2 += grid[i + t][j + k - t - 1];\n                }\n\n                if (d1 !== target || d2 !== target)\n                    ok = false;\n\n                if (ok) ans = Math.max(ans, k);\n            }\n        }\n    }\n    return ans;\n};\n	O(m⋅n⋅k^2)	O(m⋅n)	2026-01-22 14:54:51.734589
156	22	javascript	most_optimal	Start checking from largest possible k\n\nThe moment a valid square is found → return immediately\n\nSaves unnecessary checks	var largestMagicSquare = function(grid) {\n    const m = grid.length;\n    const n = grid[0].length;\n\n    const row = Array.from({ length: m }, () => Array(n + 1).fill(0));\n    const col = Array.from({ length: m + 1 }, () => Array(n).fill(0));\n\n    for (let i = 0; i < m; i++) {\n        for (let j = 0; j < n; j++) {\n            row[i][j + 1] = row[i][j] + grid[i][j];\n            col[i + 1][j] = col[i][j] + grid[i][j];\n        }\n    }\n\n    const maxK = Math.min(m, n);\n\n    for (let k = maxK; k >= 2; k--) {\n        for (let i = 0; i + k <= m; i++) {\n            for (let j = 0; j + k <= n; j++) {\n\n                const target = row[i][j + k] - row[i][j];\n                let ok = true;\n\n                for (let r = i; r < i + k && ok; r++)\n                    if (row[r][j + k] - row[r][j] !== target)\n                        ok = false;\n\n                for (let c = j; c < j + k && ok; c++)\n                    if (col[i + k][c] - col[i][c] !== target)\n                        ok = false;\n\n                let d1 = 0, d2 = 0;\n                for (let t = 0; t < k; t++) {\n                    d1 += grid[i + t][j + t];\n                    d2 += grid[i + t][j + k - t - 1];\n                }\n\n                if (ok && d1 === target && d2 === target)\n                    return k;\n            }\n        }\n    }\n    return 1;\n};\n	O(m · n · k²)	O(m⋅n)	2026-01-22 14:55:31.378856
\.


--
-- Data for Name: problem_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problem_templates (id, problem_id, language, starter_code, wrapper_code) FROM stdin;
95	20	javascript	var minimumPairRemoval = function(nums) {\n    // Write your logic here\n};\n	'use strict';\n\nconst fs = require('fs');\n\n// <<< INSERT USER CODE HERE >>>\n\nconst input = fs.readFileSync(0, 'utf8').trim();\n\n// Extract all integers (handles: 5 2 3 1, [5,2,3,1], nums = [5,2,3,1])\nconst nums = input.match(/-?\\d+/g)?.map(Number) || [];\n\nconsole.log(minimumPairRemoval(nums));\n
102	22	cpp	class Solution {\npublic:\n    int largestMagicSquare(vector<vector<int>>& grid) {\n        // Write your logic here\n    }\n};\n	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string line;\n    getline(cin, line);\n\n    vector<vector<int>> grid;\n    vector<int> row;\n    int num = 0;\n    bool inNum = false;\n\n    // Properly parse grid row-by-row\n    for (char c : line) {\n        if (isdigit(c)) {\n            num = num * 10 + (c - '0');\n            inNum = true;\n        } else {\n            if (inNum) {\n                row.push_back(num);\n                num = 0;\n                inNum = false;\n            }\n            if (c == ']') {\n                if (!row.empty()) {\n                    grid.push_back(row);\n                    row.clear();\n                }\n            }\n        }\n    }\n\n    // Safety check\n    if (grid.empty()) {\n        cout << 1 << "\\n";\n        return 0;\n    }\n\n    Solution sol;\n    cout << sol.largestMagicSquare(grid) << "\\n";\n    return 0;\n}\n
1	1	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n    }\n};\n  	\n#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string line;\n    getline(cin, line);\n\n    stringstream ss(line);\n    vector<int> nums;\n    int x;\n    while (ss >> x) {\n        nums.push_back(x);\n    }\n\n    int target;\n    cin >> target;\n\n    Solution sol;\n    vector<int> result = sol.twoSum(nums, target);\n\n    cout << "[";\n    for (int i = 0; i < result.size(); i++) {\n        cout << result[i];\n        if (i + 1 < result.size()) cout << ",";\n    }\n    cout << "]\\n";\n\n    return 0;\n}\n  
108	23	cpp	class Solution {\npublic:\n    int nextNumericallyBalancedNumber(int n) {\n        // Write your logic here\n    }\n};\n	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int n;\n    cin >> n;\n\n    Solution sol;\n    cout << sol.nextNumericallyBalancedNumber(n) << "\\n";\n\n    return 0;\n}\n
10	1	c	int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your logic here\n    *returnSize = 0;\n    return NULL;\n}	#include <stdio.h>\n#include <stdlib.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    int nums[1000];\n    int n = 0;\n\n    while (scanf("%d", &nums[n]) == 1) {\n        n++;\n        if (getchar() == '\\n') break;\n    }\n\n    int target;\n    scanf("%d", &target);\n\n    int returnSize;\n    int* result = twoSum(nums, n, target, &returnSize);\n\n    printf("[");\n    for (int i = 0; i < returnSize; i++) {\n        printf("%d", result[i]);\n        if (i + 1 < returnSize) printf(",");\n    }\n    printf("]\\n");\n\n    free(result);\n    return 0;\n}
11	1	java	\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your logic here\n        return new int[]{};\n    }\n}\n  	\nimport java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        // Line 1: space-separated array elements\n        String[] parts = br.readLine().trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) {\n            nums[i] = Integer.parseInt(parts[i]);\n        }\n\n        // Line 2: target\n        int target = Integer.parseInt(br.readLine().trim());\n\n        Solution sol = new Solution();\n        int[] result = sol.twoSum(nums, target);\n\n        if (result.length == 2) {\n            System.out.println("[" + result[0] + "," + result[1] + "]");\n        } else {\n            System.out.println("[]");\n        }\n    }\n}\n  
13	1	python	\nclass Solution:\n    def twoSum(self, nums, target):\n        # Write your logic here\n        return []\n  	\nimport sys\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    # Input format:\n    # Line 1: space-separated array elements\n    # Line 2: target value\n\n    nums = list(map(int, sys.stdin.readline().strip().split()))\n    target = int(sys.stdin.readline().strip())\n\n    sol = Solution()\n    result = sol.twoSum(nums, target)\n\n    # Output in strict LeetCode format (NO spaces)\n    if isinstance(result, list):\n        print("[" + ",".join(map(str, result)) + "]")\n    else:\n        print("[]")\n\nif __name__ == "__main__":\n    main()\n  
16	1	javascript	\nvar twoSum = function(nums, target) {\n    // Write your logic here\n};\n  	\n// <<< INSERT USER CODE HERE >>>\n\nconst fs = require("fs");\n\nconst input = fs.readFileSync(0, "utf8").trim().split("\\n");\nconst nums = input[0].trim().split(" ").map(Number);\nconst target = Number(input[1]);\n\nconst result = twoSum(nums, target);\nprocess.stdout.write("[" + result.join(",") + "]");\n  
19	2	cpp	class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string s;\n    getline(cin, s);\n\n    Solution sol;\n    cout << sol.lengthOfLongestSubstring(s);\n\n    return 0;\n}
21	2	java	class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n\n        Solution sol = new Solution();\n        System.out.print(sol.lengthOfLongestSubstring(s));\n    }\n}
22	2	c	int lengthOfLongestSubstring(char* s) {\n    \n}	#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    char s[100005];\n\n    if (fgets(s, sizeof(s), stdin) == NULL) {\n        return 0;\n    }\n\n    // remove trailing newline if present\n    s[strcspn(s, "\\n")] = 0;\n\n    printf("%d", lengthOfLongestSubstring(s));\n\n    return 0;\n}
23	2	python	class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass	import sys\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    s = sys.stdin.readline().rstrip("\\n")\n\n    sol = Solution()\n    print(sol.lengthOfLongestSubstring(s))\n\nif __name__ == "__main__":\n    main()\n
24	2	javascript	class Solution {\n    lengthOfLongestSubstring(s) {\n        \n    }\n}	const fs = require("fs");\n\n// <<< INSERT USER CODE HERE >>>\n\nfunction main() {\n    const input = fs.readFileSync(0, "utf8").trimEnd();\n    const s = input;\n\n    const sol = new Solution();\n    const result = sol.lengthOfLongestSubstring(s);\n    process.stdout.write(String(result));\n}\n\nmain();\n
25	3	cpp	class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int x;\n    cin >> x;\n\n    Solution sol;\n    cout << sol.reverse(x);\n\n    return 0;\n}
26	3	c	int reverse(int x) {\n    \n}	#include <stdio.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    int x;\n    scanf("%d", &x);\n\n    printf("%d", reverse(x));\n\n    return 0;\n}
27	3	python	class Solution:\n    def reverse(self, x: int) -> int:\n        	# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    x = int(input().strip())\n    sol = Solution()\n    print(sol.reverse(x))\n\nif __name__ == "__main__":\n    main()
28	3	java	class Solution {\n    public int reverse(int x) {\n        \n    }\n}	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int x = Integer.parseInt(br.readLine().trim());\n\n        Solution sol = new Solution();\n        System.out.print(sol.reverse(x));\n    }\n}
29	3	javascript	var reverse = function(x) {\n    \n};	'use strict';\n\n// <<< INSERT USER CODE HERE >>>\n\nconst fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    const x = parseInt(input, 10);\n\n    console.log(reverse(x));\n}\n\nmain();
30	4	cpp	class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        \n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int n;\n    cin >> n;\n\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    int k;\n    cin >> k;\n\n    Solution sol;\n    vector<int> result = sol.maxSlidingWindow(nums, k);\n\n    for (int i = 0; i < result.size(); i++) {\n        if (i) cout << " ";\n        cout << result[i];\n    }\n\n    return 0;\n}
33	4	java	class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        \n    }\n}	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        int n = Integer.parseInt(br.readLine().trim());\n\n        String[] parts = br.readLine().trim().split("\\\\s+");\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) {\n            nums[i] = Integer.parseInt(parts[i]);\n        }\n\n        int k = Integer.parseInt(br.readLine().trim());\n\n        Solution sol = new Solution();\n        int[] result = sol.maxSlidingWindow(nums, k);\n\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < result.length; i++) {\n            if (i > 0) sb.append(" ");\n            sb.append(result[i]);\n        }\n\n        System.out.print(sb.toString());\n    }\n}
34	4	c	int* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {\n    \n}	#include <stdio.h>\n#include <stdlib.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n\n    int* nums = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) {\n        scanf("%d", &nums[i]);\n    }\n\n    int k;\n    scanf("%d", &k);\n\n    int returnSize = 0;\n    int* result = maxSlidingWindow(nums, n, k, &returnSize);\n\n    for (int i = 0; i < returnSize; i++) {\n        if (i) printf(" ");\n        printf("%d", result[i]);\n    }\n\n    free(nums);\n    free(result);\n\n    return 0;\n}
35	4	python	class Solution:\n    def maxSlidingWindow(self, nums, k):\n        \n	# <<< INSERT USER CODE HERE >>>\n\nimport sys\n\ndef main():\n    data = sys.stdin.read().strip().split()\n    idx = 0\n\n    n = int(data[idx])\n    idx += 1\n\n    nums = list(map(int, data[idx:idx+n]))\n    idx += n\n\n    k = int(data[idx])\n\n    sol = Solution()\n    result = sol.maxSlidingWindow(nums, k)\n\n    print(" ".join(map(str, result)))\n\nif __name__ == "__main__":\n    main()\n
36	4	javascript	var maxSlidingWindow = function(nums, k) {\n    \n};	'use strict';\n\n// <<< INSERT USER CODE HERE >>>\n\nconst fs = require('fs');\n\nfunction main() {\n    const data = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\n    let idx = 0;\n\n    const n = parseInt(data[idx++], 10);\n\n    const nums = [];\n    for (let i = 0; i < n; i++) {\n        nums.push(parseInt(data[idx++], 10));\n    }\n\n    const k = parseInt(data[idx++], 10);\n\n    const result = maxSlidingWindow(nums, k);\n    console.log(result.join(' '));\n}\n\nmain();
37	5	cpp	class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int x;\n    cin >> x;\n\n    Solution sol;\n    cout << (sol.isPalindrome(x) ? "true" : "false");\n\n    return 0;\n}
38	5	java	class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int x = Integer.parseInt(br.readLine().trim());\n\n        Solution sol = new Solution();\n        System.out.print(sol.isPalindrome(x) ? "true" : "false");\n    }\n}
39	5	python	class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass	import sys\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    x = int(sys.stdin.readline().strip())\n    sol = Solution()\n    result = sol.isPalindrome(x)\n    print("true" if result else "false")\n\nif __name__ == "__main__":\n    main()
40	5	javascript	var isPalindrome = function(x) {\n    \n};	'use strict';\n\nconst fs = require('fs');\n\n// <<< INSERT USER CODE HERE >>>\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconst x = Number(input);\n\nconst result = isPalindrome(x);\nprocess.stdout.write(result ? "true" : "false");
41	5	c	bool isPalindrome(int x) {\n    \n}	#include <stdio.h>\n#include <stdbool.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    int x;\n    scanf("%d", &x);\n\n    bool result = isPalindrome(x);\n    printf(result ? "true" : "false");\n\n    return 0;\n}
96	20	java	class Solution {\n    public int minimumPairRemoval(int[] nums) {\n        // Write your logic here\n        return 0;\n    }\n}\n	import java.io.*;\nimport java.util.*;\nimport java.util.regex.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n\n        // Extract all integers (handles: 5 2 3 1, [5,2,3,1], nums = [5,2,3,1])\n        Matcher m = Pattern.compile("-?\\\\d+").matcher(line);\n        List<Integer> list = new ArrayList<>();\n\n        while (m.find()) {\n            list.add(Integer.parseInt(m.group()));\n        }\n\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) {\n            nums[i] = list.get(i);\n        }\n\n        Solution sol = new Solution();\n        System.out.println(sol.minimumPairRemoval(nums));\n    }\n}\n
97	21	c	int* constructArray(int* nums, int numsSize, int* returnSize) {\n    int* ans = (int*)malloc(sizeof(int) * numsSize);\n    *returnSize = numsSize;\n\n    for (int i = 0; i < numsSize; i++) {\n        if (nums[i] == 2) {\n            ans[i] = -1;\n        } else {\n            ans[i] = nums[i] & (nums[i] - 1);\n        }\n    }\n    return ans;\n}\n\n	#include <stdio.h>\n#include <stdlib.h>\n#include <ctype.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    char line[10000];\n    if (!fgets(line, sizeof(line), stdin)) return 0;\n\n    int nums[1000];\n    int numsSize = 0;\n    int num = 0, neg = 0, inNum = 0;\n\n    for (int i = 0; line[i]; i++) {\n        if (line[i] == '-') {\n            neg = 1;\n        } else if (isdigit(line[i])) {\n            num = num * 10 + (line[i] - '0');\n            inNum = 1;\n        } else {\n            if (inNum) {\n                nums[numsSize++] = neg ? -num : num;\n                num = 0;\n                neg = 0;\n                inNum = 0;\n            }\n        }\n    }\n    if (inNum) {\n        nums[numsSize++] = neg ? -num : num;\n    }\n\n    int returnSize = 0;\n    int* ans = constructArray(nums, numsSize, &returnSize);\n\n    for (int i = 0; i < returnSize; i++) {\n        printf("%d", ans[i]);\n        if (i + 1 < returnSize) printf(" ");\n    }\n    printf("\\n");\n\n    free(ans);\n    return 0;\n}\n
47	6	cpp	class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Write your code here\n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string line;\n    getline(cin, line);\n\n    int start = line.find('[');\n    int end = line.find(']');\n    string arr = line.substr(start + 1, end - start - 1);\n\n    vector<int> nums;\n    stringstream ss(arr);\n    string temp;\n\n    while (getline(ss, temp, ',')) {\n        nums.push_back(stoi(temp));\n    }\n\n    Solution sol;\n    vector<vector<int>> result = sol.threeSum(nums);\n\n    for (auto &t : result) {\n        sort(t.begin(), t.end());\n    }\n    sort(result.begin(), result.end());\n\n    cout << "[";\n    for (int i = 0; i < result.size(); i++) {\n        cout << "[";\n        for (int j = 0; j < 3; j++) {\n            cout << result[i][j];\n            if (j < 2) cout << ",";\n        }\n        cout << "]";\n        if (i < result.size() - 1) cout << ",";\n    }\n    cout << "]";\n\n    return 0;\n}
48	6	c	/**\n * Return an array of arrays of size *returnSize.\n * The sizes of the arrays are returned as *returnColumnSizes array.\n */\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    // Write your code here\n}	#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint cmpInt(const void* a, const void* b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint cmpTriplet(const void* a, const void* b) {\n    int* t1 = *(int**)a;\n    int* t2 = *(int**)b;\n    for (int i = 0; i < 3; i++) {\n        if (t1[i] != t2[i]) return t1[i] - t2[i];\n    }\n    return 0;\n}\n\nint main() {\n    char line[10000];\n    fgets(line, sizeof(line), stdin);\n\n    char* start = strchr(line, '[');\n    char* end = strchr(line, ']');\n    *end = '\\0';\n    start++;\n\n    int nums[3000];\n    int numsSize = 0;\n\n    char* token = strtok(start, ",");\n    while (token) {\n        nums[numsSize++] = atoi(token);\n        token = strtok(NULL, ",");\n    }\n\n    int returnSize = 0;\n    int* returnColumnSizes = NULL;\n\n    int** result = threeSum(nums, numsSize, &returnSize, &returnColumnSizes);\n\n    for (int i = 0; i < returnSize; i++) {\n        qsort(result[i], 3, sizeof(int), cmpInt);\n    }\n    qsort(result, returnSize, sizeof(int*), cmpTriplet);\n\n    printf("[");\n    for (int i = 0; i < returnSize; i++) {\n        printf("[");\n        for (int j = 0; j < 3; j++) {\n            printf("%d", result[i][j]);\n            if (j < 2) printf(",");\n        }\n        printf("]");\n        if (i < returnSize - 1) printf(",");\n    }\n    printf("]");\n\n    return 0;\n}
93	20	c	int minimumPairRemoval(int* nums, int numsSize) {\n    // Write your logic here\n}\n	#include <stdio.h>\n#include <stdlib.h>\n#include <ctype.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    char line[10000];\n    fgets(line, sizeof(line), stdin);\n\n    int nums[1000];\n    int n = 0;\n    int num = 0;\n    int neg = 0;\n    int inNum = 0;\n\n    for (int i = 0; line[i]; i++) {\n        if (line[i] == '-') {\n            neg = 1;\n        }\n        else if (isdigit(line[i])) {\n            num = num * 10 + (line[i] - '0');\n            inNum = 1;\n        }\n        else {\n            if (inNum) {\n                nums[n++] = neg ? -num : num;\n                num = 0;\n                neg = 0;\n                inNum = 0;\n            }\n        }\n    }\n\n    if (inNum) {\n        nums[n++] = neg ? -num : num;\n    }\n\n    printf("%d\\n", minimumPairRemoval(nums, n));\n    return 0;\n}\n
49	6	java	class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    static List<List<Integer>> normalize(List<List<Integer>> res) {\n        for (List<Integer> t : res) {\n            Collections.sort(t);\n        }\n        res.sort((a, b) -> {\n            for (int i = 0; i < 3; i++) {\n                if (!a.get(i).equals(b.get(i))) {\n                    return a.get(i) - b.get(i);\n                }\n            }\n            return 0;\n        });\n        return res;\n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        String line = br.readLine();\n        line = line.substring(line.indexOf('[') + 1, line.indexOf(']'));\n\n        String[] parts = line.split(",");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) {\n            nums[i] = Integer.parseInt(parts[i].trim());\n        }\n\n        Solution sol = new Solution();\n        List<List<Integer>> result = sol.threeSum(nums);\n        result = normalize(result);\n\n        System.out.print("[");\n        for (int i = 0; i < result.size(); i++) {\n            System.out.print("[");\n            for (int j = 0; j < 3; j++) {\n                System.out.print(result.get(i).get(j));\n                if (j < 2) System.out.print(",");\n            }\n            System.out.print("]");\n            if (i < result.size() - 1) System.out.print(",");\n        }\n        System.out.print("]");\n    }\n}
98	21	cpp	class Solution {\npublic:\n    vector<int> constructArray(vector<int>& nums) {\n        // Write your logic here\n    }\n};\n	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string line;\n    if (!getline(cin, line)) return 0;\n\n    vector<int> nums;\n    int num = 0;\n    bool neg = false, inNum = false;\n\n    for (char c : line) {\n        if (c == '-') {\n            neg = true;\n        } else if (isdigit(c)) {\n            num = num * 10 + (c - '0');\n            inNum = true;\n        } else {\n            if (inNum) {\n                nums.push_back(neg ? -num : num);\n                num = 0;\n                neg = false;\n                inNum = false;\n            }\n        }\n    }\n    if (inNum) {\n        nums.push_back(neg ? -num : num);\n    }\n\n    Solution sol;\n    vector<int> ans = sol.constructArray(nums);\n\n    for (int i = 0; i < ans.size(); i++) {\n        cout << ans[i];\n        if (i + 1 < ans.size()) cout << " ";\n    }\n    cout << "\\n";\n\n    return 0;\n}\n
52	6	javascript	var threeSum = function(nums) {\n    // Write your code here\n};	'use strict';\n\nconst fs = require('fs');\n\n// <<< INSERT USER CODE HERE >>>\n\nfunction normalize(result) {\n    result = result.map(t => t.slice().sort((a, b) => a - b));\n    result.sort((a, b) => {\n        for (let i = 0; i < 3; i++) {\n            if (a[i] !== b[i]) return a[i] - b[i];\n        }\n        return 0;\n    });\n    return result;\n}\n\nfunction main() {\n    let input = fs.readFileSync(0, 'utf8').trim();\n\n    if (input.includes('=')) {\n        input = input.split('=')[1].trim();\n    }\n\n    const nums = JSON.parse(input);\n\n    let result = threeSum(nums);\n    result = normalize(result);\n\n    process.stdout.write(JSON.stringify(result));\n}\n\nmain();
53	6	python	class Solution:\n    def threeSum(self, nums):\n        # Write your code here\n        pass	import sys\nimport ast\nimport json\n\n# <<< INSERT USER CODE HERE >>>\n\ndef normalize(result):\n    result = [sorted(t) for t in result]\n    result.sort()\n    return result\n\ndef main():\n    line = sys.stdin.read().strip()\n\n    if '=' in line:\n        line = line.split('=', 1)[1].strip()\n\n    nums = ast.literal_eval(line)\n\n    sol = Solution()\n    result = sol.threeSum(nums)\n    result = normalize(result)\n\n    print(json.dumps(result, separators=(',', ':')))\n\nif __name__ == "__main__":\n    main()
103	22	c	int largestMagicSquare(int** grid, int gridSize, int* gridColSize) {\n    // Write your logic here\n}\n	#include <stdio.h>\n#include <stdlib.h>\n#include <ctype.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    char line[10000];\n    fgets(line, sizeof(line), stdin);\n\n    int** grid = (int**)malloc(sizeof(int*) * 50);\n    int gridColSize[50];\n    int rows = 0;\n\n    int num = 0;\n    int inNum = 0;\n\n    grid[rows] = (int*)malloc(sizeof(int) * 50);\n    gridColSize[rows] = 0;\n\n    for (int i = 0; line[i]; i++) {\n        char c = line[i];\n\n        if (isdigit(c)) {\n            num = num * 10 + (c - '0');\n            inNum = 1;\n        } else {\n            if (inNum) {\n                grid[rows][gridColSize[rows]++] = num;\n                num = 0;\n                inNum = 0;\n            }\n            if (c == ']') {\n                if (gridColSize[rows] > 0) {\n                    rows++;\n                    grid[rows] = (int*)malloc(sizeof(int) * 50);\n                    gridColSize[rows] = 0;\n                }\n            }\n        }\n    }\n\n    int result = largestMagicSquare(grid, rows, gridColSize);\n    printf("%d\\n", result);\n\n    for (int i = 0; i < rows; i++) {\n        free(grid[i]);\n    }\n    free(grid);\n\n    return 0;\n}\n
90	18	python	class Solution:\n    def findMaxLength(self, nums):\n        # Write your code here\n        pass\n	import ast\n\n# <<< INSERT USER CODE HERE >>>\n\nline = input().strip()\n\n# Extract the list from input like: nums = [0,1,0]\nnums = ast.literal_eval(line[line.find('['): line.find(']') + 1])\n\nsol = Solution()\nresult = sol.findMaxLength(nums)\n\nprint(result)\n
94	20	python	class Solution:\n    def minimumPairRemoval(self, nums):\n        # Write your logic here\n        pass\n	import sys\nimport re\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    line = sys.stdin.readline().strip()\n\n    # Extract all integers (handles: 5 2 3 1, [5,2,3,1], nums = [5,2,3,1])\n    nums = list(map(int, re.findall(r'-?\\d+', line)))\n\n    sol = Solution()\n    print(sol.minimumPairRemoval(nums))\n\nif __name__ == "__main__":\n    main()\n
58	7	cpp	class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        // Write your code here\n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    /*\n      Input example:\n      nums = [0,1,2,2,3,0,4,2], val = 2\n    */\n\n    string line;\n    getline(cin, line);\n\n    // -------- Parse nums --------\n    int l = line.find('[');\n    int r = line.find(']');\n    string arr = line.substr(l + 1, r - l - 1);\n\n    vector<int> nums;\n    if (!arr.empty()) {\n        stringstream ss(arr);\n        string token;\n        while (getline(ss, token, ',')) {\n            nums.push_back(stoi(token));\n        }\n    }\n\n    // -------- Parse val --------\n    int valPos = line.find("val");\n    int val = stoi(line.substr(line.find('=', valPos) + 1));\n\n    // -------- Call user solution --------\n    Solution sol;\n    int k = sol.removeElement(nums, val);\n\n    // 🔑 IMPORTANT: Custom Judge Requirement\n    // Sort first k elements before printing\n    sort(nums.begin(), nums.begin() + k);\n\n    // -------- Print EXACT expected format --------\n    cout << "k = " << k << ", nums = [";\n    for (int i = 0; i < k; i++) {\n        cout << nums[i];\n        if (i < k - 1) cout << ",";\n    }\n    cout << "]";\n\n    return 0;\n}
59	7	c	int removeElement(int* nums, int numsSize, int val) {\n    // Write your code here\n}	#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint cmp(const void* a, const void* b) {\n    return (*(int*)a - *(int*)b);\n}\n\nint main() {\n    char line[500];\n    fgets(line, sizeof(line), stdin);\n\n    int nums[200], n = 0, val;\n\n    char* start = strchr(line, '[');\n    char* end = strchr(line, ']');\n\n    if (start && end && start < end) {\n        char temp[300];\n        strncpy(temp, start + 1, end - start - 1);\n        temp[end - start - 1] = '\\0';\n\n        char* tok = strtok(temp, ",");\n        while (tok) {\n            nums[n++] = atoi(tok);\n            tok = strtok(NULL, ",");\n        }\n    }\n\n    sscanf(strstr(line, "val"), "val = %d", &val);\n\n    int k = removeElement(nums, n, val);\n\n    qsort(nums, k, sizeof(int), cmp);\n\n    printf("k = %d, nums = [", k);\n    for (int i = 0; i < k; i++) {\n        printf("%d", nums[i]);\n        if (i < k - 1) printf(",");\n    }\n    printf("]");\n    return 0;\n}
60	7	python	class Solution:\n    def removeElement(self, nums, val):\n        # Write your code here\n        pass	import ast\n\n# <<< INSERT USER CODE HERE >>>\n\nline = input().strip()\n\nnums = ast.literal_eval(line[line.find('['):line.find(']')+1])\nval = int(line.split('val')[1].split('=')[1])\n\nsol = Solution()\nk = sol.removeElement(nums, val)\n\nnums[:k] = sorted(nums[:k])\n\nprint(f"k = {k}, nums = [{','.join(map(str, nums[:k]))}]")
99	21	java	class Solution {\n    public int[] constructArray(int[] nums) {\n        // Write your logic here\n        return null;\n    }\n}\n	import java.io.*;\nimport java.util.*;\nimport java.util.regex.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n\n        Matcher m = Pattern.compile("-?\\\\d+").matcher(line);\n        List<Integer> list = new ArrayList<>();\n\n        while (m.find()) {\n            list.add(Integer.parseInt(m.group()));\n        }\n\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) {\n            nums[i] = list.get(i);\n        }\n\n        Solution sol = new Solution();\n        int[] ans = sol.constructArray(nums);\n\n        for (int i = 0; i < ans.length; i++) {\n            System.out.print(ans[i]);\n            if (i + 1 < ans.length) System.out.print(" ");\n        }\n        System.out.println();\n    }\n}\n
104	22	java	class Solution {\n    public int largestMagicSquare(int[][] grid) {\n        // Write your logic here\n        return 1;\n    }\n}\n	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n\n        List<int[]> rows = new ArrayList<>();\n        List<Integer> currentRow = new ArrayList<>();\n\n        int num = 0;\n        boolean inNum = false;\n\n        for (char c : line.toCharArray()) {\n            if (Character.isDigit(c)) {\n                num = num * 10 + (c - '0');\n                inNum = true;\n            } else {\n                if (inNum) {\n                    currentRow.add(num);\n                    num = 0;\n                    inNum = false;\n                }\n                if (c == ']') {\n                    if (!currentRow.isEmpty()) {\n                        int[] rowArr = new int[currentRow.size()];\n                        for (int i = 0; i < currentRow.size(); i++) {\n                            rowArr[i] = currentRow.get(i);\n                        }\n                        rows.add(rowArr);\n                        currentRow.clear();\n                    }\n                }\n            }\n        }\n\n        int[][] grid = new int[rows.size()][];\n        for (int i = 0; i < rows.size(); i++) {\n            grid[i] = rows.get(i);\n        }\n\n        Solution sol = new Solution();\n        System.out.println(sol.largestMagicSquare(grid));\n    }\n}\n
63	7	javascript	var removeElement = function(nums, val) {\n    // Write your code here\n};	const fs = require('fs');\n\n// <<< INSERT USER CODE HERE >>>\n\nlet line = fs.readFileSync(0, 'utf8').trim();\n\n// Parse nums\nlet nums = JSON.parse(\n  line.substring(line.indexOf('['), line.indexOf(']') + 1)\n);\n\n// Parse val\nlet val = parseInt(line.split('val')[1].split('=')[1]);\n\n// Call user solution\nlet k = removeElement(nums, val);\n\n// 🔑 IMPORTANT FIX: sort first k elements IN-PLACE\nnums.splice(0, k, ...nums.slice(0, k).sort((a, b) => a - b));\n\n// Print exact expected format\nprocess.stdout.write(\n  `k = ${k}, nums = [${nums.slice(0, k).join(',')}]`\n);
91	18	javascript	var findMaxLength = function(nums) {\n    // Write your code here\n};\n	// <<< INSERT USER CODE HERE >>>\n\nconst fs = require("fs");\n\n// Read input\nconst input = fs.readFileSync(0, "utf8").trim();\n\n// Extract array from input like: nums = [0,1,0]\nconst start = input.indexOf("[");\nconst end = input.indexOf("]");\nconst nums = JSON.parse(input.substring(start, end + 1));\n\n// Call solution\nconst result = findMaxLength(nums);\n\n// Print output\nconsole.log(result);\n
100	21	python	class Solution:\n    def constructArray(self, nums):\n        # Write your logic here\n        pass\n	import sys\nimport re\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    line = sys.stdin.readline().strip()\n    if not line:\n        return\n\n    # Extract all integers (handles: 3 5 7, [3,5,7], nums = [3,5,7])\n    nums = list(map(int, re.findall(r'-?\\d+', line)))\n\n    sol = Solution()\n    ans = sol.constructArray(nums)\n\n    print(" ".join(map(str, ans)))\n\nif __name__ == "__main__":\n    main()\n
70	7	cpp	class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        \n    }\n};	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Input array\n    string line;\n    getline(cin, line);\n\n    vector<int> nums;\n    if (line.find('[') != string::npos) {\n        line = line.substr(line.find('[') + 1, line.find(']') - line.find('[') - 1);\n        stringstream ss(line);\n        string temp;\n        while (getline(ss, temp, ',')) {\n            if (!temp.empty())\n                nums.push_back(stoi(temp));\n        }\n    }\n\n    // Value to remove\n    int val;\n    cin >> val;\n\n    Solution sol;\n    int k = sol.removeElement(nums, val);\n\n    // Custom Judge requirement\n    sort(nums.begin(), nums.begin() + k);\n\n    // Output\n    cout << "k = " << k << ", nums = [";\n    for (int i = 0; i < k; i++) {\n        cout << nums[i];\n        if (i < k - 1) cout << ",";\n    }\n    cout << "]";\n\n    return 0;\n}
105	22	python	class Solution:\n    def largestMagicSquare(self, grid):\n        # Write your logic here\n        pass\n	import sys\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    line = sys.stdin.readline().strip()\n\n    grid = []\n    row = []\n    num = 0\n    in_num = False\n\n    # Parse grid row-by-row (LeetCode-style input)\n    for c in line:\n        if c.isdigit():\n            num = num * 10 + int(c)\n            in_num = True\n        else:\n            if in_num:\n                row.append(num)\n                num = 0\n                in_num = False\n            if c == ']':\n                if row:\n                    grid.append(row)\n                    row = []\n\n    # Safety check\n    if not grid:\n        print(1)\n        return\n\n    sol = Solution()\n    print(sol.largestMagicSquare(grid))\n\nif __name__ == "__main__":\n    main()\n
87	18	cpp	class Solution {\npublic:\n    int findMaxLength(vector<int>& nums) {\n        // Write your logic here\n    }\n};\n	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string line;\n    getline(cin, line);\n\n    vector<int> nums;\n    for (char c : line) {\n        if (c == '0' || c == '1') {\n            nums.push_back(c - '0');\n        }\n    }\n\n    Solution sol;\n    cout << sol.findMaxLength(nums) << "\\n";\n\n    return 0;\n}\n
101	21	javascript	var constructArray = function(nums) {\n    // Write your logic here\n};\n	'use strict';\n\nconst fs = require('fs');\n\n// <<< INSERT USER CODE HERE >>>\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (!input) process.exit(0);\n\n// Extract all integers (handles: 3 5 7, [3,5,7], nums = [3,5,7])\nconst nums = input.match(/-?\\d+/g)?.map(Number) || [];\n\nconst ans = constructArray(nums);\n\nconsole.log(ans.join(' '));\n
106	22	javascript	var largestMagicSquare = function(grid) {\n    // Write your logic here\n};\n	'use strict';\n\nconst fs = require('fs');\n\n// <<< INSERT USER CODE HERE >>>\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n\n    let grid = [];\n    let row = [];\n    let num = 0;\n    let inNum = false;\n\n    // Parse grid row-by-row (LeetCode-style input)\n    for (const c of input) {\n        if (c >= '0' && c <= '9') {\n            num = num * 10 + (c.charCodeAt(0) - 48);\n            inNum = true;\n        } else {\n            if (inNum) {\n                row.push(num);\n                num = 0;\n                inNum = false;\n            }\n            if (c === ']') {\n                if (row.length > 0) {\n                    grid.push(row);\n                    row = [];\n                }\n            }\n        }\n    }\n\n    // Safety check\n    if (grid.length === 0) {\n        console.log(1);\n        return;\n    }\n\n    console.log(largestMagicSquare(grid));\n}\n\nmain();\n
92	20	cpp	class Solution {\npublic:\n    int minimumPairRemoval(vector<int>& nums) {\n        // Write your logic here\n    }\n};\n	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    string line;\n    getline(cin, line);\n\n    vector<int> nums;\n    int num = 0;\n    bool neg = false;\n    bool inNum = false;\n\n    for (char c : line) {\n        if (c == '-') {\n            neg = true;\n        } \n        else if (isdigit(c)) {\n            num = num * 10 + (c - '0');\n            inNum = true;\n        } \n        else {\n            if (inNum) {\n                nums.push_back(neg ? -num : num);\n                num = 0;\n                neg = false;\n                inNum = false;\n            }\n        }\n    }\n\n    if (inNum) {\n        nums.push_back(neg ? -num : num);\n    }\n\n    Solution sol;\n    cout << sol.minimumPairRemoval(nums) << "\\n";\n\n    return 0;\n}\n
78	7	java	class Solution {\n    public int removeElement(int[] nums, int val) {\n        \n    }\n}	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        String line = br.readLine();\n        if (line == null) return;\n\n        String numsPart = line.substring(line.indexOf('[') + 1, line.indexOf(']'));\n        String valPart = line.substring(line.lastIndexOf('=') + 1).trim();\n\n        int val = Integer.parseInt(valPart);\n\n        int[] nums;\n        if (numsPart.trim().isEmpty()) {\n            nums = new int[0];\n        } else {\n            String[] parts = numsPart.split(",");\n            nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                nums[i] = Integer.parseInt(parts[i].trim());\n            }\n        }\n\n        Solution sol = new Solution();\n        int k = sol.removeElement(nums, val);\n\n        Arrays.sort(nums, 0, k);\n\n        System.out.print("k = " + k + ", nums = [");\n        for (int i = 0; i < k; i++) {\n            System.out.print(nums[i]);\n            if (i < k - 1) System.out.print(",");\n        }\n        System.out.print("]");\n    }\n}
107	23	javascript	class Solution {\npublic:\n    int nextNumericallyBalancedNumber(int n) {\n        // Write your logic here\n    }\n};\n	#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int n;\n    cin >> n;\n\n    Solution sol;\n    cout << sol.nextNumericallyBalancedNumber(n) << "\\n";\n\n    return 0;\n}\n
80	8	cpp	\nclass Solution {\npublic:\n    void nextPermutation(vector<int>& nums) {\n        \n    }\n};\n	\n#include <bits/stdc++.h>\nusing namespace std;\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input line\n    string line;\n    getline(cin, line);\n\n    vector<int> nums;\n    if (line.find('[') != string::npos) {\n        line = line.substr(\n            line.find('[') + 1,\n            line.find(']') - line.find('[') - 1\n        );\n        stringstream ss(line);\n        string temp;\n        while (getline(ss, temp, ',')) {\n            if (!temp.empty())\n                nums.push_back(stoi(temp));\n        }\n    }\n\n    Solution sol;\n    sol.nextPermutation(nums);\n\n    // Output result\n    cout << "[";\n    for (int i = 0; i < nums.size(); i++) {\n        cout << nums[i];\n        if (i < nums.size() - 1) cout << ",";\n    }\n    cout << "]";\n\n    return 0;\n}\n
81	8	java	\nclass Solution {\n    public void nextPermutation(int[] nums) {\n        \n    }\n}\n	\nimport java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n\n        // Parse input array\n        line = line.trim();\n        if (line.length() >= 2 && line.charAt(0) == '[') {\n            line = line.substring(1, line.length() - 1); // remove [ and ]\n        }\n\n        int[] nums;\n        if (line.isEmpty()) {\n            nums = new int[0];\n        } else {\n            String[] parts = line.split(",");\n            nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) {\n                nums[i] = Integer.parseInt(parts[i].trim());\n            }\n        }\n\n        Solution sol = new Solution();\n        sol.nextPermutation(nums);\n\n        // Output result\n        StringBuilder sb = new StringBuilder();\n        sb.append("[");\n        for (int i = 0; i < nums.length; i++) {\n            sb.append(nums[i]);\n            if (i < nums.length - 1) sb.append(",");\n        }\n        sb.append("]");\n\n        System.out.print(sb.toString());\n    }\n}\n
82	8	c	\nvoid nextPermutation(int* nums, int numsSize) {\n    \n}\n	\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <ctype.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    char line[1000];\n    fgets(line, sizeof(line), stdin);\n\n    // Remove newline\n    line[strcspn(line, "\\n")] = 0;\n\n    // Remove [ and ]\n    int len = strlen(line);\n    if (len >= 2 && line[0] == '[' && line[len - 1] == ']') {\n        line[len - 1] = '\\0';\n        memmove(line, line + 1, len - 1);\n    }\n\n    int nums[200];\n    int numsSize = 0;\n\n    if (strlen(line) > 0) {\n        char *token = strtok(line, ",");\n        while (token != NULL) {\n            nums[numsSize++] = atoi(token);\n            token = strtok(NULL, ",");\n        }\n    }\n\n    nextPermutation(nums, numsSize);\n\n    // Output result\n    printf("[");\n    for (int i = 0; i < numsSize; i++) {\n        printf("%d", nums[i]);\n        if (i < numsSize - 1) printf(",");\n    }\n    printf("]");\n\n    return 0;\n}\n
83	8	python	\nclass Solution:\n    def nextPermutation(self, nums):\n        pass\n	\nimport sys\nimport ast\n\n# <<< INSERT USER CODE HERE >>>\n\ndef main():\n    line = sys.stdin.readline().strip()\n\n    # Parse input like [1,2,3]\n    if line.startswith('[') and line.endswith(']'):\n        nums = ast.literal_eval(line)\n    else:\n        nums = []\n\n    sol = Solution()\n    sol.nextPermutation(nums)\n\n    # Output result\n    print("[" + ",".join(str(x) for x in nums) + "]")\n\nif __name__ == "__main__":\n    main()\n
84	8	javascript	\nclass Solution {\n    nextPermutation(nums) {\n        \n    }\n}\n	\n'use strict';\n\n// <<< INSERT USER CODE HERE >>>\n\nfunction main() {\n    const fs = require('fs');\n    const input = fs.readFileSync(0, 'utf8').trim();\n\n    let nums = [];\n    if (input.startsWith('[') && input.endsWith(']')) {\n        nums = JSON.parse(input);\n    }\n\n    const sol = new Solution();\n    sol.nextPermutation(nums);\n\n    // Output result\n    process.stdout.write(\n        '[' + nums.join(',') + ']'\n    );\n}\n\nmain();\n
88	18	c	int findMaxLength(int* nums, int numsSize) {\n    // Write your logic here\n}\n	#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n// <<< INSERT USER CODE HERE >>>\n\nint main() {\n    int nums[100000];\n    int n = 0;\n\n    // Read entire line\n    char line[1000000];\n    fgets(line, sizeof(line), stdin);\n\n    // Parse integers\n    char *token = strtok(line, " ");\n    while (token != NULL) {\n        nums[n++] = atoi(token);\n        token = strtok(NULL, " ");\n    }\n\n    int result = findMaxLength(nums, n);\n    printf("%d\\n", result);\n\n    return 0;\n}\n
89	18	java	class Solution {\n    public int findMaxLength(int[] nums) {\n        // Write your logic here\n    }\n}\n	import java.io.*;\nimport java.util.*;\n\n// <<< INSERT USER CODE HERE >>>\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        // Read full input line (e.g., "nums = [0,1,0]")\n        String line = br.readLine();\n\n        List<Integer> list = new ArrayList<>();\n        for (char c : line.toCharArray()) {\n            if (c == '0' || c == '1') {\n                list.add(c - '0');\n            }\n        }\n\n        int[] nums = new int[list.size()];\n        for (int i = 0; i < list.size(); i++) {\n            nums[i] = list.get(i);\n        }\n\n        Solution sol = new Solution();\n        System.out.println(sol.findMaxLength(nums));\n    }\n}\n
\.


--
-- Data for Name: problem_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problem_topics (problem_id, topic_id) FROM stdin;
1	1
1	3
2	2
2	3
2	23
3	4
4	1
4	23
4	38
4	51
4	17
5	4
6	1
7	1
7	15
8	1
8	15
18	1
18	3
18	16
20	1
20	5
21	1
21	12
22	1
22	11
22	16
23	3
23	4
23	26
23	19
23	24
\.


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problems (id, title, description, difficulty, created_at, slug, constraints, time_limit_ms, memory_limit_mb) FROM stdin;
1	Two Sum	Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.	Easy	2026-01-06 21:56:16.517977	\N	\n2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.\n	2000	256
8	Next Permutation	A permutation of an array of integers is an arrangement of its members into a sequence or linear order.\n\nFor example, for arr = [1,2,3], the following are all the permutations of arr: [1,2,3], [1,3,2], [2, 1, 3], [2, 3, 1], [3,1,2], [3,2,1].\nThe next permutation of an array of integers is the next lexicographically greater permutation of its integer. More formally, if all the permutations of the array are sorted in one container according to their lexicographical order, then the next permutation of that array is the permutation that follows it in the sorted container. If such arrangement is not possible, the array must be rearranged as the lowest possible order (i.e., sorted in ascending order).\n\nFor example, the next permutation of arr = [1,2,3] is [1,3,2].\nSimilarly, the next permutation of arr = [2,3,1] is [3,1,2].\nWhile the next permutation of arr = [3,2,1] is [1,2,3] because [3,2,1] does not have a lexicographical larger rearrangement.\nGiven an array of integers nums, find the next permutation of nums.\n\nThe replacement must be in place and use only constant extra memory.	Medium	2026-01-20 15:17:20.876838	next-permutation	1 <= nums.length <= 100; 0 <= nums[i] <= 100	1000	256
2	Longest Substring Without Repeating Characters	Given a string s, find the length of the longest substring without duplicate characters.	Medium	2026-01-15 00:21:39.603869	\N	\n0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols, and spaces.\n	1000	64
3	Reverse Integer	Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0. Assume the environment does not allow you to store 64-bit integers.	Medium	2026-01-18 13:43:02.136124	reverse-integer	-2^31 <= x <= 2^31 - 1	100	64
4	Sliding Window Maximum	You are given an array of integers nums and an integer k. There is a sliding window of size k which moves from the left to the right of the array. At each step, return the maximum element in the current window.	Hard	2026-01-18 14:32:36.305163	sliding-window-maximum	1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\n1 <= k <= nums.length	2000	256
5	Palindrome Number	Given an integer x, return true if x is a palindrome, and false otherwise.\n\nA palindrome is a number that reads the same forward and backward.	Easy	2026-01-19 11:53:57.301043	palindrome-number	-2^31 <= x <= 2^31 - 1	1000	128
6	3Sum	Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.	Medium	2026-01-19 12:58:56.29551	3sum	3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5	2000	128
7	Remove Element	Given an integer array nums and an integer val, remove all occurrences of val in nums in-place.\nThe order of the elements may be changed. Then return the number of elements in nums which are not equal to val.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.	Easy	2026-01-19 14:37:12.62074	remove-element	0 <= nums.length <= 100\n0 <= nums[i] <= 50\n0 <= val <= 100	1000	128
18	Contiguous Array	Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1.	Medium	2026-01-21 04:00:57.271239	contiguous-array	\N	2000	256
20	Minimum Pair Removal to Sort Array I	Given an array nums, you can perform the following operation any number of times:\n\nSelect the adjacent pair with the minimum sum in nums. If multiple such pairs exist, choose the leftmost one.\nReplace the pair with their sum.\nReturn the minimum number of operations needed to make the array non-decreasing.\n\nAn array is said to be non-decreasing if each element is greater than or equal to its previous element (if it exists).	Easy	2026-01-22 11:11:37.090858	minimum-pair-removal-to-sort-array-i	\N	2000	256
23	Next Greater Numerically Balanced Number	An integer x is numerically balanced if for every digit d in the number x, there are exactly d occurrences of that digit in x.\n\nGiven an integer n, return the smallest numerically balanced number strictly greater than n.	Medium	2026-01-22 15:01:19.15368	next-greater-numerically-balanced-number	\N	2000	256
21	 Construct the Minimum Bitwise Array II	You are given an array nums consisting of n prime integers.\n\nYou need to construct an array ans of length n, such that, for each index i, the bitwise OR of ans[i] and ans[i] + 1 is equal to nums[i], i.e. ans[i] OR (ans[i] + 1) == nums[i].\n\nAdditionally, you must minimize each value of ans[i] in the resulting array.\n\nIf it is not possible to find such a value for ans[i] that satisfies the condition, then set ans[i] = -1.	Medium	2026-01-22 12:53:18.468034	construct-the-minimum-bitwise-array-ii	\N	2000	256
22	Largest Magic Square	A k x k magic square is a k x k grid filled with integers such that every row sum, every column sum, and both diagonal sums are all equal. The integers in the magic square do not have to be distinct. Every 1 x 1 grid is trivially a magic square.\n\nGiven an m x n integer grid, return the size (i.e., the side length k) of the largest magic square that can be found within this grid.	Medium	2026-01-22 13:38:55.8839	largest-magic-square	\N	2000	256
\.


--
-- Data for Name: profile_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile_views (id, viewer_id, profile_id, viewed_at) FROM stdin;
1	37	59	2026-01-25 13:35:53.39225
2	40	59	2026-01-25 13:56:51.787763
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submissions (id, user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, time_complexity_static, space_complexity_static, time_complexity_ml, space_complexity_ml, ml_confidence, complexity_source, created_at) FROM stdin;
239	59	1	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n         for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	2300	0	O(n^2)	O(n)	\N	\N	\N	static	2026-01-24 02:30:00.851846
240	59	4	cpp	class Solution {\r\npublic:\r\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\r\n     deque<int>dq;\r\n     vector<int>ans;\r\n     for(int i=0;i<nums.size();i++){\r\n         if (!dq.empty() && dq.front() <= i - k) dq.pop_front();\r\n        while(!dq.empty() && nums[dq.back()]<nums[i]) dq.pop_back();\r\n        dq.push_back(i);\r\n        if(i>=k-1) ans.push_back(nums[dq.front()]);\r\n     }\r\n      return ans;\r\n    }\r\n};	AC	4721	0	O(n^2)	O(n)	\N	\N	\N	static	2026-01-24 02:45:14.382871
241	59	6	cpp	class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        vector<vector<int>> ans;\n        int n = nums.size();\n\n        sort(nums.begin(), nums.end());\n\n        for (int i = 0; i < n - 2; i++) {\n\n            // skip duplicate first element\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n            // optimization: no need to continue if first number > 0\n            if (nums[i] > 0) break;\n\n            int l = i + 1;\n            int r = n - 1;\n\n            while (l < r) {\n                long long sum = (long long)nums[i] + nums[l] + nums[r];\n\n                if (sum == 0) {\n                    ans.push_back({nums[i], nums[l], nums[r]});\n\n                    // skip duplicates\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n\n                    l++;\n                    r--;\n                }\n                else if (sum < 0) {\n                    l++;\n                }\n                else {\n                    r--;\n                }\n            }\n        }\n        return ans;\n    }\n};\n	AC	5238	0	O(n^3)	O(n)	\N	\N	\N	static	2026-01-24 02:48:33.544967
242	59	6	cpp	class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        vector<vector<int>> ans;\n        int n = nums.size();\n\n        sort(nums.begin(), nums.end());\n\n        for (int i = 0; i < n - 2; i++) {\n\n            // skip duplicate first element\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n\n            // optimization: no need to continue if first number > 0\n            if (nums[i] > 0) break;\n\n            int l = i + 1;\n            int r = n - 1;\n\n            while (l < r) {\n                long long sum = (long long)nums[i] + nums[l] + nums[r];\n\n                if (sum == 0) {\n                    ans.push_back({nums[i], nums[l], nums[r]});\n\n                    // skip duplicates\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n\n                    l++;\n                    r--;\n                }\n                else if (sum < 0) {\n                    l++;\n                }\n                else {\n                    r--;\n                }\n            }\n        }\n        return ans;\n    }\n};\n	AC	4857	0	O(n^3)	O(n)	\N	\N	\N	static	2026-01-24 02:53:38.200562
243	59	1	cpp	class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        for(int i = 0; i < nums.size(); i++){\n            for(int j = i + 1; j < nums.size(); j++){\n                if(nums[i] + nums[j] == target)\n                    return {i, j};\n            }\n        }\n        return {};\n    }\n};	AC	1508	0	O(n^2)	O(n)	\N	\N	\N	static	2026-01-24 03:14:17.659633
244	59	1	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1313	0	\N	\N	\N	\N	\N	static	2026-01-24 21:45:31.15307
245	59	1	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1337	0	\N	\N	\N	\N	\N	static	2026-01-24 21:45:42.627288
246	37	1	cpp	class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int,int>mp;\n        for(int i=0;i<nums.size();i++){\n            int need=target-nums[i];\n            if(mp.find(need)!=mp.end()){\n                return {mp[need],i};\n            }\n            mp[nums[i]]=i;\n        }\n        return {};\n        \n        \n        \n    }\n};	AC	2084	0	O(n)	O(n)	\N	\N	\N	static	2026-01-24 23:57:29.901615
247	59	7	cpp	class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        int n = nums.size();\n        int i = 0;\n\n        while (i < n) {\n            if (nums[i] == val) {\n                nums[i] = nums[n - 1];\n                n--;\n            } else {\n                i++;\n            }\n        }\n        return n;\n    }\n};	AC	8962	0	O(n)	O(1)	\N	\N	\N	static	2026-01-25 01:40:54.136364
248	59	1	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1272	0	\N	\N	\N	\N	\N	static	2026-01-25 15:09:15.939592
249	59	1	cpp	\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your logic here\n        for(int i=0;i<nums.size();i++){\n            for(int j=i+1;j<nums.size();j++){\n                if(nums[i]+nums[j]==target) return {i,j};\n            }\n        }\n        return {};\n    }\n};\n  	AC	1235	0	\N	\N	\N	\N	\N	static	2026-01-25 15:09:27.800193
\.


--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_cases (id, problem_id, input, expected_output, is_sample) FROM stdin;
1	1	nums = [2,7,11,15], target = 9	[0,1]	t
2	1	nums = [3,2,4], target = 6	[1,2]	t
3	1	nums = [3,3], target = 6	[0,1]	f
4	1	nums = [1,2,3,4], target = 7	[2,3]	f
5	2	abcabcbb	3	t
6	2	bbbbb	1	t
7	2	pwwkew	3	t
120	22	[[7,1,4,5,6],[2,5,1,6,4],[1,5,4,3,2],[1,2,7,3,4]]\n	3	t
9	2	abcdef	6	f
10	2	aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa	1	f
11	2	aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa	1	f
12	2	aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa	1	f
121	22	[[5,1,3,1],[9,3,3,1],[1,3,3,8]]\n	2	t
122	22	[[10]]\n	1	t
123	22	[[1,2],[3,4]]\n	1	f
124	22	[[2,7,6],[9,5,1],[4,3,8]]\n	3	f
125	23	n = 0\n	1	t
18	3	123	321	t
19	3	-123	-321	t
20	3	120	21	t
21	3	1534236469	0	f
22	3	0	0	f
126	23	n = 1\n	22	t
127	23	n = 1000\n	1333\n	t
128	23	n = 3000\n	3133\n	f
129	23	n = 999999\n	122333\n	f
28	4	8\n1 3 -1 -3 5 3 6 7\n3	3 3 5 5 6 7	t
29	4	1\n1\n1	1	t
30	4	5\n1 2 3 4 5\n2	2 3 4 5	f
31	4	5\n9 8 7 6 5\n3	9 8 7	f
32	4	6\n4 3 5 4 3 3\n6	5	f
63	5	121	true	t
64	5	-121	false	t
65	5	10	false	t
66	5	0	true	f
67	5	1221	true	f
78	6	nums = [-1,0,1,2,-1,-4]	[[-1,-1,2],[-1,0,1]]	t
79	6	nums = [0,1,1]	[]	t
80	6	nums = [0,0,0]	[[0,0,0]]	f
81	6	nums = [1,2,3,4]	[]	f
82	6	nums = [-1,-2,-3,-4]	[]	f
83	6	nums = [-2,0,2]	[[-2,0,2]]	f
84	6	nums = [1,-1,1]	[]	f
85	7	nums = [3,2,2,3], val = 3	k = 2, nums = [2,2]	t
86	7	nums = [0,1,2,2,3,0,4,2], val = 2	k = 5, nums = [0,0,1,3,4]	t
87	7	nums = [1,3,5,7], val = 2	k = 4, nums = [1,3,5,7]	f
88	7	nums = [4,4,4,4], val = 4	k = 0, nums = []	f
89	7	nums = [], val = 1	k = 0, nums = []	f
90	8	[1,2,3]	[1,3,2]	t
91	8	[3,2,1]	[1,2,3]	t
93	8	[1,3,2]	[2,1,3]	f
94	8	[7]	[7]	f
95	18	nums = [0, 1]\n	2	f
96	18	nums = [0, 1, 0]\n	2	t
97	18	nums = [0, 0, 1, 1]\n	4	t
98	18	nums = [1, 1, 1, 1]\n	0	f
99	18	nums = [1, 1, 1, 1]\n	0	f
100	18	nums = [0, 1, 1, 1, 1, 1, 0, 0, 0]\n	6	f
101	20	nums = [1, 2, 2, 3]\n	0\n	t
102	20	nums = [5, 2, 3, 1]\n	2\n	t
104	20	nums = [-5, -10, 0, 3]\n	1	f
106	20	nums = [4, 3, 2, 1]\n	2\n	t
107	20	nums = [3, 1, 1, 3]\n	3	f
110	21	nums = [3, 5, 7, 11, 13]\n	 [1, 4, 3, 10, 12]\n	t
111	21	nums = [2, 3, 5]\n	 [-1, 1, 4]\n	t
112	21	nums = [2]\n	[-1]\n	t
113	21	nums = [17, 19, 23]\n	 [16, 18, 22]\n	t
114	21	nums = [7, 2, 13, 3]\n	 [3, -1, 12, 1]\n	t
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (id, name, slug) FROM stdin;
1	Array	array
2	String	string
3	Hash Table	hash-table
4	Math	math
5	Dynamic Programming	dynamic-programming
6	Sorting	sorting
7	Greedy	greedy
8	Depth-First Search	depth-first-search
9	Binary Search	binary-search
10	Database	database
11	Matrix	matrix
12	Bit Manipulation	bit-manipulation
13	Tree	tree
14	Breadth-First Search	breadth-first-search
15	Two Pointers	two-pointers
16	Prefix Sum	prefix-sum
17	Heap (Priority Queue)	heap-priority-queue
18	Simulation	simulation
19	Counting	counting
20	Graph	graph
21	Binary Tree	binary-tree
22	Stack	stack
23	Sliding Window	sliding-window
24	Enumeration	enumeration
25	Design	design
26	Backtracking	backtracking
27	Union Find	union-find
28	Number Theory	number-theory
29	Linked List	linked-list
30	Ordered Set	ordered-set
31	Segment Tree	segment-tree
32	Monotonic Stack	monotonic-stack
33	Trie	trie
34	Divide and Conquer	divide-and-conquer
35	Combinatorics	combinatorics
36	Bitmask	bitmask
37	Recursion	recursion
38	Queue	queue
39	Geometry	geometry
40	Binary Indexed Tree	binary-indexed-tree
41	Memoization	memoization
42	Hash Function	hash-function
43	Binary Search Tree	binary-search-tree
44	Shortest Path	shortest-path
45	String Matching	string-matching
46	Topological Sort	topological-sort
47	Rolling Hash	rolling-hash
48	Game Theory	game-theory
49	Interactive	interactive
50	Data Stream	data-stream
51	Monotonic Queue	monotonic-queue
52	Brainteaser	brainteaser
53	Doubly-Linked List	doubly-linked-list
54	Merge Sort	merge-sort
55	Randomized	randomized
56	Counting Sort	counting-sort
57	Iterator	iterator
58	Concurrency	concurrency
59	Quickselect	quickselect
60	Suffix Array	suffix-array
61	Line Sweep	line-sweep
62	Probability and Statistics	probability-and-statistics
63	Minimum Spanning Tree	minimum-spanning-tree
64	Bucket Sort	bucket-sort
65	Shell	shell
66	Reservoir Sampling	reservoir-sampling
67	Strongly Connected Component	strongly-connected-component
68	Eulerian Circuit	eulerian-circuit
69	Radix Sort	radix-sort
70	Rejection Sampling	rejection-sampling
71	Biconnected Component	biconnected-component
\.


--
-- Data for Name: universal_leaderboard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.universal_leaderboard (user_id, universal_score, rank, updated_at) FROM stdin;
37	0.00	\N	2026-01-24 00:37:49.621159
46	0.00	\N	2026-01-24 00:40:47.810984
48	0.00	\N	2026-01-24 00:44:45.335881
49	0.00	\N	2026-01-24 00:47:32.552987
50	0.00	\N	2026-01-24 00:52:50.924659
51	0.00	\N	2026-01-24 00:54:02.509868
52	0.00	\N	2026-01-24 00:59:30.662141
53	0.00	\N	2026-01-24 01:00:58.838876
54	0.00	\N	2026-01-24 01:02:41.080757
56	0.00	\N	2026-01-24 01:07:13.471585
58	0.00	\N	2026-01-24 01:14:31.712023
39	0.00	\N	2026-01-24 01:25:47.030097
45	0.00	\N	2026-01-23 23:12:03.781222
\.


--
-- Data for Name: user_platform_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_platform_profiles (id, user_id, platform_id, username, profile_url, verified, created_at, verification_token, is_verified) FROM stdin;
208	54	1	mannanayan	\N	f	2026-01-24 18:43:32.269419	\N	t
161	59	2	_kishan_1001	\N	f	2026-01-24 16:19:15.629906	\N	t
166	59	3	army_tale_76	\N	f	2026-01-24 16:20:44.253988	\N	t
174	59	4	kishanrlwug	\N	f	2026-01-24 16:32:38.031858	\N	t
180	59	5	roykishan532	\N	f	2026-01-24 16:33:47.453208	\N	t
235	59	1	kishan_roy_1001	\N	f	2026-01-25 00:01:14.566966	CodeHive-VERIFY-X5G9WDKX	f
241	37	1	avnisharma2881	\N	f	2026-01-25 00:03:32.595943	\N	t
\.


--
-- Data for Name: user_platform_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_platform_stats (user_id, platform, total_solved, easy_solved, medium_solved, hard_solved, contest_rating, reputation, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, provider, provider_id, avatar_url, created_at, is_verified, role, username, bio, social_links, is_public, views_count) FROM stdin;
38	himannshu	himanshuprusty816@gmail.com	$2b$10$wwhsBQ7SAoJh05O/qWi8Z...oeHMct5VsSM5.yxqAoMnVHD0bqNc6	local	\N	\N	2026-01-20 16:34:20.389245	f	user	\N	\N	{}	t	0
40	codehive	codehive.auth@gmail.com	\N	google	100218436837935686195	https://lh3.googleusercontent.com/a/ACg8ocLXXvP6xo6yPU6UXKdSCPGCwG_xB8R0qZf4n2strg6Dwhz6Vg=s96-c	2026-01-21 00:49:20.065502	f	admin	\N	\N	{}	t	0
41	Admin User	admin@test.com	$2b$10$AY1w//lThSOb04rpJo8w/.ucpAJB9iNUWECbM4K7IEg4kxt4xqnfS	local	\N	\N	2026-01-21 03:27:53.862014	t	user	\N	\N	{}	t	0
42	mam	vennela.tandra35379@paruluniversiy.ac.in	$2b$10$cfI/P.vx9URo0HtMiWLynOMCQEBGB2f7ZZd5ppLj/QNkT1HhavXYq	local	\N	\N	2026-01-21 10:27:46.76306	f	user	\N	\N	{}	t	0
43	mam	vennela.tandra35379@paruluniversity.ac.in	$2b$10$4Ck/QawDLTglnkPq69DqvehwdvLq0TwgFZoG4ZhjSLFttQXigWuIK	local	\N	\N	2026-01-21 10:29:34.627234	f	user	\N	\N	{}	t	0
39	Satyanshu singh	roykishan532@gmail.com	$2b$10$M8jEEjSRJZJ4EKKd.vDOPeHK/PzQLmD7gwBVaLppRh02aqJmkauQG	google	113148985764441657504	/uploads/avatar-1769331629707-763218091.jpeg	2026-01-20 22:05:33.246469	f	user	\N		{"github": "", "twitter": "", "website": "", "linkedin": ""}	t	0
44	tiwari ji	adarshtiwari1979@gmail.com	$2b$10$JZdTfoiGLriHY1hmaFj2ju/qNW.53AJghZ3oJXoxgZpSeabAKhGI6	local	\N	\N	2026-01-23 21:34:16.626412	f	user	\N	\N	{}	t	0
45	parth rajput	yugtiv338@gmail.com	$2b$10$mNzKUaetJEsAn7Y.M/FCxeg3EWmsEaIuyOPDgNWWFdm7Fy2v3K2E6	local	\N	\N	2026-01-23 23:01:26.962503	f	user	\N	\N	{}	t	0
46	avni officaial	2303031050068@paruluniversity.ac.in	$2b$10$vH8ILNE90YhzKUeeZWfMX.qNDONACEmXtGajMJrJ5Zytu.Z5Es46e	local	\N	\N	2026-01-24 00:38:40.197662	f	user	\N	\N	{}	t	0
47	SATYASHU SINGH	2303031050540@paruluniversity.ac.in	$2b$10$xo7pkYNunYl9vqkj5.xSZOK7lyheM1Rt3ESPZouCTqhvAhJuoiQ1a	local	\N	\N	2026-01-24 00:41:37.181352	f	user	\N	\N	{}	t	0
48	avni-chiki	chikisharmachiki1@gmail.com	$2b$10$9BsO/n4WG2yX.y8/O1754eYPH17eislNqYKpx9fIDnH45TIn6SF3a	local	\N	\N	2026-01-24 00:43:49.681824	f	user	\N	\N	{}	t	0
49	sharmaavik	sharmaavikw@gmail.com	$2b$10$Y9mj1yk3eQAHKrmwCSRcT.d8Hd2QSq78SBVFdCzST9Cm48Ts5C2.i	local	\N	\N	2026-01-24 00:46:26.671699	f	user	\N	\N	{}	t	0
50	nayan manna	mannanayan647@gmail.com	$2b$10$vE/2z.KEw4QRN7UlCtOhhO0tz5xP94DJ98KJdj8Ptl/grxUCdMyfG	local	\N	\N	2026-01-24 00:50:30.835828	f	user	\N	\N	{}	t	0
51	nayan officail	2303031050343@paruluniversity.ac.in	$2b$10$O.GE2rE7SyEjTsV7qQTPZOEktXMlL/O0Rb7wQ69YMHbNzLSYkLhIy	local	\N	\N	2026-01-24 00:53:19.189647	f	user	\N	\N	{}	t	0
52	parth 01	rajkrishna3233.o@gmail.com	$2b$10$7zKcoT6Jwpq7N9vHPotLDeJCGGVBhRevTP1811U/vMs5VVMNRvvOK	local	\N	\N	2026-01-24 00:58:38.442117	f	user	\N	\N	{}	t	0
53	parth 02	pr2177024@gmail.com	$2b$10$zyRH9MfOHLzLCNc3K7nX4uwlqyLh/EmNEH2DeGT/ArBPttYiIhVRO	local	\N	\N	2026-01-24 01:00:26.661029	f	user	\N	\N	{}	t	0
55	parth 03	2430331460748@paruluniversity.ac.in	$2b$10$Vq2DBi17/1k3yj1sMK4lLeZTHoGsPYrMwON3fhLhE05lXrOj66Po6	local	\N	\N	2026-01-24 01:05:23.522758	f	user	\N	\N	{}	t	0
56	parth 03	2403031460748@paruluniversity.ac.in	$2b$10$zKeIS6OcrF9wJ9q9NIpOQOI2bDMk3uiSZRMdb3E2oQn5yx8kk4jYm	local	\N	\N	2026-01-24 01:06:46.193584	f	user	\N	\N	{}	t	0
57	avni -manist	mansit24@gmail.com	$2b$10$rHJM4Ww.1dA4GDh6QFuW7e8691RrVLgUUjPyjAMK97i8YnU/Vkjjm	local	\N	\N	2026-01-24 01:10:03.65293	f	user	\N	\N	{}	t	0
58	avni -manist	mansit2411@gmail.com	$2b$10$jl5/UHnLhJu9dYKilRz8Ae9jjSHsYm2FJnNCUGsGnt7uk7i9oR5mi	local	\N	\N	2026-01-24 01:12:40.582512	f	user	\N	\N	{}	t	0
59	KISHAN ROY	kishanroy1001@gmail.com	$2b$10$5Ibr5Una4Yn3V1xkPX4/3eooKlnuDVit1Y406Fi/ek8M8.msF4/IW	google	106988453843204684213	/uploads/avatar-1769206089376-496184853.jpg	2026-01-24 02:00:14.076002	f	user	_kishan_roy_1001	i am a passionate developer !!	{"github": "https://github.com/kishan-1001", "twitter": "", "website": "https://kishan-1001.github.io/My-Portfolio/", "linkedin": "https://www.linkedin.com/in/kishan-roy1001"}	t	2
37	avni	avnisharmavni@gmail.com	$2b$10$CP.3wHMyiNsW2ZcGNWcnVeh94qyFXAKTlbUm749oXuXip2ndDqf82	local	\N	/uploads/avatar-1769208259641-904600639.jpeg	2026-01-19 12:33:45.000339	f	user	\N		{"github": "https://ddd", "twitter": "", "website": "", "linkedin": ""}	f	0
54	nayan 01	nayanmanna322@gmail.com	$2b$10$ZddNMJcsuzt1JUIxB2XJPOPMChLL6ix.yGPzdBJwP/rhklqhKOzXG	local	\N	/uploads/avatar-1769273519210-637447912.jpeg	2026-01-24 01:01:35.234875	f	user	\N		{"github": "", "twitter": "", "website": "", "linkedin": ""}	t	0
\.


--
-- Name: arena_session_problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arena_session_problems_id_seq', 395, true);


--
-- Name: arena_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arena_sessions_id_seq', 101, true);


--
-- Name: arena_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arena_submissions_id_seq', 53, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 42, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 100, true);


--
-- Name: contest_participation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contest_participation_id_seq', 11, true);


--
-- Name: contest_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contest_submissions_id_seq', 18, true);


--
-- Name: contests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contests_id_seq', 35, true);


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.likes_id_seq', 24, true);


--
-- Name: otp_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otp_verifications_id_seq', 30, true);


--
-- Name: platform_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_scores_id_seq', 403, true);


--
-- Name: platform_stats_raw_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_stats_raw_id_seq', 207, true);


--
-- Name: platforms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platforms_id_seq', 5, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 39, true);


--
-- Name: problem_solutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problem_solutions_id_seq', 156, true);


--
-- Name: problem_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problem_templates_id_seq', 108, true);


--
-- Name: problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problems_id_seq', 23, true);


--
-- Name: profile_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_views_id_seq', 2, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissions_id_seq', 249, true);


--
-- Name: test_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_cases_id_seq', 129, true);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topics_id_seq', 71, true);


--
-- Name: user_platform_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_platform_profiles_id_seq', 242, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 59, true);


--
-- Name: arena_session_problems arena_session_problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_session_problems
    ADD CONSTRAINT arena_session_problems_pkey PRIMARY KEY (id);


--
-- Name: arena_sessions arena_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_sessions
    ADD CONSTRAINT arena_sessions_pkey PRIMARY KEY (id);


--
-- Name: arena_submissions arena_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_submissions
    ADD CONSTRAINT arena_submissions_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contest_participation contest_participation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_participation
    ADD CONSTRAINT contest_participation_pkey PRIMARY KEY (id);


--
-- Name: contest_participation contest_participation_user_id_contest_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_participation
    ADD CONSTRAINT contest_participation_user_id_contest_id_key UNIQUE (user_id, contest_id);


--
-- Name: contest_problems contest_problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_problems
    ADD CONSTRAINT contest_problems_pkey PRIMARY KEY (contest_id, problem_id);


--
-- Name: contest_submissions contest_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_submissions
    ADD CONSTRAINT contest_submissions_pkey PRIMARY KEY (id);


--
-- Name: contests contests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_pkey PRIMARY KEY (id);


--
-- Name: global_leaderboard global_leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_leaderboard
    ADD CONSTRAINT global_leaderboard_pkey PRIMARY KEY (user_id);


--
-- Name: leaderboard leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_pkey PRIMARY KEY (user_id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: otp_verifications otp_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (id);


--
-- Name: platform_scores platform_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_scores
    ADD CONSTRAINT platform_scores_pkey PRIMARY KEY (id);


--
-- Name: platform_scores platform_scores_user_id_platform_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_scores
    ADD CONSTRAINT platform_scores_user_id_platform_id_key UNIQUE (user_id, platform_id);


--
-- Name: platform_stats_raw platform_stats_raw_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_stats_raw
    ADD CONSTRAINT platform_stats_raw_pkey PRIMARY KEY (id);


--
-- Name: platform_stats_raw platform_stats_raw_user_platform_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_stats_raw
    ADD CONSTRAINT platform_stats_raw_user_platform_id_key UNIQUE (user_platform_id);


--
-- Name: platforms platforms_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_name_key UNIQUE (name);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (id);


--
-- Name: platforms platforms_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT platforms_slug_key UNIQUE (slug);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: problem_companies problem_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_companies
    ADD CONSTRAINT problem_companies_pkey PRIMARY KEY (problem_id, company_id);


--
-- Name: problem_solutions problem_solutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_solutions
    ADD CONSTRAINT problem_solutions_pkey PRIMARY KEY (id);


--
-- Name: problem_solutions problem_solutions_problem_id_language_solution_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_solutions
    ADD CONSTRAINT problem_solutions_problem_id_language_solution_type_key UNIQUE (problem_id, language, solution_type);


--
-- Name: problem_templates problem_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_templates
    ADD CONSTRAINT problem_templates_pkey PRIMARY KEY (id);


--
-- Name: problem_topics problem_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_topics
    ADD CONSTRAINT problem_topics_pkey PRIMARY KEY (problem_id, topic_id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (id);


--
-- Name: problems problems_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_slug_key UNIQUE (slug);


--
-- Name: profile_views profile_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: test_cases test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: topics topics_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_slug_key UNIQUE (slug);


--
-- Name: likes unique_post_like; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT unique_post_like UNIQUE (post_id, user_id);


--
-- Name: universal_leaderboard universal_leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.universal_leaderboard
    ADD CONSTRAINT universal_leaderboard_pkey PRIMARY KEY (user_id);


--
-- Name: user_platform_profiles user_platform_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_profiles
    ADD CONSTRAINT user_platform_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_platform_profiles user_platform_profiles_user_id_platform_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_profiles
    ADD CONSTRAINT user_platform_profiles_user_id_platform_id_key UNIQUE (user_id, platform_id);


--
-- Name: user_platform_stats user_platform_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_stats
    ADD CONSTRAINT user_platform_stats_pkey PRIMARY KEY (user_id, platform);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_profile_views_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profile_views_lookup ON public.profile_views USING btree (viewer_id, profile_id, viewed_at);


--
-- Name: arena_session_problems arena_session_problems_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_session_problems
    ADD CONSTRAINT arena_session_problems_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: arena_session_problems arena_session_problems_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_session_problems
    ADD CONSTRAINT arena_session_problems_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.arena_sessions(id) ON DELETE CASCADE;


--
-- Name: arena_sessions arena_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_sessions
    ADD CONSTRAINT arena_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: arena_submissions arena_submissions_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_submissions
    ADD CONSTRAINT arena_submissions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id);


--
-- Name: arena_submissions arena_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arena_submissions
    ADD CONSTRAINT arena_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: contest_participation contest_participation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_participation
    ADD CONSTRAINT contest_participation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contest_problems contest_problems_contest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_problems
    ADD CONSTRAINT contest_problems_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;


--
-- Name: contest_problems contest_problems_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_problems
    ADD CONSTRAINT contest_problems_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: contest_submissions contest_submissions_contest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_submissions
    ADD CONSTRAINT contest_submissions_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;


--
-- Name: contest_submissions contest_submissions_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_submissions
    ADD CONSTRAINT contest_submissions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: contest_submissions contest_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contest_submissions
    ADD CONSTRAINT contest_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contests contests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments fk_comments_post; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments fk_comments_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes fk_likes_post; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes fk_likes_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts fk_posts_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: global_leaderboard global_leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_leaderboard
    ADD CONSTRAINT global_leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leaderboard leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: otp_verifications otp_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: platform_scores platform_scores_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_scores
    ADD CONSTRAINT platform_scores_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: platform_scores platform_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_scores
    ADD CONSTRAINT platform_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: platform_stats_raw platform_stats_raw_user_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_stats_raw
    ADD CONSTRAINT platform_stats_raw_user_platform_id_fkey FOREIGN KEY (user_platform_id) REFERENCES public.user_platform_profiles(id) ON DELETE CASCADE;


--
-- Name: problem_companies problem_companies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_companies
    ADD CONSTRAINT problem_companies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: problem_companies problem_companies_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_companies
    ADD CONSTRAINT problem_companies_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: problem_solutions problem_solutions_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_solutions
    ADD CONSTRAINT problem_solutions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: problem_templates problem_templates_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_templates
    ADD CONSTRAINT problem_templates_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: problem_topics problem_topics_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_topics
    ADD CONSTRAINT problem_topics_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: problem_topics problem_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problem_topics
    ADD CONSTRAINT problem_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: profile_views profile_views_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profile_views profile_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: test_cases test_cases_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: universal_leaderboard universal_leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.universal_leaderboard
    ADD CONSTRAINT universal_leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_platform_profiles user_platform_profiles_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_profiles
    ADD CONSTRAINT user_platform_profiles_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: user_platform_profiles user_platform_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_profiles
    ADD CONSTRAINT user_platform_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_platform_stats user_platform_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_platform_stats
    ADD CONSTRAINT user_platform_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JDwr4utgNmw2QSyexm8glb2AyAdCjNCxKG2gEqELy283WJ30Oq5fGrfnOPQgjD0

