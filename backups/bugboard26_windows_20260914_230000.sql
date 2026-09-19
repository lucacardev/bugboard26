--
-- PostgreSQL database dump
--

\restrict s7if8hCUsskPef9GFCyZCE96MfRof9TeNTl9QgSDtelytYXuUsiSd2HLxedXWaC

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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

--
-- Name: enum_issues_stato; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_issues_stato AS ENUM (
    'todo',
    'in_progress',
    'done'
);


ALTER TYPE public.enum_issues_stato OWNER TO postgres;

--
-- Name: enum_issues_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_issues_tipo AS ENUM (
    'bug',
    'question',
    'documentation',
    'feature'
);


ALTER TYPE public.enum_issues_tipo OWNER TO postgres;

--
-- Name: enum_utenti_ruolo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_utenti_ruolo AS ENUM (
    'normale',
    'amministratore',
    'stakeholder'
);


ALTER TYPE public.enum_utenti_ruolo OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: allegati; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.allegati (
    id integer NOT NULL,
    "urlKey" character varying(255) NOT NULL,
    "nomeFile" character varying(255) NOT NULL,
    "tipoMime" character varying(255) NOT NULL,
    dimensione integer NOT NULL,
    "issueId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "caricatoDa" integer
);


ALTER TABLE public.allegati OWNER TO postgres;

--
-- Name: allegati_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.allegati_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.allegati_id_seq OWNER TO postgres;

--
-- Name: allegati_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.allegati_id_seq OWNED BY public.allegati.id;


--
-- Name: commenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commenti (
    id integer NOT NULL,
    testo text NOT NULL,
    "issueId" integer NOT NULL,
    "autoreId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.commenti OWNER TO postgres;

--
-- Name: commenti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commenti_id_seq OWNER TO postgres;

--
-- Name: commenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commenti_id_seq OWNED BY public.commenti.id;


--
-- Name: etichette; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etichette (
    id integer NOT NULL,
    testo character varying(255) NOT NULL,
    colore character varying(255) NOT NULL,
    "progettoId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.etichette OWNER TO postgres;

--
-- Name: etichette_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etichette_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etichette_id_seq OWNER TO postgres;

--
-- Name: etichette_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etichette_id_seq OWNED BY public.etichette.id;


--
-- Name: issue_etichette; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issue_etichette (
    id integer NOT NULL,
    "issueId" integer NOT NULL,
    "etichettaId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.issue_etichette OWNER TO postgres;

--
-- Name: issue_etichette_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.issue_etichette_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issue_etichette_id_seq OWNER TO postgres;

--
-- Name: issue_etichette_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.issue_etichette_id_seq OWNED BY public.issue_etichette.id;


--
-- Name: issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issues (
    id integer NOT NULL,
    tipo public.enum_issues_tipo NOT NULL,
    titolo character varying(255) NOT NULL,
    descrizione text NOT NULL,
    stato public.enum_issues_stato DEFAULT 'todo'::public.enum_issues_stato NOT NULL,
    priorita character varying(255),
    "dataInizio" timestamp with time zone,
    "dataScadenza" timestamp with time zone,
    "progettoId" integer NOT NULL,
    "segnalatoreId" integer NOT NULL,
    "assegnatarioId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.issues OWNER TO postgres;

--
-- Name: issues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.issues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issues_id_seq OWNER TO postgres;

--
-- Name: issues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.issues_id_seq OWNED BY public.issues.id;


--
-- Name: membri_team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membri_team (
    id integer NOT NULL,
    "teamId" integer NOT NULL,
    "utenteId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.membri_team OWNER TO postgres;

--
-- Name: membri_team_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membri_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membri_team_id_seq OWNER TO postgres;

--
-- Name: membri_team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membri_team_id_seq OWNED BY public.membri_team.id;


--
-- Name: notifiche; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifiche (
    id integer NOT NULL,
    "utenteId" integer NOT NULL,
    messaggio text NOT NULL,
    letta boolean DEFAULT false NOT NULL,
    "issueId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.notifiche OWNER TO postgres;

--
-- Name: notifiche_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifiche_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifiche_id_seq OWNER TO postgres;

--
-- Name: notifiche_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifiche_id_seq OWNED BY public.notifiche.id;


--
-- Name: progetti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progetti (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descrizione text,
    "creatoDa" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.progetti OWNER TO postgres;

--
-- Name: progetti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.progetti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.progetti_id_seq OWNER TO postgres;

--
-- Name: progetti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.progetti_id_seq OWNED BY public.progetti.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    "progettoId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: utenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utenti (
    id integer NOT NULL,
    "cognitoSub" character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    ruolo public.enum_utenti_ruolo DEFAULT 'normale'::public.enum_utenti_ruolo NOT NULL,
    attivato boolean DEFAULT true NOT NULL
);


ALTER TABLE public.utenti OWNER TO postgres;

--
-- Name: utenti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utenti_id_seq OWNER TO postgres;

--
-- Name: utenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utenti_id_seq OWNED BY public.utenti.id;


--
-- Name: voci_cronologia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voci_cronologia (
    id integer NOT NULL,
    descrizione text NOT NULL,
    "issueId" integer NOT NULL,
    "autoreId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.voci_cronologia OWNER TO postgres;

--
-- Name: voci_cronologia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voci_cronologia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voci_cronologia_id_seq OWNER TO postgres;

--
-- Name: voci_cronologia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voci_cronologia_id_seq OWNED BY public.voci_cronologia.id;


--
-- Name: allegati id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati ALTER COLUMN id SET DEFAULT nextval('public.allegati_id_seq'::regclass);


--
-- Name: commenti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti ALTER COLUMN id SET DEFAULT nextval('public.commenti_id_seq'::regclass);


--
-- Name: etichette id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette ALTER COLUMN id SET DEFAULT nextval('public.etichette_id_seq'::regclass);


--
-- Name: issue_etichette id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette ALTER COLUMN id SET DEFAULT nextval('public.issue_etichette_id_seq'::regclass);


--
-- Name: issues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues ALTER COLUMN id SET DEFAULT nextval('public.issues_id_seq'::regclass);


--
-- Name: membri_team id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membri_team ALTER COLUMN id SET DEFAULT nextval('public.membri_team_id_seq'::regclass);


--
-- Name: notifiche id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche ALTER COLUMN id SET DEFAULT nextval('public.notifiche_id_seq'::regclass);


--
-- Name: progetti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti ALTER COLUMN id SET DEFAULT nextval('public.progetti_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: utenti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti ALTER COLUMN id SET DEFAULT nextval('public.utenti_id_seq'::regclass);


--
-- Name: voci_cronologia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voci_cronologia ALTER COLUMN id SET DEFAULT nextval('public.voci_cronologia_id_seq'::regclass);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20260820165239-create-utenti.js
20260820170537-create-progetti.js
20260820171111-create-teams.js
20260820171339-create-issues.js
20260820171427-create-commenti.js
20260820171531-create-allegati.js
20260820171649-create-voci-cronologia.js
20260820171724-create-etichette.js
20260820171818-create-membri-team.js
20260820171857-create-issue-etichette.js
20260825082706-alter-issues-descrizione-not-null.js
20260825085545-alter-utenti-username-e-ruolo.js
20260826152421-create-notifiche.js
20260908141035-add-stakeholder-ruolo.js
20260911100553-add-attivato-utenti.js
20260911095802-add-unique-username.js
20260912094044-add-caricatoda-allegati.js
20260912145347-add-unique-urlkey-allegati.js
\.


--
-- Data for Name: allegati; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.allegati (id, "urlKey", "nomeFile", "tipoMime", dimensione, "issueId", "createdAt", "updatedAt", "caricatoDa") FROM stdin;
\.


--
-- Data for Name: commenti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commenti (id, testo, "issueId", "autoreId", "createdAt", "updatedAt") FROM stdin;
1	gg	9	3	2026-09-10 15:58:11.776+00	2026-09-10 15:58:11.776+00
2	gg	9	3	2026-09-10 15:58:34.928+00	2026-09-10 15:58:34.928+00
3	gg2	9	1	2026-09-10 16:00:15.168+00	2026-09-12 09:53:03.23+00
\.


--
-- Data for Name: etichette; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etichette (id, testo, colore, "progettoId", "createdAt", "updatedAt") FROM stdin;
1	gg	#3949ab	1	2026-09-12 09:55:08.209+00	2026-09-12 09:55:08.209+00
\.


--
-- Data for Name: issue_etichette; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issue_etichette (id, "issueId", "etichettaId", "createdAt", "updatedAt") FROM stdin;
1	9	1	2026-09-12 09:55:08.265+00	2026-09-12 09:55:08.265+00
2	8	1	2026-09-12 09:55:19.601+00	2026-09-12 09:55:19.601+00
\.


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issues (id, tipo, titolo, descrizione, stato, priorita, "dataInizio", "dataScadenza", "progettoId", "segnalatoreId", "assegnatarioId", "createdAt", "updatedAt") FROM stdin;
1	bug	Nuova Issue		done	media	2026-09-10 00:00:00+00	2026-09-11 00:00:00+00	1	1	3	2026-09-10 14:59:35.155+00	2026-09-10 15:05:23.416+00
2	bug	gg	gg	todo	bassa	2026-09-12 00:00:00+00	2026-09-18 00:00:00+00	1	1	3	2026-09-10 15:09:55.985+00	2026-09-10 15:09:55.985+00
3	bug	gg	gg	todo	media	2026-09-11 00:00:00+00	2026-09-30 00:00:00+00	1	1	3	2026-09-10 15:10:10.169+00	2026-09-10 15:11:42.528+00
4	feature	Prova Data	gg	todo		\N	\N	1	1	\N	2026-09-10 15:16:55.975+00	2026-09-10 15:16:55.975+00
5	bug	gg	gg	todo	bassa	\N	\N	1	1	3	2026-09-10 15:17:09.414+00	2026-09-10 15:17:30.56+00
7	documentation	gg	gg	todo	bassa	\N	\N	1	1	3	2026-09-10 15:18:16.144+00	2026-09-10 15:18:16.144+00
8	bug	gg 3 	gg	todo	bassa	\N	\N	1	1	3	2026-09-10 15:23:08.579+00	2026-09-10 15:23:08.579+00
9	question	??	??	done	bassa	\N	\N	1	1	3	2026-09-10 15:28:12.243+00	2026-09-10 16:13:16.409+00
6	bug	gg	gg	done		\N	\N	1	1	3	2026-09-10 15:17:46.26+00	2026-09-10 16:13:40.228+00
10	bug	gg	prova	todo		\N	\N	1	1	\N	2026-09-12 15:48:16.7+00	2026-09-12 15:48:16.7+00
11	bug	Prova Titolo	Prova Descrizione	todo		\N	\N	1	1	\N	2026-09-12 15:48:30.928+00	2026-09-12 15:48:30.928+00
12	question	Prova Titolo	Prova descrizione	done	bassa	2026-09-12 00:00:00+00	\N	1	1	3	2026-09-12 15:50:25.366+00	2026-09-12 15:50:32.34+00
\.


--
-- Data for Name: membri_team; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membri_team (id, "teamId", "utenteId", "createdAt", "updatedAt") FROM stdin;
1	1	3	2026-09-10 14:58:28.259+00	2026-09-10 14:58:28.259+00
2	2	3	2026-09-12 15:49:46.227+00	2026-09-12 15:49:46.227+00
\.


--
-- Data for Name: notifiche; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifiche (id, "utenteId", messaggio, letta, "issueId", "createdAt", "updatedAt") FROM stdin;
2	3	Ti è stata assegnata la issue "gg"	t	3	2026-09-10 15:11:42.541+00	2026-09-10 15:17:14.525+00
3	3	Ti è stata assegnata la issue "gg"	t	5	2026-09-10 15:17:30.57+00	2026-09-10 15:17:58.051+00
4	3	Ti è stata assegnata la issue "??"	t	9	2026-09-10 15:28:12.261+00	2026-09-10 15:58:08.05+00
5	1	La tua issue "??" è stata completata	t	9	2026-09-10 16:13:16.424+00	2026-09-10 16:13:31.367+00
6	1	La tua issue "gg" è stata completata	t	6	2026-09-10 16:13:40.236+00	2026-09-10 16:13:46.632+00
1	1	La tua issue "Nuova Issue" è stata completata	t	1	2026-09-10 15:05:23.433+00	2026-09-10 16:13:50.506+00
7	3	Ti è stata assegnata la issue "Prova Titolo"	f	12	2026-09-12 15:50:25.391+00	2026-09-12 15:50:25.391+00
8	1	La tua issue "Prova Titolo" è stata completata	f	12	2026-09-12 15:50:32.348+00	2026-09-12 15:50:32.348+00
\.


--
-- Data for Name: progetti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progetti (id, nome, descrizione, "creatoDa", "createdAt", "updatedAt") FROM stdin;
1	Primo Progetto Deploy	primo progetto di deploy	1	2026-09-10 14:51:47.218+00	2026-09-10 14:51:47.218+00
2	Prova 2	Progetto 2 	1	2026-09-12 15:49:41.215+00	2026-09-12 15:49:41.215+00
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, nome, "progettoId", "createdAt", "updatedAt") FROM stdin;
1	Team Deploy	1	2026-09-10 14:51:47.227+00	2026-09-10 14:51:47.227+00
2	Napoli	2	2026-09-12 15:49:41.219+00	2026-09-12 15:49:41.219+00
\.


--
-- Data for Name: utenti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utenti (id, "cognitoSub", username, email, "createdAt", "updatedAt", ruolo, attivato) FROM stdin;
1	667e12e0-50d1-7023-f11d-1f324a6cedf9	admin	admin@bugboard26.local	2026-09-10 14:49:02.627+00	2026-09-10 14:49:02.627+00	amministratore	t
3	060e5270-7091-701f-91e3-1b0d014d0fc3	luca_cardone01	cardoneluca001@gmail.com	2026-09-10 14:57:29.734+00	2026-09-10 14:57:29.734+00	normale	t
\.


--
-- Data for Name: voci_cronologia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voci_cronologia (id, descrizione, "issueId", "autoreId", "createdAt", "updatedAt") FROM stdin;
1	Issue creata	1	1	2026-09-10 14:59:35.162+00	2026-09-10 14:59:35.162+00
2	Stato cambiato da "todo" a "done"	1	3	2026-09-10 15:05:23.421+00	2026-09-10 15:05:23.421+00
3	Issue creata	2	1	2026-09-10 15:09:55.989+00	2026-09-10 15:09:55.989+00
4	Issue creata	3	1	2026-09-10 15:10:10.174+00	2026-09-10 15:10:10.174+00
5	Issue assegnata all'utente #3	3	1	2026-09-10 15:11:42.535+00	2026-09-10 15:11:42.535+00
6	Issue creata	4	1	2026-09-10 15:16:55.981+00	2026-09-10 15:16:55.981+00
7	Issue creata	5	1	2026-09-10 15:17:09.419+00	2026-09-10 15:17:09.419+00
8	Issue de-assegnata	5	1	2026-09-10 15:17:28.796+00	2026-09-10 15:17:28.796+00
9	Issue assegnata all'utente #3	5	1	2026-09-10 15:17:30.564+00	2026-09-10 15:17:30.564+00
10	Issue creata	6	1	2026-09-10 15:17:46.266+00	2026-09-10 15:17:46.266+00
11	Issue creata	7	1	2026-09-10 15:18:16.147+00	2026-09-10 15:18:16.147+00
12	Issue creata	8	1	2026-09-10 15:23:08.584+00	2026-09-10 15:23:08.584+00
13	Issue creata	9	1	2026-09-10 15:28:12.254+00	2026-09-10 15:28:12.254+00
14	Stato cambiato da "todo" a "done"	9	1	2026-09-10 16:13:16.416+00	2026-09-10 16:13:16.416+00
15	Stato cambiato da "todo" a "done"	6	3	2026-09-10 16:13:40.231+00	2026-09-10 16:13:40.231+00
16	Issue creata	10	1	2026-09-12 15:48:16.712+00	2026-09-12 15:48:16.712+00
17	Issue creata	11	1	2026-09-12 15:48:30.931+00	2026-09-12 15:48:30.931+00
18	Issue creata	12	1	2026-09-12 15:50:25.375+00	2026-09-12 15:50:25.375+00
19	Stato cambiato da "todo" a "done"	12	1	2026-09-12 15:50:32.344+00	2026-09-12 15:50:32.344+00
\.


--
-- Name: allegati_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.allegati_id_seq', 1, true);


--
-- Name: commenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commenti_id_seq', 4, true);


--
-- Name: etichette_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etichette_id_seq', 1, true);


--
-- Name: issue_etichette_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.issue_etichette_id_seq', 2, true);


--
-- Name: issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.issues_id_seq', 12, true);


--
-- Name: membri_team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membri_team_id_seq', 2, true);


--
-- Name: notifiche_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifiche_id_seq', 8, true);


--
-- Name: progetti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.progetti_id_seq', 2, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 2, true);


--
-- Name: utenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utenti_id_seq', 3, true);


--
-- Name: voci_cronologia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.voci_cronologia_id_seq', 19, true);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: allegati allegati_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati
    ADD CONSTRAINT allegati_pkey PRIMARY KEY (id);


--
-- Name: allegati allegati_urlkey_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati
    ADD CONSTRAINT allegati_urlkey_unique UNIQUE ("urlKey");


--
-- Name: commenti commenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti
    ADD CONSTRAINT commenti_pkey PRIMARY KEY (id);


--
-- Name: etichette etichette_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette
    ADD CONSTRAINT etichette_pkey PRIMARY KEY (id);


--
-- Name: issue_etichette issue_etichette_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette
    ADD CONSTRAINT issue_etichette_pkey PRIMARY KEY (id);


--
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- Name: membri_team membri_team_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membri_team
    ADD CONSTRAINT membri_team_pkey PRIMARY KEY (id);


--
-- Name: notifiche notifiche_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT notifiche_pkey PRIMARY KEY (id);


--
-- Name: progetti progetti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti
    ADD CONSTRAINT progetti_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: teams teams_progettoId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_progettoId_key" UNIQUE ("progettoId");


--
-- Name: utenti utenti_cognitoSub_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT "utenti_cognitoSub_key" UNIQUE ("cognitoSub");


--
-- Name: utenti utenti_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_email_key UNIQUE (email);


--
-- Name: utenti utenti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_pkey PRIMARY KEY (id);


--
-- Name: utenti utenti_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_username_unique UNIQUE (username);


--
-- Name: voci_cronologia voci_cronologia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voci_cronologia
    ADD CONSTRAINT voci_cronologia_pkey PRIMARY KEY (id);


--
-- Name: etichette_progetto_testo_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX etichette_progetto_testo_unique ON public.etichette USING btree ("progettoId", testo);


--
-- Name: issue_etichette_issue_etichetta_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX issue_etichette_issue_etichetta_unique ON public.issue_etichette USING btree ("issueId", "etichettaId");


--
-- Name: membri_team_team_utente_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX membri_team_team_utente_unique ON public.membri_team USING btree ("teamId", "utenteId");


--
-- Name: allegati allegati_caricatoDa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati
    ADD CONSTRAINT "allegati_caricatoDa_fkey" FOREIGN KEY ("caricatoDa") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: allegati allegati_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allegati
    ADD CONSTRAINT "allegati_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: commenti commenti_autoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti
    ADD CONSTRAINT "commenti_autoreId_fkey" FOREIGN KEY ("autoreId") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: commenti commenti_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commenti
    ADD CONSTRAINT "commenti_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: etichette etichette_progettoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etichette
    ADD CONSTRAINT "etichette_progettoId_fkey" FOREIGN KEY ("progettoId") REFERENCES public.progetti(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_etichette issue_etichette_etichettaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette
    ADD CONSTRAINT "issue_etichette_etichettaId_fkey" FOREIGN KEY ("etichettaId") REFERENCES public.etichette(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_etichette issue_etichette_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_etichette
    ADD CONSTRAINT "issue_etichette_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issues issues_assegnatarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT "issues_assegnatarioId_fkey" FOREIGN KEY ("assegnatarioId") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: issues issues_progettoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT "issues_progettoId_fkey" FOREIGN KEY ("progettoId") REFERENCES public.progetti(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issues issues_segnalatoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT "issues_segnalatoreId_fkey" FOREIGN KEY ("segnalatoreId") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: membri_team membri_team_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membri_team
    ADD CONSTRAINT "membri_team_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: membri_team membri_team_utenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membri_team
    ADD CONSTRAINT "membri_team_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifiche notifiche_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT "notifiche_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifiche notifiche_utenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifiche
    ADD CONSTRAINT "notifiche_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progetti progetti_creatoDa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progetti
    ADD CONSTRAINT "progetti_creatoDa_fkey" FOREIGN KEY ("creatoDa") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teams teams_progettoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_progettoId_fkey" FOREIGN KEY ("progettoId") REFERENCES public.progetti(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voci_cronologia voci_cronologia_autoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voci_cronologia
    ADD CONSTRAINT "voci_cronologia_autoreId_fkey" FOREIGN KEY ("autoreId") REFERENCES public.utenti(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: voci_cronologia voci_cronologia_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voci_cronologia
    ADD CONSTRAINT "voci_cronologia_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict s7if8hCUsskPef9GFCyZCE96MfRof9TeNTl9QgSDtelytYXuUsiSd2HLxedXWaC

