--
-- PostgreSQL database dump
--

\restrict oxriN47NnyB3SO1WmeI3pPmoIBnNzkXJkl9zolxIIbLpWA04J4ScWsdQb4Vb8cf

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

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

DROP DATABASE IF EXISTS nudo_landing;
--
-- Name: nudo_landing; Type: DATABASE; Schema: -; Owner: mbustillos
--

CREATE DATABASE nudo_landing WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'es_BO.UTF-8';


ALTER DATABASE nudo_landing OWNER TO mbustillos;

\unrestrict oxriN47NnyB3SO1WmeI3pPmoIBnNzkXJkl9zolxIIbLpWA04J4ScWsdQb4Vb8cf
\connect nudo_landing
\restrict oxriN47NnyB3SO1WmeI3pPmoIBnNzkXJkl9zolxIIbLpWA04J4ScWsdQb4Vb8cf

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
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: nudo_app
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO nudo_app;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: nudo_app
--

CREATE TABLE public.contact_messages (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(255),
    phone character varying(40),
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    product_id bigint,
    status character varying(20) DEFAULT 'new'::character varying NOT NULL,
    ip_hash character(64),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_contact_at_least_one_method CHECK (((email IS NOT NULL) OR (phone IS NOT NULL))),
    CONSTRAINT contact_messages_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('reviewed'::character varying)::text, ('closed'::character varying)::text])))
);


ALTER TABLE public.contact_messages OWNER TO nudo_app;

--
-- Name: TABLE contact_messages; Type: COMMENT; Schema: public; Owner: nudo_app
--

COMMENT ON TABLE public.contact_messages IS 'Consultas enviadas desde el formulario de contacto';


--
-- Name: COLUMN contact_messages.product_id; Type: COMMENT; Schema: public; Owner: nudo_app
--

COMMENT ON COLUMN public.contact_messages.product_id IS 'Producto consultado (opcional); ON DELETE SET NULL conserva el histórico';


--
-- Name: COLUMN contact_messages.ip_hash; Type: COMMENT; Schema: public; Owner: nudo_app
--

COMMENT ON COLUMN public.contact_messages.ip_hash IS 'SHA-256 de la IP; solo para limitación de frecuencia. Nunca se guarda la IP en claro';


--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: nudo_app
--

ALTER TABLE public.contact_messages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contact_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: nudo_app
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    slug character varying(140),
    category character varying(40) NOT NULL,
    short_description text,
    price numeric(10,2) NOT NULL,
    currency character(3) DEFAULT 'BOB'::bpchar NOT NULL,
    image_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_currency_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT products_price_check CHECK ((price > (0)::numeric))
);


ALTER TABLE public.products OWNER TO nudo_app;

--
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: nudo_app
--

COMMENT ON TABLE public.products IS 'Catálogo público de prendas tejidas';


--
-- Name: COLUMN products.price; Type: COMMENT; Schema: public; Owner: nudo_app
--

COMMENT ON COLUMN public.products.price IS 'Precio en la moneda indicada por currency; el servidor es la única fuente de precio';


--
-- Name: COLUMN products.is_active; Type: COMMENT; Schema: public; Owner: nudo_app
--

COMMENT ON COLUMN public.products.is_active IS 'Solo los productos activos se exponen en GET /api/products';


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: nudo_app
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: nudo_app
--

COPY public.contact_messages (id, name, email, phone, subject, message, product_id, status, ip_hash, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: nudo_app
--

COPY public.products (id, name, slug, category, short_description, price, currency, image_url, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Chompa Siena	chompa-siena	chompas	Chompa tejida de corte cruzado, ideal para el frío del altiplano.	119.00	BOB	/assets/images/3.avif	t	1	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
2	Bicle Nube	bicle-nube	bicles	Bicolores a manga corta con vivos verde y rojo.	89.00	BOB	/assets/images/4.avif	t	2	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
3	Chompa Terracota	chompa-terracota	chompas	Tejido grueso color vino, punto de canalé.	139.00	BOB	/assets/images/5.avif	t	3	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
4	Bicle Linea	bicle-linea	bicles	Bicolores de punto liviano, manga larga.	95.00	BOB	/assets/images/6.avif	t	4	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
5	Chompa Paramo	chompa-paramo	chompas	Chompa oversized con textura natural.	139.00	BOB	/assets/images/7.avif	t	5	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
6	Bicle Moka	bicle-moka	bicles	Bicolores cuello alto, tejido moka.	99.00	BOB	/assets/images/8.avif	t	6	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
7	Chompa Muestra Inactiva	chompa-muestra-inactiva	chompas	Producto desactivado para probar el filtro is_active.	999.00	BOB	\N	f	99	2026-10-09 13:45:40.956619-04	2026-10-09 13:45:40.956619-04
\.


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nudo_app
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nudo_app
--

SELECT pg_catalog.setval('public.products_id_seq', 7, true);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: nudo_app
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: nudo_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: nudo_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: idx_contact_ip_hash_created; Type: INDEX; Schema: public; Owner: nudo_app
--

CREATE INDEX idx_contact_ip_hash_created ON public.contact_messages USING btree (ip_hash, created_at DESC);


--
-- Name: idx_contact_status; Type: INDEX; Schema: public; Owner: nudo_app
--

CREATE INDEX idx_contact_status ON public.contact_messages USING btree (status);


--
-- Name: idx_products_category_active; Type: INDEX; Schema: public; Owner: nudo_app
--

CREATE INDEX idx_products_category_active ON public.products USING btree (category) WHERE is_active;


--
-- Name: products trg_products_updated_at; Type: TRIGGER; Schema: public; Owner: nudo_app
--

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: contact_messages contact_messages_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nudo_app
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict oxriN47NnyB3SO1WmeI3pPmoIBnNzkXJkl9zolxIIbLpWA04J4ScWsdQb4Vb8cf

