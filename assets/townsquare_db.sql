DROP DATABASE IF EXISTS townsquare_db;
CREATE DATABASE townsquare_db;

\c townsquare_db;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    videopath VARCHAR not null,
    timestamp VARCHAR not null,
    user_id INTEGER, 
    thread_id INTEGER UNIQUE NOT NULL
);

INSERT INTO posts (videopath, user_id, thread_id)
    VALUES ('videos/vid-0001.webm', 1, 1 );

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR not null
);

INSERT INTO users ( username )
    VALUES ('Spots Giraffe' );

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    title VARCHAR not null
);

INSERT INTO threads ( title )
    VALUES ('Wakanda Forever!' );