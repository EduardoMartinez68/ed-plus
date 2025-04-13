--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2025-04-04 22:50:13

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
-- TOC entry 6 (class 2615 OID 102668)
-- Name: Box; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Box";


ALTER SCHEMA "Box" OWNER TO postgres;

--
-- TOC entry 7 (class 2615 OID 102669)
-- Name: Branch; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Branch";


ALTER SCHEMA "Branch" OWNER TO postgres;

--
-- TOC entry 16 (class 2615 OID 103462)
-- Name: CRM; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "CRM";


ALTER SCHEMA "CRM" OWNER TO postgres;

--
-- TOC entry 18 (class 2615 OID 111986)
-- Name: Chat; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Chat";


ALTER SCHEMA "Chat" OWNER TO postgres;

--
-- TOC entry 8 (class 2615 OID 102670)
-- Name: Company; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Company";


ALTER SCHEMA "Company" OWNER TO postgres;

--
-- TOC entry 9 (class 2615 OID 102671)
-- Name: Customer; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Customer";


ALTER SCHEMA "Customer" OWNER TO postgres;

--
-- TOC entry 10 (class 2615 OID 102672)
-- Name: Employee; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Employee";


ALTER SCHEMA "Employee" OWNER TO postgres;

--
-- TOC entry 11 (class 2615 OID 102673)
-- Name: Fud; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Fud";


ALTER SCHEMA "Fud" OWNER TO postgres;

--
-- TOC entry 12 (class 2615 OID 102674)
-- Name: Inventory; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Inventory";


ALTER SCHEMA "Inventory" OWNER TO postgres;

--
-- TOC entry 13 (class 2615 OID 102675)
-- Name: Kitchen; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Kitchen";


ALTER SCHEMA "Kitchen" OWNER TO postgres;

--
-- TOC entry 14 (class 2615 OID 102676)
-- Name: Settings; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Settings";


ALTER SCHEMA "Settings" OWNER TO postgres;

--
-- TOC entry 15 (class 2615 OID 102677)
-- Name: User; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "User";


ALTER SCHEMA "User" OWNER TO postgres;

--
-- TOC entry 17 (class 2615 OID 103711)
-- Name: _company_1_branch_8; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _company_1_branch_8;


ALTER SCHEMA _company_1_branch_8 OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 334 (class 1259 OID 112637)
-- Name: box_history; Type: TABLE; Schema: Box; Owner: postgres
--

CREATE TABLE "Box".box_history (
    id bigint NOT NULL,
    id_employee integer NOT NULL,
    id_customers integer,
    buy_for_cash numeric(10,2) NOT NULL,
    buy_for_credit_card numeric(10,2) NOT NULL,
    buy_for_debit_card numeric(10,2) NOT NULL,
    change_of_sale numeric(10,2) DEFAULT 0,
    comment text,
    date_sales timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "Box".box_history OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 112636)
-- Name: box_history_id_seq; Type: SEQUENCE; Schema: Box; Owner: postgres
--

CREATE SEQUENCE "Box".box_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Box".box_history_id_seq OWNER TO postgres;

--
-- TOC entry 4154 (class 0 OID 0)
-- Dependencies: 333
-- Name: box_history_id_seq; Type: SEQUENCE OWNED BY; Schema: Box; Owner: postgres
--

ALTER SEQUENCE "Box".box_history_id_seq OWNED BY "Box".box_history.id;


--
-- TOC entry 227 (class 1259 OID 102678)
-- Name: boxes_history; Type: TABLE; Schema: Box; Owner: postgres
--

CREATE TABLE "Box".boxes_history (
    id bigint NOT NULL,
    initial_date timestamp without time zone,
    finish_date timestamp without time zone,
    id_branches bigint,
    id_employees bigint,
    id_boxes bigint
);


ALTER TABLE "Box".boxes_history OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 102681)
-- Name: movement_history_id_seq; Type: SEQUENCE; Schema: Box; Owner: postgres
--

CREATE SEQUENCE "Box".movement_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Box".movement_history_id_seq OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 102682)
-- Name: movement_history; Type: TABLE; Schema: Box; Owner: postgres
--

CREATE TABLE "Box".movement_history (
    id bigint DEFAULT nextval('"Box".movement_history_id_seq'::regclass) NOT NULL,
    id_branches bigint,
    id_boxes bigint,
    id_employees bigint,
    move double precision,
    comment text,
    date_move timestamp with time zone
);


ALTER TABLE "Box".movement_history OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 102688)
-- Name: sales_history; Type: TABLE; Schema: Box; Owner: postgres
--

CREATE TABLE "Box".sales_history (
    id bigint NOT NULL,
    id_companies bigint,
    id_branches bigint,
    id_employees bigint,
    id_customers bigint,
    id_dishes_and_combos bigint,
    price double precision,
    amount double precision,
    total double precision,
    comment text,
    sale_day timestamp with time zone
);


ALTER TABLE "Box".sales_history OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 102693)
-- Name: sales_history_id_seq; Type: SEQUENCE; Schema: Box; Owner: postgres
--

CREATE SEQUENCE "Box".sales_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Box".sales_history_id_seq OWNER TO postgres;

--
-- TOC entry 4155 (class 0 OID 0)
-- Dependencies: 231
-- Name: sales_history_id_seq; Type: SEQUENCE OWNED BY; Schema: Box; Owner: postgres
--

ALTER SEQUENCE "Box".sales_history_id_seq OWNED BY "Box".sales_history.id;


--
-- TOC entry 232 (class 1259 OID 102694)
-- Name: Ad; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch"."Ad" (
    id bigint NOT NULL,
    id_branches bigint,
    img text,
    type character varying(7),
    description character varying(30)
);


ALTER TABLE "Branch"."Ad" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 102699)
-- Name: Ad_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch"."Ad_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch"."Ad_id_seq" OWNER TO postgres;

--
-- TOC entry 4156 (class 0 OID 0)
-- Dependencies: 233
-- Name: Ad_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch"."Ad_id_seq" OWNED BY "Branch"."Ad".id;


--
-- TOC entry 234 (class 1259 OID 102700)
-- Name: app; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".app (
    id bigint NOT NULL,
    id_branches bigint,
    id_stripe_new_terminal text,
    expiration_date_new_terminal date DEFAULT (CURRENT_DATE + '15 days'::interval) NOT NULL,
    id_stripe_website_creation text,
    expiration_date_website_creation date DEFAULT (CURRENT_DATE + '15 days'::interval) NOT NULL,
    id_stripe_digital_menu text,
    expiration_date_digital_menu date DEFAULT (CURRENT_DATE + '15 days'::interval) NOT NULL,
    id_stripe_employee_schedules text,
    expiration_date_employee_schedules date DEFAULT (CURRENT_DATE + '15 days'::interval) NOT NULL
);


ALTER TABLE "Branch".app OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 102709)
-- Name: app_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".app_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".app_id_seq OWNER TO postgres;

--
-- TOC entry 4157 (class 0 OID 0)
-- Dependencies: 235
-- Name: app_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".app_id_seq OWNED BY "Branch".app.id;


--
-- TOC entry 236 (class 1259 OID 102710)
-- Name: billing_information; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".billing_information (
    id bigint NOT NULL,
    id_providers bigint,
    addres text,
    postal_code character varying(10),
    rfc text NOT NULL,
    curp text NOT NULL,
    business_name character varying(200),
    business_phone character varying(20),
    business_cell_phone character varying(20)
);


ALTER TABLE "Branch".billing_information OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 102715)
-- Name: billing_information_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".billing_information_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".billing_information_id_seq OWNER TO postgres;

--
-- TOC entry 4158 (class 0 OID 0)
-- Dependencies: 237
-- Name: billing_information_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".billing_information_id_seq OWNED BY "Branch".billing_information.id;


--
-- TOC entry 238 (class 1259 OID 102716)
-- Name: boxes; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".boxes (
    id bigint NOT NULL,
    id_branches bigint,
    num_box smallint,
    ip_printer character varying(20)
);


ALTER TABLE "Branch".boxes OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 102719)
-- Name: boxes_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".boxes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".boxes_id_seq OWNER TO postgres;

--
-- TOC entry 4159 (class 0 OID 0)
-- Dependencies: 239
-- Name: boxes_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".boxes_id_seq OWNED BY "Branch".boxes.id;


--
-- TOC entry 240 (class 1259 OID 102720)
-- Name: commanders; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".commanders (
    id bigint NOT NULL,
    id_branches bigint,
    id_employees bigint,
    id_customers bigint,
    total double precision NOT NULL,
    money_received double precision NOT NULL,
    change double precision NOT NULL,
    status integer NOT NULL,
    comentary text,
    commander_date timestamp without time zone NOT NULL,
    order_details json NOT NULL
);


ALTER TABLE "Branch".commanders OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 102725)
-- Name: commanders_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".commanders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".commanders_id_seq OWNER TO postgres;

--
-- TOC entry 4160 (class 0 OID 0)
-- Dependencies: 241
-- Name: commanders_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".commanders_id_seq OWNED BY "Branch".commanders.id;


--
-- TOC entry 242 (class 1259 OID 102726)
-- Name: facture; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".facture (
    "Invoice Number" character varying(200) NOT NULL,
    id_companies bigint,
    id_branches bigint,
    id_employees bigint,
    id_customers bigint,
    id_commanders bigint,
    name_customer text NOT NULL,
    email_customer text,
    address text,
    transition_type character varying(300),
    payment_reference text,
    creation_date date DEFAULT CURRENT_DATE NOT NULL,
    payment_date date NOT NULL,
    type_of_documentation text,
    status character varying(100),
    paid boolean DEFAULT false NOT NULL
);


ALTER TABLE "Branch".facture OWNER TO postgres;

--
-- TOC entry 340 (class 1259 OID 112928)
-- Name: history_move_lot; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".history_move_lot (
    id bigint NOT NULL,
    id_companies bigint,
    id_branches bigint,
    id_employees bigint,
    id_lots bigint,
    "newCant" double precision NOT NULL,
    type_move character varying DEFAULT 30 NOT NULL,
    date_move timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "Branch".history_move_lot OWNER TO postgres;

--
-- TOC entry 339 (class 1259 OID 112927)
-- Name: history_move_lot_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".history_move_lot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".history_move_lot_id_seq OWNER TO postgres;

--
-- TOC entry 4161 (class 0 OID 0)
-- Dependencies: 339
-- Name: history_move_lot_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".history_move_lot_id_seq OWNED BY "Branch".history_move_lot.id;


--
-- TOC entry 243 (class 1259 OID 102733)
-- Name: managers; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".managers (
    id bigint NOT NULL,
    id_branches bigint,
    id_employees bigint
);


ALTER TABLE "Branch".managers OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 102736)
-- Name: managers_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".managers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".managers_id_seq OWNER TO postgres;

--
-- TOC entry 4162 (class 0 OID 0)
-- Dependencies: 244
-- Name: managers_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".managers_id_seq OWNED BY "Branch".managers.id;


--
-- TOC entry 245 (class 1259 OID 102737)
-- Name: order; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch"."order" (
    id bigint NOT NULL,
    id_branches bigint,
    id_commanders bigint,
    id_employees bigint,
    name_customer character varying(300),
    cellphone character varying(30),
    phone character varying(30),
    address text,
    comment text,
    status character varying(50) DEFAULT 'En preparacion'::character varying
);


ALTER TABLE "Branch"."order" OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 102743)
-- Name: order_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".order_id_seq OWNER TO postgres;

--
-- TOC entry 4163 (class 0 OID 0)
-- Dependencies: 246
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".order_id_seq OWNED BY "Branch"."order".id;


--
-- TOC entry 247 (class 1259 OID 102744)
-- Name: pack_reservation; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".pack_reservation (
    id bigint NOT NULL,
    name character varying(30) NOT NULL,
    description text,
    number_of_adult integer,
    number_of_children integer,
    price_for_children double precision,
    price_for_adult double precision,
    id_branches bigint
);


ALTER TABLE "Branch".pack_reservation OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 102749)
-- Name: pack_reservation_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".pack_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".pack_reservation_id_seq OWNER TO postgres;

--
-- TOC entry 4164 (class 0 OID 0)
-- Dependencies: 248
-- Name: pack_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".pack_reservation_id_seq OWNED BY "Branch".pack_reservation.id;


--
-- TOC entry 338 (class 1259 OID 112833)
-- Name: prescription; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".prescription (
    id bigint NOT NULL,
    recipe_folio text NOT NULL,
    doctor_id text NOT NULL,
    doctor_name text NOT NULL,
    date_prescription timestamp without time zone NOT NULL,
    retained boolean,
    amount double precision NOT NULL,
    comment text,
    id_companies bigint,
    id_branches bigint,
    id_employees bigint,
    id_dishes_and_combos bigint,
    id_lots bigint,
    id_customers bigint
);


ALTER TABLE "Branch".prescription OWNER TO postgres;

--
-- TOC entry 337 (class 1259 OID 112832)
-- Name: prescription_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".prescription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".prescription_id_seq OWNER TO postgres;

--
-- TOC entry 4165 (class 0 OID 0)
-- Dependencies: 337
-- Name: prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".prescription_id_seq OWNED BY "Branch".prescription.id;


--
-- TOC entry 249 (class 1259 OID 102750)
-- Name: providers; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".providers (
    id bigint NOT NULL,
    id_branches bigint,
    name character varying(200),
    representative character varying(200),
    cell_phone character varying(15),
    phone character varying(15),
    email text,
    credit_limit double precision,
    credit_days smallint,
    comment text,
    business_name character varying(200),
    business_address text,
    business_rfc text,
    business_curp text,
    business_postal_code character varying(5),
    business_phone character varying(20),
    business_cell_phone character varying(20),
    website text,
    rfc text,
    curp text,
    category character varying(200),
    type character varying(25),
    business_representative character varying(300)
);


ALTER TABLE "Branch".providers OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 102755)
-- Name: providers_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".providers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".providers_id_seq OWNER TO postgres;

--
-- TOC entry 4166 (class 0 OID 0)
-- Dependencies: 250
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".providers_id_seq OWNED BY "Branch".providers.id;


--
-- TOC entry 251 (class 1259 OID 102756)
-- Name: reservation; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".reservation (
    id bigint NOT NULL,
    id_branches bigint,
    id_tables bigint,
    id_pack_reservation bigint,
    customer_name character varying(100),
    customer_phone character varying(20),
    customer_email text,
    reservation_date date,
    reservation_time timestamp without time zone,
    reason text,
    number_of_adult integer,
    number_of_children integer,
    commentary text,
    status integer
);


ALTER TABLE "Branch".reservation OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 102761)
-- Name: reservation_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".reservation_id_seq OWNER TO postgres;

--
-- TOC entry 4167 (class 0 OID 0)
-- Dependencies: 252
-- Name: reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".reservation_id_seq OWNED BY "Branch".reservation.id;


--
-- TOC entry 253 (class 1259 OID 102762)
-- Name: restaurant_area; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".restaurant_area (
    id bigint NOT NULL,
    id_branches bigint,
    name character varying(30),
    description text,
    floor integer
);


ALTER TABLE "Branch".restaurant_area OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 102767)
-- Name: restaurant_area_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".restaurant_area_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".restaurant_area_id_seq OWNER TO postgres;

--
-- TOC entry 4168 (class 0 OID 0)
-- Dependencies: 254
-- Name: restaurant_area_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".restaurant_area_id_seq OWNED BY "Branch".restaurant_area.id;


--
-- TOC entry 255 (class 1259 OID 102768)
-- Name: tables; Type: TABLE; Schema: Branch; Owner: postgres
--

CREATE TABLE "Branch".tables (
    id bigint NOT NULL,
    id_branches bigint,
    id_restaurant_area bigint,
    name character varying(30),
    table_number integer,
    num_customers smallint DEFAULT 0
);


ALTER TABLE "Branch".tables OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 102772)
-- Name: tables_id_seq; Type: SEQUENCE; Schema: Branch; Owner: postgres
--

CREATE SEQUENCE "Branch".tables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Branch".tables_id_seq OWNER TO postgres;

--
-- TOC entry 4169 (class 0 OID 0)
-- Dependencies: 256
-- Name: tables_id_seq; Type: SEQUENCE OWNED BY; Schema: Branch; Owner: postgres
--

ALTER SEQUENCE "Branch".tables_id_seq OWNED BY "Branch".tables.id;


--
-- TOC entry 313 (class 1259 OID 103590)
-- Name: appointment; Type: TABLE; Schema: CRM; Owner: postgres
--

CREATE TABLE "CRM".appointment (
    id bigint NOT NULL,
    id_prospects bigint,
    location text,
    notes text,
    affair text NOT NULL,
    meeting_date timestamp without time zone NOT NULL,
    duration_in_minutes numeric(10,2),
    id_companies bigint,
    id_branches bigint,
    id_employees bigint,
    end_date timestamp without time zone,
    color text
);


ALTER TABLE "CRM".appointment OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 103589)
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: CRM; Owner: postgres
--

CREATE SEQUENCE "CRM".appointment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "CRM".appointment_id_seq OWNER TO postgres;

--
-- TOC entry 4170 (class 0 OID 0)
-- Dependencies: 312
-- Name: appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: CRM; Owner: postgres
--

ALTER SEQUENCE "CRM".appointment_id_seq OWNED BY "CRM".appointment.id;


--
-- TOC entry 320 (class 1259 OID 111967)
-- Name: history_prospects; Type: TABLE; Schema: CRM; Owner: postgres
--

CREATE TABLE "CRM".history_prospects (
    id bigint NOT NULL,
    id_prospects bigint,
    id_users bigint,
    comment text NOT NULL,
    link text,
    creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "CRM".history_prospects OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 111966)
-- Name: history_prospects_id_seq; Type: SEQUENCE; Schema: CRM; Owner: postgres
--

CREATE SEQUENCE "CRM".history_prospects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "CRM".history_prospects_id_seq OWNER TO postgres;

--
-- TOC entry 4171 (class 0 OID 0)
-- Dependencies: 319
-- Name: history_prospects_id_seq; Type: SEQUENCE OWNED BY; Schema: CRM; Owner: postgres
--

ALTER SEQUENCE "CRM".history_prospects_id_seq OWNED BY "CRM".history_prospects.id;


--
-- TOC entry 309 (class 1259 OID 103574)
-- Name: product_to_sell; Type: TABLE; Schema: CRM; Owner: postgres
--

CREATE TABLE "CRM".product_to_sell (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(40) DEFAULT 'rgba(6, 255, 118, 0.377)'::character varying NOT NULL,
    id_companies bigint
);


ALTER TABLE "CRM".product_to_sell OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 103573)
-- Name: product_to_sell_id_seq; Type: SEQUENCE; Schema: CRM; Owner: postgres
--

CREATE SEQUENCE "CRM".product_to_sell_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "CRM".product_to_sell_id_seq OWNER TO postgres;

--
-- TOC entry 4172 (class 0 OID 0)
-- Dependencies: 308
-- Name: product_to_sell_id_seq; Type: SEQUENCE OWNED BY; Schema: CRM; Owner: postgres
--

ALTER SEQUENCE "CRM".product_to_sell_id_seq OWNED BY "CRM".product_to_sell.id;


--
-- TOC entry 315 (class 1259 OID 103599)
-- Name: prospects; Type: TABLE; Schema: CRM; Owner: postgres
--

CREATE TABLE "CRM".prospects (
    id bigint NOT NULL,
    name character varying(500) NOT NULL,
    email text NOT NULL,
    estimated_income numeric(10,2),
    probability numeric(10,2),
    cellphone character varying(20),
    phone character varying(20),
    grades text,
    planned_closure date,
    creation_date date DEFAULT CURRENT_DATE NOT NULL,
    company_name character varying(255),
    address text,
    website text,
    contact_name character varying(500),
    company_cellphone character varying(20),
    company_phone character varying(20),
    priority smallint DEFAULT 0 NOT NULL,
    color character varying(40),
    id_employees bigint,
    id_product_to_sell bigint,
    id_sales_team bigint,
    id_sales_stage bigint,
    id_companies bigint,
    id_branches bigint,
    type_customer boolean DEFAULT false NOT NULL,
    expected_closing_percentage numeric DEFAULT 0,
    category text,
    salesrep text,
    notes text
);


ALTER TABLE "CRM".prospects OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 103598)
-- Name: prospects_id_seq; Type: SEQUENCE; Schema: CRM; Owner: postgres
--

CREATE SEQUENCE "CRM".prospects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "CRM".prospects_id_seq OWNER TO postgres;

--
-- TOC entry 4173 (class 0 OID 0)
-- Dependencies: 314
-- Name: prospects_id_seq; Type: SEQUENCE OWNED BY; Schema: CRM; Owner: postgres
--

ALTER SEQUENCE "CRM".prospects_id_seq OWNED BY "CRM".prospects.id;


--
-- TOC entry 307 (class 1259 OID 103566)
-- Name: sales_stage; Type: TABLE; Schema: CRM; Owner: postgres
--

CREATE TABLE "CRM".sales_stage (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    "position" smallint DEFAULT 0 NOT NULL,
    id_companies bigint
);


ALTER TABLE "CRM".sales_stage OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 103565)
-- Name: sales_stage_id_seq; Type: SEQUENCE; Schema: CRM; Owner: postgres
--

CREATE SEQUENCE "CRM".sales_stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "CRM".sales_stage_id_seq OWNER TO postgres;

--
-- TOC entry 4174 (class 0 OID 0)
-- Dependencies: 306
-- Name: sales_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: CRM; Owner: postgres
--

ALTER SEQUENCE "CRM".sales_stage_id_seq OWNED BY "CRM".sales_stage.id;


--
-- TOC entry 311 (class 1259 OID 103582)
-- Name: sales_team; Type: TABLE; Schema: CRM; Owner: postgres
--

CREATE TABLE "CRM".sales_team (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    commission numeric(10,2) DEFAULT 0 NOT NULL,
    id_companies bigint
);


ALTER TABLE "CRM".sales_team OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 103581)
-- Name: sales_team_id_seq; Type: SEQUENCE; Schema: CRM; Owner: postgres
--

CREATE SEQUENCE "CRM".sales_team_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "CRM".sales_team_id_seq OWNER TO postgres;

--
-- TOC entry 4175 (class 0 OID 0)
-- Dependencies: 310
-- Name: sales_team_id_seq; Type: SEQUENCE OWNED BY; Schema: CRM; Owner: postgres
--

ALTER SEQUENCE "CRM".sales_team_id_seq OWNED BY "CRM".sales_team.id;


--
-- TOC entry 322 (class 1259 OID 111988)
-- Name: chats; Type: TABLE; Schema: Chat; Owner: postgres
--

CREATE TABLE "Chat".chats (
    id_chat integer NOT NULL,
    chat_name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_one_id text,
    user_two_id text
);


ALTER TABLE "Chat".chats OWNER TO postgres;

--
-- TOC entry 321 (class 1259 OID 111987)
-- Name: chats_id_chat_seq; Type: SEQUENCE; Schema: Chat; Owner: postgres
--

CREATE SEQUENCE "Chat".chats_id_chat_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Chat".chats_id_chat_seq OWNER TO postgres;

--
-- TOC entry 4176 (class 0 OID 0)
-- Dependencies: 321
-- Name: chats_id_chat_seq; Type: SEQUENCE OWNED BY; Schema: Chat; Owner: postgres
--

ALTER SEQUENCE "Chat".chats_id_chat_seq OWNED BY "Chat".chats.id_chat;


--
-- TOC entry 327 (class 1259 OID 112031)
-- Name: message_status; Type: TABLE; Schema: Chat; Owner: postgres
--

CREATE TABLE "Chat".message_status (
    id_status integer NOT NULL,
    message_id integer,
    user_id text,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp without time zone
);


ALTER TABLE "Chat".message_status OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 112030)
-- Name: message_status_id_status_seq; Type: SEQUENCE; Schema: Chat; Owner: postgres
--

CREATE SEQUENCE "Chat".message_status_id_status_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Chat".message_status_id_status_seq OWNER TO postgres;

--
-- TOC entry 4177 (class 0 OID 0)
-- Dependencies: 326
-- Name: message_status_id_status_seq; Type: SEQUENCE OWNED BY; Schema: Chat; Owner: postgres
--

ALTER SEQUENCE "Chat".message_status_id_status_seq OWNED BY "Chat".message_status.id_status;


--
-- TOC entry 325 (class 1259 OID 112011)
-- Name: messages; Type: TABLE; Schema: Chat; Owner: postgres
--

CREATE TABLE "Chat".messages (
    id_message integer NOT NULL,
    chat_id integer,
    user_id text,
    content text NOT NULL,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "Chat".messages OWNER TO postgres;

--
-- TOC entry 324 (class 1259 OID 112010)
-- Name: messages_id_message_seq; Type: SEQUENCE; Schema: Chat; Owner: postgres
--

CREATE SEQUENCE "Chat".messages_id_message_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Chat".messages_id_message_seq OWNER TO postgres;

--
-- TOC entry 4178 (class 0 OID 0)
-- Dependencies: 324
-- Name: messages_id_message_seq; Type: SEQUENCE OWNED BY; Schema: Chat; Owner: postgres
--

ALTER SEQUENCE "Chat".messages_id_message_seq OWNED BY "Chat".messages.id_message;


--
-- TOC entry 323 (class 1259 OID 111995)
-- Name: user_chats; Type: TABLE; Schema: Chat; Owner: postgres
--

CREATE TABLE "Chat".user_chats (
    user_id bigint NOT NULL,
    chat_id integer NOT NULL
);


ALTER TABLE "Chat".user_chats OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 102773)
-- Name: branches; Type: TABLE; Schema: Company; Owner: postgres
--

CREATE TABLE "Company".branches (
    id bigint NOT NULL,
    id_companies bigint,
    name_branch character varying(60) NOT NULL,
    alias character varying(30) NOT NULL,
    representative text,
    id_country bigint,
    municipality text NOT NULL,
    city text NOT NULL,
    cologne text NOT NULL,
    address character varying(40),
    num_ext character varying(8),
    num_int character varying(8),
    postal_code character varying(10) NOT NULL,
    email_branch text NOT NULL,
    cell_phone character varying(24),
    phone character varying(20),
    pack_branch bigint DEFAULT 0 NOT NULL,
    token_uber text,
    token_rappi text,
    website_creation date DEFAULT (CURRENT_DATE + '15 days'::interval),
    digital_menu date DEFAULT (CURRENT_DATE + '15 days'::interval),
    employee_schedules date DEFAULT (CURRENT_DATE + '15 days'::interval)
);


ALTER TABLE "Company".branches OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 102782)
-- Name: branches_id_seq; Type: SEQUENCE; Schema: Company; Owner: postgres
--

CREATE SEQUENCE "Company".branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Company".branches_id_seq OWNER TO postgres;

--
-- TOC entry 4179 (class 0 OID 0)
-- Dependencies: 258
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: Company; Owner: postgres
--

ALTER SEQUENCE "Company".branches_id_seq OWNED BY "Company".branches.id;


--
-- TOC entry 259 (class 1259 OID 102783)
-- Name: customers; Type: TABLE; Schema: Company; Owner: postgres
--

CREATE TABLE "Company".customers (
    id bigint NOT NULL,
    id_companies bigint,
    first_name character varying(50) NOT NULL,
    second_name character varying(50),
    last_name character varying(300),
    id_country bigint,
    states text NOT NULL,
    city text NOT NULL,
    street text NOT NULL,
    num_ext character varying(8),
    num_int character varying(8),
    postal_code character varying(10),
    email text NOT NULL,
    phone character varying(20),
    cell_phone character varying(20),
    points smallint,
    birthday date,
    company_name character varying(255),
    company_address text,
    website text,
    contact_name character varying(255),
    company_cellphone character varying(20),
    company_phone character varying(20),
    type_customer boolean DEFAULT false
);


ALTER TABLE "Company".customers OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 102788)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: Company; Owner: postgres
--

CREATE SEQUENCE "Company".customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Company".customers_id_seq OWNER TO postgres;

--
-- TOC entry 4180 (class 0 OID 0)
-- Dependencies: 260
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: Company; Owner: postgres
--

ALTER SEQUENCE "Company".customers_id_seq OWNED BY "Company".customers.id;


--
-- TOC entry 261 (class 1259 OID 102789)
-- Name: employees; Type: TABLE; Schema: Company; Owner: postgres
--

CREATE TABLE "Company".employees (
    id bigint NOT NULL,
    id_companies bigint,
    id_users bigint,
    id_roles_employees bigint,
    id_departments_employees bigint,
    id_branches bigint,
    city character varying(100),
    street character varying(200),
    num_ext character varying(5),
    num_int character varying(5),
    id_country bigint,
    phone character varying(15),
    cell_phone character varying(15),
    nip character varying(6) DEFAULT '0000'::character varying
);


ALTER TABLE "Company".employees OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 102793)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: Company; Owner: postgres
--

CREATE SEQUENCE "Company".employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Company".employees_id_seq OWNER TO postgres;

--
-- TOC entry 4181 (class 0 OID 0)
-- Dependencies: 262
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: Company; Owner: postgres
--

ALTER SEQUENCE "Company".employees_id_seq OWNED BY "Company".employees.id;


--
-- TOC entry 263 (class 1259 OID 102794)
-- Name: departments_employees; Type: TABLE; Schema: Employee; Owner: postgres
--

CREATE TABLE "Employee".departments_employees (
    id bigint NOT NULL,
    id_companies bigint,
    description text,
    name_departaments character varying(100) NOT NULL
);


ALTER TABLE "Employee".departments_employees OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 102799)
-- Name: departments_employees_id_seq; Type: SEQUENCE; Schema: Employee; Owner: postgres
--

CREATE SEQUENCE "Employee".departments_employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Employee".departments_employees_id_seq OWNER TO postgres;

--
-- TOC entry 4182 (class 0 OID 0)
-- Dependencies: 264
-- Name: departments_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: Employee; Owner: postgres
--

ALTER SEQUENCE "Employee".departments_employees_id_seq OWNED BY "Employee".departments_employees.id;


--
-- TOC entry 265 (class 1259 OID 102800)
-- Name: history_schedules; Type: TABLE; Schema: Employee; Owner: postgres
--

CREATE TABLE "Employee".history_schedules (
    id bigint NOT NULL,
    id_branches bigint,
    id_employees bigint,
    id_schedules bigint,
    date_finish date NOT NULL,
    date_start date NOT NULL
);


ALTER TABLE "Employee".history_schedules OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 102803)
-- Name: history_schedules_id_seq; Type: SEQUENCE; Schema: Employee; Owner: postgres
--

CREATE SEQUENCE "Employee".history_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Employee".history_schedules_id_seq OWNER TO postgres;

--
-- TOC entry 4183 (class 0 OID 0)
-- Dependencies: 266
-- Name: history_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: Employee; Owner: postgres
--

ALTER SEQUENCE "Employee".history_schedules_id_seq OWNED BY "Employee".history_schedules.id;


--
-- TOC entry 267 (class 1259 OID 102804)
-- Name: roles_employees; Type: TABLE; Schema: Employee; Owner: postgres
--

CREATE TABLE "Employee".roles_employees (
    id bigint NOT NULL,
    id_companies bigint NOT NULL,
    name_role character varying(30) NOT NULL,
    commissions double precision NOT NULL,
    salary double precision,
    discount_for_product double precision,
    add_box boolean DEFAULT false NOT NULL,
    edit_box boolean DEFAULT false NOT NULL,
    delete_box boolean DEFAULT false NOT NULL,
    create_reservation boolean DEFAULT false NOT NULL,
    view_reservation boolean DEFAULT false NOT NULL,
    view_reports boolean DEFAULT false NOT NULL,
    add_customer boolean DEFAULT false NOT NULL,
    edit_customer boolean DEFAULT false NOT NULL,
    delete_customer boolean DEFAULT false NOT NULL,
    cancel_debt boolean DEFAULT false NOT NULL,
    offer_loan boolean DEFAULT false NOT NULL,
    get_fertilizer boolean DEFAULT false NOT NULL,
    view_customer_credits boolean DEFAULT false NOT NULL,
    send_email boolean DEFAULT false NOT NULL,
    add_employee boolean DEFAULT false NOT NULL,
    edit_employee boolean DEFAULT false NOT NULL,
    delete_employee boolean DEFAULT false NOT NULL,
    create_schedule boolean DEFAULT false NOT NULL,
    assign_schedule boolean DEFAULT false NOT NULL,
    view_schedule boolean DEFAULT false NOT NULL,
    create_type_user boolean DEFAULT false NOT NULL,
    create_employee_department boolean DEFAULT false NOT NULL,
    view_sale_history boolean DEFAULT false NOT NULL,
    delete_sale_history boolean DEFAULT false NOT NULL,
    view_movement_history boolean DEFAULT false NOT NULL,
    delete_movement_history boolean DEFAULT false NOT NULL,
    view_supplies boolean DEFAULT false NOT NULL,
    add_supplies boolean DEFAULT false NOT NULL,
    edit_supplies boolean DEFAULT false NOT NULL,
    delete_supplies boolean DEFAULT false NOT NULL,
    view_products boolean DEFAULT false NOT NULL,
    edit_products boolean DEFAULT false NOT NULL,
    delete_products boolean DEFAULT false NOT NULL,
    view_combo boolean DEFAULT false NOT NULL,
    add_combo boolean DEFAULT false NOT NULL,
    edit_combo boolean DEFAULT false NOT NULL,
    delete_combo boolean DEFAULT false NOT NULL,
    view_food_departament boolean DEFAULT false NOT NULL,
    add_food_departament boolean DEFAULT false NOT NULL,
    edit_food_departament boolean DEFAULT false NOT NULL,
    delete_food_departament boolean DEFAULT false NOT NULL,
    view_food_category boolean DEFAULT false NOT NULL,
    add_food_category boolean DEFAULT false NOT NULL,
    edit_food_category boolean DEFAULT false NOT NULL,
    delete_food_category boolean DEFAULT false NOT NULL,
    waste_report boolean DEFAULT false NOT NULL,
    add_provider boolean DEFAULT false NOT NULL,
    edit_provider boolean DEFAULT false NOT NULL,
    delete_provider boolean DEFAULT false NOT NULL,
    view_provider boolean DEFAULT false NOT NULL,
    sell boolean DEFAULT false NOT NULL,
    apply_discount boolean DEFAULT false NOT NULL,
    apply_returns boolean DEFAULT false NOT NULL,
    add_offers boolean DEFAULT false NOT NULL,
    edit_offers boolean DEFAULT false NOT NULL,
    delete_offers boolean DEFAULT false NOT NULL,
    change_coins boolean DEFAULT false NOT NULL,
    modify_hardware boolean DEFAULT false NOT NULL,
    modify_hardware_kitchen boolean DEFAULT false NOT NULL,
    give_permissions boolean DEFAULT false NOT NULL,
    currency character varying(10),
    type_of_salary character varying(15),
    app_point_sales boolean DEFAULT false NOT NULL,
    view_inventory boolean DEFAULT false NOT NULL,
    edit_inventory boolean DEFAULT false NOT NULL,
    employee_roles boolean DEFAULT true NOT NULL,
    edit_rol_employee boolean DEFAULT true NOT NULL,
    delete_rol_employee boolean DEFAULT true NOT NULL,
    employee_department boolean DEFAULT true NOT NULL,
    edit_employee_department boolean DEFAULT true NOT NULL,
    delete_employee_department boolean DEFAULT true NOT NULL,
    add_employee_roles boolean DEFAULT true NOT NULL,
    add_employee_department boolean DEFAULT true NOT NULL,
    view_employee boolean DEFAULT true NOT NULL
);


ALTER TABLE "Employee".roles_employees OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 102867)
-- Name: roles_employees_id_seq; Type: SEQUENCE; Schema: Employee; Owner: postgres
--

CREATE SEQUENCE "Employee".roles_employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Employee".roles_employees_id_seq OWNER TO postgres;

--
-- TOC entry 4184 (class 0 OID 0)
-- Dependencies: 268
-- Name: roles_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: Employee; Owner: postgres
--

ALTER SEQUENCE "Employee".roles_employees_id_seq OWNED BY "Employee".roles_employees.id;


--
-- TOC entry 269 (class 1259 OID 102868)
-- Name: schedules; Type: TABLE; Schema: Employee; Owner: postgres
--

CREATE TABLE "Employee".schedules (
    id bigint NOT NULL,
    id_branches bigint,
    color character varying(10),
    name character varying(100),
    monday boolean,
    tuesday boolean,
    wednesday boolean,
    thursday boolean,
    friday boolean,
    saturday boolean,
    sunday boolean,
    ms time without time zone,
    mf time without time zone,
    ts time without time zone,
    tf time without time zone,
    ws time without time zone,
    wf time without time zone,
    ths time without time zone,
    thf time without time zone,
    fs time without time zone,
    ff time without time zone,
    sas time without time zone,
    saf time without time zone,
    sus time without time zone,
    suf time without time zone,
    time_worked character varying(10),
    tolerance_time integer
);


ALTER TABLE "Employee".schedules OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 102871)
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: Employee; Owner: postgres
--

CREATE SEQUENCE "Employee".schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Employee".schedules_id_seq OWNER TO postgres;

--
-- TOC entry 4185 (class 0 OID 0)
-- Dependencies: 270
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: Employee; Owner: postgres
--

ALTER SEQUENCE "Employee".schedules_id_seq OWNED BY "Employee".schedules.id;


--
-- TOC entry 271 (class 1259 OID 102872)
-- Name: country; Type: TABLE; Schema: Fud; Owner: postgres
--

CREATE TABLE "Fud".country (
    id bigint NOT NULL,
    name character varying(50)
);


ALTER TABLE "Fud".country OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 102875)
-- Name: country_id_seq; Type: SEQUENCE; Schema: Fud; Owner: postgres
--

CREATE SEQUENCE "Fud".country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Fud".country_id_seq OWNER TO postgres;

--
-- TOC entry 4186 (class 0 OID 0)
-- Dependencies: 272
-- Name: country_id_seq; Type: SEQUENCE OWNED BY; Schema: Fud; Owner: postgres
--

ALTER SEQUENCE "Fud".country_id_seq OWNED BY "Fud".country.id;


--
-- TOC entry 273 (class 1259 OID 102876)
-- Name: packs_fud; Type: TABLE; Schema: Fud; Owner: postgres
--

CREATE TABLE "Fud".packs_fud (
    id smallint NOT NULL,
    description text
);


ALTER TABLE "Fud".packs_fud OWNER TO postgres;

--
-- TOC entry 4187 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN packs_fud.id; Type: COMMENT; Schema: Fud; Owner: postgres
--

COMMENT ON COLUMN "Fud".packs_fud.id IS 'This is the pack that the user need 0-free (user) 1-pack1, 2-pack 2, 3-pack 3';


--
-- TOC entry 274 (class 1259 OID 102881)
-- Name: session ; Type: TABLE; Schema: Fud; Owner: postgres
--

CREATE TABLE "Fud"."session " (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone
);


ALTER TABLE "Fud"."session " OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 102886)
-- Name: tokens; Type: TABLE; Schema: Fud; Owner: postgres
--

CREATE TABLE "Fud".tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiry_time timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '00:05:00'::interval) NOT NULL
);


ALTER TABLE "Fud".tokens OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 102893)
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: Fud; Owner: postgres
--

CREATE SEQUENCE "Fud".tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Fud".tokens_id_seq OWNER TO postgres;

--
-- TOC entry 4188 (class 0 OID 0)
-- Dependencies: 276
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: Fud; Owner: postgres
--

ALTER SEQUENCE "Fud".tokens_id_seq OWNED BY "Fud".tokens.id;


--
-- TOC entry 277 (class 1259 OID 102894)
-- Name: users; Type: TABLE; Schema: Fud; Owner: postgres
--

CREATE TABLE "Fud".users (
    id bigint NOT NULL,
    photo text,
    user_name character varying(200) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    first_name character varying(100) NOT NULL,
    second_name character varying(100),
    last_name character varying(100) NOT NULL,
    rol_user smallint DEFAULT 2 NOT NULL,
    id_packs_fud smallint,
    language character varying(5),
    pack_database smallint DEFAULT 0,
    pack_branch smallint DEFAULT 0,
    navbar_1 smallint DEFAULT 0,
    navbar_2 smallint,
    navbar_3 smallint,
    edit_branch boolean DEFAULT true NOT NULL
);


ALTER TABLE "Fud".users OWNER TO postgres;

--
-- TOC entry 4189 (class 0 OID 0)
-- Dependencies: 277
-- Name: COLUMN users.rol_user; Type: COMMENT; Schema: Fud; Owner: postgres
--

COMMENT ON COLUMN "Fud".users.rol_user IS '0--customer,1--emplooyes,2--manager,3---CEO';


--
-- TOC entry 4190 (class 0 OID 0)
-- Dependencies: 277
-- Name: COLUMN users.id_packs_fud; Type: COMMENT; Schema: Fud; Owner: postgres
--

COMMENT ON COLUMN "Fud".users.id_packs_fud IS 'This is the pack that the user need 0-free (user) 1-pack1, 2-pack 2, 3-pack 3';


--
-- TOC entry 278 (class 1259 OID 102901)
-- Name: users_id_seq; Type: SEQUENCE; Schema: Fud; Owner: postgres
--

CREATE SEQUENCE "Fud".users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Fud".users_id_seq OWNER TO postgres;

--
-- TOC entry 4191 (class 0 OID 0)
-- Dependencies: 278
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: Fud; Owner: postgres
--

ALTER SEQUENCE "Fud".users_id_seq OWNED BY "Fud".users.id;


--
-- TOC entry 330 (class 1259 OID 112290)
-- Name: boutique; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".boutique (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    barcode text NOT NULL,
    description text,
    use_inventory boolean,
    max_inventary smallint,
    min_inventory smallint DEFAULT 0,
    purchase_price double precision,
    purchase_sale double precision,
    id_companies bigint,
    id_branches bigint
);


ALTER TABLE "Inventory".boutique OWNER TO postgres;

--
-- TOC entry 329 (class 1259 OID 112289)
-- Name: boutique_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".boutique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".boutique_id_seq OWNER TO postgres;

--
-- TOC entry 4192 (class 0 OID 0)
-- Dependencies: 329
-- Name: boutique_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".boutique_id_seq OWNED BY "Inventory".boutique.id;


--
-- TOC entry 279 (class 1259 OID 102902)
-- Name: dish_and_combo_features; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".dish_and_combo_features (
    id bigint NOT NULL,
    id_companies bigint,
    id_branches bigint,
    id_dishes_and_combos bigint,
    price_1 double precision NOT NULL,
    revenue_1 double precision NOT NULL,
    price_2 double precision,
    revenue_2 double precision,
    price_3 double precision,
    revenue_3 double precision,
    favorites boolean,
    sat_key text,
    purchase_unit character varying(12) NOT NULL,
    existence double precision,
    amount double precision NOT NULL,
    product_cost double precision NOT NULL,
    id_providers bigint,
    is_product boolean DEFAULT false NOT NULL
);


ALTER TABLE "Inventory".dish_and_combo_features OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 102907)
-- Name: dish_and_combo_features_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".dish_and_combo_features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".dish_and_combo_features_id_seq OWNER TO postgres;

--
-- TOC entry 4193 (class 0 OID 0)
-- Dependencies: 280
-- Name: dish_and_combo_features_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".dish_and_combo_features_id_seq OWNED BY "Inventory".dish_and_combo_features.id;


--
-- TOC entry 336 (class 1259 OID 112670)
-- Name: lots; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".lots (
    id bigint NOT NULL,
    number_lote text,
    initial_existence double precision,
    current_existence double precision NOT NULL,
    date_of_manufacture date NOT NULL,
    expiration_date date NOT NULL,
    id_dish_and_combo_features bigint,
    id_branches bigint,
    id_companies bigint
);


ALTER TABLE "Inventory".lots OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 112669)
-- Name: lots_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".lots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".lots_id_seq OWNER TO postgres;

--
-- TOC entry 4194 (class 0 OID 0)
-- Dependencies: 335
-- Name: lots_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".lots_id_seq OWNED BY "Inventory".lots.id;


--
-- TOC entry 281 (class 1259 OID 102908)
-- Name: product_and_suppiles_features; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".product_and_suppiles_features (
    id bigint NOT NULL,
    id_branches bigint,
    sale_price double precision,
    max_inventary double precision,
    minimum_inventory double precision,
    existence double precision,
    purchase_amount double precision,
    purchase_price double precision,
    sale_amount double precision,
    id_products_and_supplies bigint,
    currency_purchase character varying(10),
    currency_sale character varying(10),
    unit_inventory character varying(10),
    purchase_unity character varying(10),
    sale_unity character varying(10)
);


ALTER TABLE "Inventory".product_and_suppiles_features OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 102911)
-- Name: product_and_suppiles_features_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".product_and_suppiles_features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".product_and_suppiles_features_id_seq OWNER TO postgres;

--
-- TOC entry 4195 (class 0 OID 0)
-- Dependencies: 282
-- Name: product_and_suppiles_features_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".product_and_suppiles_features_id_seq OWNED BY "Inventory".product_and_suppiles_features.id;


--
-- TOC entry 342 (class 1259 OID 121103)
-- Name: promotions; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".promotions (
    id bigint NOT NULL,
    id_companies bigint,
    id_branches bigint,
    id_dish_and_combo_features bigint,
    active_promotion boolean DEFAULT true NOT NULL,
    name_promotion character varying(300) NOT NULL,
    "fromTime" time without time zone,
    "toTime" time without time zone,
    promotions_from double precision NOT NULL,
    promotions_to double precision NOT NULL,
    discount_percentage double precision NOT NULL,
    date_from date,
    date_to date
);


ALTER TABLE "Inventory".promotions OWNER TO postgres;

--
-- TOC entry 341 (class 1259 OID 121102)
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".promotions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".promotions_id_seq OWNER TO postgres;

--
-- TOC entry 4196 (class 0 OID 0)
-- Dependencies: 341
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".promotions_id_seq OWNED BY "Inventory".promotions.id;


--
-- TOC entry 332 (class 1259 OID 112302)
-- Name: table_boutique; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".table_boutique (
    id bigint NOT NULL,
    id_boutique bigint,
    id_dish_and_combo_features bigint,
    id_product_and_suppiles_features bigint
);


ALTER TABLE "Inventory".table_boutique OWNER TO postgres;

--
-- TOC entry 331 (class 1259 OID 112301)
-- Name: table_boutique_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".table_boutique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".table_boutique_id_seq OWNER TO postgres;

--
-- TOC entry 4197 (class 0 OID 0)
-- Dependencies: 331
-- Name: table_boutique_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".table_boutique_id_seq OWNED BY "Inventory".table_boutique.id;


--
-- TOC entry 283 (class 1259 OID 102912)
-- Name: table_supplies_dish; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".table_supplies_dish (
    id bigint NOT NULL,
    id_dish_and_combo_features bigint,
    id_product_and_suppiles_features bigint,
    amount double precision,
    unity integer
);


ALTER TABLE "Inventory".table_supplies_dish OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 102915)
-- Name: table_supplies_dish_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".table_supplies_dish_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".table_supplies_dish_id_seq OWNER TO postgres;

--
-- TOC entry 4198 (class 0 OID 0)
-- Dependencies: 284
-- Name: table_supplies_dish_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".table_supplies_dish_id_seq OWNED BY "Inventory".table_supplies_dish.id;


--
-- TOC entry 285 (class 1259 OID 102916)
-- Name: table_taxes; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".table_taxes (
    id bigint NOT NULL,
    id_taxes bigint,
    id_dishes_and_combos bigint
);


ALTER TABLE "Inventory".table_taxes OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 102919)
-- Name: table_taxes_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".table_taxes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".table_taxes_id_seq OWNER TO postgres;

--
-- TOC entry 4199 (class 0 OID 0)
-- Dependencies: 286
-- Name: table_taxes_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".table_taxes_id_seq OWNED BY "Inventory".table_taxes.id;


--
-- TOC entry 287 (class 1259 OID 102920)
-- Name: taxes; Type: TABLE; Schema: Inventory; Owner: postgres
--

CREATE TABLE "Inventory".taxes (
    id bigint NOT NULL,
    name character varying(100),
    price_taxe double precision,
    local_taxe boolean,
    type_taxe integer,
    accounting_account text
);


ALTER TABLE "Inventory".taxes OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 102925)
-- Name: taxes_id_seq; Type: SEQUENCE; Schema: Inventory; Owner: postgres
--

CREATE SEQUENCE "Inventory".taxes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Inventory".taxes_id_seq OWNER TO postgres;

--
-- TOC entry 4200 (class 0 OID 0)
-- Dependencies: 288
-- Name: taxes_id_seq; Type: SEQUENCE OWNED BY; Schema: Inventory; Owner: postgres
--

ALTER SEQUENCE "Inventory".taxes_id_seq OWNED BY "Inventory".taxes.id;


--
-- TOC entry 289 (class 1259 OID 102926)
-- Name: dishes_and_combos; Type: TABLE; Schema: Kitchen; Owner: postgres
--

CREATE TABLE "Kitchen".dishes_and_combos (
    id_companies bigint,
    img text,
    name character varying(100),
    description text,
    barcode text,
    id_product_department bigint,
    id_product_category bigint,
    id integer NOT NULL,
    is_a_product boolean DEFAULT false NOT NULL,
    this_product_is_sold_in_bulk boolean DEFAULT false,
    this_product_need_recipe boolean DEFAULT false
);


ALTER TABLE "Kitchen".dishes_and_combos OWNER TO postgres;

--
-- TOC entry 328 (class 1259 OID 112100)
-- Name: dishes_and_combos_id_seq; Type: SEQUENCE; Schema: Kitchen; Owner: postgres
--

ALTER TABLE "Kitchen".dishes_and_combos ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "Kitchen".dishes_and_combos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 290 (class 1259 OID 102931)
-- Name: dishes_and_combos_id_serial_seq1; Type: SEQUENCE; Schema: Kitchen; Owner: postgres
--

CREATE SEQUENCE "Kitchen".dishes_and_combos_id_serial_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Kitchen".dishes_and_combos_id_serial_seq1 OWNER TO postgres;

--
-- TOC entry 4201 (class 0 OID 0)
-- Dependencies: 290
-- Name: dishes_and_combos_id_serial_seq1; Type: SEQUENCE OWNED BY; Schema: Kitchen; Owner: postgres
--

ALTER SEQUENCE "Kitchen".dishes_and_combos_id_serial_seq1 OWNED BY "Kitchen".dishes_and_combos.id;


--
-- TOC entry 291 (class 1259 OID 102932)
-- Name: product_category; Type: TABLE; Schema: Kitchen; Owner: postgres
--

CREATE TABLE "Kitchen".product_category (
    id bigint NOT NULL,
    id_companies bigint,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE "Kitchen".product_category OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 102937)
-- Name: product_category_id_seq; Type: SEQUENCE; Schema: Kitchen; Owner: postgres
--

CREATE SEQUENCE "Kitchen".product_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Kitchen".product_category_id_seq OWNER TO postgres;

--
-- TOC entry 4202 (class 0 OID 0)
-- Dependencies: 292
-- Name: product_category_id_seq; Type: SEQUENCE OWNED BY; Schema: Kitchen; Owner: postgres
--

ALTER SEQUENCE "Kitchen".product_category_id_seq OWNED BY "Kitchen".product_category.id;


--
-- TOC entry 293 (class 1259 OID 102938)
-- Name: product_department; Type: TABLE; Schema: Kitchen; Owner: postgres
--

CREATE TABLE "Kitchen".product_department (
    id bigint NOT NULL,
    id_companies bigint,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE "Kitchen".product_department OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 102943)
-- Name: product_department_id_seq; Type: SEQUENCE; Schema: Kitchen; Owner: postgres
--

CREATE SEQUENCE "Kitchen".product_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Kitchen".product_department_id_seq OWNER TO postgres;

--
-- TOC entry 4203 (class 0 OID 0)
-- Dependencies: 294
-- Name: product_department_id_seq; Type: SEQUENCE OWNED BY; Schema: Kitchen; Owner: postgres
--

ALTER SEQUENCE "Kitchen".product_department_id_seq OWNED BY "Kitchen".product_department.id;


--
-- TOC entry 295 (class 1259 OID 102944)
-- Name: products_and_supplies; Type: TABLE; Schema: Kitchen; Owner: postgres
--

CREATE TABLE "Kitchen".products_and_supplies (
    id bigint NOT NULL,
    id_companies bigint,
    img text,
    barcode character varying(300) NOT NULL,
    name character varying(60) NOT NULL,
    description text,
    use_inventory boolean,
    supplies boolean
);


ALTER TABLE "Kitchen".products_and_supplies OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 102949)
-- Name: products_and_supplies_id_seq; Type: SEQUENCE; Schema: Kitchen; Owner: postgres
--

CREATE SEQUENCE "Kitchen".products_and_supplies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Kitchen".products_and_supplies_id_seq OWNER TO postgres;

--
-- TOC entry 4204 (class 0 OID 0)
-- Dependencies: 296
-- Name: products_and_supplies_id_seq; Type: SEQUENCE OWNED BY; Schema: Kitchen; Owner: postgres
--

ALTER SEQUENCE "Kitchen".products_and_supplies_id_seq OWNED BY "Kitchen".products_and_supplies.id;


--
-- TOC entry 297 (class 1259 OID 102950)
-- Name: screen; Type: TABLE; Schema: Kitchen; Owner: postgres
--

CREATE TABLE "Kitchen".screen (
    ip inet NOT NULL,
    id_branches bigint
);


ALTER TABLE "Kitchen".screen OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 102955)
-- Name: table_supplies_combo; Type: TABLE; Schema: Kitchen; Owner: postgres
--

CREATE TABLE "Kitchen".table_supplies_combo (
    id bigint NOT NULL,
    id_dishes_and_combos bigint NOT NULL,
    id_products_and_supplies bigint NOT NULL,
    unity character varying(10),
    amount double precision,
    food_waste double precision DEFAULT 0,
    additional boolean DEFAULT false NOT NULL
);


ALTER TABLE "Kitchen".table_supplies_combo OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 102960)
-- Name: table_supplies_combo_id_seq; Type: SEQUENCE; Schema: Kitchen; Owner: postgres
--

CREATE SEQUENCE "Kitchen".table_supplies_combo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Kitchen".table_supplies_combo_id_seq OWNER TO postgres;

--
-- TOC entry 4205 (class 0 OID 0)
-- Dependencies: 299
-- Name: table_supplies_combo_id_seq; Type: SEQUENCE OWNED BY; Schema: Kitchen; Owner: postgres
--

ALTER SEQUENCE "Kitchen".table_supplies_combo_id_seq OWNED BY "Kitchen".table_supplies_combo.id;


--
-- TOC entry 300 (class 1259 OID 102961)
-- Name: branch; Type: TABLE; Schema: Settings; Owner: postgres
--

CREATE TABLE "Settings".branch (
    id bigint NOT NULL
);


ALTER TABLE "Settings".branch OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 102964)
-- Name: company; Type: TABLE; Schema: Settings; Owner: postgres
--

CREATE TABLE "Settings".company (
    color_company smallint
);


ALTER TABLE "Settings".company OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 102967)
-- Name: companies; Type: TABLE; Schema: User; Owner: postgres
--

CREATE TABLE "User".companies (
    id bigint NOT NULL,
    id_users bigint,
    path_logo text,
    email_company character varying(100),
    alias character varying(100),
    description text,
    representative text,
    ceo text,
    id_country bigint,
    states text,
    municipality text,
    city text,
    cologne text,
    address character varying(50),
    num_int character varying(5),
    num_ext character varying(5),
    postal_code character varying(30),
    email character varying(100),
    cell_phone character varying(20),
    phone character varying(20),
    name character varying(100),
    pack_database bigint DEFAULT 0 NOT NULL,
    number_of_devices integer DEFAULT 1 NOT NULL
);


ALTER TABLE "User".companies OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 102973)
-- Name: companies_id_seq; Type: SEQUENCE; Schema: User; Owner: postgres
--

CREATE SEQUENCE "User".companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "User".companies_id_seq OWNER TO postgres;

--
-- TOC entry 4206 (class 0 OID 0)
-- Dependencies: 303
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: User; Owner: postgres
--

ALTER SEQUENCE "User".companies_id_seq OWNED BY "User".companies.id;


--
-- TOC entry 304 (class 1259 OID 102974)
-- Name: subscription; Type: TABLE; Schema: User; Owner: postgres
--

CREATE TABLE "User".subscription (
    id text NOT NULL,
    id_users bigint,
    id_companies bigint,
    id_branches bigint,
    id_packs_fud smallint,
    initial_date date,
    final_date date
);


ALTER TABLE "User".subscription OWNER TO postgres;

--
-- TOC entry 4207 (class 0 OID 0)
-- Dependencies: 304
-- Name: COLUMN subscription.id_packs_fud; Type: COMMENT; Schema: User; Owner: postgres
--

COMMENT ON COLUMN "User".subscription.id_packs_fud IS 'This is the pack that the user need 0-free (user) 1-pack1, 2-pack 2, 3-pack 3';


--
-- TOC entry 318 (class 1259 OID 103741)
-- Name: alumnos; Type: TABLE; Schema: _company_1_branch_8; Owner: postgres
--

CREATE TABLE _company_1_branch_8.alumnos (
    id integer NOT NULL,
    nombre text
);


ALTER TABLE _company_1_branch_8.alumnos OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 103740)
-- Name: alumnos_id_seq; Type: SEQUENCE; Schema: _company_1_branch_8; Owner: postgres
--

CREATE SEQUENCE _company_1_branch_8.alumnos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE _company_1_branch_8.alumnos_id_seq OWNER TO postgres;

--
-- TOC entry 4208 (class 0 OID 0)
-- Dependencies: 317
-- Name: alumnos_id_seq; Type: SEQUENCE OWNED BY; Schema: _company_1_branch_8; Owner: postgres
--

ALTER SEQUENCE _company_1_branch_8.alumnos_id_seq OWNED BY _company_1_branch_8.alumnos.id;


--
-- TOC entry 316 (class 1259 OID 103730)
-- Name: apps; Type: TABLE; Schema: _company_1_branch_8; Owner: postgres
--

CREATE TABLE _company_1_branch_8.apps (
    id text NOT NULL,
    id_company integer DEFAULT 1 NOT NULL,
    id_branch integer DEFAULT 8 NOT NULL,
    icon text,
    name character varying(20) NOT NULL,
    description text,
    labels text,
    code_table text NOT NULL
);


ALTER TABLE _company_1_branch_8.apps OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 102979)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 3647 (class 2604 OID 112640)
-- Name: box_history id; Type: DEFAULT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".box_history ALTER COLUMN id SET DEFAULT nextval('"Box".box_history_id_seq'::regclass);


--
-- TOC entry 3487 (class 2604 OID 102984)
-- Name: sales_history id; Type: DEFAULT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".sales_history ALTER COLUMN id SET DEFAULT nextval('"Box".sales_history_id_seq'::regclass);


--
-- TOC entry 3488 (class 2604 OID 102985)
-- Name: Ad id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch"."Ad" ALTER COLUMN id SET DEFAULT nextval('"Branch"."Ad_id_seq"'::regclass);


--
-- TOC entry 3489 (class 2604 OID 102986)
-- Name: app id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".app ALTER COLUMN id SET DEFAULT nextval('"Branch".app_id_seq'::regclass);


--
-- TOC entry 3494 (class 2604 OID 102987)
-- Name: billing_information id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".billing_information ALTER COLUMN id SET DEFAULT nextval('"Branch".billing_information_id_seq'::regclass);


--
-- TOC entry 3495 (class 2604 OID 102988)
-- Name: boxes id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".boxes ALTER COLUMN id SET DEFAULT nextval('"Branch".boxes_id_seq'::regclass);


--
-- TOC entry 3496 (class 2604 OID 102989)
-- Name: commanders id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".commanders ALTER COLUMN id SET DEFAULT nextval('"Branch".commanders_id_seq'::regclass);


--
-- TOC entry 3652 (class 2604 OID 112931)
-- Name: history_move_lot id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".history_move_lot ALTER COLUMN id SET DEFAULT nextval('"Branch".history_move_lot_id_seq'::regclass);


--
-- TOC entry 3499 (class 2604 OID 102990)
-- Name: managers id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".managers ALTER COLUMN id SET DEFAULT nextval('"Branch".managers_id_seq'::regclass);


--
-- TOC entry 3500 (class 2604 OID 102991)
-- Name: order id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch"."order" ALTER COLUMN id SET DEFAULT nextval('"Branch".order_id_seq'::regclass);


--
-- TOC entry 3502 (class 2604 OID 102992)
-- Name: pack_reservation id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".pack_reservation ALTER COLUMN id SET DEFAULT nextval('"Branch".pack_reservation_id_seq'::regclass);


--
-- TOC entry 3651 (class 2604 OID 112836)
-- Name: prescription id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription ALTER COLUMN id SET DEFAULT nextval('"Branch".prescription_id_seq'::regclass);


--
-- TOC entry 3503 (class 2604 OID 102993)
-- Name: providers id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".providers ALTER COLUMN id SET DEFAULT nextval('"Branch".providers_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 102994)
-- Name: reservation id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".reservation ALTER COLUMN id SET DEFAULT nextval('"Branch".reservation_id_seq'::regclass);


--
-- TOC entry 3505 (class 2604 OID 102995)
-- Name: restaurant_area id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".restaurant_area ALTER COLUMN id SET DEFAULT nextval('"Branch".restaurant_area_id_seq'::regclass);


--
-- TOC entry 3506 (class 2604 OID 102996)
-- Name: tables id; Type: DEFAULT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".tables ALTER COLUMN id SET DEFAULT nextval('"Branch".tables_id_seq'::regclass);


--
-- TOC entry 3627 (class 2604 OID 103593)
-- Name: appointment id; Type: DEFAULT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".appointment ALTER COLUMN id SET DEFAULT nextval('"CRM".appointment_id_seq'::regclass);


--
-- TOC entry 3636 (class 2604 OID 111970)
-- Name: history_prospects id; Type: DEFAULT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".history_prospects ALTER COLUMN id SET DEFAULT nextval('"CRM".history_prospects_id_seq'::regclass);


--
-- TOC entry 3623 (class 2604 OID 103577)
-- Name: product_to_sell id; Type: DEFAULT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".product_to_sell ALTER COLUMN id SET DEFAULT nextval('"CRM".product_to_sell_id_seq'::regclass);


--
-- TOC entry 3628 (class 2604 OID 103602)
-- Name: prospects id; Type: DEFAULT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".prospects ALTER COLUMN id SET DEFAULT nextval('"CRM".prospects_id_seq'::regclass);


--
-- TOC entry 3621 (class 2604 OID 103569)
-- Name: sales_stage id; Type: DEFAULT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".sales_stage ALTER COLUMN id SET DEFAULT nextval('"CRM".sales_stage_id_seq'::regclass);


--
-- TOC entry 3625 (class 2604 OID 103585)
-- Name: sales_team id; Type: DEFAULT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".sales_team ALTER COLUMN id SET DEFAULT nextval('"CRM".sales_team_id_seq'::regclass);


--
-- TOC entry 3638 (class 2604 OID 111991)
-- Name: chats id_chat; Type: DEFAULT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".chats ALTER COLUMN id_chat SET DEFAULT nextval('"Chat".chats_id_chat_seq'::regclass);


--
-- TOC entry 3642 (class 2604 OID 112034)
-- Name: message_status id_status; Type: DEFAULT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".message_status ALTER COLUMN id_status SET DEFAULT nextval('"Chat".message_status_id_status_seq'::regclass);


--
-- TOC entry 3640 (class 2604 OID 112014)
-- Name: messages id_message; Type: DEFAULT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".messages ALTER COLUMN id_message SET DEFAULT nextval('"Chat".messages_id_message_seq'::regclass);


--
-- TOC entry 3508 (class 2604 OID 102997)
-- Name: branches id; Type: DEFAULT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".branches ALTER COLUMN id SET DEFAULT nextval('"Company".branches_id_seq'::regclass);


--
-- TOC entry 3513 (class 2604 OID 102998)
-- Name: customers id; Type: DEFAULT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".customers ALTER COLUMN id SET DEFAULT nextval('"Company".customers_id_seq'::regclass);


--
-- TOC entry 3515 (class 2604 OID 102999)
-- Name: employees id; Type: DEFAULT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees ALTER COLUMN id SET DEFAULT nextval('"Company".employees_id_seq'::regclass);


--
-- TOC entry 3517 (class 2604 OID 103000)
-- Name: departments_employees id; Type: DEFAULT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".departments_employees ALTER COLUMN id SET DEFAULT nextval('"Employee".departments_employees_id_seq'::regclass);


--
-- TOC entry 3518 (class 2604 OID 103001)
-- Name: history_schedules id; Type: DEFAULT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".history_schedules ALTER COLUMN id SET DEFAULT nextval('"Employee".history_schedules_id_seq'::regclass);


--
-- TOC entry 3519 (class 2604 OID 103002)
-- Name: roles_employees id; Type: DEFAULT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".roles_employees ALTER COLUMN id SET DEFAULT nextval('"Employee".roles_employees_id_seq'::regclass);


--
-- TOC entry 3592 (class 2604 OID 103003)
-- Name: schedules id; Type: DEFAULT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".schedules ALTER COLUMN id SET DEFAULT nextval('"Employee".schedules_id_seq'::regclass);


--
-- TOC entry 3593 (class 2604 OID 103004)
-- Name: country id; Type: DEFAULT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".country ALTER COLUMN id SET DEFAULT nextval('"Fud".country_id_seq'::regclass);


--
-- TOC entry 3594 (class 2604 OID 103005)
-- Name: tokens id; Type: DEFAULT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".tokens ALTER COLUMN id SET DEFAULT nextval('"Fud".tokens_id_seq'::regclass);


--
-- TOC entry 3597 (class 2604 OID 103006)
-- Name: users id; Type: DEFAULT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".users ALTER COLUMN id SET DEFAULT nextval('"Fud".users_id_seq'::regclass);


--
-- TOC entry 3644 (class 2604 OID 112293)
-- Name: boutique id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".boutique ALTER COLUMN id SET DEFAULT nextval('"Inventory".boutique_id_seq'::regclass);


--
-- TOC entry 3603 (class 2604 OID 103007)
-- Name: dish_and_combo_features id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".dish_and_combo_features ALTER COLUMN id SET DEFAULT nextval('"Inventory".dish_and_combo_features_id_seq'::regclass);


--
-- TOC entry 3650 (class 2604 OID 112673)
-- Name: lots id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".lots ALTER COLUMN id SET DEFAULT nextval('"Inventory".lots_id_seq'::regclass);


--
-- TOC entry 3605 (class 2604 OID 103008)
-- Name: product_and_suppiles_features id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".product_and_suppiles_features ALTER COLUMN id SET DEFAULT nextval('"Inventory".product_and_suppiles_features_id_seq'::regclass);


--
-- TOC entry 3655 (class 2604 OID 121106)
-- Name: promotions id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".promotions ALTER COLUMN id SET DEFAULT nextval('"Inventory".promotions_id_seq'::regclass);


--
-- TOC entry 3646 (class 2604 OID 112305)
-- Name: table_boutique id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_boutique ALTER COLUMN id SET DEFAULT nextval('"Inventory".table_boutique_id_seq'::regclass);


--
-- TOC entry 3606 (class 2604 OID 103009)
-- Name: table_supplies_dish id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_supplies_dish ALTER COLUMN id SET DEFAULT nextval('"Inventory".table_supplies_dish_id_seq'::regclass);


--
-- TOC entry 3607 (class 2604 OID 103010)
-- Name: table_taxes id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_taxes ALTER COLUMN id SET DEFAULT nextval('"Inventory".table_taxes_id_seq'::regclass);


--
-- TOC entry 3608 (class 2604 OID 103011)
-- Name: taxes id; Type: DEFAULT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".taxes ALTER COLUMN id SET DEFAULT nextval('"Inventory".taxes_id_seq'::regclass);


--
-- TOC entry 3612 (class 2604 OID 103013)
-- Name: product_category id; Type: DEFAULT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".product_category ALTER COLUMN id SET DEFAULT nextval('"Kitchen".product_category_id_seq'::regclass);


--
-- TOC entry 3613 (class 2604 OID 103014)
-- Name: product_department id; Type: DEFAULT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".product_department ALTER COLUMN id SET DEFAULT nextval('"Kitchen".product_department_id_seq'::regclass);


--
-- TOC entry 3614 (class 2604 OID 103015)
-- Name: products_and_supplies id; Type: DEFAULT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".products_and_supplies ALTER COLUMN id SET DEFAULT nextval('"Kitchen".products_and_supplies_id_seq'::regclass);


--
-- TOC entry 3615 (class 2604 OID 103016)
-- Name: table_supplies_combo id; Type: DEFAULT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".table_supplies_combo ALTER COLUMN id SET DEFAULT nextval('"Kitchen".table_supplies_combo_id_seq'::regclass);


--
-- TOC entry 3618 (class 2604 OID 103017)
-- Name: companies id; Type: DEFAULT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".companies ALTER COLUMN id SET DEFAULT nextval('"User".companies_id_seq'::regclass);


--
-- TOC entry 3635 (class 2604 OID 103744)
-- Name: alumnos id; Type: DEFAULT; Schema: _company_1_branch_8; Owner: postgres
--

ALTER TABLE ONLY _company_1_branch_8.alumnos ALTER COLUMN id SET DEFAULT nextval('_company_1_branch_8.alumnos_id_seq'::regclass);


--
-- TOC entry 4140 (class 0 OID 112637)
-- Dependencies: 334
-- Data for Name: box_history; Type: TABLE DATA; Schema: Box; Owner: postgres
--

COPY "Box".box_history (id, id_employee, id_customers, buy_for_cash, buy_for_credit_card, buy_for_debit_card, change_of_sale, comment, date_sales) FROM stdin;
1	56	\N	10.00	10.00	10.00	10.00		2025-03-01 09:55:48.446
2	56	\N	20.00	0.00	0.00	1.00		2025-03-08 09:31:11.677
3	56	\N	20.00	0.00	0.00	1.00		2025-03-08 09:38:56.031
4	56	\N	20.00	0.00	0.00	1.00		2025-03-08 10:26:16.277
5	56	\N	20.00	0.00	0.00	1.00		2025-03-08 10:38:08.19
6	56	\N	20.00	0.00	0.00	1.00		2025-03-08 10:45:10.788
7	56	\N	20.00	0.00	0.00	1.00		2025-03-15 20:12:34.806
8	56	\N	20.00	0.00	0.00	1.00		2025-03-15 20:16:26.471
9	56	\N	20.00	0.00	0.00	1.00		2025-03-15 20:20:38.372
10	56	\N	20.00	0.00	0.00	1.00		2025-03-15 20:28:48.095
11	56	\N	20.00	0.00	0.00	1.00		2025-03-15 20:28:50.483
12	56	\N	20.00	0.00	0.00	1.00		2025-03-15 20:31:53.033
13	56	\N	133.00	0.00	0.00	0.00		2025-03-15 20:34:03.736
14	56	\N	50.00	0.00	0.00	2.00		2025-03-16 12:29:18.112
15	56	\N	20.00	0.00	0.00	1.00		2025-03-21 22:24:41.5
16	56	\N	20.00	0.00	0.00	1.00		2025-03-21 22:25:21.754
17	56	\N	20.00	0.00	0.00	1.00		2025-03-21 22:25:40.846
18	56	\N	20.00	0.00	0.00	1.00		2025-03-21 22:26:09.339
19	56	\N	20.00	0.00	0.00	8.00		2025-03-22 15:05:14.642
20	56	\N	20.00	0.00	0.00	8.00		2025-03-22 15:06:00.99
21	56	\N	20.00	0.00	0.00	8.00		2025-03-22 15:31:30.029
22	56	\N	40.00	0.00	0.00	2.00		2025-03-22 15:32:33.609
23	56	\N	40.00	0.00	0.00	2.00		2025-03-22 15:34:12.251
24	56	\N	20.00	0.00	0.00	8.00		2025-03-22 15:34:29.954
25	56	\N	60.00	0.00	0.00	3.00		2025-03-22 16:04:53.203
26	56	\N	40.00	0.00	0.00	2.00		2025-03-22 16:06:34.944
27	56	\N	40.00	0.00	0.00	2.00		2025-03-22 16:11:26.82
28	56	\N	40.00	0.00	0.00	2.00		2025-03-22 16:16:57.242
29	56	\N	20.00	0.00	0.00	1.00		2025-03-22 16:19:02.488
30	56	\N	19.00	0.00	0.00	0.00		2025-03-22 16:21:22.413
31	56	\N	60.00	0.00	0.00	3.00		2025-03-22 16:23:40.447
32	56	\N	60.00	0.00	0.00	3.00		2025-03-22 16:30:37.335
33	56	\N	60.00	0.00	0.00	3.00		2025-03-22 16:32:16.769
34	56	\N	20.00	0.00	0.00	1.00		2025-03-22 16:33:29.095
35	56	\N	20.00	0.00	0.00	1.00		2025-03-23 11:42:39.677
36	56	\N	20.00	0.00	0.00	1.00		2025-03-23 14:06:28.644
37	56	\N	150.00	0.00	0.00	0.00		2025-03-24 08:44:06.639
38	56	\N	40.00	0.00	0.00	2.20		2025-03-31 09:34:58.035
\.


--
-- TOC entry 4033 (class 0 OID 102678)
-- Dependencies: 227
-- Data for Name: boxes_history; Type: TABLE DATA; Schema: Box; Owner: postgres
--

COPY "Box".boxes_history (id, initial_date, finish_date, id_branches, id_employees, id_boxes) FROM stdin;
\.


--
-- TOC entry 4035 (class 0 OID 102682)
-- Dependencies: 229
-- Data for Name: movement_history; Type: TABLE DATA; Schema: Box; Owner: postgres
--

COPY "Box".movement_history (id, id_branches, id_boxes, id_employees, move, comment, date_move) FROM stdin;
3	\N	0	\N	20	cambio	2024-02-24 21:57:40.545-06
4	\N	0	\N	500	pagar la luz	2024-02-25 10:41:37.129-06
5	\N	0	\N	23	Pago de luz	2024-03-01 15:22:20.169-06
6	\N	0	\N	-30	no le gustaron las papas	2024-03-17 10:36:10.896-06
7	\N	0	\N	5	dinero encontrado	2024-03-17 10:44:44.751-06
8	8	0	56	50	propina de empleados	2024-07-13 10:05:26.813-06
9	8	0	56	100	pagar la luz	2025-01-11 22:43:05.458-06
10	8	0	56	-100	pago de luz	2025-01-11 22:43:41.42-06
11	8	0	56	50	equivocacion al pagar la luz	2025-01-11 22:44:17.02-06
12	8	0	51	100	metida de dinero	2025-02-03 13:59:01.669-06
13	8	0	51	-100	pagar la luz	2025-02-03 14:43:12.08-06
14	8	0	56	10	pago de renta	2025-02-03 15:15:22.886-06
15	8	0	56	-50	pagar la luz	2025-02-28 22:29:35.592-06
16	8	0	56	100	deposito atrasado	2025-02-28 22:29:49.096-06
17	8	0	56	20	dinero encontrado	2025-02-28 22:29:59.676-06
18	8	0	56	100	me pagaron la luz	2025-03-01 09:56:31.676-06
19	8	0	56	-20	me compre un lonche	2025-03-01 09:56:44.385-06
\.


--
-- TOC entry 4036 (class 0 OID 102688)
-- Dependencies: 230
-- Data for Name: sales_history; Type: TABLE DATA; Schema: Box; Owner: postgres
--

COPY "Box".sales_history (id, id_companies, id_branches, id_employees, id_customers, id_dishes_and_combos, price, amount, total, comment, sale_day) FROM stdin;
183	1	8	56	\N	2	100	1	100	\N	2025-01-11 21:42:43.96-06
184	1	8	56	\N	2	100	2	200	\N	2025-01-11 22:20:27.363-06
185	1	8	56	\N	2	100	1	100	\N	2025-01-11 22:38:14.105-06
186	1	8	56	\N	2	100	1	100	\N	2025-01-12 21:27:46.277-06
187	1	8	56	\N	1	10	1	10	\N	2025-01-13 20:54:43.636-06
188	1	8	56	\N	1	10	8	80	\N	2025-01-13 20:54:50.442-06
189	1	8	56	\N	1	10	4	40	\N	2025-01-13 20:55:07.188-06
190	1	8	56	\N	1	10	1	10	\N	2025-01-13 21:18:47.143-06
191	1	8	56	\N	1	10	1	10	\N	2025-01-15 17:12:00.452-06
192	1	8	56	\N	1	10	5	50	\N	2025-01-16 18:16:39.225-06
193	1	8	56	\N	1	10	1	10	\N	2025-01-17 16:34:13.734-06
194	1	8	56	\N	3	0	1	0	\N	2025-01-17 16:34:13.734-06
195	1	8	56	\N	2	100	1	100	\N	2025-01-17 16:34:13.734-06
196	1	8	56	\N	6	19	1	19	\N	2025-01-19 10:47:30.815-06
197	1	8	56	\N	7	19	1	19	\N	2025-01-19 10:47:30.815-06
198	1	8	56	\N	6	19	1	19	\N	2025-01-19 10:52:00.796-06
199	1	8	56	\N	7	19	1	19	\N	2025-01-19 10:52:00.796-06
200	1	8	56	\N	6	19	1	19	\N	2025-01-19 11:03:49.476-06
201	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:01:48.588-06
202	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:03:24.188-06
203	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:08:04.321-06
204	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:09:16.995-06
205	1	8	56	\N	8	20	2	40	\N	2025-01-19 14:09:29.198-06
206	1	8	56	\N	8	20	2	40	\N	2025-01-19 14:12:49.674-06
207	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:15:26.144-06
208	1	8	56	\N	7	19	1	19	\N	2025-01-19 14:15:26.144-06
209	1	8	56	\N	1	10	1	10	\N	2025-01-19 14:15:26.144-06
210	1	8	56	\N	1	10	2	20	\N	2025-01-19 14:17:26.753-06
211	1	8	56	\N	4	20	1	20	\N	2025-01-19 14:17:26.753-06
212	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:17:26.753-06
213	1	8	56	\N	6	19	2	38	\N	2025-01-19 14:17:26.753-06
214	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:18:21.677-06
215	1	8	56	\N	7	19	1	19	\N	2025-01-19 14:18:21.677-06
216	1	8	56	\N	2	100	1	100	\N	2025-01-19 14:18:21.677-06
217	1	8	56	\N	7	19	2	38	\N	2025-01-19 14:31:03.077-06
218	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:31:03.077-06
219	1	8	56	\N	7	19	2	38	\N	2025-01-19 14:31:10.467-06
220	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:31:10.467-06
221	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:31:47.811-06
222	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:33:01.586-06
223	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:33:21.38-06
224	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:33:56.879-06
225	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:34:38.722-06
226	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:35:09.745-06
227	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:37:06.091-06
228	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:37:56.244-06
229	1	8	56	\N	7	19	2	38	\N	2025-01-19 14:37:56.244-06
230	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:38:14.787-06
231	1	8	56	\N	7	19	2	38	\N	2025-01-19 14:38:14.787-06
232	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:43:19.323-06
233	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:43:55.754-06
234	1	8	56	\N	8	20	1	20	\N	2025-01-19 14:47:54.86-06
235	1	8	51	\N	5	18	1	18	\N	2025-02-02 14:54:18.298-06
236	1	8	51	\N	5	18	2	36	\N	2025-02-02 14:56:39.625-06
237	1	8	51	\N	\N	18	1	18	\N	2025-02-02 14:56:50.927-06
238	1	8	51	\N	5	18	2	36	\N	2025-02-02 14:58:32.273-06
239	1	8	51	\N	7	19	1	19	\N	2025-02-03 11:26:35.987-06
240	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:28:12.467-06
241	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:31:27.944-06
242	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:42:57.408-06
243	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:46:33.807-06
244	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:47:09.336-06
245	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:50:08.866-06
246	1	8	51	\N	5	18	1	18	\N	2025-02-03 11:55:20.941-06
247	1	8	51	\N	6	19	1	19	\N	2025-02-03 11:55:20.941-06
248	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:47:48.741-06
249	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:50:16.709-06
250	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:51:59.407-06
251	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:52:26.512-06
252	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:53:08.561-06
253	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:53:58.621-06
254	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:55:00.033-06
255	1	8	51	\N	6	19	9	171	\N	2025-02-03 13:55:22.083-06
256	1	8	51	\N	6	19	1	19	\N	2025-02-03 13:58:15.553-06
257	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:01:04.373-06
258	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:05:22.911-06
259	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:11:40.085-06
260	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:11:54.438-06
261	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:15:47.635-06
262	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:16:53.427-06
263	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:18:49.283-06
264	1	8	51	\N	4	20	2	40	\N	2025-02-03 14:19:04.888-06
265	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:19:04.888-06
266	1	8	51	\N	4	20	1	20	\N	2025-02-03 14:20:08.942-06
267	1	8	51	\N	6	19	1	19	\N	2025-02-03 14:43:31.083-06
268	1	8	51	\N	5	18	1	18	\N	2025-02-03 14:43:31.083-06
269	1	8	51	\N	5	18	1	18	\N	2025-02-03 14:43:50.969-06
270	1	8	51	\N	5	18	1	18	\N	2025-02-03 15:13:25.333-06
271	1	8	51	\N	6	19	1	19	\N	2025-02-03 15:13:25.333-06
272	1	8	51	\N	8	20	1	20	\N	2025-02-03 15:13:34.472-06
273	1	8	56	\N	5	18	1	18	\N	2025-02-03 15:14:53.408-06
274	1	8	56	\N	5	18	1	18	\N	2025-02-03 15:22:37.557-06
275	1	8	56	\N	1	10	3	30	\N	2025-02-07 22:19:53.19-06
276	1	8	56	\N	12	0	1	0	\N	2025-02-07 22:19:53.19-06
277	1	8	56	\N	9	0	1	0	\N	2025-02-07 22:20:46.091-06
278	1	8	56	\N	13	10	1	10	\N	2025-02-07 23:13:36.474-06
279	1	8	56	\N	7	19	1	19	\N	2025-02-08 12:38:34.961-06
280	1	8	56	4	6	19	1	19	\N	2025-02-08 12:44:11.152-06
281	1	8	56	\N	6	19	1	19	\N	2025-02-15 12:45:20.279-06
282	1	8	56	\N	28	5	1	5	\N	2025-02-15 12:46:00.667-06
283	1	8	56	\N	50	20	2	40	\N	2025-02-23 12:42:54.998-06
284	1	8	56	\N	8	20	1	20	\N	2025-02-28 22:51:38.549-06
285	1	8	56	\N	8	20	1	20	\N	2025-02-28 23:09:33.38-06
286	1	8	56	\N	8	20	1	20	\N	2025-02-28 23:12:35.171-06
287	1	8	56	\N	8	20	1	20	\N	2025-02-28 23:14:44.425-06
288	1	8	56	\N	8	20	1	20	\N	2025-02-28 23:16:18.342-06
289	1	8	56	\N	1	10	1	10	\N	2025-02-28 23:21:14.682-06
290	1	8	56	\N	1	10	1	10	\N	2025-02-28 23:21:22.585-06
291	1	8	56	\N	1	10	1	10	\N	2025-02-28 23:22:25.744-06
292	1	8	56	\N	1	10	1	10	\N	2025-02-28 23:30:56.104-06
293	1	8	56	\N	1	10	1	10	\N	2025-02-28 23:32:42.829-06
294	1	8	56	\N	1	10	1	10	\N	2025-02-28 23:33:44.275-06
295	1	8	56	\N	8	20	1	20	\N	2025-03-01 09:44:22.576-06
296	1	8	56	\N	8	20	1	20	\N	2025-03-01 09:45:01.434-06
297	1	8	56	\N	8	20	1	20	\N	2025-03-01 09:48:34.463-06
298	1	8	56	\N	8	20	1	20	\N	2025-03-01 09:53:51.886-06
299	1	8	56	\N	8	20	1	20	\N	2025-03-01 09:55:48.446-06
300	1	8	56	\N	6	19	1	19	\N	2025-03-08 09:31:11.677-06
301	1	8	56	\N	6	19	1	19	\N	2025-03-08 09:38:56.031-06
302	1	8	56	\N	6	19	1	19	\N	2025-03-08 10:26:16.277-06
303	1	8	56	\N	6	19	1	19	\N	2025-03-08 10:38:08.19-06
304	1	8	56	\N	6	19	1	19	\N	2025-03-08 10:45:10.788-06
305	1	8	56	\N	6	19	1	19	\N	2025-03-15 20:12:34.806-06
306	1	8	56	\N	6	19	1	19	\N	2025-03-15 20:16:26.471-06
307	1	8	56	\N	6	19	1	19	\N	2025-03-15 20:20:38.372-06
308	1	8	56	\N	6	19	1	19	\N	2025-03-15 20:28:48.095-06
309	1	8	56	\N	6	19	1	19	\N	2025-03-15 20:28:50.483-06
310	1	8	56	\N	6	19	1	19	\N	2025-03-15 20:31:53.033-06
311	1	8	56	\N	6	19	7	133	\N	2025-03-15 20:34:03.736-06
312	1	8	56	\N	52	12	4	48	\N	2025-03-16 12:29:18.112-06
313	1	8	56	\N	7	19	1	19	\N	2025-03-21 22:24:41.5-06
314	1	8	56	\N	7	19	1	19	\N	2025-03-21 22:25:21.754-06
315	1	8	56	\N	7	19	1	19	\N	2025-03-21 22:25:40.846-06
316	1	8	56	\N	7	19	1	19	\N	2025-03-21 22:26:09.339-06
317	1	8	56	\N	52	12	1	12	\N	2025-03-22 15:05:14.642-06
318	1	8	56	\N	52	12	1	12	\N	2025-03-22 15:06:00.99-06
319	1	8	56	\N	52	12	1	12	\N	2025-03-22 15:31:30.029-06
320	1	8	56	\N	6	19	2	38	\N	2025-03-22 15:32:33.609-06
321	1	8	56	\N	6	19	2	38	\N	2025-03-22 15:34:12.251-06
322	1	8	56	\N	52	12	1	12	\N	2025-03-22 15:34:29.954-06
323	1	8	56	\N	7	19	3	57	\N	2025-03-22 16:04:53.203-06
324	1	8	56	\N	7	19	2	38	\N	2025-03-22 16:06:34.944-06
325	1	8	56	\N	7	19	2	38	\N	2025-03-22 16:11:26.82-06
326	1	8	56	\N	7	19	2	38	\N	2025-03-22 16:16:57.242-06
327	1	8	56	\N	7	19	1	19	\N	2025-03-22 16:19:02.488-06
328	1	8	56	\N	7	19	1	19	\N	2025-03-22 16:21:22.413-06
329	1	8	56	\N	7	19	3	57	\N	2025-03-22 16:23:40.447-06
330	1	8	56	\N	7	19	3	57	\N	2025-03-22 16:30:37.335-06
331	1	8	56	\N	7	19	3	57	\N	2025-03-22 16:32:16.769-06
332	1	8	56	\N	7	19	1	19	\N	2025-03-22 16:33:29.095-06
333	1	8	56	\N	7	19	1	19	\N	2025-03-23 11:42:39.677-06
334	1	8	56	\N	7	19	1	19	\N	2025-03-23 14:06:28.644-06
335	1	8	56	\N	53	50	3	150	\N	2025-03-24 08:44:06.639-06
336	1	8	56	\N	5	18	3	54	\N	2025-03-31 09:34:58.035-06
\.


--
-- TOC entry 4038 (class 0 OID 102694)
-- Dependencies: 232
-- Data for Name: Ad; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch"."Ad" (id, id_branches, img, type, description) FROM stdin;
41	\N	de087c7c-1676-4d43-ba6d-f2f935c5de38.jpeg	offer	\N
42	\N	f3911767-2055-42f4-9788-2efdf42443f1.jpeg	new	\N
43	\N	798de2bb-202c-484a-81d3-c17c4864adcb.jpg	offer	\N
44	\N	7caccf60-90ab-4644-97da-06b559d6ccad.jpg	new	\N
47	\N	80466870-d486-4803-9863-ac194fe4064f.jpeg	combo	tiempo limitado
48	\N	ed231089-4e8a-405e-acc3-c4a3e94639f2.jpeg	special	special 1
50	\N	29faf720-02c7-410d-83bf-cd347647683c.jpeg	combo	tiempo ilimitado
51	\N	26a74549-962a-4648-82df-86cd3acdf566.jpeg	combo	familiar
52	\N	1b868259-b985-45ce-9a22-121e3767ac43.jpeg	combo	combo 4
53	\N	1e09d29a-0baa-4dd4-b707-8aba4bfc2125.jpeg	combo	combo 4
54	\N	d19d8c24-1697-46b4-a94c-3a1e04dfef1f.jpeg	combo	combo 5
55	\N	1e086a80-8b71-4ef3-bc44-b13bd8126e3b.jpeg	special	special 2
56	\N	4ad181bf-3ef5-47db-be6e-8420ddaaaa98.jpeg	special	special 3
57	\N	cbc84b7a-87ac-49c3-bca2-66608a41edd7.jpeg	special	special 4
72	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/4fc5b9a7-e69a-40e1-b3a1-48d1babaed01.jpeg	combo	combo dominguero
73	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/1032cc7c-facc-4265-8385-3db281368471.jpeg	combo	el super combo
74	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/1c3ac63c-bc93-4231-b067-f1db8090c512.jpeg	combo	combo botanero
75	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/123733ed-bda3-4b26-b7fd-7c7d7db8f658.jpeg	combo	individual
76	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/8a5a31bf-587a-484e-bf20-bdb4eb5afb84.jpeg	combo	bbq burguers
77	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/239a0aa8-4a46-4788-8b3e-b938110c7bb9.jpeg	combo	papas volcano
78	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/f594ce31-a7ec-4c54-a82e-fe05b1ca7141.jpeg	combo	2 favoritas
79	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/fb81a2cd-6ef3-4a8c-855e-9c6635b2dc0f.jpeg	combo	2 favoritas
80	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/44e08ab5-67e1-4122-99f7-939601e20ffa.jpeg	special	jugo
81	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/c67c9567-d4f5-4051-9459-d35d289adc9e.jpeg	special	alitas
82	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/8ce4f645-82ad-44ce-8bf3-8b0689ae8c0a.jpeg	special	pizza peperoni
83	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/7666bf86-f0a2-4934-92f4-d2e2b87dc398.jpeg	special	ofertas
84	26	https://fud-images.sfo2.digitaloceanspaces.com/https%3A//fud-images.sfo2.digitaloceanspaces.com/4dcbaef4-705d-4ac1-9cc6-209d4d4a87d3.jpeg	special	bonless
\.


--
-- TOC entry 4040 (class 0 OID 102700)
-- Dependencies: 234
-- Data for Name: app; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".app (id, id_branches, id_stripe_new_terminal, expiration_date_new_terminal, id_stripe_website_creation, expiration_date_website_creation, id_stripe_digital_menu, expiration_date_digital_menu, id_stripe_employee_schedules, expiration_date_employee_schedules) FROM stdin;
\.


--
-- TOC entry 4042 (class 0 OID 102710)
-- Dependencies: 236
-- Data for Name: billing_information; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".billing_information (id, id_providers, addres, postal_code, rfc, curp, business_name, business_phone, business_cell_phone) FROM stdin;
\.


--
-- TOC entry 4044 (class 0 OID 102716)
-- Dependencies: 238
-- Data for Name: boxes; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".boxes (id, id_branches, num_box, ip_printer) FROM stdin;
0	\N	0	\N
2	\N	1	192.168.1.100
4	\N	2	192.168.1.100
8	8	1	
11	25	1	-
10	8	2	00000101110001
\.


--
-- TOC entry 4046 (class 0 OID 102720)
-- Dependencies: 240
-- Data for Name: commanders; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".commanders (id, id_branches, id_employees, id_customers, total, money_received, change, status, comentary, commander_date, order_details) FROM stdin;
1	5	37	\N	757.5	900	142.5	0		2024-02-25 12:07:06.062	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
2	5	37	4	1494.5	2000	505.5	0		2024-02-25 12:12:35.023	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"3","total":"1105.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
3	5	37	\N	757.5	800	42.5	0		2024-02-28 19:17:04.735	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
4	5	37	\N	757.5	900	142.5	0		2024-02-28 19:25:08.488	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
5	5	37	\N	757.5	800	42.5	0		2024-02-28 19:34:34.003	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
6	5	37	\N	757.5	800	42.5	0		2024-02-28 19:38:06.507	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
7	5	37	\N	368.5	400	31.5	0		2024-02-28 19:44:30.52	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
8	5	37	\N	368.5	400	31.5	0		2024-02-28 19:48:52.493	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
9	5	37	\N	368.5	400	31.5	0		2024-02-28 19:49:43.689	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
10	5	37	\N	368.5	400	31.5	0		2024-02-28 19:56:31.624	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
11	5	37	\N	368.5	400	31.5	0		2024-02-28 19:59:25.97	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
12	5	37	\N	368.5	400	31.5	0		2024-02-28 19:59:50.633	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
13	5	37	\N	368.5	400	31.5	0		2024-02-28 20:11:08.475	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
14	5	37	\N	368.5	400	31.5	0		2024-02-28 20:12:03.419	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
15	5	37	\N	368.5	400	31.5	0		2024-02-28 20:12:28.35	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
16	5	37	\N	368.5	400	31.5	0		2024-02-28 20:12:51.994	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
17	5	37	\N	368.5	400	31.5	0		2024-02-28 20:13:58.975	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
18	5	37	\N	368.5	400	31.5	0		2024-02-28 20:14:29.493	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
19	5	37	\N	368.5	400	31.5	0		2024-02-28 20:15:14.633	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
20	5	37	\N	368.5	400	31.5	0		2024-02-28 20:16:18.996	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
21	5	37	\N	368.5	400	31.5	0		2024-02-28 20:17:20.782	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
22	5	37	\N	368.5	400	31.5	0		2024-02-28 20:18:14.955	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
23	5	37	\N	368.5	400	31.5	0		2024-02-28 20:18:33.484	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
24	5	37	4	389	400	11	0		2024-03-01 15:19:01.072	[{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
25	5	37	\N	757.5	800	42.5	0		2024-03-01 15:23:02.197	[{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"},{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
26	5	37	\N	368.5	390	21.5	0	this is a comment	2024-03-01 18:59:14.668	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
27	5	37	\N	368.5	400	31.5	0	No quiere papas a la francesa	2024-03-01 19:04:05.146	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
28	5	37	\N	368.5	400	31.5	0		2024-03-16 14:43:15.84	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
29	5	37	\N	389	500	111	0		2024-03-16 15:15:11.397	[{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
30	5	37	\N	389	400	11	0		2024-03-17 10:01:03.583	[{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
31	5	37	\N	368.5	400	31.5	0		2024-03-18 08:49:22.878	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
32	5	37	\N	368.5	400	31.5	0		2024-03-20 14:16:36.843	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
33	5	37	\N	368.5	400	31.5	0		2024-03-20 14:16:46.827	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
34	5	37	\N	368.5	400	31.5	0		2024-03-20 14:17:00.894	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
35	5	37	\N	1883.5	80000	78116.5	0		2024-03-20 14:19:01.115	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"3","total":"1105.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"2","total":"778"}]
36	5	37	\N	757.5	800	42.5	0		2024-03-20 14:19:48.503	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"},{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"}]
37	5	37	\N	368.5	4000000	3999631.5	0		2024-03-20 14:20:02.424	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
38	5	37	\N	757.5	8000	7242.5	0		2024-03-20 14:20:44.263	[{"name":"Kentucky Fried Chicken","price":"389","amount":"1","total":"389"},{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
39	5	37	\N	705	40000	39295	0		2024-03-20 14:22:27.554	[{"name":"Kentucky Fried Chicken","price":"352.5","amount":"2","total":"705"}]
40	5	37	\N	368.5	4000	3631.5	0		2024-03-20 14:43:48.4	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
41	5	37	\N	368.5	4000	3631.5	0		2024-03-20 14:44:55.479	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
42	5	37	\N	368.5	400	31.5	0		2024-03-20 14:45:40.102	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
43	5	37	\N	368.5	400	31.5	0		2024-03-20 15:14:23.92	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
44	5	37	\N	368.5	400	31.5	0		2024-03-20 15:15:54.615	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
45	5	37	\N	368.5	400	31.5	0		2024-03-20 15:22:50.186	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
46	5	37	\N	368.5	400	31.5	0		2024-03-20 15:23:43.282	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
47	5	37	\N	368.5	400	31.5	0		2024-03-20 15:24:44.477	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
48	5	37	\N	368.5	400	31.5	0		2024-03-20 15:27:30.05	[{"name":"Kentucky Fried Chicken Chile","price":"368.5","amount":"1","total":"368.5"}]
49	8	51	\N	10	10	0	0		2024-05-31 19:19:57.673	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
50	8	51	\N	10	10	0	0	Refresco de fresa 	2024-06-01 01:31:00.939	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
51	8	51	\N	10	20	10	0		2024-06-01 01:31:23.41	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
52	8	51	\N	20	100	80	0		2024-06-01 02:17:37.515	[{"name":"refresco de refil","price":"10","amount":"2","total":"20"}]
53	8	51	\N	30	100	70	0		2024-06-01 16:00:17.161	[{"name":"refresco de refil","price":"10","amount":"3","total":"30"}]
54	8	51	\N	10	10	0	0		2024-06-01 16:00:37.944	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
55	8	51	\N	28	100	72	0		2024-06-05 22:31:14.829	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
56	8	51	\N	48	100	52	0		2024-06-08 21:54:06.647	[{"name":"taco","price":"20","amount":"1","total":"20"},{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
57	8	51	\N	76	100	24	0		2024-06-08 21:58:02.082	[{"name":"hamburgesa con nuggets","price":"28","amount":"2","total":"56"},{"name":"taco","price":"20","amount":"1","total":"20"}]
58	8	51	\N	79	80	1	0		2024-06-08 22:01:29.668	[{"name":"mega hotdog","price":"59","amount":"1","total":"59"},{"name":"refresco de refil","price":"10","amount":"2","total":"20"}]
59	8	51	\N	68	100	32	0		2024-06-09 02:27:19.644	[{"name":"taco","price":"20","amount":"2","total":"40"},{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
60	8	51	\N	59	60	1	0		2024-06-09 02:29:07.153	[{"name":"mega hotdog","price":"59","amount":"1","total":"59"}]
61	8	51	\N	28	28	0	0		2024-06-09 13:26:45.486	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
62	8	56	\N	10	10	0	0		2024-06-10 16:25:09.398	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
63	8	56	\N	38	100	62	0		2024-06-12 05:35:34.32	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"},{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
64	22	52	\N	2	2	0	0		2024-06-13 12:50:32.226	[{"name":"chiles","price":"2","amount":"1","total":"2"}]
97	8	56	\N	10	10	0	0		2024-06-19 22:19:43.34	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
98	8	56	\N	10	10	0	0		2024-06-19 22:20:39.349	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
99	8	56	\N	10	10	0	0		2024-06-19 22:21:54.789	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
100	8	56	\N	10	10	0	0		2024-06-19 22:27:53.972	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
101	8	56	\N	10	10	0	0		2024-06-19 22:29:24.829	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
102	8	56	\N	10	10	0	0		2024-06-19 22:33:48.221	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
103	8	56	\N	10	10	0	0		2024-06-19 22:34:17.228	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
104	8	56	\N	10	10	0	0		2024-06-19 22:35:03.542	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
105	8	56	\N	10	10	0	0		2024-06-19 23:19:37.625	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
106	8	56	\N	10	10	0	0		2024-06-19 23:19:55.575	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
107	8	56	\N	10	10	0	0		2024-06-20 00:27:01.635	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
108	8	56	\N	10	10	0	0		2024-06-20 00:33:49.817	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
109	8	56	\N	10	10	0	0		2024-06-20 00:40:20.043	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
110	8	56	\N	10	10	0	0		2024-06-20 00:55:37.457	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
111	8	56	\N	10	10	0	0		2024-06-20 01:02:21.204	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
112	8	56	\N	10	10	0	0		2024-06-20 17:23:52.62	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
113	8	56	\N	10	10	0	0		2024-06-20 17:26:20.904	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
114	8	56	\N	10	10	0	0		2024-06-20 17:35:54.577	[{"name":"refresco de refil","price":"10","amount":"1","total":"10"}]
115	8	56	\N	30	30	0	0		2024-06-20 17:41:12.768	[{"name":"refresco de refil","price":"10","amount":"3","total":"30"}]
116	8	\N	\N	28	28	0	0		2024-06-20 14:48:24.965	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
117	8	\N	\N	28	28	0	0		2024-06-20 14:49:44.463	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
118	8	\N	\N	28	28	0	0		2024-06-20 14:58:26.942	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
119	8	\N	\N	28	28	0	0		2024-06-20 15:01:17.876	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
120	8	\N	\N	28	28	0	0		2024-06-20 15:02:44.441	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
121	8	\N	\N	28	28	0	0		2024-06-20 15:03:50.063	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
122	8	\N	\N	28	28	0	0		2024-06-20 15:04:26.788	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
123	8	\N	\N	28	28	0	0		2024-06-20 15:05:11.365	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
124	8	\N	\N	28	29	1	0		2024-06-20 15:05:50.838	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
125	8	\N	\N	28	28	0	0		2024-06-20 15:15:42.851	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
126	8	\N	\N	28	28	0	0		2024-06-20 15:16:19.191	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
127	8	\N	\N	48	48	0	0		2024-06-20 22:38:37.647	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"},{"name":"taco","price":"20","amount":"1","total":"20"}]
128	25	55	\N	180	200	20	0		2024-06-25 04:09:23.612	[{"name":"hamburguesa sencilla","price":"60","amount":"3","total":"180"}]
129	8	56	\N	28	28	0	0		2024-06-28 20:05:38.281	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
130	22	52	\N	2	2	0	0		2024-06-29 20:54:07.771	[{"name":"ed","price":"2","amount":"1","total":"2"}]
131	22	52	\N	2	4	2	0		2024-06-29 20:54:17.218	[{"name":"ed","price":"2","amount":"1","total":"2"}]
132	8	56	\N	28	55	27	0		2024-06-30 03:27:16.28	[{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
133	8	56	\N	48	76	28	0		2024-07-05 21:40:15.247	[{"name":"taco","price":"20","amount":"1","total":"20"},{"name":"hamburgesa con nuggets","price":"28","amount":"1","total":"28"}]
134	8	56	\N	20	20	0	0		2024-07-05 19:33:27.269	[{"name":"taco","price":"20","amount":"1","total":"20"}]
135	8	56	\N	20	20	0	0		2024-07-07 12:23:31.95	[{"name":"taco","price":"20","amount":"1","total":"20"}]
136	8	56	\N	20	20	0	0		2024-07-07 12:43:39.497	[{"name":"taco","price":"20","amount":"1","total":"20"}]
137	8	56	\N	20	20	0	0		2024-07-07 12:51:23.301	[{"name":"taco","price":"20","amount":"1","total":"20"}]
138	8	56	\N	20	20	0	0		2024-07-07 13:01:24.996	[{"name":"taco","price":"20","amount":"1","total":"20"}]
139	8	56	\N	20	20	0	0		2024-07-07 13:03:19.329	[{"name":"taco","price":"20","amount":"1","total":"20"}]
140	8	56	\N	20	20	0	0		2024-07-07 13:17:56.855	[{"name":"taco","price":"20","amount":"1","total":"20"}]
141	8	56	\N	20	20	0	0		2024-07-07 13:22:00.283	[{"name":"taco","price":"20","amount":"1","total":"20"}]
142	8	56	\N	20	100	80	0		2024-07-07 13:22:52.19	[{"name":"taco","price":"20","amount":"1","total":"20"}]
143	8	56	\N	20	100	80	0		2024-07-07 13:31:59.65	[{"name":"taco","price":"20","amount":"1","total":"20"}]
144	8	56	\N	20	20	0	0		2024-07-10 11:48:30.752	[{"name":"taco","price":"20","amount":"1","total":"20"}]
145	8	56	\N	20	22	2	0		2024-07-10 11:49:39.051	[{"name":"taco","price":"20","amount":"1","total":"20"}]
146	8	56	\N	20	20	0	0		2024-07-11 03:13:18.671	[{"name":"taco","price":"20","amount":"1","total":"20"}]
147	8	56	\N	40	100	60	0		2024-07-11 03:13:33.55	[{"name":"taco","price":"20","amount":"3","total":"60"}]
148	8	56	\N	20	20	0	0		2024-07-11 09:42:46.7	[{"name":"taco","price":"20","amount":"1","total":"20"}]
149	8	56	\N	20	20	0	0		2024-07-25 01:44:49.172	[{"name":"taco","price":"20","amount":"1","total":"20"}]
150	25	55	\N	60	200	140	0		2024-07-28 06:58:44.197	[{"name":"hamburguesa sencilla","price":"60","amount":"1","total":"60"}]
151	8	56	\N	100	100	0	0		2025-01-09 12:17:19.625	[{"name":"combo","price":"100","amount":"1","total":"100"}]
152	8	56	\N	100	200	100	0		2025-01-09 12:18:11.699	[{"name":"combo","price":"100","amount":"1","total":"100"}]
153	8	56	\N	50	100	50	0		2025-01-09 12:18:39.238	[{"name":"combo","price":"100","amount":"0.5","total":"50"}]
154	8	56	\N	100	100	0	0		2025-01-10 10:19:25.53	[{"name":"combo","price":"100","amount":"1","total":"100"}]
155	8	56	\N	100	100	0	0		2025-01-10 20:21:30.377	[{"name":"combo","price":"100","amount":"1","total":"100"}]
156	8	56	\N	100	100	0	0		2025-01-11 21:30:35.166	[{"name":"combo","price":"100","amount":"1","total":"100"}]
157	8	56	\N	100	100	0	0		2025-01-11 21:42:43.96	[{"name":"combo","price":"100","amount":"1","total":"100"}]
158	8	56	\N	200	200	0	0		2025-01-11 22:20:27.363	[{"name":"combo","price":"100","amount":"2","total":"200"}]
159	8	56	\N	100	120	20	0		2025-01-11 22:38:14.105	[{"name":"combo","price":"100","amount":"1","total":"100"}]
160	8	56	\N	100	100	0	0		2025-01-12 21:27:46.277	[{"name":"combo","price":"100","amount":"1","total":"100"}]
161	8	56	\N	10	10	0	0		2025-01-13 20:54:43.636	[{"name":"producto 1","price":"10","amount":"1","total":"10"}]
162	8	56	\N	80	80	0	0		2025-01-13 20:54:50.442	[{"name":"producto 1","price":"10","amount":"8","total":"80"}]
163	8	56	\N	40	40	0	0		2025-01-13 20:55:07.188	[{"name":"producto 1","price":"10","amount":"4","total":"40"}]
164	8	56	\N	10	10	0	0		2025-01-13 21:18:47.143	[{"name":"producto 1","price":"10","amount":"1","total":"10"}]
165	8	56	\N	10	10	0	0		2025-01-15 17:12:00.452	[{"name":"producto 1","price":"10","amount":"1","total":"10"}]
166	8	56	\N	50	50	0	0		2025-01-16 18:16:39.225	[{"name":"gansito","price":"10","amount":"5","total":"50"}]
167	8	56	\N	110	200	90	0		2025-01-17 16:34:13.734	[{"name":"gansito","price":"10","amount":"1","total":"10"},{"name":"producto 2","price":"0","amount":"1","total":"0"},{"name":"combo","price":"100","amount":"1","total":"100"}]
168	8	56	\N	38	50	12	0		2025-01-19 10:47:30.815	[{"name":"cheetos verdes","price":"19","amount":"1","total":"19"},{"name":"cheetos hot","price":"19","amount":"1","total":"19"}]
169	8	56	\N	38	39	1	0		2025-01-19 10:52:00.796	[{"name":"cheetos verdes","price":"19","amount":"1","total":"19"},{"name":"cheetos hot","price":"19","amount":"1","total":"19"}]
170	8	56	\N	19	100	81	0		2025-01-19 11:03:49.476	[{"name":"cheetos verdes","price":"19","amount":"1","total":"19"}]
171	8	56	\N	20	20	0	0		2025-01-19 14:01:48.588	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
172	8	56	\N	20	20	0	0		2025-01-19 14:02:02.67	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
173	8	56	\N	20	20	0	0		2025-01-19 14:03:24.188	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
174	8	56	\N	20	20	0	0		2025-01-19 14:08:04.321	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
175	8	56	\N	20	20	0	0		2025-01-19 14:09:16.995	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
176	8	56	\N	40	40	0	0		2025-01-19 14:09:29.198	[{"name":"leche lala","price":"20","amount":"2","total":"40"}]
177	8	56	\N	40	40	0	0		2025-01-19 14:12:49.674	[{"name":"leche lala","price":"20","amount":"2","total":"40"}]
178	8	56	\N	49	50	1	0		2025-01-19 14:15:26.144	[{"name":"leche lala","price":"20","amount":"1","total":"20"},{"name":"cheetos hot","price":"19","amount":"1","total":"19"},{"name":"gansito","price":"10","amount":"1","total":"10"}]
179	8	56	\N	98	100	2	0		2025-01-19 14:17:26.753	[{"name":"gansito","price":"10","amount":"2","total":"20"},{"name":"jitomate","price":"20","amount":"1","total":"20"},{"name":"leche lala","price":"20","amount":"1","total":"20"},{"name":"cheetos verdes","price":"19","amount":"2","total":"38"}]
180	8	56	\N	139	200	61	0		2025-01-19 14:18:21.677	[{"name":"leche lala","price":"20","amount":"1","total":"20"},{"name":"cheetos hot","price":"19","amount":"1","total":"19"},{"name":"combo","price":"100","amount":"1","total":"100"}]
181	8	56	\N	58	100	42	0		2025-01-19 14:31:03.077	[{"name":"cheetos hot","price":"19","amount":"2","total":"38"},{"name":"leche lala","price":"20","amount":"1","total":"20"}]
182	8	56	\N	58	100	42	0		2025-01-19 14:31:10.467	[{"name":"cheetos hot","price":"19","amount":"2","total":"38"},{"name":"leche lala","price":"20","amount":"1","total":"20"}]
183	8	56	\N	20	50	30	0		2025-01-19 14:31:47.811	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
184	8	56	\N	20	20	0	0		2025-01-19 14:33:01.586	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
185	8	56	\N	20	20	0	0		2025-01-19 14:33:21.38	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
186	8	56	\N	20	20	0	0		2025-01-19 14:33:56.879	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
187	8	56	\N	20	20	0	0		2025-01-19 14:34:38.722	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
188	8	56	\N	20	50	30	0		2025-01-19 14:35:09.745	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
189	8	56	\N	20	20	0	0		2025-01-19 14:37:06.091	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
190	8	56	\N	58	100	42	0		2025-01-19 14:37:56.244	[{"name":"leche lala","price":"20","amount":"1","total":"20"},{"name":"cheetos hot","price":"19","amount":"2","total":"38"}]
191	8	56	\N	58	100	42	0		2025-01-19 14:38:14.787	[{"name":"leche lala","price":"20","amount":"1","total":"20"},{"name":"cheetos hot","price":"19","amount":"2","total":"38"}]
192	8	56	\N	20	20	0	0		2025-01-19 14:43:19.323	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
193	8	56	\N	20	100	80	0		2025-01-19 14:43:55.754	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
194	8	56	\N	20	20	0	0		2025-01-19 14:47:54.86	[{"name":"leche lala","price":"20","amount":"1","total":"20"}]
196	8	51	\N	18	20	2	0		2025-02-02 14:44:15.218	[{"img":"http://192.168.1.74:4000/img/uploads/01ce75ee-ef00-491b-98ca-9bda55ac06b9.webp","name":"doritos","barcode":"doritos","price":18,"quantity":1,"discount":0,"purchaseUnit":"Pza","this_product_is_sold_in_bulk":""}]
197	8	51	\N	18	20	2	0		2025-02-02 14:47:43.403	[]
198	8	51	\N	18	20	2	0		2025-02-02 14:54:18.298	[]
199	8	51	\N	36	100	64	0		2025-02-02 14:56:39.625	[{"nameProduct":"doritos","priceProduct":"doritos","amount":2,"totalPrice":36}]
200	8	51	\N	18	20	2	0		2025-02-02 14:56:50.927	[{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18}]
201	8	51	\N	36	100	64	0		2025-02-02 14:58:32.273	[{"nameProduct":"doritos","priceProduct":"doritos","amount":2,"totalPrice":36}]
202	8	51	\N	19	20	1	0		2025-02-03 11:26:35.987	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
203	8	51	\N	19	100	81	0		2025-02-03 11:28:12.467	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
204	8	51	\N	19	20	1	0		2025-02-03 11:31:27.944	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
205	8	51	\N	19	20	1	0		2025-02-03 11:42:57.408	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
206	8	51	\N	19	20	1	0		2025-02-03 11:46:33.807	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
207	8	51	\N	19	20	1	0		2025-02-03 11:47:09.336	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
208	8	51	\N	19	20	1	0		2025-02-03 11:50:08.866	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
209	8	51	\N	37	100	63	0		2025-02-03 11:55:20.941	[{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18},{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
210	8	51	\N	19	20	1	0		2025-02-03 13:47:48.741	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
211	8	51	\N	19	20	1	0		2025-02-03 13:50:16.709	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
212	8	51	\N	19	20	1	0		2025-02-03 13:51:59.407	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
213	8	51	\N	19	20	1	0		2025-02-03 13:52:26.512	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
214	8	51	\N	19	20	1	0		2025-02-03 13:53:08.561	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
215	8	51	\N	19	20	1	0		2025-02-03 13:53:58.621	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
216	8	51	\N	19	20	1	0		2025-02-03 13:55:00.033	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
217	8	51	\N	171	200	29	0		2025-02-03 13:55:22.083	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":9,"totalPrice":171}]
218	8	51	\N	19	20	1	0		2025-02-03 13:58:15.553	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
219	8	51	\N	19	100	81	0		2025-02-03 14:01:04.373	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
220	8	51	\N	19	20	1	0		2025-02-03 14:05:22.911	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
221	8	51	\N	19	20	1	0		2025-02-03 14:11:40.085	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
222	8	51	\N	19	20	1	0		2025-02-03 14:11:54.438	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
223	8	51	\N	19	20	1	0		2025-02-03 14:15:47.635	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
224	8	51	\N	19	20	1	0		2025-02-03 14:16:53.427	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
225	8	51	\N	19	20	1	0		2025-02-03 14:18:49.283	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
226	8	51	\N	59	100	41	0		2025-02-03 14:19:04.888	[{"nameProduct":"jitomate","priceProduct":"jitomate","amount":2,"totalPrice":40},{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
227	8	51	\N	20	20	0	0		2025-02-03 14:20:08.942	[{"nameProduct":"jitomate","priceProduct":"jitomate","amount":1,"totalPrice":20}]
228	8	51	\N	37	100	63	0		2025-02-03 14:43:31.083	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19},{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18}]
229	8	51	\N	18	20	2	0		2025-02-03 14:43:50.969	[{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18}]
230	8	51	\N	37	100	63	0		2025-02-03 15:13:25.333	[{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18},{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
231	8	51	\N	20	32	12	0		2025-02-03 15:13:34.472	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
232	8	56	\N	18	20	2	0		2025-02-03 15:14:53.408	[{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18}]
233	8	56	\N	18	20	2	0		2025-02-03 15:22:37.557	[{"nameProduct":"doritos","priceProduct":"doritos","amount":1,"totalPrice":18}]
234	8	56	\N	30	30	0	0		2025-02-07 22:19:53.19	[{"nameProduct":"gansito","priceProduct":"gansito","amount":3,"totalPrice":30},{"nameProduct":"Producto 3ex","priceProduct":"Producto 3ex","amount":1,"totalPrice":0}]
235	8	56	\N	10	20	10	0		2025-02-07 23:13:36.474	[{"nameProduct":"Producto 1ex","priceProduct":"Producto 1ex","amount":1,"totalPrice":10}]
236	8	56	4	19	20	1	0		2025-02-08 12:44:11.152	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
237	8	56	\N	19	20	1	0		2025-02-15 12:45:20.279	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
238	8	56	\N	5	5	0	0		2025-02-15 12:46:00.667	[{"nameProduct":"jamon","priceProduct":"jamon","amount":1,"totalPrice":5}]
239	8	56	\N	40	40	0	0		2025-02-23 12:42:54.998	[{"nameProduct":"hamburgesa big","priceProduct":"hamburgesa big","amount":2,"totalPrice":40}]
240	8	56	\N	20	20	0	0		2025-02-28 22:51:38.549	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
241	8	56	\N	20	20	0	0		2025-02-28 23:09:33.38	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
242	8	56	\N	20	20	0	0		2025-02-28 23:12:35.171	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
243	8	56	\N	20	20	0	0		2025-02-28 23:14:44.425	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
244	8	56	\N	20	20	0	0		2025-02-28 23:16:18.342	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
245	8	56	\N	10	20	10	0		2025-02-28 23:21:14.682	[{"nameProduct":"gansito","priceProduct":"gansito","amount":1,"totalPrice":10}]
246	8	56	\N	10	20	10	0		2025-02-28 23:21:22.585	[{"nameProduct":"gansito","priceProduct":"gansito","amount":1,"totalPrice":10}]
247	8	56	\N	10	20	10	0		2025-02-28 23:22:25.744	[{"nameProduct":"gansito","priceProduct":"gansito","amount":1,"totalPrice":10}]
248	8	56	\N	10	20	10	0		2025-02-28 23:30:56.104	[{"nameProduct":"gansito","priceProduct":"gansito","amount":1,"totalPrice":10}]
249	8	56	\N	10	20	10	0		2025-02-28 23:32:42.829	[{"nameProduct":"gansito","priceProduct":"gansito","amount":1,"totalPrice":10}]
250	8	56	\N	10	20	10	0		2025-02-28 23:33:44.275	[{"nameProduct":"gansito","priceProduct":"gansito","amount":1,"totalPrice":10}]
251	8	56	\N	20	101010	100990	0		2025-03-01 09:44:22.576	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
252	8	56	\N	20	101010	100990	0		2025-03-01 09:45:01.434	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
253	8	56	\N	20	101010	100990	0		2025-03-01 09:48:34.463	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
254	8	56	\N	20	30	10	0		2025-03-01 09:53:51.886	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
255	8	56	\N	20	30	10	0		2025-03-01 09:55:48.446	[{"nameProduct":"leche lala","priceProduct":"leche lala","amount":1,"totalPrice":20}]
256	8	56	\N	19	20	1	0		2025-03-08 09:31:11.677	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
257	8	56	\N	19	20	1	0		2025-03-08 09:38:56.031	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
258	8	56	\N	19	20	1	0		2025-03-08 10:26:16.277	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
259	8	56	\N	19	20	1	0		2025-03-08 10:38:08.19	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
260	8	56	\N	19	20	1	0		2025-03-08 10:45:10.788	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
261	8	56	\N	19	20	1	0		2025-03-15 20:12:34.806	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
262	8	56	\N	19	20	1	0		2025-03-15 20:16:26.471	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
263	8	56	\N	19	20	1	0		2025-03-15 20:20:38.372	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
264	8	56	\N	19	20	1	0		2025-03-15 20:28:48.095	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
265	8	56	\N	19	20	1	0		2025-03-15 20:28:50.483	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
266	8	56	\N	19	20	1	0		2025-03-15 20:31:53.033	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":1,"totalPrice":19}]
267	8	56	\N	133	133	0	0		2025-03-15 20:34:03.736	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":7,"totalPrice":133}]
268	8	56	\N	48	50	2	0		2025-03-16 12:29:18.112	[{"nameProduct":"coca cola","priceProduct":"coca cola","amount":4,"totalPrice":48}]
269	8	56	\N	19	20	1	0		2025-03-21 22:24:41.5	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
270	8	56	\N	19	20	1	0		2025-03-21 22:25:21.754	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
271	8	56	\N	19	20	1	0		2025-03-21 22:25:40.846	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
272	8	56	\N	19	20	1	0		2025-03-21 22:26:09.339	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
273	8	56	\N	12	20	8	0		2025-03-22 15:05:14.642	[{"nameProduct":"coca cola","priceProduct":"coca cola","amount":1,"totalPrice":12}]
274	8	56	\N	12	20	8	0		2025-03-22 15:06:00.99	[{"nameProduct":"coca cola","priceProduct":"coca cola","amount":1,"totalPrice":12}]
275	8	56	\N	12	20	8	0		2025-03-22 15:31:30.029	[{"nameProduct":"coca cola","priceProduct":"coca cola","amount":1,"totalPrice":12}]
276	8	56	\N	38	40	2	0		2025-03-22 15:32:33.609	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":2,"totalPrice":38}]
277	8	56	\N	38	40	2	0		2025-03-22 15:34:12.251	[{"nameProduct":"cheetos verdes","priceProduct":"cheetos verdes","amount":2,"totalPrice":38}]
278	8	56	\N	12	20	8	0		2025-03-22 15:34:29.954	[{"nameProduct":"coca cola","priceProduct":"coca cola","amount":1,"totalPrice":12}]
279	8	56	\N	57	60	3	0		2025-03-22 16:04:53.203	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":3,"totalPrice":57}]
280	8	56	\N	38	40	2	0		2025-03-22 16:06:34.944	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":2,"totalPrice":38}]
281	8	56	\N	38	40	2	0		2025-03-22 16:11:26.82	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":2,"totalPrice":38}]
282	8	56	\N	38	40	2	0		2025-03-22 16:16:57.242	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":2,"totalPrice":38}]
283	8	56	\N	19	20	1	0		2025-03-22 16:19:02.488	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
284	8	56	\N	19	19	0	0		2025-03-22 16:21:22.413	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
285	8	56	\N	57	60	3	0		2025-03-22 16:23:40.447	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":3,"totalPrice":57}]
286	8	56	\N	57	60	3	0		2025-03-22 16:30:37.335	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":3,"totalPrice":57}]
287	8	56	\N	57	60	3	0		2025-03-22 16:32:16.769	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":3,"totalPrice":57}]
288	8	56	\N	19	20	1	0		2025-03-22 16:33:29.095	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
289	8	56	\N	19	20	1	0		2025-03-23 11:42:39.677	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
290	8	56	\N	19	20	1	0		2025-03-23 14:06:28.644	[{"nameProduct":"cheetos hot","priceProduct":"cheetos hot","amount":1,"totalPrice":19}]
291	8	56	\N	150	150	0	0		2025-03-24 08:44:06.639	[{"nameProduct":"paracetamol","priceProduct":"paracetamol","amount":3,"totalPrice":150}]
292	8	56	\N	37.8	40	2.200000000000003	0		2025-03-31 09:34:58.035	[{"nameProduct":"doritos","priceProduct":"doritos","amount":3,"totalPrice":54}]
\.


--
-- TOC entry 4048 (class 0 OID 102726)
-- Dependencies: 242
-- Data for Name: facture; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".facture ("Invoice Number", id_companies, id_branches, id_employees, id_customers, id_commanders, name_customer, email_customer, address, transition_type, payment_reference, creation_date, payment_date, type_of_documentation, status, paid) FROM stdin;
\.


--
-- TOC entry 4146 (class 0 OID 112928)
-- Dependencies: 340
-- Data for Name: history_move_lot; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".history_move_lot (id, id_companies, id_branches, id_employees, id_lots, "newCant", type_move, date_move) FROM stdin;
1	1	8	56	13	5	Venta	2025-03-23 11:42:39.703056
2	1	8	56	2	10	Ajuste de inventario	2025-03-23 11:43:04.856866
3	1	8	56	13	4	Venta	2025-03-23 14:06:28.659111
4	1	8	56	14	7	Venta	2025-03-24 08:44:06.661072
5	1	8	56	2	16	Ajuste de inventario	2025-03-29 20:00:14.484505
6	1	8	56	3	20	Ajuste de inventario	2025-03-29 20:00:20.344011
7	1	8	56	2	20	Ajuste de inventario	2025-03-29 20:18:05.262566
8	1	8	56	3	20	Ajuste de inventario	2025-03-30 08:46:32.114463
\.


--
-- TOC entry 4049 (class 0 OID 102733)
-- Dependencies: 243
-- Data for Name: managers; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".managers (id, id_branches, id_employees) FROM stdin;
\.


--
-- TOC entry 4051 (class 0 OID 102737)
-- Dependencies: 245
-- Data for Name: order; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch"."order" (id, id_branches, id_commanders, id_employees, name_customer, cellphone, phone, address, comment, status) FROM stdin;
16	8	126	51	Olinka			Reyna		en-progreso
8	8	112	51	Alexander 			Gutenberg 310		\N
4	8	108	51	eduardo			GUTEMBERG 310		enviado
7	8	111	\N	ed			ed7		entregado
13	8	123	\N	sergio			GUTEMBERG 310		enviado
17	8	127	51	Eduardo antonio			gertrudis uribe 255		entregado
1	8	104	51	eduardo entregado			GUTEMBERG 310		en-progreso
12	8	122	51	sergio			GUTEMBERG 310		entregado
14	8	124	\N	sergio			GUTEMBERG 310		enviado
\.


--
-- TOC entry 4053 (class 0 OID 102744)
-- Dependencies: 247
-- Data for Name: pack_reservation; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".pack_reservation (id, name, description, number_of_adult, number_of_children, price_for_children, price_for_adult, id_branches) FROM stdin;
\.


--
-- TOC entry 4144 (class 0 OID 112833)
-- Dependencies: 338
-- Data for Name: prescription; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".prescription (id, recipe_folio, doctor_id, doctor_name, date_prescription, retained, amount, comment, id_companies, id_branches, id_employees, id_dishes_and_combos, id_lots, id_customers) FROM stdin;
1	a	a	a	2025-03-22 00:00:00	t	2		1	8	56	7	12	\N
2	a	a	a	2025-03-22 00:00:00	t	1		1	8	56	7	13	\N
3	a	a	a	2025-03-22 00:00:00	t	2		1	8	56	7	12	\N
4	a	a	a	2025-03-22 00:00:00	t	1		1	8	56	7	13	\N
5	a	a	a	2025-03-22 00:00:00	t	1		1	8	56	7	13	\N
6	a	a	a	2025-03-23 00:00:00	t	1		1	8	56	7	13	\N
7	s	s	s	2025-03-31 00:00:00	f	1		1	8	56	7	13	\N
8	rs	rs	rs	2025-03-24 00:00:00	f	3		1	8	56	53	14	\N
\.


--
-- TOC entry 4055 (class 0 OID 102750)
-- Dependencies: 249
-- Data for Name: providers; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".providers (id, id_branches, name, representative, cell_phone, phone, email, credit_limit, credit_days, comment, business_name, business_address, business_rfc, business_curp, business_postal_code, business_phone, business_cell_phone, website, rfc, curp, category, type, business_representative) FROM stdin;
2	\N	Carniceria	Carnicero	1111	1111	carniseria4848@Outlook.es	0	0													company	
3	\N	provider 2	tu			provider2@Outlook.es	1	0													company	
4	\N	Chicken	Chicken			kfc123@Outlook.es	0	0													company	
6	8	Masa 	Dulce María 	123 456 789	123 456 789	masa@hotmail.com	0	0													individual	
5	8	Carne 	Miguel Alexander 			kfc123@Outlook.es	0	0												Carnes	individual	
7	8	bimbo	juan camionero bimbo			juan@bimbo.es	0	0		bimbo											company	camionero bimbo
\.


--
-- TOC entry 4057 (class 0 OID 102756)
-- Dependencies: 251
-- Data for Name: reservation; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".reservation (id, id_branches, id_tables, id_pack_reservation, customer_name, customer_phone, customer_email, reservation_date, reservation_time, reason, number_of_adult, number_of_children, commentary, status) FROM stdin;
\.


--
-- TOC entry 4059 (class 0 OID 102762)
-- Dependencies: 253
-- Data for Name: restaurant_area; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".restaurant_area (id, id_branches, name, description, floor) FROM stdin;
\.


--
-- TOC entry 4061 (class 0 OID 102768)
-- Dependencies: 255
-- Data for Name: tables; Type: TABLE DATA; Schema: Branch; Owner: postgres
--

COPY "Branch".tables (id, id_branches, id_restaurant_area, name, table_number, num_customers) FROM stdin;
\.


--
-- TOC entry 4119 (class 0 OID 103590)
-- Dependencies: 313
-- Data for Name: appointment; Type: TABLE DATA; Schema: CRM; Owner: postgres
--

COPY "CRM".appointment (id, id_prospects, location, notes, affair, meeting_date, duration_in_minutes, id_companies, id_branches, id_employees, end_date, color) FROM stdin;
1	1			primera cita	2024-09-13 12:53:00	\N	1	8	\N	\N	\N
4	1			tercera cita	2024-09-17 11:20:00	\N	1	8	56	2024-09-15 00:20:00	#ff0000
5	1	ninguna		provar semana	2024-09-21 05:37:00	\N	1	8	56	2024-09-21 08:37:00	#ffdd00
2	1	ninguna	nota	primera cita	2024-09-15 10:40:00	\N	1	8	56	2024-09-15 15:47:00	#00ff40
6	1			probar semana x2	2024-09-22 17:38:00	\N	1	8	56	2024-09-22 18:38:00	#ff0000
9	9			ejemplo	2024-12-13 17:00:00	\N	1	8	56	2024-12-13 19:00:00	#007bff
14	9			primera cita	2024-12-13 17:52:00	\N	1	8	56	2024-12-13 18:52:00	#007bff
15	9			primera cita	2024-12-13 18:18:00	\N	1	8	56	2024-12-13 06:18:00	#007bff
16	9			primera cita	2024-12-13 19:35:00	\N	1	8	56	2024-12-13 21:35:00	#007bff
17	9			primera cita	2024-12-13 19:38:00	\N	1	8	56	2024-12-13 07:38:00	#007bff
18	9			primera cita	2024-12-13 19:44:00	\N	1	8	56	2024-12-13 07:44:00	#007bff
19	9			primera cita	2024-12-13 19:45:00	\N	1	8	56	2024-12-13 07:45:00	#007bff
20	9			1	2024-12-13 19:55:00	\N	1	8	56	2024-12-13 07:55:00	#007bff
21	9		cita	cita 3	2024-12-17 20:41:00	\N	1	8	56	2024-12-17 20:41:00	#007bff
22	9		c	c	2024-12-17 20:43:00	\N	1	8	56	2024-12-17 20:43:00	#007bff
23	9		CRM	CRM	2024-12-17 20:52:00	\N	1	8	56	2024-12-18 20:52:00	#007bff
24	9			primera cita	2025-03-30 11:44:00	\N	1	8	56	2025-03-30 13:44:00	#007bff
25	8			primera dos	2025-03-31 11:44:00	\N	1	8	56	2025-03-31 13:44:00	#007bff
\.


--
-- TOC entry 4126 (class 0 OID 111967)
-- Dependencies: 320
-- Data for Name: history_prospects; Type: TABLE DATA; Schema: CRM; Owner: postgres
--

COPY "CRM".history_prospects (id, id_prospects, id_users, comment, link, creation_date) FROM stdin;
1	9	2	Se creó una cita con el cliente para el día 2024-12-13T19:35		2024-12-13 19:35:48.248772
2	9	2	Se creó una cita con el cliente para el día 2024-12-13T19:38		2024-12-13 19:38:05.741828
3	9	2	Se creó una cita con el cliente para el día 2024-12-13T19:44		2024-12-13 19:44:05.987371
4	9	2	Se creó una cita con el cliente para el día 2024-12-13T19:45		2024-12-13 19:45:18.184711
5	9	2	Se creó una cita con el cliente para el día 2024-12-13T19:55		2024-12-13 19:55:17.400273
6	9	2	mi primera nota		2024-12-13 20:39:10.729531
7	9	2	a	a	2024-12-13 20:41:05.605405
8	9	2	a	a	2024-12-13 20:43:51.867241
9	9	2	s	s	2024-12-13 20:45:22.404155
10	9	2	10		2024-12-13 20:45:55.826856
11	9	2	11		2024-12-13 20:45:57.847807
12	9	2	12		2024-12-13 20:46:25.989081
13	9	2	14		2024-12-13 20:46:29.051939
14	9	2	1		2024-12-13 20:46:41.8407
15	9	2	2		2024-12-13 20:46:43.590307
16	9	2	3		2024-12-13 20:46:45.47306
17	9	2	4		2024-12-13 20:46:47.308309
18	9	2	5		2024-12-13 20:46:49.110093
19	9	2	6		2024-12-13 20:46:50.868561
20	9	2	7		2024-12-13 20:46:52.48255
21	9	2	8		2024-12-13 20:46:55.772835
22	9	2	9		2024-12-13 20:46:58.691702
23	9	2	10		2024-12-13 20:47:01.254315
24	9	2	11		2024-12-13 20:48:38.886901
25	9	2	12		2024-12-13 20:48:41.325772
26	9	2	13		2024-12-13 20:48:43.630698
27	9	2	14		2024-12-13 20:48:46.087284
28	9	2	15		2024-12-13 20:48:48.383256
29	9	2	16		2024-12-13 20:48:50.905183
30	9	2	17		2024-12-13 20:48:54.241306
31	9	2	18		2024-12-13 20:48:56.777891
32	9	2	19		2024-12-13 20:48:59.846662
33	9	2	20		2024-12-13 20:49:03.035324
34	\N	2	a	\N	2024-12-16 17:11:34.883029
35	9	2	a	\N	2024-12-16 17:13:37.760498
36	9	2	a	\N	2024-12-16 17:16:33.069064
37	9	2	hola	\N	2024-12-16 17:17:34.034922
38	9	2	A	\N	2024-12-16 17:18:39.215614
39	9	2	Se envio un mensaje de whatsapp: \nhola	\N	2024-12-16 17:26:02.024273
40	9	2	Se envio un mensaje de whatsapp: \na	\N	2024-12-16 17:28:06.439786
41	9	2	Se envio un mensaje de whatsapp: \nhola whatsapp	\N	2024-12-16 17:28:55.736497
42	9	2	Se envio un mensaje de whatsapp: \nhola desde el CRM	\N	2024-12-17 20:41:07.419949
43	9	2	Se creó una cita con el cliente para el día 2024-12-17T20:43		2024-12-17 20:43:40.29281
44	9	2	Se creó una cita con el cliente para el día 2024-12-17T20:52		2024-12-17 20:52:37.622783
45	9	2	Se creó una cita con el cliente para el día 2025-03-30T11:44		2025-03-30 11:44:11.834591
46	8	2	Se creó una cita con el cliente para el día 2025-03-31T11:44		2025-03-30 11:44:55.981148
\.


--
-- TOC entry 4115 (class 0 OID 103574)
-- Dependencies: 309
-- Data for Name: product_to_sell; Type: TABLE DATA; Schema: CRM; Owner: postgres
--

COPY "CRM".product_to_sell (id, name, color, id_companies) FROM stdin;
1	Ninguno		\N
\.


--
-- TOC entry 4121 (class 0 OID 103599)
-- Dependencies: 315
-- Data for Name: prospects; Type: TABLE DATA; Schema: CRM; Owner: postgres
--

COPY "CRM".prospects (id, name, email, estimated_income, probability, cellphone, phone, grades, planned_closure, creation_date, company_name, address, website, contact_name, company_cellphone, company_phone, priority, color, id_employees, id_product_to_sell, id_sales_team, id_sales_stage, id_companies, id_branches, type_customer, expected_closing_percentage, category, salesrep, notes) FROM stdin;
7	 Pizzería Basiliana	eje14848@Outlook.es	0.00	0.00			\N	2024-11-09	2024-11-09	Pizzería Basiliana				444 315 3604		0	#000000	56	1	1	5	1	8	t	0			<h1><strong>Pizzería Basiliana</strong></h1><p>Las mejores pizzas estilo New York y Detroit hechas en horno de piedra con los mejores ingredientes.</p><p>https://www.canacosanluis.com/directorio/empresas/pizzeria-basiliana/</p>
4	customer 1 customer 1 customer 1	customer123@Outlook.es	0.00	0.00	+52 444 357 9030	111	\N	2024-09-06	2024-09-06	customer 2 company		customer website	customer contact	000 123	000 123	3	#007bff	56	1	1	4	1	8	f	0			
10	Aventours	agencia.aventourslp@gmail.com	0.00	0.00	444 126 7082	444 126 7082	\N	2024-11-30	2024-11-09	Agencia de Viajes Aventours Slp		https://aventourslp.com.mx		444 126 7082		3	#fd7e14	56	1	1	5	1	8	t	0	Agencia de Viajes		<h2><strong>Agencia de Viajes Aventours Slp</strong></h2><p>Somos una Agencia de viajes comprometida para ofrecerle el mejor servicio y atención para que pase unas excelentes vacaciones, nos adaptamos a cualquier presupuesto!!</p><ul><li>paso 1</li><li>paso 2</li><li>paso 3</li></ul><p><a href="https://aventourslp.com.mx" target="_blank">https://aventourslp.com.mx</a></p>
8	Malanta	eje14848@Outlook.es	0.00	0.00		4441230870	\N	2024-11-09	2024-11-09	Malanta Consultoría & Seguros				4441230870		0	#000000	56	1	1	5	1	8	t	0	Consultoría & Seguros	CRM y Pagina Web	<h1><strong>Malanta Consultoría &amp; Seguros</strong></h1><p>Somos un despacho de seguros enfocado en ayudar a nuestros clientes en la protección de su patrimonio. Somos un despacho de seguros enfocado en el ámbito personal. Nuestra misión es brindar a nuestros clientes un servicio integral en la protección de sus bienes y su patrimonio. En resumen, buscamos ayudar a nuestros clientes a proteger lo que más valoran y a alcanzar sus metas financieras. https://www.linkedin.com/company/malantaco/?originalSubdomain=mx</p>
6	DISOÑADORES DE VIAJES INTEGRADORA TURISTICA	disonadoresdeviajes@gmail.com	0.00	0.00			\N	2024-11-09	2024-11-09	DISOÑADORES DE VIAJES INTEGRADORA TURISTICA		https://disonadoresdeviajes.com		+52 473 119 0280	473 119 0280	3	#006eff	56	1	1	5	1	8	t	0	Agencia de viajes		<h1><strong>DISOÑADORES DE VIAJES INTEGRADORA TURISTICA</strong></h1><p>Los mejores viajes internacionales y nacionales, hotelería, circuitos turísticos, grupos y bodas en playa y más.</p><p>https://www.canacosanluis.com/directorio/empresas/disonadores-de-viajes-integradora-turistica/</p>
9	Notario Público 26 de San Luis Potosi	not26slp@gmail.com	0.00	0.00	+52 444 357 9030	444 811 5476	\N	2024-12-20	2024-11-09	Notario Público 26 de San Luis Potosi				444 811 5476	444 811 5476	3	#0d6efd	56	1	1	2	1	8	f	0	Notaria	CRM y Pagina Web	<p><strong>Notaría </strong>26 en <s style="color: rgb(230, 0, 0);"><u>San Luis Potosí </u></s>ofrece una amplia gama de servicios notariales para satisfacer sus necesidades legales. Especializados en documentos hipotecarios, ofrecemos asesoramiento experto y manejo de transacciones inmobiliarias. Nuestro equipo también se destaca en asuntos corporativos, proporcionando apoyo legal esencial para empresas. Para mayor comodidad, brindamos servicios de gestoría, facilitando trámites y procesos administrativos. La notaría se encarga de la certificación de documentos, asegurando su validez y autenticidad. Además, somos expertos en traslativa de dominio, garantizando una transferencia de propiedad segura y legal. En Notaría 26, su tranquilidad legal es nuestra prioridad. https://efirma.com/directorio/notario/San%20Luis%20Potosí/San%20Luis%20Potosi/26</p>
\.


--
-- TOC entry 4113 (class 0 OID 103566)
-- Dependencies: 307
-- Data for Name: sales_stage; Type: TABLE DATA; Schema: CRM; Owner: postgres
--

COPY "CRM".sales_stage (id, name, "position", id_companies) FROM stdin;
5	Propuestas	0	1
2	Contactados	1	1
1	Calificado	2	1
4	Ganado	3	1
\.


--
-- TOC entry 4117 (class 0 OID 103582)
-- Dependencies: 311
-- Data for Name: sales_team; Type: TABLE DATA; Schema: CRM; Owner: postgres
--

COPY "CRM".sales_team (id, name, commission, id_companies) FROM stdin;
1	Ventas	0.00	1
\.


--
-- TOC entry 4128 (class 0 OID 111988)
-- Dependencies: 322
-- Data for Name: chats; Type: TABLE DATA; Schema: Chat; Owner: postgres
--

COPY "Chat".chats (id_chat, chat_name, created_at, user_one_id, user_two_id) FROM stdin;
18	\N	2024-12-20 11:19:39.150972	eje14848@Outlook.es	sam123@Outlook.es
19	\N	2024-12-20 11:33:46.103296	eje14848@Outlook.es	eje14848@Outlook.es
\.


--
-- TOC entry 4133 (class 0 OID 112031)
-- Dependencies: 327
-- Data for Name: message_status; Type: TABLE DATA; Schema: Chat; Owner: postgres
--

COPY "Chat".message_status (id_status, message_id, user_id, is_read, read_at) FROM stdin;
17	23	eje14848@Outlook.es	f	\N
18	24	eje14848@Outlook.es	f	\N
19	25	eje14848@Outlook.es	f	\N
20	26	eje14848@Outlook.es	f	\N
21	27	eje14848@Outlook.es	f	\N
22	28	eje14848@Outlook.es	f	\N
23	29	eje14848@Outlook.es	f	\N
24	30	eje14848@Outlook.es	f	\N
25	31	eje14848@Outlook.es	f	\N
26	32	sam123@Outlook.es	f	\N
27	33	sam123@Outlook.es	f	\N
28	34	sam123@Outlook.es	f	\N
29	35	sam123@Outlook.es	f	\N
30	36	sam123@Outlook.es	f	\N
31	37	sam123@Outlook.es	f	\N
32	38	sam123@Outlook.es	f	\N
33	39	eje14848@Outlook.es	f	\N
34	40	sam123@Outlook.es	f	\N
35	41	sam123@Outlook.es	f	\N
36	42	eje14848@Outlook.es	f	\N
37	43	sam123@Outlook.es	f	\N
38	44	sam123@Outlook.es	f	\N
39	45	sam123@Outlook.es	f	\N
40	46	sam123@Outlook.es	f	\N
41	47	sam123@Outlook.es	f	\N
42	48	sam123@Outlook.es	f	\N
43	49	eje14848@Outlook.es	f	\N
44	50	eje14848@Outlook.es	f	\N
45	51	eje14848@Outlook.es	f	\N
46	52	eje14848@Outlook.es	f	\N
47	53	eje14848@Outlook.es	f	\N
48	54	eje14848@Outlook.es	f	\N
49	55	eje14848@Outlook.es	f	\N
50	56	eje14848@Outlook.es	f	\N
51	57	eje14848@Outlook.es	f	\N
52	58	eje14848@Outlook.es	f	\N
53	59	eje14848@Outlook.es	f	\N
54	60	eje14848@Outlook.es	f	\N
55	61	eje14848@Outlook.es	f	\N
56	62	eje14848@Outlook.es	f	\N
57	63	eje14848@Outlook.es	f	\N
58	64	eje14848@Outlook.es	f	\N
59	65	eje14848@Outlook.es	f	\N
60	66	eje14848@Outlook.es	f	\N
61	67	eje14848@Outlook.es	f	\N
62	68	eje14848@Outlook.es	f	\N
63	69	eje14848@Outlook.es	f	\N
64	70	eje14848@Outlook.es	f	\N
65	71	eje14848@Outlook.es	f	\N
66	72	eje14848@Outlook.es	f	\N
67	73	eje14848@Outlook.es	f	\N
68	74	eje14848@Outlook.es	f	\N
69	75	eje14848@Outlook.es	f	\N
\.


--
-- TOC entry 4131 (class 0 OID 112011)
-- Dependencies: 325
-- Data for Name: messages; Type: TABLE DATA; Schema: Chat; Owner: postgres
--

COPY "Chat".messages (id_message, chat_id, user_id, content, sent_at) FROM stdin;
1	\N	\N	hola	2024-12-20 10:57:24.43822
2	\N	\N	hola	2024-12-20 10:57:54.636425
3	\N	\N	hola	2024-12-20 11:03:08.042595
4	\N	\N	hola	2024-12-20 11:09:36.589457
22	18	eje14848@Outlook.es	hola	2024-12-20 11:22:58.9107
23	18	eje14848@Outlook.es	hola	2024-12-20 11:29:40.647761
24	18	eje14848@Outlook.es	hola	2024-12-20 11:29:48.323887
25	18	eje14848@Outlook.es	hola	2024-12-20 11:29:59.924322
26	18	eje14848@Outlook.es	hola	2024-12-20 11:30:00.431344
27	18	eje14848@Outlook.es	hola	2024-12-20 11:30:00.742027
28	18	eje14848@Outlook.es	hola	2024-12-20 11:32:46.61665
29	18	eje14848@Outlook.es	hola	2024-12-20 11:33:30.927064
30	19	eje14848@Outlook.es	hola	2024-12-20 11:33:46.108023
31	18	eje14848@Outlook.es	hola	2024-12-20 11:38:31.535409
32	18	sam123@Outlook.es	hola	2024-12-20 11:38:55.91638
33	18	sam123@Outlook.es	hola	2024-12-20 11:39:16.692637
34	18	sam123@Outlook.es	hola	2024-12-20 11:43:00.519938
35	18	sam123@Outlook.es	hola	2024-12-20 11:45:36.532462
36	18	sam123@Outlook.es	hola amgios	2024-12-20 11:46:28.34378
37	18	sam123@Outlook.es	hola	2024-12-20 11:49:02.216987
38	18	sam123@Outlook.es	hola amigo ejemplo 1	2024-12-20 11:52:24.686112
39	18	eje14848@Outlook.es	hola sam	2024-12-20 11:52:38.274887
40	18	sam123@Outlook.es	hola	2024-12-20 12:00:35.840079
41	18	sam123@Outlook.es	a	2024-12-20 12:01:21.037287
42	18	eje14848@Outlook.es	hola sam	2024-12-20 12:01:42.595189
43	18	sam123@Outlook.es	a	2024-12-20 12:02:58.92475
44	18	sam123@Outlook.es	haz caso	2024-12-20 12:03:25.669375
45	18	sam123@Outlook.es	a	2024-12-20 12:04:44.999453
46	18	sam123@Outlook.es	23	2024-12-20 12:04:50.740992
47	18	sam123@Outlook.es	a	2024-12-20 12:05:22.244976
48	18	sam123@Outlook.es	a	2024-12-20 12:06:22.711233
49	19	eje14848@Outlook.es	hola	2025-03-06 23:50:07.295754
50	19	eje14848@Outlook.es	hola	2025-03-06 23:50:12.751871
51	19	eje14848@Outlook.es	holas	2025-03-06 23:50:14.543314
52	19	eje14848@Outlook.es	holas	2025-03-06 23:50:14.871333
53	19	eje14848@Outlook.es	holas	2025-03-06 23:50:15.120017
54	19	eje14848@Outlook.es	holas	2025-03-06 23:50:24.432575
55	19	eje14848@Outlook.es	holas	2025-03-06 23:50:24.615554
56	19	eje14848@Outlook.es	holas	2025-03-06 23:50:41.311924
57	19	eje14848@Outlook.es	holas	2025-03-06 23:50:41.535083
58	19	eje14848@Outlook.es	holas	2025-03-06 23:50:43.694966
59	19	eje14848@Outlook.es	holas	2025-03-06 23:50:43.902771
60	19	eje14848@Outlook.es	holas	2025-03-06 23:50:44.126915
61	19	eje14848@Outlook.es	holas	2025-03-06 23:50:44.501848
62	19	eje14848@Outlook.es	holas	2025-03-06 23:50:44.73556
63	19	eje14848@Outlook.es	holas	2025-03-06 23:50:44.902862
64	19	eje14848@Outlook.es	hola	2025-03-06 23:51:50.25609
65	19	eje14848@Outlook.es	s	2025-03-06 23:52:51.54821
66	19	eje14848@Outlook.es	s	2025-03-06 23:53:10.27491
67	19	eje14848@Outlook.es	s	2025-03-06 23:53:43.002894
68	19	eje14848@Outlook.es	s	2025-03-06 23:53:43.671123
69	19	eje14848@Outlook.es	s	2025-03-06 23:53:43.855116
70	19	eje14848@Outlook.es	s	2025-03-06 23:53:44.118911
71	19	eje14848@Outlook.es	s	2025-03-06 23:53:44.351125
72	19	eje14848@Outlook.es	s	2025-03-06 23:54:17.875474
73	19	eje14848@Outlook.es	s	2025-03-06 23:55:04.828211
74	19	eje14848@Outlook.es	s	2025-03-06 23:57:50.354231
75	19	eje14848@Outlook.es	s	2025-03-06 23:59:06.945907
\.


--
-- TOC entry 4129 (class 0 OID 111995)
-- Dependencies: 323
-- Data for Name: user_chats; Type: TABLE DATA; Schema: Chat; Owner: postgres
--

COPY "Chat".user_chats (user_id, chat_id) FROM stdin;
\.


--
-- TOC entry 4063 (class 0 OID 102773)
-- Dependencies: 257
-- Data for Name: branches; Type: TABLE DATA; Schema: Company; Owner: postgres
--

COPY "Company".branches (id, id_companies, name_branch, alias, representative, id_country, municipality, city, cologne, address, num_ext, num_int, postal_code, email_branch, cell_phone, phone, pack_branch, token_uber, token_rappi, website_creation, digital_menu, employee_schedules) FROM stdin;
25	22	Hamburguesas Galaxias	Hamburguesas Galaxias	admin_Hamburguesas Galaxias	120	Benito Juarez	Cancún	galaxias del sol	sm.253c mz3 lt 12 calle pagalo	253	18	77518	admin@hamburguesasgalaxias.com	+52 998 122 7735	+52 998 122 7735	3	\N	\N	2024-07-19	2024-07-19	2024-07-19
6	\N	branch 1	branch 1	yo	120	slp	slp	reyitos	slp			12345	hooters123@Outlook.es			0	\N	\N	2024-07-19	2024-07-19	2024-07-19
35	32	El Terrifier Cerveza	El Terrifier Cerveza	admin_El Terrifier Cerveza	1									5512577265	5512577265	0	\N	\N	2024-08-01	2024-08-01	2024-08-01
7	\N	Hooters Centro	Hooters Centro	yo	120	slp	slp	slp	slp			12345	hooter123@Outlook.es			0	\N	\N	2024-07-19	2024-07-19	2024-07-19
19	16	pizza hermanos	pizza hermanos	admin_pizza hermanos	1									444 357 9030	444 357 9030	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
20	17	Pizzas hermanos	Pizzas hermanos	admin_Pizzas hermanos	1									444 357 9030	444 357 9030	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
21	18	pizza hermanos	pizza hermanos	admin_pizza hermanos	1									444 357 9030	444 357 9030	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
36	33	CactusWingsMX	CactusWingsMX	admin_CactusWingsMX	1									4451540656	4451540656	0	\N	\N	2024-08-08	2024-08-08	2024-08-08
23	20	Prueba	Prueba	admin_Prueba	1									4443579030	4443579030	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
24	21	La REINA	La REINA	admin_La REINA	1									+529331246775	+529331246775	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
37	34	LIZBETH VASQUEZ	LIZBETH VASQUEZ	admin_LIZBETH VASQUEZ	1									0969445123	0969445123	0	\N	\N	2024-08-09	2024-08-09	2024-08-09
26	23	Salanghae Pizza 	Salanghae Pizza 	admin_Salanghae Pizza 	1									961 461 9590	961 461 9590	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
27	24	La Paloma	La Paloma	admin_La Paloma	1									961 215 5426	961 215 5426	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
38	35	Napole 	Napole 	admin_Napole 	1									987654321	987654321	0	\N	\N	2024-08-10	2024-08-10	2024-08-10
39	36	Tienda 	Tienda 	admin_Tienda 	1									6142445300	6142445300	0	\N	\N	2024-08-10	2024-08-10	2024-08-10
40	37	testing	testing	admin_testing	1									76499880	76499880	0	\N	\N	2024-08-10	2024-08-10	2024-08-10
41	38	Sisnodo	Sisnodo	admin_Sisnodo	1									4626296420	4626296420	0	\N	\N	2024-08-10	2024-08-10	2024-08-10
42	39	kalifa	kalifa	admin_kalifa	1									989313651	989313651	0	\N	\N	2024-08-10	2024-08-10	2024-08-10
28	25	masabor	masabor	admin_masabor	1									9811470015	9811470015	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
43	40	LUXXSOFT	LUXXSOFT	admin_LUXXSOFT	1									3108090853	3108090853	0	\N	\N	2024-08-10	2024-08-10	2024-08-10
29	26	Santa isabel	Santa isabel	admin_Santa isabel	1									6161079845	6161079845	0	\N	\N	2024-07-19	2024-07-19	2024-07-19
44	41	DARK FOOD KITCHEN 	DARK FOOD KITCHEN 	admin_DARK FOOD KITCHEN 	120	Merida	Yucatán 	Centro 	90 499d 			97000	darkfoodkitchen@gmail.com	+529901585129	+529901585129	0		\N	2024-08-11	2024-08-11	2024-08-11
17	1	sub activa	sub activa	sub activa	1	slp	slp	slp	slp			12345	eje14848@Outlook.es			2	\N	\N	2024-07-19	2024-07-19	2024-07-19
30	27	Food service	Food service	admin_Food service	1									6622331355	6622331355	0	\N	\N	2024-07-20	2024-07-20	2024-07-20
31	28	Tetsuqu2u228	Tetsuqu2u228	admin_Tetsuqu2u228	1									12345678912	12345678912	0	\N	\N	2024-07-24	2024-07-24	2024-07-24
32	29	Restaurante el corralito 	Restaurante el corralito 	admin_Restaurante el corralito 	1									5537016077	5537016077	0	\N	\N	2024-07-26	2024-07-26	2024-07-26
33	30	Pizzas hermanos	Pizzas hermanos	admin_Pizzas hermanos	1									444 357 9030	444 357 9030	0	\N	\N	2024-07-26	2024-07-26	2024-07-26
34	31	Pizzas hermanos	Pizzas hermanos	admin_Pizzas hermanos	1									444 357 9030	444 357 9030	0	\N	\N	2024-07-28	2024-07-28	2024-07-28
45	42	Campos Herramientas	Campos Herramientas	admin_Campos_Herramientas	1									camposss1@hotmail.co	camposss1@hotmail.co	0	\N	\N	2025-02-03	2025-02-03	2025-02-03
22	19	tu negocio	tu negocio	tu nombre	120	municipio	ciudad	colonia	direccion			12345	tucorreo@hotmail.com			0		\N	2024-08-03	2024-07-19	\N
8	1	ED sucursal	branch 2	yo	120	slp	slp	slp	address			12345	kfc123@Outlook.es	+52 444 444 444		2	no tengo	\N	2024-08-03	2024-07-19	\N
\.


--
-- TOC entry 4065 (class 0 OID 102783)
-- Dependencies: 259
-- Data for Name: customers; Type: TABLE DATA; Schema: Company; Owner: postgres
--

COPY "Company".customers (id, id_companies, first_name, second_name, last_name, id_country, states, city, street, num_ext, num_int, postal_code, email, phone, cell_phone, points, birthday, company_name, company_address, website, contact_name, company_cellphone, company_phone, type_customer) FROM stdin;
4	1	customer 1	customer 1	customer 1	120	slp	slp	slp				customer123@Outlook.es	111	111	0	2024-01-08	customer 2 company	customer address company	customer website	customer contact	000 123	000 123	f
\.


--
-- TOC entry 4067 (class 0 OID 102789)
-- Dependencies: 261
-- Data for Name: employees; Type: TABLE DATA; Schema: Company; Owner: postgres
--

COPY "Company".employees (id, id_companies, id_users, id_roles_employees, id_departments_employees, id_branches, city, street, num_ext, num_int, id_country, phone, cell_phone, nip) FROM stdin;
52	19	92	13	7	22					1			0000
53	20	94	14	8	23					1			0000
54	21	96	15	9	24					1			0000
57	23	98	17	11	26					1			0000
58	24	99	18	12	27					1			0000
59	25	100	19	13	28					1			0000
60	26	104	20	14	29					1			0000
61	26	105	20	14	29					120			0000
50	1	69	8	1	17					1			0000
63	27	107	21	15	30					1			0000
65	28	109	22	16	31					1			0000
66	29	110	23	17	32					1			0000
67	30	111	24	18	33					1			0000
55	22	97	16	10	25	Benito Juárez	sm.253 mz.3 lote.12 calle pagalo	18	sm	120	9982212560	9982212560	0000
68	31	117	25	19	34					1			0000
69	32	118	26	20	35					1			0000
70	33	119	28	22	36					1			0000
71	34	120	29	23	37					1			0000
72	35	121	30	24	38					1			0000
73	36	122	31	25	39					1			0000
74	37	123	32	26	40					1			0000
75	38	124	33	27	41					1			0000
76	39	125	34	28	42					1			0000
77	40	126	35	29	43					1			0000
78	41	127	36	30	44					1			0000
56	1	2	8	1	8					1			0000
51	1	71	9	1	8	slp	slp			120			0000
79	42	\N	\N	32	45					1			0000
80	1	129	9	1	8					120			0000
\.


--
-- TOC entry 4069 (class 0 OID 102794)
-- Dependencies: 263
-- Data for Name: departments_employees; Type: TABLE DATA; Schema: Employee; Owner: postgres
--

COPY "Employee".departments_employees (id, id_companies, description, name_departaments) FROM stdin;
5	\N		waiter
1	1	-	Cajas
6	1	Estos empleados son los encargados de cocinar los platillos 	Cocina 
7	19		Caja
8	20		Caja
9	21		Caja
10	22		Caja
11	23		Caja
12	24		Caja
13	25		Caja
14	26		Caja
15	27		Caja
16	28		Caja
17	29		Caja
18	30		Caja
19	31		Caja
20	32		Caja
22	33		Caja
23	34		Caja
24	35		Caja
25	36		Caja
26	37		Caja
27	38		Caja
28	39		Caja
29	40		Caja
30	41		Caja
32	42		Caja
\.


--
-- TOC entry 4071 (class 0 OID 102800)
-- Dependencies: 265
-- Data for Name: history_schedules; Type: TABLE DATA; Schema: Employee; Owner: postgres
--

COPY "Employee".history_schedules (id, id_branches, id_employees, id_schedules, date_finish, date_start) FROM stdin;
61	\N	\N	5	2024-03-31	2024-03-18
66	\N	\N	1	2024-03-31	2024-03-25
59	\N	\N	1	2024-03-31	2024-03-18
64	\N	\N	1	2024-03-31	2024-03-25
60	\N	\N	3	2024-03-31	2024-03-18
65	\N	\N	1	2024-03-31	2024-03-25
63	7	\N	\N	2024-03-31	2024-03-18
62	7	\N	\N	2024-03-31	2024-03-18
67	8	51	6	2024-06-09	2024-05-27
68	8	\N	6	2024-06-09	2024-05-27
69	8	56	6	2024-08-11	2024-08-05
70	8	51	6	2024-08-11	2024-08-05
72	8	56	6	2024-08-18	2024-08-12
73	8	51	6	2024-08-18	2024-08-12
75	8	56	6	2024-09-01	2024-08-19
76	8	51	6	2024-09-01	2024-08-19
78	8	56	6	2024-09-15	2024-09-09
79	8	51	6	2024-09-15	2024-09-09
81	8	56	6	2024-09-22	2024-09-16
82	8	51	6	2024-09-22	2024-09-16
84	8	56	6	2024-10-27	2024-10-21
85	8	51	6	2024-10-27	2024-10-21
71	8	\N	6	2024-08-11	2024-08-05
74	8	\N	6	2024-08-18	2024-08-12
77	8	\N	6	2024-09-01	2024-08-19
80	8	\N	6	2024-09-15	2024-09-09
83	8	\N	6	2024-09-22	2024-09-16
86	8	\N	6	2024-10-27	2024-10-21
\.


--
-- TOC entry 4073 (class 0 OID 102804)
-- Dependencies: 267
-- Data for Name: roles_employees; Type: TABLE DATA; Schema: Employee; Owner: postgres
--

COPY "Employee".roles_employees (id, id_companies, name_role, commissions, salary, discount_for_product, add_box, edit_box, delete_box, create_reservation, view_reservation, view_reports, add_customer, edit_customer, delete_customer, cancel_debt, offer_loan, get_fertilizer, view_customer_credits, send_email, add_employee, edit_employee, delete_employee, create_schedule, assign_schedule, view_schedule, create_type_user, create_employee_department, view_sale_history, delete_sale_history, view_movement_history, delete_movement_history, view_supplies, add_supplies, edit_supplies, delete_supplies, view_products, edit_products, delete_products, view_combo, add_combo, edit_combo, delete_combo, view_food_departament, add_food_departament, edit_food_departament, delete_food_departament, view_food_category, add_food_category, edit_food_category, delete_food_category, waste_report, add_provider, edit_provider, delete_provider, view_provider, sell, apply_discount, apply_returns, add_offers, edit_offers, delete_offers, change_coins, modify_hardware, modify_hardware_kitchen, give_permissions, currency, type_of_salary, app_point_sales, view_inventory, edit_inventory, employee_roles, edit_rol_employee, delete_rol_employee, employee_department, edit_employee_department, delete_employee_department, add_employee_roles, add_employee_department, view_employee) FROM stdin;
14	20	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
15	21	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
16	22	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
17	23	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
18	24	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
19	25	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
20	26	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
21	27	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
22	28	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
23	29	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
24	30	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
25	31	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
26	32	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
12	1	Cocinero 	0	20	0	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	f	f	f	f	f	f	f	f	f	f	f	f	f	f	mx	Hour	f	f	f	t	t	t	t	t	t	t	t	t
28	33	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
29	34	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
30	35	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
31	36	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
32	37	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
33	38	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
34	39	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
35	40	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
36	41	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t			f	f	f	t	t	t	t	t	t	t	t	t
9	1	Vendedor	0	1	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	f	t	f	f	f	f	f	f	f	f	t	t	t	f	f	f	f	t	t	t	t	t	t	t	t	f	f	f	f	f	t	f	f	f	f	f	f	f	f	f	mx	Minute	t	t	t	f	f	f	t	t	t	t	t	t
8	1	Admin	0	10	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	f	f	f	f	f	f	t	t	t	mx	Hour	t	t	t	t	t	t	t	t	t	t	t	t
13	19	Admin	0	0	0	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	f	f	f	f	f	f	t	t	t	mx	Minute	t	t	t	t	t	t	t	t	t	t	t	t
\.


--
-- TOC entry 4075 (class 0 OID 102868)
-- Dependencies: 269
-- Data for Name: schedules; Type: TABLE DATA; Schema: Employee; Owner: postgres
--

COPY "Employee".schedules (id, id_branches, color, name, monday, tuesday, wednesday, thursday, friday, saturday, sunday, ms, mf, ts, tf, ws, wf, ths, thf, fs, ff, sas, saf, sus, suf, time_worked, tolerance_time) FROM stdin;
1	5	#00ff62	schedule 1	t	f	f	t	t	t	f	13:33:00	13:33:00	00:00:00	00:00:00	00:00:00	00:00:00	13:33:00	13:33:00	11:01:00	23:01:00	11:01:00	23:01:00	00:00:00	00:00:00	\N	0
3	5	#ffab01	schedule 2	f	f	f	f	f	f	f	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	\N	0
5	5	#93e3fd	Schedule cierre	t	t	t	t	f	f	f	07:00:00	15:00:00	07:00:00	15:00:00	13:00:00	20:50:00	13:00:00	13:10:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	00:00:00	\N	15
6	8	#fff76b	Horario de la mañana 	t	t	t	t	t	t	f	08:00:00	16:00:00	08:00:00	16:00:00	08:00:00	16:00:00	08:00:00	16:00:00	08:00:00	16:00:00	08:00:00	12:00:00	00:00:00	00:00:00	\N	0
\.


--
-- TOC entry 4077 (class 0 OID 102872)
-- Dependencies: 271
-- Data for Name: country; Type: TABLE DATA; Schema: Fud; Owner: postgres
--

COPY "Fud".country (id, name) FROM stdin;
1	Afganistán
2	Albania
3	Alemania
4	Andorra
5	Angola
6	Antigua y Barbuda
7	Arabia Saudita
8	Argelia
9	Argentina
10	Armenia
11	Australia
12	Austria
13	Azerbaiyán
14	Bahamas
15	Bangladés
16	Barbados
17	Baréin
18	Bélgica
19	Belice
20	Benín
21	Bielorrusia
22	Birmania
23	Bolivia
24	Bosnia-Herzegovina
25	Botsuana
26	Brasil
27	Brunéi
28	Bulgaria
29	Burkina Faso
30	Burundi
31	Bután
32	Cabo Verde
33	Camboya
34	Camerún
35	Canadá
36	Catar
37	Chad
38	Chile
39	China
40	Chipre
41	Colombia
42	Comoras
43	Congo
44	Corea del Norte
45	Corea del Sur
46	Costa de Marfil
47	Costa Rica
48	Croacia
49	Cuba
50	Dinamarca
51	Dominica
52	Ecuador
53	Egipto
54	El Salvador
55	Emiratos Árabes Unidos
56	Eritrea
57	Eslovaquia
58	Eslovenia
59	España
60	Estados Unidos
61	Estonia
62	Esuatini
63	Etiopía
64	Filipinas
65	Finlandia
66	Fiyi
67	Francia
68	Gabón
69	Gambia
70	Georgia
71	Ghana
72	Granada
73	Grecia
74	Guatemala
75	Guinea
76	Guinea Ecuatorial
77	Guinea-Bisáu
78	Guyana
79	Haití
80	Honduras
81	Hungría
82	India
83	Indonesia
84	Irak
85	Irán
86	Irlanda
87	Islandia
88	Islas Marshall
89	Islas Salomón
90	Israel
91	Italia
92	Jamaica
93	Japón
94	Jordania
95	Kazajistán
96	Kenia
97	Kirguistán
98	Kiribati
99	Kosovo
100	Kuwait
101	Laos
102	Lesoto
103	Letonia
104	Líbano
105	Liberia
106	Libia
107	Liechtenstein
108	Lituania
109	Luxemburgo
110	Macedonia del Norte
111	Madagascar
112	Malasia
113	Malaui
114	Maldivas
115	Malí
116	Malta
117	Marruecos
118	Mauricio
119	Mauritania
120	México
121	Micronesia
122	Moldavia
123	Mónaco
124	Mongolia
125	Montenegro
126	Mozambique
127	Namibia
128	Nauru
129	Nepal
130	Nicaragua
131	Níger
132	Nigeria
133	Noruega
134	Nueva Zelanda
135	Omán
136	Países Bajos
137	Pakistán
138	Palaos
139	Palestina
140	Panamá
141	Papúa Nueva Guinea
142	Paraguay
143	Perú
144	Polonia
145	Portugal
146	Reino Unido
147	República Centroafricana
148	República Checa
149	República Democrática del Congo
150	República Dominicana
151	Ruanda
152	Rumania
153	Rusia
154	Samoa
155	San Cristóbal y Nieves
156	San Marino
157	San Vicente y las Granadinas
158	Santa Lucía
159	Santo Tomé y Príncipe
160	Senegal
161	Serbia
162	Seychelles
163	Sierra Leona
164	Singapur
165	Siria
166	Somalia
167	Sri Lanka
168	Sudáfrica
169	Sudán
170	Sudán del Sur
171	Suecia
172	Suiza
173	Surinam
174	Tailandia
175	Taiwán
176	Tanzania
177	Tayikistán
178	Timor Oriental
179	Togo
180	Tonga
181	Trinidad y Tobago
182	Túnez
183	Turkmenistán
184	Turquía
185	Tuvalu
186	Ucrania
187	Uganda
188	Uruguay
189	Uzbekistán
190	Vanuatu
191	Vaticano
192	Venezuela
193	Vietnam
194	Yemen
195	Yibuti
196	Zambia
197	Zimbabue
\.


--
-- TOC entry 4079 (class 0 OID 102876)
-- Dependencies: 273
-- Data for Name: packs_fud; Type: TABLE DATA; Schema: Fud; Owner: postgres
--

COPY "Fud".packs_fud (id, description) FROM stdin;
0	\N
1	\N
2	\N
3	\N
4	\N
11	Füd Cloud
12	Füd Studio
13	Free for 30 days
14	suscription App
\.


--
-- TOC entry 4080 (class 0 OID 102881)
-- Dependencies: 274
-- Data for Name: session ; Type: TABLE DATA; Schema: Fud; Owner: postgres
--

COPY "Fud"."session " (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 4081 (class 0 OID 102886)
-- Dependencies: 275
-- Data for Name: tokens; Type: TABLE DATA; Schema: Fud; Owner: postgres
--

COPY "Fud".tokens (id, user_id, token, created_at, expiry_time) FROM stdin;
18	97	28e9262c56bf91262ab7	2024-06-09 06:42:49.443	2024-06-09 06:47:49.443
20	2	be126de274e5500a5c03	2024-06-13 10:10:20.837	2024-06-13 10:15:20.837
54	97	25a76f08b587505c9f60	2024-06-25 00:47:35.467	2024-06-25 00:52:35.467
56	92	cf2d61e9b72b5150f126	2024-06-25 01:11:41.581	2024-06-25 01:16:41.581
58	92	b2a6b536c6f809fe140a	2024-12-08 10:23:40.418	2024-12-08 10:28:40.418
59	92	877355d53085c9741cb3	2025-01-12 21:18:21.734	2025-01-12 21:23:21.734
60	92	2739d8c38496e884589f	2025-01-12 21:22:46.825	2025-01-12 21:27:46.825
\.


--
-- TOC entry 4083 (class 0 OID 102894)
-- Dependencies: 277
-- Data for Name: users; Type: TABLE DATA; Schema: Fud; Owner: postgres
--

COPY "Fud".users (id, photo, user_name, email, password, first_name, second_name, last_name, rol_user, id_packs_fud, language, pack_database, pack_branch, navbar_1, navbar_2, navbar_3, edit_branch) FROM stdin;
120	\N	admin_LIZBETH VASQUEZ	gvasquez2706@gmail.com	$2a$10$EqmBU.ftu/bqY2fkyIaL2eZProLTErXOgzqkN3vo6DoS48K3db2Ke	LIZBETH VASQUEZ	LIZBETH VASQUEZ	LIZBETH VASQUEZ	0	0	\N	0	0	0	\N	\N	t
123	\N	admin_testing	admin@admin.com	$2a$10$//UiphyGyetHw6DfImGHl.1qtnc4wmYh3FIMFk3hTbVxrteWTZEF6	testing	testing	testing	0	0	\N	0	0	0	\N	\N	t
124	\N	admin_Sisnodo	ramon@sisnodo.com	$2a$10$.wym3wR2gutEDbnefXxRSuco0MsDsJ4wBzj/I3Vcc5wzTq6us8IjW	Sisnodo	Sisnodo	Sisnodo	0	0	\N	0	0	0	\N	\N	t
125	\N	admin_kalifa	posperu@gmail.com	$2a$10$7f22jWIrNq9ay5iXr3NAPu.Iz/rCTUgmwpm6uUPdZP/QczM/ivbYK	kalifa	kalifa	kalifa	0	0	\N	0	0	0	\N	\N	t
126	\N	admin_LUXXSOFT	jv288244@gmail.com	$2a$10$l6jAVHXhQTS.4qXvISLUwew5TD6uA4sLABGJsLonw65k4NvWELQqi	LUXXSOFT	LUXXSOFT	LUXXSOFT	0	0	\N	0	0	0	\N	\N	t
127	\N	admin_DARK FOOD KITCHEN 	darkfoodkitchen@gmail.com	$2a$10$qspqIi4wKOjIqxwjtD0wI.uQRomqoUugRHMm6h/W1uN85wo3KMy0y	DARK FOOD KITCHEN 	DARK FOOD KITCHEN 	DARK FOOD KITCHEN 	0	0	\N	0	0	0	\N	\N	t
122	\N	admin_Tienda 	sesparzah@gmail.com	$2a$10$ZhcyH3BaOwiYfu7KeV8TFObz5WQG.U4QcqEqDRV0hPxguOPAvHnJu	Tienda 	Tienda 	Tienda 	0	0	\N	0	0	0	\N	\N	t
129	\\img\\uploads\\06d92e15-7584-4a0b-b938-07a677ab2bd9.avif	laura_plus	laura@Outlook.es	$2a$10$gN9Pjki/RGaDKrDxjjpWCOkynlFBzBAfQS8MzRTK5YDvSiKha1WlG	Laura		Aguilar Martinez	0	0	\N	0	0	0	\N	\N	t
92	\N	admin	PlusFree@hotmail.com	$2a$10$CWfCkk8n17XD503LvA4/9OHNzZj/jGfK7ikO3ToO2vqBnDZ9B207y	admin	admin	admin	0	0	\N	0	0	0	\N	\N	t
99	\N	admin_La Paloma	lucialopez84@hotmail.com	$2a$10$L/gISuC4B/OqKRI0Vn9GgOWF6HyNBWYGh1JeS0tmpjfEhD5/KTumO	La Paloma	La Paloma	La Paloma	0	0	\N	0	0	0	\N	\N	t
94	\N	admin_Prueba	176535@upslp.edu.mx	$2a$10$135uP9C3qY/cHDt1Uor7xukS1ua7Um9wEFg6iTXdGv/sBlvzQhoEK	Prueba	Prueba	Prueba	0	0	\N	0	0	0	\N	\N	t
96	\N	admin_La REINA	abrahamcordovagarcia93207@gmail.com	$2a$10$LwqDrnf47QwPCfdQRCf4X.co.unAIDzQvVV8jRGRw0K3ZG2txuUie	La REINA	La REINA	La REINA	0	0	\N	0	0	0	\N	\N	t
98	\N	admin_Salanghae Pizza 	emirestrada3.0@gmail.com	$2a$10$3XI2o8yYxIqR32b.BD7VIuNkxNSxmY4CbjE97xa1eNSnE2I0fDSPi	Salanghae Pizza 	Salanghae Pizza 	Salanghae Pizza 	0	0	\N	0	0	0	\N	\N	t
100	\N	admin_masabor	delgadillonefi@gmail.com	$2a$10$AJL03Dico67kxcWsZyuNg.YzEhHCwLoYKNrT3z4prYo1vDdEcd/H2	masabor	masabor	masabor	0	0	\N	0	0	0	\N	\N	t
104	\N	admin_Santa isabel	mariocr21@gmail.com	$2a$10$7joVIssBGTFxemD3sfJTQusLf5mvRhNBYxHgrwpa2wX5cDACrH/fy	Santa isabel	Santa isabel	Santa isabel	0	0	\N	0	0	0	\N	\N	t
105		Repartidor1	repartidor1@gmail.com	$2a$10$A5/jPYjXmy7ffzZ2.SJGgOeViKdY1Srg4JDxB55rtV/KVJlCZP0fC	Repartidor 1		R	0	0	\N	0	0	0	\N	\N	t
69		leo_kfc	leo123@Outlook.es	$2a$10$/YaznhuCJVH.cFCfp2d7G.TS2esFB7jwZ/NC6aIzivpbfSn145xsy	leo		leo	0	0	\N	0	0	\N	2	\N	t
109	\N	admin_Tetsuqu2u228	aytuquelol2@gmail.com	$2a$10$YOocH4iDq8bsF/PSzXklQemXoE/I/FBvpscpzwepOyFde8s9KGXja	Tetsuqu2u228	Tetsuqu2u228	Tetsuqu2u228	0	0	\N	0	0	0	\N	\N	t
110	\N	admin_Restaurante el corralito 	veroslej13@gmail.com	$2a$10$Y8Q/1M.bj/WoUolQWiz5a.6msZ0Wc8LTSCiz1KefQrf1gDGQFW6va	Restaurante el corralito 	Restaurante el corralito 	Restaurante el corralito 	0	0	\N	0	0	0	\N	\N	t
107	\N	admin_Food service	adolfo.gallegos73@outlook.com	$2a$10$kc0vPj5TiP47knK7a0DWjeh2Oi.yEBBiqURUYftGtyAmoRGUuO0tG	Food service	Food service	Food service	0	0	\N	0	0	0	\N	\N	t
97	\N	admin_Hamburguesas Galaxias	hamburguesasgalaxias@hotmail.com	$2a$10$PdlysrT9orWTxXFQVhLJVOFw6WUseSsgpFZHr5lLP/yqfU9bj2XDq	Moises	moises antonio	Lizama argaez	0	0	\N	0	0	0	\N	\N	t
117	\N	admin_Pizzas hermanos	eje64848@Outlook.es	$2a$10$0EYHdLlzGlLQvjgRUIW5z.MKVssbi8EztWM1ysWZa4BOPhL3rezIm	Pizzas hermanos	Pizzas hermanos	Pizzas hermanos	0	0	\N	0	0	0	\N	\N	t
118	\N	admin_El Terrifier Cerveza	olgadake@hotmail.com	$2a$10$S0whIV5AmIfcXeTZFWJh4OyBxEEr414Rzq/0AXIb8Hg1GvXB/Lg36	El Terrifier Cerveza	El Terrifier Cerveza	El Terrifier Cerveza	0	0	\N	0	0	0	\N	\N	t
119	\N	admin_CactusWingsMX	app.cactuswings@gmail.com	$2a$10$7qrzyGX43JdpAh0qIb.Qb.g4WZDMjLdD9gTNPbufqwuMov.i7IjU.	CactusWingsMX	CactusWingsMX	CactusWingsMX	0	0	\N	0	0	0	\N	\N	t
121	\N	admin_Napole 	lsaez6033@gmail.com	$2a$10$7r7sZ.7xAjPwj4G0gWBKoOZw2TwZxfce9IO9Mctb1Gi9sk5ykJSIO	Napole 	Napole 	Napole 	0	0	\N	0	0	0	\N	\N	t
111	\N	admin	eje24848@Outlook.es	$2a$10$m67SqKohvnGDh9CLXH8qpu1dar6qHRQ3vVCTc9UaawXjRLk93GKRC	Pizzas hermanos	Pizzas hermanos	Pizzas hermanos	0	0	\N	0	0	0	\N	\N	t
71	\\img\\uploads\\97e82c26-6694-43fb-9b56-62ba365b49b6.png	sam_fud	sam123@Outlook.es	$2a$10$MZ2hhZwvsvXewggqn.bk1e1wC6wvckZQwBo.J55ppZ.sVkIcIW6VC	sam		martinez lopez	0	0	\N	0	0	\N	2	\N	t
2	\N	plus	eje14848@Outlook.es	$2a$10$AUhVAMVPjcvQUmdZJwbaFOkjmOkUNaZUlYDVVwlCAP/BzLtyUT2X2	admin	admin	admin	0	0	\N	0	0	\N	2	\N	t
\.


--
-- TOC entry 4136 (class 0 OID 112290)
-- Dependencies: 330
-- Data for Name: boutique; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".boutique (id, name, barcode, description, use_inventory, max_inventary, min_inventory, purchase_price, purchase_sale, id_companies, id_branches) FROM stdin;
6	vestido-de-fiesta	vestido-de-fiesta		t	50	0	0	\N	1	8
\.


--
-- TOC entry 4085 (class 0 OID 102902)
-- Dependencies: 279
-- Data for Name: dish_and_combo_features; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".dish_and_combo_features (id, id_companies, id_branches, id_dishes_and_combos, price_1, revenue_1, price_2, revenue_2, price_3, revenue_3, favorites, sat_key, purchase_unit, existence, amount, product_cost, id_providers, is_product) FROM stdin;
110	1	8	2	100	9900	0	0	0	0	f		Pza	\N	0	0	\N	f
139	1	8	32	10	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
121	1	8	13	10	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
122	1	8	14	10	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
123	1	8	15	10	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
124	1	8	16	0	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
125	1	8	18	100	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
126	1	8	19	100	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
127	1	8	20	100	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
128	1	8	21	100	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
129	1	8	22	150	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
130	1	8	23	100	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
131	1	8	24	150	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
132	1	8	25	150	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
133	1	8	26	150	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
112	1	8	4	20	100	0	0	0	0	f		Pza	\N	0	0	\N	f
109	1	8	1	10	900	0	0	0	0	t		Pza	\N	0	0	\N	f
111	1	8	3	0	0	0	0	0	0	f		Pza	\N	0	0	\N	f
113	1	8	5	18	1700	0	0	0	0	f		Pza	\N	0	0	\N	f
134	1	8	27	100	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
140	1	8	33	10	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
135	1	8	28	5	0	0	0	0	0	f		Pza	\N	0	0	\N	f
136	1	8	29	15	0	0	0	0	0	f		Pza	\N	0	0	\N	f
141	1	8	34	10	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
137	1	8	30	12	0	0	0	0	0	t		Pza	\N	0	0	\N	f
115	1	8	7	19	1800	0	0	0	0	f		Pza	\N	0	0	\N	f
138	1	8	31	15	0	0	0	0	0	f		Pza	\N	0	0	\N	f
116	1	8	8	20	-80	0	0	0	0	f		Pza	\N	0	0	\N	f
114	1	8	6	19	1800	0	0	0	0	f		Pza	\N	0	0	\N	f
156	1	8	49	50	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
153	1	8	46	100	0	0	0	0	0	f		Pza	\N	0	0	\N	f
154	1	8	47	100	0	0	0	0	0	f		Pza	\N	0	0	\N	f
143	1	8	36	100	0	0	0	0	0	f		Pza	\N	0	0	\N	f
155	1	8	48	50	0	0	0	0	0	f		Pza	\N	0	0	\N	f
157	1	8	50	20	42.85714285714286	0	0	0	0	f		Pza	\N	0	0	\N	f
158	1	8	51	1	0	0	0	0	0	f		Pza	\N	0	0	\N	f
152	1	8	45	0	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
142	1	8	35	20	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
151	1	8	44	0	0	\N	\N	\N	\N	\N	\N	Pza	\N	0	0	\N	f
160	1	8	53	50	0	0	0	0	0	f		Pza	\N	0	0	\N	f
159	1	8	52	12	0	0	0	0	0	f		Pza	\N	0	0	\N	f
\.


--
-- TOC entry 4142 (class 0 OID 112670)
-- Dependencies: 336
-- Data for Name: lots; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".lots (id, number_lote, initial_existence, current_existence, date_of_manufacture, expiration_date, id_dish_and_combo_features, id_branches, id_companies) FROM stdin;
12	lote1	5	0	2025-03-22	2025-03-24	115	8	1
13	lot2	6	4	2025-03-22	2025-03-29	115	8	1
15	lot2	10	10	2025-03-01	2025-06-30	160	8	1
14	lot1	10	7	2025-03-01	2025-05-31	160	8	1
2	lot1	0	20	2025-03-31	2025-05-31	114	8	1
3	lot2	5	20	2025-03-16	2025-03-31	114	8	1
10	coca-1	10	5	2025-03-16	2025-12-16	159	8	1
\.


--
-- TOC entry 4087 (class 0 OID 102908)
-- Dependencies: 281
-- Data for Name: product_and_suppiles_features; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".product_and_suppiles_features (id, id_branches, sale_price, max_inventary, minimum_inventory, existence, purchase_amount, purchase_price, sale_amount, id_products_and_supplies, currency_purchase, currency_sale, unit_inventory, purchase_unity, sale_unity) FROM stdin;
184	8	5	100	1	99	2	10	0.5	178	MXN	MXN	Kg	Kg	Kg
186	8	12	100	1	80	100	10	1	180	MXN	MXN	Unity	Unity	Unity
163	8	\N	\N	\N	\N	\N	\N	\N	157	\N	\N	\N	\N	\N
156	8	1	1	1	1	1	1	1	\N	MXN	MXN	Unity	Unity	Unity
164	8	10	0	0	5	0	0	0	158	MXN	MXN	kg	kg	kg
187	8	15	10	1	20	1	10	1	181	MXN	MXN	Kg	Kg	Kg
188	8	10	0	0	5	0	0	0	182	MXN	MXN	Pza	Pza	Pza
189	8	10	0	0	5	0	0	0	183	MXN	MXN	kg	kg	kg
157	8	1	1	1	0	1	1	1	148	MXN	MXN	Unity	Unity	Unity
169	8	10	0	0	5	0	0	0	163	MXN	MXN	Pza	Pza	Pza
170	8	10	0	0	5	0	0	0	164	MXN	MXN	kg	kg	kg
171	8	10	0	0	5	0	0	0	165	MXN	MXN	L	L	L
210	8	50	100	0	17	1	40	1	204	MXN	MXN	Unity	Unity	Unity
190	8	10	0	0	5	0	0	0	184	MXN	MXN	L	L	L
172	8	\N	\N	\N	\N	\N	\N	\N	166	\N	\N	\N	\N	\N
173	8	100	1	0	100	1	100	1	167	MXN	MXN	Pza	Pza	Pza
174	8	100	100	0	100	1	100	1	168	MXN	MXN	Pza	Pza	Pza
175	8	100	100	0	100	1	100	1	169	MXN	MXN	Pza	Pza	Pza
176	8	100	1	0	100	1	100	1	170	MXN	MXN	Pza	Pza	Pza
177	8	100	1	0	100	1	100	1	171	MXN	MXN	Pza	Pza	Pza
178	8	150	100	0	150	1	150	1	172	MXN	MXN	Pza	Pza	Pza
179	8	100	100	0	100	1	100	1	173	MXN	MXN	Pza	Pza	Pza
158	8	10	100	1	96	1	5	1	149	MXN	MXN	Kg	Kg	Kg
180	8	150	100	0	150	1	150	1	174	MXN	MXN	Pza	Pza	Pza
181	8	150	100	0	150	1	150	1	175	MXN	MXN	Pza	Pza	Pza
182	8	150	1	0	150	1	150	1	176	MXN	MXN	Pza	Pza	Pza
183	8	100	1	0	100	1	100	1	177	MXN	MXN	Pza	Pza	Pza
209	8	12	100	0	5	100	10	1	203	MXN	MXN	Unity	Unity	Unity
185	8	15	100	1	50	100	10	1	179	MXN	MXN	Unity	Unity	Unity
161	8	1	100	1	4	1	1	1	152	MXN	MXN	Unity	Unity	Unity
155	8	1	1	1	87	1	1	2	146	MXN	MXN	Unity	Unity	Unity
202	8	100	50	0	0	1	100	1	196	MXN	MXN	Unity	Unity	Unity
203	8	100	50	0	0	1	100	1	197	MXN	MXN	Unity	Unity	Unity
204	8	50	50	0	5	1	50	1	198	MXN	MXN	Unity	Unity	Unity
162	8	100	100	1	63	1	100	1	153	MXN	MXN	Unity	Unity	Unity
160	8	1	100	1	40	50	100	1	151	MXN	MXN	Unity	Unity	Unity
207	8	6	100	0	98	10	5	1	201	MXN	MXN	Unity	Unity	Unity
206	8	2	100	0	94	15	15	15	200	MXN	MXN	Unity	Unity	Unity
159	8	1	100	1	92	1	1	1	150	MXN	MXN	Unity	Unity	Unity
208	8	1	1	1	1	1	1	1	202	MXN	MXN	Unity	Unity	Unity
\.


--
-- TOC entry 4148 (class 0 OID 121103)
-- Dependencies: 342
-- Data for Name: promotions; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".promotions (id, id_companies, id_branches, id_dish_and_combo_features, active_promotion, name_promotion, "fromTime", "toTime", promotions_from, promotions_to, discount_percentage, date_from, date_to) FROM stdin;
1	1	8	114	t	1	\N	\N	2	2	50	\N	\N
3	1	8	114	t	3	\N	\N	3	3	100	\N	\N
4	1	8	114	t	4	\N	\N	4	4	4	\N	\N
5	1	8	114	f	5	\N	\N	5	5	15	\N	\N
6	1	8	114	f	6	\N	\N	6	6	1	\N	\N
11	1	8	116	t	pack 1	\N	\N	3	3	50	\N	\N
12	1	8	113	t	2x3	\N	\N	3	3	30	\N	\N
\.


--
-- TOC entry 4138 (class 0 OID 112302)
-- Dependencies: 332
-- Data for Name: table_boutique; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".table_boutique (id, id_boutique, id_dish_and_combo_features, id_product_and_suppiles_features) FROM stdin;
7	\N	\N	\N
11	\N	\N	\N
5	\N	\N	\N
6	\N	\N	\N
8	\N	\N	\N
9	\N	\N	\N
10	\N	\N	\N
14	6	153	202
15	6	154	203
16	6	155	204
17	6	156	\N
\.


--
-- TOC entry 4089 (class 0 OID 102912)
-- Dependencies: 283
-- Data for Name: table_supplies_dish; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".table_supplies_dish (id, id_dish_and_combo_features, id_product_and_suppiles_features, amount, unity) FROM stdin;
\.


--
-- TOC entry 4091 (class 0 OID 102916)
-- Dependencies: 285
-- Data for Name: table_taxes; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".table_taxes (id, id_taxes, id_dishes_and_combos) FROM stdin;
\.


--
-- TOC entry 4093 (class 0 OID 102920)
-- Dependencies: 287
-- Data for Name: taxes; Type: TABLE DATA; Schema: Inventory; Owner: postgres
--

COPY "Inventory".taxes (id, name, price_taxe, local_taxe, type_taxe, accounting_account) FROM stdin;
\.


--
-- TOC entry 4095 (class 0 OID 102926)
-- Dependencies: 289
-- Data for Name: dishes_and_combos; Type: TABLE DATA; Schema: Kitchen; Owner: postgres
--

COPY "Kitchen".dishes_and_combos (id_companies, img, name, description, barcode, id_product_department, id_product_category, id, is_a_product, this_product_is_sold_in_bulk, this_product_need_recipe) FROM stdin;
1	\\img\\uploads\\e4c3ddb9-f021-4641-9b7f-4284a9400ca1.jpg	jitomate		jitomate	\N	\N	4	t	t	f
1	\\img\\uploads\\135c75bf-4405-4677-bfd6-79caf78d177a.webp	gansito	descripcion\r\n                            \r\n                            	gansito	\N	\N	1	t	\N	f
1	\\img\\uploads\\6a91b4f1-d450-4da7-811e-f2b32f1ef828.jpg	pizzza hermanos		pizzza hermanos	\N	\N	3	t	\N	f
1	\\img\\uploads\\01ce75ee-ef00-491b-98ca-9bda55ac06b9.webp	doritos		doritos	\N	\N	5	t	\N	f
1	\\img\\uploads\\955c09cd-0fad-406c-9e10-6e184f8cb194.png	paracetamol		paracetamol	\N	\N	53	t	\N	t
1		Producto 1ex		Producto 4e	\N	\N	13	t	f	f
1		Producto 2ex		Producto 5e	\N	\N	14	t	f	f
1		Producto 3ex		Producto 6e	\N	\N	15	t	f	f
1	\\img\\uploads\\d6f93256-fc5d-4e7d-920e-a195996b4ed3.jpg	combo		combo	2	2	2	f	f	f
1		vestido-color rojo talla 2		vestido-rojo-2	\N	\N	17	t	f	f
1		pantalon-color rojo talla 1		pantalon-rojo-1	\N	\N	18	t	f	f
1		pantalon-color rojo talla 2		pantalon-rojo-2	\N	\N	19	t	f	f
1		short-color rojo talla 1		short-rojo-1	\N	\N	20	t	f	f
1		short-color rojo talla 2		short-rojo-2	\N	\N	21	t	f	f
1		zapato-color rojo talla 1		zapato-rojo-1	\N	\N	22	t	f	f
1		zapato-color rojo talla 2		zapato-rojo-2	\N	\N	23	t	f	f
1		zapato2-color rojo talla 1		zapato2-rojo-1	\N	\N	24	t	f	f
1		zapato2-color rojo talla 2		zapato2-rojo-2	\N	\N	25	t	f	f
1	\\img\\uploads\\94628749-8225-490b-a203-317e778951c8.jpg	coca cola		coca cola	\N	\N	52	t	\N	f
1	\\img\\uploads\\58aa3a37-81fb-44b1-ab47-c35769bc3af6.webp	jamon		jamon	\N	\N	28	t	t	f
1	\\img\\uploads\\b2c98dd8-a314-4a18-be11-6b09a6fea8a5.webp	pan-tostado		pan-tostado	\N	\N	29	t	\N	f
1	\\img\\uploads\\5fa9f890-5a78-4485-b58d-a5ad068561a9.webp	nescafe		nescafe	\N	\N	30	t	\N	f
1	\\img\\uploads\\5d9aaa5c-6b20-44db-bf45-41a2e6cf24f6.jpg	huevos		huevos	\N	\N	31	t	t	f
1		Producto plus 1		Producto plus 1	\N	\N	32	t	f	f
1		Producto plus 2		Producto plus 2	\N	\N	33	t	f	f
1		Producto plus 3		Producto plus 3	\N	\N	34	t	f	f
1	\\img\\uploads\\083f257c-2477-4017-a278-98b77fe750c0.webp	vestido-de-fiesta-color rojo talla 11		vestido-de-fiesta-rojo-11	\N	\N	46	t	\N	f
1	\\img\\uploads\\74fc8772-5b35-49ff-8d7d-dd1d8648e652.jpg	vestido-de-fiesta-color verde talla 11		vestido-de-fiesta-verde-11	\N	\N	47	t	\N	f
1	\\img\\uploads\\a6c4779e-3849-4f8d-9684-7acea88e1a08.webp	vestido-de-fiesta-color azul talla 11		vestido-de-fiesta-azul-11	\N	\N	48	t	\N	f
1	\\img\\uploads\\97f3a733-05ca-46e3-9ca1-78a2bceb8f1e.jpg	hamburgesa big		hamburgesa big	2	2	50	f	f	f
1		ejemplo		ejemplo	\N	\N	51	t	\N	f
1	\\img\\uploads\\54e570c8-91b0-47ed-8704-ed7c19866468.webp	leche lala		leche lala	\N	\N	8	t	\N	f
1	\\img\\uploads\\64f40a70-87a2-4ef2-a827-4c108fc08d6c.webp	cheetos hot		cheetos hot	\N	\N	7	t	\N	t
1	\\img\\uploads\\4cc5907f-91a3-4b95-99ec-39625f89de7c.webp	cheetos verdes		cheetos verdes	\N	\N	6	t	\N	f
\.


--
-- TOC entry 4097 (class 0 OID 102932)
-- Dependencies: 291
-- Data for Name: product_category; Type: TABLE DATA; Schema: Kitchen; Owner: postgres
--

COPY "Kitchen".product_category (id, id_companies, name, description) FROM stdin;
2	1	Todo el dia	-
3	1	Especial de la noche	Estos platillos solo se sirven a partir de las 8PM
4	23	Comida Rapida	
5	24	Todo el dia	
7	22	EMPANADAS	
8	1	especial del dia	
\.


--
-- TOC entry 4099 (class 0 OID 102938)
-- Dependencies: 293
-- Data for Name: product_department; Type: TABLE DATA; Schema: Kitchen; Owner: postgres
--

COPY "Kitchen".product_department (id, id_companies, name, description) FROM stdin;
4	23	Todo el dia	
5	24	Todo el dia	
2	1	Combos De Pareja 2	-
8	1	combos individual	para una persona
3	1	Combos Monster	-
\.


--
-- TOC entry 4101 (class 0 OID 102944)
-- Dependencies: 295
-- Data for Name: products_and_supplies; Type: TABLE DATA; Schema: Kitchen; Owner: postgres
--

COPY "Kitchen".products_and_supplies (id, id_companies, img, barcode, name, description, use_inventory, supplies) FROM stdin;
178	1	\\img\\uploads\\58aa3a37-81fb-44b1-ab47-c35769bc3af6.webp	jamon	jamon		t	f
196	1	\\img\\uploads\\083f257c-2477-4017-a278-98b77fe750c0.webp	vestido-de-fiesta-rojo-11	vestido-de-fiesta-color rojo talla 11		t	f
197	1	\\img\\uploads\\74fc8772-5b35-49ff-8d7d-dd1d8648e652.jpg	vestido-de-fiesta-verde-11	vestido-de-fiesta-color verde talla 11		t	f
179	1	\\img\\uploads\\b2c98dd8-a314-4a18-be11-6b09a6fea8a5.webp	pan-tostado	pan-tostado		t	f
198	1	\\img\\uploads\\a6c4779e-3849-4f8d-9684-7acea88e1a08.webp	vestido-de-fiesta-azul-11	vestido-de-fiesta-color azul talla 11		t	f
200	1	\\img\\uploads\\270bb314-89b6-4f4f-bbc7-aa3afbaa9cf7.jpeg	queso	queso		t	t
201	1	\\img\\uploads\\48556fec-46f7-4699-987b-16f65c6f3abf.webp	lechuga	lechuga		t	t
180	1	\\img\\uploads\\5fa9f890-5a78-4485-b58d-a5ad068561a9.webp	nescafe	nescafe		t	f
202	1		ejemplo	ejemplo		t	f
181	1	\\img\\uploads\\5d9aaa5c-6b20-44db-bf45-41a2e6cf24f6.jpg	huevos	huevos		t	f
149	1	\\img\\uploads\\e4c3ddb9-f021-4641-9b7f-4284a9400ca1.jpg	jitomate	jitomate		t	f
182	1		Producto plus 1	Producto plus 1		f	f
146	1	\\img\\uploads\\135c75bf-4405-4677-bfd6-79caf78d177a.webp	gansito	gansito	descripcion\r\n                            \r\n                            	t	f
183	1		Producto plus 2	Producto plus 2		f	f
148	1	\\img\\uploads\\6a91b4f1-d450-4da7-811e-f2b32f1ef828.jpg	pizzza hermanos	pizzza hermanos		t	f
184	1		Producto plus 3	Producto plus 3		f	f
150	1	\\img\\uploads\\01ce75ee-ef00-491b-98ca-9bda55ac06b9.webp	doritos	doritos		t	f
204	1	\\img\\uploads\\955c09cd-0fad-406c-9e10-6e184f8cb194.png	paracetamol	paracetamol		t	f
157	1		Producto 1e	Producto 1		f	f
158	1		Producto 2e	Producto 2		f	f
163	1		Producto 4e	Producto 1ex		f	f
164	1		Producto 5e	Producto 2ex		f	f
165	1		Producto 6e	Producto 3ex		f	f
166	1		vestido-rojo-1	vestido-color rojo talla 1		t	f
167	1		vestido-rojo-2	vestido-color rojo talla 2		t	f
168	1		pantalon-rojo-1	pantalon-color rojo talla 1		t	f
169	1		pantalon-rojo-2	pantalon-color rojo talla 2		t	f
170	1		short-rojo-1	short-color rojo talla 1		t	f
171	1		short-rojo-2	short-color rojo talla 2		t	f
172	1		zapato-rojo-1	zapato-color rojo talla 1		t	f
173	1		zapato-rojo-2	zapato-color rojo talla 2		t	f
174	1		zapato2-rojo-1	zapato2-color rojo talla 1		t	f
175	1		zapato2-rojo-2	zapato2-color rojo talla 2		t	f
176	1		zapato-1-rojo-1	zapato-1-color rojo talla 1		t	f
177	1		zapato-1-rojo-2	zapato-1-color rojo talla 2		t	f
203	1	\\img\\uploads\\94628749-8225-490b-a203-317e778951c8.jpg	coca cola	coca cola		t	f
152	1	\\img\\uploads\\64f40a70-87a2-4ef2-a827-4c108fc08d6c.webp	cheetos hot	cheetos hot		t	f
153	1	\\img\\uploads\\54e570c8-91b0-47ed-8704-ed7c19866468.webp	leche lala	leche lala		t	f
151	1	\\img\\uploads\\4cc5907f-91a3-4b95-99ec-39625f89de7c.webp	cheetos verdes	cheetos verdes		t	f
\.


--
-- TOC entry 4103 (class 0 OID 102950)
-- Dependencies: 297
-- Data for Name: screen; Type: TABLE DATA; Schema: Kitchen; Owner: postgres
--

COPY "Kitchen".screen (ip, id_branches) FROM stdin;
\.


--
-- TOC entry 4104 (class 0 OID 102955)
-- Dependencies: 298
-- Data for Name: table_supplies_combo; Type: TABLE DATA; Schema: Kitchen; Owner: postgres
--

COPY "Kitchen".table_supplies_combo (id, id_dishes_and_combos, id_products_and_supplies, unity, amount, food_waste, additional) FROM stdin;
489	1	146	Unity	1	1	f
491	3	148	Unity	1	1	f
496	2	146	Unity	1	0	f
497	4	149	Kg	1	1	f
498	5	150	Unity	1	1	f
499	6	151	Unity	1	1	f
500	7	152	Unity	1	1	f
501	8	153	Unity	1	1	f
506	13	163	Pza	1	0	f
507	14	164	kg	1	0	f
508	15	165	L	1	0	f
510	17	167	Pza	1	1	f
511	18	168	Pza	1	1	f
512	19	169	Pza	1	1	f
513	20	170	Pza	1	1	f
514	21	171	Pza	1	1	f
515	22	172	Pza	1	1	f
516	23	173	Pza	1	1	f
517	24	174	Pza	1	1	f
518	25	175	Pza	1	1	f
521	28	178	Kg	1	0.5	f
522	29	179	Unity	1	1	f
523	30	180	Unity	1	1	f
524	31	181	Kg	1	1	f
525	32	182	Pza	1	0	f
526	33	183	kg	1	0	f
527	34	184	L	1	0	f
539	46	196	Pza	1	1	f
540	47	197	Pza	1	1	f
541	48	198	Pza	1	1	f
546	50	201	Unity	1	0	f
547	50	200	Unity	3	0	f
548	51	202	Unity	1	1	f
549	52	203	Unity	1	1	f
550	53	204	Unity	1	1	f
\.


--
-- TOC entry 4106 (class 0 OID 102961)
-- Dependencies: 300
-- Data for Name: branch; Type: TABLE DATA; Schema: Settings; Owner: postgres
--

COPY "Settings".branch (id) FROM stdin;
\.


--
-- TOC entry 4107 (class 0 OID 102964)
-- Dependencies: 301
-- Data for Name: company; Type: TABLE DATA; Schema: Settings; Owner: postgres
--

COPY "Settings".company (color_company) FROM stdin;
\.


--
-- TOC entry 4108 (class 0 OID 102967)
-- Dependencies: 302
-- Data for Name: companies; Type: TABLE DATA; Schema: User; Owner: postgres
--

COPY "User".companies (id, id_users, path_logo, email_company, alias, description, representative, ceo, id_country, states, municipality, city, cologne, address, num_int, num_ext, postal_code, email, cell_phone, phone, name, pack_database, number_of_devices) FROM stdin;
22	97	\N	hamburguesasgalaxias@hotmail.com	Hamburguesas Galaxias			\N	1	\N				\N				\N	+52 998 122 7735	+52 998 122 7735	Hamburguesas Galaxias	3	1
25	100	\N	delgadillonefi@gmail.com	masabor			\N	1	\N				\N				\N	9811470015	9811470015	masabor	0	1
26	104	\N	mariocr21@gmail.com	Santa isabel			\N	1	\N				\N				\N	6161079845	6161079845	Santa isabel	0	1
9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	1
10	\N	\N	176535@upslp.edu.mx	pizza hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	pizza hermanos	0	1
11	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	1
12	\N	\N	eduardoa4848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
13	\N	\N	eduardoa4848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
14	\N	\N	eduardoa4848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
15	\N	\N	eduardoa4848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
16	\N	\N	eduardoa4848@Outlook.es	pizza hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	pizza hermanos	0	1
17	\N	\N	eduardoa4848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
18	\N	\N	eduardoa4848@Outlook.es	pizza hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	pizza hermanos	0	1
20	94	\N	176535@upslp.edu.mx	Prueba			\N	1	\N				\N				\N	4443579030	4443579030	Prueba	0	1
21	96	\N	abrahamcordovagarcia93207@gmail.com	La REINA			\N	1	\N				\N				\N	+529331246775	+529331246775	La REINA	0	1
23	98	\N	emirestrada3.0@gmail.com	Salanghae Pizza 			\N	1	\N				\N				\N	961 461 9590	961 461 9590	Salanghae Pizza 	0	1
24	99	\N	lucialopez84@hotmail.com	La Paloma			\N	1	\N				\N				\N	961 215 5426	961 215 5426	La Paloma	0	1
27	107	\N	adolfo.gallegos73@outlook.com	Food service			\N	1	\N				\N				\N	6622331355	6622331355	Food service	0	1
28	109	\N	aytuquelol2@gmail.com	Tetsuqu2u228			\N	1	\N				\N				\N	12345678912	12345678912	Tetsuqu2u228	0	1
29	110	\N	veroslej13@gmail.com	Restaurante el corralito 			\N	1	\N				\N				\N	5537016077	5537016077	Restaurante el corralito 	0	1
30	111	\N	eje24848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
31	117	\N	eje64848@Outlook.es	Pizzas hermanos			\N	1	\N				\N				\N	444 357 9030	444 357 9030	Pizzas hermanos	0	1
32	118	\N	olgadake@hotmail.com	El Terrifier Cerveza			\N	1	\N				\N				\N	5512577265	5512577265	El Terrifier Cerveza	0	1
33	119	\N	app.cactuswings@gmail.com	CactusWingsMX			\N	1	\N				\N				\N	4451540656	4451540656	CactusWingsMX	0	1
34	120	\N	gvasquez2706@gmail.com	LIZBETH VASQUEZ			\N	1	\N				\N				\N	0969445123	0969445123	LIZBETH VASQUEZ	0	1
35	121	\N	lsaez6033@gmail.com	Napole 			\N	1	\N				\N				\N	987654321	987654321	Napole 	0	1
36	122	\N	sesparzah@gmail.com	Tienda 			\N	1	\N				\N				\N	6142445300	6142445300	Tienda 	0	1
37	123	\N	admin@admin.com	testing			\N	1	\N				\N				\N	76499880	76499880	testing	0	1
38	124	\N	ramon@sisnodo.com	Sisnodo			\N	1	\N				\N				\N	4626296420	4626296420	Sisnodo	0	1
39	125	\N	posperu@gmail.com	kalifa			\N	1	\N				\N				\N	989313651	989313651	kalifa	0	1
40	126	\N	jv288244@gmail.com	LUXXSOFT			\N	1	\N				\N				\N	3108090853	3108090853	LUXXSOFT	0	1
41	127	\N	darkfoodkitchen@gmail.com	DARK FOOD KITCHEN 			\N	1	\N				\N				\N	+529901585129	+529901585129	DARK FOOD KITCHEN 	0	1
42	\N	\N	camposss1@hotmail.com	Campos Herramientas			\N	1	\N				\N				\N	camposss1@hotmail.co	camposss1@hotmail.co	Campos Herramientas	0	1
19	92	\N	tucorreo@hotmail.com	tu_empresa		yo	undefined	120	calle	municipio	ciudad	colonia	\N			12345	\N			tu_empresa	0	1
1	2	\\img\\uploads\\a2f87cfd-0541-4cde-bdac-3b8254e27f8e.png	fud123@Outlook.es	EDPLUS		yo	undefined	1	slp	slp	slp	slp	\N			12345	kfc123@Outlook.es			ED-Software	2	1
\.


--
-- TOC entry 4110 (class 0 OID 102974)
-- Dependencies: 304
-- Data for Name: subscription; Type: TABLE DATA; Schema: User; Owner: postgres
--

COPY "User".subscription (id, id_users, id_companies, id_branches, id_packs_fud, initial_date, final_date) FROM stdin;
sub_1P57lxRofynVwfKYsZ9wXjlM	2	\N	8	11	\N	\N
sub_1P3rtoRofynVwfKYGItnWCo2	2	\N	17	11	\N	\N
\.


--
-- TOC entry 4124 (class 0 OID 103741)
-- Dependencies: 318
-- Data for Name: alumnos; Type: TABLE DATA; Schema: _company_1_branch_8; Owner: postgres
--

COPY _company_1_branch_8.alumnos (id, nombre) FROM stdin;
\.


--
-- TOC entry 4122 (class 0 OID 103730)
-- Dependencies: 316
-- Data for Name: apps; Type: TABLE DATA; Schema: _company_1_branch_8; Owner: postgres
--

COPY _company_1_branch_8.apps (id, id_company, id_branch, icon, name, description, labels, code_table) FROM stdin;
alumnos	1	8		alumnos			\n    CREATE TABLE IF NOT EXISTS _company_1_branch_8.alumnos (\n        id SERIAL PRIMARY KEY\n,nombre TEXT NULL\n);
programacion	1	8	https://cdn-icons-png.flaticon.com/512/1448/1448776.png	programacion			
\.


--
-- TOC entry 4111 (class 0 OID 102979)
-- Dependencies: 305
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
9Yvhxj_SpX4W1s7xuyMcsax0M2Mz0zyb	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"flash":{}}	2025-04-05 22:00:15
NK5Z3DS49DZf7tJa5n7In-aSa3quy8UW	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"flash":{}}	2025-04-04 08:18:00
MqLqK6d1lrvqMl0N5_3J0G6ewcWrOCq8	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"2"},"flash":{}}	2025-04-01 09:34:59
\.


--
-- TOC entry 4209 (class 0 OID 0)
-- Dependencies: 333
-- Name: box_history_id_seq; Type: SEQUENCE SET; Schema: Box; Owner: postgres
--

SELECT pg_catalog.setval('"Box".box_history_id_seq', 38, true);


--
-- TOC entry 4210 (class 0 OID 0)
-- Dependencies: 228
-- Name: movement_history_id_seq; Type: SEQUENCE SET; Schema: Box; Owner: postgres
--

SELECT pg_catalog.setval('"Box".movement_history_id_seq', 19, true);


--
-- TOC entry 4211 (class 0 OID 0)
-- Dependencies: 231
-- Name: sales_history_id_seq; Type: SEQUENCE SET; Schema: Box; Owner: postgres
--

SELECT pg_catalog.setval('"Box".sales_history_id_seq', 336, true);


--
-- TOC entry 4212 (class 0 OID 0)
-- Dependencies: 233
-- Name: Ad_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch"."Ad_id_seq"', 86, true);


--
-- TOC entry 4213 (class 0 OID 0)
-- Dependencies: 235
-- Name: app_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".app_id_seq', 1, false);


--
-- TOC entry 4214 (class 0 OID 0)
-- Dependencies: 237
-- Name: billing_information_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".billing_information_id_seq', 1, false);


--
-- TOC entry 4215 (class 0 OID 0)
-- Dependencies: 239
-- Name: boxes_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".boxes_id_seq', 13, true);


--
-- TOC entry 4216 (class 0 OID 0)
-- Dependencies: 241
-- Name: commanders_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".commanders_id_seq', 292, true);


--
-- TOC entry 4217 (class 0 OID 0)
-- Dependencies: 339
-- Name: history_move_lot_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".history_move_lot_id_seq', 8, true);


--
-- TOC entry 4218 (class 0 OID 0)
-- Dependencies: 244
-- Name: managers_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".managers_id_seq', 1, false);


--
-- TOC entry 4219 (class 0 OID 0)
-- Dependencies: 246
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".order_id_seq', 17, true);


--
-- TOC entry 4220 (class 0 OID 0)
-- Dependencies: 248
-- Name: pack_reservation_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".pack_reservation_id_seq', 1, false);


--
-- TOC entry 4221 (class 0 OID 0)
-- Dependencies: 337
-- Name: prescription_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".prescription_id_seq', 8, true);


--
-- TOC entry 4222 (class 0 OID 0)
-- Dependencies: 250
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".providers_id_seq', 7, true);


--
-- TOC entry 4223 (class 0 OID 0)
-- Dependencies: 252
-- Name: reservation_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".reservation_id_seq', 1, false);


--
-- TOC entry 4224 (class 0 OID 0)
-- Dependencies: 254
-- Name: restaurant_area_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".restaurant_area_id_seq', 1, false);


--
-- TOC entry 4225 (class 0 OID 0)
-- Dependencies: 256
-- Name: tables_id_seq; Type: SEQUENCE SET; Schema: Branch; Owner: postgres
--

SELECT pg_catalog.setval('"Branch".tables_id_seq', 1, false);


--
-- TOC entry 4226 (class 0 OID 0)
-- Dependencies: 312
-- Name: appointment_id_seq; Type: SEQUENCE SET; Schema: CRM; Owner: postgres
--

SELECT pg_catalog.setval('"CRM".appointment_id_seq', 25, true);


--
-- TOC entry 4227 (class 0 OID 0)
-- Dependencies: 319
-- Name: history_prospects_id_seq; Type: SEQUENCE SET; Schema: CRM; Owner: postgres
--

SELECT pg_catalog.setval('"CRM".history_prospects_id_seq', 46, true);


--
-- TOC entry 4228 (class 0 OID 0)
-- Dependencies: 308
-- Name: product_to_sell_id_seq; Type: SEQUENCE SET; Schema: CRM; Owner: postgres
--

SELECT pg_catalog.setval('"CRM".product_to_sell_id_seq', 1, true);


--
-- TOC entry 4229 (class 0 OID 0)
-- Dependencies: 314
-- Name: prospects_id_seq; Type: SEQUENCE SET; Schema: CRM; Owner: postgres
--

SELECT pg_catalog.setval('"CRM".prospects_id_seq', 11, true);


--
-- TOC entry 4230 (class 0 OID 0)
-- Dependencies: 306
-- Name: sales_stage_id_seq; Type: SEQUENCE SET; Schema: CRM; Owner: postgres
--

SELECT pg_catalog.setval('"CRM".sales_stage_id_seq', 10, true);


--
-- TOC entry 4231 (class 0 OID 0)
-- Dependencies: 310
-- Name: sales_team_id_seq; Type: SEQUENCE SET; Schema: CRM; Owner: postgres
--

SELECT pg_catalog.setval('"CRM".sales_team_id_seq', 1, true);


--
-- TOC entry 4232 (class 0 OID 0)
-- Dependencies: 321
-- Name: chats_id_chat_seq; Type: SEQUENCE SET; Schema: Chat; Owner: postgres
--

SELECT pg_catalog.setval('"Chat".chats_id_chat_seq', 19, true);


--
-- TOC entry 4233 (class 0 OID 0)
-- Dependencies: 326
-- Name: message_status_id_status_seq; Type: SEQUENCE SET; Schema: Chat; Owner: postgres
--

SELECT pg_catalog.setval('"Chat".message_status_id_status_seq', 69, true);


--
-- TOC entry 4234 (class 0 OID 0)
-- Dependencies: 324
-- Name: messages_id_message_seq; Type: SEQUENCE SET; Schema: Chat; Owner: postgres
--

SELECT pg_catalog.setval('"Chat".messages_id_message_seq', 75, true);


--
-- TOC entry 4235 (class 0 OID 0)
-- Dependencies: 258
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: Company; Owner: postgres
--

SELECT pg_catalog.setval('"Company".branches_id_seq', 45, true);


--
-- TOC entry 4236 (class 0 OID 0)
-- Dependencies: 260
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: Company; Owner: postgres
--

SELECT pg_catalog.setval('"Company".customers_id_seq', 7, true);


--
-- TOC entry 4237 (class 0 OID 0)
-- Dependencies: 262
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: Company; Owner: postgres
--

SELECT pg_catalog.setval('"Company".employees_id_seq', 80, true);


--
-- TOC entry 4238 (class 0 OID 0)
-- Dependencies: 264
-- Name: departments_employees_id_seq; Type: SEQUENCE SET; Schema: Employee; Owner: postgres
--

SELECT pg_catalog.setval('"Employee".departments_employees_id_seq', 33, true);


--
-- TOC entry 4239 (class 0 OID 0)
-- Dependencies: 266
-- Name: history_schedules_id_seq; Type: SEQUENCE SET; Schema: Employee; Owner: postgres
--

SELECT pg_catalog.setval('"Employee".history_schedules_id_seq', 86, true);


--
-- TOC entry 4240 (class 0 OID 0)
-- Dependencies: 268
-- Name: roles_employees_id_seq; Type: SEQUENCE SET; Schema: Employee; Owner: postgres
--

SELECT pg_catalog.setval('"Employee".roles_employees_id_seq', 39, true);


--
-- TOC entry 4241 (class 0 OID 0)
-- Dependencies: 270
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: Employee; Owner: postgres
--

SELECT pg_catalog.setval('"Employee".schedules_id_seq', 7, true);


--
-- TOC entry 4242 (class 0 OID 0)
-- Dependencies: 272
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: Fud; Owner: postgres
--

SELECT pg_catalog.setval('"Fud".country_id_seq', 197, true);


--
-- TOC entry 4243 (class 0 OID 0)
-- Dependencies: 276
-- Name: tokens_id_seq; Type: SEQUENCE SET; Schema: Fud; Owner: postgres
--

SELECT pg_catalog.setval('"Fud".tokens_id_seq', 61, true);


--
-- TOC entry 4244 (class 0 OID 0)
-- Dependencies: 278
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: Fud; Owner: postgres
--

SELECT pg_catalog.setval('"Fud".users_id_seq', 129, true);


--
-- TOC entry 4245 (class 0 OID 0)
-- Dependencies: 329
-- Name: boutique_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".boutique_id_seq', 6, true);


--
-- TOC entry 4246 (class 0 OID 0)
-- Dependencies: 280
-- Name: dish_and_combo_features_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".dish_and_combo_features_id_seq', 160, true);


--
-- TOC entry 4247 (class 0 OID 0)
-- Dependencies: 335
-- Name: lots_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".lots_id_seq', 15, true);


--
-- TOC entry 4248 (class 0 OID 0)
-- Dependencies: 282
-- Name: product_and_suppiles_features_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".product_and_suppiles_features_id_seq', 210, true);


--
-- TOC entry 4249 (class 0 OID 0)
-- Dependencies: 341
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".promotions_id_seq', 12, true);


--
-- TOC entry 4250 (class 0 OID 0)
-- Dependencies: 331
-- Name: table_boutique_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".table_boutique_id_seq', 17, true);


--
-- TOC entry 4251 (class 0 OID 0)
-- Dependencies: 284
-- Name: table_supplies_dish_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".table_supplies_dish_id_seq', 1, false);


--
-- TOC entry 4252 (class 0 OID 0)
-- Dependencies: 286
-- Name: table_taxes_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".table_taxes_id_seq', 1, false);


--
-- TOC entry 4253 (class 0 OID 0)
-- Dependencies: 288
-- Name: taxes_id_seq; Type: SEQUENCE SET; Schema: Inventory; Owner: postgres
--

SELECT pg_catalog.setval('"Inventory".taxes_id_seq', 1, false);


--
-- TOC entry 4254 (class 0 OID 0)
-- Dependencies: 328
-- Name: dishes_and_combos_id_seq; Type: SEQUENCE SET; Schema: Kitchen; Owner: postgres
--

SELECT pg_catalog.setval('"Kitchen".dishes_and_combos_id_seq', 53, true);


--
-- TOC entry 4255 (class 0 OID 0)
-- Dependencies: 290
-- Name: dishes_and_combos_id_serial_seq1; Type: SEQUENCE SET; Schema: Kitchen; Owner: postgres
--

SELECT pg_catalog.setval('"Kitchen".dishes_and_combos_id_serial_seq1', 77, true);


--
-- TOC entry 4256 (class 0 OID 0)
-- Dependencies: 292
-- Name: product_category_id_seq; Type: SEQUENCE SET; Schema: Kitchen; Owner: postgres
--

SELECT pg_catalog.setval('"Kitchen".product_category_id_seq', 10, true);


--
-- TOC entry 4257 (class 0 OID 0)
-- Dependencies: 294
-- Name: product_department_id_seq; Type: SEQUENCE SET; Schema: Kitchen; Owner: postgres
--

SELECT pg_catalog.setval('"Kitchen".product_department_id_seq', 12, true);


--
-- TOC entry 4258 (class 0 OID 0)
-- Dependencies: 296
-- Name: products_and_supplies_id_seq; Type: SEQUENCE SET; Schema: Kitchen; Owner: postgres
--

SELECT pg_catalog.setval('"Kitchen".products_and_supplies_id_seq', 204, true);


--
-- TOC entry 4259 (class 0 OID 0)
-- Dependencies: 299
-- Name: table_supplies_combo_id_seq; Type: SEQUENCE SET; Schema: Kitchen; Owner: postgres
--

SELECT pg_catalog.setval('"Kitchen".table_supplies_combo_id_seq', 550, true);


--
-- TOC entry 4260 (class 0 OID 0)
-- Dependencies: 303
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: User; Owner: postgres
--

SELECT pg_catalog.setval('"User".companies_id_seq', 42, true);


--
-- TOC entry 4261 (class 0 OID 0)
-- Dependencies: 317
-- Name: alumnos_id_seq; Type: SEQUENCE SET; Schema: _company_1_branch_8; Owner: postgres
--

SELECT pg_catalog.setval('_company_1_branch_8.alumnos_id_seq', 1, false);


--
-- TOC entry 3780 (class 2606 OID 112646)
-- Name: box_history box_history_pkey; Type: CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".box_history
    ADD CONSTRAINT box_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 103019)
-- Name: boxes_history key_boxes_history; Type: CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".boxes_history
    ADD CONSTRAINT key_boxes_history PRIMARY KEY (id);


--
-- TOC entry 3660 (class 2606 OID 103021)
-- Name: movement_history key_movement_history; Type: CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".movement_history
    ADD CONSTRAINT key_movement_history PRIMARY KEY (id);


--
-- TOC entry 3662 (class 2606 OID 103023)
-- Name: sales_history key_sales_history; Type: CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".sales_history
    ADD CONSTRAINT key_sales_history PRIMARY KEY (id);


--
-- TOC entry 3668 (class 2606 OID 103025)
-- Name: billing_information billing_information_uq; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".billing_information
    ADD CONSTRAINT billing_information_uq UNIQUE (id_providers);


--
-- TOC entry 3666 (class 2606 OID 103027)
-- Name: app id_key_app; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".app
    ADD CONSTRAINT id_key_app PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 103029)
-- Name: facture id_key_facture; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".facture
    ADD CONSTRAINT id_key_facture PRIMARY KEY ("Invoice Number");


--
-- TOC entry 3786 (class 2606 OID 112937)
-- Name: history_move_lot id_key_history_move_product; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".history_move_lot
    ADD CONSTRAINT id_key_history_move_product PRIMARY KEY (id);


--
-- TOC entry 3784 (class 2606 OID 112840)
-- Name: prescription id_key_recipe; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription
    ADD CONSTRAINT id_key_recipe PRIMARY KEY (id);


--
-- TOC entry 3664 (class 2606 OID 103031)
-- Name: Ad key_ad; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch"."Ad"
    ADD CONSTRAINT key_ad PRIMARY KEY (id);


--
-- TOC entry 3670 (class 2606 OID 103033)
-- Name: billing_information key_billing_information; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".billing_information
    ADD CONSTRAINT key_billing_information PRIMARY KEY (id);


--
-- TOC entry 3672 (class 2606 OID 103035)
-- Name: boxes key_boxes; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".boxes
    ADD CONSTRAINT key_boxes PRIMARY KEY (id);


--
-- TOC entry 3674 (class 2606 OID 103037)
-- Name: commanders key_commander; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".commanders
    ADD CONSTRAINT key_commander PRIMARY KEY (id);


--
-- TOC entry 3678 (class 2606 OID 103039)
-- Name: managers key_managers; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".managers
    ADD CONSTRAINT key_managers PRIMARY KEY (id);


--
-- TOC entry 3680 (class 2606 OID 103041)
-- Name: order key_order_id; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch"."order"
    ADD CONSTRAINT key_order_id PRIMARY KEY (id);


--
-- TOC entry 3682 (class 2606 OID 103043)
-- Name: pack_reservation key_pack_reservation; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".pack_reservation
    ADD CONSTRAINT key_pack_reservation PRIMARY KEY (id);


--
-- TOC entry 3686 (class 2606 OID 103045)
-- Name: reservation key_reservation; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".reservation
    ADD CONSTRAINT key_reservation PRIMARY KEY (id);


--
-- TOC entry 3688 (class 2606 OID 103047)
-- Name: restaurant_area key_restaurant_area; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".restaurant_area
    ADD CONSTRAINT key_restaurant_area PRIMARY KEY (id);


--
-- TOC entry 3684 (class 2606 OID 103049)
-- Name: providers key_suppliers_branch; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".providers
    ADD CONSTRAINT key_suppliers_branch PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 103051)
-- Name: tables key_table; Type: CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".tables
    ADD CONSTRAINT key_table PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 103597)
-- Name: appointment id_key_appointment; Type: CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".appointment
    ADD CONSTRAINT id_key_appointment PRIMARY KEY (id);


--
-- TOC entry 3762 (class 2606 OID 111975)
-- Name: history_prospects id_key_history_prospects; Type: CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".history_prospects
    ADD CONSTRAINT id_key_history_prospects PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 103580)
-- Name: product_to_sell id_key_product_to_sell; Type: CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".product_to_sell
    ADD CONSTRAINT id_key_product_to_sell PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 103608)
-- Name: prospects id_key_prospects; Type: CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".prospects
    ADD CONSTRAINT id_key_prospects PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 103572)
-- Name: sales_stage id_key_sales_stage; Type: CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".sales_stage
    ADD CONSTRAINT id_key_sales_stage PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 103588)
-- Name: sales_team id_key_sales_team; Type: CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".sales_team
    ADD CONSTRAINT id_key_sales_team PRIMARY KEY (id);


--
-- TOC entry 3764 (class 2606 OID 111994)
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id_chat);


--
-- TOC entry 3770 (class 2606 OID 112074)
-- Name: message_status message_status_message_id_user_id_key; Type: CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".message_status
    ADD CONSTRAINT message_status_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- TOC entry 3772 (class 2606 OID 112037)
-- Name: message_status message_status_pkey; Type: CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".message_status
    ADD CONSTRAINT message_status_pkey PRIMARY KEY (id_status);


--
-- TOC entry 3768 (class 2606 OID 112019)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id_message);


--
-- TOC entry 3766 (class 2606 OID 111999)
-- Name: user_chats user_chats_pkey; Type: CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".user_chats
    ADD CONSTRAINT user_chats_pkey PRIMARY KEY (user_id, chat_id);


--
-- TOC entry 3696 (class 2606 OID 103053)
-- Name: employees employees_uq; Type: CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT employees_uq UNIQUE (id_users);


--
-- TOC entry 3692 (class 2606 OID 103055)
-- Name: branches key_branches; Type: CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".branches
    ADD CONSTRAINT key_branches PRIMARY KEY (id);


--
-- TOC entry 3694 (class 2606 OID 103057)
-- Name: customers key_customer; Type: CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".customers
    ADD CONSTRAINT key_customer PRIMARY KEY (id);


--
-- TOC entry 3698 (class 2606 OID 103059)
-- Name: employees key_employees; Type: CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT key_employees PRIMARY KEY (id);


--
-- TOC entry 3706 (class 2606 OID 103061)
-- Name: schedules key; Type: CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".schedules
    ADD CONSTRAINT key PRIMARY KEY (id);


--
-- TOC entry 3700 (class 2606 OID 103063)
-- Name: departments_employees key_areas; Type: CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".departments_employees
    ADD CONSTRAINT key_areas PRIMARY KEY (id);


--
-- TOC entry 3702 (class 2606 OID 103065)
-- Name: history_schedules key_history_schedules_id; Type: CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".history_schedules
    ADD CONSTRAINT key_history_schedules_id PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 103067)
-- Name: roles_employees key_roles; Type: CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".roles_employees
    ADD CONSTRAINT key_roles PRIMARY KEY (id);


--
-- TOC entry 3710 (class 2606 OID 103069)
-- Name: packs_fud key; Type: CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".packs_fud
    ADD CONSTRAINT key PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 103071)
-- Name: country key_country; Type: CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".country
    ADD CONSTRAINT key_country PRIMARY KEY (id);


--
-- TOC entry 3716 (class 2606 OID 103073)
-- Name: users key_email_user; Type: CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".users
    ADD CONSTRAINT key_email_user UNIQUE (email);


--
-- TOC entry 3718 (class 2606 OID 103075)
-- Name: users key_user; Type: CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".users
    ADD CONSTRAINT key_user PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 103077)
-- Name: session  session_pkey; Type: CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud"."session "
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3714 (class 2606 OID 103079)
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3774 (class 2606 OID 112300)
-- Name: boutique barcode_boutique; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".boutique
    ADD CONSTRAINT barcode_boutique UNIQUE (barcode);


--
-- TOC entry 3788 (class 2606 OID 121109)
-- Name: promotions id_key_promotions; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".promotions
    ADD CONSTRAINT id_key_promotions PRIMARY KEY (id);


--
-- TOC entry 3776 (class 2606 OID 112298)
-- Name: boutique id_key_table_boutique; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".boutique
    ADD CONSTRAINT id_key_table_boutique PRIMARY KEY (id);


--
-- TOC entry 3778 (class 2606 OID 112307)
-- Name: table_boutique id_key_table_boutique_1; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_boutique
    ADD CONSTRAINT id_key_table_boutique_1 PRIMARY KEY (id);


--
-- TOC entry 3720 (class 2606 OID 103081)
-- Name: dish_and_combo_features key_dish_features; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".dish_and_combo_features
    ADD CONSTRAINT key_dish_features PRIMARY KEY (id);


--
-- TOC entry 3782 (class 2606 OID 112677)
-- Name: lots key_number_lote; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".lots
    ADD CONSTRAINT key_number_lote PRIMARY KEY (id);


--
-- TOC entry 3722 (class 2606 OID 103083)
-- Name: product_and_suppiles_features key_product_features2; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".product_and_suppiles_features
    ADD CONSTRAINT key_product_features2 PRIMARY KEY (id);


--
-- TOC entry 3724 (class 2606 OID 103085)
-- Name: table_supplies_dish key_table_supplies_dish; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_supplies_dish
    ADD CONSTRAINT key_table_supplies_dish PRIMARY KEY (id);


--
-- TOC entry 3726 (class 2606 OID 103087)
-- Name: table_taxes key_table_taxes; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_taxes
    ADD CONSTRAINT key_table_taxes PRIMARY KEY (id);


--
-- TOC entry 3728 (class 2606 OID 103089)
-- Name: taxes key_taxes; Type: CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".taxes
    ADD CONSTRAINT key_taxes PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 112099)
-- Name: dishes_and_combos dishes_and_combos_pkey; Type: CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".dishes_and_combos
    ADD CONSTRAINT dishes_and_combos_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 103093)
-- Name: screen id_screen; Type: CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".screen
    ADD CONSTRAINT id_screen PRIMARY KEY (ip);


--
-- TOC entry 3736 (class 2606 OID 103095)
-- Name: products_and_supplies key_product; Type: CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".products_and_supplies
    ADD CONSTRAINT key_product PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 103097)
-- Name: product_category key_product_category; Type: CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".product_category
    ADD CONSTRAINT key_product_category PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 103099)
-- Name: product_department key_product_department; Type: CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".product_department
    ADD CONSTRAINT key_product_department PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 103101)
-- Name: branch key_setting_branch; Type: CONSTRAINT; Schema: Settings; Owner: postgres
--

ALTER TABLE ONLY "Settings".branch
    ADD CONSTRAINT key_setting_branch PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 103103)
-- Name: subscription id_key_subscription; Type: CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".subscription
    ADD CONSTRAINT id_key_subscription PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 103105)
-- Name: companies key_company; Type: CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".companies
    ADD CONSTRAINT key_company PRIMARY KEY (id);


--
-- TOC entry 3760 (class 2606 OID 103748)
-- Name: alumnos alumnos_pkey; Type: CONSTRAINT; Schema: _company_1_branch_8; Owner: postgres
--

ALTER TABLE ONLY _company_1_branch_8.alumnos
    ADD CONSTRAINT alumnos_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 103738)
-- Name: apps apps_pkey; Type: CONSTRAINT; Schema: _company_1_branch_8; Owner: postgres
--

ALTER TABLE ONLY _company_1_branch_8.apps
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 103107)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3789 (class 2606 OID 103108)
-- Name: boxes_history boxes_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".boxes_history
    ADD CONSTRAINT boxes_fk FOREIGN KEY (id_boxes) REFERENCES "Branch".boxes(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3792 (class 2606 OID 103113)
-- Name: movement_history boxes_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".movement_history
    ADD CONSTRAINT boxes_fk FOREIGN KEY (id_boxes) REFERENCES "Branch".boxes(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3795 (class 2606 OID 103118)
-- Name: sales_history branches_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".sales_history
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3790 (class 2606 OID 103123)
-- Name: boxes_history branches_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".boxes_history
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3793 (class 2606 OID 103128)
-- Name: movement_history branches_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".movement_history
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3796 (class 2606 OID 103133)
-- Name: sales_history companies_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".sales_history
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3797 (class 2606 OID 103138)
-- Name: sales_history customers_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".sales_history
    ADD CONSTRAINT customers_fk FOREIGN KEY (id_customers) REFERENCES "Company".customers(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3798 (class 2606 OID 103148)
-- Name: sales_history employees_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".sales_history
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3791 (class 2606 OID 103153)
-- Name: boxes_history employees_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".boxes_history
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3794 (class 2606 OID 103158)
-- Name: movement_history employees_fk; Type: FK CONSTRAINT; Schema: Box; Owner: postgres
--

ALTER TABLE ONLY "Box".movement_history
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3806 (class 2606 OID 103163)
-- Name: reservation branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".reservation
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3810 (class 2606 OID 103168)
-- Name: tables branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".tables
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3804 (class 2606 OID 103173)
-- Name: pack_reservation branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".pack_reservation
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3802 (class 2606 OID 103178)
-- Name: managers branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".managers
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3801 (class 2606 OID 103183)
-- Name: boxes branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".boxes
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3809 (class 2606 OID 103188)
-- Name: restaurant_area branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".restaurant_area
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3805 (class 2606 OID 103193)
-- Name: providers branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".providers
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3799 (class 2606 OID 103198)
-- Name: Ad branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch"."Ad"
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3879 (class 2606 OID 112846)
-- Name: prescription branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3884 (class 2606 OID 112943)
-- Name: history_move_lot branches_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".history_move_lot
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3880 (class 2606 OID 112841)
-- Name: prescription companies_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3885 (class 2606 OID 112948)
-- Name: history_move_lot companies_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".history_move_lot
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3881 (class 2606 OID 112856)
-- Name: prescription dishes_and_combos_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription
    ADD CONSTRAINT dishes_and_combos_fk FOREIGN KEY (id_dishes_and_combos) REFERENCES "Kitchen".dishes_and_combos(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3803 (class 2606 OID 103203)
-- Name: managers employees_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".managers
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3882 (class 2606 OID 112851)
-- Name: prescription employees_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3886 (class 2606 OID 112938)
-- Name: history_move_lot employees_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".history_move_lot
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3883 (class 2606 OID 112861)
-- Name: prescription lots_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".prescription
    ADD CONSTRAINT lots_fk FOREIGN KEY (id_lots) REFERENCES "Inventory".lots(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3887 (class 2606 OID 112953)
-- Name: history_move_lot lots_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".history_move_lot
    ADD CONSTRAINT lots_fk FOREIGN KEY (id_lots) REFERENCES "Inventory".lots(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3807 (class 2606 OID 103208)
-- Name: reservation pack_reservation_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".reservation
    ADD CONSTRAINT pack_reservation_fk FOREIGN KEY (id_pack_reservation) REFERENCES "Branch".pack_reservation(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3800 (class 2606 OID 103213)
-- Name: billing_information providers_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".billing_information
    ADD CONSTRAINT providers_fk FOREIGN KEY (id_providers) REFERENCES "Branch".providers(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3811 (class 2606 OID 103218)
-- Name: tables restaurant_area_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".tables
    ADD CONSTRAINT restaurant_area_fk FOREIGN KEY (id_restaurant_area) REFERENCES "Branch".restaurant_area(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3808 (class 2606 OID 103223)
-- Name: reservation tables_fk; Type: FK CONSTRAINT; Schema: Branch; Owner: postgres
--

ALTER TABLE ONLY "Branch".reservation
    ADD CONSTRAINT tables_fk FOREIGN KEY (id_tables) REFERENCES "Branch".tables(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3858 (class 2606 OID 103619)
-- Name: prospects branches_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".prospects
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3855 (class 2606 OID 103644)
-- Name: appointment branches_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".appointment
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3859 (class 2606 OID 103614)
-- Name: prospects companies_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".prospects
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3852 (class 2606 OID 103624)
-- Name: sales_stage companies_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".sales_stage
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3853 (class 2606 OID 103629)
-- Name: product_to_sell companies_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".product_to_sell
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3854 (class 2606 OID 103634)
-- Name: sales_team companies_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".sales_team
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3856 (class 2606 OID 103639)
-- Name: appointment companies_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".appointment
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3857 (class 2606 OID 111941)
-- Name: appointment fk_appointment_employees; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".appointment
    ADD CONSTRAINT fk_appointment_employees FOREIGN KEY (id_employees) REFERENCES "Company".employees(id);


--
-- TOC entry 3861 (class 2606 OID 111976)
-- Name: history_prospects prospects_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".history_prospects
    ADD CONSTRAINT prospects_fk FOREIGN KEY (id_prospects) REFERENCES "CRM".prospects(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3860 (class 2606 OID 103609)
-- Name: prospects sales_stage_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".prospects
    ADD CONSTRAINT sales_stage_fk FOREIGN KEY (id_sales_stage) REFERENCES "CRM".sales_stage(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3862 (class 2606 OID 111981)
-- Name: history_prospects users_fk; Type: FK CONSTRAINT; Schema: CRM; Owner: postgres
--

ALTER TABLE ONLY "CRM".history_prospects
    ADD CONSTRAINT users_fk FOREIGN KEY (id_users) REFERENCES "Fud".users(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3863 (class 2606 OID 112050)
-- Name: chats fk_user_one; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".chats
    ADD CONSTRAINT fk_user_one FOREIGN KEY (user_one_id) REFERENCES "Fud".users(email);


--
-- TOC entry 3864 (class 2606 OID 112055)
-- Name: chats fk_user_two; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".chats
    ADD CONSTRAINT fk_user_two FOREIGN KEY (user_two_id) REFERENCES "Fud".users(email);


--
-- TOC entry 3869 (class 2606 OID 112040)
-- Name: message_status message_status_message_id_fkey; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".message_status
    ADD CONSTRAINT message_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES "Chat".messages(id_message) ON DELETE CASCADE;


--
-- TOC entry 3870 (class 2606 OID 112084)
-- Name: message_status message_status_user_id_fkey; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".message_status
    ADD CONSTRAINT message_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Fud".users(email) ON DELETE CASCADE;


--
-- TOC entry 3867 (class 2606 OID 112020)
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES "Chat".chats(id_chat) ON DELETE CASCADE;


--
-- TOC entry 3868 (class 2606 OID 112068)
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Fud".users(email) ON DELETE CASCADE;


--
-- TOC entry 3865 (class 2606 OID 112005)
-- Name: user_chats user_chats_chat_id_fkey; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".user_chats
    ADD CONSTRAINT user_chats_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES "Chat".chats(id_chat) ON DELETE CASCADE;


--
-- TOC entry 3866 (class 2606 OID 112000)
-- Name: user_chats user_chats_user_id_fkey; Type: FK CONSTRAINT; Schema: Chat; Owner: postgres
--

ALTER TABLE ONLY "Chat".user_chats
    ADD CONSTRAINT user_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Fud".users(id) ON DELETE CASCADE;


--
-- TOC entry 3816 (class 2606 OID 103228)
-- Name: employees branches_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3817 (class 2606 OID 103233)
-- Name: employees companies_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3814 (class 2606 OID 103238)
-- Name: customers companies_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".customers
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3812 (class 2606 OID 103243)
-- Name: branches companies_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".branches
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3813 (class 2606 OID 103248)
-- Name: branches country_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".branches
    ADD CONSTRAINT country_fk FOREIGN KEY (id_country) REFERENCES "Fud".country(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3815 (class 2606 OID 103253)
-- Name: customers country_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".customers
    ADD CONSTRAINT country_fk FOREIGN KEY (id_country) REFERENCES "Fud".country(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3818 (class 2606 OID 103258)
-- Name: employees country_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT country_fk FOREIGN KEY (id_country) REFERENCES "Fud".country(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3819 (class 2606 OID 103263)
-- Name: employees departments_employees_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT departments_employees_fk FOREIGN KEY (id_departments_employees) REFERENCES "Employee".departments_employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3820 (class 2606 OID 103268)
-- Name: employees roles_employees_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT roles_employees_fk FOREIGN KEY (id_roles_employees) REFERENCES "Employee".roles_employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3821 (class 2606 OID 103273)
-- Name: employees users_fk; Type: FK CONSTRAINT; Schema: Company; Owner: postgres
--

ALTER TABLE ONLY "Company".employees
    ADD CONSTRAINT users_fk FOREIGN KEY (id_users) REFERENCES "Fud".users(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3823 (class 2606 OID 103278)
-- Name: history_schedules branches_fk; Type: FK CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".history_schedules
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3826 (class 2606 OID 103283)
-- Name: roles_employees companies_fk; Type: FK CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".roles_employees
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3822 (class 2606 OID 103288)
-- Name: departments_employees companies_fk; Type: FK CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".departments_employees
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3824 (class 2606 OID 103293)
-- Name: history_schedules employees_fk; Type: FK CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".history_schedules
    ADD CONSTRAINT employees_fk FOREIGN KEY (id_employees) REFERENCES "Company".employees(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3827 (class 2606 OID 103298)
-- Name: roles_employees fk_company; Type: FK CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".roles_employees
    ADD CONSTRAINT fk_company FOREIGN KEY (id_companies) REFERENCES "User".companies(id) ON DELETE CASCADE;


--
-- TOC entry 3825 (class 2606 OID 103303)
-- Name: history_schedules schedules_fk; Type: FK CONSTRAINT; Schema: Employee; Owner: postgres
--

ALTER TABLE ONLY "Employee".history_schedules
    ADD CONSTRAINT schedules_fk FOREIGN KEY (id_schedules) REFERENCES "Employee".schedules(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3829 (class 2606 OID 103308)
-- Name: users packs_fud_fk; Type: FK CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".users
    ADD CONSTRAINT packs_fud_fk FOREIGN KEY (id_packs_fud) REFERENCES "Fud".packs_fud(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3828 (class 2606 OID 103313)
-- Name: tokens tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: Fud; Owner: postgres
--

ALTER TABLE ONLY "Fud".tokens
    ADD CONSTRAINT tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES "Fud".users(id);


--
-- TOC entry 3873 (class 2606 OID 112308)
-- Name: table_boutique boutique_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_boutique
    ADD CONSTRAINT boutique_fk FOREIGN KEY (id_boutique) REFERENCES "Inventory".boutique(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3830 (class 2606 OID 103318)
-- Name: dish_and_combo_features branches_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".dish_and_combo_features
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3833 (class 2606 OID 103323)
-- Name: product_and_suppiles_features branches_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".product_and_suppiles_features
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3871 (class 2606 OID 112323)
-- Name: boutique branches_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".boutique
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3876 (class 2606 OID 112683)
-- Name: lots branches_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".lots
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3888 (class 2606 OID 121115)
-- Name: promotions branches_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".promotions
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3831 (class 2606 OID 103328)
-- Name: dish_and_combo_features companies_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".dish_and_combo_features
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3872 (class 2606 OID 112318)
-- Name: boutique companies_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".boutique
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3877 (class 2606 OID 112688)
-- Name: lots companies_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".lots
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3889 (class 2606 OID 121120)
-- Name: promotions companies_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".promotions
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3835 (class 2606 OID 103333)
-- Name: table_supplies_dish dish_and_combo_features_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_supplies_dish
    ADD CONSTRAINT dish_and_combo_features_fk FOREIGN KEY (id_dish_and_combo_features) REFERENCES "Inventory".dish_and_combo_features(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3874 (class 2606 OID 112313)
-- Name: table_boutique dish_and_combo_features_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_boutique
    ADD CONSTRAINT dish_and_combo_features_fk FOREIGN KEY (id_dish_and_combo_features) REFERENCES "Inventory".dish_and_combo_features(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3878 (class 2606 OID 112678)
-- Name: lots dish_and_combo_features_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".lots
    ADD CONSTRAINT dish_and_combo_features_fk FOREIGN KEY (id_dish_and_combo_features) REFERENCES "Inventory".dish_and_combo_features(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3890 (class 2606 OID 121110)
-- Name: promotions dish_and_combo_features_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".promotions
    ADD CONSTRAINT dish_and_combo_features_fk FOREIGN KEY (id_dish_and_combo_features) REFERENCES "Inventory".dish_and_combo_features(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3836 (class 2606 OID 103338)
-- Name: table_supplies_dish product_and_suppiles_features_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_supplies_dish
    ADD CONSTRAINT product_and_suppiles_features_fk FOREIGN KEY (id_product_and_suppiles_features) REFERENCES "Inventory".product_and_suppiles_features(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3875 (class 2606 OID 112610)
-- Name: table_boutique product_and_suppiles_features_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_boutique
    ADD CONSTRAINT product_and_suppiles_features_fk FOREIGN KEY (id_product_and_suppiles_features) REFERENCES "Inventory".product_and_suppiles_features(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3834 (class 2606 OID 103343)
-- Name: product_and_suppiles_features products_and_supplies_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".product_and_suppiles_features
    ADD CONSTRAINT products_and_supplies_fk FOREIGN KEY (id_products_and_supplies) REFERENCES "Kitchen".products_and_supplies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3832 (class 2606 OID 103348)
-- Name: dish_and_combo_features providers_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".dish_and_combo_features
    ADD CONSTRAINT providers_fk FOREIGN KEY (id_providers) REFERENCES "Branch".providers(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3837 (class 2606 OID 103353)
-- Name: table_taxes taxes_fk; Type: FK CONSTRAINT; Schema: Inventory; Owner: postgres
--

ALTER TABLE ONLY "Inventory".table_taxes
    ADD CONSTRAINT taxes_fk FOREIGN KEY (id_taxes) REFERENCES "Inventory".taxes(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3844 (class 2606 OID 103358)
-- Name: screen branches_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".screen
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3843 (class 2606 OID 103363)
-- Name: products_and_supplies companies_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".products_and_supplies
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3841 (class 2606 OID 103368)
-- Name: product_category companies_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".product_category
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3842 (class 2606 OID 103373)
-- Name: product_department companies_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".product_department
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3838 (class 2606 OID 103378)
-- Name: dishes_and_combos companies_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".dishes_and_combos
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3839 (class 2606 OID 103383)
-- Name: dishes_and_combos product_category_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".dishes_and_combos
    ADD CONSTRAINT product_category_fk FOREIGN KEY (id_product_category) REFERENCES "Kitchen".product_category(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3840 (class 2606 OID 103388)
-- Name: dishes_and_combos product_department_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".dishes_and_combos
    ADD CONSTRAINT product_department_fk FOREIGN KEY (id_product_department) REFERENCES "Kitchen".product_department(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3845 (class 2606 OID 103393)
-- Name: table_supplies_combo products_and_supplies_fk; Type: FK CONSTRAINT; Schema: Kitchen; Owner: postgres
--

ALTER TABLE ONLY "Kitchen".table_supplies_combo
    ADD CONSTRAINT products_and_supplies_fk FOREIGN KEY (id_products_and_supplies) REFERENCES "Kitchen".products_and_supplies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3848 (class 2606 OID 103398)
-- Name: subscription branches_fk; Type: FK CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".subscription
    ADD CONSTRAINT branches_fk FOREIGN KEY (id_branches) REFERENCES "Company".branches(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3849 (class 2606 OID 103403)
-- Name: subscription companies_fk; Type: FK CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".subscription
    ADD CONSTRAINT companies_fk FOREIGN KEY (id_companies) REFERENCES "User".companies(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3846 (class 2606 OID 103408)
-- Name: companies country_fk; Type: FK CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".companies
    ADD CONSTRAINT country_fk FOREIGN KEY (id_country) REFERENCES "Fud".country(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3850 (class 2606 OID 103413)
-- Name: subscription packs_fud_fk; Type: FK CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".subscription
    ADD CONSTRAINT packs_fud_fk FOREIGN KEY (id_packs_fud) REFERENCES "Fud".packs_fud(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3847 (class 2606 OID 103418)
-- Name: companies users_fk; Type: FK CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".companies
    ADD CONSTRAINT users_fk FOREIGN KEY (id_users) REFERENCES "Fud".users(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3851 (class 2606 OID 103423)
-- Name: subscription users_fk; Type: FK CONSTRAINT; Schema: User; Owner: postgres
--

ALTER TABLE ONLY "User".subscription
    ADD CONSTRAINT users_fk FOREIGN KEY (id_users) REFERENCES "Fud".users(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2025-04-04 22:50:13

--
-- PostgreSQL database dump complete
--

