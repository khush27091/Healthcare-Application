# Architecture & Design Decisions

## 1. Authentication Implementation

Authentication is implemented using JWT tokens.

- User logs in via REST API.
- Backend generates JWT containing:
  - user id
  - role
- JWT is used for:
  - REST API protection (middleware)
  - Socket.io authentication (handshake middleware)

Trade-off:
Custom JWT system used instead of Supabase Auth to allow full backend control.

---

## 2. Form State & Draft Saving

The onboarding form is implemented as a multi-step process.

Approach:
- React state is used to manage form data.
- Data is saved to database upon completion.
- Each step validates before proceeding.

Trade-off:
Draft auto-save was not implemented to reduce complexity.

---

## 3. Socket.io Architecture

- Socket authentication using JWT during handshake.
- User joins room based on doctor_assignment ID.
- Events implemented:
  - join_room
  - send_message
  - receive_message
  - typing

Messages are persisted in database before emitting.

Trade-off:
Horizontal scaling not implemented (single server instance).

---

## 4. Database Schema Design

Core Tables:
- users
- doctor_assignments
- messages

Relationships:
- One doctor can have many patients.
- Each assignment has many messages.
- Messages linked to assignment and sender.

Design choice:
Normalized relational structure using foreign keys.

---

## 5. Assumptions

- Each patient is assigned to one doctor.
- No group chat required.
- Real-time presence tracking is optional.
- Application is designed for demo/interview scope.