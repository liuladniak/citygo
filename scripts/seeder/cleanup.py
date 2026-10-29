#!/usr/bin/env python3
"""Remove everything the seeder created. Shows a preview unless --delete is given."""

import argparse
from collections import Counter

from psycopg2 import sql

from seed import SEED_EMAIL_DOMAIN, get_connection

PATTERN = f"%@{SEED_EMAIL_DOMAIN}"


def parse_args():
    parser = argparse.ArgumentParser(description="Remove seeded CityGo data")
    parser.add_argument(
        "--delete",
        action="store_true",
        help="Really delete. Without this flag the run is only a preview.",
    )
    return parser.parse_args()


def ids_of(cur, query, params):
    cur.execute(query, params)
    return [row[0] for row in cur.fetchall()]


def fk_children(cur, parent):
    """(table, column) pairs of single-column foreign keys pointing at `parent`."""
    cur.execute(
        """
        SELECT DISTINCT cl.relname, att.attname
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cl.relnamespace
        JOIN pg_attribute att
          ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
        WHERE con.contype = 'f'
          AND con.confrelid = %s::regclass
          AND array_length(con.conkey, 1) = 1
          AND ns.nspname = 'public'
        ORDER BY 1, 2
        """,
        (f"public.{parent}",),
    )
    return cur.fetchall()


def delete_rows(cur, table, column, ids):
    """Delete the rows of `table` whose `column` is in `ids`. Returns how many."""
    if not ids:
        return 0
    cur.execute(
        sql.SQL("DELETE FROM {} WHERE {} = ANY(%s)").format(
            sql.Identifier(table), sql.Identifier(column)
        ),
        (ids,),
    )
    return cur.rowcount


def cleanup(cur):
    removed = Counter()

    booking_ids = ids_of(
        cur, "SELECT id FROM bookings WHERE primary_contact_email LIKE %s", (PATTERN,)
    )
    user_ids = ids_of(cur, "SELECT id FROM users WHERE email LIKE %s", (PATTERN,))
    task_ids = (
        ids_of(cur, "SELECT id FROM tasks WHERE booking_id = ANY(%s)", (booking_ids,))
        if booking_ids
        else []
    )
    print(f"Found {len(booking_ids)} seeded bookings, {len(task_ids)} tasks "
          f"on them and {len(user_ids)} seeded users.")

    booking_children = fk_children(cur, "bookings")
    print("Tables that point at bookings:",
          ", ".join(sorted({table for table, _ in booking_children})))

    # 1. Rows that point at the seeded tasks (comments, for example).
    for table, column in fk_children(cur, "tasks"):
        if table != "tasks":
            removed[table] += delete_rows(cur, table, column, task_ids)

    # 2. Rows that point at the seeded bookings.
    for table, column in booking_children:
        if table not in ("tasks", "bookings"):
            removed[table] += delete_rows(cur, table, column, booking_ids)

    # 3. The tasks, then the bookings themselves.
    removed["tasks"] += delete_rows(cur, "tasks", "id", task_ids)
    removed["bookings"] += delete_rows(cur, "bookings", "id", booking_ids)

    # 4. Seeded users, but only those nothing else points at any more.
    still_used = set()
    if user_ids:
        for table, column in fk_children(cur, "users"):
            cur.execute(
                sql.SQL("SELECT DISTINCT {col} FROM {tbl} WHERE {col} = ANY(%s)").format(
                    col=sql.Identifier(column), tbl=sql.Identifier(table)
                ),
                (user_ids,),
            )
            still_used.update(row[0] for row in cur.fetchall())
    free_user_ids = [uid for uid in user_ids if uid not in still_used]
    removed["users"] += delete_rows(cur, "users", "id", free_user_ids)

    return removed, len(still_used)


def main():
    args = parse_args()
    print("Mode: DELETE (will commit)" if args.delete
          else "Mode: PREVIEW (rolls back, nothing is deleted)")

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            removed, kept_users = cleanup(cur)

        print()
        for table, count in removed.items():
            print(f"  {table:<24} {count}")
        if kept_users:
            print(f"  {kept_users} seeded users kept because something else still uses them")

        if args.delete:
            conn.commit()
            print("\nDeleted.")
        else:
            conn.rollback()
            print("\nPREVIEW only. Run again with --delete to remove these rows.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()