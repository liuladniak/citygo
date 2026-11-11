-- Allow source = 'ai' (questions answered by the AI fallback).
-- Apply once per database in the Supabase SQL editor, after 001.

alter table milo_messages drop constraint if exists milo_messages_source_check;
alter table milo_messages
  add constraint milo_messages_source_check
  check (source in ('faq', 'topic', 'tour', 'none', 'ai'));
