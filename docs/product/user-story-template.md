# 🎯 GitHub user story template

## 💡 Convention

Write each product GitHub issue as a user story followed by independently
verifiable acceptance criteria and an explicit out-of-scope section. Use an
outcome-oriented issue title and copy this structure into the issue body:

```markdown
As a [type of user], I want [goal] so that [benefit].

## Acceptance Criteria

- [ ] [Observable outcome that must be true for the story to be complete]
- [ ] [Another observable outcome]

## Out of Scope

- [Excluded behavior or follow-up work]
- [Another explicit exclusion]
```

## 🏆 Benefits

- Connects requested functionality to a concrete user need and benefit.
- Makes completion measurable through observable acceptance criteria.
- Prevents adjacent work from silently expanding the issue scope.
- Provides a consistent format for migrating product entries from `TODO.md` to
  GitHub Issues.

## 👀 Examples

### ✅ Good: Observable outcomes and explicit boundaries

```markdown
As a user, I want to rate dishes I have cooked so that future suggestions take
my preferences into account and avoid recommending dishes I did not enjoy.

## Acceptance Criteria

- [ ] Users can rate a cooked dish on a 1-to-5 star scale from the home page.
- [ ] Users can update their rating at any time.
- [ ] Unrated dishes are treated neutrally.

## Out of Scope

- Sorting or filtering cooked dishes by rating.
- Boosting similar dishes based on positive ratings.
```

### ❌ Bad: Implementation tasks without a user outcome

```markdown
Add a rating column to the database.

- [ ] Create a migration.
- [ ] Update the repository.
- [ ] Add tests.
```

This version does not explain the user benefit, define observable product
behavior, or state which adjacent behavior is excluded.

## 🧐 Real world examples

- The functional outcomes currently catalogued in [`TODO.md`](../../TODO.md)
  are the source material to rewrite as GitHub user stories with this template.

## 🔗 Related agreements

- [`AGENTS.md`](../../AGENTS.md) defines the task lifecycle and requires every
  acceptance criterion to map to an implementation artifact and passing
  verification.
- [`docs/documentation-guidelines.md`](../documentation-guidelines.md) defines
  the required structure for project convention documents.
