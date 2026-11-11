-- Milo typed messages, kept to improve the FAQ.
-- Apply once per database (staging and production) in the Supabase SQL editor.
-- Written only by the server (direct DB connection). RLS is on with no policies,
-- so the public Supabase API cannot read or write it.

create table if not exists milo_messages (
  id          serial primary key,
  created_at  timestamptz not null default now(),
  session_id  varchar(64) not null,
  text        varchar(500) not null,
  source      varchar(16) not null,
  matched_id  varchar(40),
  constraint milo_messages_source_check
    check (source in ('faq', 'topic', 'tour', 'none'))
);

create index if not exists milo_messages_created_at_idx
  on milo_messages (created_at desc);
create index if not exists milo_messages_source_idx
  on milo_messages (source);

alter table milo_messages enable row level security;
