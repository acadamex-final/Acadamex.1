# Security Specification for Academiq

## Data Invariants
1. A Teacher must be associated with a valid College ID.
2. A Review must be associated with a valid Teacher ID and the User ID of the reviewer.
3. Only the seller of a MarketItem can update or delete its status (unless it's 'sold').
4. A User can only edit their own profile.
5. Teacher aggregate scores (rating, count) should only be updated when a review is added (enforced via server or careful client-side increment logic in rules if possible, but primarily we need to ensure users can't arbitrarily set scores).

## The Dirty Dozen (Attack Vectors)
1. **Identity Spoofing**: Attempt to create a review using someone else's `userId`.
2. **Resource Poisoning**: Create a MarketItem with a `price` of -1000 or a 1MB `description`.
3. **Privilege Escalation**: Attempt to mark a teacher as `active` (skipping `pending`) as a regular user.
4. **Rating Inflation**: Multiple reviews from the same account for the same teacher.
5. **PII Leak**: Attempt to read private user profiles of other students.
6. **Market Scam**: Attempt to mark someone else's item as `sold`.
7. **Phantom Teacher**: Create a teacher associated with a non-existent college ID.
8. **Shadow Field Injection**: Adding an `isAdmin: true` field to a user profile.
9. **Timestamp Manipulation**: Set `createdAt` to a future date to stay at the top of lists.
10. **Orphaned Write**: Create a review for a teacher that doesn't exist.
11. **Mass Deletion**: Attempt to delete all reviews for a teacher they dislike.
12. **Metadata Tampering**: Directly updating `averageRating` on a Teacher document without submitting a review.

## Test Runner Plan
I will create a rules file that defends against these.

1. **Auth check**: All writes require authentication and verified email.
2. **Schema validation**: `isValidTeacher`, `isValidReview`, etc.
3. **Immutability**: `userId` and `createdAt` cannot be changed.
4. **Owner checks**: `resource.data.userId == request.auth.uid`.
