#!/usr/bin/env python3
"""CityGo seeder: populates the admin dashboard with realistic dummy data."""

import argparse
import os
import random
import re
import string
import sys
import unicodedata
import uuid
from collections import Counter, defaultdict
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal

import psycopg2
from dotenv import load_dotenv
from faker import Faker
from psycopg2.extras import RealDictCursor
from unidecode import unidecode

SEED_EMAIL_DOMAIN = "seed.example.com"

TOURIST_LOCALES = {
    "en_US": ("United States", 18),
    "en_GB": ("United Kingdom", 14),
    "de_DE": ("Germany", 16),
    "fr_FR": ("France", 12),
    "it_IT": ("Italy", 10),
    "nl_NL": ("Netherlands", 8),
    "ar_SA": ("Saudi Arabia", 12),
    "tr_TR": ("Turkey", 10),
}
LOCALE_NAMES = list(TOURIST_LOCALES)
LOCALE_WEIGHTS = [weight for _, weight in TOURIST_LOCALES.values()]
LOCALE_LANGUAGE = {
    "en_US": "en", "en_GB": "en", "de_DE": "de", "fr_FR": "fr",
    "it_IT": "it", "nl_NL": "en", "ar_SA": "en", "tr_TR": "en",
}
SOURCES = ["admin_dashboard", "website", "referral"]
SOURCE_WEIGHTS = [70, 25, 5]

USER_SHARE = 0.45 
STATUS_MIX = {"confirmed": 40, "pending": 20, "completed": 30, "draft": 10}
DEFAULT_COUNT = 10
CUSTOM_SHARE = 0.12  
CUSTOM_PRICES = [350, 450, 600, 800, 950, 1200]
CUSTOM_REQUESTS = [
    "Private tour: Topkapı Palace and Hagia Sophia with a private car.",
    "Private family tour with a stroller-friendly route and a lunch stop.",
    "Private photography walk at sunrise, Galata to Karaköy.",
    "Small group celebrating an anniversary, wants a Bosphorus dinner stop.",
    "Business group, half-day tour with hotel pickup and a Turkish tea break.",
    "Honeymoon couple, private sunset cruise and Asian-side lunch.",
]
MEETING_POINTS = [
    "Sultanahmet Square, by the German Fountain",
    "Hagia Sophia main entrance",
    "Basilica Cistern entrance",
    "Galata Tower entrance",
    "Karaköy ferry pier",
    "Eminönü ferry terminal",
    "Kabataş pier",
    "Taksim Square, Republic Monument",
    "Spice Bazaar main gate",
    "Hotel lobby pickup",
]
MEETING_POINT_SHARE = 0.95

ARABIC_FIRST_NAMES = [
    "Mohammed", "Abdullah", "Fahad", "Khalid", "Salman", "Omar", "Faisal",
    "Yousef", "Noura", "Fatimah", "Sara", "Maha", "Reem", "Lama", "Hessa", "Amal",
]
ARABIC_LAST_NAMES = [
    "Al-Harbi", "Al-Ghamdi", "Al-Qahtani", "Al-Otaibi", "Al-Shehri",
    "Al-Dosari", "Al-Zahrani", "Al-Mutairi", "Al-Anazi", "Al-Shammari",
]
PAID_METHODS = {
    "website": (["card", "stripe", "bank_transfer", "cash"], [6, 2, 2, 2]),
    "office": (["cash", "card", "invoice"], [15, 3, 1]),
}
PENDING_METHODS = {
    "website": (["stripe", "bank_transfer"], [1, 1]),
    "office": (["invoice", "cash"], [5, 2]),
}

TASK_OWNERS = {
    "ops": ["Operations Manager", "Tour Manager"],
    "sales": ["Sales Representative"],
    "finance": ["Finance"],
}
TASK_CREATORS = ["Operations Manager", "Tour Manager", "Sales Representative", "Admin"]
TASKS_PER_BOOKING = ([0, 1, 2], [25, 55, 20])
URGENT_WINDOW_DAYS = 2
URGENT_SHARE = 0.7
EARLY_DONE_SHARE = 0.3

# "when" lists the booking statuses a task makes sense for.
TASK_TEMPLATES = [
    {"title": "Confirm hotel pickup for {ref}",
     "description": "Ask {name} for the hotel name and room, and confirm the pickup time.",
     "type": "tour", "owner": "ops", "when": ("confirmed",)},
    {"title": "Ask {name} about dietary needs",
     "description": "Check for allergies or dietary needs before the tour on {date}.",
     "type": "tour", "owner": "sales", "when": ("confirmed", "pending")},
    {"title": "Check group preferences for {ref}",
     "description": "Find out the pace, language and accessibility needs for the group of {guests}.",
     "type": "tour", "owner": "ops", "when": ("confirmed",)},
    {"title": "Send route and meeting details to {name}",
     "description": "Email the route, the meeting point and what to bring for {ref}.",
     "type": "tour", "owner": "ops", "when": ("confirmed",)},
    {"title": "Confirm custom itinerary for {ref}",
     "description": "Agree the route and timing with {name} and the guide.",
     "type": "tour", "owner": "ops", "when": ("confirmed", "pending"), "custom": True},
    {"title": "Follow up with {name} on pending payment",
     "description": "Booking {ref} is still pending. Ask {name} to complete the payment.",
     "type": "general", "owner": "sales", "when": ("pending",)},
    {"title": "Send invoice for {ref}",
     "description": "Issue the invoice for {ref} ({total}).",
     "type": "general", "owner": "finance", "when": ("confirmed", "pending"), "invoice": True},
    {"title": "Ask {name} for a review",
     "description": "Thank {name} for joining and ask for a review of the tour.",
     "type": "general", "owner": "sales", "when": ("completed",)},
    {"title": "Follow up on unfinished booking {ref}",
     "description": "{name} did not finish this booking. Send a friendly reminder.",
     "type": "general", "owner": "sales", "when": ("draft",)},
]

ROLE_POSITION = {
    "lead_guide": "Lead Guide",
    "assistant_guide": "Assistant Guide",
    "driver": "Driver",
} 

FAKERS = {locale: Faker(locale) for locale in TOURIST_LOCALES}
CURRENCY_SYMBOL = "€" 

ASSIGN_DEADLINE_DAYS = 2
UNASSIGNED_SHARE = 0.8
TODAY_SHARE = 0.2

def needs_crew_now(booking, today):
    """Completed and imminent tours always have a crew; far-off ones may wait."""
    if booking["status"] == "completed":
        return True
    if booking["status"] != "confirmed":
        return False
    if booking["tour_date"] <= today + timedelta(days=ASSIGN_DEADLINE_DAYS):
        return True
    return random.random() >= UNASSIGNED_SHARE


def assign_due_crews(conn, ref, dry_run):
    """Give a crew to seeded confirmed bookings that are within 2 days and have none."""
    now = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)
    deadline = now.date() + timedelta(days=ASSIGN_DEADLINE_DAYS)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT b.id, b.booking_reference AS reference, b.tour_date,
                   g.adults, g.children, g.infants
            FROM bookings b
            JOIN booking_guests g ON g.booking_id = b.id
            WHERE b.primary_contact_email LIKE %s
              AND b.status = 'confirmed'
              AND b.tour_date <= %s
              AND NOT EXISTS (
                  SELECT 1 FROM booking_assignments a
                  WHERE a.booking_id = b.id AND a.status = 'active'
              )
            ORDER BY b.tour_date
            """,
            (f"%@{SEED_EMAIL_DOMAIN}", deadline),
        )
        due = cur.fetchall()

    print(f"{len(due)} seeded bookings need a crew (tour within {ASSIGN_DEADLINE_DAYS} days).")
    for row in due:
        b = {
            "id": row["id"],
            "guests": {"adults": row["adults"], "children": row["children"],
                       "infants": row["infants"]},
        }
        try:
            with conn.cursor() as cur:
                assigned = create_assignments(cur, b, pick_crew(ref, b), now)
                for role, emp, when in assigned:
                    log_event(cur, b["id"], "assignment",
                              f"{emp['first_name']} {emp['last_name']} assigned as "
                              f"{ROLE_POSITION[role]} to booking {row['reference']}",
                              when)
            conn.rollback() if dry_run else conn.commit()
        except Exception as exc:
            conn.rollback()
            print(f"  {row['reference']} FAILED: {type(exc).__name__}: {exc}")
            continue
        crew = ", ".join(f"{ROLE_POSITION[r]}: {e['first_name']} {e['last_name']}"
                         for r, e, _ in assigned)
        print(f"  {row['reference']}  {row['tour_date']}  {crew}")
    if dry_run:
        print("DRY RUN: nothing saved.")


def complete_past_bookings(conn, dry_run):
    """Seeded confirmed bookings whose tour date has passed become completed."""
    now = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, booking_reference AS reference, tour_date
            FROM bookings
            WHERE primary_contact_email LIKE %s
              AND status = 'confirmed'
              AND tour_date < %s
            ORDER BY tour_date
            """,
            (f"%@{SEED_EMAIL_DOMAIN}", now.date()),
        )
        past = cur.fetchall()

    print(f"{len(past)} seeded bookings are past their tour date.")
    for row in past:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE bookings SET status = 'completed', updated_at = %s WHERE id = %s",
                    (now, row["id"]),
                )
                cur.execute(
                    """
                    UPDATE tasks
                    SET status = 'done', completed_at = %s, updated_at = %s,
                        completed_by = assigned_to
                    WHERE booking_id = %s AND status = 'open'
                    """,
                    (now, now, row["id"]),
                )
                log_event(cur, row["id"], "booking",
                          f"Booking {row['reference']} marked as completed", now)
            conn.rollback() if dry_run else conn.commit()
        except Exception as exc:
            conn.rollback()
            print(f"  {row['reference']} FAILED: {type(exc).__name__}: {exc}")
            continue
        print(f"  {row['reference']}  {row['tour_date']}  -> completed")
    if dry_run:
        print("DRY RUN: nothing saved.")

def parse_args():
    parser = argparse.ArgumentParser(description="CityGo dummy data seeder")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run all logic, but roll back at the end so nothing is saved",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=DEFAULT_COUNT,
        help=f"How many bookings to create (default {DEFAULT_COUNT})",
    )
    parser.add_argument("--assign-due", action="store_true", help="Only assign crews to seeded bookings that are within 2 days")
    parser.add_argument(
        "--maintain",
        action="store_true",
        help="Daily upkeep: assign due crews, then complete past bookings",
    )
    args = parser.parse_args()
    if args.count < 1:
        parser.error("--count must be at least 1")
    return args


def get_connection():
    load_dotenv()
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        sys.exit("DATABASE_URL is not set. Add it to .env or the environment.")
    return psycopg2.connect(dsn)


def fetch_reference_data(conn):
    """Load the tours, time slots and active staff the seeder depends on."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, tour_name, price, featured
            FROM tours
            WHERE status = 'active'
            ORDER BY id
        """)
        tours = cur.fetchall()

        cur.execute("""
            SELECT id, tour_id, start_time, end_time
            FROM tour_time_slots
            ORDER BY tour_id, start_time
        """)
        slots = cur.fetchall()

        cur.execute("""
            SELECT id, first_name, last_name, position
            FROM employees
            WHERE LOWER(status) = 'active'
            ORDER BY id
        """)
        employees = cur.fetchall()

    slots_by_tour = defaultdict(list)
    for slot in slots:
        slots_by_tour[slot["tour_id"]].append(slot)

    employees_by_position = defaultdict(list)
    for emp in employees:
        employees_by_position[emp["position"]].append(emp)

    if not tours:
        sys.exit("No active tours found. Nothing to book.")
    if not employees:
        sys.exit("No active employees found. Cannot assign guides.")

    return {
        "tours": tours,
        "slots_by_tour": dict(slots_by_tour),
        "employees_by_position": dict(employees_by_position),
        "blocked": fetch_blocked_dates(conn),
    }


def email_slug(text):
    """'Şeyma O'Brien' -> 'seymaobrien' (ASCII letters and digits only)."""
    return re.sub(r"[^a-z0-9]", "", unidecode(text).lower())


def latin_only(text):
    """Keep Latin-script text as it is, transliterate any other script."""
    if all(not ch.isalpha() or unicodedata.name(ch, "").startswith("LATIN") for ch in text):
        return text
    return unidecode(text).title()


def generate_person():
    """Make up a tourist. No database involved, so it is easy to test."""
    locale = random.choices(LOCALE_NAMES, weights=LOCALE_WEIGHTS)[0]
    fake = FAKERS[locale]

    if locale == "ar_SA":
        first_name = random.choice(ARABIC_FIRST_NAMES)
        last_name = random.choice(ARABIC_LAST_NAMES)
    else:
        first_name = latin_only(fake.first_name())
        last_name = latin_only(fake.last_name())
    slug = f"{email_slug(first_name)}.{email_slug(last_name)}"

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": f"{slug}.{uuid.uuid4().hex[:6]}@{SEED_EMAIL_DOMAIN}",
        "phone": unidecode(fake.phone_number()) if random.random() < 0.7 else None,
        "country": TOURIST_LOCALES[locale][0],
        "language": LOCALE_LANGUAGE[locale],
        "user_id": None,
        "locale": locale,
    }


def create_tourist(cur, person):
    """Insert the person into users and return the new user id."""
    cur.execute(
        """
        INSERT INTO users (first_name, last_name, email, phone_number, country)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        (person["first_name"], person["last_name"], person["email"],
         person["phone"], person["country"]),
    )
    return cur.fetchone()[0]


def calculate_total(price, adults, children, featured):
    """Same rule as the server: children pay half, infants are free,
    featured tours get 10% off."""
    total = adults * price + children * price * Decimal("0.5")
    if featured:
        total *= Decimal("0.9")
    return total.quantize(Decimal("0.01"))


def random_guests():
    return {
        "adults": random.choices([1, 2, 3, 4, 5, 6], weights=[10, 40, 15, 15, 10, 10])[0],
        "children": random.choices([0, 1, 2, 3], weights=[65, 15, 15, 5])[0],
        "infants": random.choices([0, 1, 2], weights=[85, 10, 5])[0],
    }

def pick_meeting_point():
    """Most bookings have one; a few are left empty on purpose."""
    if random.random() < MEETING_POINT_SHARE:
        return random.choice(MEETING_POINTS)
    return None

def pick_tour_date(status, today):
    if status == "completed":
        return today - timedelta(days=random.randint(1, 14))
    if status in ("confirmed", "pending") and random.random() < TODAY_SHARE:
        return today
    return today + timedelta(days=random.randint(7, 90))


def fetch_blocked_dates(conn):
    """Load every rule that closes a date, as plain Python sets."""
    with conn.cursor() as cur:
        cur.execute("SELECT unavailable_date FROM agency_unavailable_dates")
        agency_dates = {row[0] for row in cur.fetchall()}

        cur.execute("SELECT day_of_week FROM agency_recurring_unavailabilities")
        agency_weekdays = {row[0] for row in cur.fetchall()}

        tour_dates = defaultdict(set)
        cur.execute("SELECT tour_id, unavailable_date FROM tour_unavailable_dates")
        for tour_id, day in cur.fetchall():
            tour_dates[tour_id].add(day)

        tour_weekdays = defaultdict(set)
        cur.execute("SELECT tour_id, day_of_week FROM tour_recurring_unavailabilities")
        for tour_id, weekday in cur.fetchall():
            tour_weekdays[tour_id].add(weekday)

    return {
        "agency_dates": agency_dates,
        "agency_weekdays": agency_weekdays,
        "tour_dates": dict(tour_dates),
        "tour_weekdays": dict(tour_weekdays),
    }


def app_weekday(day):
    """The app counts Sunday as 0 (like JavaScript); Python counts Monday as 0."""
    return (day.weekday() + 1) % 7


def is_blocked(blocked, tour_id, day):
    """True if the agency, or this specific tour, is closed on that date."""
    weekday = app_weekday(day)
    if day in blocked["agency_dates"] or weekday in blocked["agency_weekdays"]:
        return True
    if tour_id is not None:
        if day in blocked["tour_dates"].get(tour_id, ()):
            return True
        if weekday in blocked["tour_weekdays"].get(tour_id, ()):
            return True
    return False


def pick_open_date(status, today, blocked, tour_id):
    """Pick a tour date, trying again whenever it lands on a closed day."""
    for _ in range(30):
        day = pick_tour_date(status, today)
        if not is_blocked(blocked, tour_id, day):
            return day
    raise RuntimeError(f"No open date found for tour {tour_id} after 30 tries.")


def pick_created_at(status, tour_date, now):
    """A booking is always created before its tour date."""
    if status == "completed":
        anchor = datetime.combine(tour_date, datetime.min.time()) - timedelta(
            days=random.randint(5, 30)
        )
    else:
        anchor = now - timedelta(days=random.randint(0, 10))
    return anchor - timedelta(minutes=random.randint(0, 600))


def make_reference(source, booking_id, created_at):
    """Website bookings use the webhook format, the rest use BK-<1000+id>."""
    if source == "website":
        millis = int(created_at.replace(tzinfo=timezone.utc).timestamp() * 1000) + random.randint(0, 999)
        suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"BK-{millis}-{suffix}"
    return f"BK-{1000 + booking_id}"


def create_booking(cur, ref, person, status):
    """Insert one booking row and return its details."""
    now = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)

    source = random.choices(SOURCES, weights=SOURCE_WEIGHTS)[0]
    # Website checkout always picks a catalogue tour, so only office bookings are custom.
    is_custom = source != "website" and random.random() < CUSTOM_SHARE

    guests = random_guests()
    is_draft = status == "draft"

    # Pick the tour first: which dates are closed depends on it.
    tour = slot = None
    if not is_custom:
        tours_with_slots = [t for t in ref["tours"] if t["id"] in ref["slots_by_tour"]]
        if not tours_with_slots:
            raise RuntimeError("No active tour has a time slot.")
        tour = random.choice(tours_with_slots)
        slot = random.choice(ref["slots_by_tour"][tour["id"]])

    tour_id = tour["id"] if tour else None
    tour_date = pick_open_date(status, now.date(), ref["blocked"], tour_id)
    created_at = pick_created_at(status, tour_date, now)

    time_slot_id = start_time = end_time = None
    meeting_point = notes = None

    if is_custom:
        tour_name = "Custom Tour"
        start_hour = random.choice([9, 10, 11, 13, 14])
        start_time = time(start_hour)
        end_time = time(start_hour + random.choice([4, 5, 6]))
        meeting_point = pick_meeting_point()
        notes = random.choice(CUSTOM_REQUESTS)
        price = Decimal(random.choice(CUSTOM_PRICES)).quantize(Decimal("0.01"))
    else:
        tour_name = tour["tour_name"]
        time_slot_id = slot["id"]
        meeting_point = pick_meeting_point()
        price = calculate_total(
            tour["price"], guests["adults"], guests["children"], tour["featured"]
        )

    total_price = None if is_draft else price
    phone = None if is_draft else person["phone"]
    contact_name = f"{person['first_name']} {person['last_name']}"

    cur.execute(
        """
        INSERT INTO bookings (
            tour_id, is_custom_tour, tour_date, start_time, end_time,
            meeting_point, primary_contact_name, primary_contact_email,
            primary_contact_phone, language, status, source, notes,
            time_slot_id, total_price, user_id, created_at, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            tour_id, is_custom, tour_date, start_time, end_time,
            meeting_point, contact_name, person["email"],
            phone, person["language"], status, source, notes,
            time_slot_id, total_price, person["user_id"], created_at, created_at,
        ),
    )
    booking_id = cur.fetchone()[0]

    reference = make_reference(source, booking_id, created_at)
    cur.execute(
        "UPDATE bookings SET booking_reference = %s WHERE id = %s",
        (reference, booking_id),
    )

    return {
        "id": booking_id,
        "reference": reference,
        "contact_name": contact_name,
        "status": status,
        "source": source,
        "is_custom": is_custom,
        "tour_id": tour_id,
        "tour_name": tour_name,
        "tour_date": tour_date,
        "time_slot_id": time_slot_id,
        "total_price": total_price,
        "guests": guests,
        "created_at": created_at,
        "user_id": person["user_id"],
    }


def create_guests(cur, booking):
    """One row per booking: how many adults, children and infants."""
    g = booking["guests"]
    cur.execute(
        """
        INSERT INTO booking_guests (booking_id, adults, children, infants)
        VALUES (%s, %s, %s, %s)
        """,
        (booking["id"], g["adults"], g["children"], g["infants"]),
    )


def pick_payment_status(booking_status):
    if booking_status == "draft":
        return None
    if booking_status == "pending":
        return "pending"
    return "paid"  # confirmed and completed


def pick_payment_method(source, status):
    group = "website" if source == "website" else "office"
    table = PAID_METHODS if status == "paid" else PENDING_METHODS
    methods, weights = table[group]
    return random.choices(methods, weights=weights)[0]


def create_payment(cur, booking):
    """Insert one payment for the booking, or nothing for drafts."""
    status = pick_payment_status(booking["status"])
    if status is None:
        return None

    now = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)
    method = pick_payment_method(booking["source"], status)


    paid_at = None
    if status == "paid":
        paid_at = min(
            booking["created_at"] + timedelta(minutes=random.randint(5, 2880)), now
        )

    cur.execute(
        """
        INSERT INTO booking_payments
            (booking_id, method, status, amount, paid_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (booking["id"], method, status, booking["total_price"],
         paid_at, booking["created_at"]),
    )
    return {
        "method": method,
        "status": status,
        "amount": booking["total_price"],
        "paid_at": paid_at,
    }


def random_first_name(locale):
    if locale == "ar_SA":
        return random.choice(ARABIC_FIRST_NAMES)
    return latin_only(FAKERS[locale].first_name())


def create_guest_names(cur, booking, person):
    """Lead guest plus one name per other adult and child. Infants stay unnamed.
    Companions mostly share the contact's surname, like families do."""
    g = booking["guests"]
    names = [booking["contact_name"]]
    for _ in range(g["adults"] + g["children"] - 1):
        first = random_first_name(person["locale"])
        names.append(f"{first} {person['last_name']}")
    cur.executemany(
        "INSERT INTO booking_guest_names (booking_id, full_name) VALUES (%s, %s)",
        [(booking["id"], n) for n in names],
    )


def pick_crew(ref, booking):
    """Always a lead guide; sometimes an assistant guide and a driver."""
    roles = ["lead_guide"]
    g = booking["guests"]
    if g["adults"] + g["children"] >= 5 and random.random() < 0.3:
        roles.append("assistant_guide")
    if random.random() < 0.25:
        roles.append("driver")

    crew = []
    for role in roles:
        candidates = ref["employees_by_position"].get(ROLE_POSITION[role], [])
        if not candidates:
            if role == "lead_guide":
                raise RuntimeError("No active Lead Guide to assign.")
            continue
        crew.append((role, random.choice(candidates)))
    return crew


def create_assignments(cur, booking, crew, assigned_at):
    """Insert one booking_assignments row per crew member."""
    assigned = []
    for offset, (role, emp) in enumerate(crew):
        when = assigned_at + timedelta(seconds=offset)
        cur.execute(
            """
            INSERT INTO booking_assignments (booking_id, guide_id, role, assigned_at)
            VALUES (%s, %s, %s, %s)
            """,
            (booking["id"], emp["id"], role, when),
        )
        assigned.append((role, emp, when))
    return assigned


def log_event(cur, booking_id, action, message, created_at):
    cur.execute(
        """
        INSERT INTO booking_activity_log
            (booking_id, action, message, actor_type, created_at)
        VALUES (%s, %s, %s, 'agent', %s)
        """,
        (booking_id, action, message, created_at),
    )


def create_activity_log(cur, booking, payment, assigned):
    """Write the same audit trail your app writes, in the same order."""
    bid, ref = booking["id"], booking["reference"]
    log_event(cur, bid, "booking",
              f"New booking {ref} created for {booking['contact_name']}",
              booking["created_at"])

    if payment and payment["status"] == "paid":
        paid_at = payment["paid_at"]
        log_event(cur, bid, "payment",
                  f"Payment of {CURRENCY_SYMBOL}{payment['amount']:.2f} recorded for booking {ref}",
                  paid_at)
        log_event(cur, bid, "booking",
                  f"Booking {ref} automatically confirmed after full payment",
                  paid_at + timedelta(seconds=1))

    for role, emp, when in assigned:
        log_event(cur, bid, "assignment",
                  f"{emp['first_name']} {emp['last_name']} assigned as "
                  f"{ROLE_POSITION[role]} to booking {ref}",
                  when)

def pick_employee(ref, positions):
    people = [e for p in positions for e in ref["employees_by_position"].get(p, [])]
    return random.choice(people) if people else None


def task_fits(template, booking, payment):
    if booking["status"] not in template["when"]:
        return False
    if template.get("custom") and not booking["is_custom"]:
        return False
    if template.get("invoice") and not (payment and payment["method"] == "invoice"):
        return False
    return True


def create_tasks(cur, ref, booking, payment):
    """Office work an agency would do around a booking. Returns (priority, status) pairs."""
    now = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)
    candidates = [t for t in TASK_TEMPLATES if task_fits(t, booking, payment)]
    how_many = random.choices(*TASKS_PER_BOOKING)[0]
    chosen = random.sample(candidates, min(how_many, len(candidates)))

    g = booking["guests"]
    total = booking["total_price"]
    text = {
        "ref": booking["reference"],
        "name": booking["contact_name"],
        "date": booking["tour_date"].isoformat(),
        "guests": g["adults"] + g["children"] + g["infants"],
        "total": f"{CURRENCY_SYMBOL}{total}" if total is not None else "no total yet",
    }
    days_left = (booking["tour_date"] - now.date()).days
    tour_day = datetime.combine(booking["tour_date"], datetime.min.time())

    made = []
    for t in chosen:
        created_at = min(
            booking["created_at"] + timedelta(minutes=random.randint(10, 2880)), now
        )
        due = max(tour_day - timedelta(days=1), created_at)
        due = datetime.combine(due.date(), datetime.min.time())

        owner = pick_employee(ref, TASK_OWNERS[t["owner"]])
        creator = pick_employee(ref, TASK_CREATORS)

        if booking["status"] == "completed":
            status = "done"
        elif days_left > URGENT_WINDOW_DAYS and random.random() < EARLY_DONE_SHARE:
            status = "done"
        else:
            status = "open"
        urgent = (status == "open" and days_left <= URGENT_WINDOW_DAYS
                  and random.random() < URGENT_SHARE)
        priority = "urgent" if urgent else "normal"

        completed_at = completed_by = None
        if status == "done":
            completed_at = min(created_at + timedelta(hours=random.randint(1, 72)), now)
            completed_by = owner["id"] if owner else None

        cur.execute(
            """
            INSERT INTO tasks (title, description, type, booking_id, assigned_to,
                               created_by, priority, status, due_date,
                               is_auto_generated, completed_at, completed_by,
                               created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, false, %s, %s, %s, %s)
            """,
            (t["title"].format(**text), t["description"].format(**text), t["type"],
             booking["id"], owner["id"] if owner else None,
             creator["id"] if creator else None, priority, status, due,
             completed_at, completed_by, created_at, completed_at or created_at),
        )
        made.append((priority, status))
    return made

def plan_statuses(count):
    """Decide the mix for this run and return one status per booking."""
    statuses = random.choices(
        list(STATUS_MIX), weights=list(STATUS_MIX.values()), k=count
    )
    return sorted(statuses, key=list(STATUS_MIX).index)


def seed_one_booking(cur, ref, status):
    """Create one complete booking with everything attached to it."""
    person = generate_person()
    if random.random() < USER_SHARE:
        person["user_id"] = create_tourist(cur, person)

    b = create_booking(cur, ref, person, status)
    create_guests(cur, b)
    pay = create_payment(cur, b)
    if status != "draft":
        create_guest_names(cur, b, person)

    assigned = []
    if needs_crew_now(b, datetime.now(timezone.utc).date()):
        crew = pick_crew(ref, b)
        assigned = create_assignments(
            cur, b, crew, pay["paid_at"] + timedelta(seconds=2)
        )
    b["tasks"] = create_tasks(cur, ref, b, pay)
    create_activity_log(cur, b, pay, assigned)

    return b, pay, assigned


def describe(b, pay, assigned):
    """Two printable lines about one created booking."""
    g = b["guests"]
    pay_text = f"{pay['method']}/{pay['status']}" if pay else "no payment"
    crew_text = ", ".join(
        f"{ROLE_POSITION[r]}: {e['first_name']} {e['last_name']}"
        for r, e, _ in assigned
    ) or "no crew"
    tour_text = "CUSTOM" if b["is_custom"] else f"tour {b['tour_id']}"
    task_text = ", ".join(f"{p}/{s}" for p, s in b.get("tasks", [])) or "none"
    return (
        f"  {b['reference']:<24} {b['status']:<10} {b['source']:<16}"
        f"{b['tour_date']}  {tour_text:<9} "
        f"{g['adults']}A/{g['children']}C/{g['infants']}I  "
        f"total={b['total_price']}  user={b['user_id']}  pay={pay_text}\n"
        f"      crew: {crew_text}"
        f"\n      tasks: {task_text}"
    )


def main():
    args = parse_args()
    mode = "DRY RUN (will roll back)" if args.dry_run else "LIVE (will commit)"
    print(f"Mode: {mode}")

    conn = get_connection()
    try:
        ref = fetch_reference_data(conn)
        n_staff = sum(len(people) for people in ref["employees_by_position"].values())
        print(f"Reference data: {len(ref['tours'])} active tours, {n_staff} active employees")

        if args.maintain or args.assign_due:
            assign_due_crews(conn, ref, args.dry_run)
            if args.maintain:
                complete_past_bookings(conn, args.dry_run)
            return

        statuses = plan_statuses(args.count)

        mix = Counter(statuses)
        plan = ", ".join(f"{mix[s]} {s}" for s in STATUS_MIX if mix[s])
        print(f"Plan: {args.count} bookings ({plan})\n")

        created = Counter()
        failures = []
        booked_value = Decimal("0")

        for number, status in enumerate(statuses, start=1):
            try:
                with conn.cursor() as cur:
                    b, pay, assigned = seed_one_booking(cur, ref, status)
                if args.dry_run:
                    conn.rollback()
                else:
                    conn.commit()
            except Exception as exc:
                conn.rollback()
                failures.append((number, status, exc))
                first_line = str(exc).strip().split("\n")[0]
                print(f"  #{number:<3} {status:<10} FAILED: {type(exc).__name__}: {first_line}")
                continue

            created[status] += 1
            if b["total_price"] is not None:
                booked_value += b["total_price"]
            print(describe(b, pay, assigned))

        print("\nSummary")
        for status in STATUS_MIX:
            print(f"  {status:<10} {created[status]}")
        print(f"  created {sum(created.values())}, failed {len(failures)}")
        print(f"  booked value {CURRENCY_SYMBOL}{booked_value:.2f}")
        if args.dry_run:
            print("DRY RUN: every booking was rolled back, nothing saved.")
        else:
            print("Done: every successful booking was committed.")

        if failures:
            sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()