-- Milo conversations: store Milo's replies and chip taps next to what visitors type.
-- Apply once per database in the Supabase SQL editor, after 001 and 002.
-- Existing rows become role = 'visitor' (what they were).
-- Order a conversation with: order by id (created_at is the same for a question and its answer).

alter table milo_messages
  add column if not exists role varchar(8) not null default 'visitor';

alter table milo_messages alter column text type varchar(2000);

alter table milo_messages drop constraint if exists milo_messages_role_check;
alter table milo_messages
  add constraint milo_messages_role_check
  check (role in ('visitor', 'milo', 'agent'));

alter table milo_messages drop constraint if exists milo_messages_source_check;
alter table milo_messages
  add constraint milo_messages_source_check
  check (source in ('faq', 'topic', 'tour', 'none', 'ai', 'chip'));

create index if not exists milo_messages_session_idx
  on milo_messages (session_id, id);
