import { relations } from "drizzle-orm/relations";
import { tourTimeSlots, bookings, users, bookingGuests, bookingGuestNames, usersInAuth, userRoles, bookingPayments, bookingsOld, tours, highlights, images, bookingAssignments, employees, tourRecurringUnavailabilities, tourUnavailableDates, authors, articles, tourItineraryCoordinates, bookingActivityLog, reviews, passwordResetTokens, tourActivityLog, tasks, taskComments } from "./schema";

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	tourTimeSlot: one(tourTimeSlots, {
		fields: [bookings.timeSlotId],
		references: [tourTimeSlots.id]
	}),
	user: one(users, {
		fields: [bookings.userId],
		references: [users.id]
	}),
	bookingGuests: many(bookingGuests),
	bookingGuestNames: many(bookingGuestNames),
	bookingPayments: many(bookingPayments),
	bookingAssignments: many(bookingAssignments),
	bookingActivityLogs: many(bookingActivityLog),
	reviews: many(reviews),
	tasks: many(tasks),
}));

export const tourTimeSlotsRelations = relations(tourTimeSlots, ({one, many}) => ({
	bookings: many(bookings),
	bookingsOlds: many(bookingsOld),
	tour: one(tours, {
		fields: [tourTimeSlots.tourId],
		references: [tours.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	bookings: many(bookings),
	bookingsOlds: many(bookingsOld),
	bookingAssignments: many(bookingAssignments),
	reviews: many(reviews),
	passwordResetTokens: many(passwordResetTokens),
}));

export const bookingGuestsRelations = relations(bookingGuests, ({one}) => ({
	booking: one(bookings, {
		fields: [bookingGuests.bookingId],
		references: [bookings.id]
	}),
}));

export const bookingGuestNamesRelations = relations(bookingGuestNames, ({one}) => ({
	booking: one(bookings, {
		fields: [bookingGuestNames.bookingId],
		references: [bookings.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [userRoles.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	userRoles: many(userRoles),
}));

export const bookingPaymentsRelations = relations(bookingPayments, ({one}) => ({
	booking: one(bookings, {
		fields: [bookingPayments.bookingId],
		references: [bookings.id]
	}),
}));

export const bookingsOldRelations = relations(bookingsOld, ({one}) => ({
	tourTimeSlot: one(tourTimeSlots, {
		fields: [bookingsOld.timeSlotId],
		references: [tourTimeSlots.id]
	}),
	tour: one(tours, {
		fields: [bookingsOld.tourId],
		references: [tours.id]
	}),
	user: one(users, {
		fields: [bookingsOld.userId],
		references: [users.id]
	}),
}));

export const toursRelations = relations(tours, ({many}) => ({
	bookingsOlds: many(bookingsOld),
	highlights: many(highlights),
	images: many(images),
	tourRecurringUnavailabilities: many(tourRecurringUnavailabilities),
	tourUnavailableDates: many(tourUnavailableDates),
	tourTimeSlots: many(tourTimeSlots),
	tourItineraryCoordinates: many(tourItineraryCoordinates),
	reviews: many(reviews),
	tourActivityLogs: many(tourActivityLog),
}));

export const highlightsRelations = relations(highlights, ({one}) => ({
	tour: one(tours, {
		fields: [highlights.tourId],
		references: [tours.id]
	}),
}));

export const imagesRelations = relations(images, ({one}) => ({
	tour: one(tours, {
		fields: [images.tourId],
		references: [tours.id]
	}),
}));

export const bookingAssignmentsRelations = relations(bookingAssignments, ({one}) => ({
	user: one(users, {
		fields: [bookingAssignments.assignedBy],
		references: [users.id]
	}),
	booking: one(bookings, {
		fields: [bookingAssignments.bookingId],
		references: [bookings.id]
	}),
	employee: one(employees, {
		fields: [bookingAssignments.guideId],
		references: [employees.id]
	}),
}));

export const employeesRelations = relations(employees, ({many}) => ({
	bookingAssignments: many(bookingAssignments),
	tourActivityLogs: many(tourActivityLog),
	tasks_assignedTo: many(tasks, {
		relationName: "tasks_assignedTo_employees_id"
	}),
	tasks_completedBy: many(tasks, {
		relationName: "tasks_completedBy_employees_id"
	}),
	tasks_createdBy: many(tasks, {
		relationName: "tasks_createdBy_employees_id"
	}),
	taskComments: many(taskComments),
}));

export const tourRecurringUnavailabilitiesRelations = relations(tourRecurringUnavailabilities, ({one}) => ({
	tour: one(tours, {
		fields: [tourRecurringUnavailabilities.tourId],
		references: [tours.id]
	}),
}));

export const tourUnavailableDatesRelations = relations(tourUnavailableDates, ({one}) => ({
	tour: one(tours, {
		fields: [tourUnavailableDates.tourId],
		references: [tours.id]
	}),
}));

export const articlesRelations = relations(articles, ({one}) => ({
	author: one(authors, {
		fields: [articles.authorId],
		references: [authors.id]
	}),
}));

export const authorsRelations = relations(authors, ({many}) => ({
	articles: many(articles),
}));

export const tourItineraryCoordinatesRelations = relations(tourItineraryCoordinates, ({one}) => ({
	tour: one(tours, {
		fields: [tourItineraryCoordinates.tourId],
		references: [tours.id]
	}),
}));

export const bookingActivityLogRelations = relations(bookingActivityLog, ({one}) => ({
	booking: one(bookings, {
		fields: [bookingActivityLog.bookingId],
		references: [bookings.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	booking: one(bookings, {
		fields: [reviews.bookingId],
		references: [bookings.id]
	}),
	tour: one(tours, {
		fields: [reviews.tourId],
		references: [tours.id]
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const tourActivityLogRelations = relations(tourActivityLog, ({one}) => ({
	employee: one(employees, {
		fields: [tourActivityLog.actorId],
		references: [employees.id]
	}),
	tour: one(tours, {
		fields: [tourActivityLog.tourId],
		references: [tours.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	employee_assignedTo: one(employees, {
		fields: [tasks.assignedTo],
		references: [employees.id],
		relationName: "tasks_assignedTo_employees_id"
	}),
	booking: one(bookings, {
		fields: [tasks.bookingId],
		references: [bookings.id]
	}),
	employee_completedBy: one(employees, {
		fields: [tasks.completedBy],
		references: [employees.id],
		relationName: "tasks_completedBy_employees_id"
	}),
	employee_createdBy: one(employees, {
		fields: [tasks.createdBy],
		references: [employees.id],
		relationName: "tasks_createdBy_employees_id"
	}),
	taskComments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({one}) => ({
	employee: one(employees, {
		fields: [taskComments.authorId],
		references: [employees.id]
	}),
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id]
	}),
}));