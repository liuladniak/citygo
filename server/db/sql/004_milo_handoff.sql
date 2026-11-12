-- Milo human handoff: one row per visitor who asked to talk to a person.
-- Apply once per database in the Supabase SQL editor, after 001-003.
-- Chat messages themselves live in milo_messages (role visitor/agent, source human).

create table if not exists milo_conversations (
  session_id      varchar(64) primary key,
  status          varchar(8) not null default 'waiting',
  token_hash      char(64) not null,
  visitor_name    varchar(80),
  visitor_email   varchar(120),
  created_at      timestamptz not null default now(),
  agent_joined_at timestamptz,
  closed_at       timestamptz,
  constraint milo_conversations_status_check
    check (status in ('waiting', 'live', 'closed', 'missed'))
);

create index if not exists milo_conversations_status_idx
  on milo_conversations (status, created_at);

-- Written and read only by the server (no public policy).
alter table milo_conversations enable row level security;

alter table milo_messages drop constraint if exists milo_messages_source_check;
alter table milo_messages
  add constraint milo_messages_source_check
  check (source in ('faq', 'topic', 'tour', 'none', 'ai', 'chip', 'human'));
